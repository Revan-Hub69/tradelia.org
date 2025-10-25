// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio
//
// Versione istituzionale aggiornata:
// - Card principale F1 con StrategyMode + KPI sintetici
// - Drawer "console" con tab (desktop sidebar / mobile bottom bar)
// - Icone di stato metrica (✓ / ! / ✕) via flagStatus
// - Nessun inline style che rompe il dark theme: usiamo classi e var da tokens.css
//
// Esporta:
//   renderCard(data, ctx)
//   bindCard(node, data, ctx)
//
// Dipendenze lato runtime globale (ui-runtime.js):
// - window.__TradeliaUI.openPanel / closePanel / bindMetricInfoButtons
// - tokens.css già aggiornato con le classi .is-active, .metric-box, ecc.


// -------------------------------------------------
// Public API
// -------------------------------------------------

export function renderCard(rawData, ctx = {}) {
  const data = normalizeData(rawData);

  const {
    strategyMode,
    regimeScore,
    breadthPct,
    riskTilt,
    toneLabel,
    toneClass
  } = decorateForView(data);

  return `
    <section class="f1b-card-container text-[13px] leading-[1.5] text-[color:var(--ink)] font-sans">

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
      <div class="relative flex flex-col gap-4 card-compact
                  bg-[color:var(--surface-card)]
                  border border-[color:var(--br-card)]
                  rounded-[var(--radius-card)]
                  shadow-[var(--shadow-card)]
                  p-4 pb-14
                  sm:pb-16">

        <!-- StrategyMode / stance -->
        <div>
          <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4] flex items-center flex-wrap gap-1">
            <span>StrategyMode</span>
            <button
              class="info-btn info-btn--mini align-middle"
              data-metric="StrategyMode"
              aria-label="Info StrategyMode"
            >?</button>
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-1">
            <span class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)]">
              ${escapeHtml(strategyMode || "—")}
            </span>

            <span
              class="regime-stance-pill ${toneClass}"
              role="status"
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
            desc: "Propensione al rischio sintetica",
            flagStatus: data.regimeScoreFlag
          })}

          ${metricBox({
            label: "Breadth (1M)",
            metricKey: "Breadth",
            value: breadthPct !== null ? fmtPct(breadthPct) : "—",
            desc: "% settori positivi su 30g",
            flagStatus: data.breadthFlag
          })}

          ${metricBox({
            label: "RiskTilt",
            metricKey: "RiskTilt",
            value: fmtNum(riskTilt),
            desc: "Ciclici vs Difensivi",
            flagStatus: data.riskTiltFlag
          })}
        </div>

        <!-- CTA primaria fissa in basso a destra -->
        <div class="absolute bottom-3 right-4 flex justify-end">
          <button
            class="f1b-cta-btn btn btn-sm text-[12px] font-semibold leading-[1.3] min-w-max
                   bg-[color:var(--ink)]
                   text-[color:var(--surface-page)]
                   border border-[color:var(--ink)]
                   rounded-[var(--radius-card-sm)]
                   shadow-[var(--shadow-card)]"
            data-open-f1b-details="true"
            type="button"
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

  // Collega i tooltip "?" nella card
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (e) {}
  }
}


// -------------------------------------------------
// Drawer panel (console largata con tab)
// -------------------------------------------------

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

  // Dopo apertura: bind tab switching sul contenuto aperto
  // (lo facciamo async 0 per aspettare l'inserimento DOM del panel)
  setTimeout(() => {
    const panelBody        = document.getElementById("panel-body");
    const panelBodyMobile  = document.getElementById("panel-body-mobile");

    if (panelBody) {
      bindDrawerTabs(panelBody);
    }
    if (panelBodyMobile) {
      bindDrawerTabs(panelBodyMobile);
    }
  }, 0);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 767px)").matches;
}


// -------------------------------------------------
// Costruzione contenuti drawer (sezioni)
// -------------------------------------------------

function buildDrawerSections(dataRaw) {
  const data = normalizeData(dataRaw);
  const v = decorateForView(data);

  const regimeHTML = sectionRegimeBlock(v, data);
  const rotationHTML = sectionRotationBlock(v, data);
  const notesHTML = sectionNotesBlock(v, data);
  const auditHTML = sectionAuditBlock(v, data);
  const mifidHTML = sectionMiFIDBlock();

  return {
    regimeHTML,
    rotationHTML,
    notesHTML,
    auditHTML,
    mifidHTML
  };
}


// -------------------------------------------------
// Drawer DESKTOP shell
// -------------------------------------------------

function renderDrawerDesktopShell(sectionsObj) {
  return `
    <div class="f1b-panel-desktop flex flex-row gap-4 min-h-[300px]">

      <!-- Sidebar tab -->
      <aside class="f1b-panel-menu min-w-[160px] max-w-[180px] border-r border-[color:var(--br-card)] pr-2">
        ${drawerMenuButton("regime","Regime attuale", true)}
        ${drawerMenuButton("rotation","Rotazione &amp; partecipazione", false)}
        ${drawerMenuButton("notes","Note interpretative", false)}
        ${drawerMenuButton("audit","Audit &amp; Fonti", false)}
        ${drawerMenuButton("mifid","Nota regolamentare", false)}
      </aside>

      <!-- Content area -->
      <main class="f1b-panel-content flex-1 min-w-0 max-h-[60vh] overflow-auto space-y-4">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="rotation" hidden>${sectionsObj.rotationHTML}</div>
        <div data-f1b-view="notes" hidden>${sectionsObj.notesHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>
    </div>
  `;
}


// -------------------------------------------------
// Drawer MOBILE shell
// -------------------------------------------------

function renderDrawerMobileShell(sectionsObj) {
  return `
    <div class="f1b-panel-mobile relative pb-14 min-h-[300px]">

      <!-- Content area -->
      <main class="f1b-panel-content-mobile max-h-[60vh] overflow-auto space-y-4">
        <div data-f1b-view="regime">${sectionsObj.regimeHTML}</div>
        <div data-f1b-view="rotation" hidden>${sectionsObj.rotationHTML}</div>
        <div data-f1b-view="notes" hidden>${sectionsObj.notesHTML}</div>
        <div data-f1b-view="audit" hidden>${sectionsObj.auditHTML}</div>
        <div data-f1b-view="mifid" hidden>${sectionsObj.mifidHTML}</div>
      </main>

      <!-- Bottom mobile bar -->
      <nav class="f1b-mobile-tabbar absolute left-0 right-0 bottom-0 flex justify-between gap-1
                  border-t border-[color:var(--br-card)]
                  bg-[color:var(--surface-card)]
                  px-3 py-2 text-[11px] leading-[1.2]">
        ${drawerMobileTabButton("regime","Regime", true)}
        ${drawerMobileTabButton("rotation","Rotaz.", false)}
        ${drawerMobileTabButton("notes","Note", false)}
        ${drawerMobileTabButton("audit","Fonti", false)}
        ${drawerMobileTabButton("mifid","MiFID", false)}
      </nav>
    </div>
  `;
}


// -------------------------------------------------
// Drawer Nav Buttons
// -------------------------------------------------

function drawerMenuButton(key, label, active) {
  return `
    <button
      class="f1b-tab-btn block w-full text-left text-[12px] leading-[1.4] px-2 py-2
             rounded-[var(--radius-card-sm)]
             border-l-[3px] border-l-transparent
             ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
    >
      ${label}
    </button>
  `;
}

function drawerMobileTabButton(key, label, active) {
  return `
    <button
      class="f1b-tab-btn-mobile flex-1 text-center
             rounded-[var(--radius-card-sm)]
             px-1 py-[0.4rem]
             ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
    >
      ${label}
    </button>
  `;
}


// -------------------------------------------------
// Drawer tab switching logic
// (usa solo toggle .is-active e hidden, niente inline colori!)
// -------------------------------------------------

function bindDrawerTabs(root) {
  if (!root) return;

  const tabButtons = root.querySelectorAll("[data-f1b-tab]");
  const views = root.querySelectorAll("[data-f1b-view]");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-f1b-tab");
      if (!key) return;

      // Stato bottoni
      tabButtons.forEach(b => {
        const isActive = b.getAttribute("data-f1b-tab") === key;
        b.classList.toggle("is-active", isActive);
      });

      // Stato viste
      views.forEach(viewEl => {
        const viewKey = viewEl.getAttribute("data-f1b-view");
        viewEl.hidden = (viewKey !== key);
      });
    });
  });
}


// -------------------------------------------------
// Drawer sections content builders
// -------------------------------------------------

function sectionRegimeBlock(v, raw) {
  return `
    <section class="space-y-3
                    bg-[color:var(--surface-card-alt)]
                    border border-[color:var(--br-card)]
                    rounded-[var(--radius-card)]
                    shadow-[var(--shadow-card)]
                    p-3">

      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Regime attuale
      </div>

      <div class="flex flex-wrap items-center gap-2 text-[13px] text-[color:var(--ink)] leading-[1.45] font-semibold">
        <span>StrategyMode: ${escapeHtml(v.strategyMode || "—")}</span>
        <button
          class="info-btn info-btn--mini"
          data-metric="StrategyMode"
          aria-label="Info StrategyMode"
        >?</button>

        <span class="regime-stance-pill ${v.toneClass}">
          ${escapeHtml(v.toneLabel)}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${smallMetricBlock({
          title: "RegimeScore",
          metricKey: "RegimeScore",
          value: fmtNum(v.regimeScore),
          flagStatus: raw.regimeScoreFlag
        })}

        ${smallMetricBlock({
          title: "VIX",
          metricKey: "VIX",
          value: fmtNum(v.vixLevel),
          flagStatus: raw.vixFlag
        })}
      </div>
    </section>
  `;
}

function sectionRotationBlock(v, raw) {
  return `
    <section class="space-y-3
                    bg-[color:var(--surface-card-alt)]
                    border border-[color:var(--br-card)]
                    rounded-[var(--radius-card)]
                    shadow-[var(--shadow-card)]
                    p-3">

      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Rotazione &amp; partecipazione
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${smallMetricBlock({
          title: "Breadth (1M)",
          metricKey: "Breadth",
          value: v.breadthPct !== null ? fmtPct(v.breadthPct) : "—",
          flagStatus: raw.breadthFlag
        })}

        ${smallMetricBlock({
          title: "RiskTilt",
          metricKey: "RiskTilt",
          value: fmtNum(v.riskTilt),
          flagStatus: raw.riskTiltFlag
        })}
      </div>

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          Top settori per inflow (5d)
        </div>
        ${renderTopSectors(v.topSectors)}
      </div>
    </section>
  `;
}

function sectionNotesBlock(v) {
  return `
    <section class="space-y-3
                    bg-[color:var(--surface-card-alt)]
                    border border-[color:var(--br-card)]
                    rounded-[var(--radius-card)]
                    shadow-[var(--shadow-card)]
                    p-3">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Note interpretative
      </div>
      ${renderInterpretation(v.interpretationNotes)}
    </section>
  `;
}

function sectionAuditBlock(v, raw) {
  return `
    <section class="space-y-3
                    bg-[color:var(--surface-card-alt)]
                    border border-[color:var(--br-card)]
                    rounded-[var(--radius-card)]
                    shadow-[var(--shadow-card)]
                    p-3">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Audit &amp; Fonti
      </div>
      ${renderAuditBlock({
        auditPathID: v.auditPathID,
        sourcesTier1: v.sourcesTier1,
        dataLagLabel: v.dataLagLabel,
        confidenceFinal: v.confidenceFinal,
        dataIntegrity: v.dataIntegrity,
        feedSyncScore: v.feedSyncScore
      })}
    </section>
  `;
}

function sectionMiFIDBlock() {
  return `
    <section class="space-y-3
                    bg-[color:var(--surface-card-alt)]
                    border border-[color:var(--br-card)]
                    rounded-[var(--radius-card)]
                    shadow-[var(--shadow-card)]
                    p-3">
      <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        Nota regolamentare
      </div>
      ${renderMiFIDNotice()}
    </section>
  `;
}


// -------------------------------------------------
// Metric card fragments
// -------------------------------------------------

function metricBox({ label, metricKey, value, desc, flagStatus }) {
  return `
    <div class="flex-1 min-w-[90px]
                bg-[color:var(--surface-card-alt)]
                border border-[color:var(--br-card)]
                rounded-[var(--radius-card)]
                shadow-[var(--shadow-card)]
                p-3">

      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-1">
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold leading-[1.3]">
            ${escapeHtml(label)}
          </div>
          ${flagIcon(flagStatus)}
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

      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
        ${escapeHtml(desc || "")}
      </div>
    </div>
  `;
}

function smallMetricBlock({ title, metricKey, value, flagStatus }) {
  return `
    <div class="bg-[color:var(--surface-card)]
                border border-[color:var(--br-card)]
                rounded-[var(--radius-card-sm)]
                shadow-[var(--shadow-card)]
                p-2">

      <div class="flex items-start justify-between gap-1 mb-1">
        <div class="flex items-start gap-1">
          <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3]">
            ${escapeHtml(title)}
          </div>
          ${flagIcon(flagStatus)}
        </div>

        <button
          class="info-btn info-btn--mini"
          data-metric="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[13px] text-[color:var(--ink)] leading-[1.4]">
        ${escapeHtml(value)}
      </div>
    </div>
  `;
}


// -------------------------------------------------
// Icone stato metrica (✓ / ! / ✕) stile matita istituzionale
// -------------------------------------------------

function flagIcon(flagStatus) {
  if (!flagStatus || flagStatus === "neutral") {
    return "";
  }

  if (flagStatus === "pos") {
    // ✓ verde
    return `
      <span class="metric-flag metric-flag--pos" aria-label="positivo">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 8C20 8 10 18 10 31C10 44 20.5 56 33 56C45 56 54 46 54 33C54 20 45 10 35 9"
            class="ring-stroke-1"/>
          <path d="M31 8.5C19 9 11 18.5 11 31C11 43 20 55 33 55C45 55 53 46 53 34C53 22 45 12 36 10"
            class="ring-stroke-2"/>
          <path d="M20 32 C23 35.5, 26.5 39, 28.5 41.5 C32.5 36, 37 30, 44 24"
            class="mark-stroke-1"/>
          <path d="M20.5 32.5 C23.2 35.7, 26.8 39.1, 28.8 41.2 C32.8 35.8, 37.2 29.8, 43.5 24.5"
            class="mark-stroke-2"/>
        </svg>
      </span>`;
  }

  if (flagStatus === "warn") {
    // ! giallo
    return `
      <span class="metric-flag metric-flag--warn" aria-label="attenzione">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 8C20 8 10 18 10 31C10 44 20.5 56 33 56C45 56 54 46 54 33C54 20 45 10 35 9"
            class="ring-stroke-1"/>
          <path d="M31 8.5C19 9 11 18.5 11 31C11 43 20 55 33 55C45 55 53 46 53 34C53 22 45 12 36 10"
            class="ring-stroke-2"/>
          <path d="M32 20 C31.5 24, 31 28, 31 32 C31 33 33 33 33 32 C33 28 33.5 24 34 20"
            class="mark-stroke-1"/>
          <path d="M32.5 20.5 C32 24, 31.6 28, 31.6 31.5"
            class="mark-stroke-2"/>
          <path d="M32 38.5 C31.5 39.8, 32.5 41, 33 40 C33.5 38.8, 32.5 37.8, 32 38.5"
            class="dot-stroke-1"/>
        </svg>
      </span>`;
  }

  if (flagStatus === "neg") {
    // ✕ rossa
    return `
      <span class="metric-flag metric-flag--neg" aria-label="negativo">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 8C20 8 10 18 10 31C10 44 20.5 56 33 56C45 56 54 46 54 33C54 20 45 10 35 9"
            class="ring-stroke-1"/>
          <path d="M31 8.5C19 9 11 18.5 11 31C11 43 20 55 33 55C45 55 53 46 53 34C53 22 45 12 36 10"
            class="ring-stroke-2"/>
          <path d="M24 24 C27 27, 30 30, 33 33 C35 35, 37 37, 40 40"
            class="mark-stroke-1"/>
          <path d="M24.5 24.5 C27.2 27.2, 30.2 30.2, 33.2 33.2 C35.2 35.2, 37.5 37.5, 39.5 39.5"
            class="mark-stroke-2"/>
          <path d="M40 24 C37 27, 34 30, 31 33 C29 35, 27 37, 24 40"
            class="mark-stroke-1"/>
          <path d="M39.5 24.5 C36.8 27.2, 33.8 30.2, 30.8 33.2 C28.8 35.2, 26.5 37.5, 24.5 39.5"
            class="mark-stroke-2"/>
        </svg>
      </span>`;
  }

  return "";
}


// -------------------------------------------------
// Top settori / Note / Audit / MiFID blocks
// -------------------------------------------------

function renderTopSectors(topSectors) {
  if (!Array.isArray(topSectors) || !topSectors.length) {
    return `
      <div class="text-[12px] text-[color:var(--muted)] leading-[1.4]">
        Dati settoriali non disponibili.
      </div>
    `;
  }

  const items = topSectors.map(sec => {
    const name   = sec.name || sec.sector || "—";
    const inflow = isNum(sec.inflow5d) ? (fmtNum(sec.inflow5d) + " flow 5d") : "";
    const perf   = isNum(sec.perf1m)   ? (fmtPct(sec.perf1m)   + " 1m")      : "";

    return `
      <li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
        <span class="font-semibold">${escapeHtml(name)}</span>
        <span class="text-[color:var(--muted)]">
          ${escapeHtml(inflow)} ${escapeHtml(perf)}
        </span>
      </li>
    `;
  }).join("");

  return `
    <ul class="list-disc pl-4 space-y-1">
      ${items}
    </ul>
  `;
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

  const lis = arr.map(n => `
    <li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
      ${escapeHtml(n)}
    </li>
  `).join("");

  return `
    <ul class="list-disc pl-4 space-y-1">
      ${lis}
    </ul>
  `;
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


// -------------------------------------------------
// Data normalization + tone decoration
// -------------------------------------------------

function normalizeData(d) {
  if (!d) d = {};

  const strategyMode =
    d.StrategyMode ??
    d.strategy_mode ??
    d.strategyMode ??
    d.decision?.tone ??
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
    d.AuditPathID ??
    d.auditPathID ??
    d.audit?.path_id ??
    d.audit?.AuditPathID ??
    "—";

  const sourcesTier1 = d.sourcesTier1 ??
    d.sources ??
    ["FRED", "CBOE", "ETFdb", "Reuters"];

  const dataLagLabel =
    d.dataLagLabel ??
    d.FreshnessLabel ??
    d.freshness_label ??
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

  // flagStatus opzionali che arrivano dal modello:
  const regimeScoreFlag = d.RegimeScoreFlag || d.regimeScoreFlag || "neutral";
  const breadthFlag     = d.BreadthFlag     || d.breadthFlag     || "neutral";
  const riskTiltFlag    = d.RiskTiltFlag    || d.riskTiltFlag    || "neutral";
  const vixFlag         = d.VIXFlag         || d.vixFlag         || "neutral";

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
    feedSyncScore,
    regimeScoreFlag,
    breadthFlag,
    riskTiltFlag,
    vixFlag
  };
}

function decorateForView(data) {
  const {strategyMode, regimeScore} = data;

  const { toneLabel, toneClass } = computeTone(strategyMode, regimeScore);

  return {
    ...data,
    toneLabel,
    toneClass
  };
}

// toneClass viene usata come classe CSS sulla pill del regime
// toneLabel è il testo tipo "positive" / "neutral" / "alert"
function computeTone(strategyMode, regimeScore) {
  let toneLabel = "neutral";
  let toneClass = "regime-stance-pill--neutral";

  const modeLow = (strategyMode || "").toLowerCase();
  const scoreNum = isNum(regimeScore) ? Number(regimeScore) : null;

  // logica base (puoi raffinarla lato modello se vuoi avere "positive"/"caution"/"alert")
  if (modeLow.includes("momentum") && !modeLow.includes("light")) {
    toneLabel = "positive";
    toneClass = "regime-stance-pill--pos";
  } else if (modeLow.includes("momentum-light")) {
    toneLabel = "caution";
    toneClass = "regime-stance-pill--warn";
  } else if (modeLow.includes("pullback")) {
    toneLabel = "alert";
    toneClass = "regime-stance-pill--neg";
  } else {
    if (scoreNum !== null && scoreNum < 0.1) {
      toneLabel = "alert";
      toneClass = "regime-stance-pill--neg";
    }
  }

  return { toneLabel, toneClass };
}


// -------------------------------------------------
// Utils numeriche + escape HTML
// -------------------------------------------------

function fmtNum(v) {
  if (!isNum(v)) return "—";
  const n = Number(v);
  return n.toFixed(2).replace('.', ',');
}

function fmtPct(v) {
  if (!isNum(v)) return "—";
  const n = Number(v) * 100;
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(1).replace('.', ',') + "%";
}

function isNum(v) {
  return v !== null && v !== undefined && !Number.isNaN(Number(v));
}

function valueOrNull(v) {
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
function escapeAttr(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
