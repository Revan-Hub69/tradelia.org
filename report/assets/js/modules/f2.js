// /report/assets/js/modules/f2.js
//
// F2 · Sentiment & Flussi (allineato al design/logica F1B)
// - Card compatta + Drawer analitico con tutte le sezioni richieste (ETF, Opzioni, Positioning, Survey, Newsflow)
// - Dati dinamici 100% da JSON (f2.json) con tassonomia dichiarata in normalizeDataF2()
// - Nessuna logica operativa (solo informativo/didattico)
//
// Export:
//   renderCard(rawData, ctx?) -> string HTML
//   bindCard(node, rawData, ctx?)

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataF2(rawData);

  // KPI in evidenza (hero) — sintetici F2
  const heroKpis = [
    { key: "SentimentComposite", label: "Sentiment", desc: "Score sintetico (multi‑sorgente)", metric: d.sentiment_flows?.SentimentComposite },
    { key: "OptionsTone", label: "Opzioni", desc: "PCR/Skew/IVRank (z‑score)", metric: d.sentiment_flows?.OptionsTone },
    { key: "ETF_FlowTone", label: "ETF Flussi", desc: "In/Outflow 1D/1W/1M (z) + breadth", metric: d.sentiment_flows?.ETF_FlowTone }
  ];

  const { toneLabel, toneColor } = computeHighLevelToneF2(
    d.sentiment_flows?.SentimentComposite,
    d.sentiment_flows?.ETF_FlowTone
  );

  return `
    <section class="f2-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEAD -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F2</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">Sentiment & Flussi · 3–10 giorni</span>
            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
              style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
              ${escapeHtml(d.meta.moduleStatus || 'ACTIVE')}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || '≤ T-1')}</span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Sentiment aggregato & dinamica dei flussi
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || '')}
            <br/>
            <span class="text-[11px] text-[color:var(--muted)]">Lettura informativa. Non è un'istruzione operativa.</span>
          </div>
        </div>
      </header>

      <!-- CARD PRINCIPALE -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <!-- Sentiment sintetico + tono -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
            <span>Sentiment composito</span>
            <button class="info-btn align-middle" data-metric="SentimentComposite" aria-label="Info Sentiment">?</button>
          </div>

          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(d.sentiment_flows?.SentimentComposite?.raw || '—')}</span>
            <span class="px-[6px] py-[4px] rounded-md text-[11px] font-semibold leading-none border"
              style="background:radial-gradient(circle at 0% 0%, color-mix(in oklab, ${toneColor} 18%, transparent) 0%, transparent 60%), var(--surface-card);color:${toneColor};border-color:${toneColor};box-shadow:var(--shadow-card);">
              ${escapeHtml(toneLabel)}
            </span>
          </div>

          <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(d.sentiment_flows?.SentimentComposite?.ai_note || '')}</div>
        </div>

        <!-- KPI semaforiche -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
          ${heroKpis.map(k => metricBoxTrafficLightF2(k)).join("")}
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
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataF2(rawData);

  const btn = node.querySelector('[data-open-f2-details="true"]');
  if (btn) btn.addEventListener('click', () => openF2Drawer(data));

  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === 'function') {
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch(e){}
  }
}

/* -----------------------------------------------------------------------------
// DRAWER (dettaglio analitico)
// -----------------------------------------------------------------------------*/
function openF2Drawer(d){
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== 'function') return;
  const sections = buildF2Sections(d);
  const mobile = isMobileViewport();
  window.__TradeliaUI.openPanel({
    title: 'F2 · Sentiment & Flussi',
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
    const first = document.querySelector('[data-f2-tab="sentiment"]');
    if (first?.click) first.click();
  },0);
}

function isMobileViewport(){ return window.matchMedia('(max-width: 767px)').matches; }

/* -----------------------------------------------------------------------------
// SEZIONI ANALITICHE
// -----------------------------------------------------------------------------*/
function buildF2Sections(d){
  // 1) Sentiment sintetico & bridge F1
  const sentimentHTML = `
    <section class="tl-panel-section" data-f2-section="sentiment" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Sentiment sintetico</div></header>
      ${metricBlockF2('SentimentComposite','Composito','Media pesata di più indicatori (z‑score / percentile)', d.sentiment_flows.SentimentComposite)}
      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('OptionsTone','Opzioni · Tone','PCR, Skew, IVRank, VIX term structure', d.sentiment_flows.OptionsTone)}
        ${metricBlockF2('ETF_FlowTone','ETF · Flow Tone','In/Outflow 1D/1W/1M + breadth', d.sentiment_flows.ETF_FlowTone)}
      </div>

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mt-2">
        ${metricBlockF2('RiskWindow_F2','RiskWindow (3–10g)','Eventi attesi che possono muovere sentiment/flow', d.sentiment_flows.RiskWindow_F2)}
        ${metricBlockF2('Bridge_F1','Bridge da F1B','Collegamento con regime/volatilità/credito', d.sentiment_flows.Bridge_F1)}
      </div>
    </section>
  `;

  // 2) ETF · Flussi e breadth ETF
  const etf = d.etf_flows;
  const etfHTML = `
    <section class="tl-panel-section" data-f2-section="etf" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">ETF · Flussi & Breadth</div></header>

      ${metricBlockF2('ETF_Breadth1M','ETF Breadth (1M)','% ETF sopra SMA/EMA e % positivi 1M', etf?.Breadth_1M)}

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${tableCard('ETF In/Outflow — 1D', etf?.Flows_1D)}
        ${tableCard('ETF In/Outflow — 1W', etf?.Flows_1W)}
      </div>

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mt-2">
        ${tableCard('ETF In/Outflow — 1M', etf?.Flows_1M)}
        ${tableCard('ETF per Tema/Sector', etf?.ByThemeSector)}
      </div>

      ${listBlockCardF2('Note ETF / osservazioni', etf?.ai_note)}
    </section>
  `;

  // 3) Opzioni · PCR / Skew / IV / VIX term
  const opt = d.options_data;
  const optionsHTML = `
    <section class="tl-panel-section" data-f2-section="options" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Opzioni · Posizionamento e Volatilità</div></header>

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('PCR_Total','Put/Call Ratio (Total)','Livello e z‑score vs storico', opt?.PCR_Total)}
        ${metricBlockF2('PCR_Equity','Put/Call Ratio (Equity)','Esclude index/ETF', opt?.PCR_Equity)}
        ${metricBlockF2('Skew_25d','Skew 25Δ','Smile/Skew implicita', opt?.Skew_25d)}
        ${metricBlockF2('IV_Rank','IV Rank / Percentile','Posizionamento vol implicita', opt?.IV_Rank)}
      </div>

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mt-2">
        ${metricBlockF2('VIX_Term','VIX Term Structure','Contango/Backwardation + z‑score', opt?.VIX_Term)}
        ${metricBlockF2('VVIX','VVIX / Vol di VIX','Tone volatilità di volatilità', opt?.VVIX)}
      </div>

      ${metricBlockF2('ZeroDTE','0DTE / Gamma‑day','Quota volumi 0DTE / gamma day qualitativo', opt?.ZeroDTE)}
      ${listBlockCardF2('Osservazioni Opzioni', opt?.ai_note)}
    </section>
  `;

  // 4) Positioning & Exposure (CFTC, Dealers/CTA)
  const pos = d.positioning;
  const positioningHTML = `
    <section class="tl-panel-section" data-f2-section="positioning" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Positioning & Exposure</div></header>

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('CFTC_EquityIdx','CFTC · Equity Index','E‑mini/NDX/RTY Net (Δ WoW)', pos?.CFTC_EquityIdx)}
        ${metricBlockF2('DealersGamma','Dealer Gamma','Esposizione gamma stimata (market‑wide)', pos?.DealersGamma)}
        ${metricBlockF2('CTA_Tilt','CTA Tilt','Direzione e forza stimate', pos?.CTA_Tilt)}
        ${metricBlockF2('HF_Beta','Hedge Fund Beta','Beta‑to‑NDX/SPX stimata', pos?.HF_Beta)}
      </div>

      ${listBlockCardF2('Osservazioni Positioning', pos?.ai_note)}
    </section>
  `;

  // 5) Survey & Sentiment retail/pro · AAII, NAAIM, Fear&Greed
  const surv = d.surveys;
  const surveysHTML = `
    <section class="tl-panel-section" data-f2-section="surveys" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Survey · Retail/Pro</div></header>

      <div class="grid md:grid-cols-3 gap-3 text-[12px] leading-[1.4]">
        ${metricBlockF2('AAII','AAII Bulls‑Bears','Spread e z‑score', surv?.AAII)}
        ${metricBlockF2('NAAIM','NAAIM Exposure','Exposure medio (pts)', surv?.NAAIM)}
        ${metricBlockF2('FearGreed','Fear & Greed','Score headline e componenti', surv?.FearGreed)}
      </div>

      ${listBlockCardF2('Note Survey', surv?.ai_note)}
    </section>
  `;

  // 6) Newsflow · Tier‑1 / Sell‑side
  const street = d.street_view;
  const newsHTML = `
    <section class="tl-panel-section" data-f2-section="news" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Street View · Newsflow</div></header>
      ${headlineBlockCardF2('Macro (Tier‑1)', street?.T1_MacroNews)}
      ${headlineBlockCardF2('Sell‑Side', street?.T1_SellSideNotes)}
      ${headlineBlockCardF2('Consensus Tone', street?.T1_ConsensusTone)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4]">${escapeHtml(street?.ai_note || '')}</div>
    </section>
  `;

  // 7) Conclusione educativa
  const synth = d.sintesi_ai;
  const sintesiHTML = `
    <section class="tl-panel-section" data-f2-section="sintesi" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Conclusione · Tradelia AI (educational)</div></header>
      ${Array.isArray(synth?.points) ? synth.points.map(p => conclusionPointBlockF2(p)).join('') : ''}
      ${headlineBlockCardF2('Lettura di contesto (non operativa)', synth?.summary)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">Materiale informativo/formativo. Nessuna istruzione operativa o personalizzata.</div>
    </section>
  `;

  // 8) Audit & MiFID
  const auditHTML = `
    <section class="tl-panel-section" data-f2-section="audit" style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Audit & Qualità dati</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChipF2('FreshnessScore', d.audit_quality?.QualityMetrics?.FreshnessScore)}
        ${qualityChipF2('ConfidenceFinal', d.audit_quality?.QualityMetrics?.ConfidenceFinal)}
        ${qualityChipF2('DataIntegrity', d.audit_quality?.QualityMetrics?.DataIntegrity)}
        ${qualityChipF2('FeedSync', d.audit_quality?.QualityMetrics?.FeedSync)}
      </div>
      ${headlineBlockCardF2('MiFID', d.mifid?.disclaimer)}
    </section>
  `;

  return { sentimentHTML, etfHTML, optionsHTML, positioningHTML, surveysHTML, newsHTML, sintesiHTML, auditHTML };
}

/* -----------------------------------------------------------------------------
// SHELL DESKTOP / MOBILE + TAB
// -----------------------------------------------------------------------------*/
function renderF2DesktopShell(sections){
  return `
    <div class="f2-panel-desktop" style="display:flex;flex-direction:row;gap:1rem;height:66vh;">
      <aside class="f2-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);height:100%;overflow:auto;">
        ${drawerBtn('sentiment','Sentiment')}
        ${drawerBtn('etf','ETF Flussi')}
        ${drawerBtn('options','Opzioni/Vol')}
        ${drawerBtn('positioning','Positioning')}
        ${drawerBtn('surveys','Survey')}
        ${drawerBtn('news','Street View')}
        ${drawerBtn('sintesi','Conclusione')}
        ${drawerBtn('audit','Audit/MiFID')}
      </aside>
      <main id="f2-scroll-desktop" class="f2-panel-content flex-1 min-w-0" style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f2-view="sentiment">${sections.sentimentHTML}</div>
        <div data-f2-view="etf" hidden>${sections.etfHTML}</div>
        <div data-f2-view="options" hidden>${sections.optionsHTML}</div>
        <div data-f2-view="positioning" hidden>${sections.positioningHTML}</div>
        <div data-f2-view="surveys" hidden>${sections.surveysHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="sintesi" hidden>${sections.sintesiHTML}</div>
        <div data-f2-view="audit" hidden>${sections.auditHTML}</div>
      </main>
    </div>`;
}

function renderF2MobileShell(sections){
  const tabs = ['sentiment','etf','options','positioning','surveys','news','sintesi','audit'];
  const pills = tabs.map(k=>mobileTabBtnF2(k, labelForTab(k))).join('');
  return `
    <div class="f2-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);max-height:calc(100vh - 110px);min-height:300px;background:var(--surface-panel-head);">
      <div class="f2-mobile-tabs" style="display:flex;align-items:center;gap:.5rem;overflow:auto;border-bottom:1px solid var(--br-panel-divider);padding:.6rem .75rem;">${pills}</div>
      <main id="f2-scroll-mobile" class="f2-panel-content-mobile flex-1 min-w-0" style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f2-view="sentiment">${sections.sentimentHTML}</div>
        <div data-f2-view="etf" hidden>${sections.etfHTML}</div>
        <div data-f2-view="options" hidden>${sections.optionsHTML}</div>
        <div data-f2-view="positioning" hidden>${sections.positioningHTML}</div>
        <div data-f2-view="surveys" hidden>${sections.surveysHTML}</div>
        <div data-f2-view="news" hidden>${sections.newsHTML}</div>
        <div data-f2-view="sintesi" hidden>${sections.sintesiHTML}</div>
        <div data-f2-view="audit" hidden>${sections.auditHTML}</div>
      </main>
    </div>`;
}

function drawerBtn(key,label){
  return `<button class="f2-tab-btn" data-f2-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
}
function mobileTabBtnF2(key,label){
  return `<button class="f2-footer-tab-btn" data-f2-tab="${escapeAttr(key)}" style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);min-width:max-content;">${escapeHtml(label)}</button>`;
}
function labelForTab(k){
  switch(k){
    case 'sentiment': return 'Sentiment';
    case 'etf': return 'ETF Flussi';
    case 'options': return 'Opzioni/Vol';
    case 'positioning': return 'Positioning';
    case 'surveys': return 'Survey';
    case 'news': return 'Street View';
    case 'sintesi': return 'Conclusione';
    case 'audit': return 'Audit/MiFID';
    default: return k;
  }
}

function bindF2Tabs(){
  const btns = document.querySelectorAll('[data-f2-tab]');
  const views = document.querySelectorAll('[data-f2-view]');
  const desk = document.getElementById('f2-scroll-desktop');
  const mob  = document.getElementById('f2-scroll-mobile');

  function resetScroll(){ [desk,mob].forEach(el=>{ if(!el) return; el.scrollTop=0; el.scrollLeft=0; }); }
  function styleTabs(active){
    btns.forEach(b=>{
      const on = b.getAttribute('data-f2-tab')===active;
      if (b.classList.contains('f2-tab-btn')) b.classList.toggle('is-active', on);
      if (b.classList.contains('f2-footer-tab-btn')){
        if(on){ b.style.fontWeight='600'; b.style.border='1px solid var(--ink)'; b.style.background='radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)'; b.style.color='var(--ink)'; b.style.boxShadow='0 4px 10px rgba(0,0,0,.18)'; }
        else { b.style.fontWeight='500'; b.style.border='1px solid var(--br-soft)'; b.style.background='var(--surface-card)'; b.style.color='var(--muted)'; b.style.boxShadow='var(--shadow-card)'; }
      }
    });
  }
  function show(active){
    views.forEach(v=>{ const k=v.getAttribute('data-f2-view'); v.hidden = (k!==active); if(!v.hidden){ requestAnimationFrame(()=>{ resetScroll(); }); }});
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

function tableCard(title, tbl){
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
  if (!body) return '';
  const b = typeof body==='string' ? body : (body?.raw || '');
  const tone = (typeof body==='object' && body?.tone) ? body.tone : 'neutral';
  const note = (typeof body==='object' && body?.ai_note) ? body.ai_note : '';
  return f2Card({ tone, title, bodyHtml: `<div class='whitespace-pre-line'>${escapeHtml(b)}</div>`, noteHtml: escapeHtml(note) });
}

function headlineBlockCardF2(title, obj){
  if (obj===undefined || obj===null) return '';
  let tone='neutral', raw='';
  if (typeof obj==='string'){ raw=obj; }
  else { tone=obj?.tone||'neutral'; raw=obj?.raw||''; }
  return f2Card({ tone, title, bodyHtml:`<div class='whitespace-pre-line'>${escapeHtml(raw)}</div>`, noteHtml:'' });
}

function conclusionPointBlockF2(p={}){
  const tone = p.tone || 'neutral';
  const bodyHtml = `
    <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">${escapeHtml(p.raw||'')}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(p.ai_note||'')}</div>`;
  return f2Card({ tone, title: p.title||'', bodyHtml, noteHtml:'' });
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

function computeHighLevelToneF2(sentComposite, etfTone){
  const scTone = (sentComposite?.tone)||'';
  const etfT   = (etfTone?.tone)||'';
  // priorità: se entrambi verdi -> positive, se discrepanza -> neutral, se rossi -> alert
  let toneLabel='neutral', toneColor='var(--tone-neu-fg)';
  const map = t=> t==='green'?'pos': t==='red'?'neg':'neu';
  const a = map((scTone||'').toLowerCase());
  const b = map((etfT||'').toLowerCase());
  if (a==='pos' && b==='pos'){ toneLabel='positive'; toneColor='var(--tone-pos-fg)'; }
  else if (a==='neg' && b==='neg'){ toneLabel='alert'; toneColor='var(--tone-neg-fg)'; }
  else { toneLabel='neutral'; toneColor='var(--tone-warn-fg)'; }
  return { toneLabel, toneColor };
}

/* -----------------------------------------------------------------------------
// NORMALIZZAZIONE DATI (schema f2.json)
// -----------------------------------------------------------------------------*/
function normalizeDataF2(src={}){
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? '—',
      module: src?.meta?.module ?? 'F2 · Sentiment & Flussi',
      moduleVersion: src?.meta?.moduleVersion ?? 'vX',
      moduleStatus: src?.meta?.moduleStatus ?? 'ACTIVE',
      freshness: src?.meta?.freshness ?? '≤ T-1',
      hero_intro: src?.meta?.hero_intro ?? 'Lettura del sentiment aggregato e dei flussi (ETF, opzioni, positioning).',
      hero_disclaimer: src?.meta?.hero_disclaimer ?? 'Contenuto educativo/informativo. Non è consulenza personalizzata.'
    },

    sentiment_flows: src?.sentiment_flows || {
      SentimentComposite: { raw:'—', tone:'neutral', ai_note:'' },
      OptionsTone: { raw:'—', tone:'neutral', ai_note:'' },
      ETF_FlowTone: { raw:'—', tone:'neutral', ai_note:'' },
      RiskWindow_F2: { raw:'—', tone:'neutral', ai_note:'' },
      Bridge_F1: { raw:'—', tone:'neutral', ai_note:'' }
    },

    etf_flows: src?.etf_flows || {
      Breadth_1M: { raw:'—', tone:'neutral', ai_note:'' },
      Flows_1D: { tone:'neutral', columns: ['ETF','Flow','z','Note'], rows: [] },
      Flows_1W: { tone:'neutral', columns: ['ETF','Flow','z','Note'], rows: [] },
      Flows_1M: { tone:'neutral', columns: ['ETF','Flow','z','Note'], rows: [] },
      ByThemeSector: { tone:'neutral', columns: ['Tema/Sector','Net Flow','Breadth','Note'], rows: [] },
      ai_note: ''
    },

    options_data: src?.options_data || {
      PCR_Total: { raw:'—', tone:'neutral', ai_note:'' },
      PCR_Equity: { raw:'—', tone:'neutral', ai_note:'' },
      Skew_25d: { raw:'—', tone:'neutral', ai_note:'' },
      IV_Rank: { raw:'—', tone:'neutral', ai_note:'' },
      VIX_Term: { raw:'—', tone:'neutral', ai_note:'' },
      VVIX: { raw:'—', tone:'neutral', ai_note:'' },
      ZeroDTE: { raw:'—', tone:'neutral', ai_note:'' },
      ai_note: ''
    },

    positioning: src?.positioning || {
      CFTC_EquityIdx: { raw:'—', tone:'neutral', ai_note:'' },
      DealersGamma: { raw:'—', tone:'neutral', ai_note:'' },
      CTA_Tilt: { raw:'—', tone:'neutral', ai_note:'' },
      HF_Beta: { raw:'—', tone:'neutral', ai_note:'' },
      ai_note: ''
    },

    surveys: src?.surveys || {
      AAII: { raw:'—', tone:'neutral', ai_note:'' },
      NAAIM: { raw:'—', tone:'neutral', ai_note:'' },
      FearGreed: { raw:'—', tone:'neutral', ai_note:'' },
      ai_note: ''
    },

    street_view: src?.street_view || {
      T1_MacroNews: '',
      T1_SellSideNotes: '',
      T1_ConsensusTone: '',
      ai_note: ''
    },

    sintesi_ai: src?.sintesi_ai || { points: [], summary: '' },

    audit_quality: src?.audit_quality || { AuditPathID:'—', SourcesTier1:[], Freshness:'—', ModuleStatus:'—', QualityMetrics:{} },

    mifid: src?.mifid || { disclaimer: '' }
  };
}

/* -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------*/
function escapeHtml(str){ if(str===undefined||str===null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function escapeAttr(str){ if(str===undefined||str===null) return ''; return String(str).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
