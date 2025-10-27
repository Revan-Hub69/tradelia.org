// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio (public dashboard)
// Snapshot swing 3–10 giorni
//
// Questo modulo renderizza:
//  - Card riassuntiva con CTA "Dettagli regime →"
//  - Drawer/panel con 7 sezioni/tab:
//      1. Regime & Rischio
//      2. Breadth & Rotazione
//      3. Internals (dati grezzi)
//      4. Street View (narrativa istituzionale)
//      5. Sintesi Tradelia AI
//      6. Audit & Qualità
//      7. MiFID
//
// Ogni metrica ha {raw, tone, ai_note} e un "?" che punta al glossario
// tramite window.__TradeliaUI.bindMetricInfoButtons.
//
// Esportiamo per app.js runtime:
//   renderCard(data, ctx)
//   bindCard(node, data, ctx)

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1B(rawData);

  // Per la card breve mostriamo:
  // - StrategyMode_macro
  // - RegimeScore
  // - VolRegime
  // (tutte con semaforo e "?" tooltip)
  const kpis = [
    {
      key: "StrategyMode_macro",
      label: "StrategyMode",
      desc: "Modalità regime (Momentum / Pullback / Neutral)",
      metric: d.regime_and_risk.StrategyMode_macro
    },
    {
      key: "RegimeScore",
      label: "RegimeScore",
      desc: "Appetito rischio sintetico",
      metric: d.regime_and_risk.RegimeScore
    },
    {
      key: "VolRegime",
      label: "Volatilità",
      desc: "VIX / oro / hedge appetite",
      metric: d.regime_and_risk.VolRegime
    }
  ];

  // Pill tono generale = StrategyMode_macro
  const { toneLabel, toneColor } = computeHighLevelTone(
    d.regime_and_risk.StrategyMode_macro,
    d.regime_and_risk.RegimeScore
  );

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
              data-state="${escapeAttr(d.meta.moduleStatus || 'ACTIVE')}"
              style="
                background:var(--surface-card-alt);
                border-color:var(--br-card);
                color:var(--ink);
              ">
              ${escapeHtml(d.meta.moduleStatus || "ACTIVE")}
            </span>

            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">
              ${escapeHtml(d.meta.freshness || "≤ T-1")}
            </span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Contesto rischio &amp; ampiezza del mercato
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            Regime corrente (Momentum / Pullback), partecipazione al rialzo
            e stato del credito/curve. Dati educativi, non operativi.
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

        <!-- StrategyMode + tono pill -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex flex-wrap items-center gap-1.5">
            <span>StrategyMode</span>
            <button
              class="info-btn align-middle"
              data-metric="StrategyMode_macro"
              aria-label="Info StrategyMode"
            >?</button>
          </div>

          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(d.regime_and_risk.StrategyMode_macro.raw || "—")}</span>

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

          <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
            ${escapeHtml(d.regime_and_risk.StrategyMode_macro.ai_note || "")}
          </div>
        </div>

<!-- KPI row semaforiche -->
<div class="grid gap-3 grid-cols-2 md:grid-cols-3">
  ${kpis.map(k => metricBoxTrafficLight(k)).join("")}
</div>


        <!-- DISCLAIMER + CTA ROW -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">
            F1B è un quadro informativo sul regime di mercato (volatilità, credito,
            curva tassi, breadth settoriale). Nessuna raccomandazione personale.
            Fonti: Bloomberg, Reuters, CBOE, FRED, Finviz Premium, ETFdb.
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

// bindCard: apre il drawer e lega tooltip
export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublicF1B(rawData);

  // CTA -> apre pannello dettagli
  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener("click", () => {
      openF1DrawerPublic(data);
    });
  }

  // Tooltip "?" nella card
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (e) {}
  }
}

/* -------------------------------------------------
   Drawer / Panel con sezioni pubbliche
------------------------------------------------- */

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

  // Tab bar (mobile footer) e mapping sezione->etichetta
  const tabDefs = [
    { key: "regime",    label: "Regime" },
    { key: "breadth",   label: "Breadth" },
    { key: "internals", label: "Internals" },
    { key: "street",    label: "Street" },
    { key: "sintesi",   label: "Sintesi AI" },
    { key: "audit",     label: "Audit" },
    { key: "mifid",     label: "MiFID" }
  ];

  const footerButtonsDesktop = [
    {
      label: "Chiudi",
      action: () => {
        window.__TradeliaUI.closePanel();
      }
    }
  ];

  window.__TradeliaUI.openPanel({
    title: "F1B · Regime di mercato",
    subtitle: "",
    sections: [
      {
        title: "",
        body: drawerHTML,
        meta: ""
      }
    ],
    blocking: false,
  panelSize: mobileMode ? "wide" : "xl",
    footerButtons: mobileMode ? [] : footerButtonsDesktop,
    footerTabs: []
  });

  // post-mount binding (tab switching + tooltip binding interno)
  setTimeout(() => {
    const roots = [
      document.getElementById("panel-body"),
      document.getElementById("panel-body-mobile"),
      document.getElementById("panel-footer-mobile")
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

/* -------------------------------------------------
   Sezioni logiche drawer (pubbliche)
------------------------------------------------- */

function buildDrawerSectionsPublic(d) {
  // 1. Regime & Rischio
  const regimeHTML = `
  <section class="tl-panel-section" data-f1b-section="regime"
    style="
      background:transparent;
      border:0;
      border-radius:0;
      box-shadow:none;
      padding:0;
    "
  >
    <header class="tl-panel-section-title">
      <div class="tl-panel-section-title-text">
        Regime &amp; Rischio
      </div>
    </header>

    <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
      ${metricBlock("StrategyMode_macro", "StrategyMode", "Modalità corrente del mercato", d.regime_and_risk.StrategyMode_macro)}
      ${metricBlock("RegimeScore", "RegimeScore", "Appetito rischio sintetico", d.regime_and_risk.RegimeScore)}
      ${metricBlock("VolRegime", "Volatilità / Hedge", "VIX, oro, appetito hedge", d.regime_and_risk.VolRegime)}
      ${metricBlock("LiquidityRegimeScore", "Curva & Costo capitale", "Curve Treasury / funding stress", d.regime_and_risk.LiquidityRegimeScore)}
      ${metricBlock("CreditRiskBlock", "Credito", "Flight-to-safety / high beta credit", d.regime_and_risk.CreditRiskBlock)}
      ${metricBlock("FX_Regime", "FX / USD", "Dollar tone", d.regime_and_risk.FX_Regime)}
    </div>

    <div class="mt-4">
      ${metricBlock("RiskWindow", "RiskWindow (3–10g)", "Driver macro monitorati a breve", d.regime_and_risk.RiskWindow)}
    </div>
  </section>
`;


  // 2. Breadth & Rotazione
  const breadthHTML = `
  <section class="tl-panel-section" data-f1b-section="breadth"
    style="
      background:transparent;
      border:0;
      border-radius:0;
      box-shadow:none;
      padding:0;
    "
  >
    <header class="tl-panel-section-title">
      <div class="tl-panel-section-title-text">
        Breadth &amp; Rotazione Equity
      </div>
    </header>

    <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mb-4">
      ${metricBlock("Breadth_1M", "Breadth (1M)", "% settori verdi su 30g", d.breadth_rotation.Breadth_1M)}
      ${metricBlock("RiskTilt_1M", "RiskTilt (1M)", "Ciclici/growth vs difensivi", d.breadth_rotation.RiskTilt_1M)}
      ${metricBlock("SmallCapPressure_1W", "SmallCap Pressure (1W)", "Microcap vs Mid/Large", d.breadth_rotation.SmallCapPressure_1W)}
      ${metricBlock("IndexMomentum_1W", "Index Momentum (1W)", "Momentum cross-indici e crypto", d.breadth_rotation.IndexMomentum_1W)}
      ${metricBlock("SizeBias", "Size Bias", "Preferenza di capitalizzazione", d.breadth_rotation.SizeBias)}
    </div>

    <div class="grid gap-4 text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
      ${sectorListDetailed(
        "Leadership multi-timeframe",
        d.breadth_rotation.Leadership?.LeadersMultiTF
      )}
      ${sectorListDetailed(
        "Leadership difensiva qualitativa",
        d.breadth_rotation.Leadership?.DefensiveLeadership
      )}
      ${sectorListDetailed(
        "Settori in ritardo",
        d.breadth_rotation.Leadership?.Lagging
      )}
    </div>

    <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
      ${escapeHtml(d.breadth_rotation.Leadership?.ai_note || "")}
    </div>
  </section>
`;


  // 3. Market Internals (dati grezzi)
 const internalsHTML = `
  <section class="tl-panel-section" data-f1b-section="internals"
    style="
      background:transparent;
      border:0;
      border-radius:0;
      box-shadow:none;
      padding:0;
    "
  >
    <header class="tl-panel-section-title">
      <div class="tl-panel-section-title-text">
        Market Internals (dati grezzi)
      </div>
    </header>

    ${listBlock("Indici (1W)", d.internals_raw.Indices_1W)}
    ${listBlock("Futures / Commodities (1W)", d.internals_raw.Futures_Move_1W)}
    ${listBlock("Curva Treasury", d.internals_raw.Curve_UST)}
    ${listBlock("Volatilità & USD", d.internals_raw.Vol_USD)}

    <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
      ${escapeHtml(d.internals_raw.ai_note || "")}
    </div>
  </section>
`;
const streetHTML = `
  <section class="tl-panel-section" data-f1b-section="street"
    style="
      background:transparent;
      border:0;
      border-radius:0;
      box-shadow:none;
      padding:0;
    "
  >
    <header class="tl-panel-section-title">
      <div class="tl-panel-section-title-text">
        Street View · Narrativa istituzionale
      </div>
    </header>

    ${headlineBlock("Macro (Bloomberg / Reuters / Barron's)", d.street_view.T1_MacroNews)}
    ${headlineBlock("Sell-Side / Street View (Goldman / JPM / ecc.)", d.street_view.T1_SellSideNotes)}
    ${headlineBlock("Consensus Tone", d.street_view.T1_ConsensusTone)}

    <div class="text-[11px] text-[color:var(--muted)] leading-[1.4]">
      ${escapeHtml(d.street_view.ai_note || "")}
    </div>
  </section>
`;


  // 5. Sintesi Tradelia AI (conclusione educativa)
const sintesiHTML = `
  <section class="tl-panel-section" data-f1b-section="sintesi"
    style="
      background:transparent;
      border:0;
      border-radius:0;
      box-shadow:none;
      padding:0;
    "
  >
    <header class="tl-panel-section-title">
      <div class="tl-panel-section-title-text">
        Sintesi Tradelia AI
      </div>
    </header>

    ${Array.isArray(d.sintesi_ai.points)
      ? d.sintesi_ai.points.map(point => conclusionPointBlock(point)).join("")
      : ""
    }

    <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-4">
      Questa sintesi ha finalità informative/formative. Non è un invito a prendere posizione
      o a modificare allocazioni. Consulta sempre un intermediario autorizzato.
    </div>
  </section>
`;


  // 6. Audit & Qualità
const auditHTML = `
  <section class="tl-panel-section" data-f1b-section="audit"
    style="
      background:transparent;
      border:0;
      border-radius:0;
      box-shadow:none;
      padding:0;
    "
  >
    <header class="tl-panel-section-title">
      <div class="tl-panel-section-title-text">
        Audit &amp; Qualità dati
      </div>
    </header>

    <div class="grid gap-3 text-[12px] leading-[1.4] grid-cols-1 md:grid-cols-2">
      ${qualityChip("FreshnessScore", d.audit_quality.QualityMetrics?.FreshnessScore)}
      ${qualityChip("ConfidenceFinal", d.audit_quality.QualityMetrics?.ConfidenceFinal)}
      ${qualityChip("DataIntegrity", d.audit_quality.QualityMetrics?.DataIntegrity)}
      ${qualityChip("FeedSync", d.audit_quality.QualityMetrics?.FeedSync)}
    </div>

    <div class="mt-4 text-[11px] leading-[1.4] text-[color:var(--muted)]">
      Semaforo interno:
      verde = dati coerenti/aggiornati,
      giallo = parziale/debole,
      rosso = incompleto o rumoroso.
      Nessuna raccomandazione operativa.
    </div>
  </section>
`;

  // 7. MiFID
const mifidHTML = `
  <section class="tl-panel-section" data-f1b-section="mifid"
    style="
      background:transparent;
      border:0;
      border-radius:0;
      box-shadow:none;
      padding:0;
    "
  >
    <header class="tl-panel-section-title">
      <div class="tl-panel-section-title-text">
        Nota regolamentare
      </div>
    </header>
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--muted)] space-y-2">
      <p>${escapeHtml(d.mifid.disclaimer || "")}</p>
    </div>
  </section>
`;


  return {
    regimeHTML,
    breadthHTML,
    internalsHTML,
    streetHTML,
    sintesiHTML,
    auditHTML,
    mifidHTML
  };
}

/* -------------------------------------------------
   Shell desktop / mobile
------------------------------------------------- */

function renderDrawerDesktopShellPublic(sectionsObj) {
  return `
    <div class="f1b-panel-desktop"
      style="
        display:flex;
        flex-direction:row;
        gap:1rem;
        min-height:300px;
      ">

      <aside class="f1b-panel-menu"
        style="
          min-width:180px;
          max-width:200px;
          border-right:1px solid var(--br-card);
        ">

        ${drawerMenuButtonPublic("regime","Regime & Rischio", true)}
        ${drawerMenuButtonPublic("breadth","Breadth & Rotazione", false)}
        ${drawerMenuButtonPublic("internals","Internals", false)}
        ${drawerMenuButtonPublic("street","Street View", false)}
        ${drawerMenuButtonPublic("sintesi","Sintesi AI", false)}
        ${drawerMenuButtonPublic("audit","Audit", false)}
        ${drawerMenuButtonPublic("mifid","MiFID", false)}
      </aside>

      <main class="f1b-panel-content flex-1 min-w-0"
        style="max-height:60vh;overflow:auto;padding:1rem;"
        id="panel-body">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="breadth" hidden>${sectionsObj.breadthHTML}</div>
        <div data-f1b-view="internals" hidden>${sectionsObj.internalsHTML}</div>
        <div data-f1b-view="street" hidden>${sectionsObj.streetHTML}</div>
        <div data-f1b-view="sintesi" hidden>${sectionsObj.sintesiHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}

function renderDrawerMobileShellPublic(sectionsObj) {
  // barra tab scrollabile in alto (Regime attivo di default)
  const mobileTabsBar = `
    <div
      class="f1b-footer-tabs-wrap"
      style="
        flex-shrink:0;

        display:flex;
        align-items:center;

        border-bottom:1px solid var(--br-panel-divider);
        background:var(--surface-panel-head);
        background-image:
          radial-gradient(
            circle at 0% 0%,
            color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%,
            transparent 60%
          );

        padding:.6rem .75rem;
        box-shadow:0 6px 12px rgba(0,0,0,.12);
        max-width:100%;
        overflow:hidden;
        gap:.5rem;
      "
    >
      <div
        class="f1b-footer-tabs-scroll"
        style="
          flex:1 1 auto;
          min-width:0;
          display:flex;
          align-items:center;
          gap:.5rem;
          overflow-x:auto;
          -webkit-overflow-scrolling:touch;
          scrollbar-width:none;
        "
      >
        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="regime"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:600;
            border-radius:8px;
            border:1px solid var(--ink);
            background:
              radial-gradient(
                circle at 0% 0%,
                color-mix(in oklab, var(--ink) 12%, transparent) 0%,
                transparent 60%
              ),
              var(--surface-card-alt);
            color:var(--ink);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          Regime
        </button>

        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="breadth"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          Breadth
        </button>

        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="internals"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          Internals
        </button>

        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="street"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          Street
        </button>

        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="sintesi"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          Sintesi AI
        </button>

        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="audit"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          Audit
        </button>

        <button
          class="f1b-footer-tab-btn"
          data-f1b-tab="mifid"
          style="
            flex:0 0 auto;
            white-space:nowrap;
            font-size:11px;
            line-height:1.2;
            font-weight:500;
            border-radius:8px;
            border:1px solid var(--br-soft);
            background:var(--surface-card);
            color:var(--muted);
            padding:.45rem .7rem;
            box-shadow:var(--shadow-card);
          "
        >
          MiFID
        </button>
      </div>
    </div>
  `;

  return `
    <div class="f1b-drawer-mobile"
      style="
        display:flex;
        flex-direction:column;
        height:calc(100vh - 110px);
        max-height:calc(100vh - 110px);
        min-height:300px;
      "
    >

      ${mobileTabsBar}

      <main
        class="f1b-panel-content-mobile flex-1 min-w-0"
        style="
          overflow:auto;
          -webkit-overflow-scrolling:touch;
          padding:1rem;
        "
        id="panel-body-mobile"
      >
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="breadth" hidden>${sectionsObj.breadthHTML}</div>
        <div data-f1b-view="internals" hidden>${sectionsObj.internalsHTML}</div>
        <div data-f1b-view="street" hidden>${sectionsObj.streetHTML}</div>
        <div data-f1b-view="sintesi" hidden>${sectionsObj.sintesiHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}

/* -------------------------------------------------
   Tab switching
------------------------------------------------- */

function drawerMenuButtonPublic(key, label, active) {
  return `
    <button
      class="f1b-tab-btn block w-full text-left text-[12px] leading-[1.4] px-2 py-2 ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
      style="
        border-radius:var(--radius-card-sm);
        border-left:3px solid ${active ? "var(--brand-600)" : "transparent"};
        background:${active
          ? "color-mix(in oklab, var(--surface-card-alt) 60%, transparent)"
          : "transparent"};
        font-weight:${active ? "600" : "500"};
        color:var(--ink);
        text-align:left;
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

      // attiva/deattiva bottoni ovunque (sidebar desktop + footer mobile)
      const allBtns = document.querySelectorAll("[data-f1b-tab]");
      allBtns.forEach(b => {
        const isActive = b.getAttribute("data-f1b-tab") === key;
        b.classList.toggle("is-active", isActive);

        // stile tab nella sidebar desktop
        if (b.classList.contains("f1b-tab-btn")) {
          b.style.borderLeftColor = isActive ? "var(--brand-600)" : "transparent";
          b.style.background = isActive
            ? "color-mix(in oklab, var(--surface-card-alt) 60%, transparent)"
            : "transparent";
          b.style.fontWeight = isActive ? "600" : "500";
        }

        // stile tab nella footer-bar mobile
        if (b.classList.contains("f1b-footer-tab-btn")) {
          if (isActive) {
            // ATTIVA
            b.style.fontWeight = "600";
            b.style.border = "1px solid var(--ink)";
            b.style.background = "radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 12%, transparent) 0%, transparent 60%), var(--surface-card-alt)";
            b.style.color = "var(--ink)";
            b.style.boxShadow = "var(--shadow-card)";
          } else {
            // NON ATTIVA
            b.style.fontWeight = "500";
            b.style.border = "1px solid var(--br-soft)";
            b.style.background = "var(--surface-card)";
            b.style.color = "var(--muted)";
            b.style.boxShadow = "var(--shadow-card)";
          }
        }
      });

      // mostra/nascondi viste
      views.forEach(viewEl => {
        const viewKey = viewEl.getAttribute("data-f1b-view");
        viewEl.hidden = viewKey !== key;
      });
    });
  });
}


/* -------------------------------------------------
   Blocchi UI riutilizzabili
------------------------------------------------- */

// KPI in card compatta (3 box nella card top-level)
function metricBoxTrafficLight({ key, label, desc, metric }) {
  const { dotColor, textColor } = toneColors(metric?.tone);
  return `
    <div class="flex-1 min-w-[90px]"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
        padding:0.6rem 0.75rem;
      ">

      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full"
            style="background:${dotColor};"></span>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">
            ${escapeHtml(label)}
          </div>
        </div>
        <button
          class="info-btn"
          data-metric="${escapeAttr(key)}"
          aria-label="Info ${escapeAttr(key)}"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[13px] leading-[1.4]"
        style="color:${textColor};">
        ${escapeHtml(metric?.raw || "—")}
      </div>

      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
        ${escapeHtml(desc || "")}
      </div>
    </div>
  `;
}

// metricBlock = card semaforica completa (drawer)
function metricBlock(metricKey, title, desc, metricObj) {
  const { dotColor, textColor } = toneColors(metricObj?.tone);
  return `
    <div class="p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full"
            style="background:${dotColor};"></span>
          <div class="text-[11px] font-semibold leading-[1.3] text-[color:var(--muted)]">
            ${escapeHtml(title)}
          </div>
        </div>
        <button
          class="info-btn"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[13px] text-[color:var(--ink)] leading-[1.4]"
        style="color:${textColor};">
        ${escapeHtml(metricObj?.raw || "—")}
      </div>

      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
        ${escapeHtml(desc || "")}
      </div>

      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
        ${escapeHtml(metricObj?.ai_note || "")}
      </div>
    </div>
  `;
}

function sectorListDetailed(title, arr) {
  if (!Array.isArray(arr) || !arr.length) {
    return `
      <div>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          ${escapeHtml(title)}
        </div>
        <div class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">
          Nessun dato.
        </div>
      </div>
    `;
  }

  const items = arr.map(item => `
    <li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
      ${escapeHtml(item)}
    </li>
  `).join("");

  return `
    <div>
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        ${escapeHtml(title)}
      </div>
      <ul class="list-disc pl-4 space-y-1">
        ${items}
      </ul>
    </div>
  `;
}

function listBlock(title, rowsArr) {
  if (!Array.isArray(rowsArr) || !rowsArr.length) {
    return `
      <div class="mb-4">
        <div class="text-[11px] font-semibold text-[color:var(--muted)] mb-1 uppercase tracking-wide leading-[1.3]">
          ${escapeHtml(title)}
        </div>
        <div class="text-[12.5px] text-[color:var(--muted)] leading-[1.4]">
          N/A
        </div>
      </div>
    `;
  }

  const li = rowsArr.map(r => `
    <li class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)]">
      ${escapeHtml(r)}
    </li>`
  ).join("");

  return `
    <div class="mb-4">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] mb-1 uppercase tracking-wide leading-[1.3]">
        ${escapeHtml(title)}
      </div>
      <ul class="pl-4 list-disc space-y-1">
        ${li}
      </ul>
    </div>
  `;
}

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

function conclusionPointBlock(pointObj = {}) {
  return `
    <div class="mb-4 p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-1">
        ${escapeHtml(pointObj.title || "")}
      </div>
      <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)]">
        ${escapeHtml(pointObj.raw || "")}
      </div>
      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
        ${escapeHtml(pointObj.ai_note || "")}
      </div>
    </div>
  `;
}

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

// Quality metrics con semaforo (FreshnessScore, ConfidenceFinal, ...)
function qualityChip(keyName, qObj) {
  if (!qObj) return "";
  const { dotColor, textColor } = toneColors(qObj.tone);

  return `
    <div class="p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">

      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-2">
          <span class="inline-block w-[8px] h-[8px] rounded-full"
            style="background:${dotColor};"></span>

          <div class="text-[11px] font-semibold leading-[1.3] text-[color:var(--muted)]">
            ${escapeHtml(keyName || "")}
          </div>
        </div>

        <button
          class="info-btn"
          data-metric="${escapeAttr(keyName)}"
          aria-label="Info ${escapeAttr(keyName)}"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[13px] leading-[1.4]"
        style="color:${textColor};">
        ${escapeHtml(qObj.raw || "—")}
      </div>

      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
        ${escapeHtml(qObj.ai_note || "")}
      </div>
    </div>
  `;
}

/* -------------------------------------------------
   Tone utilities
------------------------------------------------- */

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

// computeHighLevelTone: pill grande accanto a StrategyMode nella card
function computeHighLevelTone(strategyModeMacroObj, regimeScoreObj) {
  // Fallbacks
  const stratRaw = (strategyModeMacroObj && strategyModeMacroObj.raw || "").toLowerCase();
  let toneColor = "var(--tone-neu-fg)";
  let toneLabel = "neutral";

  if (stratRaw.includes("momentum") && !stratRaw.includes("light")) {
    toneColor = "var(--tone-pos-fg)";
    toneLabel = "positive";
  } else if (stratRaw.includes("momentum-light")) {
    toneColor = "var(--tone-warn-fg)";
    toneLabel = "neutral";
  } else if (stratRaw.includes("pullback")) {
    toneColor = "var(--tone-neg-fg)";
    toneLabel = "alert";
  } else {
    // se StrategyMode non basta, guardiamo RegimeScore
    const regimeTone = (regimeScoreObj && regimeScoreObj.tone) || "";
    const colors = toneColors(regimeTone);
    // map neutrals sensati:
    if (regimeTone) {
      toneColor = colors.textColor;
      if (regimeTone === "green") toneLabel = "positive";
      else if (regimeTone === "yellow") toneLabel = "neutral";
      else if (regimeTone === "red") toneLabel = "alert";
    }
  }

  return { toneColor, toneLabel };
}

/* -------------------------------------------------
   Normalizzazione dati
------------------------------------------------- */

function normalizeDataPublicF1B(src = {}) {
  // Assumiamo che src abbia la struttura pubblica concordata:
  // {
  //   meta: {...},
  //   regime_and_risk: {...},
  //   breadth_rotation: {...},
  //   internals_raw: {...},
  //   street_view: {...},
  //   sintesi_ai: {...},
  //   audit_quality: {...},
  //   mifid: {...}
  // }

  return {
    meta: src.meta || {
      timestampET: "—",
      module: "F1B · Market Regime",
      moduleVersion: "vX",
      moduleStatus: "ACTIVE",
      freshness: "≤ T-1"
    },

    regime_and_risk: src.regime_and_risk || {},

    breadth_rotation: src.breadth_rotation || {},

    internals_raw: src.internals_raw || {
      Indices_1W: [],
      Futures_Move_1W: [],
      Curve_UST: [],
      Vol_USD: [],
      ai_note: ""
    },

    street_view: src.street_view || {
      T1_MacroNews: "",
      T1_SellSideNotes: "",
      T1_ConsensusTone: "",
      ai_note: ""
    },

    sintesi_ai: src.sintesi_ai || {
      points: []
    },

    audit_quality: src.audit_quality || {
      AuditPathID: "—",
      SourcesTier1: [],
      Freshness: "—",
      ModuleStatus: "—",
      QualityMetrics: {}
    },

    mifid: src.mifid || {
      disclaimer: ""
    }
  };
}

/* -------------------------------------------------
   Escape utils
------------------------------------------------- */

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
  return String(str)
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
