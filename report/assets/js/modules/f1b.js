// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio (public dashboard)
//
// Scopo
// - Lettura di contesto sul rischio di mercato nell'orizzonte 3–10 giorni
// - Volatilità, credito, curva tassi, breadth, rotazione settoriale,
//   narrativa istituzionale e qualità dati
// - Finalità esclusivamente informativa e didattica
// - Nessuna raccomandazione operativa / personale
//
// Architettura
// - Tutti i contenuti dinamici arrivano da rawData (JSON back-end / feed dati)
// - Il codice definisce solo layout, stile visivo, tassonomia F1B e disclaimer legale
//
// Export
//   renderCard(rawData, ctx?)
//   bindCard(node, rawData, ctx?)
//
// Dipendenze globali attese
//   window.__TradeliaUI.openPanel()
//   window.__TradeliaUI.closePanel()
//   window.__TradeliaUI.bindMetricInfoButtons()
//
// -----------------------------------------------------------------------------
// RENDER CARD PRINCIPALE (F1B snapshot pubblico)
// -----------------------------------------------------------------------------

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1B(rawData);

  // KPI principali per la hero
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

  // Pill tono generale accanto a StrategyMode
  const { toneLabel, toneColor } = computeHighLevelTone(
    d.regime_and_risk.StrategyMode_macro,
    d.regime_and_risk.RegimeScore
  );

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- HEAD -->
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
            ${escapeHtml(d.meta.hero_intro || "")}
            <br/>
            <span class="text-[11px] text-[color:var(--muted)]">
              Lettura di contesto. Non è un'istruzione operativa.
            </span>
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

        <!-- StrategyMode + tono -->
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

        <!-- KPI semaforiche -->
        <div class="grid gap-3 grid-cols-2 md:grid-cols-3">
          ${kpis.map(k => metricBoxTrafficLight(k)).join("")}
        </div>

        <!-- DISCLAIMER + CTA -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">
            ${escapeHtml(d.meta.hero_disclaimer || "")}
            <br/><br/>
            Materiale educativo e informativo. Nessuna raccomandazione personale.
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
  if (
    window.__TradeliaUI &&
    typeof window.__TradeliaUI.bindMetricInfoButtons === "function"
  ) {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (e) {}
  }
}

/* -----------------------------------------------------------------------------
// PANEL / DRAWER
// ----------------------------------------------------------------------------*/

function openF1DrawerPublic(data) {
  if (
    !window.__TradeliaUI ||
    typeof window.__TradeliaUI.openPanel !== "function"
  ) {
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

  // post-mount: tab binding + tooltip binding interno
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

    // stato iniziale
    const firstTabBtn = document.querySelector('[data-f1b-tab="regime"]');
    if (firstTabBtn && typeof firstTabBtn.click === "function") {
      firstTabBtn.click();
    }
  }, 0);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

/* -----------------------------------------------------------------------------
// CONTENUTO DEL DRAWER (TUTTO DINAMICO DAI DATI)
// ----------------------------------------------------------------------------*/

function buildDrawerSectionsPublic(d) {
  // helper per singola metrica uniforme
  const metricRow = (key, label, desc, metricObj) => {
    const val = metricObj?.raw ?? "—";
    const tone = (metricObj?.tone || "").toLowerCase();
    const color = tone === "green"
      ? "var(--tone-pos-fg)"
      : tone === "yellow"
      ? "var(--tone-warn-fg)"
      : tone === "red"
      ? "var(--tone-neg-fg)"
      : "var(--tone-neu-fg)";
    return `
      <div class="metric-row flex items-start justify-between gap-2 py-[4px] border-b border-[color:var(--br-soft)]">
        <div class="metric-field flex-1 min-w-0">
          <div class="text-[12px] font-semibold text-[color:var(--ink)]">${escapeHtml(label)}</div>
          <div class="text-[11px] text-[color:var(--muted)]">${escapeHtml(desc || "")}</div>
        </div>
        <div class="metric-val font-mono font-bold text-[13px]" style="color:${color};">${escapeHtml(val)}</div>
      </div>
    `;
  };

  // helper per blocco testo / lista
  const sectionText = (html) => `
    <div class="tl-panel-section-text text-[12.5px] leading-[1.5] text-[color:var(--ink)] mt-2 whitespace-pre-line">
      ${escapeHtml(html || "")}
    </div>
  `;

  // helper lista semplice
  const listBlock = (title, arr) => {
    if (!arr || !arr.length) return "";
    return `
      <div class="mt-2">
        <div class="text-[11px] font-semibold uppercase text-[color:var(--muted)] mb-1">${escapeHtml(title)}</div>
        <ul class="list-disc pl-4 space-y-1 text-[12.5px] text-[color:var(--ink)]">
          ${arr.map(x => `<li>${escapeHtml(x)}</li>`).join("")}
        </ul>
      </div>
    `;
  };

  // helper headline sintetica
  const headline = (title, body) => {
    if (!body) return "";
    return `
      <div class="mt-3">
        <div class="text-[11px] font-semibold uppercase text-[color:var(--muted)] mb-1">${escapeHtml(title)}</div>
        <div class="text-[12.5px] leading-[1.5] text-[color:var(--ink)] whitespace-pre-line">${escapeHtml(body)}</div>
      </div>
    `;
  };

  // 1. Regime & Rischio
  const regimeHTML = `
    <section class="tl-panel-section">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">Regime &amp; Rischio</div>
      </header>
      ${metricRow("StrategyMode_macro","StrategyMode","Modalità di mercato",d.regime_and_risk.StrategyMode_macro)}
      ${metricRow("RegimeScore","RegimeScore","Appetito al rischio sintetico",d.regime_and_risk.RegimeScore)}
      ${metricRow("VolRegime","Volatilità / Hedge","VIX / Oro / domanda protezione",d.regime_and_risk.VolRegime)}
      ${metricRow("LiquidityRegimeScore","Curva & Costo capitale","Curva Treasury / funding stress",d.regime_and_risk.LiquidityRegimeScore)}
      ${metricRow("CreditRiskBlock","Credito","High-beta credit / spread flight-to-safety",d.regime_and_risk.CreditRiskBlock)}
      ${metricRow("FX_Regime","FX / USD","Dinamica Dollaro e cross chiave",d.regime_and_risk.FX_Regime)}
      ${headline("RiskWindow (3–10g)", d.regime_and_risk.RiskWindow?.ai_note || "")}
    </section>
  `;

  // 2. Breadth & Rotazione
  const breadthHTML = `
    <section class="tl-panel-section">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">Breadth &amp; Rotazione Equity</div>
      </header>
      ${metricRow("Breadth_1M","Breadth (1M)","% settori positivi su ~30 giorni",d.breadth_rotation.Breadth_1M)}
      ${metricRow("RiskTilt_1M","RiskTilt (1M)","Ciclici/growth vs difensivi",d.breadth_rotation.RiskTilt_1M)}
      ${metricRow("SmallCapPressure_1W","SmallCap Pressure (1W)","Microcap vs Mid/Large",d.breadth_rotation.SmallCapPressure_1W)}
      ${metricRow("IndexMomentum_1W","Index Momentum (1W)","Momentum cross-indici / crypto",d.breadth_rotation.IndexMomentum_1W)}
      ${listBlock("Leadership multi-timeframe", d.breadth_rotation.Leadership?.LeadersMultiTF)}
      ${listBlock("Leadership difensiva", d.breadth_rotation.Leadership?.DefensiveLeadership)}
      ${listBlock("Settori in ritardo", d.breadth_rotation.Leadership?.Lagging)}
      ${sectionText(d.breadth_rotation.Leadership?.ai_note)}
    </section>
  `;

  // 3. Internals
  const internalsHTML = `
    <section class="tl-panel-section">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">Market Internals (dati grezzi)</div>
      </header>
      ${listBlock("Indici (1W)", d.internals_raw.Indices_1W)}
      ${listBlock("Futures / Commodities (1W)", d.internals_raw.Futures_Move_1W)}
      ${listBlock("Curva Treasury", d.internals_raw.Curve_UST)}
      ${listBlock("Volatilità & USD", d.internals_raw.Vol_USD)}
      ${sectionText(d.internals_raw.ai_note)}
    </section>
  `;

  // 4. Street View
  const streetHTML = `
    <section class="tl-panel-section">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">Street View · Narrativa istituzionale</div>
      </header>
      ${headline("Macro (Bloomberg / Reuters / Barron's)", d.street_view.T1_MacroNews)}
      ${headline("Sell-Side / Street View", d.street_view.T1_SellSideNotes)}
      ${headline("Consensus Tone", d.street_view.T1_ConsensusTone)}
      ${sectionText(d.street_view.ai_note)}
    </section>
  `;

  // 5. Conclusione
  const sintesiHTML = `
    <section class="tl-panel-section">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">Conclusione · Tradelia AI (educational)</div>
      </header>
      ${
        Array.isArray(d.sintesi_ai.points)
          ? d.sintesi_ai.points.map(p => headline(p.title || "", p.raw || "")).join("")
          : ""
      }
      ${headline("Sintesi generale", d.sintesi_ai.summary)}
      <div class="text-[11px] text-[color:var(--muted)] mt-3">
        Questa conclusione ha esclusivamente finalità informative e formative.
        Nessuna raccomandazione o consulenza personalizzata.
      </div>
    </section>
  `;

  // 6. Audit
  const auditHTML = `
    <section class="tl-panel-section">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">Audit &amp; Qualità dati</div>
      </header>
      ${metricRow("FreshnessScore","Freshness","Aggiornamento dati",d.audit_quality.QualityMetrics?.FreshnessScore)}
      ${metricRow("ConfidenceFinal","Confidence","Affidabilità stima",d.audit_quality.QualityMetrics?.ConfidenceFinal)}
      ${metricRow("DataIntegrity","DataIntegrity","Completezza / Coerenza",d.audit_quality.QualityMetrics?.DataIntegrity)}
      ${metricRow("FeedSync","FeedSync","Allineamento feed T-1",d.audit_quality.QualityMetrics?.FeedSync)}
      ${sectionText("Semaforo: verde = aggiornato, giallo = parziale, rosso = incompleto.")}
    </section>
  `;

  // 7. MiFID
  const mifidHTML = `
    <section class="tl-panel-section">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">Nota regolamentare</div>
      </header>
      ${sectionText(d.mifid.disclaimer)}
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


/* -----------------------------------------------------------------------------
// SHELLS DESKTOP / MOBILE
// ----------------------------------------------------------------------------*/

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

/* -----------------------------------------------------------------------------
// TAB SWITCHING
// ----------------------------------------------------------------------------*/

function drawerMenuButtonPublic(key, label) {
  // desktop tab button, stile controllato da tokens.css (.f1b-tab-btn)
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
  // mobile pills
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

      // attiva/deattiva bottoni
      tabButtons.forEach(b => {
        const isActive = b.getAttribute("data-f1b-tab") === key;

        // DESKTOP sidebar
        if (b.classList.contains("f1b-tab-btn")) {
          if (isActive) {
            b.classList.add("is-active");
          } else {
            b.classList.remove("is-active");
          }
        }

        // MOBILE pills
        if (b.classList.contains("f1b-footer-tab-btn")) {
          if (isActive) {
            b.style.fontWeight = "600";
            b.style.border = "1px solid var(--ink)";
            b.style.background =
              "radial-gradient(circle at 0% 0%, color-mix(in oklab, var(--ink) 14%, transparent) 0%, transparent 60%), var(--surface-card-alt)";
            b.style.color = "var(--ink)";
            b.style.boxShadow = "0 4px 10px rgba(0,0,0,.18)";
          } else {
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

/* -----------------------------------------------------------------------------
// CARD SYSTEM (look coerente ovunque nel drawer)
// ----------------------------------------------------------------------------*/

// Card base riutilizzabile
function f1bCard({ tone, title, bodyHtml, noteHtml }) {
  const { dotColor } = toneColors(tone);
  return `
    <div class="mb-4 p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">
      <div class="flex items-start gap-2 mb-1">
        <span class="inline-block w-[8px] h-[8px] rounded-full"
          style="background:${dotColor};flex-shrink:0;"></span>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide">
          ${escapeHtml(title || "")}
        </div>
      </div>

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        ${bodyHtml || ""}
      </div>

      ${
        noteHtml
          ? `<div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">${noteHtml}</div>`
          : ""
      }
    </div>
  `;
}

// KPI compatte nella hero principale (fuori dal drawer)
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

// Metric card nel drawer
function metricBlock(metricKey, title, desc, metricObj) {
  const { textColor } = toneColors(metricObj?.tone);
  const value = escapeHtml(metricObj?.raw || "—");

  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="flex items-center gap-2">
        <span class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">
          ${value}
        </span>
      </div>
      <button
        class="info-btn"
        data-metric="${escapeAttr(metricKey)}"
        aria-label="Info ${escapeAttr(metricKey)}"
      >?</button>
    </div>

    <div class="text-[11px] leading-[1.3] text-[color:var(--muted)]">
      ${escapeHtml(desc || "")}
    </div>

    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
      ${escapeHtml(metricObj?.ai_note || "")}
    </div>
  `;

  return f1bCard({
    tone: metricObj?.tone,
    title,
    bodyHtml,
    noteHtml: ""
  });
}

// Leadership settoriale
function sectorListDetailed(title, arr) {
  let bodyHtml;
  if (!Array.isArray(arr) || !arr.length) {
    bodyHtml = `
      <div class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">
        Nessun dato.
      </div>
    `;
  } else {
    const items = arr.map(item => `
      <li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
        ${escapeHtml(item)}
      </li>
    `).join("");

    bodyHtml = `
      <ul class="list-disc pl-4 space-y-1">
        ${items}
      </ul>
    `;
  }

  return f1bCard({
    tone: "neutral",
    title,
    bodyHtml,
    noteHtml: ""
  });
}

// Liste grezze dal mercato (internals)
function listBlockCard(title, rowsArr) {
  const listItems = Array.isArray(rowsArr) && rowsArr.length
    ? rowsArr.map(r => `
        <li class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)]">
          ${escapeHtml(r)}
        </li>
      `).join("")
    : `<li class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">N/A</li>`;

  const bodyHtml = `
    <ul class="pl-4 list-disc space-y-1">
      ${listItems}
    </ul>
  `;

  return f1bCard({
    tone: "neutral",
    title,
    bodyHtml,
    noteHtml: ""
  });
}

// Blocchi narrativi istituzionali (Street View, ecc.)
function headlineBlockCard(title, body) {
  if (!body) return "";
  const bodyHtml = `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">
      ${escapeHtml(body)}
    </div>
  `;
  return f1bCard({
    tone: "neutral",
    title,
    bodyHtml,
    noteHtml: ""
  });
}

// Punti sintetici AI
function conclusionPointBlock(pointObj = {}) {
  const bodyHtml = `
    <div class="font-mono text-[12px] leading-[1.4] text-[color:var(--ink)] mb-1">
      ${escapeHtml(pointObj.raw || "")}
    </div>
    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">
      ${escapeHtml(pointObj.ai_note || "")}
    </div>
  `;
  return f1bCard({
    tone: "neutral",
    title: pointObj.title || "",
    bodyHtml,
    noteHtml: ""
  });
}

// Audit & Qualità dati
function qualityChip(keyName, qObj) {
  if (!qObj) return "";
  const { textColor } = toneColors(qObj.tone);

  const bodyHtml = `
    <div class="flex items-start justify-between gap-2 mb-1">
      <div class="font-mono font-bold text-[13px] leading-[1.4]" style="color:${textColor};">
        ${escapeHtml(qObj.raw || "—")}
      </div>

      <button
        class="info-btn"
        data-metric="${escapeAttr(keyName)}"
        aria-label="Info ${escapeAttr(keyName)}"
      >?</button>
    </div>

    <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-1">
      ${escapeHtml(qObj.ai_note || "")}
    </div>
  `;

  return f1bCard({
    tone: qObj.tone,
    title: keyName || "",
    bodyHtml,
    noteHtml: ""
  });
}

/* -----------------------------------------------------------------------------
// TONE HELPERS
// ----------------------------------------------------------------------------*/

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

// Pill tono in hero accanto a StrategyMode
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

/* -----------------------------------------------------------------------------
// NORMALIZZAZIONE DATI (TUTTO QUI È DINAMICO)
// ----------------------------------------------------------------------------*/

function normalizeDataPublicF1B(src = {}) {
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? "—",
      module: src?.meta?.module ?? "F1B · Market Regime",
      moduleVersion: src?.meta?.moduleVersion ?? "vX",
      moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
      freshness: src?.meta?.freshness ?? "≤ T-1",
      hero_intro: src?.meta?.hero_intro ?? "Volatilità, credito, curva tassi, partecipazione al rialzo e narrativa macro dominante.",
      hero_disclaimer: src?.meta?.hero_disclaimer ?? "F1B descrive lo stato del rischio di mercato nell'orizzonte 3–10 giorni, basandosi su volatilità, credito, struttura curva tassi e ampiezza settoriale. Fonti primarie: Bloomberg, Reuters, CBOE, FRED, Finviz Premium, ETFdb."
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
      points: [],
      summary: ""
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

/* -----------------------------------------------------------------------------
// ESCAPE UTILS
// ----------------------------------------------------------------------------*/

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
