// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio (v19-Dynamic)
// Snapshot swing 3–10 giorni
//
// - Card riassuntiva con CTA "Dettagli regime →"
// - Drawer/panel premium responsive:
//   • Desktop: sidebar tab + contenuto scroll
//   • Mobile: fullscreen; tab bar nel footer gestita da ui-runtime
// - Tooltip "?" tramite window.__TradeliaUI.bindMetricInfoButtons
//
// Export API per app.js runtime:
//   renderCard(data, ctx)
//   bindCard(node, data, ctx)

export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataF1Bv19(rawData);

  const { toneLabel, toneColor } = computeTone(d.strategyModeMacro, d.regimeScoreLabel);

  // KPI principali (qualitativi, non numerici)
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
      value: d.volRegime || "—",
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
            Modalità del mercato (Momentum / Pullback), partecipazione al rialzo
            e inclinazione rischio vs difensivi. Orizzonte operativo swing.
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
          ${kpis.map(k => metricBoxQualitative(k)).join("")}
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

// bindCard: apre il drawer e lega tooltip
export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataF1Bv19(rawData);

  // CTA -> apre pannello dettagli
  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener("click", () => {
      openF1Drawer(data);
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
   Drawer / Panel premium con sezioni v19-Dynamic
------------------------------------------------- */

function openF1Drawer(data) {
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
    console.warn("openPanel non disponibile");
    return;
  }

  const sectionsObj = buildDrawerSectionsV19(data);

  const mobileMode = isMobileViewport();
  const drawerHTML = mobileMode
    ? renderDrawerMobileShellV19(sectionsObj)
    : renderDrawerDesktopShellV19(sectionsObj);

  // Tab list usata da ui-runtime per footer mobile
  const tabDefs = [
    { key: "regime",   label: "Regime" },
    { key: "rotation", label: "Rotaz." },
    { key: "notes",    label: "Note" },
    { key: "audit",    label: "Fonti" },
    { key: "mifid",    label: "MiFID" }
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
    subtitle: "Volatilità, ampiezza, flussi settoriali e narrativa istituzionale (T-1)",
    sections: [
      {
        title: "",
        body: drawerHTML,
        meta: ""
      }
    ],
    blocking: false,
    panelSize: "wide",
    footerButtons: mobileMode ? [] : footerButtonsDesktop,
    footerTabs: mobileMode ? tabDefs : []
  });

  // post-mount binding
  setTimeout(() => {
    const roots = [
      document.getElementById("panel-body"),
      document.getElementById("panel-body-mobile"),
      document.getElementById("panel-footer-mobile")
    ].filter(Boolean);

    roots.forEach(r => {
      bindDrawerTabsV19(r);
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
   Sezioni logiche drawer (F1B v19-Dynamic)
------------------------------------------------- */

function buildDrawerSectionsV19(d) {
  // Sezione 1: Regime attuale
  const regimeHTML = `
    <section class="tl-panel-section" data-f1b-section="regime">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Regime attuale
        </div>
      </header>

      <div class="text-[13px] text-[color:var(--ink)] leading-[1.45] font-semibold flex flex-wrap items-center gap-2 mb-3">
        <span>StrategyMode: ${escapeHtml(strategyModeMacroOrDash(d.strategyModeMacro))}</span>
        <button class="info-btn" data-metric="StrategyMode" aria-label="Info StrategyMode">?</button>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4] mb-4">
        ${miniStat("RegimeScore", "Propensione al rischio sintetica", d.regimeScoreLabel, "RegimeScore")}
        ${miniStat("Volatilità / VIX", "VIX, oro, hedge appetite", d.volRegime, "VolRegime")}
        ${miniStat("Liquidità / Curve", "Curva Treasury & costo capitale", d.liquidityRegimeScore, "LiquidityRegime")}
        ${miniStat("Credito", "Stress credito / flight to safety", d.creditRiskBlock, "CreditRisk")}
        ${miniStat("FX / USD", "Dollar tone", d.fxRegime, "FX_Regime")}
      </div>

      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
        RiskWindow (±5g)
      </div>
      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">
        ${escapeHtml(d.riskWindow || "")}
      </div>
    </section>
  `;

  // Sezione 2: Rotazione & partecipazione
  const rotationHTML = `
    <section class="tl-panel-section" data-f1b-section="rotation">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Rotazione &amp; partecipazione
        </div>
      </header>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4] mb-4">
        ${miniStat("Breadth (1M)", "% settori forti", d.breadth1M, "Breadth_1M")}
        ${miniStat("RiskTilt", "Ciclici/Growth vs Difensivi", d.riskTilt1M, "RiskTilt_1M")}
      </div>

      <div class="mb-4">
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          Bias dimensionale
        </div>
        <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] whitespace-pre-line">
          ${escapeHtml(d.sizeBias || "")}
        </div>
      </div>

      ${renderSectorListsBlock(d)}
    </section>
  `;

  // Sezione 3: Note interpretative / Tier-1
  const notesHTML = `
    <section class="tl-panel-section" data-f1b-section="notes">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Note interpretative (Tier-1)
        </div>
      </header>

      ${renderHeadlineBlock("Macro (Bloomberg / Reuters / Barron's)", d.t1MacroNews)}
      ${renderHeadlineBlock("Sell-Side / Street View", d.t1SellSideNotes)}
      ${renderHeadlineBlock("Consensus Tone", d.t1ConsensusTone)}

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-3">
        Le note riflettono la narrativa mainstream istituzionale. Nessuna raccomandazione.
      </div>
    </section>
  `;

  // Sezione 4: Audit & Fonti + semaforo qualità feed
  const auditHTML = `
    <section class="tl-panel-section" data-f1b-section="audit">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Audit &amp; Fonti
        </div>
      </header>

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] space-y-3 mb-4">
        ${auditRow("AuditPathID", d.auditPathID)}
        ${auditRow("Timestamp", d.timestamp)}
        ${auditRow("Freshness dati", d.freshnessLabel)}
        ${auditRow("Stato modulo", d.moduleState)}
        ${auditRow("Fonti", (d.sourcesTier1 || []).join(", "))}
      </div>

      <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-2 uppercase tracking-wide">
        Qualità e coerenza feed
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricChip("FreshnessScore", d.quality?.FreshnessScore)}
        ${metricChip("ConfidenceFinal", d.quality?.ConfidenceFinal)}
        ${metricChip("DataIntegrity", d.quality?.DataIntegrity)}
        ${metricChip("FeedSync", d.quality?.FeedSync)}
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

  // Sezione 5: Nota regolamentare
  const mifidHTML = `
    <section class="tl-panel-section" data-f1b-section="mifid">
      <header class="tl-panel-section-title">
        <div class="tl-panel-section-title-text">
          Nota regolamentare
        </div>
      </header>
      ${renderMiFIDNotice()}
    </section>
  `;

  return { regimeHTML, rotationHTML, notesHTML, auditHTML, mifidHTML };
}

/* -------------------------------------------------
   Shell desktop / mobile
------------------------------------------------- */

function renderDrawerDesktopShellV19(sectionsObj) {
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
          min-width:160px;
          max-width:180px;
          border-right:1px solid var(--br-card);
        ">
        ${drawerMenuButtonV19("regime","Regime attuale", true)}
        ${drawerMenuButtonV19("rotation","Rotazione &amp; partecipazione", false)}
        ${drawerMenuButtonV19("notes","Note interpretative", false)}
        ${drawerMenuButtonV19("audit","Audit &amp; Fonti", false)}
        ${drawerMenuButtonV19("mifid","Nota regolamentare", false)}
      </aside>

      <main class="f1b-panel-content flex-1 min-w-0"
        style="max-height:60vh;overflow:auto;padding:1rem;">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="rotation" hidden>${sectionsObj.rotationHTML}</div>
        <div data-f1b-view="notes" hidden>${sectionsObj.notesHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}

function renderDrawerMobileShellV19(sectionsObj) {
  return `
    <div class="f1b-drawer-mobile"
      style="
        display:flex;
        flex-direction:column;
        height:calc(100vh - 110px);
        max-height:calc(100vh - 110px);
        min-height:300px;
      ">

      <main class="f1b-panel-content-mobile flex-1 min-w-0"
        style="
          overflow:auto;
          -webkit-overflow-scrolling:touch;
          padding:1rem;
        ">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="rotation" hidden>${sectionsObj.rotationHTML}</div>
        <div data-f1b-view="notes" hidden>${sectionsObj.notesHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}

/* -------------------------------------------------
   Tab switching
------------------------------------------------- */

function drawerMenuButtonV19(key, label, active) {
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

function bindDrawerTabsV19(root) {
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

        if (b.classList.contains("f1b-tab-btn")) {
          b.style.borderLeftColor = isActive ? "var(--brand-600)" : "transparent";
          b.style.background = isActive
            ? "color-mix(in oklab, var(--surface-card-alt) 60%, transparent)"
            : "transparent";
          b.style.fontWeight = isActive ? "600" : "500";
        }

        if (b.classList.contains("f1b-footer-tab-btn")) {
          b.style.fontWeight = isActive ? "600" : "500";
          b.style.border = isActive
            ? "1px solid var(--tone-neu-fg)"
            : "1px solid var(--br-soft)";
          b.style.background = isActive
            ? `radial-gradient(circle at 0% 0%,
                var(--tone-neu-bg-hard) 0%,
                transparent 60%
              ),
              var(--surface-card-alt)`
            : "var(--surface-card)";
          b.style.color = isActive
            ? "var(--tone-neu-fg)"
            : "var(--muted)";
          b.style.boxShadow = "var(--shadow-card)";
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
   Blocchi UI interni sezioni drawer
------------------------------------------------- */

function miniStat(title, desc, value, metricKey) {
  return `
    <div class="p-2"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
      ">
      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3]">
          ${escapeHtml(title)}
        </div>
        <button
          class="info-btn"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
        >?</button>
      </div>
      <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
        ${escapeHtml(value || "—")}
      </div>
      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
        ${escapeHtml(desc || "")}
      </div>
    </div>
  `;
}

function renderSectorListsBlock(d) {
  return `
    <div class="grid gap-4 text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
      ${sectorList("Leaders multi-TF", d.leadersMultiTF)}
      ${sectorList("Leadership difensiva qualitativa", d.defensiveLeadership)}
      ${sectorList("Settori in ritardo / da evitare", d.lagging)}
    </div>
  `;
}

function sectorList(title, arr) {
  if (!Array.isArray(arr) || !arr.length) {
    return `
      <div>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          ${escapeHtml(title)}
        </div>
        <div class="text-[color:var(--muted)] text-[12.5px] leading-[1.4]">
          Nessun dato.
        </div>
      </div>
    `;
  }

  const items = arr.map(item => {
    if (typeof item === "string") {
      return `<li>${escapeHtml(item)}</li>`;
    } else {
      // fallback se in futuro passiamo oggetti {name:"Tech", lines:[...]}
      const lines = [];
      if (item.name) lines.push(item.name);
      if (Array.isArray(item.lines)) {
        item.lines.forEach(l => lines.push(l));
      }
      return `<li>${escapeHtml(lines.join(" · "))}</li>`;
    }
  }).join("");

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

function renderHeadlineBlock(title, body) {
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

/* -------------------------------------------------
   KPI box nella card (qualitativi)
------------------------------------------------- */

function metricBoxQualitative({ label, metricKey, value, desc }) {
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
        <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">
          ${escapeHtml(label)}
        </div>
        <button
          class="info-btn"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[color:var(--ink)] text-[13px] leading-[1.4]">
        ${escapeHtml(value || "—")}
      </div>

      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
        ${escapeHtml(desc || "")}
      </div>
    </div>
  `;
}

/* -------------------------------------------------
   Metriche qualità feed con semaforo (QUALITY)
------------------------------------------------- */

function toneClassFromJSON(tone) {
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

function metricChip(keyName, qObj) {
  if (!qObj) return "";
  const { label, value, tone } = qObj;
  const { dotColor, textColor } = toneClassFromJSON(tone);

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
            ${escapeHtml(label || keyName || "")}
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
        ${escapeHtml(value || "—")}
      </div>
    </div>
  `;
}

/* -------------------------------------------------
   Normalizzazione dati dal JSON F1B v19-Dynamic
------------------------------------------------- */

function normalizeDataF1Bv19(src = {}) {
  const data = {};

  // Macro regime & rischio
  data.strategyModeMacro    = src?.StrategyMode_macro ?? src?.StrategyMode ?? "—";
  data.regimeScoreLabel     = src?.RegimeScore ?? "—";

  data.breadth1M            = src?.Breadth_1M ?? "—";
  data.riskTilt1M           = src?.RiskTilt_1M ?? "—";

  data.volRegime            = src?.VolRegime ?? "—";
  data.liquidityRegimeScore = src?.LiquidityRegimeScore ?? "—";
  data.creditRiskBlock      = src?.CreditRiskBlock ?? "—";
  data.fxRegime             = src?.FX_Regime ?? "—";

  // Risk window operativo 3–10g
  data.riskWindow           = src?.FEEDTOF2?.RiskWindow
                           ?? src?.RiskWindow
                           ?? "—";

  // Rotazione / partecipazione / size bias
  data.sizeBias             = src?.SizeBias ?? "—";
  data.leadersMultiTF       = normalizeSectorArray(
                                src?.LeadersMultiTF,
                                src?.SECTORS?.LeadersMultiTF
                              );
  data.defensiveLeadership  = src?.DefensiveLeadership
                           ?? src?.SECTORS?.DefensiveLeadership
                           ?? [];
  data.lagging              = src?.Lagging
                           ?? src?.SECTORS?.Lagging
                           ?? [];

  // Narrativa T1 istituzionale
  data.t1MacroNews          = src?.ANALYSIS_T1_HEADLINES?.T1_MacroNews     ?? "";
  data.t1SellSideNotes      = src?.ANALYSIS_T1_HEADLINES?.T1_SellSideNotes ?? "";
  data.t1ConsensusTone      = src?.ANALYSIS_T1_HEADLINES?.T1_ConsensusTone ?? "";

  // Fonti
  data.sourcesTier1         = Array.isArray(src?.ANALYSIS_T1_HEADLINES?.T1_AuditSrc)
    ? src.ANALYSIS_T1_HEADLINES.T1_AuditSrc
    : (
        Array.isArray(src?.FINVIZ_FILTERS?.AuditSrc)
          ? src.FINVIZ_FILTERS.AuditSrc
          : []
      );

  // Audit meta
  data.timestamp            = src?.Timestamp ?? "—";
  data.auditPathID          = src?.AuditPathID ?? "—";
  data.moduleState          = src?.["Stato modulo"] ?? src?.StatoModulo ?? "ACTIVE";
  data.freshnessLabel       = src?.Freshness ?? "≤ T-1";

  // Quality (con semaforo)
  data.quality              = src?.QUALITY ?? {};

  return data;
}

/*
 normalizeSectorArray:
 LeadersMultiTF ecc. nel dump è array di stringhe descrittive.
 Se in futuro passiamo oggetti {name:"Tech", lines:[...]} li supporta lo stesso.
*/
function normalizeSectorArray(...candidates) {
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) {
      return c;
    }
  }
  return [];
}

/* -------------------------------------------------
   Tone pill regime (Momentum / Pullback / ecc.)
------------------------------------------------- */

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
    // fallback: se regimeScore suona negativo
    if (typeof regimeScoreLabel === "string" &&
        regimeScoreLabel.toLowerCase().includes("neg")) {
      toneColor = "var(--tone-neg-fg)";
      toneLabel = "alert";
    }
  }

  return { toneColor, toneLabel };
}

/* -------------------------------------------------
   Utilità base
------------------------------------------------- */

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

/* -------------------------------------------------
   Nota regolamentare MiFID
------------------------------------------------- */

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
