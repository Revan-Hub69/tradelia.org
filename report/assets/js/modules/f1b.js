// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio (v19-Public compatibile)
// Swing window 3–10 giorni
//
// Questo file è compatibile con IL JSON CHE HAI GIÀ (Breadth_1M, RiskTilt_1M,
// SmallCapPressure_1W, VolRegime, LiquidityRegimeScore, CreditRiskBlock,
// FX_Regime, RegimeScore, StrategyMode_macro, ecc.).
//
// Non richiede FocusSectors, niente pipeline F2, niente sintesi AI custom.
//
// SEZIONI DRAWER (tab):
//  - Regime & Rischio
//  - Breadth & Rotazione
//  - Internals (size bias / microcap stress)
//  - Street View (ANALYSIS_T1_HEADLINES)
//  - Audit
//  - MiFID
//
// Mobile:
//  - tab bar scrollabile in alto
//  - niente footer "Chiudi"
// Desktop:
//  - sidebar stile desk con barra colorata a sinistra
//
// PUBLIC API richiesto da app.js:
//   renderCard(data, ctx)
//   bindCard(node, data, ctx)

///////////////////////
// RENDER CARD (snapshot nel report)
///////////////////////

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublic(rawData);
  const { toneLabel, toneColor } = computeTone(d.strategyModeMacro, d.regimeScoreLabel);

  // KPI rapidi in card
  const kpis = [
    {
      label: "Breadth (1M)",
      metricKey: "Breadth_1M",
      value: d.breadth1M,
      desc: "Ampiezza partecipazione al rialzo"
    },
    {
      label: "RiskTilt",
      metricKey: "RiskTilt_1M",
      value: d.riskTilt1M,
      desc: "Ciclici/Growth vs Difensivi"
    },
    {
      label: "Volatilità",
      metricKey: "VolRegime",
      value: d.volRegime,
      desc: "VIX / oro / hedge appetite"
    }
  ];

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- Headline sezione -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F1B</span>

            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Regime di mercato (swing 3–10g)
            </span>

            <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
              data-state="${escapeAttr(d.moduleState)}"
              style="
                background:var(--surface-card-alt);
                border-color:var(--br-card);
                color:var(--ink);
              ">
              ${escapeHtml(d.moduleState)}
            </span>

            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">
              ${escapeHtml(d.freshnessLabel)}
            </span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Contesto rischio &amp; ampiezza del mercato
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            Momentum del mercato, volatilità implicita, rotazione settoriale e pressione sulle microcap.
            Nessuna raccomandazione operativa.
          </div>
        </div>
      </header>

      <!-- Corpo card principale -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="
          background:var(--surface-card);
          border:1px solid var(--br-card);
          border-radius:var(--radius-card);
          box-shadow:var(--shadow-card);
          padding:1rem;
        ">

        <!-- StrategyMode + tono -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
            <span>StrategyMode</span>
            <button
              class="info-btn align-middle"
              data-metric="StrategyMode_macro"
              aria-label="Info StrategyMode_macro"
            >?</button>
          </div>

          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(d.strategyModeMacro)}</span>

            <span
              class="px-[6px] py-[4px] rounded-md text-[11px] font-semibold leading-none border"
              style="
                background: radial-gradient(circle at 0% 0%,
                  color-mix(in oklab, ${toneColor} 18%, transparent) 0%,
                  transparent 60%
                ),
                var(--surface-card);
                color:${toneColor};
                border-color:${toneColor};
                box-shadow:var(--shadow-card);
              "
            >
              ${escapeHtml(toneLabel)}
            </span>
          </div>
        </div>

        <!-- KPI row -->
        <div class="flex flex-wrap gap-3">
          ${kpis.map(k => metricBoxSnapshot(k)).join("")}
        </div>

        <!-- DISCLAIMER + CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">
            Fonte: Bloomberg · Reuters · FRED · CBOE · Finviz Premium · Treasury curve.
            Dati T-1. Nessuna raccomandazione operativa.
          </p>

          <div class="flex lg:justify-end">
            <button
              class="f1b-cta-btn"
              data-open-f1b-details="true"
              type="button"
              style="
                background:var(--ink);
                color:var(--surface-page);
                font-weight:600;
                font-size:12px;
                line-height:1.3;
                border-radius:var(--radius-card-sm);
                padding:0.5rem 0.75rem;
                min-width:max-content;
                border:1px solid var(--ink);
                box-shadow:var(--shadow-card);
              "
            >
              Dettagli regime →
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublic(rawData);

  // Apri drawer
  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener("click", () => {
      openF1DrawerPublic(data);
    });
  }

  // Tooltip "?"
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (e) {}
  }
}

///////////////////////
// DRAWER OPEN
///////////////////////

function openF1DrawerPublic(data) {
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
    console.warn("openPanel non disponibile");
    return;
  }

  const sectionsObj = buildDrawerSectionsPublic(data);
  const mobileMode = isMobileViewport();

  const drawerHTML = mobileMode
    ? renderDrawerMobileShellPublic(sectionsObj)
    : renderDrawerDesktopShellPublic(sectionsObj);

  window.__TradeliaUI.openPanel({
    title: "F1B · Regime di mercato",
    subtitle: "Volatilità, curva tassi, breadth settoriale e narrativa istituzionale (T-1)",
    sections: [
      {
        title: "",
        body: drawerHTML,
        meta: ""
      }
    ],
    blocking: false,
    panelSize: "wide",
    footerButtons: [], // niente bottone "Chiudi"
    footerTabs: []     // niente footer nav, mobile usa la sua nav in alto
  });

  // bind tab + tooltips
  setTimeout(() => {
    const roots = [
      document.getElementById("panel-body-desktop"),
      document.getElementById("panel-body-mobile"),
      document.getElementById("f1b-mobile-tabbar"),
      document.getElementById("f1b-sidebar")
    ].filter(Boolean);

    roots.forEach(r => {
      bindDrawerTabsPublic(r);
      if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
        try { window.__TradeliaUI.bindMetricInfoButtons(r); } catch (e) {}
      }
    });
  }, 0);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

///////////////////////
// SEZIONI DRAWER
///////////////////////
//
// NOTA: TUTTE QUESTE SEZIONI USANO SOLO CHIAVI CHE HAI GIÀ:
//   StrategyMode_macro
//   RegimeScore
//   VolRegime
//   LiquidityRegimeScore
//   CreditRiskBlock
//   FX_Regime
//   Breadth_1M
//   RiskTilt_1M
//   SizeBias
//   SmallCapPressure_1W
//   ANALYSIS_T1_HEADLINES{T1_MacroNews, T1_SellSideNotes, T1_ConsensusTone, T1_AuditSrc}
//   AuditPathID
//   Timestamp
//   Freshness
//   StatoModulo
//   QUALITY{FreshnessScore, ConfidenceFinal, DataIntegrity, FeedSync}
//
// Se un campo manca verrà mostrato "—". Nessun crash.

function buildDrawerSectionsPublic(d) {
  // REGIME & RISCHIO
  const regimeHTML = `
    <section class="tl-panel-section" data-f1b-section="regime">
      ${sectionTitle("Regime & Rischio")}

      <div class="f1b-grid-metrics">
        ${metricBlock({
          tone: d.toneStrategyMode,
          title: "StrategyMode",
          metricKey: "StrategyMode_macro",
          value: d.strategyModeMacro,
          body: "Stato prevalente: Momentum / Momentum-light / Pullback.\nMomentum = mercato orientato al rischio, volatilità implicita compressa."
        })}

        ${metricBlock({
          tone: d.toneRegimeScore,
          title: "RegimeScore",
          metricKey: "RegimeScore",
          value: d.regimeScoreLabel,
          body: "Score di appetito rischio sintetico (>0 = risk-on): combina volatilità, curva tassi, credito, beta equity."
        })}

        ${metricBlock({
          tone: d.toneVol,
          title: "Volatilità / Hedge",
          metricKey: "VolRegime",
          value: d.volRegime,
          body: "VIX in contrazione? Oro venduto? → mercato sta togliendo coperture difensive e accetta rischio."
        })}

        ${metricBlock({
          tone: d.toneCurve,
          title: "Curva & Costo capitale",
          metricKey: "LiquidityRegimeScore",
          value: d.liquidityRegimeScore,
          body: "Curva Treasury (2Y vs 10Y) e livello dei rendimenti.\nCurva meno stressata = costo del capitale meno punitivo per l'equity."
        })}

        ${metricBlock({
          tone: d.toneCredit,
          title: "Credito",
          metricKey: "CreditRiskBlock",
          value: d.creditRiskBlock,
          body: "Flight to safety sì/no. Se 'benigno', il mercato credito/high beta non sta prezzando crisi imminente."
        })}

        ${metricBlock({
          tone: d.toneFX,
          title: "FX / USD",
          metricKey: "FX_Regime",
          value: d.fxRegime,
          body: "USD leggermente forte → narrativa 'crescita USA' più che panic dollar bid."
        })}
      </div>

      ${textBlock({
        label: "RiskWindow (3–10g)",
        text: d.riskWindow
      })}
    </section>
  `;

  // BREADTH & ROTAZIONE
  const breadthHTML = `
    <section class="tl-panel-section" data-f1b-section="breadth">
      ${sectionTitle("Breadth & Rotazione")}

      <div class="f1b-grid-metrics">
        ${metricBlock({
          tone: d.toneBreadth,
          title: "Breadth (1M)",
          metricKey: "Breadth_1M",
          value: d.breadth1M,
          body: "Ampiezza del rialzo.\n'Ampia' = forza distribuita su più settori, non solo mega-cap Tech."
        })}

        ${metricBlock({
          tone: d.toneRiskTilt,
          title: "RiskTilt",
          metricKey: "RiskTilt_1M",
          value: d.riskTilt1M,
          body: "Ciclici/Growth vs Difensivi puri.\n'Pro-rischio' = denaro su Technology / Discretionary / Comm Services più che su Consumer Defensive."
        })}
      </div>

      ${listBlock({
        label: "Leadership settoriale",
        arr: d.leadersMultiTF,
        helper: "Settori con forza coerente su più timeframe (1D / 1W / 1M / 3M)."
      })}

      ${listBlock({
        label: "Difesa qualitativa",
        arr: d.defensiveLeadership,
        helper: "Difesa 'di qualità bilancio' (Healthcare) vs difesa 'basso beta puro' (Utilities)."
      })}

      ${listBlock({
        label: "Settori in ritardo",
        arr: d.lagging,
        helper: "Settori venduti / hedge inflattivo scaricato."
      })}
    </section>
  `;

  // INTERNALS (size bias, microcap stress)
  const internalsHTML = `
    <section class="tl-panel-section" data-f1b-section="internals">
      ${sectionTitle("Internals")}

      <div class="f1b-grid-metrics">
        ${metricBlock({
          tone: d.toneSizeBias,
          title: "Bias dimensionale",
          metricKey: "SizeBias",
          value: d.sizeBias,
          body: "Flusso tra bucket di capitalizzazione.\nEsempio: 'Mid/Large privilegiate; micro scaricate'."
        })}

        ${metricBlock({
          tone: d.toneSmallCapStress,
          title: "SmallCap / Microcap Stress",
          metricKey: "SmallCapPressure_1W",
          value: d.smallCapHeadline,
          body: "Osserva se le microcap sono sotto pressione (drawdown YTD pesante, funding cost alto) mentre mid/large restano comprate."
        })}
      </div>
    </section>
  `;

  // STREET VIEW (ANALYSIS_T1_HEADLINES)
  const streetHTML = `
    <section class="tl-panel-section" data-f1b-section="street">
      ${sectionTitle("Street View")}

      ${headlineBlock("Macro (Bloomberg / Reuters / Barron's)", d.t1MacroNews)}
      ${headlineBlock("Sell-Side / Street View", d.t1SellSideNotes)}
      ${headlineBlock("Consensus Tone", d.t1ConsensusTone)}

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
        Narrativa istituzionale giornaliera (T-1). Nessuna raccomandazione.
      </div>
    </section>
  `;

  // AUDIT (meta + QUALITÀ feed)
  const auditHTML = `
    <section class="tl-panel-section" data-f1b-section="audit">
      ${sectionTitle("Audit & Qualità")}

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] space-y-3 mb-4">
        ${auditRow("AuditPathID", d.auditPathID)}
        ${auditRow("Timestamp", d.timestamp)}
        ${auditRow("Freshness dati", d.freshnessLabel)}
        ${auditRow("Stato modulo", d.moduleState)}
        ${auditRow("Fonti", (d.sourcesTier1 || []).join(", "))}
      </div>

      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-2 uppercase tracking-wide">
        Qualità feed (semaforo interno)
      </div>

      <div class="f1b-grid-quality">
        ${qualityChip("FreshnessScore", d.quality?.FreshnessScore, "Freschezza feed (T-1 ok).")}
        ${qualityChip("ConfidenceFinal", d.quality?.ConfidenceFinal, "Affidabilità consolidata dei dati negoziati.")}
        ${qualityChip("DataIntegrity", d.quality?.DataIntegrity, "Coerenza serie (microcap possono essere noisy).")}
        ${qualityChip("FeedSync", d.quality?.FeedSync, "Allineamento tra fonti (equity / curve / vol).")}
      </div>

      <div class="mt-4 text-[11px] leading-[1.4] text-[color:var(--muted)]">
        Verde = dati coerenti e aggiornati.
        Giallo = parziale/debole.
        Rosso = dati rumorosi o incompleti.
        Nessuna raccomandazione operativa.
      </div>
    </section>
  `;

  // MiFID
  const mifidHTML = `
    <section class="tl-panel-section" data-f1b-section="mifid">
      ${sectionTitle("MiFID")}
      ${renderMiFIDNotice()}
    </section>
  `;

  return {
    regimeHTML,
    breadthHTML,
    internalsHTML,
    streetHTML,
    auditHTML,
    mifidHTML
  };
}

///////////////////////
// SHELL DESKTOP
///////////////////////

function renderDrawerDesktopShellPublic(sectionsObj) {
  return `
    <div class="f1b-panel-desktop"
      style="
        display:flex;
        flex-direction:row;
        gap:1rem;
        min-height:300px;
      ">

      <!-- Sidebar tab desktop -->
      <aside id="f1b-sidebar"
        style="
          min-width:160px;
          max-width:180px;
          border-right:1px solid var(--br-card);
        ">
        ${desktopTabButton("regime","Regime & Rischio", true)}
        ${desktopTabButton("breadth","Breadth & Rotazione", false)}
        ${desktopTabButton("internals","Internals", false)}
        ${desktopTabButton("street","Street View", false)}
        ${desktopTabButton("audit","Audit", false)}
        ${desktopTabButton("mifid","MiFID", false)}
      </aside>

      <!-- Content -->
      <main class="f1b-panel-content flex-1 min-w-0"
        id="panel-body-desktop"
        style="max-height:75vh;overflow:auto;padding:1rem;">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="breadth" hidden>${sectionsObj.breadthHTML}</div>
        <div data-f1b-view="internals" hidden>${sectionsObj.internalsHTML}</div>
        <div data-f1b-view="street" hidden>${sectionsObj.streetHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}

///////////////////////
// SHELL MOBILE
///////////////////////
//
// Barra tab orizzontale scrollabile in alto.
// Nessun footer con pulsante "Chiudi".

function renderDrawerMobileShellPublic(sectionsObj) {
  return `
    <div class="f1b-drawer-mobile"
      style="
        display:flex;
        flex-direction:column;
        height:100vh;
        max-height:100vh;
      ">

      <nav id="f1b-mobile-tabbar"
        style="
          display:flex;
          flex-wrap:nowrap;
          gap:.5rem;
          overflow-x:auto;
          -webkit-overflow-scrolling:touch;
          padding:.5rem .75rem;
          border-bottom:1px solid var(--br-card);
          background:var(--surface-panel);
        ">
        ${mobileTabButton("regime","Regime", true)}
        ${mobileTabButton("breadth","Breadth", false)}
        ${mobileTabButton("internals","Internals", false)}
        ${mobileTabButton("street","Street", false)}
        ${mobileTabButton("audit","Audit", false)}
        ${mobileTabButton("mifid","MiFID", false)}
      </nav>

      <main class="f1b-panel-content-mobile flex-1 min-w-0"
        id="panel-body-mobile"
        style="
          overflow:auto;
          -webkit-overflow-scrolling:touch;
          padding:1rem;
        ">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="breadth" hidden>${sectionsObj.breadthHTML}</div>
        <div data-f1b-view="internals" hidden>${sectionsObj.internalsHTML}</div>
        <div data-f1b-view="street" hidden>${sectionsObj.streetHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}

///////////////////////
// TAB SWITCHING
///////////////////////

function desktopTabButton(key, label, active) {
  return `
    <button
      class="f1b-tab-btn block w-full text-left text-[12px] leading-[1.4] px-2 py-[6px] ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
      style="
        border-radius:0;
        border-left:3px solid ${active ? "var(--brand-600)" : "transparent"};
        background:transparent;
        font-weight:${active ? "600" : "500"};
        color:${active ? "var(--ink)" : "var(--muted)"};
        text-align:left;
        width:100%;
      "
    >
      ${label}
    </button>
  `;
}

function mobileTabButton(key, label, active) {
  return `
    <button
      class="f1b-footer-tab-btn whitespace-nowrap text-[12px] px-2 py-[6px] rounded-md ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
      style="
        font-weight:${active ? "600" : "500"};
        border:1px solid ${active ? "var(--tone-neu-fg)" : "var(--br-soft)"};
        background:${active
          ? "var(--surface-card-alt)"
          : "var(--surface-card)"};
        color:${active ? "var(--tone-neu-fg)" : "var(--muted)"};
        box-shadow:var(--shadow-card);
      "
    >
      ${label}
    </button>
  `;
}

function bindDrawerTabsPublic(root) {
  if (!root) return;

  const tabButtons = root.querySelectorAll("[data-f1b-tab]");
  const views = document.querySelectorAll("[data-f1b-view]");

  tabButtons.forEach(btn => {
    if (btn.__f1bBound) return;
    btn.__f1bBound = true;

    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-f1b-tab");
      if (!key) return;

      // sincronizza stato attivo su TUTTI i bottoni tab (desktop + mobile)
      const allBtns = document.querySelectorAll("[data-f1b-tab]");
      allBtns.forEach(b => {
        const isActive = b.getAttribute("data-f1b-tab") === key;

        if (b.classList.contains("f1b-tab-btn")) {
          b.style.borderLeftColor = isActive ? "var(--brand-600)" : "transparent";
          b.style.fontWeight = isActive ? "600" : "500";
          b.style.color = isActive ? "var(--ink)" : "var(--muted)";
        }

        if (b.classList.contains("f1b-footer-tab-btn")) {
          b.style.fontWeight = isActive ? "600" : "500";
          b.style.border = isActive
            ? "1px solid var(--tone-neu-fg)"
            : "1px solid var(--br-soft)";
          b.style.background = isActive
            ? "var(--surface-card-alt)"
            : "var(--surface-card)";
          b.style.color = isActive
            ? "var(--tone-neu-fg)"
            : "var(--muted)";
          b.style.boxShadow = "var(--shadow-card)";
        }
      });

      // mostra la vista giusta
      views.forEach(viewEl => {
        const viewKey = viewEl.getAttribute("data-f1b-view");
        viewEl.hidden = viewKey !== key;
      });
    });
  });
}

///////////////////////
// BLOCCHI UI INTERNI
///////////////////////

// Titolo sezione dentro il contenuto
function sectionTitle(txt) {
  return `
    <header class="tl-panel-section-title mb-3">
      <div class="tl-panel-section-title-text text-[14px] font-semibold text-[color:var(--ink)] leading-[1.4]">
        ${escapeHtml(txt)}
      </div>
    </header>
  `;
}

// card metrica semaforica
function metricBlock({ tone, title, metricKey, value, body }) {
  const { dotColor } = toneColors(tone);

  return `
    <div class="f1b-metric-card"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
        padding:0.75rem;
        min-width:0;
      ">
      <div class="flex items-start justify-between gap-2 mb-1 flex-wrap">
        <div class="flex items-center gap-2 min-w-0">
          <span class="inline-block w-[8px] h-[8px] rounded-full"
            style="background:${dotColor};"></span>

          <div class="text-[12px] font-semibold leading-[1.3] text-[color:var(--ink)] break-words">
            ${escapeHtml(title)}
          </div>
        </div>

        <button
          class="info-btn text-[11px] leading-none px-[6px] py-[2px] rounded-md border border-[color:var(--br-card)] bg-[color:var(--surface-card)]"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
          style="color:var(--muted);box-shadow:var(--shadow-card);"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[13px] leading-[1.4] text-[color:var(--ink)] break-words mb-1">
        ${escapeHtml(value)}
      </div>

      <div class="text-[12px] leading-[1.4] text-[color:var(--muted)] whitespace-pre-line">
        ${escapeHtml(body)}
      </div>
    </div>
  `;
}

// blocco testo "risk window"
function textBlock({ label, text }) {
  if (!text) return "";
  return `
    <div class="mt-4">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        ${escapeHtml(label)}
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">
        ${escapeHtml(text)}
      </div>
    </div>
  `;
}

// lista settoriale
function listBlock({ label, arr, helper }) {
  const items = (Array.isArray(arr) && arr.length)
    ? arr.map(it => {
        if (typeof it === "string") return `<li>${escapeHtml(it)}</li>`;
        // fallback oggetto {name, lines[]}
        const lines = [];
        if (it && it.name) lines.push(it.name);
        if (it && Array.isArray(it.lines)) lines.push(...it.lines);
        return `<li>${escapeHtml(lines.join(" · "))}</li>`;
      }).join("")
    : `<li class="text-[color:var(--muted)]">—</li>`;

  return `
    <div class="mt-4">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        ${escapeHtml(label)}
      </div>
      <ul class="list-disc pl-4 space-y-1 text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        ${items}
      </ul>
      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">
        ${escapeHtml(helper || "")}
      </div>
    </div>
  `;
}

// blocco narrativa istituzionale
function headlineBlock(title, body) {
  if (!body) return "";
  return `
    <div class="mb-4">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        ${escapeHtml(title)}
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">
        ${escapeHtml(body)}
      </div>
    </div>
  `;
}

// righe audit (AuditPathID, Timestamp, ecc.)
function auditRow(label, value) {
  return `
    <div>
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        ${escapeHtml(label)}
      </div>
      <div class="font-mono text-[13px] font-bold text-[color:var(--ink)] break-words">
        ${escapeHtml(value || "—")}
      </div>
    </div>
  `;
}

// quality chip (FreshnessScore ecc.)
function qualityChip(metricKey, qObj, helperText) {
  if (!qObj) return "";
  const { dotColor, textColor } = toneColors(qObj.tone);
  const label  = qObj.label || metricKey;
  const value  = qObj.value || "—";

  return `
    <div class="f1b-quality-card"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
        padding:0.75rem;
        min-width:0;
      ">

      <div class="flex items-start justify-between gap-2 mb-1 flex-wrap">
        <div class="flex items-center gap-2 min-w-0">
          <span class="inline-block w-[8px] h-[8px] rounded-full"
            style="background:${dotColor};"></span>

          <div class="text-[11px] font-semibold leading-[1.3] text-[color:var(--ink)] break-words uppercase tracking-wide">
            ${escapeHtml(label)}
          </div>
        </div>

        <button
          class="info-btn text-[11px] leading-none px-[6px] py-[2px] rounded-md border border-[color:var(--br-card)] bg-[color:var(--surface-card)]"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
          style="color:var(--muted);box-shadow:var(--shadow-card);"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[13px] leading-[1.4] mb-1"
        style="color:${textColor};">
        ${escapeHtml(value)}
      </div>

      <div class="text-[12px] leading-[1.4] text-[color:var(--muted)] whitespace-pre-line">
        ${escapeHtml(helperText || "")}
      </div>
    </div>
  `;
}

///////////////////////
// GRID RESPONSIVE
///////////////////////
//
// metriche principali: mobile 1 col, desktop 2 col
// quality audit: mobile 2 col, desktop 4 col

(function injectF1BGridStyles(){
  if (document.getElementById("f1b-grid-styles")) return;
  const styleTag = document.createElement("style");
  styleTag.id = "f1b-grid-styles";
  styleTag.textContent = `
    .f1b-grid-metrics{
      display:grid;
      grid-template-columns:1fr;
      gap:0.75rem;
    }
    @media(min-width:768px){
      .f1b-grid-metrics{
        grid-template-columns:1fr 1fr;
      }
    }

    .f1b-grid-quality{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:0.75rem;
    }
    @media(min-width:768px){
      .f1b-grid-quality{
        grid-template-columns:1fr 1fr 1fr 1fr;
      }
    }
  `;
  document.head.appendChild(styleTag);
})();

///////////////////////
// SEMAFORO COLORI
///////////////////////

function toneColors(tone) {
  switch ((tone || "").toLowerCase()) {
    case "green":
      return {
        dotColor: "var(--tone-pos-fg)",
        textColor: "var(--tone-pos-fg)"
      };
    case "yellow":
      return {
        dotColor: "var(--tone-warn-fg)",
        textColor: "var(--tone-warn-fg)"
      };
    case "red":
      return {
        dotColor: "var(--tone-neg-fg)",
        textColor: "var(--tone-neg-fg)"
      };
    default:
      return {
        dotColor: "var(--tone-neu-fg)",
        textColor: "var(--tone-neu-fg)"
      };
  }
}

///////////////////////
// NORMALIZZAZIONE DATI
///////////////////////
//
// Mapping diretto dal tuo dump reale:
//  - StrategyMode_macro
//  - RegimeScore
//  - Breadth_1M
//  - RiskTilt_1M
//  - SmallCapPressure_1W
//  - SizeBias
//  - VolRegime
//  - LiquidityRegimeScore
//  - CreditRiskBlock
//  - FX_Regime
//  - RiskWindow (FEEDTOF2.RiskWindow o RiskWindow)
//  - ANALYSIS_T1_HEADLINES.*
//  - AuditPathID
//  - Freshness
//  - Stato modulo / StatoModulo
//  - Timestamp
//  - QUALITY{FreshnessScore, ConfidenceFinal, DataIntegrity, FeedSync}
//  - Tone (se ce lo passi) tipo { Breadth_1M:"green", ... }
// Se Tone manca → neutral.

function normalizeDataPublic(src = {}) {
  const d = {};

  d.strategyModeMacro = src.StrategyMode_macro || "—";
  d.regimeScoreLabel  = src.RegimeScore || "—";

  d.breadth1M  = src.Breadth_1M || "—";
  d.riskTilt1M = src.RiskTilt_1M || "—";

  d.sizeBias         = src.SizeBias || "—";
  d.smallCapHeadline = src.SmallCapPressure_1W || "—";

  d.volRegime            = src.VolRegime || "—";
  d.liquidityRegimeScore = src.LiquidityRegimeScore || "—";
  d.creditRiskBlock      = src.CreditRiskBlock || "—";
  d.fxRegime             = src.FX_Regime || "—";

  d.riskWindow =
    (src.FEEDTOF2 && src.FEEDTOF2.RiskWindow) ||
    src.RiskWindow ||
    "";

  d.leadersMultiTF = Array.isArray(src.LeadersMultiTF)
    ? src.LeadersMultiTF
    : (Array.isArray(src.SECTORS?.LeadersMultiTF) ? src.SECTORS.LeadersMultiTF : []);

  d.defensiveLeadership = Array.isArray(src.DefensiveLeadership)
    ? src.DefensiveLeadership
    : (Array.isArray(src.SECTORS?.DefensiveLeadership) ? src.SECTORS.DefensiveLeadership : []);

  d.lagging = Array.isArray(src.Lagging)
    ? src.Lagging
    : (Array.isArray(src.SECTORS?.Lagging) ? src.SECTORS.Lagging : []);

  // Street View
  d.t1MacroNews     = src.ANALYSIS_T1_HEADLINES?.T1_MacroNews     || "";
  d.t1SellSideNotes = src.ANALYSIS_T1_HEADLINES?.T1_SellSideNotes || "";
  d.t1ConsensusTone = src.ANALYSIS_T1_HEADLINES?.T1_ConsensusTone || "";

  d.sourcesTier1 = Array.isArray(src.ANALYSIS_T1_HEADLINES?.T1_AuditSrc)
    ? src.ANALYSIS_T1_HEADLINES.T1_AuditSrc
    : [];

  // Audit meta
  d.auditPathID    = src.AuditPathID || "—";
  d.timestamp      = src.Timestamp || "—";
  d.freshnessLabel = src.Freshness || "≤ T-1";
  d.moduleState    = src["Stato modulo"] || src.StatoModulo || "ACTIVE";

  // QUALITY blocco
  d.quality = src.QUALITY || {};

  // toni semaforo: se non arrivano da backend → neutral
  d.toneStrategyMode   = src.Tone?.StrategyMode_macro   || "neutral";
  d.toneRegimeScore    = src.Tone?.RegimeScore          || "neutral";
  d.toneVol            = src.Tone?.VolRegime            || "neutral";
  d.toneCurve          = src.Tone?.LiquidityRegimeScore || "neutral";
  d.toneCredit         = src.Tone?.CreditRiskBlock      || "neutral";
  d.toneFX             = src.Tone?.FX_Regime            || "neutral";
  d.toneBreadth        = src.Tone?.Breadth_1M           || "neutral";
  d.toneRiskTilt       = src.Tone?.RiskTilt_1M          || "neutral";
  d.toneSizeBias       = src.Tone?.SizeBias             || "neutral";
  d.toneSmallCapStress = src.Tone?.SmallCapPressure_1W  || "neutral";

  return d;
}

///////////////////////
// TONE PILL PER STRATEGYMODE
///////////////////////

function computeTone(strategyModeMacro, regimeScoreLabel) {
  let toneColor = "var(--tone-neu-fg)";
  let toneLabel = "neutral";

  const modeLow = (strategyModeMacro || "").toLowerCase();

  if (modeLow.includes("momentum") && !modeLow.includes("light")) {
    toneColor = "var(--tone-pos-fg)";
    toneLabel = "positive";
  } else if (modeLow.includes("momentum-light")) {
    toneColor = "var(--tone-warn-fg)";
    toneLabel = "neutral";
  } else if (modeLow.includes("pullback")) {
    toneColor = "var(--tone-neg-fg)";
    toneLabel = "alert";
  } else {
    if (
      typeof regimeScoreLabel === "string" &&
      regimeScoreLabel.toLowerCase().includes("neg")
    ) {
      toneColor = "var(--tone-neg-fg)";
      toneLabel = "alert";
    }
  }

  return { toneColor, toneLabel };
}

///////////////////////
// KPI BOX NELLA CARD SNAPSHOT
///////////////////////

function metricBoxSnapshot({ label, metricKey, value, desc }) {
  return `
    <div class="flex-1 min-w-[90px]"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
        padding:0.6rem 0.75rem;
        min-width:0;
      ">

      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">
          ${escapeHtml(label)}
        </div>
        <button
          class="info-btn text-[10px] leading-none px-[4px] py-[1px] rounded-sm border border-[color:var(--br-card)] bg-[color:var(--surface-card)]"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
          style="color:var(--muted);box-shadow:var(--shadow-card);"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[color:var(--ink)] text-[13px] leading-[1.4] break-words">
        ${escapeHtml(value || "—")}
      </div>

      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1 whitespace-pre-line">
        ${escapeHtml(desc || "")}
      </div>
    </div>
  `;
}

///////////////////////
// UTILS HTML / MiFID
///////////////////////

function escapeHtml(str) {
  if (str === undefined || str === null) return "—";
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function escapeAttr(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

function renderMiFIDNotice() {
  return `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--muted)] space-y-2">
      <p>
        Questo materiale descrive uno scenario di mercato basato su dati quantitativi
        e fonti finanziarie primarie. Ha finalità informative e formative.
      </p>
      <p>
        Non costituisce una raccomandazione personalizzata,
        né un invito ad aprire/chiudere posizioni o allocare capitale.
        Prima di qualsiasi decisione reale verifica adeguatezza e appropriatezza
        con un intermediario autorizzato ai sensi MiFID II e della normativa locale.
      </p>
    </div>
  `;
}
