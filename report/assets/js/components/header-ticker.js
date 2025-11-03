// /report/assets/js/components/header-ticker-edu.table.js
// Header Ticker · Educational (tabella COMPATTA, 1 metrica per riga)
// - Layout ultra-compatto, istituzionale
// - Colonne: Metrica | Valore (+chip tono inline) | (i)
// - Popup (i): What / How / Source delegato a __TradeliaUI.openPanel (niente CSS modale locale)
// - Dipendenze: tokens.css + ui-runtime.js (per openPanel). Nessun popover custom.

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

  // ---------------- CSS (solo densità + chip, niente modali) ----------------
  let CSS_DONE = false;
  function injectCSS(){
    if (CSS_DONE) return; CSS_DONE = true;
    const css = `
/* Card compatta */
.hdtk-card{border:1px solid var(--br-soft);background:var(--surface-card);border-radius:14px;padding:.75rem}
.hdtk-top{display:grid;grid-template-columns:1fr auto;gap:.75rem;align-items:start}
.hdtk-tkr{font-weight:800;letter-spacing:-.015em;font-size:clamp(16px,2.6vw,20px)}
.hdtk-venue{color:var(--muted);font-size:11px;margin-left:.4rem;white-space:nowrap}
.hdtk-co{color:var(--ink-soft);font-size:11px;margin-top:.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hdtk-price{text-align:right}
.hdtk-price .val{font-weight:800;line-height:1;font-size:clamp(20px,3vw,28px)}
.hdtk-price .ccy{font-size:11px;font-weight:600;margin-left:.35rem}
.hdtk-delta{display:inline-flex;align-items:center;gap:.3rem;padding:.18rem .48rem;border-radius:999px;border:1px solid var(--br-soft);font-size:11px;font-weight:700;margin-left:.45rem}
.hdtk-delta[data-tone="green"]{color:oklab(38% -0.08 0.12);background:color-mix(in oklab,var(--surface-card) 90%, oklab(91% -0.02 0.06))}
.hdtk-delta[data-tone="yellow"]{color:oklab(36% 0.03 0.09);background:color-mix(in oklab,var(--surface-card) 90%, oklab(95% 0.02 0.10))}
.hdtk-delta[data-tone="red"]{color:oklab(34% 0.12 0.08);background:color-mix(in oklab,var(--surface-card) 90%, oklab(90% 0.12 0.08))}
.hdtk-meta{font-size:11px;color:var(--muted);text-align:right;margin-top:.2rem}

/* Tabella compatta */
.hdtk-table{width:100%;border-collapse:collapse;margin-top:.5rem}
.hdtk-table th,.hdtk-table td{padding:.44rem .5rem;border-bottom:1px solid var(--br-soft);font-size:12px}
.hdtk-table th{text-align:left;color:var(--ink-soft);font-weight:700}
.hdtk-table td:last-child{text-align:right}

/* Chip tono inline (minuscola, sobria) */
.hdtk-chip{display:inline-flex;align-items:center;gap:.35rem;border:1px solid var(--br-soft);border-radius:999px;padding:.06rem .38rem;font-size:11px;font-weight:700;margin-left:.38rem}
.hdtk-dot{width:6px;height:6px;border-radius:50%}
.hdtk-chip[data-tone="green"]{color:oklab(38% -0.08 0.12);background:color-mix(in oklab,var(--surface-card) 92%, oklab(91% -0.02 0.06))}
.hdtk-chip[data-tone="yellow"]{color:oklab(36% 0.03 0.09);background:color-mix(in oklab,var(--surface-card) 92%, oklab(95% 0.02 0.10))}
.hdtk-chip[data-tone="red"]{color:oklab(34% 0.12 0.08);background:color-mix(in oklab,var(--surface-card) 92%, oklab(90% 0.12 0.08))}
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
          <div>
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
          <thead><tr><th style="width:34%">Metrica</th><th>Valore</th><th style="width:48px;text-align:right"></th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `;
  }

  function rowTemplate(id, label, valueHTML){
    return `
      <tr data-row="${id}">
        <td>${label}</td>
        <td class="text-right">${valueHTML}</td>
        <td class="text-right"><button type="button" class="btn btn-sm" data-info="${id}">(i)</button></td>
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

    const chip = (tone, label) => {
      const t = normTone(tone||'');
      if (!t || t==='neutral') return '';
      return `<span class="hdtk-chip" data-tone="${t}"><span class="hdtk-dot" style="background:currentColor"></span>${label||t}</span>`;
    };

    const pickObj = (o) => (o && typeof o==='object') ? { val: (o.raw ?? o.value ?? o.val), tone: normTone(o.tone) } : { val: o, tone: null };

    const rows = [];

    // Price
    rows.push(['Price','Price', `${fmt.price(data.Price)}`]);

    // Change % (con chip tono)
    rows.push(['ChangePct','Change %', `${fmt.pct(Number(data.ChangePct))} ${chip(chgTone)}`]);

    // Currency
    rows.push(['Currency','Currency', String(data.Currency||'—')]);

    // Freshness
    const f = pickObj(data.Freshness);
    const fVal = (f.val || data.FreshnessLabel || '—').replace(' / ', ' (') + (String(f.val||'').includes(' / ')?')':'' );
    const fTone = f.tone || toneForFreshness(fVal);
    rows.push(['Freshness','Freshness', `${fVal} ${chip(fTone)}`]);

    // ConfidenceFinal
    const cf = pickObj(data.ConfidenceFinal);
    const cfVal = !isNaN(Number(cf.val))? Number(cf.val).toFixed(2):String(cf.val||'—');
    rows.push(['ConfidenceFinal','Confidence (final)', `${cfVal} ${chip(cf.tone || toneForScore(Number(cf.val)))}`]);

    // DataIntegrity
    const di = pickObj(data.DataIntegrity);
    const diVal = !isNaN(Number(di.val))? Number(di.val).toFixed(2):String(di.val||'—');
    rows.push(['DataIntegrity','Data integrity', `${diVal} ${chip(di.tone || toneForScore(Number(di.val)))}`]);

    // FeedSync (opzionale)
    if (CFG.showFeedSync && (data.FeedSync!=null)){
      const fs = pickObj(data.FeedSync);
      rows.push(['FeedSync','Feed sync', `${String(fs.val||'—')} ${chip(fs.tone||'neutral')}`]);
    }

    // State + nota
    const st = pickObj(data.State);
    const sNote = data.StateNote ? `<span class="text-muted" style="font-size:11px;margin-left:.35rem">${data.StateNote}</span>` : '';
    rows.push(['State','State', `${String(st.val||'—')}${sNote} ${chip(st.tone || toneForState(st.val))}`]);

    // Snapshot window
    rows.push(['Snapshot','Snapshot window', `${data.Start||'—'} → ${data.End||'—'}`]);

    // UpdatedAt
    rows.push(['UpdatedAt','Updated at (UTC)', `${fmt.timeUTC(data.UpdatedAt)}`]);

    // Version
    rows.push(['Version','Version', String(data.Version||'—')]);

    // Render
    rows.forEach(([id,label,val]) => body.insertAdjacentHTML('beforeend', rowTemplate(id, label, val)));

    // Bind (i) → pannello nativo runtime
    QSA('[data-info]', root).forEach(btn=>{
      btn.addEventListener('click', ()=> openInfo(btn.getAttribute('data-info')) );
    });
  }

  // ---------------- Popup What/How/Source (solo via runtime) ----------------
  function openInfo(key){
    const g = G(key) || {};
    const title = g.title || key;
    const what  = g.what  || '—';
    const how   = g.how   || '—';
    const src   = g.source? `Fonte: ${g.source}` : '';

    const html = `<div class="section-title" style="font-size:14px;margin-bottom:.25rem">${title}</div>
      <div class="text-muted" style="font-size:13px;margin-bottom:.25rem">${what}</div>
      <div style="font-size:12px;line-height:1.55">${how}</div>
      <div class="text-muted" style="font-size:11px;margin-top:.5rem">${src}</div>`;

    if (window.__TradeliaUI?.openPanel){
      window.__TradeliaUI.openPanel({ title, body: html, blocking: true, panelSize: 'narrow' });
      return;
    }
    // Se manca il runtime, apri comunque in una nuova finestra minimale
    const w = window.open('', '_blank', 'width=480,height=600');
    if(w){ w.document.write(`<title>${title}</title><pre style="font:12px/1.5 system-ui, sans-serif">${what}\n\n${how}\n\n${src}</pre>`); }
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
