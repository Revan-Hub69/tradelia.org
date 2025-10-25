// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio
//
// Versione "Institutional Model Report"
// ✅ Fix compatibilità parsing (rimosse template annidate in renderTopSectors)
// ✅ Pensato per essere importato come ES module dinamico da app.js

export function renderCard(rawData, ctx = {}) {
  const data = normalizeData(rawData);
  const { strategyMode, regimeScore, breadthPct, riskTilt } = data;
  const { toneLabel, toneColor } = computeTone(strategyMode, regimeScore);

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- Headline sezione -->
      <header class="section-headline mb-4">
        <div class="section-head-left">
          <div class="section-head-topline flex items-center flex-wrap gap-2">
            <span class="section-badge">F1</span>
            <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
              Regime di mercato
            </span>
            <span class="module-status-pill" data-state="active">ACTIVE</span>
          </div>

          <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
            Contesto rischio &amp; ampiezza del mercato
          </div>

          <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
            Classificazione del regime corrente, qualità della partecipazione al rialzo
            e inclinazione rischio/difensivo. Dati T-1.
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
          padding:1rem 1rem 3.25rem 1rem; /* spazio extra per CTA fixed in basso */
        ">

        <!-- StrategyMode + tono -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4]">
            StrategyMode
            <button
              class="info-btn info-btn--mini align-middle"
              data-metric="StrategyMode"
              aria-label="Info StrategyMode"
            >?</button>
          </div>

          <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
            <span>${escapeHtml(strategyMode || "—")}</span>

            <span
              class="px-[6px] py-[4px] rounded-md text-[11px] font-semibold leading-none border"
              style="
                background: color-mix(in oklab, ${toneColor} 10%, transparent);
                color:${toneColor};
                border-color:${toneColor};
              "
            >
              ${escapeHtml(toneLabel)}
            </span>
          </div>
        </div>

        <!-- KPI row -->
        <div class="flex flex-wrap gap-3">
          ${metricBox({
            label: "RegimeScore",
            metricKey: "RegimeScore",
            value: fmtNum(regimeScore),
            desc: "Propensione al rischio sintetica"
          })}

          ${metricBox({
            label: "Breadth (1M)",
            metricKey: "Breadth",
            value: breadthPct !== null ? fmtPct(breadthPct) : "—",
            desc: "% settori positivi su 30g"
          })}

          ${metricBox({
            label: "RiskTilt",
            metricKey: "RiskTilt",
            value: fmtNum(riskTilt),
            desc: "Ciclici vs Difensivi"
          })}
        </div>

        <!-- CTA primaria fissa -->
        <div class="absolute bottom-3 right-4 flex justify-end">
          <button
            class="f1b-cta-btn btn btn-sm"
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
            "
          >
            Dettagli regime →
          </button>
        </div>
      </div>

      <!-- Nota metrica/metodo -->
      <div class="text-[11px] leading-[1.45] text-[color:var(--muted)] mt-3">
        Indicatori costruiti su flussi settoriali, ampiezza del rialzo e volatilità implicita.
        Nessuna raccomandazione operativa.
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;

  const data = normalizeData(rawData);

  // CTA -> apre pannello dettagli
  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener("click", () => {
      openF1Drawer(data);
    });
  }

  // Tooltip "?" nella card (metriche)
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch(e){}
  }
}

/* -------------------------------------------------
   Drawer / Panel con tab responsive
   Desktop: sidebar sinistra + contenuto a destra
   Mobile: contenuto + barra tab sticky in basso
------------------------------------------------- */

function openF1Drawer(data) {
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
    console.warn("openPanel non disponibile");
    return;
  }

  const sectionsObj = buildDrawerSections(data);

  const mobileMode = isMobileViewport();
  const drawerHTML = mobileMode
    ? renderDrawerMobileShell(sectionsObj)
    : renderDrawerDesktopShell(sectionsObj);

  window.__TradeliaUI.openPanel({
    title: "F1 · Regime di mercato",
    subtitle: "Flussi settoriali, ampiezza del rialzo e volatilità (T-1)",
    sections: [
      {
        title: "",
        body: drawerHTML,
        meta: ""
      }
    ],
    footerButtons: [
      {
        label: "Chiudi",
        action: () => {
          window.__TradeliaUI.closePanel();
        }
      }
    ],
    blocking: false,
    panelSize: "wide"
  });

  // bind interattività tab dopo apertura
  setTimeout(() => {
    const panelBody = document.getElementById("panel-body");
    const panelBodyMobile = document.getElementById("panel-body-mobile");

    if (panelBody) {
      bindDrawerTabs(panelBody);
      if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
        try { window.__TradeliaUI.bindMetricInfoButtons(panelBody); } catch(e){}
      }
    }

    if (panelBodyMobile) {
      bindDrawerTabs(panelBodyMobile);
      if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
        try { window.__TradeliaUI.bindMetricInfoButtons(panelBodyMobile); } catch(e){}
      }
    }
  }, 0);
}

// Controlla viewport "mobile"
function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}

/* -------------------------------------------------
   Sezioni logiche (contenuti già formattati)
------------------------------------------------- */

function buildDrawerSections(data) {
  const {
    strategyMode,
    regimeScore,
    vixLevel,
    breadthPct,
    riskTilt,
    topSectors,
    interpretationNotes,
    auditPathID,
    sourcesTier1,
    dataLagLabel,
    confidenceFinal,
    dataIntegrity,
    feedSyncScore
  } = data;

  const regimeHTML = `
    <div class="space-y-2">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Regime attuale
      </div>

      <div class="text-[13px] text-[color:var(--ink)] leading-[1.45] font-semibold flex flex-wrap items-center gap-2">
        <span>StrategyMode: ${escapeHtml(strategyMode || "—")}</span>
        <button
          class="info-btn info-btn--mini"
          data-metric="StrategyMode"
          aria-label="Info StrategyMode"
        >?</button>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBox({
          label: "RegimeScore",
          metricKey: "RegimeScore",
          value: fmtNum(regimeScore)
        })}

        ${metricBox({
          label: "VIX",
          metricKey: "VIX",
          value: fmtNum(vixLevel)
        })}
      </div>
    </div>
  `;

  const rotationHTML = `
    <div class="space-y-2">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Rotazione &amp; partecipazione
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${metricBox({
          label: "Breadth (1M)",
          metricKey: "Breadth",
          value: breadthPct !== null ? fmtPct(breadthPct) : "—"
        })}

        ${metricBox({
          label: "RiskTilt",
          metricKey: "RiskTilt",
          value: fmtNum(riskTilt)
        })}
      </div>

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          Top settori per inflow (5d)
        </div>
        ${renderTopSectors(topSectors)}
      </div>
    </div>
  `;

  const notesHTML = `
    <div class="space-y-2">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Note interpretative
      </div>
      ${renderInterpretation(interpretationNotes)}
    </div>
  `;

  const auditHTML = `
    <div class="space-y-2">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Audit &amp; Fonti
      </div>
      ${renderAuditBlock({
        auditPathID,
        sourcesTier1,
        dataLagLabel,
        confidenceFinal,
        dataIntegrity,
        feedSyncScore
      })}
    </div>
  `;

  const mifidHTML = `
    <div class="space-y-2">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Nota regolamentare
      </div>
      ${renderMiFIDNotice()}
    </div>
  `;

  return {
    regimeHTML,
    rotationHTML,
    notesHTML,
    auditHTML,
    mifidHTML
  };
}

/* -------------------------------------------------
   Shell DESKTOP
------------------------------------------------- */

function renderDrawerDesktopShell(sectionsObj) {
  return `
    <div class="f1b-panel-desktop"
      style="
        display:flex;
        flex-direction:row;
        gap:1rem;
        min-height:300px;
      ">

      <!-- Sidebar tab -->
      <aside class="f1b-panel-menu"
        style="
          min-width:160px;
          max-width:180px;
          border-right:1px solid var(--br-card);
        ">

        ${drawerMenuButton("regime","Regime attuale", true)}
        ${drawerMenuButton("rotation","Rotazione &amp; partecipazione", false)}
        ${drawerMenuButton("notes","Note interpretative", false)}
        ${drawerMenuButton("audit","Audit &amp; Fonti", false)}
        ${drawerMenuButton("mifid","Nota regolamentare", false)}
      </aside>

      <!-- Content area -->
      <main class="f1b-panel-content flex-1 min-w-0"
        style="max-height:60vh;overflow:auto;">
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
   Shell MOBILE
------------------------------------------------- */

function renderDrawerMobileShell(sectionsObj) {
  return `
    <div class="f1b-panel-mobile"
      style="
        position:relative;
        padding-bottom:3.5rem; /* spazio per la bottom bar */
        min-height:300px;
      ">

      <!-- Content area (scrollable) -->
      <main class="f1b-panel-content-mobile"
        style="max-height:60vh;overflow:auto;">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="rotation" hidden>${sectionsObj.rotationHTML}</div>
        <div data-f1b-view="notes" hidden>${sectionsObj.notesHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>

      <!-- Bottom mobile bar -->
      <nav class="f1b-mobile-tabbar"
        style="
          position:absolute;
          left:0;right:0;bottom:0;
          display:flex;
          justify-content:space-between;
          gap:0.25rem;
          border-top:1px solid var(--br-card);
          background:var(--surface-card);
          padding:0.5rem 0.75rem;
          font-size:11px;
          line-height:1.2;
        ">

        ${drawerMobileTabButton("regime","Regime", true)}
        ${drawerMobileTabButton("rotation","Rotaz.", false)}
        ${drawerMobileTabButton("notes","Note", false)}
        ${drawerMobileTabButton("audit","Fonti", false)}
        ${drawerMobileTabButton("mifid","MiFID", false)}
      </nav>
    </div>
  `;
}

/* -------------------------------------------------
   Helpers per i bottoni tab
------------------------------------------------- */

function drawerMenuButton(key, label, active) {
  return `
    <button
      class="f1b-tab-btn block w-full text-left text-[12px] leading-[1.4] px-2 py-2 ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
      style="
        border-radius:var(--radius-card-sm);
        border-left:3px solid ${active ? "var(--brand)" : "transparent"};
        background:${active ? "color-mix(in oklab, var(--surface-card-alt) 60%, transparent)" : "transparent"};
        font-weight:${active ? "600" : "500"};
        color:var(--ink);
      "
    >
      ${label}
    </button>
  `;
}

function drawerMobileTabButton(key, label, active) {
  return `
    <button
      class="f1b-tab-btn-mobile flex-1 text-center ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
      style="
        border-radius:var(--radius-card-sm);
        font-weight:${active ? "600" : "500"};
        color:var(--ink);
        background:${active ? "color-mix(in oklab, var(--surface-card-alt) 60%, transparent)" : "transparent"};
        padding:0.4rem 0.25rem;
      "
    >
      ${label}
    </button>
  `;
}

/* -------------------------------------------------
   bind drawer tab switching (desktop e mobile)
------------------------------------------------- */

function bindDrawerTabs(root) {
  if (!root) return;

  const tabButtons = root.querySelectorAll("[data-f1b-tab]");
  const views = root.querySelectorAll("[data-f1b-view]");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-f1b-tab");
      if (!key) return;

      // 1. attiva/deattiva bottoni
      tabButtons.forEach(b => {
        const isActive = b.getAttribute("data-f1b-tab") === key;
        b.classList.toggle("is-active", isActive);
        b.style.borderLeftColor = isActive ? "var(--brand)" : "transparent";
        b.style.background = isActive
          ? "color-mix(in oklab, var(--surface-card-alt) 60%, transparent)"
          : "transparent";
        b.style.fontWeight = isActive ? "600" : "500";
      });

      // 2. mostra/nascondi viste
      views.forEach(viewEl => {
        const viewKey = viewEl.getAttribute("data-f1b-view");
        viewEl.hidden = viewKey !== key;
      });
    });
  });
}

/* -------------------------------------------------
   Helpers UI per la card
------------------------------------------------- */

function metricBox({ label, metricKey, value, desc }) {
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
          class="info-btn info-btn--mini"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[color:var(--ink)] text-[13px] leading-[1.4]">
        ${escapeHtml(value)}
      </div>

      ${desc ? `
      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
        ${escapeHtml(desc)}
      </div>` : ""}
    </div>
  `;
}

/* -------------------------------------------------
   VERSIONE SAFE: niente backtick annidati
------------------------------------------------- */

function renderTopSectors(topSectors) {
  if (!Array.isArray(topSectors) || !topSectors.length) {
    return `
      <div class="text-[12px] text-[color:var(--muted)] leading-[1.4]">
        Dati settoriali non disponibili.
      </div>
    `;
  }

  const items = topSectors.map(sec => {
    const name = sec.name || sec.sector || "—";

    let inflow = "";
    if (isNum(sec.inflow5d)) {
      inflow = fmtNum(sec.inflow5d) + " flow 5d";
    }

    let perf = "";
    if (isNum(sec.perf1m)) {
      perf = fmtPct(sec.perf1m) + " 1m";
    }

    return (
      '<li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">' +
        '<span class="font-semibold">' + escapeHtml(name) + '</span>' +
        '<span class="text-[color:var(--muted)]"> ' +
          escapeHtml(inflow) + ' ' + escapeHtml(perf) +
        '</span>' +
      '</li>'
    );
  }).join("");

  return '<ul class="list-disc pl-4 space-y-1">' + items + '</ul>';
}

function renderInterpretation(notesArr) {
  const arr = Array.isArray(notesArr) ? notesArr : [];
  if (!arr.length) {
    return `
      <div class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">
        Nessuna nota aggiuntiva.
      </div>
    `;
  }

  const lis = arr.map(n => (
    '<li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">' +
      escapeHtml(n) +
    '</li>'
  )).join("");

  return '<ul class="list-disc pl-4 space-y-1">' + lis + '</ul>';
}

function renderAuditBlock({
  auditPathID,
  sourcesTier1,
  dataLagLabel,
  confidenceFinal,
  dataIntegrity,
  feedSyncScore
}) {
  const srcList = Array.isArray(sourcesTier1)
    ? sourcesTier1.join(", ")
    : (sourcesTier1 || "—");

  return `
    <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] space-y-3">

      <div>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          AuditPathID
        </div>
        <div class="font-mono text-[13px] font-bold text-[color:var(--ink)]">
          ${escapeHtml(auditPathID || "—")}
        </div>
      </div>

      <div>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          Fonti
        </div>
        <div class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
          ${escapeHtml(srcList)}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        <div>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
            Freshness / Lag
          </div>
          <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
            ${escapeHtml(dataLagLabel || "T-1")}
          </div>
        </div>
        <div>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
            Confidence
          </div>
          <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
            ${fmtNum(confidenceFinal)}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        <div>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
            Integrità dataset
          </div>
          <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
            ${fmtNum(dataIntegrity)}
          </div>
        </div>
        <div>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
            Sync feed
          </div>
          <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
            ${fmtNum(feedSyncScore)}
          </div>
        </div>
      </div>
    </div>
  `;
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

/* -------------------------------------------------
   Normalizzazione dati e tono
------------------------------------------------- */

function normalizeData(d) {
  if (!d) d = {};

  const strategyMode =
    d.StrategyMode ||
    d.strategy_mode ||
    d.strategyMode ||
    d.decision?.tone ||
    "—";

  const regimeScore =
    valueOrNull(d.RegimeScore) ??
    valueOrNull(d.regime_score) ??
    valueOrNull(d.decision?.score);

  const breadthPct =
    valueOrNull(d.Breadth) ??
    valueOrNull(d.breadth_1m);

  const riskTilt =
    valueOrNull(d.RiskTilt) ??
    valueOrNull(d.risk_tilt);

  const vixLevel =
    valueOrNull(d.VIX) ??
    valueOrNull(d.vix_level);

  const topSectors =
    Array.isArray(d.TopSectors) ? d.TopSectors :
    Array.isArray(d.top_sectors_inflow) ? d.top_sectors_inflow :
    Array.isArray(d.top_sectors) ? d.top_sectors :
    [];

  const interpretationNotes =
    Array.isArray(d.interpretationNotes) ? d.interpretationNotes :
    Array.isArray(d.decision?.notes_list) ? d.decision.notes_list :
    d.decision?.summary ? [ d.decision.summary ] :
    d.decision?.notes ? [ d.decision.notes ] :
    [];

  const auditPathID =
    d.AuditPathID ||
    d.auditPathID ||
    d.audit?.path_id ||
    d.audit?.AuditPathID ||
    "—";

  const sourcesTier1 =
    d.sourcesTier1 ||
    d.sources ||
    ["FRED", "CBOE", "ETFdb", "Reuters"];

  const dataLagLabel =
    d.dataLagLabel ||
    d.FreshnessLabel ||
    d.freshness_label ||
    "T-1";

  const confidenceFinal =
    valueOrNull(d.ConfidenceFinal) ??
    valueOrNull(d.confidenceFinal) ??
    valueOrNull(d.audit?.confidence);

  const dataIntegrity =
    valueOrNull(d.DataIntegrity) ??
    valueOrNull(d.data_integrity) ??
    valueOrNull(d.audit?.integrity);

  const feedSyncScore =
    valueOrNull(d.FeedSync) ??
    valueOrNull(d.feed_sync) ??
    valueOrNull(d.audit?.feedSync);

  return {
    strategyMode,
    regimeScore,
    breadthPct,
    riskTilt,
    vixLevel,
    topSectors,
    interpretationNotes,
    auditPathID,
    sourcesTier1,
    dataLagLabel,
    confidenceFinal,
    dataIntegrity,
    feedSyncScore
  };
}

function computeTone(strategyMode, regimeScore) {
  let toneColor = "var(--tone-n)";
  let toneLabel = "neutral";

  const modeLow = (strategyMode || "").toLowerCase();

  if (modeLow.includes("momentum") && !modeLow.includes("light")) {
    toneColor = "var(--tone-g)";
    toneLabel = "positive";
  } else if (modeLow.includes("momentum-light")) {
    toneColor = "var(--tone-y)";
    toneLabel = "neutral";
  } else if (modeLow.includes("pullback")) {
    toneColor = "var(--tone-r)";
    toneLabel = "alert";
  } else {
    if (isNum(regimeScore) && regimeScore < 0.1) {
      toneColor = "var(--tone-r)";
      toneLabel = "alert";
    }
  }

  return { toneColor, toneLabel };
}

/* -------------------------------------------------
   Utils numeriche e escape HTML
------------------------------------------------- */

function fmtNum(v) {
  if (!isNum(v)) return "—";
  const n = Number(v);
  return n.toFixed(2).replace('.', ',');
}

function fmtPct(v) {
  if (!isNum(v)) return "—";
  const n = Number(v) * 100;
  const sign = n > 0 ? "+"" : "";
  return sign + n.toFixed(1).replace('.', ',') + "%";
}

function isNum(v){
  return v !== null && v !== undefined && !Number.isNaN(Number(v));
}

function valueOrNull(v){
  return isNum(v) ? Number(v) : null;
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

function escapeAttr(str){
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
