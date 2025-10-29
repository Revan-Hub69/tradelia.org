// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio (public dashboard)
//
// Ruolo:
// - Fornire lettura sintetica del regime di mercato e del rischio percepito
//   nell'orizzonte 3–10 giorni.
// - Contesto macro (volatilità, credito, curva tassi, USD), ampiezza del mercato
//   e narrativa istituzionale (sell-side / agenzie).
// - Fine esclusivamente informativo / educativo. Non contiene raccomandazioni operative.
//
// Esporta:
//   renderCard(data, ctx)
//   bindCard(node, data, ctx)
//
// Flusso runtime:
//   - renderCard() genera la card riassuntiva con CTA "Dettagli regime →"
//   - bindCard() collega CTA e tooltip
//   - openF1DrawerPublic() apre il pannello/drawer responsive
//   - bindDrawerTabsPublic() gestisce le tab (desktop sidebar, mobile tab-bar sticky)
//
// Stile / Design system:
//   - Tutte le sezioni usano lo stesso linguaggio visivo:
//       background: var(--surface-card-alt)
//       border:     1px solid var(--br-card)
//       radius:     var(--radius-card)
//       shadow:     var(--shadow-card)
//   - Tone semaforico verde/giallo/rosso dove disponibile (toneColors()).
//   - NESSUNA menzione di "swing trading". Usiamo "lettura di contesto 3–10 giorni".
//   - Disclaimer educativo ovunque, non solo nel footer.

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1B(rawData);

  // KPI in header card
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
      desc: "VIX / oro / ricerca hedge",
      metric: d.regime_and_risk.VolRegime
    }
  ];

  // Pill tono generale
  const { toneLabel, toneColor } = computeHighLevelTone(
    d.regime_and_risk.StrategyMode_macro,
    d.regime_and_risk.RegimeScore
  );

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEADLINE -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F1B</span>

            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Regime di mercato · Orizzonte 3–10 giorni
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
            Volatilità, credito, curva tassi, partecipazione al rialzo e segnali macro dominanti.
            Lettura di contesto. Non è una istruzione operativa.
          </div>
        </div>
      </header>

      <!-- CARD PRINCIPALE -->
      <div class="relative flex flex-col gap-4 card-compact"
        style="
          background:var(--surface-card);
          border:1px solid var(--br-card);
          border-radius:var(--radius-card);
          box-shadow:var(--shadow-card);
          padding:1rem;
        ">

        <!-- StrategyMode + pill tono -->
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
            <span>${escapeHtml(d.regime_and_risk.StrategyMode_macro?.raw || "—")}</span>

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
            ${escapeHtml(d.regime_and_risk.StrategyMode_macro?.ai_note || "")}
          </div>
        </div>

        <!-- KPI semaforo -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
          ${kpis.map(k => metricBoxTrafficLight(k)).join("")}
        </div>

        <!-- DISCLAIMER + CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">
            F1B descrive lo stato corrente del mercato (volatilità, credito, curva tassi,
            partecipazione settoriale). È materiale educativo e informativo.
            Nessuna raccomandazione personale.
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
   Drawer / Panel
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
    footerButtons: mobileMode
      ? []
      : [
          {
            label: "Chiudi",
            action: () => {
              window.__TradeliaUI.closePanel();
            }
          }
        ],
    footerTabs: []
  });

  // post-mount binding (tab switching + tooltip binding interno)
  setTimeout(() => {
    const roots = [
      document.getElementById("panel-body"),
      document.getElementById("panel-body-mobile")
    ].filter(Boolean);

    roots.forEach(r => {
      bindDrawerTabsPublic(r);
      if (
        window.__TradeliaUI &&
        typeof window.__TradeliaUI.bindMetricInfoButtons === "function"
      ) {
        try {
          window.__TradeliaUI.bindMetricInfoButtons(r);
        } catch (e) {}
      }
    });

    // stato iniziale "Regime"
    const firstTabBtn = document.querySelector('[data-f1b-tab="regime"]');
    if (firstTabBtn && typeof firstTabBtn.click === "function") {
      firstTabBtn.click();
    }
  }, 0);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

/* -------------------------------------------------
   Sezioni logiche drawer (con stile UNIFORME)
------------------------------------------------- */

function buildDrawerSectionsPublic(d) {
  // 1. Regime & Rischio
  const regimeHTML = `
    <section class="tl-panel-section" data-f1b-section="regime"
      style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Regime &amp; Rischio
        </div>
      </header>

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBlock("StrategyMode_macro", "StrategyMode", "Modalità corrente del mercato", d.regime_and_risk.StrategyMode_macro)}
        ${metricBlock("RegimeScore", "RegimeScore", "Appetito rischio sintetico", d.regime_and_risk.RegimeScore)}
        ${metricBlock("VolRegime", "Volatilità / Hedge", "VIX, oro, ricerca hedge", d.regime_and_risk.VolRegime)}
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
      style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Breadth &amp; Rotazione Equity
        </div>
      </header>

      <div class="grid md:grid-cols-2 gap-3 text-[12px] leading-[1.4] mb-4">
        ${metricBlock("Breadth_1M", "Breadth (1M)", "% settori positivi su ~30 giorni", d.breadth_rotation.Breadth_1M)}
        ${metricBlock("RiskTilt_1M", "RiskTilt (1M)", "Ciclici/growth vs difensivi", d.breadth_rotation.RiskTilt_1M)}
        ${metricBlock("SmallCapPressure_1W", "SmallCap Pressure (1W)", "Microcap vs Mid/Large", d.breadth_rotation.SmallCapPressure_1W)}
        ${metricBlock("IndexMomentum_1W", "Index Momentum (1W)", "Momentum cross-indici / crypto", d.breadth_rotation.IndexMomentum_1W)}
        ${metricBlock("SizeBias", "Size Bias", "Preferenza di capitalizzazione", d.breadth_rotation.SizeBias)}
      </div>

      <div class="grid gap-4 text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        ${sectorListDetailed("Leadership multi-timeframe", d.breadth_rotation.Leadership?.LeadersMultiTF)}
        ${sectorListDetailed("Leadership difensiva qualitativa", d.breadth_rotation.Leadership?.DefensiveLeadership)}
        ${sectorListDetailed("Settori in ritardo", d.breadth_rotation.Leadership?.Lagging)}
      </div>

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
        ${escapeHtml(d.breadth_rotation.Leadership?.ai_note || "")}
      </div>
    </section>
  `;

  // 3. Market Internals (dati grezzi) — ora card-based
  const internalsHTML = `
    <section class="tl-panel-section" data-f1b-section="internals"
      style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Market Internals (dati grezzi)
        </div>
      </header>

      ${listBlockCard("Indici (1W)", d.internals_raw.Indices_1W)}
      ${listBlockCard("Futures / Commodities (1W)", d.internals_raw.Futures_Move_1W)}
      ${listBlockCard("Curva Treasury", d.internals_raw.Curve_UST)}
      ${listBlockCard("Volatilità & USD", d.internals_raw.Vol_USD)}

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
        ${escapeHtml(d.internals_raw.ai_note || "")}
      </div>
    </section>
  `;

  // 4. Street View · narrativa istituzionale — ora card-based
  const streetHTML = `
    <section class="tl-panel-section" data-f1b-section="street"
      style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Street View · Narrativa istituzionale
        </div>
      </header>

      ${headlineBlockCard("Macro (Bloomberg / Reuters / Barron's)", d.street_view.T1_MacroNews)}
      ${headlineBlockCard("Sell-Side / Street View (Goldman / JPM / ecc.)", d.street_view.T1_SellSideNotes)}
      ${headlineBlockCard("Consensus Tone", d.street_view.T1_ConsensusTone)}

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4]">
        ${escapeHtml(d.street_view.ai_note || "")}
      </div>
    </section>
  `;

  // 5. Conclusione · Tradelia AI (educational) — tutto card-based
  const sintesiHTML = `
    <section class="tl-panel-section" data-f1b-section="sintesi"
      style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Conclusione · Tradelia AI (educational)
        </div>
      </header>

      ${
        Array.isArray(d.sintesi_ai.points)
          ? d.sintesi_ai.points.map(point => conclusionPointBlock(point)).join("")
          : ""
      }

      <div class="mb-4 p-2"
        style="
          background:var(--surface-card-alt);
          border:1px solid var(--br-card);
          border-radius:var(--radius-card);
          box-shadow:var(--shadow-card);
        ">
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-1">
          Lettura di contesto (non istruzioni operative)
        </div>
        <div class="text-[12px] font-semibold leading-[1.4] text-[color:var(--ink)]">
          In sintesi: il regime appare ancora guidato da dinamiche Momentum,
          con ampiezza costruttiva e rischio sistemico contenuto.
          La finestra 3–10 giorni resta favorevole ma resta esposta a shock macro imprevisti.
        </div>
      </div>

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-2">
        Questa conclusione ha esclusivamente finalità informative e formative.
        Non è un invito a prendere posizione o modificare allocazioni.
        Consulta sempre un intermediario autorizzato.
      </div>
    </section>
  `;

  // 6. Audit & Qualità
  const auditHTML = `
    <section class="tl-panel-section" data-f1b-section="audit"
      style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
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
        verde = dati coerenti/aggiornati;
        giallo = parziale/debole;
        rosso = incompleto o rumoroso.
        Queste valutazioni sono qualitative, soggettive e non operative.
      </div>
    </section>
  `;

  // 7. Nota regolamentare / MiFID
  const mifidHTML = `
    <section class="tl-panel-section" data-f1b-section="mifid"
      style="background:transparent;border:0;border-radius:0;box-shadow:none;padding:0;">
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
      style="display:flex;flex-direction:row;gap:1rem;height:66vh;">

      <aside class="f1b-panel-menu"
        style="
          min-width:180px;
          max-width:200px;
          border-right:1px solid var(--br-card);
          height:100%;
          overflow:auto;
        ">

        ${drawerMenuButtonPublic("regime","Regime & Rischio")}
        ${drawerMenuButtonPublic("breadth","Breadth & Rotazione")}
        ${drawerMenuButtonPublic("internals","Internals")}
        ${drawerMenuButtonPublic("street","Street View")}
        ${drawerMenuButtonPublic("sintesi","Conclusione")}
        ${drawerMenuButtonPublic("audit","Audit")}
        ${drawerMenuButtonPublic("mifid","MiFID")}
      </aside>

      <main class="f1b-panel-content flex-1 min-w-0"
        style="
          height:100%;
          overflow:auto;
          -webkit-overflow-scrolling:touch;
          padding:1rem;
        "
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
  const mobileTabsBar = `
    <div
      class="f1b-mobile-tabs-fixed"
      style="
        flex-shrink:0;
        width:100%;
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
        box-shadow:0 6px 12px rgba(0,0,0,.12);
        padding:.6rem .75rem;
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
        ${mobileTabButton("regime","Regime")}
        ${mobileTabButton("breadth","Breadth")}
        ${mobileTabButton("internals","Internals")}
        ${mobileTabButton("street","Street")}
        ${mobileTabButton("sintesi","Conclusione")}
        ${mobileTabButton("audit","Audit")}
        ${mobileTabButton("mifid","MiFID")}
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
        background:var(--surface-panel-head);
        background-image:
          radial-gradient(
            circle at 0% 0%,
            color-mix(in oklab, var(--surface-panel-head) 90%, var(--brand) 2%) 0%,
            transparent 60%
          );
      "
    >
      ${mobileTabsBar}

      <main
        class="f1b-panel-content-mobile flex-1 min-w-0"
        style="
          overflow:auto;
          -webkit-overflow-scrolling:touch;
          padding:1rem;
          background:var(--surface-page);
          background-image:none;
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

function drawerMenuButtonPublic(key, label) {
  // desktop tab button: stile base/hover/attivo viene da tokens.css (.f1b-tab-btn)
  return `
    <button
      class="f1b-tab-btn"
      data-f1b-tab="${key}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function mobileTabButton(key, label) {
  // mobile pill
  return `
    <button
      class="f1b-footer-tab-btn"
      data-f1b-tab="${key}"
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
      ${escapeHtml(label)}
    </button>
  `;
}

function bindDrawerTabsPublic(root) {
  const tabButtons = document.querySelectorAll("[data-f1b-tab]");
  const views = document.querySelectorAll("[data-f1b-view]");

  tabButtons.forEach(btn => {
    if (btn.__f1bBound) return;
    btn.__f1bBound = true;

    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-f1b-tab");
      if (!key) return;

      // attiva/deattiva bottoni ovunque
      tabButtons.forEach(b => {
        const isActive = b.getAttribute("data-f1b-tab") === key;

        // DESKTOP SIDEBAR
        if (b.classList.contains("f1b-tab-btn")) {
          if (isActive) {
            b.classList.add("is-active");
          } else {
            b.classList.remove("is-active");
          }
        }

        // MOBILE TABS
        if (b.classList.contains("f1b-footer-tab-btn")) {
          if (isActive) {
            // attivo mobile
            b.style.fontWeight = "600";
            b.style.border = "1px solid var(--ink)";
            b.style.background =
              "radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)";
            b.style.color = "var(--ink)";
            b.style.boxShadow = "0 4px 10px rgba(0,0,0,.18)";
          } else {
            // inattivo mobile
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

// KPI compatti nella card principale
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

// Blocco metrica con semaforo per il drawer
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

      <div class="font-mono font-bold text-[13px] leading-[1.4]"
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

// Lista dati grezzi (internals) con card uniforme
function listBlockCard(title, rowsArr) {
  const body = Array.isArray(rowsArr) && rowsArr.length
    ? rowsArr.map(r => `
        <li class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)]">
          ${escapeHtml(r)}
        </li>`
      ).join("")
    : `<li class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">N/A</li>`;

  return `
    <div class="mb-4 p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-1">
        ${escapeHtml(title)}
      </div>
      <ul class="pl-4 list-disc space-y-1">
        ${body}
      </ul>
    </div>
  `;
}

// Headlines istituzionali (Street View) con card uniforme
function headlineBlockCard(title, body) {
  if (!body) return "";
  return `
    <div class="mb-4 p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-1">
        ${escapeHtml(title)}
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">
        ${escapeHtml(body)}
      </div>
    </div>
  `;
}

// Lista leadership settoriale (già cardizzata semanticamente)
function sectorListDetailed(title, arr) {
  if (!Array.isArray(arr) || !arr.length) {
    return `
      <div class="mb-4 p-2"
        style="
          background:var(--surface-card-alt);
          border:1px solid var(--br-card);
          border-radius:var(--radius-card);
          box-shadow:var(--shadow-card);
        ">
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
    <div class="mb-4 p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        ${escapeHtml(title)}
      </div>
      <ul class="list-disc pl-4 space-y-1">
        ${items}
      </ul>
    </div>
  `;
}

// Punto conclusione AI (già card style)
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

// Quality / Audit
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

// Pill tono in header card accanto a StrategyMode
function computeHighLevelTone(strategyModeMacroObj, regimeScoreObj) {
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
    // fallback su RegimeScore.tone
    const regimeTone = (regimeScoreObj && regimeScoreObj.tone) || "";
    const colors = toneColors(regimeTone);
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
