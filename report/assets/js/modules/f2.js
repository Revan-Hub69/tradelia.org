// /report/assets/js/modules/f2.js
//
// F2 · Macro & Sentiment Overlay (3–10 giorni)
// — allineato a stile/UX di F1B (stesse classi, tokens e pattern UI)
//
// Scopo
// - Gate macro (Step 1 WebProbe) e overlay ticker-level deterministico
// - Feature builders da pannelli user-provided (Finviz, Barchart, Nasdaq, SEC Form 4)
// - Nessuna logica operativa; sola etichettatura/contesto
// - Output (SCI_tkr, DPI_context, ICR_tkr, metadata, stato, Confidence, AuditPathID)
//
// Export
//   renderCard(rawData, ctx?)
//   bindCard(node, rawData, ctx?)
//
// Dipendenze globali attese (come F1B)
//   window.__TradeliaUI.openPanel()
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons()

// -----------------------------------------------------------------------------
// RENDER CARD (snapshot pubblico F2)
// -----------------------------------------------------------------------------

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataF2Public(rawData);

  // KPI hero (compatti, no bridge da F1B)
  const heroKpis = [
    {
      key: "MacroGate",
      label: "MacroGate",
      desc: "Controllo eventi imminenti (Tier‑1)",
      metric: mapMacroGateToMetric(d.MacroGate, d.MacroNotes?.[0])
    },
    {
      key: "TECH_SIGNAL",
      label: "Tech Signal",
      desc: "Barchart Technical Opinion (−1/0/+1)",
      metric: wrapMetric(d?.SCI_tkr?.TECH_SIGNAL)
    },
    {
      key: "CONSENSUS_LEVEL",
      label: "Consensus",
      desc: "Analyst rating bucket (1–5)",
      metric: wrapMetric(d?.SCI_tkr?.CONSENSUS_LEVEL)
    }
  ];

  // opzionale 4° chip: NEWS_TONE se presente
  if (d?.SCI_tkr?.NEWS_TONE) {
    heroKpis.push({
      key: "NEWS_TONE",
      label: "News Tone",
      desc: "Ultime 24–48h (headlines)",
      metric: wrapMetric(d?.SCI_tkr?.NEWS_TONE)
    });
  }

  // pill accanto a MacroGate (label + colore coerente)
  const { toneLabel, toneColor } = computeHighLevelToneF2Hero(d.MacroGate);

  return `
    <section class="f2-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEAD -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F2</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Macro & Sentiment Overlay · 3–10 giorni</span>
            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.meta.state || 'ACTIVE')}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.state || 'ACTIVE')}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Gate macro & overlay ticker-level (deterministico)
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || 'Valida rischi macro (WebProbe) e, se accettabili, compone SCI/DPI/ICR da pannelli Tier‑1 user‑provided.')}<br/>
            <span class="text-[11px] text-[color:var(--muted)]">Sola finalità informativa/formativa. Nessuna istruzione operativa.</span>
          </div>
        </div>
      </header>

      <!-- CARD PRINCIPALE -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <!-- MacroGate + tono -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
            <span>MacroGate</span>
            <button class="info-btn align-middle" data-metric="MacroGate" aria-label="Info MacroGate">?</button>
          </div>
          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(String(d.MacroGate || '—'))}</span>
            <span class="px-[6px] py-[4px] rounded-md text-[11px] font-semibold leading-none border"
              style="background:radial-gradient(circle at 0% 0%, color-mix(in oklab, ${toneColor} 18%, transparent) 0%, transparent 60%), var(--surface-card);color:${toneColor};border-color:${toneColor};box-shadow:var(--shadow-card);">
              ${escapeHtml(toneLabel)}
            </span>
          </div>
          <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml((d.MacroNotes && d.MacroNotes[0]) || '')}</div>
        </div>

        <!-- KPI semaforiche -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          ${heroKpis.map(k => metricBoxTrafficLightF2(k)).join("")}
        </div>

        <!-- DISCLAIMER + CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer || '')}</p>
          <div class="flex lg:justify-end">
            <button class="f2-cta-btn" data-open-f2-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Dettagli overlay →
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataF2Public(rawData);

  const btn = node.querySelector('[data-open-f2-details="true"]');
  if (btn) btn.addEventListener('click', () => openF2Drawer(data));

  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === 'function') {
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(e){}
  }
}

// -----------------------------------------------------------------------------
// DRAWER (dettaglio analitico, stesso shell/UX di F1B)
// -----------------------------------------------------------------------------
function openF2Drawer(d){
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== 'function') return;
  const sections = buildF2Sections(d);
  const mobile = isMobileViewport();

  window.__TradeliaUI.openPanel({
    title: 'F2 · Macro & Sentiment Overlay',
    subtitle: '',
    sections: [ { title:'', body: mobile ? renderF2MobileShell(sections) : renderF2DesktopShell(sections), meta:'' } ],
    blocking: false,
    panelSize: mobile ? 'wide' : 'xl',
    footerButtons: mobile ? [] : [ { label:'Chiudi', action: ()=> window.__TradeliaUI.closePanel() } ],
    footerTabs: []
  });

  setTimeout(()=>{
    bindF2Tabs();
    if (window.__TradeliaUI?.bindMetricInfoButtons){
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f2-scroll-desktop')); } catch(e){}
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById('f2-scroll-mobile')); } catch(e){}
    }
    const first = document.querySelector('[data-f2-tab="macro"]');
    if (first?.click) first.click();
  },0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

// -----------------------------------------------------------------------------
// SEZIONI ANALITICHE (ordine coerente con prompt v7.2)
// -----------------------------------------------------------------------------
function buildF2Sections(d){
  // 1) MacroGate · WebProbe (Tier‑1)
  const macroHTML = `
    <section class="tl-panel-section" data-f2-section="macro" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Controlli qualitativi · MacroGate</div></header>
      ${metricBlockF2('MacroGate','Stato MacroGate','PASS/REVIEW/FAIL secondo regole temporali evento', mapMacroGateToMetric(d.MacroGate, (d.MacroNotes||[]).join(' \n')))}
      ${listBlockCardF2('MacroNotes', { raw: (d.MacroNotes||[]).join('\n'), tone: macroToneFromGate(d.MacroGate) })}
    </section>
  `;

  // 2) SCI_tkr · etichette discrete
  const sci = d?.SCI_tkr || {};
  const sciHTML = `
    <section class="tl-panel-section" data-f2-section="sci" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">SCI_tkr · Segnali sintetici</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('SI_LEVEL','Short Interest · livello','Bucket short float pct', wrapMetric(sci.SI_LEVEL))}
        ${metricBlockF2('DTC_BUCKET','Days to Cover · bucket','Bucket DTC', wrapMetric(sci.DTC_BUCKET))}
        ${metricBlockF2('SI_TREND','SI trend','Slope ultime 6 settlement', wrapMetric(sci.SI_TREND))}
        ${metricBlockF2('SI_PRESSURE','Short pressure','Regola combinata livello/DTC', wrapMetric(sci.SI_PRESSURE))}
        ${metricBlockF2('INST_FLOW','Institutional flow','Sign(Inst Trans)', wrapMetric(sci.INST_FLOW))}
        ${metricBlockF2('INSIDER_FLOW','Insider flow','Sign(Insider Trans)', wrapMetric(sci.INSIDER_FLOW))}
        ${metricBlockF2('TECH_SIGNAL','Technical opinion','Barchart mapping (−1/0/+1)', wrapMetric(sci.TECH_SIGNAL))}
        ${metricBlockF2('CONSENSUS_LEVEL','Consensus level','Analyst avg rating bucket', wrapMetric(sci.CONSENSUS_LEVEL))}
        ${metricBlockF2('CONSISTENCY','Consistency','Stabilità rating 3m', wrapMetric(sci.CONSISTENCY))}
        ${metricBlockF2('NEWS_TONE','News tone','Majority vote 24–48h', wrapMetric(sci.NEWS_TONE))}
        ${metricBlockF2('ANALYST_DELTA','Analyst delta','Segno variazione mediana PT', wrapMetric(sci.ANALYST_DELTA))}
        ${metricBlockF2('IV_STATE','IV state','Percentile IV 52w bucket', wrapMetric(sci.IV_STATE))}
        ${metricBlockF2('PUTCALL_BIAS','Put/Call bias','>1 bearish / <1 bullish', wrapMetric(sci.PUTCALL_BIAS))}
      </div>
    </section>
  `;

  // 3) DPI_context · descrittivo
  const dpi = d?.DPI_context || {};
  const dpiHTML = `
    <section class="tl-panel-section" data-f2-section="dpi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">DPI_context · Contesto prezzo/fondamentali</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('PRICE_TREND','Price trend','Segno della variazione', wrapMetric(dpi.PRICE_TREND))}
        ${metricBlockF2('VOLUME_STATE','Volume state','RelVolume bucket', wrapMetric(dpi.VOLUME_STATE))}
        ${metricBlockF2('MOMENTUM_LABEL','Momentum label','RSI + posizione nel range', wrapMetric(dpi.MOMENTUM_LABEL))}
        ${metricBlockF2('RANGE_LOC','Range location','Bucket del range 52w', wrapMetric(dpi.RANGE_LOC))}
        ${metricBlockF2('MARGIN_HEALTH','Margin health','Media margini bucket', wrapMetric(dpi.MARGIN_HEALTH || dpi.MARGINS_SNAPSHOT))}
        ${metricBlockF2('PROFITABILITY_CLASS','Profitability','ROE/ROA class', wrapMetric(dpi.PROFITABILITY_CLASS))}
        ${metricBlockF2('EARNINGS_TREND','Earnings trend','Direzione vendite/utile', wrapMetric(dpi.EARNINGS_TREND))}
        ${metricBlockF2('BALANCE_SHEET_STRENGTH','Balance sheet','Trend debito/attivo', wrapMetric(dpi.BALANCE_SHEET_STRENGTH))}
        ${metricBlockF2('CASHFLOW_MOMENTUM','Cash‑flow','OCF momentum', wrapMetric(dpi.CASHFLOW_MOMENTUM))}
      </div>
      ${listBlockCardF2('VALUATION_SNAPSHOT', { raw: stringifyKV(dpi.VALUATION_SNAPSHOT) })}
      ${listBlockCardF2('MARGINS_SNAPSHOT', { raw: stringifyKV(dpi.MARGINS_SNAPSHOT) })}
      ${listBlockCardF2('PERF_VECTOR', { raw: Array.isArray(d?.metadata?.PERF_VECTOR)? d.metadata.PERF_VECTOR.join(' | ') : '' })}
    </section>
  `;

  // 4) ICR_tkr · peers & ETF
  const icr = d?.ICR_tkr || {};
  const icrHTML = `
    <section class="tl-panel-section" data-f2-section="icr" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">ICR_tkr · Peers & ETF overlay</div></header>
      ${listBlockCardF2('Peers', { raw: (Array.isArray(icr.PEER_LIST)? icr.PEER_LIST : []).join(', ') })}
      ${listBlockCardF2('ETF List', { raw: (Array.isArray(icr.ETF_LIST)? icr.ETF_LIST : []).join(', ') })}
      ${metricBlockF2('SECTOR_BREADTH','Sector breadth','% peers positivi', wrapMetric(icr.SECTOR_BREADTH))}
      ${metricBlockF2('ETF_FLOW_BIAS','ETF flow bias','Media 1M %Chg', wrapMetric(icr.ETF_FLOW_BIAS))}
    </section>
  `;

  // 5) Barchart · Market & Options (tecnico + vol regime)
  const barchartHTML = `
    <section class="tl-panel-section" data-f2-section="barchart" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Barchart · Market & Options</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('TECH_SIGNAL','Technical opinion','Mapping Buy/Hold/Sell', wrapMetric(d?.SCI_tkr?.TECH_SIGNAL))}
        ${metricBlockF2('REL_VOLUME','Rel Volume','Volume/AvgVolume', wrapMetric(d?.DPI_context?.VOLUME_STATE))}
        ${metricBlockF2('IV_STATE','IV State','Percentile 52w bucket', wrapMetric(d?.SCI_tkr?.IV_STATE))}
        ${metricBlockF2('PUTCALL_BIAS','Put/Call bias','>1 bearish / <1 bullish', wrapMetric(d?.SCI_tkr?.PUTCALL_BIAS))}
      </div>
    </section>
  `;

  // 6) Finviz · Ownership & Insiders
  const finvizHTML = `
    <section class="tl-panel-section" data-f2-section="finviz" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Finviz · Ownership & Insiders</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('INST_FLOW','Institutional flow','Inst Trans sign', wrapMetric(d?.SCI_tkr?.INST_FLOW))}
        ${metricBlockF2('INSIDER_FLOW','Insider flow','Net buying/selling', wrapMetric(d?.SCI_tkr?.INSIDER_FLOW))}
      </div>
      ${listBlockCardF2('Insider notes', { raw: d?.insider_notes || '' })}
    </section>
  `;

  // 7) News & Analysts
  const newsHTML = `
    <section class="tl-panel-section" data-f2-section="news" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">News & Analysts</div></header>
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('NEWS_TONE','News tone','Majority vote 24–48h', wrapMetric(d?.SCI_tkr?.NEWS_TONE))}
        ${metricBlockF2('ANALYST_DELTA','Analyst delta','Segno variazione mediana PT', wrapMetric(d?.SCI_tkr?.ANALYST_DELTA))}
        ${metricBlockF2('CONSENSUS_LEVEL','Consensus level','Avg rating bucket', wrapMetric(d?.SCI_tkr?.CONSENSUS_LEVEL))}
        ${metricBlockF2('CONSISTENCY','Consistency','Stabilità 3m', wrapMetric(d?.SCI_tkr?.CONSISTENCY))}
      </div>
      ${metricBlockF2('HEADLINE_DENSITY','Headline density','Conteggio news/24h', wrapMetric(d?.metadata?.HEADLINE_DENSITY))}
      ${listBlockCardF2('Dominant topic', { raw: d?.metadata?.NEWS_DOMINANT_TOPIC || '' })}
    </section>
  `;

  // 8) Fundamentals (contesto, non valutazione)
  const fundHTML = `
    <section class="tl-panel-section" data-f2-section="fundamentals" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Fundamentals (contesto)</div></header>
      ${listBlockCardF2('VALUATION_SNAPSHOT', { raw: stringifyKV(d?.DPI_context?.VALUATION_SNAPSHOT) })}
      ${listBlockCardF2('MARGINS_SNAPSHOT', { raw: stringifyKV(d?.DPI_context?.MARGINS_SNAPSHOT) })}
      ${metricBlockF2('PROFITABILITY_CLASS','Profitability','ROE/ROA class', wrapMetric(d?.DPI_context?.PROFITABILITY_CLASS))}
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mt-2">
        ${metricBlockF2('TARGET_SPREAD','Target spread','(High-Low)/Mean', wrapMetric(d?.metadata?.TARGET_SPREAD))}
        ${metricBlockF2('UPSIDE_PCT','Upside %','(MeanTarget-Price)/Price', wrapMetric(d?.metadata?.UPSIDE_PCT))}
      </div>
    </section>
  `;

  // 9) Output Composer (preview JSON contract)
  const outHTML = `
    <section class="tl-panel-section" data-f2-section="output" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Output · Contract JSON</div></header>
      ${jsonPreviewCard('Output JSON', buildOutputContractPreview(d))}
    </section>
  `;

  // 10) Audit & MiFID
  const auditHTML = `
    <section class="tl-panel-section" data-f2-section="audit" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Audit & Qualità dati</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChipF2('Confidence', wrapMetric(d?.Confidence))}
        ${qualityChipF2('Coverage', wrapMetric(d?.Quality?.Coverage))}
        ${qualityChipF2('CriticalFields', wrapMetric(d?.Quality?.CriticalFields))}
        ${qualityChipF2('FeedSync', wrapMetric(d?.Quality?.FeedSync))}
      </div>
      ${headlineBlockCardF2('MiFID', d?.mifid?.disclaimer)}
      ${listBlockCardF2('AuditPathID', { raw: d?.AuditPathID || d?.meta?.audit_path_id || '' })}
    </section>
  `;

  return { macroHTML, sciHTML, dpiHTML, icrHTML, barchartHTML, finvizHTML, newsHTML, fundHTML, outHTML, auditHTML };
}

// -----------------------------------------------------------------------------
// SHELL DESKTOP / MOBILE + TAB (stesso pattern F1B)
// -----------------------------------------------------------------------------
function renderF2DesktopShell(sections){
  return `
    <div class="f2-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f2-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
        ${drawerBtn('macro','MacroGate')}
        ${drawerBtn('sci','SCI_tkr')}
        ${drawerBtn('dpi','DPI_context')}
        ${drawerBtn('icr','ICR_tkr')}
        ${drawerBtn('barchart','Barchart · Market & Options')}
        ${drawerBtn('finviz','Finviz · Ownership & Insiders')}
        ${drawerBtn('news','News & Analysts')}
        ${drawerBtn('fundamentals','Fundamentals')}
        ${drawerBtn('output','Output JSON')}
        ${drawerBtn('audit','Audit / MiFID')}
      </aside>
      <main id="f2-scroll-desktop" class="f2-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f2-view="macro">${sections.macroHTML}</div>
        <div data-f2-view="sci" hidden>${sections.sciHTML}</div>
        <div data-f2-view="dpi" hidden>${sections.dpiHTML}</div>
        <div data-f2-view="icr" hidden>${sections.icrHTML}</div>
        <div data-f2-view="barchart" hidden>${sections.barchartHTML}</div>
        <div data-f2-view="finviz" hidden>${sections.finvizHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="fundamentals" hidden>${sections.fundHTML}</div>
        <div data-f2-view="output" hidden>${sections.outHTML}</div>
        <div data-f2-view="audit" hidden>${sections.auditHTML}</div>
      </main>
    </div>`;
}

function renderF2MobileShell(sections){
  const tabs = ['macro','sci','dpi','icr','barchart','finviz','news','fundamentals','output','audit'];
  const pills = tabs.map(k=>mobileTabBtnF2(k, labelForTab(k))).join('');
  return `
    <div class="f2-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      <div class="f2-mobile-tabs" style="display:flex;align-items:center;gap:.5rem;overflow:auto;border-bottom:1px solid var(--br-panel-divider);padding:.6rem .75rem;">${pills}</div>
      <main id="f2-scroll-mobile" class="f2-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f2-view="macro">${sections.macroHTML}</div>
        <div data-f2-view="sci" hidden>${sections.sciHTML}</div>
        <div data-f2-view="dpi" hidden>${sections.dpiHTML}</div>
        <div data-f2-view="icr" hidden>${sections.icrHTML}</div>
        <div data-f2-view="barchart" hidden>${sections.barchartHTML}</div>
        <div data-f2-view="finviz" hidden>${sections.finvizHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="fundamentals" hidden>${sections.fundHTML}</div>
        <div data-f2-view="output" hidden>${sections.outHTML}</div>
        <div data-f2-view="audit" hidden>${sections.auditHTML}</div>
      </main>
    </div>`;
}

function drawerBtn(key,label){
  return `<button class="f1b-tab-btn" data-f2-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
}
function mobileTabBtnF2(key,label){
  return `<button class="f1b-footer-tab-btn" data-f2-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`;
}
function labelForTab(k){
  switch(k){
    case 'macro': return 'MacroGate';
    case 'sci': return 'SCI_tkr';
    case 'dpi': return 'DPI_context';
    case 'icr': return 'ICR_tkr';
    case 'barchart': return 'Barchart · Market & Options';
    case 'finviz': return 'Finviz · Ownership & Insiders';
    case 'news': return 'News & Analysts';
    case 'fundamentals': return 'Fundamentals';
    case 'output': return 'Output JSON';
    case 'audit': return 'Audit/MiFID';
    default: return k;
  }
}

function bindF2Tabs(){
  const btns = document.querySelectorAll('[data-f2-tab]');
  const views = document.querySelectorAll('[data-f2-view]');
  const desk = document.getElementById('f2-scroll-desktop');
  const mob  = document.getElementById('f2-scroll-mobile');
  const sidebar = document.querySelector('.f2-panel-menu');

  function resetScroll(){ [desk,mob,sidebar].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; }); }
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
    views.forEach(v=>{ const k=v.getAttribute('data-f2-view'); const show = (k===active); v.hidden = !show; if(show){ requestAnimationFrame(()=>{ resetScroll(); const header=v.querySelector('.tl-panel-section-title-text'); if(header){ header.setAttribute('tabindex','-1'); try{ header.focus({preventScroll:true}); }catch{} } v.querySelectorAll('[data-scrollable]').forEach(sc=>{ sc.scrollTop=0; sc.scrollLeft=0; }); }); }});
  }
  function activate(k){ styleTabs(k); show(k);} 
  btns.forEach(b=>{ if(b.__f2Bound) return; b.__f2Bound=true; b.addEventListener('click',()=>{ activate(b.getAttribute('data-f2-tab')); }); });
}

// -----------------------------------------------------------------------------
// CARD BUILDERS (stile F1B)
// -----------------------------------------------------------------------------
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
      <div class="flex items-center gap-2"><span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">${value}</span></div>
      <button class="info-btn" data-metric="${escapeAttr(metricKey)}" aria-label="Info ${escapeAttr(metricKey)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc || '')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(metricObj?.ai_note || '')}</div>`;
  return f2Card({ tone: metricObj?.tone, title, bodyHtml, noteHtml: '' });
}

function listBlockCardF2(title, body){
  if (body===undefined || body===null) return '';
  let tone='neutral', raw='';
  if (typeof body==='string'){ raw=body; }
  else { tone=body?.tone||'neutral'; raw=body?.raw||''; }
  return f2Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function headlineBlockCardF2(title, obj){
  if (obj===undefined || obj===null || obj==='') return '';
  let tone='neutral', raw='';
  if (typeof obj==='string'){ raw=obj; }
  else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
  return f2Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function jsonPreviewCard(title, jsonObj){
  const pretty = escapeHtml(JSON.stringify(jsonObj, null, 2));
  const bodyHtml = `<pre class="text-[11.5px] leading-[1.45]">${pretty}</pre>`;
  return f2Card({ tone:'neutral', title, bodyHtml, noteHtml:'' });
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

// -----------------------------------------------------------------------------
// TONE & MAPPINGS
// -----------------------------------------------------------------------------
function toneColorsF2(tone){
  switch((tone||'').toLowerCase()){
    case 'green': return { dotColor:'var(--tone-pos-fg)', textColor:'var(--tone-pos-fg)' };
    case 'yellow': return { dotColor:'var(--tone-warn-fg)', textColor:'var(--tone-warn-fg)' };
    case 'red': return { dotColor:'var(--tone-neg-fg)', textColor:'var(--tone-neg-fg)' };
    default: return { dotColor:'var(--tone-neu-fg)', textColor:'var(--tone-neu-fg)' };
  }
}

function computeHighLevelToneF2Hero(macroGate){
  const g = (macroGate||'').toUpperCase();
  if (g==='PASS')   return { toneLabel:'positive', toneColor:'var(--tone-pos-fg)' };
  if (g==='REVIEW') return { toneLabel:'neutral',  toneColor:'var(--tone-warn-fg)' };
  if (g==='FAIL')   return { toneLabel:'alert',    toneColor:'var(--tone-neg-fg)' };
  return { toneLabel:'neutral', toneColor:'var(--tone-neu-fg)' };
}

function macroToneFromGate(g){
  const t=(g||'').toUpperCase();
  return t==='PASS'?'green': t==='REVIEW'?'yellow': t==='FAIL'?'red':'neutral';
}

function mapMacroGateToMetric(gate, note){
  const tone = macroToneFromGate(gate);
  return { raw: gate || '—', tone, ai_note: note||'' };
}

function wrapMetric(val){
  if (val===undefined || val===null || val==='') return { raw:'—', tone:'neutral' };
  // tono euristico minimo per discrete: green/yellow/red/neutral se già validato a monte
  if (typeof val==='object' && (val.raw!==undefined || val.tone!==undefined)) return val;
  const raw = String(val);
  let tone='neutral';
  const lower = raw.toLowerCase();
  if (['buy','strong_buy','positive','up','+1','bullish_bias'].includes(lower)) tone='green';
  else if (['sell','strong_sell','negative','down','-1','bearish_bias'].includes(lower)) tone='red';
  else if (['hold','flat','neutral','0'].includes(lower)) tone='yellow';
  return { raw, tone };
}

// -----------------------------------------------------------------------------
// OUTPUT PREVIEW BUILDER
// -----------------------------------------------------------------------------
function buildOutputContractPreview(d){
  return {
    Ticker: d?.meta?.ticker || d?.Ticker || '—',
    MacroGate: d?.MacroGate || '—',
    MacroNotes: d?.MacroNotes || [],
    State: d?.State || d?.meta?.state || '—',
    SCI_tkr: d?.MacroGate==='FAIL' ? {} : (d?.SCI_tkr || {}),
    DPI_context: d?.MacroGate==='FAIL' ? {} : (d?.DPI_context || {}),
    ICR_tkr: d?.MacroGate==='FAIL' ? {} : (d?.ICR_tkr || {}),
    metadata: {
      EVENT_LAST_EARNINGS: d?.metadata?.EVENT_LAST_EARNINGS || '',
      POST_EARNINGS_WINDOW: d?.metadata?.POST_EARNINGS_WINDOW || '',
      TARGET_SPREAD: d?.metadata?.TARGET_SPREAD || '',
      UPSIDE_PCT: d?.metadata?.UPSIDE_PCT || '',
      HEADLINE_DENSITY: d?.metadata?.HEADLINE_DENSITY || '',
      NEWS_DOMINANT_TOPIC: d?.metadata?.NEWS_DOMINANT_TOPIC || ''
    },
    Confidence: typeof d?.Confidence==='number' ? d.Confidence : 0.0,
    AuditPathID: d?.AuditPathID || (d?.meta?.audit_path_id || '')
  };
}

function stringifyKV(obj){
  if (!obj || typeof obj!=='object') return '';
  try { return Object.entries(obj).map(([k,v])=>`${k}: ${v}`).join(' | '); } catch { return ''; }
}

// -----------------------------------------------------------------------------
// NORMALIZZAZIONE DATI (schema pubblico F2)
// -----------------------------------------------------------------------------
function normalizeDataF2Public(src={}){
  // fallback intelligenti per mantenere la UI pulita anche con dati scarsi
  return {
    meta: {
      module: src?.meta?.module ?? 'F2_MacroSentiment',
      ticker: src?.meta?.ticker ?? src?.Ticker ?? '—',
      version: src?.meta?.version ?? 'F2.v7.2',
      timestamp_utc: src?.meta?.timestamp_utc ?? '—',
      audit_path_id: src?.meta?.audit_path_id ?? '',
      state: src?.State ?? src?.meta?.state ?? 'ACTIVE',
      freshness: src?.meta?.freshness ?? '≤ T-1',
      hero_intro: src?.meta?.hero_intro ?? '',
      hero_disclaimer: src?.meta?.hero_disclaimer ?? 'Fonti: dati user‑provided Tier‑1 (Finviz, Barchart, Nasdaq, SEC Form 4). Nessun dato web esterno.'
    },

    // Contract 7) Output
    Ticker: src?.Ticker ?? src?.meta?.ticker ?? '—',
    MacroGate: src?.MacroGate ?? 'PASS',
    MacroNotes: Array.isArray(src?.MacroNotes)? src.MacroNotes : (src?.MacroNotes? [String(src.MacroNotes)] : []),
    State: src?.State ?? 'ACTIVE',

    SCI_tkr: src?.SCI_tkr || {},
    DPI_context: src?.DPI_context || {},
    ICR_tkr: src?.ICR_tkr || {},
    metadata: src?.metadata || {},

    Confidence: typeof src?.Confidence==='number' ? src.Confidence : 0.90,
    AuditPathID: src?.AuditPathID ?? src?.meta?.audit_path_id ?? '',

    // quality (opzionale)
    Quality: src?.Quality || { Coverage:{ raw:'≥70%', tone:'green' }, CriticalFields:{ raw:'OK', tone:'green' }, FeedSync:{ raw:'OK', tone:'green' }},

    // note opzionali (es. insider table synth)
    insider_notes: src?.insider_notes || '',
    mifid: src?.mifid || { disclaimer: '' }
  };
}

// -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
