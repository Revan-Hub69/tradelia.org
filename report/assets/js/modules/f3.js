// /report/assets/js/modules/f3.js (v2025-11-01c)
//
// F3 · Analisi Tecnica MTF (3–10 giorni) — nessun valore hard-coded.
// Mantiene TUTTE le sezioni prestabilite + "Opzioni" con SCHEDE DINAMICHE,
// senza inventare contenuti: il layout rende esattamente ciò che arriva dal JSON.
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?) -> attach listeners
//
// Dipendenze globali attese:
//   window.__TradeliaUI.openPanel()
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons()

// -----------------------------------------------------------------------------
// RENDER CARD PRINCIPALE (HERO)
// -----------------------------------------------------------------------------
export function renderCard(rawData, ctx = {}){
  const d = normalizeDataF3Public(rawData);

  const kpis = [];
  if (d.head?.BiasMTF)   kpis.push({ key: "BiasMTF",   label: "Bias MTF",   desc: "", metric: d.head.BiasMTF });
  if (d.head?.MTF_Score) kpis.push({ key: "MTF_Score", label: "MTF Score",  desc: "", metric: d.head.MTF_Score });
  if (d.head?.P_SwingUp) kpis.push({ key: "P_SwingUp", label: "P(SwingUp)", desc: "", metric: d.head.P_SwingUp });
  if (d.options?.OptionsTone) kpis.push({ key:"OptionsTone", label:"Opzioni · Tono", desc:"", metric: d.options.OptionsTone });

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F3</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Analisi Tecnica MTF · 3–10 giorni</span>
            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
          </div>
          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Setup MTF & Segnali (overlay Opzioni informativo)
          </div>
          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || '')}<br/>
            <span class="text-[11px] text-[color:var(--muted)]">${escapeHtml(d.meta.hero_disclaimer || 'Materiale educativo/informativo. Nessuna raccomandazione personale.')}</span>
          </div>
        </div>
      </header>

      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <div class="grid gap-3 ${kpis.length>3 ? 'grid-cols-2 md:grid-cols-4':'grid-cols-2 md:grid-cols-3'}">
          ${kpis.map(k=>metricBoxTrafficLightF3(k)).join('')}
        </div>

        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer || '')}</p>
          <div class="flex lg:justify-end">
            <button class="f3-cta-btn" data-open-f3-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Dettagli setup →
            </button>
          </div>
        </div>
      </div>
    </section>`;
}

export function bindCard(node, rawData, ctx = {}){
  if(!node || !rawData) return;
  const data = normalizeDataF3Public(rawData);
  const btn = node.querySelector('[data-open-f3-details="true"]');
  if (btn) btn.addEventListener('click', ()=> openF3DrawerPublic(data));
  if (window.__TradeliaUI?.bindMetricInfoButtons){ try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(e){} }
}

// -----------------------------------------------------------------------------
// DRAWER (Sezioni prestabilite): Dataset · Setup · Segnali · Rischio/ATR · Opzioni · Governance
// -----------------------------------------------------------------------------
function openF3DrawerPublic(d){
  if(!window.__TradeliaUI?.openPanel) return;
  const sections = buildF3SectionsPublic(d);
  const mobile = isMobileViewport();
  const shell = mobile ? renderF3MobileShell(sections) : renderF3DesktopShell(sections);

  window.__TradeliaUI.openPanel({
    title: 'F3 · Analisi Tecnica MTF',
    subtitle: '',
    sections: [{ title:'', body:shell, meta:'' }],
    blocking: false,
    panelSize: mobile ? 'wide' : 'xl',
    footerButtons: mobile ? [] : [{ label:'Chiudi', action: ()=> window.__TradeliaUI.closePanel() }],
    footerTabs: []
  });

  function initScrollableTabsHint(){
    const scrollBox = document.querySelector('.f1b-footer-tabs-scroll');
    const fadeRight = document.querySelector('.f1b-tabs-fade-right');
    if(!scrollBox || !fadeRight) return;
    const needsScroll = scrollBox.scrollWidth > scrollBox.clientWidth + 2;
    if(!needsScroll){
      fadeRight.style.display = 'none';
      const fadeLeft = document.querySelector('.f1b-tabs-fade-left');
      if(fadeLeft) fadeLeft.style.display = 'none';
      return;
    }
    const hintEl = fadeRight.querySelector('.f1b-tabs-scroll-hint');
    function updateHint(){
      const atEnd = scrollBox.scrollLeft + scrollBox.clientWidth >= scrollBox.scrollWidth - 4;
      if(hintEl) hintEl.style.opacity = atEnd ? '0' : '.9';
      const fadeLeft = document.querySelector('.f1b-tabs-fade-left');
      if(fadeLeft) fadeLeft.style.opacity = scrollBox.scrollLeft > 2 ? '.6' : '0';
    }
    updateHint();
    scrollBox.addEventListener('scroll', ()=> updateHint(), { passive:true });
  }

  setTimeout(()=>{
    bindF3TabsPublic();
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f3-scroll-desktop')); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f3-scroll-mobile')); } catch(e){}
    }
    const first = document.querySelector('[data-f3-tab="dataset"]');
    if (first?.click) first.click();
    initScrollableTabsHint();
  },0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

// -----------------------------------------------------------------------------
// SEZIONI (tutte dinamiche, nessun campo inventato)
// -----------------------------------------------------------------------------
function buildF3SectionsPublic(d){
  // 1) DATASET
  const ds = d.dataset || {};
  const datasetHTML = `
    <section class="tl-panel-section" data-f3-section="dataset" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Dataset · Contesto</div></header>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4]">
        ${ds.SYMBOL ? metricBlockF3('SYMBOL_info','Ticker','', ds.SYMBOL) : ''}
        ${ds.TIMEFRAMES ? metricBlockF3('TIMEFRAMES_info','Timeframes','', ds.TIMEFRAMES) : ''}
        ${ds.UPDATED ? metricBlockF3('UPDATED_info','Aggiornamento','', ds.UPDATED) : ''}
      </div>
      ${listBlockCardF3('Fonti dati', ds.SOURCES)}
      ${listBlockCardF3('Note', ds.NOTES)}
    </section>`;

  // 2) SETUP (pattern, confluence, livelli) — tutti campi pass-through
  const stp = d.setup || {};
  const setupHTML = `
    <section class="tl-panel-section" data-f3-section="setup" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Setup · Pattern & Confluence</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${stp.PATTERNS   ? metricBlockF3('PATTERNS_info','Pattern rilevati','', stp.PATTERNS) : ''}
        ${stp.CONFLUENCE ? metricBlockF3('CONFLUENCE_info','Confluenze','', stp.CONFLUENCE) : ''}
        ${stp.MOMENTUM   ? metricBlockF3('MOMENTUM_info','Momentum MTF','', stp.MOMENTUM) : ''}
        ${stp.SR_ZONES   ? metricBlockF3('SR_ZONES_info','S/R Zones','', stp.SR_ZONES) : ''}
      </div>
      ${listBlockCardF3('Note interpretative', stp.ai_note)}
    </section>`;

  // 3) SEGNALI (entry/confirm/invalid/targets/window) — pass-through
  const sg = d.signals || {};
  const signalsHTML = `
    <section class="tl-panel-section" data-f3-section="signals" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Segnali (educational)</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${sg.ENTRY   ? metricBlockF3('ENTRY_info','Entry · livelli','', sg.ENTRY) : ''}
        ${sg.CONFIRM ? metricBlockF3('CONFIRM_info','Conferme','', sg.CONFIRM) : ''}
        ${sg.INVALID ? metricBlockF3('INVALID_info','Invalidazione','', sg.INVALID) : ''}
        ${sg.TARGETS ? metricBlockF3('TARGETS_info','Target/TP','', sg.TARGETS) : ''}
      </div>
      ${listBlockCardF3('Finestra temporale (3–10g)', sg.WINDOW)}
      ${listBlockCardF3('Note segnali', sg.ai_note)}
    </section>`;

  // 4) RISCHIO / ATR — pass-through (nessun sizing reale qui)
  const rk = d.risk_atr || {};
  const riskHTML = `
    <section class="tl-panel-section" data-f3-section="risk" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Gestione Rischio · ATR</div></header>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4]">
        ${rk.ATR_VALUE ? metricBlockF3('ATR_VALUE_info','ATR','', rk.ATR_VALUE) : ''}
        ${rk.RISK_UNIT ? metricBlockF3('RISK_UNIT_info','Risk Unit','', rk.RISK_UNIT) : ''}
        ${rk.STOP_RULE ? metricBlockF3('STOP_RULE_info','Stop · regola','', rk.STOP_RULE) : ''}
      </div>
      ${listBlockCardF3('Note rischio', rk.ai_note)}
    </section>`;

  // 5) OPZIONI —
  // Sezione a SCHEDE DINAMICHE: d.options.sheets = [{id,title,tone, blocks:[{id,title, metricObj}]}]
  const op = d.options || {};
  const optionsHTML = buildOptionsSectionF3(op);

  // 6) GOVERNANCE (Audit + MiFID) — identico pattern F2
  const gov = d.governance || {};
  const governanceHTML = `
    <section class="tl-panel-section" data-f3-section="governance" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Governance · Audit & MiFID</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${gov.QualityMetrics?.FreshnessScore ? qualityChipF3('FreshnessScore', gov.QualityMetrics.FreshnessScore) : ''}
        ${gov.QualityMetrics?.ConfidenceFinal ? qualityChipF3('ConfidenceFinal', gov.QualityMetrics.ConfidenceFinal) : ''}
        ${gov.QualityMetrics?.DataIntegrity ? qualityChipF3('DataIntegrity', gov.QualityMetrics.DataIntegrity) : ''}
        ${gov.QualityMetrics?.FeedSync ? qualityChipF3('FeedSync', gov.QualityMetrics.FeedSync) : ''}
      </div>
      ${headlineBlockCardF3('AuditPath', gov.AuditPathID)}
      ${headlineBlockCardF3('Informativa', gov.mifid?.disclaimer || d.meta?.mifid?.disclaimer)}
    </section>`;

  return { datasetHTML, setupHTML, signalsHTML, riskHTML, optionsHTML, governanceHTML };
}

// Opzioni → schede dinamiche
function buildOptionsSectionF3(op){
  const sheets = Array.isArray(op.sheets) ? op.sheets : [];
  if (!sheets.length) return `
    <section class="tl-panel-section" data-f3-section="options" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Opzioni · Overlay informativo</div></header>
      <div class="text-[12px] text-[color:var(--muted)]">Nessuna scheda disponibile.</div>
    </section>`;

  const tabs = sheets.map(s=>`<button class="f1b-footer-tab-btn" data-f3-opt-tab="${escapeAttr(s.id)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(s.title||s.id)}</button>`).join('');

  const views = sheets.map(s=>{
    const blocksHtml = (Array.isArray(s.blocks)?s.blocks:[]).map(b=>
      metricBlockF3(b.id || s.id, b.title || '', '', b.metric)
    ).join('');
    return `<div data-f3-opt-view="${escapeAttr(s.id)}" hidden>
      ${f3Card({ tone: s.tone, title: s.title||'', bodyHtml: `<div class='grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]'>${blocksHtml}</div>`, noteHtml: '' })}
    </div>`;
  }).join('');

  return `
    <section class="tl-panel-section" data-f3-section="options" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Opzioni · Overlay informativo</div></header>
      <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
        <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:2rem;">
          ${tabs}
        </div>
        <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%, rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);text-shadow:0 1px 2px rgba(0,0,0,.4);"><span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span></div>
      </div>
      <div class="mt-3">${views}</div>
    </section>`;
}

// -----------------------------------------------------------------------------
// SHELL DESKTOP / MOBILE + TABS
// -----------------------------------------------------------------------------
function renderF3DesktopShell(s){
  return `
    <div class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f1b-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
        ${drawerBtnF3('dataset','Dataset')}
        ${drawerBtnF3('setup','Setup')}
        ${drawerBtnF3('signals','Segnali')}
        ${drawerBtnF3('risk','Rischio/ATR')}
        ${drawerBtnF3('options','Opzioni')}
        ${drawerBtnF3('governance','Governance')}
      </aside>
      <main id="f3-scroll-desktop" class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f3-view="dataset">${s.datasetHTML}</div>
        <div data-f3-view="setup" hidden>${s.setupHTML}</div>
        <div data-f3-view="signals" hidden>${s.signalsHTML}</div>
        <div data-f3-view="risk" hidden>${s.riskHTML}</div>
        <div data-f3-view="options" hidden>${s.optionsHTML}</div>
        <div data-f3-view="governance" hidden>${s.governanceHTML}</div>
      </main>
    </div>`;
}

function renderF3MobileShell(s){
  const pills = [
    ['dataset','Dataset'],['setup','Setup'],['signals','Segnali'],['risk','Rischio/ATR'],['options','Opzioni'],['governance','Governance']
  ].map(([k,l])=>mobileTabBtnF3(k,l)).join('');
  const tabsBar = `
    <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
      <div class="f1b-tabs-fade-left" style="position:absolute;left:0;top:0;bottom:0;width:24px;pointer-events:none;background:linear-gradient(to right,var(--surface-panel-head) 0%, rgba(0,0,0,0) 80%);opacity:.6;"></div>
      <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:2rem;">${pills}</div>
      <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%, rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);text-shadow:0 1px 2px rgba(0,0,0,.4);"><span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span></div>
    </div>`;
  return `
    <div class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      ${tabsBar}
      <main id="f3-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f3-view="dataset">${s.datasetHTML}</div>
        <div data-f3-view="setup" hidden>${s.setupHTML}</div>
        <div data-f3-view="signals" hidden>${s.signalsHTML}</div>
        <div data-f3-view="risk" hidden>${s.riskHTML}</div>
        <div data-f3-view="options" hidden>${s.optionsHTML}</div>
        <div data-f3-view="governance" hidden>${s.governanceHTML}</div>
      </main>
    </div>`;
}

function drawerBtnF3(key,label){ return `<button class="f1b-tab-btn" data-f3-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`; }
function mobileTabBtnF3(key,label){ return `<button class="f1b-footer-tab-btn" data-f3-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`; }

function bindF3TabsPublic(){
  const btns = document.querySelectorAll('[data-f3-tab]');
  const views = document.querySelectorAll('[data-f3-view]');
  const desk = document.getElementById('f3-scroll-desktop');
  const mob  = document.getElementById('f3-scroll-mobile');
  const sidebar = document.querySelector('.f1b-panel-menu');

  function resetScroll(){ [desk,mob,sidebar].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; try{ el.scrollTo({top:0,left:0,behavior:'auto'});}catch(_){}}); }
  function styleTabs(active){
    btns.forEach(b=>{
      const on = b.getAttribute('data-f3-tab')===active;
      if (b.classList.contains('f1b-tab-btn')) b.classList.toggle('is-active', on);
      if (b.classList.contains('f1b-footer-tab-btn')){
        if(on){ b.style.fontWeight='600'; b.style.border='1px solid var(--ink)'; b.style.background='radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)'; b.style.color='var(--ink)'; b.style.boxShadow='0 4px 10px rgba(0,0,0,.18)'; }
        else { b.style.fontWeight='500'; b.style.border='1px solid var(--br-soft)'; b.style.background='var(--surface-card)'; b.style.color='var(--muted)'; b.style.boxShadow='var(--shadow-card)'; }
      }
    });
  }
  function show(active){
    views.forEach(v=>{ const k=v.getAttribute('data-f3-view'); const on=k===active; v.hidden=!on; if(on){ requestAnimationFrame(()=>{ resetScroll(); v.querySelectorAll('[data-scrollable]').forEach(sc=>{sc.scrollTop=0;sc.scrollLeft=0;}); }); }});
  }
  function activate(k){ styleTabs(k); show(k);} 
  btns.forEach(b=>{ if(b.__f3Bound) return; b.__f3Bound=true; b.addEventListener('click',()=> activate(b.getAttribute('data-f3-tab')) ); });

  // BIND per tabs interne Opzioni
  const optBtns = document.querySelectorAll('[data-f3-opt-tab]');
  const optViews = document.querySelectorAll('[data-f3-opt-view]');
  function styleOptTabs(active){ optBtns.forEach(b=>{ const on=b.getAttribute('data-f3-opt-tab')===active; b.style.fontWeight= on? '600':'500'; b.style.border= on? '1px solid var(--ink)':'1px solid var(--br-soft)'; b.style.background= on? 'radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)':'var(--surface-card)'; b.style.color= on? 'var(--ink)':'var(--muted)'; b.style.boxShadow= on? '0 4px 10px rgba(0,0,0,.18)':'var(--shadow-card)'; }); }
  function showOpt(active){ optViews.forEach(v=>{ const k=v.getAttribute('data-f3-opt-view'); v.hidden = (k!==active); }); }
  function activateOpt(k){ styleOptTabs(k); showOpt(k); }
  optBtns.forEach(b=>{ if(b.__f3OptBound) return; b.__f3OptBound=true; b.addEventListener('click',()=> activateOpt(b.getAttribute('data-f3-opt-tab')) ); });
  if (optBtns.length){ activateOpt(optBtns[0].getAttribute('data-f3-opt-tab')); }
}

// -----------------------------------------------------------------------------
// CARD BUILDERS & HELPERS (nessun contenuto inventato)
// -----------------------------------------------------------------------------
function f3Card({ tone, title, bodyHtml, noteHtml }){
  const { dotColor } = toneColorsF3(tone);
  return `
    <div class="mb-4 p-2" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
      ${title? `<div class='flex items-start gap-2 mb-1'><span class='inline-block w-[8px] h-[8px] rounded-full' style='background:${dotColor};'></span><div class='text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide'>${escapeHtml(title)}</div></div>`:''}
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">${bodyHtml||''}</div>
      ${ noteHtml ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>` : '' }
    </div>`;
}

function metricBoxTrafficLightF3({ key, label, desc, metric }){
  const { dotColor, textColor } = toneColorsF3(metric?.tone);
  return `
    <div class="flex-1 min-w-[90px]" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:0.6rem 0.75rem;">
      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};"></span>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">${escapeHtml(label)}</div>
        </div>
        <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
      </div>
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(metric?.raw || '—')}</div>
      ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc)}</div>` : ''}
    </div>`;
}

function metricBlockF3(metricKey, title, desc, metricObj){
  const { textColor } = toneColorsF3(metricObj?.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(formatMetricValue(metricObj))}</div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc)}</div>` : ''}
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(metricObj?.ai_note || '')}</div>`;
  return f3Card({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}

function qualityChipF3(key, q){
  if (!q) return '';
  const { textColor } = toneColorsF3(q.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(q.raw || '—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(q.ai_note || '')}</div>`;
  return f3Card({ tone: q.tone, title: key || '', bodyHtml, noteHtml: '' });
}

function listBlockCardF3(title, body){
  if (body===undefined || body===null || body==='') return '';
  let tone='neutral', raw='';
  if (Array.isArray(body)) raw = body.map(x=>`• ${String(x)}`).join('\n');
  else if (typeof body==='object') { tone = body.tone||'neutral'; raw = body.raw||''; }
  else raw = String(body);
  return f3Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function headlineBlockCardF3(title, obj){
  if (obj===undefined || obj===null) return '';
  let tone='neutral', raw='';
  if (typeof obj==='string') raw=obj; else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
  return f3Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function toneColorsF3(tone){
  switch((tone||'').toLowerCase()){
    case 'green': return { dotColor:'var(--tone-pos-fg)', textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red': return { dotColor:'var(--tone-neg-fg)', textColor:'var(--tone-neg-fg)' };
    default: return { dotColor:'var(--tone-neu-fg)', textColor:'var(--tone-neu-fg)' };
  }
}

// -----------------------------------------------------------------------------
// NORMALIZZAZIONE (pass-through; nessuna metrica inventata)
// -----------------------------------------------------------------------------
function normalizeDataF3Public(src={}){
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? '—',
      module: src?.meta?.module ?? 'F3 · Analisi Tecnica MTF',
      moduleVersion: src?.meta?.moduleVersion ?? 'vX',
      moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
      freshness: src?.meta?.freshness ?? '≤ T-1',
      hero_intro: src?.meta?.hero_intro ?? '',
      hero_disclaimer: src?.meta?.hero_disclaimer ?? 'Contenuto informativo/formativo. Nessuna istruzione operativa.'
    },
    head: src?.head || {},              // Bias, Score, Prob
    dataset: src?.dataset || {},        // SYMBOL, TIMEFRAMES, UPDATED, SOURCES, NOTES
    setup: src?.setup || {},            // PATTERNS, CONFLUENCE, MOMENTUM, SR_ZONES, ai_note
    signals: src?.signals || {},        // ENTRY, CONFIRM, INVALID, TARGETS, WINDOW, ai_note
    risk_atr: src?.risk_atr || {},      // ATR_VALUE, RISK_UNIT, STOP_RULE, ai_note
    options: src?.options || {},        // OptionsTone, sheets[] (dinamiche)
    governance: (function(){
      const g = src?.governance || {};
      const qm = g.QualityMetrics || {};
      if(qm.Coverage && !qm.FreshnessScore){ qm.FreshnessScore = qm.Coverage; }
      return { ...g, QualityMetrics: qm };
    })()
  };
}

// -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function formatMetricValue(obj){ const v=obj?.raw; if(v===null||v===undefined) return '—'; if(Array.isArray(v)){ const s=JSON.stringify(v); return escapeHtml(s.length>80? s.slice(0,80)+'…': s); } if(typeof v==='object'){ const keys=Object.keys(v); if(keys.length===0) return '{}'; const compact=keys.slice(0,5).reduce((acc,k)=>{acc[k]=v[k];return acc;},{}); const s=JSON.stringify(compact); return escapeHtml(s.length>100? s.slice(0,100)+'…': s);} return escapeHtml(String(v)); }
