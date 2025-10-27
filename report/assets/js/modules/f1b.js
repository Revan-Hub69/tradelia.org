// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio (v19-Public)
// Snapshot swing 3–10 giorni
//
// - Card riassuntiva nel report con CTA "Dettagli regime →"
// - Drawer/panel responsive aperto via window.__TradeliaUI.openPanel()
//   • Desktop: sidebar tab sinistra + contenuto scrollabile a destra
//   • Mobile: header standard con X (closePanel), tab bar orizzontale SCORRIBILE in alto,
//             nessun footer con "Chiudi"
// - Tutte le metriche hanno (i) pallino semaforo e (ii) "?" info tooltip
// - Dati grezzi + interpretazione rapida (didattica / non MiFID)
//
// Export API per app.js runtime:
//   renderCard(data, ctx)
//   bindCard(node, data, ctx)

////////////////////////////////////////
// PUBLIC INTERFACE
////////////////////////////////////////

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublic(rawData);
  const { toneLabel, toneColor } = computeTone(d.strategyModeMacro, d.regimeScoreLabel);

  // KPI principali in card (snapshot)
  const kpis = [
    {
      label: "Breadth (1M)",
      metricKey: "Breadth_1M",
      value: d.breadth1M || "—",
      desc: "Ampiezza partecipazione al rialzo"
    },
    {
      label: "RiskTilt",
      metricKey: "RiskTilt_1M",
      value: d.riskTilt1M || "—",
      desc: "Ciclici/Growth vs Difensivi"
    },
    {
      label: "Volatilità",
      metricKey: "VolRegime",
      value: d.volHeadline || d.volRegime || "—",
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
              data-state="${escapeAttr(d.moduleState || 'ACTIVE')}"
              style="
                background:var(--surface-card-alt);
                border-color:var(--br-card);
                color:var(--ink);
              ">
              ${escapeHtml(d.moduleState || "ACTIVE")}
            </span>

            <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">
              ${escapeHtml(d.freshnessLabel || "Freshness ≤ T-1")}
            </span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Contesto rischio &amp; ampiezza del mercato
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            Modalità corrente del mercato (Momentum / Pullback), volatilità implicita,
            rotazione settoriale e stress microcap. Dati giornalieri T-1.
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
              data-metric="StrategyMode"
              aria-label="Info StrategyMode"
            >?</button>
          </div>

          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(strategyModeMacroOrDash(d.strategyModeMacro))}</span>

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

        <!-- KPI row qualitativa -->
        <div class="flex flex-wrap gap-3">
          ${kpis.map(k => metricBoxSnapshot(k)).join("")}
        </div>

        <!-- DISCLAIMER + CTA ROW -->
        <div class="mt-2 flex flex-col gap-3 lg:flex-row lg:items-start">
          <p class="text-[11px] leading-[1.4] text-[color:var(--muted)] flex-1">
            Indicatore giornaliero F1B. Nessuna raccomandazione operativa.
            Fonti Tier-1 (Bloomberg, Reuters, CBOE, FRED, Finviz Premium).
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

////////////////////////////////////////
// DRAWER PANEL
////////////////////////////////////////

function openF1DrawerPublic(data) {
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
    console.warn("openPanel non disponibile");
    return;
  }

  const sectionsObj = buildDrawerSectionsPublic(data);
  const isMobile = isMobileViewport();

  // shell HTML diverso per desktop vs mobile
  const drawerHTML = isMobile
    ? renderDrawerMobileShellPublic(sectionsObj)
    : renderDrawerDesktopShellPublic(sectionsObj);

  // Apri pannello senza footerTabs/footerButtons.
  // Chiudi = X nell’header runtime.
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
    footerButtons: [],
    footerTabs: []
  });

  // bind tab switching + tooltip dopo mount
  setTimeout(() => {
    const roots = [
      document.getElementById("panel-body-desktop"),
      document.getElementById("panel-body-mobile"),
      document.getElementById("f1b-mobile-tabbar"),
      document.getElementById("f1b-sidebar")
    ].filter(Boolean);

    roots.forEach(r => {
      bindDrawerTabsPublic(r);
      if (
        window.__TradeliaUI &&
        typeof window.__TradeliaUI.bindMetricInfoButtons === "function"
      ) {
        try { window.__TradeliaUI.bindMetricInfoButtons(r); } catch (e) {}
      }
    });
  }, 0);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

////////////////////////////////////////
// CONTENUTO SEZIONI
////////////////////////////////////////
//
// Sezioni pubbliche finali (ordine logico desk):
//
// 1. Regime & Rischio     = stato risk-on/off, vol, curva tassi, credito
// 2. Breadth & Rotazione  = ampiezza del rialzo, risk tilt, leadership settoriale
// 3. Internals            = size bias, stress microcap, funding pressure
// 4. Street View          = narrativa istituzionale T-1 (Bloomberg/Reuters/Sell-side)
// 5. Sintesi AI           = riassunto didattico non-MiFID
// 6. Audit                = auditPathID, freshness, qualità feed con semaforo
// 7. MiFID                = nota regolamentare

function buildDrawerSectionsPublic(d) {
  // 1. Regime & Rischio
  const regimeHTML = `
    <section class="tl-panel-section" data-f1b-section="regime">
      ${sectionTitle("Regime & Rischio")}

      <div class="f1b-grid-metrics">
        ${metricBlock({
          dotTone: d.toneStrategyMode,
          title: "StrategyMode",
          metricKey: "StrategyMode",
          value: strategyModeMacroOrDash(d.strategyModeMacro),
          body: "Modalità corrente del mercato.\nEsempio: Momentum = mercato orientato al rischio (leadership growth/ciclici, vol implicita che scende)."
        })}

        ${metricBlock({
          dotTone: d.toneRegimeScore,
          title: "RegimeScore",
          metricKey: "RegimeScore",
          value: d.regimeScoreLabel || "—",
          body: "Appetito rischio sintetico.\nScore >0 = risk-on.\nUsa volatilità, curva tassi, credito."
        })}

        ${metricBlock({
          dotTone: d.toneVol,
          title: "Volatilità / Hedge",
          metricKey: "VolRegime",
          value: d.volHeadline || d.volRegime || "—",
          body: "VIX, oro e domanda di hedge.\nEsempio: VIX giù / oro venduto = appetito rischio."
        })}

        ${metricBlock({
          dotTone: d.toneCurve,
          title: "Curva & Costo capitale",
          metricKey: "LiquidityRegime",
          value: d.curveHeadline || d.liquidityRegimeScore || "—",
          body: "Lettura 2s10s e livello 10Y.\nCurva meno stressata → costo capitale meno punitivo."
        })}

        ${metricBlock({
          dotTone: d.toneCredit,
          title: "Credito",
          metricKey: "CreditRisk",
          value: d.creditRiskBlock || "—",
          body: "Stress credito / flight to safety.\nSe 'benigno' → nessun segnale di fuga dal rischio."
        })}

        ${metricBlock({
          dotTone: d.toneFX,
          title: "FX / USD",
          metricKey: "FX_Regime",
          value: d.fxRegime || "—",
          body: "Dollar tone.\nForte ma non 'panic bid' = crescita USA, non risk-off globale."
        })}
      </div>

      ${textBlock({
        label: "RiskWindow (3–10g)",
        text: d.riskWindow || ""
      })}
    </section>
  `;

  // 2. Breadth & Rotazione
  const breadthHTML = `
    <section class="tl-panel-section" data-f1b-section="breadth">
      ${sectionTitle("Breadth & Rotazione")}

      <div class="f1b-grid-metrics">
        ${metricBlock({
          dotTone: d.toneBreadth,
          title: "Breadth (1M)",
          metricKey: "Breadth_1M",
          value: d.breadth1M || "—",
          body: "Quota di settori GICS positivi su 30 giorni.\n'Ampia' = rialzo diffuso, non solo mega-cap Tech."
        })}

        ${metricBlock({
          dotTone: d.toneRiskTilt,
          title: "RiskTilt",
          metricKey: "RiskTilt_1M",
          value: d.riskTilt1M || "—",
          body: "Ciclici/growth vs difensivi classici.\n'Pro-rischio' = mercato preferisce crescita e consumo discrezionale rispetto a utilities, staples."
        })}
      </div>

      ${listBlock({
        label: "Leadership settoriale",
        arr: d.leadersMultiTF,
        emptyText: "—",
        helper: "Settori con forza / inflow coerente multi-timeframe (1D / 1W / 1M...)."
      })}

      ${listBlock({
        label: "Difesa qualitativa",
        arr: d.defensiveLeadership,
        emptyText: "—",
        helper: "Settori difensivi tenuti per qualità bilancio (es. Healthcare), non solo per basso beta."
      })}

      ${listBlock({
        label: "Settori in ritardo",
        arr: d.lagging,
        emptyText: "—",
        helper: "Aree vendute / hedge inflattivo scaricato (es. Energy equity debole anche se oil fisico sale)."
      })}
    </section>
  `;

  // 3. Internals (size bias, funding stress)
  const internalsHTML = `
    <section class="tl-panel-section" data-f1b-section="internals">
      ${sectionTitle("Internals")}

      <div class="f1b-grid-metrics">
        ${metricBlock({
          dotTone: d.toneSizeBias,
          title: "Bias dimensionale",
          metricKey: "SizeBias",
          value: d.sizeBias || "—",
          body: "Flusso relativo tra mega/large vs small/micro.\nEsempio: 'Mid/Large privilegiate; micro penalizzate'."
        })}

        ${metricBlock({
          dotTone: d.toneSmallCapStress,
          title: "Stress microcap",
          metricKey: "SmallCapPressure",
          value: d.smallCapHeadline || "—",
          body: "Microcap vendute, funding cost alto, drawdown YTD pesante.\nSegnale che il mercato evita rischio di liquidità."
        })}
      </div>
    </section>
  `;

  // 4. Street View (narrativa istituzionale)
  const streetHTML = `
    <section class="tl-panel-section" data-f1b-section="street">
      ${sectionTitle("Street View")}

      ${headlineBlock("Macro (Bloomberg / Reuters)", d.t1MacroNews)}
      ${headlineBlock("Sell-side / Street View", d.t1SellSideNotes)}
      ${headlineBlock("Consensus Tone", d.t1ConsensusTone)}

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
        Le note riportano la narrativa istituzionale mainstream (T-1).
        Non costituiscono raccomandazione.
      </div>
    </section>
  `;

  // 5. Sintesi AI (voce nostra)
  const sintesiHTML = `
    <section class="tl-panel-section" data-f1b-section="sintesi">
      ${sectionTitle("Sintesi AI")}

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">
        ${escapeHtml(d.aiSummary || "Il quadro di mercato riflette appetito di rischio moderatamente positivo: volatilità implicita in calo, curva tassi meno tesa, settori growth e consumo ciclico ancora comprati. Microcap restano sotto pressione di funding, quindi il mercato privilegia nomi liquidi e quality balance sheet.")}
      </div>

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
        Interpretazione a fini didattici. Nessuna indicazione operativa o sizing di rischio.
      </div>
    </section>
  `;

  // 6. Audit & Qualità feed
  const auditHTML = `
    <section class="tl-panel-section" data-f1b-section="audit">
      ${sectionTitle("Audit")}

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] space-y-3 mb-4">
        ${auditRow("AuditPathID", d.auditPathID)}
        ${auditRow("Timestamp ET", d.timestamp)}
        ${auditRow("Freshness dati", d.freshnessLabel)}
        ${auditRow("Stato modulo", d.moduleState)}
        ${auditRow("Fonti Tier-1", (d.sourcesTier1 || []).join(", "))}
      </div>

      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-2 uppercase tracking-wide">
        Qualità &amp; Coerenza feed
      </div>

      <div class="f1b-grid-quality">
        ${qualityChip("FreshnessScore", d.quality?.FreshnessScore, "Dati aggiornati a T-1 o meglio.")}
        ${qualityChip("ConfidenceFinal", d.quality?.ConfidenceFinal, "Feed coerente e senza buchi critici.")}
        ${qualityChip("DataIntegrity", d.quality?.DataIntegrity, "Serie microcap/funding possono essere rumorose.")}
        ${qualityChip("FeedSync", d.quality?.FeedSync, "Allineamento tra le fonti coerente con lo snapshot corrente.")}
      </div>

      <div class="mt-4 text-[11px] leading-[1.4] text-[color:var(--muted)]">
        Semaforo interno:
        verde = dati coerenti e aggiornati,
        giallo = parziale/debole,
        rosso = incoerente o incompleto.
        Nessuna raccomandazione operativa.
      </div>
    </section>
  `;

  // 7. MiFID / disclaimer regolamentare
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
    sintesiHTML,
    auditHTML,
    mifidHTML
  };
}

////////////////////////////////////////
// DESKTOP SHELL
////////////////////////////////////////

function renderDrawerDesktopShellPublic(sectionsObj) {
  return `
    <div class="f1b-panel-desktop"
      style="
        display:flex;
        flex-direction:row;
        gap:1rem;
        min-height:300px;
      ">

      <!-- Sidebar tab (desktop) -->
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
        ${desktopTabButton("sintesi","Sintesi AI", false)}
        ${desktopTabButton("audit","Audit", false)}
        ${desktopTabButton("mifid","MiFID", false)}
      </aside>

      <!-- Content area -->
      <main class="f1b-panel-content flex-1 min-w-0"
        id="panel-body-desktop"
        style="max-height:75vh;overflow:auto;padding:1rem;">
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

////////////////////////////////////////
// MOBILE SHELL
////////////////////////////////////////
//
// - Barra tab scrollabile in alto (sticky)
// - Nessun footer esterno con "Chiudi"
// - 100vh: scrolla solo il main interno

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
        ${mobileTabButton("sintesi","Sintesi AI", false)}
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
        <div data-f1b-view="sintesi" hidden>${sectionsObj.sintesiHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}

////////////////////////////////////////
// TAB SWITCHING (desktop + mobile)
////////////////////////////////////////

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

      // aggiorna stato attivo su TUTTE le tab (desktop sidebar + mobile nav)
      const allBtns = document.querySelectorAll("[data-f1b-tab]");
      allBtns.forEach(b => {
        const isActive = b.getAttribute("data-f1b-tab") === key;

        // desktop style
        if (b.classList.contains("f1b-tab-btn")) {
          b.style.borderLeftColor = isActive ? "var(--brand-600)" : "transparent";
          b.style.fontWeight = isActive ? "600" : "500";
          b.style.color = isActive ? "var(--ink)" : "var(--muted)";
        }

        // mobile pill style
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

      // mostra solo la vista giusta
      views.forEach(viewEl => {
        const viewKey = viewEl.getAttribute("data-f1b-view");
        viewEl.hidden = viewKey !== key;
      });
    });
  });
}

////////////////////////////////////////
// BUILDING BLOCKS UI (card metriche, liste, blocchi testo)
////////////////////////////////////////

function sectionTitle(txt) {
  return `
    <header class="tl-panel-section-title mb-3">
      <div class="tl-panel-section-title-text text-[14px] font-semibold text-[color:var(--ink)] leading-[1.4]">
        ${escapeHtml(txt)}
      </div>
    </header>
  `;
}

// griglia metrica: mobile 1col, desktop 2col
// userà .f1b-grid-metrics in stile inline qui
// Per evitare overflow dei "?", ogni card è full-width mobile.
function metricBlock({ dotTone, title, metricKey, value, body }) {
  const { dotColor } = toneColors(dotTone);

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
        ${escapeHtml(value || "—")}
      </div>

      <div class="text-[12px] leading-[1.4] text-[color:var(--muted)] whitespace-pre-line">
        ${escapeHtml(body || "")}
      </div>
    </div>
  `;
}

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

function listBlock({ label, arr, emptyText, helper }) {
  const list = Array.isArray(arr) && arr.length
    ? arr.map(item => {
        if (typeof item === "string") return `<li>${escapeHtml(item)}</li>`;
        // fallback oggetto {name, lines[]}
        const lines = [];
        if (item.name) lines.push(item.name);
        if (Array.isArray(item.lines)) lines.push(...item.lines);
        return `<li>${escapeHtml(lines.join(" · "))}</li>`;
      }).join("")
    : `<li class="text-[color:var(--muted)]">${escapeHtml(emptyText || "—")}</li>`;

  return `
    <div class="mt-4">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        ${escapeHtml(label)}
      </div>
      <ul class="list-disc pl-4 space-y-1 text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        ${list}
      </ul>
      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)] mt-2">
        ${escapeHtml(helper || "")}
      </div>
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

// Quality chip (Audit) responsive
function qualityChip(metricKey, qObj, explainer) {
  if (!qObj) return "";
  const { dotColor, textColor } = toneColors(qObj.tone);
  const label  = qObj.label || metricKey || "";
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
        ${escapeHtml(explainer || "")}
      </div>
    </div>
  `;
}

////////////////////////////////////////
// RESPONSIVE GRID HELPERS (inline styles)
//
// f1b-grid-metrics -> mobile 1 col, desktop 2 col
// f1b-grid-quality -> mobile 2 col, desktop 4 col
//
// Nota: qui facciamo versioni base inline-friendly.
// Se hai già tailwind/utilities globali puoi sostituire con classi responsive native.

const gridMetricsStyleMobile = `
  display:grid;
  grid-template-columns:1fr;
  gap:0.75rem;
`;

const gridMetricsStyleDesktop = `
  @media(min-width:768px){
    .f1b-grid-metrics{
      grid-template-columns:1fr 1fr;
    }
  }
  @media(min-width:1024px){
    .f1b-grid-metrics{
      grid-template-columns:1fr 1fr;
    }
  }
`;

const gridQualityStyleMobile = `
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:0.75rem;
`;

const gridQualityStyleDesktop = `
  @media(min-width:768px){
    .f1b-grid-quality{
      grid-template-columns:1fr 1fr 1fr 1fr;
    }
  }
`;

(function injectF1BGridsOnce(){
  if (document.getElementById("f1b-grid-styles")) return;
  const styleTag = document.createElement("style");
  styleTag.id = "f1b-grid-styles";
  styleTag.textContent = `
    .f1b-grid-metrics{
      ${gridMetricsStyleMobile}
    }
    ${gridMetricsStyleDesktop}

    .f1b-grid-quality{
      ${gridQualityStyleMobile}
    }
    ${gridQualityStyleDesktop}
  `;
  document.head.appendChild(styleTag);
})();

////////////////////////////////////////
// SEMAFORO / TONALITÀ
////////////////////////////////////////

function toneColors(tone) {
  // tone: "green" | "yellow" | "red" | undefined
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

////////////////////////////////////////
// NORMALIZZAZIONE DATI (input JSON F1B)
////////////////////////////////////////
//
// Ci aspettiamo un JSON tipo (esempio ridotto):
//
// {
//   "AuditPathID": "SWG25F1B_20251027",
//   "Freshness": "≤ T-1",
//   "StatoModulo": "ACTIVE",
//   "Timestamp": "2025-10-27 10:25 ET",
//
//   "Breadth_1M": "Ampia ↑",
//   "RiskTilt_1M": "Pro-rischio ↑",
//   "VolRegime": "Rischio-on (+1)",
//   "LiquidityRegimeScore": "Favorable →",
//   "CreditRiskBlock": "Benigno →",
//   "FX_Regime": "USD lievemente forte →",
//
//   "RegimeScore": "Positivo (>0)",
//   "StrategyMode_macro": "Momentum",
//
//   "SizeBias": "Mid/Large privilegiate; micro penalizzate",
//   "SmallCapPressure_1W": "Microcap -1.7% 1W, -23% YTD",
//   "RiskWindow": "Oil(+8% W/W)... VIX −7.6% W/W ...",
//
//   "SECTORS": {
//      "LeadersMultiTF":[...],
//      "DefensiveLeadership":[...],
//      "Lagging":[...]
//   },
//
//   "ANALYSIS_T1_HEADLINES": {
//      "T1_MacroNews": "...",
//      "T1_SellSideNotes": "...",
//      "T1_ConsensusTone": "...",
//      "T1_AuditSrc": ["Bloomberg ...","Reuters ..."]
//   },
//
//   "QUALITY": {
//      "FreshnessScore":    { "label":"FreshnessScore", "value":"≤ T-1", "tone":"green" },
//      "ConfidenceFinal":   { "label":"ConfidenceFinal","value":"0.92", "tone":"green" },
//      "DataIntegrity":     { "label":"DataIntegrity",  "value":"0.88", "tone":"yellow" },
//      "FeedSync":          { "label":"FeedSync",       "value":"T-1 OK", "tone":"green" }
//   }
// }

function normalizeDataPublic(src = {}) {
  const data = {};

  // meta / audit
  data.auditPathID    = src.AuditPathID || src.auditPathID || "—";
  data.timestamp      = src.Timestamp || "—";
  data.freshnessLabel = src.Freshness || "≤ T-1";
  data.moduleState    = src.StatoModulo || src["Stato modulo"] || "ACTIVE";

  // regime macro
  data.strategyModeMacro = src.StrategyMode_macro || src.StrategyMode || "—";
  data.regimeScoreLabel  = src.RegimeScore || "—";

  // breadth / rotazione
  data.breadth1M   = src.Breadth_1M || src.Breadth || "—";
  data.riskTilt1M  = src.RiskTilt_1M || src.RiskTilt || "—";

  // vol / curva / credito / FX
  data.volRegime            = src.VolRegime || "—";
  data.volHeadline          = src.VolHeadline || null; // es: "VIX −7.6% 1W / Oro −7.8% 1W"
  data.liquidityRegimeScore = src.LiquidityRegimeScore || "—";
  data.curveHeadline        = src.CurveHeadline || null; // es: "Curva 2s10s ~+0.5pp..."
  data.creditRiskBlock      = src.CreditRiskBlock || "—";
  data.fxRegime             = src.FX_Regime || "—";

  // risk window
  data.riskWindow = src.RiskWindow
    || (src.FEEDTOF2 && src.FEEDTOF2.RiskWindow)
    || "";

  // internals / size bias
  data.sizeBias = src.SizeBias || "—";
  data.smallCapHeadline =
    src.SmallCapPressure_1W ||
    src.SmallCapPressure ||
    "—";

  // leaders / difensivi / lagging
  data.leadersMultiTF = normalizeArray(
    src.LeadersMultiTF,
    src.SECTORS && src.SECTORS.LeadersMultiTF
  );

  data.defensiveLeadership = normalizeArray(
    src.DefensiveLeadership,
    src.SECTORS && src.SECTORS.DefensiveLeadership
  );

  data.lagging = normalizeArray(
    src.Lagging,
    src.SECTORS && src.SECTORS.Lagging
  );

  // street view / narrativa T-1 istituzionale
  data.t1MacroNews     = src.ANALYSIS_T1_HEADLINES?.T1_MacroNews     || "";
  data.t1SellSideNotes = src.ANALYSIS_T1_HEADLINES?.T1_SellSideNotes || "";
  data.t1ConsensusTone = src.ANALYSIS_T1_HEADLINES?.T1_ConsensusTone || "";

  // fonti di audit narrative
  data.sourcesTier1 = Array.isArray(src.ANALYSIS_T1_HEADLINES?.T1_AuditSrc)
    ? src.ANALYSIS_T1_HEADLINES.T1_AuditSrc
    : [];

  // qualità feed
  data.quality = src.QUALITY || {};

  // sintesi AI (se vogliamo passarla dal backend)
  data.aiSummary = src.SintesiAI || src.SummaryAI || src.Sintesi || "";

  // semafori (tone) per le metriche principali
  data.toneStrategyMode   = src.Tone?.StrategyMode   || "green";
  data.toneRegimeScore    = src.Tone?.RegimeScore    || "green";
  data.toneVol            = src.Tone?.VolRegime      || "green";
  data.toneCurve          = src.Tone?.LiquidityRegime|| "yellow";
  data.toneCredit         = src.Tone?.CreditRisk     || "green";
  data.toneFX             = src.Tone?.FX_Regime      || "yellow";
  data.toneBreadth        = src.Tone?.Breadth_1M     || "green";
  data.toneRiskTilt       = src.Tone?.RiskTilt_1M    || "green";
  data.toneSizeBias       = src.Tone?.SizeBias       || "yellow";
  data.toneSmallCapStress = src.Tone?.SmallCapStress || "red";

  return data;
}

// fallback arrays
function normalizeArray(...candidates) {
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
  }
  return [];
}

////////////////////////////////////////
// TONE PILL (StrategyMode → pill verde/gialla/rossa nel card snapshot)
////////////////////////////////////////

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
    if (typeof regimeScoreLabel === "string" &&
        regimeScoreLabel.toLowerCase().includes("neg")) {
      toneColor = "var(--tone-neg-fg)";
      toneLabel = "alert";
    }
  }

  return { toneColor, toneLabel };
}

////////////////////////////////////////
// SNAPSHOT KPI BOX (card sopra la CTA)
////////////////////////////////////////

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

////////////////////////////////////////
// UTILS
////////////////////////////////////////

function strategyModeMacroOrDash(v) {
  return v || "—";
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
