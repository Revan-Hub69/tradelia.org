// /report/assets/js/components/header-ticker.js — Variante B · Design Premium (2025-11-02)
// - Riga 1: Ticker/venue/company (sx) · Prezzo + Δ% (pill) + Currency (dx)
// - Riga 2: "Quality" + Freshness/Confidence/DataIntegrity/State (+FeedSync se presente) · Meta snapshot/updated (dx)
// - Sotto ogni metrica/pill: caption didattica con `what` (dal glossario), clamp 2 righe
// - Icona (i): popover con {how, source} + freccetta
// - Autoload glossario da /report/assets/glossary.json — nessuna dipendenza dal runtime

export const headerTicker = (()=>{

  // ============ Helpers ============
  const QS  = (s, r=document)=> r.querySelector(s);
  const QSA = (s, r=document)=> [...r.querySelectorAll(s)];
  const EL  = (t, cls, html)=>{ const e=document.createElement(t); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; };

  // Design toggles (puoi cambiarli se vuoi)
  const CFG = {
    showFeedSyncPill: false,        // mostra anche FeedSync tra le pill di qualità
    metaRightEnabled:  true,        // mostra meta snapshot/updated a destra in riga 2
    clampWhatLines:    2            // righe di clamp per i `what`
  };

  // ============ CSS (inject una sola volta) ============
  let CSS_INJECTED = false;
  function injectCSS(){
    if (CSS_INJECTED) return; CSS_INJECTED = true;
    const css = `
      .no-scrollbar::-webkit-scrollbar{ display:none; }
      .header-ticker { padding-block:.5rem; }
      .hdrtk-row1 { gap:1rem; }
      .hdrtk-left  { min-width:0; }
      .hdrtk-ticker { letter-spacing:-.015em; }
      .hdrtk-venue { white-space:nowrap; }
      .hdrtk-company { color: var(--ink-soft); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:52ch; }
      .hdrtk-right { align-items:baseline; }

      .hdrtk-price-val { line-height:1; }
      .hdrtk-delta-pill {
        display:inline-flex; align-items:center; gap:.35rem;
        padding:.25rem .5rem; margin-left:.5rem;
        border-radius:999px; border:1px solid var(--br-soft);
        font-size:12px; font-weight:700; line-height:1;
        transition: transform .12s ease;
      }
      .hdrtk-delta-pill[data-tone="green"]  { color: oklab(38% -0.08 0.12); background: color-mix(in oklab, var(--surface-card) 90%, oklab(91% -0.02 0.06)); }
      .hdrtk-delta-pill[data-tone="red"]    { color: oklab(36%  0.12 0.08); background: color-mix(in oklab, var(--surface-card) 90%, oklab(90%  0.12 0.08)); }
      .hdrtk-delta-caret { display:inline-block; transform: translateY(-1px); opacity:.9; }

      .hdrtk-caption { display:flex; align-items:center; gap:.35rem; }
      .hdrtk-what { font-size:11.5px; color: var(--muted); margin-top:2px; display:-webkit-box; -webkit-line-clamp:${CFG.clampWhatLines}; -webkit-box-orient:vertical; overflow:hidden; }
      .hdrtk-what--wider { max-width:42ch; }
      .hdrtk-what--narrow { max-width:30ch; }

      .hdrtk-i { cursor:pointer; font-weight:700; border:0; background:none; color:inherit; padding:0; }
      .hdrtk-i:hover { text-decoration: underline; text-underline-offset: 2px; }

      .hdrtk-quals { gap: .75rem; }
      .hdrtk-qpill { min-width: 120px; }
      .hdrtk-pill {
        display:inline-flex; align-items:center; gap:.35rem;
        padding:.28rem .55rem; border-radius:999px; border:1px solid var(--br-soft);
        font-size:12px; font-weight:700; line-height:1;
      }
      .hdrtk-pill[data-tone="green"]  { color: oklab(38% -0.08 0.12); background: color-mix(in oklab, var(--surface-card) 90%, oklab(91% -0.02 0.06)); }
      .hdrtk-pill[data-tone="yellow"] { color: oklab(36%  0.03 0.09); background: color-mix(in oklab, var(--surface-card) 90%, oklab(95%  0.02 0.10)); }
      .hdrtk-pill[data-tone="red"]    { color: oklab(34%  0.12 0.08); background: color-mix(in oklab, var(--surface-card) 90%, oklab(90%  0.12 0.08)); }

      .hdrtk-meta { font-size:11.5px; color: var(--muted); white-space:nowrap; }

      /* Popover (i) */
      .hdrtk-popover {
        position:fixed; z-index:60; min-width:260px; max-width:320px; padding:.75rem .85rem;
        border:1px solid var(--br-soft); border-radius: var(--radius-card);
        background: var(--surface-card); color: var(--ink);
        box-shadow: 0 12px 36px oklab(0% 0 0 / .22);
      }
      .hdrtk-popover[hidden]{ display:none !important; }
      .hdrtk-popover::after {
        content:\"\"; position:absolute; width:0; height:0; border:6px solid transparent; border-bottom-color: var(--surface-card);
        top:-12px; left:24px; filter: drop-shadow(0 -1px 0 var(--br-soft));
      }
      .hdrtk-pop-how { font-size:12px; line-height:1.5; margin-bottom:.35rem; }
      .hdrtk-pop-src { font-size:11px; color: var(--muted); }
    `;
    document.head.appendChild(EL('style', null, css));
  }

  // ============ Tone / fmt ============
  const toneForPct   = p => (p==null||isNaN(p)) ? 'neutral' : (p>0.0 ? 'green' : (p<0.0 ? 'red':'neutral'));
  function toneForFreshness(label){ if(!label) return 'neutral'; const s=String(label).toLowerCase(); if(s.includes('t-0')||s.includes('live')) return 'green'; if(s.includes('≤ t-1')||s.includes('t-1')) return 'yellow'; return 'red'; }
  function toneForScore(x){ if(x==null||isNaN(x)) return 'neutral'; if(x>=0.85) return 'green'; if(x>=0.70) return 'yellow'; return 'red'; }
  function toneForState(s){ if(!s) return 'neutral'; const u=String(s).toUpperCase(); if(u.includes('ACTIVE')) return 'green'; if(u.includes('REVIEW')) return 'yellow'; if(u.includes('HOLD')) return 'red'; return 'neutral'; }

  const fmt = {
    price(v){ if(v==null||isNaN(v)) return '—'; return Number(v).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}); },
    pct(v){ if(v==null||isNaN(v)) return '—'; const sign = v>0?'+':''; return `${sign}${Number(v).toFixed(2)}%`; },
    timeUTC(str){ try{ const d=new Date(str); return d.toISOString().slice(11,16)+' UTC'; }catch(e){ return '—'; } }
  };

  // ============ Glossario ============
  let GLOSSARY = null, GLOSSARY_LOADING = null;
  async function ensureGlossary(){
    if (GLOSSARY) return GLOSSARY;
    if (GLOSSARY_LOADING) return GLOSSARY_LOADING;
    GLOSSARY_LOADING = fetch('/report/assets/glossary.json', { cache:'no-store' })
      .then(r=> r.ok ? r.json() : null)
      .then(j=>{ GLOSSARY = j||{}; return GLOSSARY; })
      .catch(()=> (GLOSSARY={}));
    return GLOSSARY_LOADING;
  }
  const G = key => (GLOSSARY?.[key] || GLOSSARY?.[`${key}_info`] || null);

  // ============ Popover (how+source) ============
  let popRef = null;
  function ensurePopover(){
    if (popRef) return popRef;
    const p = EL('div','hdrtk-popover'); p.hidden = true;
    p.innerHTML = `
      <div class="hdrtk-pop-how"></div>
      <div class="hdrtk-pop-src"></div>
    `;
    document.body.appendChild(p);
    popRef = p; return p;
  }
  function openPopover(target, key){
    const pop = ensurePopover();
    const g = G(key);
    QS('.hdrtk-pop-how', pop).textContent = g?.how || '—';
    QS('.hdrtk-pop-src', pop).textContent = g?.source ? `Fonte: ${g.source}` : '';
    const r = target.getBoundingClientRect();
    const vw = innerWidth, vh = innerHeight, pad=10;
    let x = r.left, y = r.bottom + 10;
    pop.hidden = false;
    // clamp
    const w = pop.offsetWidth, h = pop.offsetHeight;
    if (x + w + pad > vw) x = vw - w - pad;
    if (y + h + pad > vh) y = r.top - 10 - h;
    pop.style.left = x + 'px';
    pop.style.top  = y + 'px';
  }
  document.addEventListener('click', e=>{
    if (!popRef || popRef.hidden) return;
    if (!e.target.closest('.hdrtk-popover') && !e.target.closest('.hdrtk-i')) popRef.hidden = true;
  }, { capture:true });

  // ============ Markup ============
  function skeleton(){
    return `
      <div class="hdrtk-row1 flex items-start justify-between">
        <div class="hdrtk-left">
          <div class="flex items-baseline gap-2">
            <div class="hdrtk-ticker text-[clamp(18px,3.2vw,24px)] font-extrabold tracking-tight">—</div>
            <div class="hdrtk-venue text-[12px] text-[color:var(--muted)]">—</div>
          </div>
          <div class="hdrtk-company mt-[2px]">—</div>
        </div>

        <div class="hdrtk-right flex items-center flex-wrap">
          <div class="flex items-baseline">
            <div class="hdrtk-price-val text-[clamp(22px,3.8vw,30px)] font-extrabold tabular-nums">—</div>
            <div class="hdrtk-delta-pill" data-tone="neutral">
              <span class="hdrtk-delta-caret">◼</span><span class="hdrtk-delta-val">—%</span>
            </div>
            <div class="hdrtk-ccy ml-2 text-[12px] font-semibold">—</div>
          </div>
          <div class="mt-1 text-[11px] text-[color:var(--muted)]">
            <span>Price · <button class="hdrtk-i" data-info="Price" aria-label="Info">i</button></span>
            <span class="mx-2">·</span>
            <span>ChangePct · <button class="hdrtk-i" data-info="ChangePct" aria-label="Info">i</button></span>
            <span class="mx-2">·</span>
            <span>Currency · <button class="hdrtk-i" data-info="Currency" aria-label="Info">i</button></span>
            <div class="hdrtk-what hdrtk-what--wider mt-[2px]" data-what="Price"></div>
          </div>
        </div>
      </div>

      <div class="hdrtk-row2 mt-2 flex items-center justify-between gap-2">
        <div class="flex items-center gap-3 overflow-x-auto no-scrollbar pr-1">
          <div class="text-[11px] text-[color:var(--muted)] mr-1">Quality</div>
          ${pillSkeleton('Freshness')}
          ${pillSkeleton('ConfidenceFinal')}
          ${pillSkeleton('DataIntegrity')}
          ${CFG.showFeedSyncPill ? pillSkeleton('FeedSync') : ''}
          ${pillSkeleton('State')}
        </div>

        <div class="hdrtk-meta">${CFG.metaRightEnabled ? '—' : ''}</div>
      </div>
    `;
  }
  function pillSkeleton(id){
    return `
      <div class="hdrtk-qpill">
        <div class="hdrtk-pill" data-tone="neutral">—</div>
        <div class="hdrtk-caption text-[11px] text-[color:var(--muted)] leading-tight">
          ${id} · <button class="hdrtk-i" data-info="${id}" aria-label="Info">i</button>
        </div>
        <div class="hdrtk-what hdrtk-what--narrow" data-what="${id}"></div>
      </div>
    `;
  }

  // ============ Update ============
  async function update(root, data={}){
    injectCSS();
    await ensureGlossary();

    // SX
    QS('.hdrtk-ticker',  root).textContent = data.Ticker || '—';
    QS('.hdrtk-venue',   root).textContent = data.Venue ? `· ${data.Venue}` : '';
    QS('.hdrtk-company', root).textContent = data.CompanyName || '';

    // DX — prezzo + Δ% + currency
    QS('.hdrtk-price-val', root).textContent = fmt.price(data.Price);

    const deltaTone  = toneForPct(Number(data.ChangePct));
    const deltaPill  = QS('.hdrtk-delta-pill', root);
    deltaPill.setAttribute('data-tone', deltaTone);
    QS('.hdrtk-delta-val', root).textContent = fmt.pct(Number(data.ChangePct));
    QS('.hdrtk-delta-caret', root).textContent = Number(data.ChangePct)>0 ? '▲' : (Number(data.ChangePct)<0 ? '▼' : '◼');

    QS('.hdrtk-ccy', root).textContent = data.Currency || '—';

    // Caption what per macro blocco dx
    setWhat(root, 'Price');

    // Pill qualità
    setQual(root, 'Freshness',       data.FreshnessLabel || data.Freshness);
    setQual(root, 'ConfidenceFinal', data.ConfidenceFinal, 'score');
    setQual(root, 'DataIntegrity',   data.DataIntegrity,   'score');
    if (CFG.showFeedSyncPill) setQual(root, 'FeedSync', data.FeedSync);
    setQual(root, 'State',           data.State);

    // What per pill
    setWhat(root, 'Freshness');
    setWhat(root, 'ConfidenceFinal');
    setWhat(root, 'DataIntegrity');
    if (CFG.showFeedSyncPill) setWhat(root, 'FeedSync');
    setWhat(root, 'State');
    setWhat(root, 'ChangePct');
    setWhat(root, 'Currency');

    // Meta (dx riga 2)
    if (CFG.metaRightEnabled){
      const meta = QS('.hdrtk-meta', root);
      const start = data.Start ?? '—';
      const end   = data.End ?? '—';
      const upd   = data.UpdatedAt ? fmt.timeUTC(data.UpdatedAt) : '—';
      meta.textContent = `Snapshot ${start} → ${end} · Updated ${upd}`;
    }

    // Bind popover
    QSA('.hdrtk-i', root).forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); openPopover(btn, btn.getAttribute('data-info')); }, { passive:true });
    });
  }

  function setWhat(root, key){
    const t = QSA(`[data-what="${key}"]`, root)[0];
    if(!t) return;
    const g = G(key);
    t.textContent = g?.what || '—';
  }

  function setQual(root, id, value, kind='text'){
    const box = QSA('.hdrtk-qpill', root).find(x => QS('.hdrtk-caption', x)?.textContent?.startsWith(id));
    if (!box){ return; }
    if (value==null || value==='') { box.style.display='none'; return; }

    const pill = QS('.hdrtk-pill', box);
    let tone = 'neutral'; let txt = String(value);
    if (id === 'Freshness') tone = toneForFreshness(value);
    else if (id === 'ConfidenceFinal' || id==='DataIntegrity') tone = toneForScore(Number(value));
    else if (id === 'State') tone = toneForState(value);
    if (kind==='score' && !isNaN(Number(value))) txt = Number(value).toFixed(2);

    pill.textContent = txt;
    pill.setAttribute('data-tone', tone);
  }

  // ============ API ============
  function mount(slot){
    injectCSS();
    const host = (typeof slot === 'string') ? QS(slot) : slot;
    if (!host) throw new Error('headerTicker.mount: invalid slot');
    const wrap = EL('div','header-ticker');
    wrap.innerHTML = skeleton();
    host.innerHTML = ''; host.appendChild(wrap);
    return wrap;
  }

  return { mount, update };
})();
