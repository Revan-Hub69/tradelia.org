// /report/assets/js/components/header-ticker-edu.table.js
// Header Ticker · Educational (tabella, 1 metrica per riga)
// - Stile sobrio e istituzionale (tokens.css)
// - Colonne: Metrica | Valore | Semaforo | (i)
// - Popup (i): What / How / Source dal glossary.json
// - Usa __TradeliaUI.openPanel se presente; altrimenti micro-modal interna

export const headerTicker = (() => {
  // ---------------- Helpers ----------------
  const QS  = (s, r=document) => r.querySelector(s);
  const QSA = (s, r=document) => [...r.querySelectorAll(s)];
  const EL  = (t, cls, html) => { const e=document.createElement(t); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; };
  const normTone = t => (t||'').toString().toLowerCase();
  const fmt = {
    price: v => (v==null||isNaN(v)) ? '—' : Number(v).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}),
    pct:   v => (v==null||isNaN(v)) ? '—%' : `${v>0?'+':''}${Number(v).toFixed(2)}%`,
    timeUTC: s => { try { const d = new Date(s); return isNaN(d) ? String(s||'—') : d.toISOString().slice(11,16) + ' UTC'; } catch { return String(s||'—'); } }
  };

  const CFG = {
    glossaryPath: '/report/assets/glossary.json',
    showFeedSync: true,   // mostra riga FeedSync se presente
    showMeta: true        // mostra snapshot e updated nella testata
  };

  // ---------------- CSS (una tantum) ----------------
  let CSS_DONE = false;
  function injectCSS(){
    if (CSS_DONE) return; CSS_DONE = true;
    const css = `
/* Card base */
.hdtk-card{border:1px solid var(--br-soft);background:var(--surface-card);border-radius:16px;padding:1rem}
.hdtk-top{display:grid;grid-template-columns:1fr auto;gap:1rem;align-items:start}
.hdtk-id{min-width:0}
.hdtk-tkr{font-weight:800;letter-spacing:-.015em;font-size:clamp(18px,3vw,22px)}
.hdtk-venue{color:var(--muted);font-size:12px;margin-left:.5rem;white-space:nowrap}
.hdtk-co{color:var(--ink-soft);font-size:12px;margin-top:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hdtk-price{text-align:right}
.hdtk-price .val{font-weight:800;line-height:1;font-size:clamp(22px,3.6vw,32px)}
.hdtk-price .ccy{font-size:12px;font-weight:600;margin-left:.4rem}
.hdtk-delta{display:inline-flex;align-items:center;gap:.35rem;padding:.28rem .56rem;border-radius:999px;border:1px solid var(--br-soft);font-size:12px;font-weight:700;margin-left:.5rem}
.hdtk-delta[data-tone="green"]{color:oklab(38% -0.08 0.12);background:color-mix(in oklab,var(--surface-card) 90%, oklab(91% -0.02 0.06))}
.hdtk-delta[data-tone="yellow"]{color:oklab(36% 0.03 0.09);background:color-mix(in oklab,var(--surface-card) 90%, oklab(95% 0.02 0.10))}
.hdtk-delta[data-tone="red"]{color:oklab(34% 0.12 0.08);background:color-mix(in oklab,var(--surface-card) 90%, oklab(90% 0.12 0.08))}
.hdtk-meta{font-size:11.5px;color:var(--muted);text-align:right;margin-top:.35rem}

/* Tabella */
.hdtk-table{width:100%;border-collapse:separate;border-spacing:0;margin-top:1rem}
.hdtk-table th,.hdtk-table td{padding:.6rem .7rem;border-bottom:1px solid var(--br-soft);font-size:13px}
.hdtk-table th{text-align:left;color:var(--ink-soft);font-weight:700}
.hdtk-table td:last-child{text-align:right}
.hdtk-badge{display:inline-block;border:1px solid var(--br-soft);border-radius:999px;padding:.15rem .5rem;font-size:12px;font-weight:700}
.hdtk-badge[data-tone="green"]{color:oklab(38% -0.08 0.12);background:color-mix(in oklab,var(--surface-card) 90%, oklab(91% -0.02 0.06))}
.hdtk-badge[data-tone="yellow"]{color:oklab(36% 0.03 0.09);background:color-mix(in oklab,var(--surface-card) 90%, oklab(95% 0.02 0.10))}
.hdtk-badge[data-tone="red"]{color:oklab(34% 0.12 0.08);background:color-mix(in oklab,var(--surface-card) 90%, oklab(90% 0.12 0.08))}

/* Micro-modal info (fallback) */
.hdtk-modal[hidden]{display:none!important}
.hdtk-modal{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;background:oklab(0% 0 0 /.35);backdrop-filter:blur(2px)}
.hdtk-dialog{max-width:min(560px,96vw);width:100%;border:1px solid var(--br-soft);background:var(--surface-card);border-radius:14px;box-shadow:0 12px 36px oklab(0% 0 0 /.22);padding:1rem}
.hdtk-d-title{font-weight:700;font-size:14px;margin-bottom:.35rem}
.hdtk-d-what{font-size:13px;color:var(--ink-soft);margin-bottom:.35rem}
.hdtk-d-how{font-size:12px;line-height:1.55}
.hdtk-d-src{font-size:11px;color:var(--muted);margin-top:.5rem}
.hdtk-d-actions{display:flex;justify-content:flex-end;margin-top:.75rem}
.hdtk-btn{border:1px solid var(--br-soft);border-radius:999px;padding:.32rem .7rem;font-size:12px;background:var(--surface-card)}
@media (max-width:768px){.hdtk-dialog{margin:1rem}}
@media print{ .hdtk-modal{display:none!important} }
`;
    document.head.appendChild(EL('style', null, css));
  }

  // ---------------- Glossario ----------------
  let GLOSS=null, LOADING=null;
  async function ensureGlossary(){
    if (GLOSS) return GLOSS;
    if (LOADING) return LOADING;
    LOADING = fetch(CFG.glossaryPath,{cache:'no-store'})
      .then(r=> r.ok ? r.json() : {})
      .then(j=> (GLOSS=j||{}))
      .catch(()=> (GLOSS={}));
    return LOADING;
  }
  const G = key => (GLOSS?.[key] || GLOSS?.[`${key}_info`] || null);

  // ---------------- Tone fallback ----------------
  const toneForPct = v => (v==null||isNaN(v)) ? 'neutral' : (v>0?'green':(v<0?'red':'neutral'));
  function toneForFreshness(label){ if(!label) return 'neutral'; const s=String(label).toLowerCase(); if(s.includes('t-0')||s.includes('live')) return 'green'; if(s.includes('≤ t-1')||s.includes('t-1')) return 'yellow'; return 'red'; }
  function toneForScore(x){ if(x==null||isNaN(x)) return 'neutral'; if(x>=0.85) return 'green'; if(x>=0.70) return 'yellow'; return 'red'; }
  function toneForState(s){ if(!s) return 'neutral'; const u=String(s).toUpperCase(); if(u.includes('ACTIVE')) return 'green'; if(u.includes('REVIEW')) return 'yellow'; if(u.includes('HOLD')) return 'red'; return 'neutral'; }

  // ---------------- Markup ----------------
  function skeleton(){
    return `
      <div class="hdtk-card">
        <div class="hdtk-top">
          <div class="hdtk-id">
            <div class="flex items-baseline gap-2">
              <span class="hdtk-tkr">—</span>
              <span class="hdtk-venue">—</span>
            </div>
            <div class="hdtk-co">—</div>
          </div>
          <div class="hdtk-price">
            <div><span class="val">—</span><span class="ccy"> —</span><span class="hdtk-delta" data-tone="neutral"><span class="dval">—%</span></span></div>
            <div class="hdtk-meta"></div>
          </div>
        </div>
        <table class="hdtk-table">
          <thead><tr><th>Metrica</th><th>Valore</th><th>Semaforo</th><th></th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="hdtk-modal" hidden>
        <div class="hdtk-dialog" role="dialog" aria-modal="true">
          <div class="hdtk-d-title">—</div>
          <div class="hdtk-d-what">—</div>
          <div class="hdtk-d-how">—</div>
          <div class="hdtk-d-src">—</div>
          <div class="hdtk-d-actions"><button type="button" class="hdtk-btn" data-close>Chiudi</button></div>
        </div>
      </div>
    `;
  }

  function rowTemplate(id, label, value, toneKey){
    const tone = toneKey ? `data-tone="${toneKey}"` : '';
    const badge = toneKey && toneKey!=='neutral' ? `<span class="hdtk-badge" ${tone}>${toneKey}</span>` : '';
    return `
      <tr data-row="${id}">
        <td>${label}</td>
        <td class="text-right">${value}</td>
        <td class="text-right">${badge}</td>
        <td class="text-right"><button type="button" class="hdtk-btn" data-info="${id}">(i)</button></td>
      </tr>
    `;
  }

  // ---------------- Update ----------------
  async function update(root, raw={}){
    injectCSS();
    await ensureGlossary();

    // Normalizza Freshness
    const data = { ...raw, Freshness: raw.Freshness ?? { raw: raw.FreshnessLabel, tone: raw.FreshnessTone } };

    // Header ID
    QS('.hdtk-tkr', root).textContent   = data.Ticker || '—';
    QS('.hdtk-venue', root).textContent = data.Venue ? `· ${data.Venue}` : '';
    QS('.hdtk-co', root).textContent    = data.CompanyName || '';

    // Prezzo + Δ% + ccy
    QS('.hdtk-price .val', root).textContent = fmt.price(data.Price);
    QS('.hdtk-price .ccy', root).textContent = data.Currency ? ` ${data.Currency}` : '';
    const chgTone = normTone(data.ChangePctTone) || toneForPct(Number(data.ChangePct));
    const dEl = QS('.hdtk-delta', root); dEl.setAttribute('data-tone', chgTone);
    QS('.hdtk-delta .dval', root).textContent = fmt.pct(Number(data.ChangePct));

    // Meta snapshot (opzionale)
    if (CFG.showMeta) {
      const meta = QS('.hdtk-meta', root);
      const start = data.Start ?? '—';
      const end   = data.End ?? '—';
      const upd   = data.UpdatedAt ? fmt.timeUTC(data.UpdatedAt) : '—';
      meta.textContent = `Snapshot ${start} → ${end} · Updated ${upd}`;
    }

    // Costruisci righe tabella
    const body = QS('tbody', root); body.innerHTML = '';

    // Helper metric pickers
    const pickObj = (o) => (o && typeof o==='object') ? { val: (o.raw ?? o.value ?? o.val), tone: normTone(o.tone) } : { val: o, tone: null };

    const rows = [];

    // Price
    rows.push({ id:'Price', label:'Price', value: fmt.price(data.Price), tone:null });

    // Change %
    rows.push({ id:'ChangePct', label:'Change %', value: fmt.pct(Number(data.ChangePct)), tone: chgTone });

    // Currency
    rows.push({ id:'Currency', label:'Currency', value: String(data.Currency||'—'), tone:null });

    // Freshness
    const f = pickObj(data.Freshness);
    const fVal = (f.val || data.FreshnessLabel || '—').replace(' / ', ' (').replace('AH', 'AH') + (String(f.val||'').includes(' / ')?')':'' );
    const fTone = f.tone || toneForFreshness(fVal);
    rows.push({ id:'Freshness', label:'Freshness', value:fVal, tone:fTone });

    // ConfidenceFinal
    const cf = pickObj(data.ConfidenceFinal); rows.push({ id:'ConfidenceFinal', label:'Confidence (final)', value: !isNaN(Number(cf.val))? Number(cf.val).toFixed(2):String(cf.val||'—'), tone: cf.tone || toneForScore(Number(cf.val)) });

    // DataIntegrity
    const di = pickObj(data.DataIntegrity); rows.push({ id:'DataIntegrity', label:'Data integrity', value: !isNaN(Number(di.val))? Number(di.val).toFixed(2):String(di.val||'—'), tone: di.tone || toneForScore(Number(di.val)) });

    // FeedSync (opzionale)
    if (CFG.showFeedSync && (data.FeedSync!=null)){
      const fs = pickObj(data.FeedSync); rows.push({ id:'FeedSync', label:'Feed sync', value:String(fs.val||'—'), tone: fs.tone||'neutral' });
    }

    // State
    const st = pickObj(data.State);
    const sNote = data.StateNote ? ` <span class="text-muted" style="font-size:11px">${data.StateNote}</span>` : '';
    rows.push({ id:'State', label:'State', value:`${String(st.val||'—')}${sNote}`, tone: st.tone || toneForState(st.val) });

    // Snapshot window
    rows.push({ id:'Snapshot', label:'Snapshot window', value:`${data.Start||'—'} → ${data.End||'—'}`, tone:null });

    // UpdatedAt
    rows.push({ id:'UpdatedAt', label:'Updated at (UTC)', value: fmt.timeUTC(data.UpdatedAt), tone:null });

    // Version
    rows.push({ id:'Version', label:'Version', value:String(data.Version||'—'), tone:null });

    // Render
    rows.forEach(r => body.insertAdjacentHTML('beforeend', rowTemplate(r.id, r.label, r.value, r.tone)));

    // Bind (i)
    QSA('[data-info]', root).forEach(btn=>{
      btn.addEventListener('click', ()=> openInfo(btn.getAttribute('data-info')) );
    });
  }

  // ---------------- Popup What/How/Source ----------------
  function openInfo(key){
    const g = G(key) || {};
    const title = g.title || key;
    const what  = g.what  || '—';
    const how   = g.how   || '—';
    const src   = g.source? `Fonte: ${g.source}` : '';

    const html = `<div class="hdtk-d-title">${title}</div>
      <div class="hdtk-d-what">${what}</div>
      <div class="hdtk-d-how">${how}</div>
      <div class="hdtk-d-src">${src}</div>`;

    if (window.__TradeliaUI?.openPanel){
      window.__TradeliaUI.openPanel({ title, body: html, blocking: true, panelSize: 'wide' });
      return;
    }

    const modal = QS('.hdtk-modal');
    QS('.hdtk-d-title', modal).textContent = title;
    QS('.hdtk-d-what',  modal).textContent = what;
    QS('.hdtk-d-how',   modal).textContent = how;
    QS('.hdtk-d-src',   modal).textContent = src;
    modal.hidden = false;

    const close = () => { modal.hidden = true; };
    modal.addEventListener('click', (e)=>{ if(e.target===modal || e.target.hasAttribute('data-close')) close(); }, { once:true });
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ close(); } }, { once:true });
  }

  // ---------------- API ----------------
  function mount(slot){
    injectCSS();
    const host = (typeof slot==='string') ? QS(slot) : slot;
    if (!host) throw new Error('headerTickerEdu.table.mount: invalid slot');
    const wrap = EL('div'); wrap.innerHTML = skeleton();
    host.innerHTML=''; host.appendChild(wrap);
    return wrap;
  }

  return { mount, update };
})();
