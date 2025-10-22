// /report/assets/js/app.js
// Tradelia · Report Runtime Orchestrator (F1–F6)

// =========================
// Utils base
// =========================
async function loadJSON(path){
  try{
    const r = await fetch(path, { cache: 'no-store' });
    if(!r.ok) return null;
    return await r.json();
  }catch(e){
    console.warn('loadJSON fail', path, e);
    return null;
  }
}
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

// =========================
// Header Ticker (skeleton + data apply)
// =========================
function renderHeaderTickerSkeleton(){
  const host = $('#header-ticker');
  if(!host) return;

  // ordine ottimizzato per mobile: Inizio, Fine, Ticker, Price, Δ%, Stato, Currency, Freshness, Confidence, OCR, DataIntegrity, FeedSync
  const pills = [
    {k:'Start', lab:'Inizio'},
    {k:'End', lab:'Fine'},
    {k:'Ticker', lab:'Ticker'},
    {k:'Price', lab:'Price'},
    {k:'ChangePct', lab:'Δ%'},
    {k:'State', lab:'Stato'},
    {k:'Currency', lab:'Currency'},
    {k:'Freshness', lab:'Freshness'},
    {k:'ConfidenceFinal', lab:'Confidence'},
    {k:'OCR_Conf', lab:'OCR'},
    {k:'DataIntegrity', lab:'DataInt'},
    {k:'FeedSync', lab:'FeedSync'},
  ];

  host.innerHTML = `
    ${pills.map(p => `
      <div class="pill" data-pill="${p.k}">
        <span class="tonebar" data-tone="${p.k}"></span>
        <div class="min-w-0">
          <div class="lab">${p.lab}</div>
          <div class="val truncate" data-val="${p.k}">—</div>
        </div>
      </div>
    `).join('')}
  `;
}

function toneToColor(t){ // g/y/r/n -> css color
  const v = String(t||'n').toLowerCase();
  if(v.startsWith('g')) return '#10b981';
  if(v.startsWith('y')) return '#f59e0b';
  if(v.startsWith('r')) return '#ef4444';
  return '#cbd5e1';
}

// infer rules for tones
function inferToneForKey(key, val){
  if(val==null) return 'n';
  const n = Number(val);
  switch(key){
    case 'Freshness':
    case 'FreshnessLabel': {
      const s = String(val).toUpperCase();
      if (s.includes('T-0')) return 'g';
      if (s.includes('T-1')) return 'y';
      return 'r';
    }
    case 'ConfidenceFinal': {
      if(!(n>=0)) return 'n';
      return n>=0.80 ? 'g' : (n>=0.60 ? 'y' : 'r');
    }
    case 'State': {
      const s = String(val).toUpperCase();
      if (s==='ACTIVE') return 'g';
      if (s==='REVIEW') return 'y';
      if (s==='HOLD')   return 'r';
      return 'n';
    }
    case 'ChangePct': {
      const x = Number(val);
      if(isNaN(x)) return 'n';
      return x>0 ? 'g' : (x===0 ? 'y' : 'r');
    }
    default:
      return 'n';
  }
}

function applyHeaderJSON(data){
  const setVal  = (k, v) => { const el = $(`[data-val="${k}"]`); if(el) el.textContent = (v ?? '—'); };
  const setTone = (k, t) => { const el = $(`[data-tone="${k}"]`); if(el) el.style.background = toneToColor(t); };

  const px = (data?.Price!=null && isFinite(Number(data.Price))) ? Number(data.Price).toFixed(2) : null;
  const ch = (data?.ChangePct!=null && isFinite(Number(data.ChangePct))) ? Number(data.ChangePct).toFixed(2) : null;
  const fresh = data?.FreshnessLabel ?? data?.Freshness;

  const fields = [
    ['Start',  data?.Start],
    ['End',    data?.End],
    ['Ticker', data?.Ticker],
    ['Price',  px],
    ['ChangePct', ch!=null ? `${ch}%` : null],
    ['State',  data?.State ?? data?.ReportState],
    ['Currency', data?.Currency ?? data?.PxCcy],
    ['Freshness', fresh],
    ['ConfidenceFinal', (isFinite(Number(data?.ConfidenceFinal)) ? Number(data?.ConfidenceFinal).toFixed(2) : null)],
    ['OCR_Conf', (isFinite(Number(data?.OCR_Conf)) ? Number(data?.OCR_Conf).toFixed(2) : null)],
    ['DataIntegrity', (isFinite(Number(data?.DataIntegrity)) ? Number(data?.DataIntegrity).toFixed(2) : null)],
    ['FeedSync', (isFinite(Number(data?.FeedSync)) ? Number(data?.FeedSync).toFixed(2) : null)],
  ];

  for (const [k, v] of fields){
    setVal(k, v ?? '—');
    // tone inference uses raw numeric where needed
    const toneKey = (k==='Freshness' ? (data?.FreshnessLabel ?? data?.Freshness) : (k==='ChangePct' ? Number(data?.ChangePct) : (k==='ConfidenceFinal' ? Number(data?.ConfidenceFinal) : (k==='State' ? (data?.State ?? data?.ReportState) : null))));
    setTone(k, inferToneForKey(k, toneKey));
  }
}

// =========================
// F1 chooser (A or B)
// =========================
function hasF1A(d){ return d && typeof d.strategy_mode_tkr === 'string'; }
function hasF1B(d){ return d && typeof d.strategy_mode === 'string'; }

async function decideF1(base, cfg){
  const [a, b] = await Promise.all([
    loadJSON(`${base}/f1a.json`),
    loadJSON(`${base}/f1b.json`)
  ]);

  const mode   = (cfg?.mode || 'auto').toLowerCase();  // 'auto' | 'force'
  const prefer = (cfg?.prefer || 'b').toLowerCase();   // 'a' | 'b'

  if (mode === 'force'){
    if (prefer === 'a' && hasF1A(a)) return { key:'f1a', data:a };
    if (prefer === 'b' && hasF1B(b)) return { key:'f1b', data:b };
    return null;
  }

  // auto
  if (prefer === 'a'){
    if (hasF1A(a)) return { key:'f1a', data:a };
    if (hasF1B(b)) return { key:'f1b', data:b };
  } else {
    if (hasF1B(b)) return { key:'f1b', data:b };
    if (hasF1A(a)) return { key:'f1a', data:a };
  }
  return null;
}

// =========================
/* Mount principale */
// =========================
async function mountReport(reportId){
  // Expose namespace early
  window.Tradelia = window.Tradelia || {};
  window.Tradelia.Manifest = window.Tradelia.Manifest || {};

  // 1) Header ticker skeleton
  renderHeaderTickerSkeleton();

  const base = `/report/reports/${reportId}`;
  const grid = $('#cards-grid');
  if (!grid){ console.error('#cards-grid non trovato'); return; }

  // 2) Header data (optional)
  const headerData = await loadJSON(`${base}/header.json`);
  if (headerData){ applyHeaderJSON(headerData); }

  // 3) Manifest
  const manifest = await loadJSON(`${base}/manifest.json`) || {
    // default minimale: montiamo F1 auto->prefer B
    order: ['F1'],
    f1: { mode: 'auto', prefer: 'b' }
  };

  // Normalizza ordine a soli F1..F6 (niente F7)
  const valid = new Set(['F1','F2','F3','F4','F5','F6']);
  const order = (manifest.order || []).map(x=>String(x).toUpperCase()).filter(x=>valid.has(x));
  if (order.length === 0) order.push('F1');

  // Espone order per le chip in index.html
  window.Tradelia.Manifest.order = order;

  // 4) Mount dei moduli
  for (const slot of order){
    try{
      if (slot === 'F1'){
        // Decidi tra f1a/f1b
        const pick = await decideF1(base, manifest.f1);
        if (!pick){ console.warn('Nessun F1 valido trovato (f1a.json / f1b.json assenti o incompleti)'); continue; }

        const mod = await import(`/report/assets/js/modules/${pick.key}.js`);
        const el  = mod.renderCard(pick.data);
        el.setAttribute('data-card','F1');          // <— per scroll-to
        grid.appendChild(el);
        mod.bindCard(el, pick.data, {
          base,
          openDrawer: (title, sub, html) => window.Tradelia?.Drawer?.open({ title, subtitle: sub, html })
        });
      } else {
        // F2..F6: se esiste un modulo js, lo carico; altrimenti salto silenziosamente
        const key = slot.toLowerCase();             // 'F2' -> 'f2'
        try{
          const mod = await import(`/report/assets/js/modules/${key}.js`);
          // Carica il relativo JSON se presente (es. f2.json)
          const data = await loadJSON(`${base}/${key}.json`);
          const el   = mod.renderCard?.(data) || document.createElement('div');
          el.setAttribute('data-card', slot);       // <— per scroll-to
          if (!el.parentNode) grid.appendChild(el);
          if (typeof mod.bindCard === 'function'){
            mod.bindCard(el, data, {
              base,
              openDrawer: (title, sub, html) => window.Tradelia?.Drawer?.open({ title, subtitle: sub, html })
            });
          }
        }catch(e){
          // modulo non presente: ignoro
          // console.info(`Modulo ${slot} non trovato, skip.`, e);
        }
      }
    }catch(e){
      console.error(`Errore montando modulo ${slot}`, e);
    }
  }

  if (window.lucide) lucide.createIcons();
}

// =========================
// Bootstrap
// =========================
(function(){
  const url = new URL(location.href);
  const reportId = url.searchParams.get('id') || 'sample-id';
  mountReport(reportId).catch(console.error);
})();
