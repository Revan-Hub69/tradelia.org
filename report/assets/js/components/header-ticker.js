// /report/assets/js/components/header-ticker-edu.js
// Header Ticker · Educational v1 (responsive)
// - Semaforo da JSON (tone da campo .tone o fallback logico)
// - WHAT sotto ogni metrica (dal glossario JSON)
// - HOW + SOURCE su click "?" (popover desktop / bottom-sheet mobile)
// - Bottone "💡 Spiega i dati" → drawer educativo (usa __TradeliaUI se presente; altrimenti fallback integrato)

export const headerTicker = (() => {

  // ---------------- Helpers ----------------
  const QS  = (s, r=document) => r.querySelector(s);
  const QSA = (s, r=document) => [...r.querySelectorAll(s)];
  const EL  = (t, cls, html) => { const e=document.createElement(t); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; };
  const isMobile = () => matchMedia('(max-width: 768px)').matches;
  const normTone = t => (t||'').toString().toLowerCase();

  // ---------------- Config ----------------
  const CFG = {
    captionMode: 'what',   // 'what' | 'how' | 'what+how'
    clampLines:  2,
    showFeedSyncPill: false,
    metaRightEnabled: true,
    glossaryPath: '/report/assets/glossary.json'
  };

  // ---------------- CSS (iniezione una tantum) ----------------
  let CSS_INJECTED = false;
  function injectCSS(){
    if (CSS_INJECTED) return; CSS_INJECTED = true;
    const css = `
:root[data-theme="dark"]{
  --hdrtk-pill-bg: oklab(96% 0 0);
  --hdrtk-pill-br: oklab(82% 0 0);
  --tone-g-ink: oklab(38% -0.08 0.12);
  --tone-y-ink: oklab(36%  0.03 0.09);
  --tone-r-ink: oklab(34%  0.12 0.08);
}
:root[data-theme="light"]{
  --hdrtk-pill-bg: var(--surface-card);
  --hdrtk-pill-br: var(--br-soft);
  --tone-g-ink: oklab(38% -0.08 0.12);
  --tone-y-ink: oklab(36%  0.03 0.09);
  --tone-r-ink: oklab(34%  0.12 0.08);
}

/* Header Ticker */
.header-ticker{padding-block:.9rem}
.hdrtk-row1{display:flex;align-items:flex-start;justify-content:space-between;gap:1.25rem}
.hdrtk-left{min-width:0}
.hdrtk-ticker{letter-spacing:-.015em}
.hdrtk-venue{white-space:nowrap;color:var(--muted);font-size:12px}
.hdrtk-company{color:var(--ink-soft);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52ch;margin-top:2px}

.hdrtk-right{display:flex;flex-direction:column;align-items:flex-end;gap:.2rem}
.hdrtk-price-val{font-weight:800;line-height:1;font-size:clamp(24px,3.9vw,34px)}
.hdrtk-ccy{font-size:12px;font-weight:600;margin-left:.5rem}
.hdrtk-delta{display:inline-flex;align-items:center;gap:.35rem;padding:.32rem .6rem;border-radius:999px;border:1px solid var(--hdrtk-pill-br);font-size:12px;font-weight:700;line-height:1;margin-left:.5rem}
.hdrtk-delta[data-tone="green"]{color:var(--tone-g-ink);background:color-mix(in oklab,var(--hdrtk-pill-bg) 90%, oklab(91% -0.02 0.06))}
.hdrtk-delta[data-tone="yellow"]{color:var(--tone-y-ink);background:color-mix(in oklab,var(--hdrtk-pill-bg) 90%, oklab(95% 0.02 0.10))}
.hdrtk-delta[data-tone="red"]{color:var(--tone-r-ink);background:color-mix(in oklab,var(--hdrtk-pill-bg) 90%, oklab(90% 0.12 0.08))}
.hdrtk-caret{display:inline-block;transform:translateY(-1px);opacity:.9}

.hdrtk-edu-btn{margin-top:.35rem}
.hdrtk-edu-btn .btn{font-size:12px;padding:.34rem .62rem;border-radius:999px;border:1px solid var(--hdrtk-pill-br);background:var(--hdrtk-pill-bg)}

.hdrtk-what{margin-top:.20rem;color:var(--muted);font-size:11.5px;-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}
.hdrtk-row2{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-top:.9rem}
.hdrtk-quals{display:flex;gap:1rem;overflow-x:auto}
.hdrtk-qpill{min-width:140px}
.hdrtk-pill{display:inline-flex;align-items:center;gap:.4rem;padding:.34rem .62rem;border-radius:999px;border:1px solid var(--hdrtk-pill-br);font-size:12px;font-weight:700;line-height:1;background:var(--hdrtk-pill-bg)}
.hdrtk-pill[data-tone="green"]{color:var(--tone-g-ink);background:color-mix(in oklab,var(--hdrtk-pill-bg) 90%, oklab(91% -0.02 0.06))}
.hdrtk-pill[data-tone="yellow"]{color:var(--tone-y-ink);background:color-mix(in oklab,var(--hdrtk-pill-bg) 90%, oklab(95% 0.02 0.10))}
.hdrtk-pill[data-tone="red"]{color:var(--tone-r-ink);background:color-mix(in oklab,var(--hdrtk-pill-bg) 90%, oklab(90% 0.12 0.08))}
.hdrtk-pill[data-tone="neutral"]{}
.hdrtk-caphead{display:none}
.hdrtk-meta{white-space:nowrap;font-size:11.5px;color:var(--muted)}

/* Info "?" badge */
.hdrtk-i{display:inline-grid;place-items:center;width:18px;height:18px;border:1px solid var(--hdrtk-pill-br);border-radius:999px;font-size:12px;font-weight:800;line-height:1;background:var(--hdrtk-pill-bg)}
.hdrtk-i:hover{background:color-mix(in oklab,var(--hdrtk-pill-bg) 92%, transparent)}

/* Popover desktop */
.hdrtk-pop{position:fixed;z-index:80;min-width:260px;max-width:340px;padding:.75rem .85rem;border:1px solid var(--hdrtk-pill-br);border-radius:12px;background:var(--surface-card);color:var(--ink);box-shadow:0 12px 36px oklab(0% 0 0 /.22)}
.hdrtk-pop[hidden]{display:none!important}
.hdrtk-pop-title{font-weight:700;font-size:13px;margin-bottom:.25rem}
.hdrtk-pop-how{font-size:12px;line-height:1.5;margin-bottom:.35rem;color:var(--ink-soft)}
.hdrtk-pop-src{font-size:11px;color:var(--muted)}
@media print{ .hdrtk-pop{display:none!important} }

/* Fallback drawer (desktop side / mobile bottom) */
.hdrtk-ol[aria-hidden="true"]{display:none}
.hdrtk-ol{position:fixed;inset:0;z-index:70}
.hdrtk-ol-back{position:absolute;inset:0;background:oklab(0% 0 0 /.45);backdrop-filter:blur(2px)}
.hdrtk-ol-panel{position:absolute;display:flex;flex-direction:column;background:var(--surface-card);border:1px solid var(--hdrtk-pill-br);box-shadow:0 12px 36px oklab(0% 0 0 /.24)}
@media (min-width:769px){
  .hdrtk-ol-panel{top:0;right:0;bottom:0;width:min(840px,100%);border-radius:16px 0 0 16px}
}
@media (max-width:768px){
  .hdrtk-ol-panel{left:0;right:0;bottom:0;height:92vh;border-radius:16px 16px 0 0}
}
.hdrtk-ol-head{display:flex;justify-content:space-between;gap:.75rem;padding:1rem;border-bottom:1px solid var(--hdrtk-pill-br)}
.hdrtk-ol-title{font-weight:700}
.hdrtk-ol-body{padding:1rem;overflow:auto;flex:1}
.hdrtk-ol-foot{padding:1rem;border-top:1px solid var(--hdrtk-pill-br);display:flex;justify-content:flex-end}
.hdrtk-ol-close{border:1px solid var(--hdrtk-pill-br);border-radius:999px;padding:.4rem .7rem;font-size:12px;background:var(--hdrtk-pill-bg)}
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

  // ---------------- Fallback drawer (se non c’è __TradeliaUI) ----------------
  function openLocalDrawer(html, {title='Approfondisci', subtitle=''}={}){
    let ol = QS('#hdrtk-ol');
    if (!ol){
      ol = EL('div','hdrtk-ol'); ol.id='hdrtk-ol'; ol.setAttribute('aria-hidden','true');
      const back = EL('div','hdrtk-ol-back'); back.setAttribute('data-close','');
      const panel= EL('div','hdrtk-ol-panel');
      const head = EL('div','hdrtk-ol-head');
      const hwrap= EL('div', 'min-w-0');
      const h1   = EL('div', 'hdrtk-ol-title'); h1.id='hdrtk-ol-title';
      const h2   = EL('div', 'text-muted'); h2.id='hdrtk-ol-sub';
      hwrap.append(h1,h2);
      const xbtn = EL('button','hdrtk-ol-close','Chiudi'); xbtn.setAttribute('data-close','');
      head.append(hwrap, xbtn);
      const body = EL('div','hdrtk-ol-body'); body.id='hdrtk-ol-body';
      const foot = EL('div','hdrtk-ol-foot'); foot.append(EL('button','hdrtk-ol-close','Fine')); foot.lastChild.setAttribute('data-close','');
      panel.append(head, body, foot);
      ol.append(back, panel);
      document.body.appendChild(ol);
      ol.addEventListener('click', e=>{ if (e.target.hasAttribute('data-close') || e.target===back) closeLocalDrawer(); });
      window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLocalDrawer(); });
    }
    QS('#hdrtk-ol-title', ol).textContent = title;
    QS('#hdrtk-ol-sub',   ol).textContent = subtitle || '';
    QS('#hdrtk-ol-body',  ol).innerHTML   = html;
    ol.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeLocalDrawer(){
    const ol = QS('#hdrtk-ol'); if(!ol) return;
    ol.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }

  // ---------------- Popover desktop ----------------
  let popRef=null;
  function ensurePop(){
    if (popRef) return popRef;
    const p = EL('div','hdrtk-pop'); p.hidden=true;
    p.innerHTML = `<div class="hdrtk-pop-title"></div><div class="hdrtk-pop-how"></div><div class="hdrtk-pop-src"></div>`;
    document.body.appendChild(p); popRef=p; return p;
  }
  function openPop(target, key){
    const pop = ensurePop(); const g = G(key) || {};
    QS('.hdrtk-pop-title', pop).textContent = g.title || key || '—';
    QS('.hdrtk-pop-how',   pop).textContent = g.how || '—';
    QS('.hdrtk-pop-src',   pop).textContent = g.source ? `Fonte: ${g.source}` : '';
    const r = target.getBoundingClientRect(); const pad=10;
    pop.hidden=false;
    const w=pop.offsetWidth, h=pop.offsetHeight; let x=r.left, y=r.bottom+10;
    if (x+w+pad>innerWidth) x=innerWidth-w-pad;
    if (y+h+pad>innerHeight) y=r.top-10-h;
    pop.style.left=x+'px'; pop.style.top=y+'px';
  }
  document.addEventListener('click',(e)=>{
    if (!popRef || popRef.hidden) return;
    if (!e.target.closest('.hdrtk-pop') && !e.target.closest('.hdrtk-i')) popRef.hidden=true;
  },{capture:true});

  // ---------------- Tones fallback ----------------
  const toneForPct = p => (p==null||isNaN(p)) ? 'neutral' : (p>0 ? 'green' : (p<0 ? 'red':'neutral'));
  function toneForFreshness(label){ if(!label) return 'neutral'; const s=String(label).toLowerCase(); if(s.includes('t-0')||s.includes('live')) return 'green'; if(s.includes('≤ t-1')||s.includes('t-1')) return 'yellow'; return 'red'; }
  function toneForScore(x){ if(x==null||isNaN(x)) return 'neutral'; if(x>=0.85) return 'green'; if(x>=0.70) return 'yellow'; return 'red'; }
  function toneForState(s){ if(!s) return 'neutral'; const u=String(s).toUpperCase(); if(u.includes('ACTIVE')) return 'green'; if(u.includes('REVIEW')) return 'yellow'; if(u.includes('HOLD')) return 'red'; return 'neutral'; }

  // ---------------- Lettura metrica + tono ----------------
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
    if (!tone && typeof toneFallbackFn === 'function') tone = normTone(toneFallbackFn(value));
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
          <div class="hdrtk-edu-btn"><button class="btn" type="button" data-edu="open">💡 Spiega i dati</button></div>
          <div class="hdrtk-what" data-what="Price"></div>
          <div class="hdrtk-what" data-what="ChangePct"></div>
          <div class="hdrtk-what" data-what="Currency"></div>
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
  async function update(root, raw={}){
    injectCSS(); await ensureGlossary();

    // Alias FreshnessLabel → Freshness
    const data = { ...raw, Freshness: raw.Freshness ?? raw.FreshnessLabel ?? raw.Freshness_label };

    // Identità
    QS('.hdrtk-ticker',  root).textContent = data.Ticker || '—';
    QS('.hdrtk-venue',   root).textContent = data.Venue ? `· ${data.Venue}` : '';
    QS('.hdrtk-company', root).textContent = data.CompanyName || '';

    // Prezzo / Δ% (tone dal JSON o fallback)
    const price = (data.Price==null || isNaN(data.Price)) ? '—'
                  : Number(data.Price).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
    QS('.hdrtk-price-val', root).textContent = price;
    QS('.hdrtk-ccy', root).textContent = data.Currency || '—';

    const { value: chg, tone: chgTone } = pickMetric(data, 'ChangePct', v => toneForPct(Number(v)));
    const dEl = QS('.hdrtk-delta', root);
    dEl.setAttribute('data-tone', chgTone);
    QS('.hdrtk-dval', root).textContent = (chg==null||isNaN(chg)) ? '—%' : `${chg>0?'+':''}${Number(chg).toFixed(2)}%`;
    QS('.hdrtk-caret', root).textContent = (chg==null||isNaN(chg)) ? '◼' : (chg>0 ? '▲' : (chg<0 ? '▼' : '◼'));

    // WHAT sotto le metriche chiave
    ['Price','ChangePct','Currency'].forEach(k => setCaption(root, k));

    // Pill qualità (tutte semaforiche)
    applyQual(root, data, 'Freshness',       v => toneForFreshness(v));
    applyQual(root, data, 'ConfidenceFinal', v => toneForScore(Number(v)), true);
    applyQual(root, data, 'DataIntegrity',   v => toneForScore(Number(v)), true);
    if (CFG.showFeedSyncPill) applyQual(root, data, 'FeedSync', ()=>'neutral');
    applyQual(root, data, 'State',           v => toneForState(v));

    // WHAT delle pill
    ['Freshness','ConfidenceFinal','DataIntegrity','FeedSync','State']
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

    // Bind "?" per HOW/SOURCE (popover desktop)
    QSA('.hdrtk-i', root).forEach(btn=>{
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); openPop(btn, btn.getAttribute('data-info')); }, { passive:true });
    });

    // Bottone educativo globale
    QS('[data-edu="open"]', root)?.addEventListener('click', async ()=>{
      const html = await buildEducationHTML(data);
      // Usa UI globale se esiste, altrimenti fallback locale
      if (window.__TradeliaUI?.openPanel){
        window.__TradeliaUI.openPanel({
          title: 'Spiega i dati dell’header',
          subtitle: `${data.Ticker || ''} ${data.Venue ? '· '+data.Venue : ''}`,
          body: html,
          panelSize: 'wide',
          blocking: true
        });
      } else {
        openLocalDrawer(html, { title: 'Spiega i dati dell’header', subtitle: `${data.Ticker || ''} ${data.Venue ? '· '+data.Venue : ''}` });
      }
    }, { passive:true });
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

  // ---------------- Educational drawer content ----------------
  async function buildEducationHTML(data){
    await ensureGlossary();
    const blocks = [
      ['Price','ChangePct','Currency'],
      ['Freshness','ConfidenceFinal','DataIntegrity', ...(CFG.showFeedSyncPill?['FeedSync']:[]), 'State']
    ];
    const mkRow = (key) => {
      const g = G(key) || {};
      const title = g.title || key;
      const what  = g.what  || '—';
      const how   = g.how   || '—';
      const src   = g.source? `Fonte: ${g.source}` : '';
      return `
        <div class="card" style="margin-bottom:0.75rem;">
          <div style="display:flex;justify-content:space-between;gap:.75rem;align-items:flex-start;">
            <div class="section-title" style="font-size:14px;">${title}</div>
            <button class="hdrtk-i" data-info="${key}" aria-label="Info">i</button>
          </div>
          <div class="text-muted" style="font-size:13px;margin-top:.35rem;">${what}</div>
          <div style="font-size:12px;margin-top:.5rem;">${how}</div>
          <div class="text-muted" style="font-size:11px;margin-top:.35rem;">${src}</div>
        </div>`;
    };
    return `
      <div class="grid" style="display:grid;gap:1rem;">
        <div>
          <h3 style="margin:0 0 .35rem 0;font-size:15px;">KPI principali</h3>
          ${blocks[0].map(mkRow).join('')}
        </div>
        <div>
          <h3 style="margin:0 0 .35rem 0;font-size:15px;">Qualità & Stato</h3>
          ${blocks[1].map(mkRow).join('')}
        </div>
      </div>`;
  }

  // ---------------- API ----------------
  function mount(slot){
    injectCSS();
    const host = (typeof slot==='string') ? QS(slot) : slot;
    if (!host) throw new Error('headerTickerEdu.mount: invalid slot');
    const wrap = EL('div','header-ticker'); wrap.innerHTML = skeleton();
    host.innerHTML=''; host.appendChild(wrap);
    return wrap;
  }

  return { mount, update };
})();
