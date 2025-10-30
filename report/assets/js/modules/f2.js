// /report/assets/js/modules/f2.js
//
// F2 · Macro & Sentiment Overlay (3–10 giorni)
// Refactoring v7.3 — 7 sezioni, card colorate, tooltip dinamici (solo ID), nessuna metrica opzioni
//
// Tutto è data-driven: arriva da rawData (JSON).
// I testi dei tooltip (?) NON sono hard-coded: passiamo solo gli ID.
// Lo stile re-usa le classi F1B; ogni card eredita il colore dal tono (green/yellow/red/neutral).
//
// Export
//   renderCard(rawData, ctx?) -> string
//   bindCard(node, rawData, ctx?)

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataF2Public(rawData);

  // KPI HERO
  const kpis = [
    { key: "MacroGate",          label: "MacroGate",  desc: "Esito controlli 48–72h",   metric: d.step1?.MacroGate },
    { key: "SentimentComposite", label: "Sentiment",  desc: "Sintesi multi-fonte",      metric: d.sentiment_flows?.SentimentComposite },
    { key: "ETF_FlowTone",       label: "ETF Flussi", desc: "Bias flussi & breadth",    metric: d.sentiment_flows?.ETF_FlowTone }
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
              ${escapeHtml(d.meta.moduleStatus || "ACTIVE")}
            </span>
            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(d.meta.freshness || "≤ T-1")}</span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Macro overlay, sentiment ticker e fundamentals descrittivi
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            ${escapeHtml(d.meta.hero_intro || "Lettura di contesto non operativa basata su dati Tier-1 forniti dall’utente.")}
            <br/>
            <span class="text-[11px] text-[color:var(--muted)]">Materiale educativo/informativo. Nessuna raccomandazione personale.</span>
          </div>
        </div>
      </header>

      <!-- CARD PRINCIPALE -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;">

        <!-- MacroGate + pill -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
            <span>MacroGate</span>
            <button class="info-btn align-middle" data-metric="MacroGate" aria-label="Info MacroGate">?</button>
          </div>

          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(d.step1?.MacroGate?.raw || "—")}</span>
            <span class="px-[6px] py-[4px] rounded-md text-[11px] font-semibold leading-none border"
              style="background:radial-gradient(circle at 0% 0%, color-mix(in oklab, ${toneColor} 18%, transparent) 0%, transparent 60%), var(--surface-card);color:${toneColor};border-color:${toneColor};box-shadow:var(--shadow-card);">
              ${escapeHtml(toneLabel)}
            </span>
          </div>

          <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(d.step1?.ai_note || "")}</div>
        </div>

        <!-- KPI semaforo -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
          ${kpis.map(metricBoxTrafficLightF2).join("")}
        </div>

        <!-- CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">${escapeHtml(d.meta.hero_disclaimer || "")}</p>
          <div class="flex lg:justify-end">
            <button class="f2-cta-btn" data-open-f2-details="true" type="button"
              style="background:var(--ink);color:var(--surface-page);font-weight:600;font-size:12px;line-height:1.3;border-radius:var(--radius-card-sm);padding:0.5rem 0.75rem;min-width:max-content;border:1px solid var(--ink);box-shadow:var(--shadow-card);">
              Apri dettagli →
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
  if (btn) btn.addEventListener("click", () => openF2DrawerPublic(data));

  if (window.__TradeliaUI?.bindMetricInfoButtons) {
    try { window.__TradeliaUI.bindMetricInfoButtons(node); } catch (_) {}
  }
}

/* -----------------------------------------------------------------------------
   DRAWER (7 sezioni)
----------------------------------------------------------------------------- */
function openF2DrawerPublic(d) {
  if (!window.__TradeliaUI?.openPanel) return;

  const sections = buildSections(d);
  const mobile = isMobile();
  const shell = mobile ? renderMobileShell(sections) : renderDesktopShell(sections);

  window.__TradeliaUI.openPanel({
    title: "F2 · Macro & Sentiment",
    subtitle: "",
    sections: [{ title: "", body: shell, meta: "" }],
    blocking: false,
    panelSize: mobile ? "wide" : "xl",
    footerButtons: mobile ? [] : [{ label: "Chiudi", action: () => window.__TradeliaUI.closePanel() }],
    footerTabs: []
  });

  setTimeout(() => {
    bindTabs();
    if (window.__TradeliaUI?.bindMetricInfoButtons) {
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById("f2-scroll-desktop")); } catch(_) {}
      try { window.__TradeliaUI.bindMetricInfoButtons(document.getElementById("f2-scroll-mobile")); } catch(_) {}
    }
    const first = document.querySelector('[data-f2-tab="risk"]');
    if (first?.click) first.click();
  }, 0);
}

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

/* -----------------------------------------------------------------------------
   SEZIONI (7)
----------------------------------------------------------------------------- */
function buildSections(d) {
  // 1) Controlli rischio
  const riskHTML = `
    <section class="tl-panel-section" data-f2-section="risk" style="background:transparent;border:0;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Controlli rischio (72h)</div></header>
      ${metricBlock("MacroGate", "MacroGate", "Semaforo eventi ravvicinati", d.step1?.MacroGate)}
      ${listBlock("MacroNotes", d.step1?.MacroNotes)}
      ${listBlock("MacroEvents_10d", d.step1?.MacroEvents)}
      ${listBlock("CorpEvents_10d", d.step1?.CorpEvents)}
      ${noteCard("Policy 3–10g", { tone:"neutral", raw:"PASS → esegui pipeline completa · REVIEW → pipeline con confidenza ridotta · FAIL → HOLD" })}
    </section>
  `;

  // 2) Ticker View (SCI, DPI, Fundamentals, ICR)
  const sci = d.sci_dpi || {};
  const dpi = d.dpi || {};
  const icr = d.icr || {};
  const fundamentals = d.fundamentals || {};

  const tickerHTML = `
    <section class="tl-panel-section" data-f2-section="ticker" style="background:transparent;border:0;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Ticker View</div></header>

      <!-- SCI -->
      ${subTitle("SCI · Sentiment discreto")}
      <div class="grid md:grid-cols-2 gap-3">
        ${metricBlock("NEWS_TONE",        "News · Tono",        "Ultime 24–48h",           sci?.NEWS_TONE)}
        ${metricBlock("TECH_SIGNAL",      "Tech Signal",        "Barchart opinion",        sci?.TECH_SIGNAL)}
        ${metricBlock("CONSENSUS_LEVEL",  "Analyst · Consenso", "Media valutazioni",       sci?.CONSENSUS_LEVEL)}
        ${metricBlock("CONSISTENCY",      "Analyst · Stabilità","Trend rating 3m",         sci?.CONSISTENCY)}
      </div>

      <!-- DPI -->
      ${subTitle("DPI · Descrittivo")}
      <div class="grid md:grid-cols-3 gap-3">
        ${metricBlock("VOLUME_STATE",        "Volumi (rel.)",            "Stato volume relativo",  dpi?.VOLUME_STATE)}
        ${metricBlock("MOMENTUM_LABEL",      "Momentum",                 "RSI/bias di fascia",     dpi?.MOMENTUM_LABEL)}
        ${metricBlock("RANGE_LOC",           "Range 52w",                "Posizione nel range",    dpi?.RANGE_LOC)}
        ${metricBlock("PERF_VECTOR",         "Perf Vector",              "Mix brevi periodi",      dpi?.PERF_VECTOR)}
        ${metricBlock("VALUATION_SNAPSHOT",  "Valuation Snapshot",       "Multipli sintetici",     dpi?.VALUATION_SNAPSHOT)}
        ${metricBlock("MARGINS_SNAPSHOT",    "Margins Snapshot",         "Margini chiave",         dpi?.MARGINS_SNAPSHOT)}
      </div>

      <!-- Fundamentals (snapshot + trend) -->
      ${subTitle("Fundamentals Snapshot & Trend")}
      ${fundamentalsBlock(fundamentals)}

      <!-- ICR -->
      ${subTitle("ICR · Peers & ETF overlay")}
      <div class="grid md:grid-cols-3 gap-3">
        ${metricBlock("PEER_LIST","Peer list","Elenco peer", icr?.PEER_LIST)}
        ${metricBlock("ETF_LIST","ETF list","ETF che detengono il titolo", icr?.ETF_LIST)}
        ${metricBlock("PEER_LEADERS","Peer leaders","Top nel gruppo", icr?.PEER_LEADERS)}
        ${metricBlock("PEER_LAGGARDS","Peer laggards","Coda nel gruppo", icr?.PEER_LAGGARDS)}
        ${metricBlock("SECTOR_BREADTH","Sector breadth","Quota titoli in positivo", icr?.SECTOR_BREADTH)}
        ${metricBlock("ETF_FLOW_BIAS","ETF flow bias","Bias flussi 1M", icr?.ETF_FLOW_BIAS)}
      </div>
    </section>
  `;

  // 3) ETF & Positioning (no opzioni)
  const etf = d.etf_exposure || {};
  const pos = d.positioning || {};
  const etfHTML = `
    <section class="tl-panel-section" data-f2-section="etfpos" style="background:transparent;border:0;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">ETF & Positioning</div></header>
      <div class="grid md:grid-cols-3 gap-3">
        ${metricBlock("ETF_FLOW_BIAS","Bias flussi (1M)","Media/ponderata", etf?.ETF_FLOW_BIAS)}
        ${metricBlock("SECTOR_BREADTH","Breadth settore/peers","% positivi", etf?.SECTOR_BREADTH)}
        ${metricBlock("TOP_HOLDING_ETF","Top holding ETF","Maggiore % holding", etf?.TOP_HOLDING_ETF)}
      </div>
      ${etfTop10Cards(etf?.Top10)}
      ${subTitle("Short / Ownership")}
      <div class="grid md:grid-cols-2 gap-3">
        ${metricBlock("SI_LEVEL","Short Float","Livello stimato", pos?.SI_LEVEL)}
        ${metricBlock("DTC_BUCKET","Days to Cover","Bucket", pos?.DTC_BUCKET)}
        ${metricBlock("SI_TREND","Short Trend","Direzione 6 date", pos?.SI_TREND)}
        ${metricBlock("INST_FLOW","Istituzionali","Flusso 3–6m", pos?.INST_FLOW)}
        ${metricBlock("INSIDER_FLOW","Insider","Bias ultimo trimestre", pos?.INSIDER_FLOW)}
      </div>
      ${listBlock("Positioning_note", pos?.ai_note)}
    </section>
  `;

  // 4) Newsflow
  const news = d.newsflow || {};
  const newsHTML = `
    <section class="tl-panel-section" data-f2-section="news" style="background:transparent;border:0;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Newsflow · ultime 24–48h</div></header>
      ${newsCards(news?.Top10, news?.Summary)}
    </section>
  `;

  // 5) Survey
  const surv = d.surveys || {};
  const surveysHTML = `
    <section class="tl-panel-section" data-f2-section="survey" style="background:transparent;border:0;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Survey</div></header>
      <div class="grid md:grid-cols-3 gap-3">
        ${metricBlock("AAII","AAII Bulls-Bears","Spread / z-score", surv?.AAII)}
        ${metricBlock("NAAIM","NAAIM Exposure","Exposure medio",  surv?.NAAIM)}
        ${metricBlock("FearGreed","Fear & Greed","Indice composito", surv?.FearGreed)}
      </div>
      ${listBlock("Survey_note", surv?.ai_note)}
    </section>
  `;

  // 6) Conclusione AI
  const s = d.sintesi_ai || {};
  const points = Array.isArray(s.points) ? s.points.map(conclusionPoint).join("") : "";
  const conclusionHTML = `
    <section class="tl-panel-section" data-f2-section="conclusion" style="background:transparent;border:0;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Conclusione · Tradelia AI (educational)</div></header>
      ${points}
      ${noteCard("Sintesi", s.summary)}
      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">Sezione informativa/formativa. Nessuna istruzione operativa.</div>
    </section>
  `;

  // 7) Audit & MiFID
  const aq = d.audit_quality || {};
  const q = aq?.QualityMetrics || {};
  const auditHTML = `
    <section class="tl-panel-section" data-f2-section="audit" style="background:transparent;border:0;padding:0;">
      <header class="tl-panel-section-title"><div class="tl-panel-section-title-text">Audit & MiFID</div></header>
      <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
        ${qualityChip("FreshnessScore", q?.FreshnessScore || q?.Coverage)}
        ${qualityChip("ConfidenceFinal", q?.ConfidenceFinal)}
        ${qualityChip("DataIntegrity", q?.DataIntegrity)}
        ${qualityChip("FeedSync", q?.FeedSync)}
      </div>
      ${noteCard("AuditPathID", aq?.AuditPathID)}
      ${noteCard("Informativa MiFID", d.mifid?.disclaimer)}
    </section>
  `;

  return { riskHTML, tickerHTML, etfHTML, newsHTML, surveysHTML, conclusionHTML, auditHTML };
}

/* -----------------------------------------------------------------------------
   SHELL + TABS
----------------------------------------------------------------------------- */
function renderDesktopShell(s) {
  return `
    <div class="f1b-panel-desktop" style="display:flex;gap:1rem;height:66vh;">
      <aside class="f1b-panel-menu" style="min-width:180px;max-width:200px;border-right:1px solid var(--br-card);overflow:auto;">
        ${tabBtn("risk","Controlli rischio")}
        ${tabBtn("ticker","Ticker View")}
        ${tabBtn("etfpos","ETF & Positioning")}
        ${tabBtn("news","Newsflow")}
        ${tabBtn("survey","Survey")}
        ${tabBtn("conclusion","Conclusione")}
        ${tabBtn("audit","Audit & MiFID")}
      </aside>

      <main id="f2-scroll-desktop" class="f1b-panel-content flex-1 min-w-0"
        style="height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;">
        <div data-f2-view="risk">${s.riskHTML}</div>
        <div data-f2-view="ticker" hidden>${s.tickerHTML}</div>
        <div data-f2-view="etfpos" hidden>${s.etfHTML}</div>
        <div data-f2-view="news" hidden>${s.newsHTML}</div>
        <div data-f2-view="survey" hidden>${s.surveysHTML}</div>
        <div data-f2-view="conclusion" hidden>${s.conclusionHTML}</div>
        <div data-f2-view="audit" hidden>${s.auditHTML}</div>
      </main>
    </div>
  `;
}

function renderMobileShell(s) {
  const pills = [
    ["risk","Controlli"],
    ["ticker","Ticker"],
    ["etfpos","ETF/Pos"],
    ["news","News"],
    ["survey","Survey"],
    ["conclusion","Conclusione"],
    ["audit","Audit"]
  ].map(([k,l]) => mobileTab(k,l)).join("");

  return `
    <div class="f1b-drawer-mobile" style="display:flex;flex-direction:column;height:calc(100vh - 110px);background:var(--surface-panel-head);">
      <div class="f1b-mobile-tabs-fixed" style="position:relative;display:flex;align-items:center;border-bottom:1px solid var(--br-panel-divider);padding:.6rem .75rem;">
        <div class="f1b-footer-tabs-scroll" style="flex:1;display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;">${pills}</div>
      </div>
      <main id="f2-scroll-mobile" class="f1b-panel-content-mobile flex-1 min-w-0"
        style="overflow:auto;-webkit-overflow-scrolling:touch;padding:1rem;background:var(--surface-page);">
        <div data-f2-view="risk">${s.riskHTML}</div>
        <div data-f2-view="ticker" hidden>${s.tickerHTML}</div>
        <div data-f2-view="etfpos" hidden>${s.etfHTML}</div>
        <div data-f2-view="news" hidden>${s.newsHTML}</div>
        <div data-f2-view="survey" hidden>${s.surveysHTML}</div>
        <div data-f2-view="conclusion" hidden>${s.conclusionHTML}</div>
        <div data-f2-view="audit" hidden>${s.auditHTML}</div>
      </main>
    </div>
  `;
}

function tabBtn(key, label) {
  return `<button class="f1b-tab-btn" data-f2-tab="${escapeAttr(key)}">${escapeHtml(label)}</button>`;
}
function mobileTab(key, label) {
  return `<button class="f1b-footer-tab-btn" data-f2-tab="${escapeAttr(key)}"
    style="flex:0 0 auto;white-space:nowrap;font-size:11px;line-height:1.2;font-weight:500;border-radius:999px;border:1px solid var(--br-soft);background:var(--surface-card);color:var(--muted);padding:.45rem .7rem;box-shadow:var(--shadow-card);">
    ${escapeHtml(label)}</button>`;
}

function bindTabs() {
  const btns = document.querySelectorAll("[data-f2-tab]");
  const views = document.querySelectorAll("[data-f2-view]");
  const desk = document.getElementById("f2-scroll-desktop");
  const mob  = document.getElementById("f2-scroll-mobile");

  function resetScroll(){ [desk,mob].forEach(el => { if(!el) return; el.scrollTop = 0; el.scrollLeft = 0; }); }
  function style(active){
    btns.forEach(b => {
      const on = b.getAttribute("data-f2-tab") === active;
      if (b.classList.contains("f1b-tab-btn")) b.classList.toggle("is-active", on);
      if (b.classList.contains("f1b-footer-tab-btn")) {
        b.style.fontWeight = on ? "600" : "500";
        b.style.border = on ? "1px solid var(--ink)" : "1px solid var(--br-soft)";
        b.style.background = on
          ? "radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)"
          : "var(--surface-card)";
        b.style.color = on ? "var(--ink)" : "var(--muted)";
        b.style.boxShadow = on ? "0 4px 10px rgba(0,0,0,.18)" : "var(--shadow-card)";
      }
    });
  }
  function show(active){
    views.forEach(v => {
      const k = v.getAttribute("data-f2-view");
      v.hidden = (k !== active);
      if (!v.hidden) requestAnimationFrame(() => { resetScroll(); });
    });
  }
  function activate(k){ style(k); show(k); }
  btns.forEach(b => { if(b.__bound) return; b.__bound = true; b.addEventListener("click", () => activate(b.getAttribute("data-f2-tab"))); });
}

/* -----------------------------------------------------------------------------
   CARD BUILDERS (card colorate per tono)
----------------------------------------------------------------------------- */
function colors(tone) {
  const t = (tone||"").toLowerCase();
  if (t === "green")  return { dot:"var(--tone-pos-fg)",  fg:"var(--ink)", bg:"color-mix(in oklab, var(--tone-pos-fg) 9%, var(--surface-card))",  br:"color-mix(in oklab, var(--tone-pos-fg) 40%, var(--br-card))", value:"var(--tone-pos-fg)" };
  if (t === "yellow") return { dot:"var(--tone-warn-fg)", fg:"var(--ink)", bg:"color-mix(in oklab, var(--tone-warn-fg) 9%, var(--surface-card))", br:"color-mix(in oklab, var(--tone-warn-fg) 40%, var(--br-card))", value:"var(--tone-warn-fg)" };
  if (t === "red")    return { dot:"var(--tone-neg-fg)",  fg:"var(--ink)", bg:"color-mix(in oklab, var(--tone-neg-fg) 9%, var(--surface-card))",  br:"color-mix(in oklab, var(--tone-neg-fg) 40%, var(--br-card))", value:"var(--tone-neg-fg)" };
  return { dot:"var(--tone-neu-fg)", fg:"var(--ink)", bg:"var(--surface-card-alt)", br:"var(--br-card)", value:"var(--tone-neu-fg)" };
}

function card({ tone="neutral", title="", body="", note="" }) {
  const c = colors(tone);
  return `
    <div class="mb-3 p-2" style="background:${c.bg};border:1px solid ${c.br};border-radius:var(--radius-card);box-shadow:var(--shadow-card);">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${c.dot};flex-shrink:0;"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">${escapeHtml(title)}</div>
      </div>
      <div class="text-[12.5px] leading-[1.45]" style="color:${c.fg};">${body}</div>
      ${note ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${note}</div>` : ""}
    </div>
  `;
}

function metricBlock(id, title, desc, m) {
  const c = colors(m?.tone);
  const value = formatValue(m?.raw);
  const body = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px]" style="color:${c.value};">${value}</div>
      <button class="info-btn" data-metric="${escapeAttr(id)}" aria-label="Info ${escapeAttr(id)}">?</button>
    </div>
    <div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">${escapeHtml(desc||"")}</div>
    ${m?.ai_note ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(m.ai_note)}</div>` : "" }
  `;
  return card({ tone: m?.tone || "neutral", title, body, note:"" });
}

function listBlock(id, arrOrText) {
  if (arrOrText === undefined || arrOrText === null) return "";
  let tone = "neutral", raw = "";
  if (Array.isArray(arrOrText)) raw = arrOrText.map(x => `• ${String(x)}`).join("\n");
  else if (typeof arrOrText === "object") { tone = arrOrText.tone || "neutral"; raw = arrOrText.raw || ""; }
  else raw = String(arrOrText);
  return card({ tone, title: id, body:`<div class="whitespace-pre-line">${escapeHtml(raw)}</div>` });
}

function noteCard(title, obj) {
  if (obj === undefined || obj === null || obj === "") return "";
  const tone = typeof obj === "object" ? (obj.tone || "neutral") : "neutral";
  const raw  = typeof obj === "object" ? (obj.raw  || "")       : String(obj);
  return card({ tone, title, body:`<div class="whitespace-pre-line">${escapeHtml(raw)}</div>` });
}

function metricBoxTrafficLightF2({ key, label, desc, metric }) {
  const c = colors(metric?.tone);
  return `
    <div class="flex-1 min-w-[90px]" style="background:${c.bg};border:1px solid ${c.br};border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:0.6rem 0.75rem;">
      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${c.dot};"></span>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">${escapeHtml(label)}</div>
        </div>
        <button class="info-btn" data-metric="${escapeAttr(key)}" aria-label="Info ${escapeAttr(key)}">?</button>
      </div>
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${c.value};">${escapeHtml(metric?.raw || "—")}</div>
      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">${escapeHtml(desc || "")}</div>
    </div>
  `;
}

/* --- Fundamentals block (Snapshot + Trend) --- */
function fundamentalsBlock(f) {
  // Snapshot chips (id-only for tooltips)
  const snap = `
    <div class="grid md:grid-cols-3 gap-2">
      ${chip("MarketCap",        f?.MarketCap)}
      ${chip("SharesOut",        f?.SharesOut)}
      ${chip("SalesTTM",         f?.SalesTTM)}
      ${chip("NetIncomeTTM",     f?.NetIncomeTTM)}
      ${chip("EBITTTM",          f?.EBITTTM)}
      ${chip("EBITDATTM",        f?.EBITDATTM)}
      ${chip("Beta60M",          f?.Beta60M)}
      ${chip("PriceSales",       f?.PriceSales)}
      ${chip("PriceCashFlow",    f?.PriceCashFlow)}
      ${chip("PriceBook",        f?.PriceBook)}
      ${chip("PERatioTTM",       f?.PERatioTTM)}
      ${chip("EPSTTM",           f?.EPSTTM)}
      ${chip("DividendYield",    f?.DividendYield)}
      ${chip("LastDividend",     f?.LastDividend)}
      ${chip("LastEarnings",     f?.LastEarnings)}
      ${chip("NextEarnings",     f?.NextEarnings)}
      ${chip("Sector",           f?.Sector)}
      ${chip("Industry",         f?.Industry)}
      ${chip("IndexTags",        f?.IndexTags)}
    </div>
  `;
  const trend = `
    <div class="grid md:grid-cols-3 gap-2 mt-2">
      ${chip("SalesGrowth",          f?.Trend?.SalesGrowth)}
      ${chip("NetIncomeGrowth",      f?.Trend?.NetIncomeGrowth)}
      ${chip("AssetsGrowth",         f?.Trend?.AssetsGrowth)}
      ${chip("LiabilitiesGrowth",    f?.Trend?.LiabilitiesGrowth)}
      ${chip("OpCashFlowGrowth",     f?.Trend?.OpCashFlowGrowth)}
      ${chip("NetCashFlow",          f?.Trend?.NetCashFlow)}
    </div>
  `;
  return card({
    tone: f?.tone || "neutral",
    title: "Fundamentals",
    body: snap + trend,
    note: f?.ai_note ? escapeHtml(f.ai_note) : ""
  });
}

function chip(id, obj) {
  if (!obj) return "";
  const c = colors(obj?.tone);
  return `
    <div class="min-w-[160px]" style="background:${c.bg};border:1px solid ${c.br};border-radius:12px;box-shadow:var(--shadow-card);padding:.6rem .75rem;">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">${escapeHtml(id)}</div>
        <button class="info-btn" data-metric="${escapeAttr(id)}" aria-label="Info ${escapeAttr(id)}">?</button>
      </div>
      <div class="font-mono font-bold text-[13px]" style="color:${c.value};">${formatValue(obj?.raw)}</div>
      ${obj?.ai_note ? `<div class="text-[10px] text-[color:var(--muted)] mt-[4px]">${escapeHtml(obj.ai_note)}</div>` : ""}
    </div>
  `;
}

/* --- ETF Top10 --- */
function etfTop10Cards(top10) {
  const rows = Array.isArray(top10?.rows) ? top10.rows.slice(0,10) : [];
  if (!rows.length) return card({ tone:"neutral", title:"ETF principali (top 10)", body:`<div class='text-[12px] text-[color:var(--muted)]'>N/A</div>` });
  const items = rows.map(r => {
    const [sym, hold, w1, m1, lev] = [r[0], r[1], r[2], r[3], r[4]];
    const inv = /inverse/i.test(String(lev));
    const c = colors(inv ? "red" : "green");
    return `
      <div class="etf-card" style="border:1px solid ${c.br};border-radius:12px;background:${c.bg};box-shadow:var(--shadow-card);padding:.6rem .75rem;">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${c.dot};"></span>
            <div class="text-[12.5px] font-semibold">${escapeHtml(String(sym))}</div>
          </div>
          <span class="text-[10px] uppercase tracking-wide text-[color:var(--muted)]">${escapeHtml(inv ? "Inverse" : "Long")}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-[12px] mt-[2px]">
          <div><div class="text-[10px] text-[color:var(--muted)]">%Hold</div><div class="font-mono">${escapeHtml(String(hold))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">1W %</div><div class="font-mono">${escapeHtml(String(w1))}</div></div>
          <div><div class="text-[10px] text-[color:var(--muted)]">1M %</div><div class="font-mono">${escapeHtml(String(m1))}</div></div>
        </div>
      </div>
    `;
  }).join("");
  return card({ tone: top10?.tone || "neutral", title: "ETF principali (top 10 per % holdings)", body:`<div class="grid gap-2 md:grid-cols-2">${items}</div>` });
}

/* --- News cards --- */
function newsCards(top10, summary) {
  const items = Array.isArray(top10?.rows) ? top10.rows : [];
  const cards = items.slice(0,10).map(r => {
    const [time, source, titleFull, toneRow, comment] = [String(r[0]||""), String(r[1]||""), String(r[2]||""), String(r[3]||"neutral"), String(r[4]||"")];
    const c = colors(toneRow);
    const title = escapeHtml(titleFull.length>100 ? titleFull.slice(0,99)+"…" : titleFull);
    const snippet = escapeHtml((comment || titleFull).slice(0,320) + (comment?.length>320 ? "…" : ""));
    return `
      <article class="newsflow-card" style="border:1px solid ${c.br};border-radius:12px;background:${c.bg};box-shadow:var(--shadow-card);padding:.75rem .85rem;display:flex;flex-direction:column;gap:.35rem;">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="inline-block w-[8px] h-[8px] rounded-full" style="background:${c.dot};"></span>
            <h4 class="text-[13px] font-semibold leading-[1.35] text-[color:${c.fg}]" title="${escapeAttr(titleFull)}">${title}</h4>
          </div>
          <span class="text-[10px] font-mono text-[color:var(--muted)]">${escapeHtml(formatTimeTiny(time))}</span>
        </div>
        <p class="text-[12.5px] leading-[1.5]" style="color:${c.fg};">${snippet}</p>
        <div class="text-[11px] text-[color:var(--muted)] flex items-center justify-between">
          <span>${escapeHtml(source)}</span>
          <span class="uppercase tracking-wide text-[10px]">${escapeHtml(toneRow)}</span>
        </div>
      </article>
    `;
  }).join("");

  const sum = summary ? card({ tone: summary.tone || "neutral", title:"Sintesi (top 10)", body:`<div class="whitespace-pre-line">${escapeHtml(summary.raw || "")}</div>` }) : "";

  return `
    ${sum}
    <div class="hidden md:block"><div class="grid gap-2 md:grid-cols-2">${cards}</div></div>
    <div class="md:hidden"><div class="grid gap-2" style="grid-template-columns:repeat(1,minmax(0,1fr));">${cards || `<div class='text-[12px] text-[color:var(--muted)]'>Nessuna headline disponibile.</div>`}</div></div>
  `;
}

/* --- Conclusion bullets --- */
function conclusionPoint(p = {}) {
  const body = `
    <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">${escapeHtml(p.raw || "")}</div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">${escapeHtml(p.ai_note || "")}</div>
  `;
  return card({ tone: p.tone || "neutral", title: p.title || "", body, note:"" });
}

/* --- Audit chip --- */
function qualityChip(id, q) {
  if (!q) return "";
  const c = colors(q.tone);
  const body = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px]" style="color:${c.value};">${escapeHtml(q.raw || "—")}</div>
      <button class="info-btn" data-metric="${escapeAttr(id)}" aria-label="Info ${escapeAttr(id)}">?</button>
    </div>
    ${q?.ai_note ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">${escapeHtml(q.ai_note)}</div>` : ""}
  `;
  return card({ tone: q.tone, title: id, body, note:"" });
}

/* -----------------------------------------------------------------------------
   NORMALIZZAZIONE DATI
----------------------------------------------------------------------------- */
function normalizeDataF2Public(src = {}) {
  return {
    meta: {
      timestampET:    src?.meta?.timestampET ?? "—",
      module:         src?.meta?.module ?? "F2 · Macro & Sentiment",
      moduleVersion:  src?.meta?.moduleVersion ?? "v7.3",
      moduleStatus:   src?.meta?.moduleStatus ?? "ACTIVE",
      freshness:      src?.meta?.freshness ?? "≤ T-1",
      hero_intro:     src?.meta?.hero_intro ?? "",
      hero_disclaimer:src?.meta?.hero_disclaimer ?? "Contenuto informativo/formativo. Nessuna istruzione operativa."
    },

    // STEP 1: WebProbe
    step1: (() => {
      const s = src?.step1_f2_webprobe || {};
      return {
        MacroGate:   s.MacroGate || { raw:"—", tone:"neutral" },
        MacroNotes:  Array.isArray(s.MacroNotes)  ? s.MacroNotes  : [],
        MacroEvents: Array.isArray(s.MacroEvents) ? s.MacroEvents : [],
        CorpEvents:  Array.isArray(s.CorpEvents)  ? s.CorpEvents  : [],
        ai_note:     s.ai_note || ""
      };
    })(),

    // §4 FEATURE BUILDERS — data buckets
    sci_dpi: src?.SCI_tkr || {},
    dpi:     src?.DPI_context || {},
    icr:     src?.ICR_tkr || {},

    // Fundamentals (snapshot + trend) — user provided
    fundamentals: src?.fundamentals || {
      tone: "neutral",
      MarketCap: {}, SharesOut: {}, SalesTTM: {}, NetIncomeTTM: {}, EBITTTM: {}, EBITDATTM: {},
      Beta60M: {}, PriceSales: {}, PriceCashFlow: {}, PriceBook: {}, PERatioTTM: {}, EPSTTM: {},
      DividendYield: {}, LastDividend: {}, LastEarnings: {}, NextEarnings: {},
      Sector: {}, Industry: {}, IndexTags: {},
      Trend: { SalesGrowth:{}, NetIncomeGrowth:{}, AssetsGrowth:{}, LiabilitiesGrowth:{}, OpCashFlowGrowth:{}, NetCashFlow:{} },
      ai_note: ""
    },

    // ETF exposure (Top10 + bias)
    etf_exposure: src?.etf_exposure || {
      Top10: { tone:"neutral", columns:["ETF","%Hold","1W %","1M %","Leverage"], rows:[] },
      ETF_FLOW_BIAS:   { raw:"—", tone:"neutral" },
      SECTOR_BREADTH:  { raw:"—", tone:"neutral" },
      TOP_HOLDING_ETF: { raw:"—", tone:"neutral" },
      ai_note:""
    },

    // Newsflow
    newsflow: src?.news_stream || {
      Summary: { raw:"", tone:"neutral" },
      Top10:   { tone:"neutral", columns:["Time","Publisher","Headline","Tone","Comment"], rows:[] }
    },

    // Positioning
    positioning: src?.positioning || {
      SI_LEVEL:{ raw:"—", tone:"neutral" },
      DTC_BUCKET:{ raw:"—", tone:"neutral" },
      SI_TREND:{ raw:"—", tone:"neutral" },
      INST_FLOW:{ raw:"—", tone:"neutral" },
      INSIDER_FLOW:{ raw:"—", tone:"neutral" },
      ai_note:""
    },

    // Surveys
    surveys: src?.surveys || {
      AAII:{ raw:"—", tone:"neutral" },
      NAAIM:{ raw:"—", tone:"neutral" },
      FearGreed:{ raw:"—", tone:"neutral" },
      ai_note:""
    },

    // KPI Headline
    sentiment_flows: src?.sentiment_flows || {
      SentimentComposite:{ raw:"—", tone:"neutral" },
      ETF_FlowTone:{ raw:"—", tone:"neutral" }
    },

    // Audit & MiFID + AI conclusion
    audit_quality: (() => {
      const aq = src?.audit_quality || { AuditPathID:"—", QualityMetrics:{} };
      const qm = aq?.QualityMetrics || {};
      if (qm.Coverage && !qm.FreshnessScore) qm.FreshnessScore = qm.Coverage;
      return { ...aq, QualityMetrics: qm };
    })(),
    mifid: src?.mifid || { disclaimer:"" },

    sintesi_ai: src?.sintesi_ai || { points:[], summary:{ raw:"", tone:"neutral" } }
  };
}

/* -----------------------------------------------------------------------------
   UTILS
----------------------------------------------------------------------------- */
function toneFromMacroGate(m) {
  const raw = (m?.raw || m || "").toString().toUpperCase();
  if (raw === "PASS")   return { toneLabel:"ok",     toneColor:"var(--tone-pos-fg)" };
  if (raw === "REVIEW") return { toneLabel:"review", toneColor:"var(--tone-warn-fg)" };
  if (raw === "FAIL")   return { toneLabel:"stop",   toneColor:"var(--tone-neg-fg)" };
  return { toneLabel:"neutral", toneColor:"var(--tone-neu-fg)" };
}

function formatValue(v) {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return escapeHtml(JSON.stringify(v).slice(0,100) + (JSON.stringify(v).length>100 ? "…" : ""));
  if (typeof v === "object") {
    const keys = Object.keys(v);
    const compact = keys.slice(0,6).reduce((acc,k)=>{ acc[k]=v[k]; return acc; },{});
    const s = JSON.stringify(compact);
    return escapeHtml(s.length>120 ? s.slice(0,120)+"…" : s);
  }
  return escapeHtml(String(v));
}

function formatTimeTiny(ts) {
  try {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      const h = String(d.getHours()).padStart(2,"0");
      const m = String(d.getMinutes()).padStart(2,"0");
      return `${h}:${m}`;
    }
  } catch(_) {}
  return String(ts);
}

function subTitle(txt) {
  return `<div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-1 mt-2">${escapeHtml(txt)}</div>`;
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
function escapeAttr(str) {
  if (str === undefined || str === null) return "";
  return String(str).replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
