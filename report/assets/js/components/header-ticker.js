// /report/assets/js/components/header-ticker.js — ONE FILE, DROP-IN, READY
// Variante B (max 2 righe) con caption “what” sotto ogni metrica e (i) che mostra SOLO {how, source}
// Nessuna dipendenza oltre a tokens.css. Carica automaticamente il glossario da /report/assets/glossary.json
// API: headerTicker.mount(slot) -> node; headerTicker.update(node, data); (auto-carica glossario una volta)

export const headerTicker = (()=>{
  // ---------------------------------
  // Tiny DOM helpers
  // ---------------------------------
  const QS  = (s, r=document)=> r.querySelector(s);
  const QSA = (s, r=document)=> [...r.querySelectorAll(s)];
  const EL  = (t, cls, html)=>{ const e=document.createElement(t); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; };

  // ---------------------------------
  // Inline CSS (tones + utilities) — injected once
  // ---------------------------------
  let CSS_INJECTED = false;
  function injectCSS(){
    if (CSS_INJECTED) return; CSS_INJECTED = true;
    const css = `
    .no-scrollbar::-webkit-scrollbar{ display:none; }
    .hdrtk-wrap{ padding-block: .35rem; }
    .hdrtk-caption{ display:flex; align-items:center; gap:.35rem; }
    .hdrtk-i{ cursor:pointer; font-weight:700; border:0; background:none; color:inherit; padding:0; }
    [data-tone="green"]  { border-color: oklab(65% -0.1 0.2 / .5);  color: oklab(36% -0.08 0.12); background: color-mix(in oklab, var(--surface-card) 88%, oklab(91% -0.02 0.06)); }
    [data-tone="yellow"] { border-color: oklab(75% 0.03 0.12 / .5); color: oklab(36%  0.03 0.09); background: color-mix(in oklab, var(--surface-card) 88%, oklab(95%  0.02 0.10)); }
    [data-tone="red"]    { border-color: oklab(65% 0.16 0.12 / .5); color: oklab(34%  0.12 0.08); background: color-mix(in oklab, var(--surface-card) 88%, oklab(90%  0.12 0.08)); }
    .hdrtk-popover{ pointer-events:auto; }
    `;
    const tag = EL('style'); tag.textContent = css; document.head.appendChild(tag);
  }

  // ---------------------------------
  // Tone helpers
  // ---------------------------------
  function toneForPct(p){ if (p==null||isNaN(p)) return 'neutral'; if (p>0.5) return 'green'; if (p<-0.5) return 'red'; return 'neutral'; }
  function toneForFreshness(label){ if(!label) return 'neutral'; const s=String(label).toLowerCase(); if(s.includes('t-0')||s.includes('live')) return 'green'; if(s.includes('≤ t-1')||s.includes('t-1')) return 'yellow'; return 'red'; }
  function toneForScore(x){ if(x==null||isNaN(x)) return 'neutral'; if(x>=0.85) return 'green'; if(x>=0.70) return 'yellow'; return 'red'; }
  function toneForState(s){ if(!s) return 'neutral'; const u=String(s).toUpperCase(); if(u.includes('ACTIVE')) return 'green'; if(u.includes('REVIEW')) return 'yellow'; if(u.includes('HOLD')) return 'red'; return 'neutral'; }

  // ---------------------------------
  // Format helpers
  // ---------------------------------
  const fmt = {
    price(v){ if(v==null||isNaN(v)) return '—'; return Number(v).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}); },
    pct(v){ if(v==null||isNaN(v)) return '—'; const sign = v>0?'+':''; return `${sign}${Number(v).toFixed(2)}%`; },
  };

  // ---------------------------------
  // Glossary (auto-load once from /report/assets/glossary.json)
  // ---------------------------------
  let GLOSSARY = null; let GLOSSARY_LOADING = null;
  async function ensureGlossary(){
    if (GLOSSARY) return GLOSSARY;
    if (GLOSSARY_LOADING) return GLOSSARY_LOADING;
    GLOSSARY_LOADING = fetch('/report/assets/glossary.json', { cache:'no-store' })
      .then(r=> r.ok ? r.json() : null)
      .then(j=>{ GLOSSARY = j||{}; return GLOSSARY; })
      .catch(()=> (GLOSSARY={}));
    return GLOSSARY_LOADING;
  }

  // ---------------------------------
  // Popover (shows only how + source)
  // ---------------------------------
  let popRef = null;
  function ensurePopover(){
    if (popRef) return popRef;
    const p = EL('div','tl-popover hdrtk-popover');
    p.setAttribute('role','dialog');
    Object.assign(p.style, {
      position:'fixed', minWidth:'260px', maxWidth:'340px', zIndex:60,
      border:'1px solid var(--br-soft)', borderRadius:'var(--radius-card)',
      background:'var(--surface-card)', color:'var(--ink)',
      boxShadow:'0 12px 36px oklab(0% 0 0 / .22)', padding:'.75rem .85rem'
    });
    p.hidden = true;
    p.innerHTML = `
      <div class="text-[12px] leading-5 hdrtk-popover-body">
        <div class="hdrtk-how mb-2"></div>
        <div class="hdrtk-src text-[11px] text-[color:var(--muted)]"></div>
      </div>`;
    document.body.appendChild(p);
    popRef = p; return p;
  }
  function openPopover(target, key){
    const p = ensurePopover();
    const g = GLOSSARY?.[key] || GLOSSARY?.[`${key}_info`] || null;
    const how = g?.how || '—';
    const src = g?.source || '';
    QS('.hdrtk-how', p).textContent = how;
    QS('.hdrtk-src', p).textContent = src ? `Fonte: ${src}` : '';
    const r = target.getBoundingClientRect();
    const pad = 10; const vw = innerWidth; const vh = innerHeight;
    let x = r.left + (r.width/2) - 140; let y = r.bottom + 8;
    if (x < pad) x = pad; if (x > vw - 300) x = vw - 300; if (y > vh - 140) y = r.top - 8 - (p.offsetHeight||140);
    p.style.left = x + 'px'; p.style.top = y + 'px'; p.hidden = false;
    requestAnimationFrame(()=> document.addEventListener('click', ()=>{ p.hidden = true; }, { once:true }));
  }

  // ---------------------------------
  // Markup skeleton
  // ---------------------------------
  function skeleton(){
    return `
    <div class="hdrtk-wrap">
      <div class="hdrtk-row1 flex items-end justify-between gap-3">
        <div class="hdrtk-left flex items-baseline gap-2 min-w-0">
          <div class="hdrtk-ticker text-[clamp(18px,3.2vw,24px)] font-extrabold tracking-tight">—</div>
          <div class="hdrtk-venue text-[12px] text-[color:var(--muted)]">—</div>
        </div>
        <div class="hdrtk-right flex items-center flex-wrap gap-x-3 gap-y-1">
          <div class="hdrtk-price block">
            <div class="text-[clamp(20px,3.6vw,28px)] font-extrabold tabular-nums">—</div>
            <div class="hdrtk-caption text-[11px] text-[color:var(--muted)] leading-tight">
              Price · <button class="hdrtk-i underline decoration-dotted" data-info="Price" aria-label="Info">i</button>
            </div>
          </div>
          <div class="hdrtk-chg">
            <div class="hdrtk-pill inline-flex items-center gap-1 px-2 py-[3px] rounded-[999px] border text-[12px] font-semibold">—%</div>
            <div class="hdrtk-caption text-[11px] text-[color:var(--muted)] leading-tight">
              ChangePct · <button class="hdrtk-i underline decoration-dotted" data-info="ChangePct" aria-label="Info">i</button>
            </div>
          </div>
          <div class="hdrtk-ccy">
            <div class="text-[13px] font-semibold">—</div>
            <div class="hdrtk-caption text-[11px] text-[color:var(--muted)] leading-tight">
              Currency · <button class="hdrtk-i underline decoration-dotted" data-info="Currency" aria-label="Info">i</button>
            </div>
          </div>
        </div>
      </div>

      <div class="hdrtk-row2 mt-2 flex items-center justify-between gap-2">
        <div class="hdrtk-quals flex items-center gap-2 overflow-x-auto no-scrollbar pr-1">
          ${pillSkeleton('Freshness')}
          ${pillSkeleton('ConfidenceFinal')}
          ${pillSkeleton('DataIntegrity')}
          ${pillSkeleton('FeedSync')}
          ${pillSkeleton('State')}
        </div>
      </div>
    </div>`;
  }
  function pillSkeleton(id){
    return `
      <div class="hdrtk-qpill min-w-[150px]">
        <div class="hdrtk-pill inline-flex items-center gap-1 px-2 py-[3px] rounded-[999px] border text-[12px] font-semibold">—</div>
        <div class="hdrtk-caption text-[11px] text-[color:var(--muted)] leading-tight">
          ${id} · <button class="hdrtk-i underline decoration-dotted" data-info="${id}" aria-label="Info">i</button>
        </div>
      </div>`;
  }

  // ---------------------------------
  // Update (map data → UI)
  // ---------------------------------
  async function update(root, data={}){
    injectCSS();
    await ensureGlossary();

    const tkr   = data.Ticker || '—';
    const vnu   = data.Venue || '';
    const price = data.Price;
    const chg   = data.ChangePct;
    const ccy   = data.Currency || '';

    QS('.hdrtk-ticker', root).textContent = tkr;
    QS('.hdrtk-venue',  root).textContent = vnu ? `· ${vnu}` : '';
    QS('.hdrtk-price .tabular-nums', root).textContent = fmt.price(price);

    const pill = QS('.hdrtk-chg .hdrtk-pill', root);
    const tone = toneForPct(Number(chg));
    pill.textContent = fmt.pct(Number(chg));
    applyTone(pill, tone);
    const caret = Number(chg) > 0 ? '▲' : (Number(chg) < 0 ? '▼' : '◼');
    pill.prepend(EL('span','', caret));

    QS('.hdrtk-ccy div:first-child', root).textContent = ccy || '—';

    setQual(root, 'Freshness',       data.FreshnessLabel || data.Freshness);
    setQual(root, 'ConfidenceFinal', data.ConfidenceFinal, 'score');
    setQual(root, 'DataIntegrity',   data.DataIntegrity,   'score');
    setQual(root, 'FeedSync',        data.FeedSync);
    setQual(root, 'State',           data.State);

    // bind popover (how+source)
    QSA('.hdrtk-i', root).forEach(btn => {
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); openPopover(btn, btn.getAttribute('data-info')); }, { passive:true });
    });
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

    pill.textContent = txt; applyTone(pill, tone);
  }

  function applyTone(el, tone){
    el.style.borderColor = 'var(--br-soft)';
    el.style.background  = 'var(--surface-card)';
    el.style.color       = 'var(--ink)';
    el.removeAttribute('data-tone');
    if (tone==='green')  el.setAttribute('data-tone','green');
    if (tone==='yellow') el.setAttribute('data-tone','yellow');
    if (tone==='red')    el.setAttribute('data-tone','red');
  }

  // ---------------------------------
  // Public API
  // ---------------------------------
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
