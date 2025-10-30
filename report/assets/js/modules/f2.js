// /report/assets/js/modules/f2.js
//
// F2 · Macro & Sentiment Overlay (3–10 giorni)
// Allineato al design F1B (stesse classi, stesso card system)
//
// Scopo
// - Lettura sintetica di: MacroGate (WebProbe), Sentiment ticker‑level (SCI/DPI), ETF exposure, Newsflow,
//   Positioning/Short/Ownership, Survey, Audit, MiFID.
// - Nessun output JSON hard-coded nel codice. Tutto arriva da rawData.
// - Target: utenza retail base/intermedio/avanzato ⇒ linguaggio semplice, sezioni chiare.
// - Nessun duplicato del bridge F1B (StrategyMode/Regime ecc. già in F1B).
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

  // HERO KPI (semplice, leggibile)
  // 1) MacroGate come semaforo principale
  // 2) Sentiment composito (se presente) – facoltativo ma utile per retail
  // 3) ETF Flow Tone – snelletta
  const kpis = [
    { key:"MacroGate", label:"MacroGate", desc:"Esito controlli evento (48–72h)", metric: d.step1?.MacroGate },
    { key:"SentimentComposite", label:"Sentiment", desc:"Sintesi multi‑fonte (es. news/analyst/tecnico)", metric: d.sentiment_flows?.SentimentComposite },
    { key:"ETF_FlowTone", label:"ETF Flussi", desc:"Bias flussi & breadth (1W–1M)", metric: d.sentiment_flows?.ETF_FlowTone }
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
            Sentiment & dinamica flussi (ticker‑level)
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || 'Contesto sintetico per lettura non operativa del sentiment, dei flussi ETF e del newsflow.')}<br/>
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
            <button class="info-btn align-middle" data-metric="MacroGate" aria-label="Info MacroGate">?</button>
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
// DRAWER (struttura leggibile per retail; sezioni autonome ETF/News; Audit e MiFID separati)
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

  setTimeout(()=>{
    bindF2TabsPublic();
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f2-scroll-desktop')); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f2-scroll-mobile')); } catch(e){}
    }
    const first = document.querySelector('[data-f2-tab="sentiment"]');
    if (first?.click) first.click();
  },0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

/* -----------------------------------------------------------------------------
// SEZIONI ANALITICHE (orientate alla leggibilità)
// -----------------------------------------------------------------------------*/
function buildF2SectionsPublic(d){
  // 1) Rischi macro/societari (WebProbe)
  const macroHTML = `
    <section class="tl-panel-section" data-f2-section="macro" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Controlli rischio (ultime 72h)</div></header>
      ${metricBlockF2('MacroGate','MacroGate','Semaforo eventi macro/societari ravvicinati', d.step1?.MacroGate)}
      ${listBlockCardF2('Note di controllo', d.step1?.MacroNotes)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4]">Se FAIL: la pipeline F2 non prosegue (stato HOLD). In caso di REVIEW: si procede con confidenza ridotta.</div>
    </section>`;

  // 2) Sentiment sintetico (SCI/DPI digest semplificato)
  const sci = d.sci_dpi || {};
  const sentimentHTML = `
    <section class="tl-panel-section" data-f2-section="sentiment" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Sentiment sintetico (ticker‑level)</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('TECH_SIGNAL','Tecnico (Barchart)','Segnale sintetico buy/hold/sell', sci?.TECH_SIGNAL)}
        ${metricBlockF2('NEWS_TONE','News · Tono','Ultime 24–48h', sci?.NEWS_TONE)}
        ${metricBlockF2('CONSENSUS_LEVEL','Analyst · Consenso','Media valutazioni', sci?.CONSENSUS_LEVEL)}
        ${metricBlockF2('CONSISTENCY','Analyst · Stabilità','Trend rating 3m', sci?.CONSISTENCY)}
      </div>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mt-2">
        ${metricBlockF2('IV_STATE','Volatilità implicita','Percentile 52w', sci?.IV_STATE)}
        ${metricBlockF2('PUTCALL_BIAS','Flusso opzioni','Put/Call bias', sci?.PUTCALL_BIAS)}
      </div>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4] mt-2">
        ${metricBlockF2('VOLUME_STATE','Volumi','Rel. volume', d.dpi?.VOLUME_STATE)}
        ${metricBlockF2('MOMENTUM_LABEL','Momentum','Bias RSI/posizione range', d.dpi?.MOMENTUM_LABEL)}
        ${metricBlockF2('RANGE_LOC','Range 52w','Posizione nel range', d.dpi?.RANGE_LOC)}
      </div>
    </section>`;

  // 3) ETF · esposizione & flussi (SEZIONE DEDICATA)
  const etf = d.etf_exposure || {};
  const etfTable = tableCardF2('ETF principali (top 10 per \u0025 holdings)', etf?.Top10);
  const etfHTML = `
    <section class="tl-panel-section" data-f2-section="etf" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">ETF · Esposizione & Flussi</div></header>
      ${metricBlockF2('ETF_FLOW_BIAS','Bias flussi (1M)','Media/ponderata 1M %Chg', etf?.ETF_FLOW_BIAS)}
      ${metricBlockF2('SECTOR_BREADTH','Breadth settore/peers','Quota titoli in positivo', etf?.SECTOR_BREADTH)}
      ${metricBlockF2('TOP_HOLDING_ETF','Top holding ETF','Maggiore \u0025 holdings', etf?.TOP_HOLDING_ETF)}
      ${etfTable}
      ${listBlockCardF2('Sintesi ETF (massimo 10)', etf?.ai_note)}
    </section>`;

  // 4) Newsflow (SEZIONE DEDICATA)
  const news = d.newsflow || {};
  const newsHTML = `
    <section class="tl-panel-section" data-f2-section="news" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Newsflow · ultime 24–48h</div></header>
      ${headlineBlockCardF2('Sintesi (top 10 headlines)', news?.Summary)}
      ${tableCardF2('Top 10 headlines', news?.Top10)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4]">Le etichette sono descrittive (positive/negative/neutral) per un pubblico retail.</div>
    </section>`;

  // 5) Positioning & Short/Ownership (digest chiaro)
  const pos = d.positioning || {};
  const positioningHTML = `
    <section class="tl-panel-section" data-f2-section="positioning" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Positioning · Short / Ownership</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('SI_LEVEL','Short Float','Livello stimato', pos?.SI_LEVEL)}
        ${metricBlockF2('DTC_BUCKET','Days to Cover','Bucket', pos?.DTC_BUCKET)}
        ${metricBlockF2('SI_TREND','Trend short','Direzione 6 date', pos?.SI_TREND)}
        ${metricBlockF2('INST_FLOW','Istituzionali','Flusso (3–6m)', pos?.INST_FLOW)}
        ${metricBlockF2('INSIDER_FLOW','Insider','Bias ultimo trimestre', pos?.INSIDER_FLOW)}
      </div>
      ${listBlockCardF2('Osservazioni', pos?.ai_note)}
    </section>`;

  // 6) Survey & Sentiment retail/pro
  const surv = d.surveys || {};
  const surveysHTML = `
    <section class="tl-panel-section" data-f2-section="surveys" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Survey · retail/pro</div></header>
      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('AAII','AAII Bulls‑Bears','Spread e z‑score', surv?.AAII)}
        ${metricBlockF2('NAAIM','NAAIM Exposure','Exposure medio', surv?.NAAIM)}
        ${metricBlockF2('FearGreed','Fear & Greed','Indice e componenti', surv?.FearGreed)}
      </div>
      ${listBlockCardF2('Note survey', surv?.ai_note)}
    </section>`;

  // 7) Audit (SEZIONE SEPARATA)
  const audit = d.audit_quality || {};
  const auditHTML = `
    <section class="tl-panel-section" data-f2-section="audit" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Audit & Qualità dati</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChipF2('Coverage', audit?.QualityMetrics?.Coverage)}
        ${qualityChipF2('ConfidenceFinal', audit?.QualityMetrics?.ConfidenceFinal)}
        ${qualityChipF2('DataIntegrity', audit?.QualityMetrics?.DataIntegrity)}
        ${qualityChipF2('FeedSync', audit?.QualityMetrics?.FeedSync)}
      </div>
      ${headlineBlockCardF2('AuditPath', audit?.AuditPathID)}
    </section>`;

  // 8) MiFID (SEZIONE SEPARATA)
  const mifidHTML = `
    <section class="tl-panel-section" data-f2-section="mifid" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Nota regolamentare</div></header>
      ${headlineBlockCardF2('Informativa', d.mifid?.disclaimer)}
    </section>`;

  return { macroHTML, sentimentHTML, etfHTML, newsHTML, positioningHTML, surveysHTML, auditHTML, mifidHTML };
}

/* -----------------------------------------------------------------------------
// SHELL DESKTOP / MOBILE + TABS (stile F1B)
// -----------------------------------------------------------------------------*/
function renderF2DesktopShell(sections){
  return `
    <div class="f1b-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f1b-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
        ${drawerBtnF2('sentiment','Sentiment')}
        ${drawerBtnF2('etf','ETF')}
        ${drawerBtnF2('news','Newsflow')}
        ${drawerBtnF2('positioning','Positioning')}
        ${drawerBtnF2('surveys','Survey')}
        ${drawerBtnF2('macro','Controlli rischio')}
        ${drawerBtnF2('audit','Audit')}
        ${drawerBtnF2('mifid','MiFID')}
      </aside>
      <main id="f2-scroll-desktop" class="f1b-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f2-view="sentiment">${sections.sentimentHTML}</div>
        <div data-f2-view="etf" hidden>${sections.etfHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="positioning" hidden>${sections.positioningHTML}</div>
        <div data-f2-view="surveys" hidden>${sections.surveysHTML}</div>
        <div data-f2-view="macro" hidden>${sections.macroHTML}</div>
        <div data-f2-view="audit" hidden>${sections.auditHTML}</div>
        <div data-f2-view="mifid" hidden>${sections.mifidHTML}</div>
      </main>
    </div>`;
}

function renderF2MobileShell(sections){
  const tabs = [
    ['sentiment','Sentiment'],
    ['etf','ETF'],
    ['news','News'],
    ['positioning','Positioning'],
    ['surveys','Survey'],
    ['macro','Controlli'],
    ['audit','Audit'],
    ['mifid','MiFID']
  ];
  const pills = tabs.map(([k,l])=>mobileTabBtnF2(k,l)).join('');
  return `
    <div class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      <div class="f1b-mobile-tabs-fixed" style="position:relative;flex-shrink:0;width:100%;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);background:var(--surface-panel-head);padding:.6rem .75rem;">
        <div class="f1b-footer-tabs-scroll" style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:.5rem;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;">${pills}</div>
      </div>
      <main id="f2-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f2-view="sentiment">${sections.sentimentHTML}</div>
        <div data-f2-view="etf" hidden>${sections.etfHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="positioning" hidden>${sections.positioningHTML}</div>
        <div data-f2-view="surveys" hidden>${sections.surveysHTML}</div>
        <div data-f2-view="macro" hidden>${sections.macroHTML}</div>
        <div data-f2-view="audit" hidden>${sections.auditHTML}</div>
        <div data-f2-view="mifid" hidden>${sections.mifidHTML}</div>
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
// CARD BUILDERS (riuso stile F1B)
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
        <button class="info-btn" data-metric="${escapeAttr(key)}" aria-label="Info ${escapeAttr(key)}">?</button>
      </div>
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(metric?.raw || '—')}</div>
      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc || '')}</div>
    </div>`;
}

function metricBlockF2(metricKey, title, desc, metricObj){
  const { textColor } = toneColorsF2(metricObj?.tone);
  const value = escapeHtml(metricObj?.raw || '—');
  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${value}</span>
      </div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc || '')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(metricObj?.ai_note || '')}</div>`;
  return f2Card({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}

function tableCardF2(title, tbl){
  // tbl: { tone, columns:[...], rows:[[...]], ai_note? }
  const tone = tbl?.tone || 'neutral';
  const cols = Array.isArray(tbl?.columns) ? tbl.columns : [];
  const rows = Array.isArray(tbl?.rows) ? tbl.rows : [];
  const head = cols.map(c=>`<th class="text-left px-2 py-1 text-[11px] uppercase tracking-wide text-[color:var(--muted)]">${escapeHtml(String(c))}</th>`).join('');
  const body = rows.map(r=>`<tr>${r.map((cell,i)=>`<td class="px-2 py-1 text-[12px] ${i>0?'font-mono':''}">${escapeHtml(String(cell))}</td>`).join('')}</tr>`).join('');
  const tableHtml = `
    <div class="overflow-auto" data-scrollable>
      <table class="min-w-full border-separate" style="border-spacing:0;">
        <thead><tr>${head}</tr></thead>
        <tbody>${body || `<tr><td class='px-2 py-1 text-[12px] text-[color:var(--muted)]'>N/A</td></tr>`}</tbody>
      </table>
    </div>`;
  return f2Card({ tone, title, bodyHtml: tableHtml, noteHtml: tbl?.ai_note ? escapeHtml(tbl.ai_note) : '' });
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
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${escapeHtml(q.raw||'—')}</div>
      <button class="info-btn" data-metric="${escapeAttr(key)}" aria-label="Info ${escapeAttr(key)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(q.ai_note||'')}</div>`;
  return f2Card({ tone: q.tone, title: key||'', bodyHtml, noteHtml:'' });
}

/* -----------------------------------------------------------------------------
// TONE HELPERS
// -----------------------------------------------------------------------------*/
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

/* -----------------------------------------------------------------------------
// NORMALIZZAZIONE DATI (solo tassonomia; nessun valore di calcolo hard-coded)
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

    // STEP 1: WebProbe (macro/societario)
    step1: src?.step1_f2_webprobe || { MacroGate:{ raw:'—', tone:'neutral', ai_note:'' }, MacroNotes:[], ai_note:'' },

    // SCI/DPI digest per retail
    sci_dpi: src?.SCI_tkr || {},
    dpi: src?.DPI_context || {},

    // ETF exposure (Top10 + sintesi)
    etf_exposure: src?.etf_exposure || { Top10:{ tone:'neutral', columns:['ETF','%Hold','1W %','1M %','Leverage'], rows:[] }, ETF_FLOW_BIAS:{ raw:'—', tone:'neutral' }, SECTOR_BREADTH:{ raw:'—', tone:'neutral' }, TOP_HOLDING_ETF:{ raw:'—', tone:'neutral' }, ai_note:'' },

    // Newsflow: top 10 + sintesi
    newsflow: src?.news_stream || { Summary:{ raw:'', tone:'neutral' }, Top10:{ tone:'neutral', columns:['Time','Publisher','Headline','Tone'], rows:[] } },

    // Positioning/Short/Ownership
    positioning: src?.positioning || { SI_LEVEL:{ raw:'—', tone:'neutral' }, DTC_BUCKET:{ raw:'—', tone:'neutral' }, SI_TREND:{ raw:'—', tone:'neutral' }, INST_FLOW:{ raw:'—', tone:'neutral' }, INSIDER_FLOW:{ raw:'—', tone:'neutral' }, ai_note:'' },

    // Surveys
    surveys: src?.surveys || { AAII:{ raw:'—', tone:'neutral' }, NAAIM:{ raw:'—', tone:'neutral' }, FearGreed:{ raw:'—', tone:'neutral' }, ai_note:'' },

    // Sentiment/Flows headline KPI
    sentiment_flows: src?.sentiment_flows || { SentimentComposite:{ raw:'—', tone:'neutral' }, ETF_FlowTone:{ raw:'—', tone:'neutral' } },

    // Audit & MiFID separati
    audit_quality: src?.audit_quality || { AuditPathID:'—', QualityMetrics:{} },
    mifid: src?.mifid || { disclaimer:'' }
  };
}

/* -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------*/
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
