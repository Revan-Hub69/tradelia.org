// /report/assets/js/components/header-ticker.js — Semaforo da JSON (2025-11-02)

export const headerTicker = (()=>{

  // ---------------- Helpers ----------------
  const QS  = (s, r=document)=> r.querySelector(s);
  const QSA = (s, r=document)=> [...r.querySelectorAll(s)];
  const EL  = (t, cls, html)=>{ const e=document.createElement(t); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; };

  // ===== CONFIG =====
  const CFG = {
    captionMode: 'what',   // 'what' | 'how' | 'what+how'  (tu vuoi 'what')
    clampLines:  2,
    showFeedSyncPill: false,
    metaRightEnabled: true
  };

  // ---------------- CSS (iniettato) ----------------
  let CSS_INJECTED = false;
  function injectCSS(){
    if (CSS_INJECTED) return; CSS_INJECTED = true;
    const css = `
      .header-ticker{padding-block:.6rem}
      .hdrtk-row1{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
      .hdrtk-left{min-width:0}
      .hdrtk-ticker{letter-spacing:-.015em}
      .hdrtk-venue{white-space:nowrap;color:var(--muted);font-size:12px}
      .hdrtk-company{color:var(--ink-soft);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52ch;margin-top:2px}

      .hdrtk-right{display:flex;flex-direction:column;align-items:flex-end}
      .hdrtk-price-val{font-weight:800;line-height:1;font-size:clamp(22px,3.8vw,30px)}
      .hdrtk-ccy{font-size:12px;font-weight:600;margin-left:.5rem}

      .hdrtk-delta{display:inline-flex;align-items:center;gap:.35rem;padding:.28rem .55rem;border-radius:999px;border:1px solid var(--br-soft);font-size:12px;font-weight:700;line-height:1;margin-left:.5rem}
      .hdrtk-delta[data-tone="green"]{color:oklab(38% -0.08 0.12);background:color-mix(in oklab,var(--surface-card) 90%, oklab(91% -0.02 0.06))}
      .hdrtk-delta[data-tone="red"]{color:oklab(36% 0.12 0.08);background:color-mix(in oklab,var(--surface-card) 90%, oklab(90% 0.12 0.08))}
      .hdrtk-delta[data-tone="yellow"]{color:oklab(36% 0.03 0.09);background:color-mix(in oklab,var(--surface-card) 90%, oklab(95% 0.02 0.10))}
      .hdrtk-caret{display:inline-block;transform:translateY(-1px);opacity:.9}

      .hdrtk-legend{margin-top:.35rem;font-size:11px;color:var(--muted)}
      .hdrtk-legend .sep{margin:0 .5rem}

      .hdrtk-row2{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-top:.9rem}
      .hdrtk-quals{display:flex;gap:1.1rem;overflow-x:auto}
      .hdrtk-qpill{min-width:160px}
      .hdrtk-pill{display:inline-flex;align-items:center;gap:.4rem;padding:.32rem .6rem;border-radius:999px;border:1px solid var(--br-soft);font-size:12px;font-weight:700;line-height:1}
      .hdrtk-pill[data-tone="green"]{color:oklab(38% -0.08 0.12);background:color-mix(in oklab,var(--surface-card) 90%, oklab(91% -0.02 0.06))}
      .hdrtk-pill[data-tone="yellow"]{color:oklab(36% 0.03 0.09);background:color-mix(in oklab,var(--surface-card) 90%, oklab(95% 0.02 0.10))}
      .hdrtk-pill[data-tone="red"]{color:oklab(34% 0.12 0.08);background:color-mix(in oklab,var(--surface-card) 90%, oklab(90% 0.12 0.08))}
      .hdrtk-pill[data-tone="neutral"]{ }

      .hdrtk-caphead{display:flex;align-items:center;gap:.45rem;color:var(--muted);font-size:11.5px;margin-top:.35rem}
      .hdrtk-i{display:inline-grid;place-items:center;width:18px;height:18px;border:1px solid var(--br-soft);border-radius:999px;font-size:12px;font-weight:800;line-height:1;background:var(--surface-card)}
      .hdrtk-i:hover{background:color-mix(in oklab,var(--surface-card) 92%, transparent)}

      .hdrtk-what{margin-top:2px;color:var(--muted);font-size:11.5px;display:-webkit-box;-webkit-line-clamp:${CFG.clampLines};-webkit-box-orient:vertical;overflow:hidden}
      .hdrtk-meta{white-space:nowrap;font-size:11.5px;color:var(--muted)}

      /* Popover (how+source) */
      .hdrtk-pop{position:fixed;z-index:80;min-width:260px;max-width:320px;padding:.75rem .85rem;border:1px solid var(--br-soft);border-radius:12px;background:var(--surface-card);color:var(--ink);box-shadow:0 12px 36px oklab(0% 0 0 /.22)}
      .hdrtk-pop[hidden]{display:none!important}
      .hdrtk-pop::after{content:"";position:absolute;width:0;height:0;border:6px solid transparent;border-bottom-color:var(--surface-card);top:-12px;left:24px;filter:drop-shadow(0 -1px 0 var(--br-soft))}
      .hdrtk-pop-how{font-size:12px;line-height:1.5;margin-bottom:.35rem}
      .hdrtk-pop-src{font-size:11px;color:var(--muted)}

      @media print{ .hdrtk-pop{display:none!important} }
    `;
    document.head.appendChild(EL('style', null, css));
  }

  // ---------------- Tone helpers (fallback) ----------------
  const normTone = t => (t||'').toString().toLowerCase();
  const toneForPct   = p => (p==null||isNaN(p)) ? 'neutral' : (p>0 ? 'green' : (p<0 ? 'red':'neutral'));
  function toneForFreshness(label){ if(!label) return 'neutral'; const s=String(label).toLowerCase(); if(s.includes('t-0')||s.includes('live')) return 'green'; if(s.includes('≤ t-1')||s.includes('t-1')) return 'yellow'; return 'red'; }
  function toneForScore(x){ if(x==null||isNaN(x)) return 'neutral'; if(x>=0.85) return 'green'; if(x>=0.70) return 'yellow'; return 'red'; }
  function toneForState(s){ if(!s) return 'neutral'; const u=String(s).toUpperCase(); if(u.includes('ACTIVE')) return 'green'; if(u.includes('REVIEW')) return 'yellow'; if(u.includes('HOLD')) return 'red'; return 'neutral'; }

  // ---------------- Glossario ----------------
  let GLOSS=null, LOADING=null;
  async function ensureGlossary(){
    if (GLOSS) return GLOSS;
    if (LOADING) return LOADING;
    LOADING = fetch('/report/assets/glossary.json',{cache:'no-store'})
      .then(r=> r.ok ? r.json() : {})
      .then(j=> (GLOSS=j||{}))
      .catch(()=> (GLOSS={}));
    return LOADING;
  }
  const G = key => (GLOSS?.[key] || GLOSS?.[`${key}_info`] || null);

  // ---------------- Popover (how+source) ----------------
  let popRef=null;
  function ensurePop(){
    if (popRef) return popRef;
    const p = EL('div','hdrtk-pop'); p.hidden=true;
    p.innerHTML=`<div class="hdrtk-pop-how"></div><div class="hdrtk-pop-src"></div>`;
    document.body.appendChild(p); popRef=p; return p;
  }
  function openPop(target, key){
    const pop = ensurePop(); const g = G(key) || {};
    QS('.hdrtk-pop-how', pop).textContent = g.how || '—';
    QS('.hdrtk-pop-src', pop).textContent = g.source ? `Fonte: ${g.source}` : '';
    const r = target.getBoundingClientRect(); const pad=10;
    pop.hidden=false;
    const w=pop.offsetWidth, h=pop.offsetHeight;
    let x=r.left, y=r.bottom+10;
    if (x+w+pad>innerWidth) x=innerWidth-w-pad;
    if (y+h+pad>innerHeight) y=r.top-10-h;
    pop.style.left=x+'px'; pop.style.top=y+'px';
  }
  document.addEventListener('click',(e)=>{
    if (!popRef || popRef.hidden) return;
    if (!e.target.closest('.hdrtk-pop') && !e.target.closest('.hdrtk-i')) popRef.hidden=true;
  },{capture:true});

  // ---------------- Lettura metrica + tono (dal JSON) ----------------
  function pickMetric(data, key, toneFallbackFn){
    let value = null, tone = null;
    const src = data?.[key];

    if (src != null && typeof src === 'object') {
      value = (src.raw ?? src.value ?? src.val ?? null);
      tone  = normTone(src.tone);
    } else {
      value = src;
      tone  = normTone(data?.[`${key}Tone`]);
    }

    if (!tone && typeof toneFallbackFn === 'function') {
      tone = normTone(toneFallbackFn(value));
    }
    if (!tone) tone = 'neutral';
    return { value, tone };
  }

  // ---------------- Markup ----------------
  function skeleton(){
    return `
      <div class="hdrtk-row1">
        <div class="hdrtk-left">
          <div class="flex items-baseline gap-2">
            <div class="hdrtk-ticker text-[clamp(18px,3.2vw,24px)] font-extrabold">—</div>
            <div class="hdrtk-venue">—</div>
          </div>
          <div class="hdrtk-company">—</div>
        </div>
        <div class="hdrtk-right">
          <div>
            <span class="hdrtk-price-val">—</span>
            <span class="hdrtk-delta" data-tone="neutral"><span class="hdrtk-caret">◼</span><span class="hdrtk-dval">—%</span></span>
            <span class="hdrtk-ccy">—</span>
          </div>
          <div class="hdrtk-legend">
            <span>Price <button class="hdrtk-i" data-info="Price" aria-label="Info">i</button></span><span class="sep">·</span>
            <span>ChangePct <button class="hdrtk-i" data-info="ChangePct" aria-label="Info">i</button></span><span class="sep">·</span>
            <span>Currency <button class="hdrtk-i" data-info="Currency" aria-label="Info">i</button></span>
          </div>
          <div class="hdrtk-what" data-what="Price"></div>
        </div>
      </div>

      <div class="hdrtk-row2">
        <div class="hdrtk-quals">
          ${pill('Freshness')}
          ${pill('ConfidenceFinal')}
          ${pill('DataIntegrity')}
          ${CFG.showFeedSyncPill ? pill('FeedSync') : ''}
          ${pill('State')}
        </div>
        <div class="hdrtk-meta">${CFG.metaRightEnabled ? '—' : ''}</div>
      </div>
    `;
  }
  function pill(id){
    return `
      <div class="hdrtk-qpill" data-id="${id}">
        <div class="hdrtk-pill" data-tone="neutral">—</div>
        <div class="hdrtk-caphead">${id} <button class="hdrtk-i" data-info="${id}" aria-label="Info">i</button></div>
        <div class="hdrtk-what" data-what="${id}"></div>
      </div>
    `;
  }

  // ---------------- Update ----------------
  async function update(root, data={}){
    injectCSS(); await ensureGlossary();

    // SX: identità
    QS('.hdrtk-ticker',  root).textContent = data.Ticker || '—';
    QS('.hdrtk-venue',   root).textContent = data.Venue ? `· ${data.Venue}` : '';
    QS('.hdrtk-company', root).textContent = data.CompanyName || '';

    // DX: Price / ChangePct (semaforo dal JSON o fallback)
    const price = (data.Price==null || isNaN(data.Price)) ? '—' : Number(data.Price).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
    QS('.hdrtk-price-val', root).textContent = price;
    QS('.hdrtk-ccy', root).textContent = data.Currency || '—';

    const { value: chg, tone: chgTone } = pickMetric(data, 'ChangePct', v => toneForPct(Number(v)));
    const dEl   = QS('.hdrtk-delta', root);
    dEl.setAttribute('data-tone', chgTone);
    QS('.hdrtk-dval', root).textContent = (chg==null||isNaN(chg)) ? '—%' : `${chg>0?'+':''}${Number(chg).toFixed(2)}%`;
    QS('.hdrtk-caret', root).textContent = (chg==null||isNaN(chg)) ? '◼' : (chg>0 ? '▲' : (chg<0 ? '▼' : '◼'));

    // Caption DX (Price area)
    setCaption(root, 'Price');

    // Pill qualità — tutte semaforiche da JSON (con fallback)
    applyQual(root, data, 'Freshness',       v => toneForFreshness(v));
    applyQual(root, data, 'ConfidenceFinal', v => toneForScore(Number(v)), true);
    applyQual(root, data, 'DataIntegrity',   v => toneForScore(Number(v)), true);
    if (CFG.showFeedSyncPill) applyQual(root, data, 'FeedSync', ()=>'neutral');
    applyQual(root, data, 'State',           v => toneForState(v));

    // Caption pill (mostra WHAT come richiesto)
    ['Freshness','ConfidenceFinal','DataIntegrity','FeedSync','State','ChangePct','Currency']
      .filter(k => k!=='FeedSync' || CFG.showFeedSyncPill)
      .forEach(k => setCaption(root, k));

    // Meta snapshot
    if (CFG.metaRightEnabled){
      const meta = QS('.hdrtk-meta', root);
      const start = data.Start ?? '—';
      const end   = data.End ?? '—';
      const upd   = data.UpdatedAt ? tryUTC(data.UpdatedAt) : '—';
      meta.textContent = `Snapshot ${start} → ${end} · Updated ${upd}`;
    }

    // Bind popover “i”
    QSA('.hdrtk-i', root).forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); openPop(btn, btn.getAttribute('data-info')); }, { passive:true });
    });
  }

  function tryUTC(str){ try{ return new Date(str).toISOString().slice(11,16)+' UTC'; }catch(e){ return String(str); } }

  function setCaption(root, key){
    const slot = QSA(`[data-what="${key}"]`, root)[0];
    if(!slot) return;
    const g = G(key) || {};
    const mode = CFG.captionMode;
    let txt = '—';
    if (mode==='what') txt = g.what || '—';
    else if (mode==='how') txt = g.how || g.what || '—';
    else txt = [g.what, g.how].filter(Boolean).join(' • ');
    slot.textContent = txt;
  }

  function applyQual(root, data, id, fallbackToneFn, isScore=false){
    const box = QSA('.hdrtk-qpill', root).find(x => x.getAttribute('data-id')===id);
    if (!box) return;

    const { value, tone } = pickMetric(data, id, fallbackToneFn);
    if (value==null || value==='') { box.style.display='none'; return; }

    const pill = box.querySelector('.hdrtk-pill');
    pill.setAttribute('data-tone', tone);
    pill.textContent = isScore && !isNaN(Number(value)) ? Number(value).toFixed(2) : String(value);
  }

  // ---------------- API ----------------
  function mount(slot){
    injectCSS();
    const host = (typeof slot==='string') ? QS(slot) : slot;
    if (!host) throw new Error('headerTicker.mount: invalid slot');
    const wrap = EL('div','header-ticker'); wrap.innerHTML = skeleton();
    host.innerHTML=''; host.appendChild(wrap);
    return wrap;
  }

  return { mount, update };
})();
