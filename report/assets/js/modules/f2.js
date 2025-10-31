// /report/assets/js/modules/f2.js
//
// F2 · Macro & Sentiment Overlay (3–10 giorni)
// Allineato al design F1B (stesse classi, stesso card system)
//
// Scopo (UI/utente)
// - Lettura sintetica di: MacroGate (WebProbe), SCI (ticker‑level), DPI descrittivo (solo fondamentali),
//   Fundamentals (snapshot & trend), ICR (peers/ETF), ETF & Positioning (combinati), Newsflow, Survey,
//   Conclusione (educational), Governance (Audit + MiFID)
// - Nessun output hard‑coded: tutto dinamico da rawData JSON, incluse descrizioni tooltip ("?") tramite ID
// - Niente dinamica prezzo/volumi (migrata in F3). Niente opzioni/derivati (IV/PutCall) in F2.
// - Target retail base/intermedio/avanzato ⇒ linguaggio semplice, card a colore per tono.
//
// Export
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?)
//
// Dipendenze globali attese
//   window.__TradeliaUI.openPanel()
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons()

export function renderCard(rawData, ctx = {}){
  const d = normalizeDataF2Public(rawData);

  // KPI HERO (leggibili)
  const kpis = [
    { key:"MacroGate", label:"MacroGate", desc:"", metric: d.step1?.MacroGate },
    { key:"SentimentComposite", label:"Sentiment", desc:"", metric: d.sentiment_flows?.SentimentComposite },
    { key:"ETF_FlowTone", label:"ETF Flussi", desc:"", metric: d.sentiment_flows?.ETF_FlowTone }
  ];

  const { toneLabel, toneColor } = toneFromMacroGate(d.step1?.MacroGate);

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEAD -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F2</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Macro & Sentiment · 3–10 giorni</span>
            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Sentiment & overlay fondamentali (ticker‑level)
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || 'Contesto sintetico non operativo su sentiment, fondamentali descrittivi e newsflow.')}<br/>
            <span class="text-[11px] text-[color:var(--muted)]">Materiale educativo/informativo. Nessuna raccomandazione personale.</span>
          </div>
        </div>
      </header>

      <!-- CARD PRINCIPALE -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <!-- MacroGate (pill tono) -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
            <span>MacroGate</span>
            <button class="info-btn align-middle" data-metric="MacroGate_info" aria-label="Info MacroGate">?</button>
          </div>
          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(d.step1?.MacroGate?.raw || '—')}</span>
            <span class="px-[6px] py-[4px] rounded-md text-[11px] font-semibold leading-none border"
              style="background:radial-gradient(circle at 0% 0%, color-mix(in oklab, ${toneColor} 18%, transparent) 0%, transparent 60%), var(--surface-card);color:${toneColor};border-color:${toneColor};box-shadow:var(--shadow-card);">
              ${escapeHtml(toneLabel)}
            </span>
          </div>
          <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(d.step1?.ai_note || '')}</div>
        </div>

        <!-- KPI semaforiche -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
          ${kpis.map(k=>metricBoxTrafficLightF2(k)).join('')}
        </div>

        <!-- DISCLAIMER + CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer || '')}</p>
          <div class="flex lg:justify-end">
            <button class="f2-cta-btn" data-open-f2-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Dettagli sentiment →
            </button>
          </div>
        </div>
      </div>
    </section>`;
}

export function bindCard(node, rawData, ctx = {}){
  if(!node || !rawData) return;
  const data = normalizeDataF2Public(rawData);

  const btn = node.querySelector('[data-open-f2-details="true"]');
  if (btn) btn.addEventListener('click', ()=> openF2DrawerPublic(data));

  if (window.__TradeliaUI?.bindMetricInfoButtons){
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(e){}
  }
}

/* -----------------------------------------------------------------------------
// DRAWER (8 sezioni + Conclusione + Governance)
// -----------------------------------------------------------------------------*/
function openF2DrawerPublic(d){
  if(!window.__TradeliaUI?.openPanel) return;
  const sections = buildF2SectionsPublic(d);
  const mobile = isMobileViewport();
  const shell = mobile ? renderF2MobileShell(sections) : renderF2DesktopShell(sections);

  window.__TradeliaUI.openPanel({
    title: 'F2 · Macro & Sentiment',
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
    bindF2TabsPublic();
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f2-scroll-desktop')); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f2-scroll-mobile')); } catch(e){}
    }
    const first = document.querySelector('[data-f2-tab="macro"]');
    if (first?.click) first.click();
    initScrollableTabsHint();
  },0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

/* -----------------------------------------------------------------------------
// SEZIONI
// -----------------------------------------------------------------------------*/
function buildF2SectionsPublic(d){
  // 1) Controlli rischio — WebProbe (72h)
  const macroHTML = `
  <section class="tl-panel-section" data-f2-section="macro" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
    <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Controlli rischio (ultime 72h)</div></header>
    ${metricBlockF2('MacroGate_info','MacroGate','', d.step1?.MacroGate)}
    ${listBlockCardF2('Note di controllo', d.step1?.MacroNotes)}
    ${listBlockCardF2('Eventi macro (watchlist 10g)', d.step1?.MacroEvents)}
    ${listBlockCardF2('Eventi aziendali (≤10g)', d.step1?.CorpEvents)}
    ${headlineBlockCardF2('Policy Finestra 3–10g',{tone:'neutral',raw:'PASS: pipeline completa. REVIEW: pipeline con confidenza ridotta e monitoraggio T/T+2. FAIL: interruzione F2 (HOLD).'})}
  </section>`;

  // 2) SCI · Sentiment sintetico (ticker‑level)
  const sci = d.sci_dpi || {};
  const sciHTML = `
    <section class="tl-panel-section" data-f2-section="sci" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">SCI · Sentiment sintetico</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('TECH_SIGNAL_info','Tecnico (Barchart)','', sci?.TECH_SIGNAL)}
        ${metricBlockF2('NEWS_TONE_info','News · Tono','', sci?.NEWS_TONE)}
        ${metricBlockF2('CONSENSUS_LEVEL_info','Analyst · Consenso','', sci?.CONSENSUS_LEVEL)}
        ${metricBlockF2('CONSISTENCY_info','Analyst · Stabilità','', sci?.CONSISTENCY)}
      </div>
    </section>`;

  // 3) DPI · Contesto descrittivo (solo fondamentali)
  const dpi = d.dpi || {};
  const dpiHTML = `
    <section class="tl-panel-section" data-f2-section="dpi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">DPI · Contesto descrittivo (fundamentals)</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('PERF_VECTOR_info','Perf. vector (descrittivo)','', dpi?.PERF_VECTOR)}
        ${metricBlockF2('VALUATION_SNAPSHOT_info','Valuation snapshot','', dpi?.VALUATION_SNAPSHOT)}
        ${metricBlockF2('MARGINS_SNAPSHOT_info','Margins snapshot','', dpi?.MARGINS_SNAPSHOT)}
        ${metricBlockF2('PRICE_TREND_info','Price trend (descrittivo)','', dpi?.PRICE_TREND)}
        ${metricBlockF2('MARGIN_HEALTH_info','Margin health','', dpi?.MARGIN_HEALTH)}
        ${metricBlockF2('PROFITABILITY_CLASS_info','Profitability class','', dpi?.PROFITABILITY_CLASS)}
        ${metricBlockF2('EARNINGS_TREND_info','Earnings trend','', dpi?.EARNINGS_TREND)}
        ${metricBlockF2('BALANCE_SHEET_STRENGTH_info','Balance‑sheet strength','', dpi?.BALANCE_SHEET_STRENGTH)}
        ${metricBlockF2('CASHFLOW_MOMENTUM_info','Cash‑flow momentum','', dpi?.CASHFLOW_MOMENTUM)}
      </div>
    </section>`;

  // 4) Fundamentals (Snapshot & Trend)
  const fundamentalsHTML = buildFundamentalsSection(d);

  // 5) ICR · Peers & ETF Overlay
  const icr = d.icr || {};
  const icrHTML = `
    <section class="tl-panel-section" data-f2-section="icr" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">ICR · Peers & ETF Overlay</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('PEER_LIST_info','Peer list','', icr?.PEER_LIST)}
        ${metricBlockF2('ETF_LIST_info','ETF list','', icr?.ETF_LIST)}
        ${metricBlockF2('PEER_LEADERS_info','Peer leaders','', icr?.PEER_LEADERS)}
        ${metricBlockF2('PEER_LAGGARDS_info','Peer laggards','', icr?.PEER_LAGGARDS)}
        ${metricBlockF2('SECTOR_BREADTH_info','Sector breadth','', icr?.SECTOR_BREADTH)}
        ${metricBlockF2('ETF_FLOW_BIAS_info','ETF flow bias','', icr?.ETF_FLOW_BIAS)}
      </div>
    </section>`;

  // 6) ETF & Positioning (combinati)
  const etf = d.etf_exposure || {};
  const pos = d.positioning || {};
  const etfCards = etfCardListF2(etf?.Top10);
  const etfPosHTML = `
    <section class="tl-panel-section" data-f2-section="etfpos" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">ETF & Positioning</div></header>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4] mb-2">
        ${metricBlockF2('ETF_FLOW_BIAS_info','Bias flussi (1M)','', etf?.ETF_FLOW_BIAS)}
        ${metricBlockF2('SECTOR_BREADTH_info','Breadth settore/peers','', etf?.SECTOR_BREADTH)}
        ${metricBlockF2('TOP_HOLDING_ETF_info','Top holding ETF','', etf?.TOP_HOLDING_ETF)}
      </div>
      ${etfCards}
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mt-2">
        ${metricBlockF2('SI_LEVEL_info','Short Float','', pos?.SI_LEVEL)}
        ${metricBlockF2('DTC_BUCKET_info','Days to Cover','', pos?.DTC_BUCKET)}
        ${metricBlockF2('SI_TREND_info','Trend short','', pos?.SI_TREND)}
        ${metricBlockF2('INST_FLOW_info','Istituzionali','', pos?.INST_FLOW)}
        ${metricBlockF2('INSIDER_FLOW_info','Insider','', pos?.INSIDER_FLOW)}
      </div>
      ${listBlockCardF2('Osservazioni positioning', pos?.ai_note)}
      ${listBlockCardF2('Sintesi ETF (max 10)', etf?.ai_note)}
    </section>`;

  // 7) Newsflow — card compatte
  const news = d.newsflow || {};
  const newsCards = newsCardListF2(news?.Top10, news?.Summary);
  const newsHTML = `
    <section class="tl-panel-section" data-f2-section="news" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Newsflow · ultime 24–48h</div></header>
      ${newsCards}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">Le etichette sono descrittive (positive/negative/neutral). Card compatte per massima leggibilità su mobile.</div>
    </section>`;

  // 8) Survey (prima della conclusione)
  const surv = d.surveys || {};
  const surveysHTML = `
    <section class="tl-panel-section" data-f2-section="surveys" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Survey · retail/pro</div></header>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('AAII_info','AAII Bulls‑Bears','', surv?.AAII)}
        ${metricBlockF2('NAAIM_info','NAAIM Exposure','', surv?.NAAIM)}
        ${metricBlockF2('FearGreed_info','Fear & Greed','', surv?.FearGreed)}
      </div>
      ${listBlockCardF2('Note survey', surv?.ai_note)}
    </section>`;

  // 9) Conclusione · Tradelia AI (educational)
  const s = d.sintesi_ai || {};
  const points = Array.isArray(s.points) ? s.points.map(p=>conclusionPointBlockF2(p)).join('') : '';
  const sintesiHTML = `
    <section class="tl-panel-section" data-f2-section="sintesi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Conclusione · Tradelia AI (educational)</div></header>
      ${points}
      ${headlineBlockCardF2('Lettura di contesto (non istruzioni operative)', s.summary)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">Questa sezione ha esclusivamente finalità informative e formative. Nessuna raccomandazione personale.</div>
    </section>`;

  // 10) Governance (Audit & MiFID)
  const audit = d.audit_quality || {};
  const q = audit?.QualityMetrics || {};
  const governanceHTML = `
    <section class="tl-panel-section" data-f2-section="governance" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Governance · Audit & MiFID</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChipF2('FreshnessScore', q?.FreshnessScore || q?.Coverage)}
        ${qualityChipF2('ConfidenceFinal', q?.ConfidenceFinal)}
        ${qualityChipF2('DataIntegrity', q?.DataIntegrity)}
        ${qualityChipF2('FeedSync', q?.FeedSync)}
      </div>
      ${headlineBlockCardF2('AuditPath', audit?.AuditPathID)}
      ${headlineBlockCardF2('Informativa', d.mifid?.disclaimer)}
    </section>`;

  return { macroHTML, sciHTML, dpiHTML, fundamentalsHTML, icrHTML, etfPosHTML, newsHTML, surveysHTML, sintesiHTML, governanceHTML };
}

/* -----------------------------------------------------------------------------
// SHELL DESKTOP / MOBILE + TABS (stile F1B)
// -----------------------------------------------------------------------------*/
function renderF2DesktopShell(sections){
  return `
    <div class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f1b-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
    ${drawerBtnF2('macro','Controlli Rischio')}
${drawerBtnF2('sci','Sentiment sintetico')}
${drawerBtnF2('dpi','Fondamentali (profilo)')}
${drawerBtnF2('fundamentals','Fondamentali · Trend')}
${drawerBtnF2('icr','Confronto Peers & ETF')}
${drawerBtnF2('etfpos','ETF & Posizionamento')}
${drawerBtnF2('news','Newsflow 24–48h')}
${drawerBtnF2('surveys','Sondaggi')}
${drawerBtnF2('sintesi','Sintesi Educativa')}
${drawerBtnF2('governance','Governance')}

      </aside>
      <main id="f2-scroll-desktop" class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f2-view="macro">${sections.macroHTML}</div>
        <div data-f2-view="sci" hidden>${sections.sciHTML}</div>
        <div data-f2-view="dpi" hidden>${sections.dpiHTML}</div>
        <div data-f2-view="fundamentals" hidden>${sections.fundamentalsHTML}</div>
        <div data-f2-view="icr" hidden>${sections.icrHTML}</div>
        <div data-f2-view="etfpos" hidden>${sections.etfPosHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="surveys" hidden>${sections.surveysHTML}</div>
        <div data-f2-view="sintesi" hidden>${sections.sintesiHTML}</div>
        <div data-f2-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function renderF2MobileShell(sections){
const pills = [
  ['macro','Controlli'],
  ['sci','Sentiment'],
  ['dpi','Profilo Fondam.'],
  ['fundamentals','Trend Fondam.'],
  ['icr','Peers & ETF'],
  ['etfpos','ETF & Posiz.'],
  ['news','News 24–48h'],
  ['surveys','Sondaggi'],
  ['sintesi','Sintesi'],
  ['governance','Governance']
].map(([k,l])=>mobileTabBtnF2(k,l)).join('');

  const mobileTabsBar = `
    <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);box-shadow:0 6px 12px rgba(0,0,0,.12);padding:.6rem .75rem;">
      <div class="f1b-tabs-fade-left" style="position:absolute;left:0;top:0;bottom:0;width:24px;pointer-events:none;background:linear-gradient(to right,var(--surface-panel-head) 0%, rgba(0,0,0,0) 80%);opacity:.6;"></div>
      <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-right:2rem;">
        ${pills}
      </div>
      <div class="f1b-tabs-fade-right" style="position:absolute;right:0;top:0;bottom:0;width:48px;display:flex;align-items:center;justify-content:flex-end;pointer-events:none;background:linear-gradient(to left,var(--surface-panel-head) 0%, rgba(0,0,0,0) 70%);opacity:.6;font-size:10px;line-height:1;font-weight:600;color:var(--muted);text-shadow:0 1px 2px rgba(0,0,0,.4);">
        <span class="f1b-tabs-scroll-hint" style="display:inline-block;transform:translateY(1px);">⇠ ⇢</span>
      </div>
    </div>`;
  return `
    <div class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      ${mobileTabsBar}
      <main id="f2-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f2-view="macro">${sections.macroHTML}</div>
        <div data-f2-view="sci" hidden>${sections.sciHTML}</div>
        <div data-f2-view="dpi" hidden>${sections.dpiHTML}</div>
        <div data-f2-view="fundamentals" hidden>${sections.fundamentalsHTML}</div>
        <div data-f2-view="icr" hidden>${sections.icrHTML}</div>
        <div data-f2-view="etfpos" hidden>${sections.etfPosHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="surveys" hidden>${sections.surveysHTML}</div>
        <div data-f2-view="sintesi" hidden>${sections.sintesiHTML}</div>
        <div data-f2-view="governance" hidden>${sections.governanceHTML}</div>
      </main>
    </div>`;
}

function drawerBtnF2(key,label){
  return `<button class="f1b-tab-btn" data-f2-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
}
function mobileTabBtnF2(key,label){
  return `<button class="f1b-footer-tab-btn" data-f2-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`;
}

function bindF2TabsPublic(){
  const btns = document.querySelectorAll('[data-f2-tab]');
  const views = document.querySelectorAll('[data-f2-view]');
  const desk = document.getElementById('f2-scroll-desktop');
  const mob  = document.getElementById('f2-scroll-mobile');

  function resetScroll(){ [desk,mob].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; }); }
  function styleTabs(active){
    btns.forEach(b=>{
      const on = b.getAttribute('data-f2-tab')===active;
      if (b.classList.contains('f1b-tab-btn')) b.classList.toggle('is-active', on);
      if (b.classList.contains('f1b-footer-tab-btn')){
        if(on){ b.style.fontWeight='600'; b.style.border='1px solid var(--ink)'; b.style.background='radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)'; b.style.color='var(--ink)'; b.style.boxShadow='0 4px 10px rgba(0,0,0,.18)'; }
        else { b.style.fontWeight='500'; b.style.border='1px solid var(--br-soft)'; b.style.background='var(--surface-card)'; b.style.color='var(--muted)'; b.style.boxShadow='var(--shadow-card)'; }
      }
    });
  }
  function show(active){
    views.forEach(v=>{ const k=v.getAttribute('data-f2-view'); v.hidden = (k!==active); if(!v.hidden){ requestAnimationFrame(()=>{ resetScroll(); v.querySelectorAll('[data-scrollable]').forEach(sc=>{sc.scrollTop=0;sc.scrollLeft=0;}); }); }});
  }
  function activate(k){ styleTabs(k); show(k);} 
  btns.forEach(b=>{ if(b.__f2Bound) return; b.__f2Bound=true; b.addEventListener('click',()=>{ activate(b.getAttribute('data-f2-tab')); }); });
}

/* -----------------------------------------------------------------------------
// CARD BUILDERS
// -----------------------------------------------------------------------------*/
function f2Card({ tone, title, bodyHtml, noteHtml }){
  const { dotColor } = toneColorsF2(tone);
  return `
    <div class="mb-4 p-2" style="background:var(--surface-card-alt);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};flex-shrink:0;"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title||'')}</div>
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">${bodyHtml||''}</div>
      ${ noteHtml ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>` : '' }
    </div>`;
}

function metricBoxTrafficLightF2({ key, label, desc, metric }){
  const { dotColor, textColor } = toneColorsF2(metric?.tone);
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

function metricBlockF2(metricKey, title, desc, metricObj){
  const { textColor } = toneColorsF2(metricObj?.tone);
  const value = formatMetricValue(metricObj);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${value}</span>
      </div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    ${ desc ? `<div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc || '')}</div>` : ''}
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(metricObj?.ai_note || '')}</div>`;
  return f2Card({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}

// --- Newsflow: card list compatto (max 10) ---
function newsCardListF2(top10, summary){
  const items = Array.isArray(top10?.rows) ? top10.rows : [];
  const cards = items.slice(0,10).map(r=>{
    const time = escapeHtml(String(r[0] ?? ''));
    const source = escapeHtml(String(r[1] ?? ''));
    const titleFull = String(r[2] ?? '');
    const toneRow = String(r[3] ?? 'neutral');
    const comment = String(r[4] ?? '');
    const title = escapeHtml(truncate(titleFull, 100));
    const snippet = escapeHtml(truncate(comment || titleFull, 320));
    const { dotColor, textColor, bgSoft, brColor } = toneColorsCard(toneRow);
    return `
      <article class="newsflow-card" style="border:1px solid ${brColor};border-radius:12px;background:${bgSoft};box-shadow:var(--shadow-card);padding:.75rem .85rem;display:flex;flex-direction:column;gap:.35rem;">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};flex-shrink:0;"></span>
            <h4 class="text-[13px] font-semibold leading-[1.35] text-[color:var(--ink)] truncate" title="${escapeAttr(titleFull)}">${title}</h4>
          </div>
          <span class="text-[10px] font-mono text-[color:var(--muted)]" title="${escapeAttr(time)}">${escapeHtml(formatTimeTiny(time))}</span>
        </div>
        <p class="text-[12.5px] leading-[1.5] text-[color:${textColor}]">${snippet}</p>
        <div class="text-[11px] text-[color:var(--muted)] flex items-center justify-between">
          <span>${source}</span>
          <span class="uppercase tracking-wide text-[10px]">${escapeHtml(toneRow)}</span>
        </div>
      </article>`;
  }).join('');

  const summaryCard = summary ? f2Card({ tone: summary.tone || 'neutral', title:'Sintesi (top 10)', bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(summary.raw || '')}</div>` }) : '';

  return `
    ${summaryCard}
    <div class="hidden md:block"><div class="grid gap-2 md:grid-cols-2">${cards}</div></div>
    <div class="md:hidden"><div class="grid gap-2" style="grid-template-columns:repeat(1,minmax(0,1fr));">${cards || `<div class='text-[12px] text-[color:var(--muted)]'>Nessuna headline disponibile.</div>`}</div></div>
  `;
}

// --- ETF: card list compatto (Top10) ---
function etfCardListF2(top10){
  const rows = Array.isArray(top10?.rows) ? top10.rows.slice(0,10) : [];
  if (!rows.length) return f2Card({ tone:'neutral', title:'ETF principali (top 10)', bodyHtml:`<div class='text-[12px] text-[color:var(--muted)]'>N/A</div>` });
  const cards = rows.map(r=>{
    const [sym, hold, w1, m1, lev] = [r[0], r[1], r[2], r[3], r[4]];
    const levTag = lev && /inverse/i.test(String(lev)) ? 'Inverse' : (lev || 'Long');
    const levTone = /inverse/i.test(String(lev)) ? 'red' : 'green';
    const { dotColor, brColor } = toneColorsCard(levTone);
    return `
      <div class="etf-card" style="border:1px solid ${brColor};border-radius:12px;background:var(--surface-card-alt);box-shadow:var(--shadow-card);padding:.55rem .7rem;display:flex;flex-direction:column;gap:.2rem;">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${dotColor};"></span>
            <div class="text-[12.5px] font-semibold">${escapeHtml(String(sym))}</div>
          </div>
          <span class="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">${escapeHtml(String(levTag))}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-[12px]">
          <div><div class="text-[10px] text-[color:var(--muted)]">%Hold</div><div class="font-mono">${escapeHtml(String(hold))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">1W %</div><div class="font-mono">${escapeHtml(String(w1))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">1M %</div><div class="font-mono">${escapeHtml(String(m1))}</div></div>
        </div>
      </div>`;
  }).join('');

  return f2Card({ tone: top10?.tone || 'neutral', title:'ETF principali (top 10 per % holdings)', bodyHtml:`<div class='grid gap-2 md:grid-cols-2'>${cards}</div>` });
}

// Fundamentals section builder
function buildFundamentalsSection(d){
  const dpi = d.dpi || {};
  const meta = d.metadata || {};
  const fundamentalsChips = [
    ['VAL_MULTIPLES_info','Valuation multiples', dpi?.VALUATION_SNAPSHOT],
    ['MARGINS_TREND_info','Margins trend', dpi?.MARGINS_SNAPSHOT || dpi?.MARGIN_HEALTH],
    ['EARNINGS_REV_info','Earnings trend / revisions', dpi?.EARNINGS_TREND],
    ['QUALITY_BS_CF_info','Quality (BS & CF)', dpi?.BALANCE_SHEET_STRENGTH || dpi?.CASHFLOW_MOMENTUM],
    ['TARGET_SPREAD_info','Target spread', meta?.TARGET_SPREAD],
    ['UPSIDE_PCT_info','Upside %', meta?.UPSIDE_PCT],
    ['EVENT_LAST_EARNINGS_info','Ultimo earnings', meta?.EVENT_LAST_EARNINGS],
    ['POST_EARNINGS_WINDOW_info','Post‑earnings window', meta?.POST_EARNINGS_WINDOW]
  ].map(([id,title,val])=> val ? metricBlockF2(id, title, '', val) : '').join('');

  return `
    <section class="tl-panel-section" data-f2-section="fundamentals" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Fundamentals · Snapshot & Trend</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">${fundamentalsChips || ''}</div>
    </section>`;
}

/* -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------*/
function conclusionPointBlockF2(pointObj={}){
  const tone = pointObj.tone || 'neutral';
  const bodyHtml = `
    <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">${escapeHtml(pointObj.raw||'')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(pointObj.ai_note||'')}</div>`;
  return f2Card({ tone, title: pointObj.title||'', bodyHtml, noteHtml:'' });
}

function listBlockCardF2(title, body){
  if (!body && body !== 0) return '';
  let tone='neutral', raw='';
  if (Array.isArray(body)){
    raw = body.map(x=>`• ${String(x)}`).join('\n');
  } else if (typeof body==='object'){
    tone = body?.tone || 'neutral';
    raw = body?.raw || '';
  } else {
    raw = String(body);
  }
  return f2Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function headlineBlockCardF2(title, obj){
  if (obj===undefined || obj===null) return '';
  let tone='neutral', raw='';
  if (typeof obj==='string'){ raw=obj; }
  else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
  return f2Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function qualityChipF2(key, q){
  if (!q) return '';
  const { textColor } = toneColorsF2(q.tone);
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(q.raw || '—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(key)}_info" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(q.ai_note || '')}</div>`;
  return f2Card({ tone: q.tone, title: key || '', bodyHtml, noteHtml: '' });
}

function toneColorsF2(tone){
  switch((tone||'').toLowerCase()){
    case 'green': return { dotColor:'var(--tone-pos-fg)', textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red': return { dotColor:'var(--tone-neg-fg)', textColor:'var(--tone-neg-fg)' };
    default: return { dotColor:'var(--tone-neu-fg)', textColor:'var(--tone-neu-fg)' };
  }
}

function toneFromMacroGate(m){
  const raw = (m?.raw || m || '').toString().toUpperCase();
  let toneLabel='neutral', toneColor='var(--tone-neu-fg)';
  if (raw==='PASS'){ toneLabel='ok'; toneColor='var(--tone-pos-fg)'; }
  else if (raw==='REVIEW'){ toneLabel='review'; toneColor='var(--tone-warn-fg)'; }
  else if (raw==='FAIL'){ toneLabel='stop'; toneColor='var(--tone-neg-fg)'; }
  return { toneLabel, toneColor };
}

function toneColorsCard(tone){
  const t = (tone||'').toLowerCase();
  if (t==='green' || t==='positive') return { dotColor:'var(--tone-pos-fg)', textColor:'var(--ink)', bgSoft:'color-mix(in oklab, var(--tone-pos-fg) 8%, var(--surface-card))', brColor:'color-mix(in oklab, var(--tone-pos-fg) 40%, var(--br-card))' };
  if (t==='red' || t==='negative') return { dotColor:'var(--tone-neg-fg)', textColor:'var(--ink)', bgSoft:'color-mix(in oklab, var(--tone-neg-fg) 8%, var(--surface-card))', brColor:'color-mix(in oklab, var(--tone-neg-fg) 40%, var(--br-card))' };
  if (t==='yellow' || t==='neutral') return { dotColor:'var(--tone-warn-fg)', textColor:'var(--ink)', bgSoft:'color-mix(in oklab, var(--tone-warn-fg) 8%, var(--surface-card))', brColor:'color-mix(in oklab, var(--tone-warn-fg) 40%, var(--br-card))' };
  return { dotColor:'var(--tone-neu-fg)', textColor:'var(--ink)', bgSoft:'var(--surface-card-alt)', brColor:'var(--br-card)' };
}

function truncate(s, n){
  const str = String(s || '');
  return str.length>n ? str.slice(0,n-1)+'…' : str;
}

function formatTimeTiny(ts){
  try{
    const d = new Date(ts);
    if (!isNaN(d.getTime())){
      const h = String(d.getHours()).padStart(2,'0');
      const m = String(d.getMinutes()).padStart(2,'0');
      return `${h}:${m}`;
    }
  } catch(_){ }
  return String(ts);
}

/* -----------------------------------------------------------------------------
// NORMALIZZAZIONE DATI (tassonomia; niente valori hard-coded)
// -----------------------------------------------------------------------------*/
function normalizeDataF2Public(src={}){
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? '—',
      module: src?.meta?.module ?? 'F2 · Macro & Sentiment',
      moduleVersion: src?.meta?.moduleVersion ?? 'v7.2',
      moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
      freshness: src?.meta?.freshness ?? '≤ T-1',
      hero_intro: src?.meta?.hero_intro ?? '',
      hero_disclaimer: src?.meta?.hero_disclaimer ?? 'Contenuto informativo/formativo. Nessuna istruzione operativa.'
    },

    // STEP 1: WebProbe
    step1: (function(){
      const s = src?.step1_f2_webprobe || {};
      return {
        MacroGate: s.MacroGate || { raw:'—', tone:'neutral', ai_note:'' },
        MacroNotes: Array.isArray(s.MacroNotes) ? s.MacroNotes : [],
        MacroEvents: Array.isArray(s.MacroEvents) ? s.MacroEvents : [],
        CorpEvents:  Array.isArray(s.CorpEvents)  ? s.CorpEvents  : [],
        ai_note: s.ai_note || ''
      };
    })(),

    // FEATURE BUILDERS
    sci_dpi: src?.SCI_tkr || {},            // SCI (etichette discrete)
    dpi:     src?.DPI_context || {},        // DPI (descrittivo/fondamentali)
    icr:     src?.ICR_tkr || {},            // ICR overlay peers/ETF

    // Metadata extra per Fundamentals/News
    metadata: src?.metadata || {},

    // ETF exposure
    etf_exposure: src?.etf_exposure || {
      Top10:{ tone:'neutral', columns:['ETF','%Hold','1W %','1M %','Leverage'], rows:[] },
      ETF_FLOW_BIAS:{ raw:'—', tone:'neutral' },
      SECTOR_BREADTH:{ raw:'—', tone:'neutral' },
      TOP_HOLDING_ETF:{ raw:'—', tone:'neutral' },
      ai_note:''
    },

    // Newsflow
    newsflow: src?.news_stream || {
      Summary:{ raw:'', tone:'neutral' },
      Top10:{ tone:'neutral', columns:['Time','Publisher','Headline','Tone','Comment'], rows:[] }
    },

    // Positioning/Short/Ownership
    positioning: src?.positioning || {
      SI_LEVEL:{ raw:'—', tone:'neutral' },
      DTC_BUCKET:{ raw:'—', tone:'neutral' },
      SI_TREND:{ raw:'—', tone:'neutral' },
      INST_FLOW:{ raw:'—', tone:'neutral' },
      INSIDER_FLOW:{ raw:'—', tone:'neutral' },
      ai_note:''
    },

    // Surveys
    surveys: src?.surveys || {
      AAII:{ raw:'—', tone:'neutral' },
      NAAIM:{ raw:'—', tone:'neutral' },
      FearGreed:{ raw:'—', tone:'neutral' },
      ai_note:''
    },

    // Headline KPI
    sentiment_flows: src?.sentiment_flows || {
      SentimentComposite:{ raw:'—', tone:'neutral' },
      ETF_FlowTone:{ raw:'—', tone:'neutral' }
    },

    // Audit & MiFID
    audit_quality: (function(){
      const aq = src?.audit_quality || { AuditPathID:'—', QualityMetrics:{} };
      const qm = aq?.QualityMetrics || {};
      if(qm.Coverage && !qm.FreshnessScore){ qm.FreshnessScore = qm.Coverage; }
      return { ...aq, QualityMetrics: qm };
    })(),
    mifid: src?.mifid || { disclaimer:'' },

    // Conclusione educativa
    sintesi_ai: src?.sintesi_ai || { points:[], summary:'' }
  };
}

/* -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------*/
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function formatMetricValue(obj){
  const v = obj?.raw;
  if (v === null || v === undefined) return '—';
  if (Array.isArray(v)){
    const s = JSON.stringify(v);
    return escapeHtml(s.length>80 ? s.slice(0,80)+'…' : s);
  }
  if (typeof v === 'object'){
    const keys = Object.keys(v);
    if (keys.length === 0) return '{}';
    const compact = keys.slice(0,5).reduce((acc,k)=>{ acc[k]=v[k]; return acc; },{});
    const s = JSON.stringify(compact);
    return escapeHtml(s.length>100 ? s.slice(0,100)+'…' : s);
  }
  return escapeHtml(String(v));
}
