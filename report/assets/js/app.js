// /report/assets/js/app.js
// Orchestratore + HeaderTicker fallback-safe

/* =========================
   Utils base
   ========================= */
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

/* =========================
   HEADER TICKER (robusto)
   - mostra pillole di default
   - se esiste header.json => applica valori + colori
   ========================= */
function renderHeaderTickerSkeleton(){
  const host = $('#header-ticker');
  if(!host) return;
  const pills = [
    {k:'Start',     lab:'Inizio'},
    {k:'End',       lab:'Fine'},
    {k:'Ticker',    lab:'Ticker'},
    {k:'Venue',     lab:'Venue'},
    {k:'Freshness', lab:'Freshness'},
    {k:'State',     lab:'Stato'},
    {k:'ConfidenceFinal', lab:'Confidence'},
    {k:'PriceChange', lab:'Price Δ'},
    {k:'Currency',  lab:'Currency'}
  ];

  host.innerHTML = `
    <style>
      #header-ticker{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px}
      .pill{position:relative;display:flex;align-items:center;gap:.6rem;padding:.55rem .7rem .55rem .9rem;
        border:1px solid var(--br);border-radius:12px;background:var(--card);box-shadow:var(--shadow-1);min-height:46px}
      .pill .lab{display:flex;align-items:center;gap:.35rem;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
      .pill .val{font-family:ui-monospace, Menlo, Monaco, Consolas, "Courier New", monospace;font-size:13px;font-weight:700;color:var(--ink)}
      .tonebar{position:absolute;left:0;top:0;bottom:0;width:4px;border-top-left-radius:12px;border-bottom-left-radius:12px;background:#cbd5e1}
      @media (max-width:640px){#header-ticker{grid-auto-flow:column;grid-auto-columns:72%;overflow:auto;padding-bottom:.25rem}}
    </style>
  ` + pills.map(p => `
    <div class="pill" data-pill="${p.k}">
      <span class="tonebar" data-tone="${p.k}"></span>
      <div class="min-w-0">
        <div class="lab">${p.lab}</div>
        <div class="val truncate" data-val="${p.k}">—</div>
      </div>
    </div>
  `).join('');
}

function toneToColor(t){ // g/y/r/n -> css color
  const v = String(t||'n').toLowerCase();
  if(v.startsWith('g')) return '#10b981';
  if(v.startsWith('y')) return '#f59e0b';
  if(v.startsWith('r')) return '#ef4444';
  return '#cbd5e1';
}

// mappa regole per alcuni campi, se presenti nel JSON
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
    case 'PriceChange': {
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

  // campi più comuni attesi
  const fields = [
    ['Start',  data?.Start],
    ['End',    data?.End],
    ['Ticker', data?.Ticker],
    ['Venue',  data?.Venue],
    ['Freshness', data?.FreshnessLabel ?? data?.Freshness],
    ['State',  data?.State ?? data?.ReportState],
    ['ConfidenceFinal', (Number(data?.ConfidenceFinal)||Number.NaN)],
    ['PriceChange', data?.PriceChange],       // es. +0.8% / -0.5% o numero
    ['Currency', data?.Currency ?? data?.PxCcy]
  ];

  for (const [k, v] of fields){
    setVal(k, (typeof v==='number' && isFinite(v) && k!=='PriceChange')
      ? (k==='ConfidenceFinal' ? v.toFixed(2) : v.toString())
      : (v ?? '—'));
    setTone(k, inferToneForKey(k, v));
  }
}

/* =========================
   F1 chooser (A o B)
   ========================= */
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

/* =========================
   Mount principale
   ========================= */
async function mountReport(reportId){
  // 1) Header ticker skeleton subito (così "non sparisce")
  renderHeaderTickerSkeleton();

  const base = `/report/reports/${reportId}`;
  const grid = $('#cards-grid');
  if (!grid){ console.error('#cards-grid non trovato'); return; }

  // 2) Provo a caricare header.json (se c'è)
  const headerData = await loadJSON(`${base}/header.json`);
  if (headerData){ applyHeaderJSON(headerData); }

  // 3) Manifest e F1
  const manifest = await loadJSON(`${base}/manifest.json`) || {
    order: ['f1'],
    f1: { mode: 'auto', prefer: 'b' }
  };

  for (const slot of manifest.order){
    if (slot !== 'f1') { continue; }

    const pick = await decideF1(base, manifest.f1);
    if (!pick){ console.warn('Nessun F1 valido trovato (f1a.json / f1b.json assenti o incompleti)'); continue; }

    try{
      const mod = await import(`/report/assets/js/modules/${pick.key}.js`);
      const el  = mod.renderCard(pick.data);
      grid.appendChild(el);
      mod.bindCard(el, pick.data, {
        base,
        openDrawer: (title, sub, html) => window.Tradelia?.Drawer?.open({ title, subtitle: sub, html })
      });
    }catch(e){
      console.error(`Errore import modulo ${pick.key}`, e);
    }
  }

  if (window.lucide) lucide.createIcons();
}

/* =========================
   Bootstrap
   ========================= */
(function(){
  const url = new URL(location.href);
  const reportId = url.searchParams.get('id') || 'sample-id';
  mountReport(reportId).catch(console.error);
})();
