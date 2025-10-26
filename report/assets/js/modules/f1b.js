// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio
//
// Versione finale con:
// - card F1 in pagina
// - drawer laterale stile legacy (sidebar desktop / bottom tabbar mobile)
//   ma aperto tramite ui-runtime.openPanelLegacySidebar()
// - token premium (var(--ink), var(--surface-card), ecc.)
// - tooltip "?" integrati
//
// Export:
//   renderCard(data, ctx)
//   bindCard(node, data, ctx)

export function renderCard(rawData, ctx = {}) {
  const norm = normalizeData(rawData);
  const view = decorateForView(norm);

  return `
    <section class="text-[13px] leading-[1.5] text-[color:var(--ink)] font-sans">

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

      <!-- Card principale -->
      <div class="relative flex flex-col gap-4
                  bg-[color:var(--surface-card)]
                  border border-[color:var(--br-card)]
                  rounded-[var(--radius-card)]
                  shadow-[var(--shadow-card)]
                  p-4 pb-14 sm:pb-16">

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
              ${escapeHtml(view.strategyMode || "—")}
            </span>

            <span class="regime-stance-pill ${view.toneClass}" role="status">
              ${escapeHtml(view.toneLabel)}
            </span>
          </div>
        </div>

        <!-- KPI row -->
        <div class="flex flex-wrap gap-3">
          ${metricBox({
            label: "RegimeScore",
            metricKey: "RegimeScore",
            value: fmtNum(norm.regimeScore),
            desc: "Propensione al rischio sintetica",
            flagStatus: norm.regimeScoreFlag
          })}

          ${metricBox({
            label: "Breadth (1M)",
            metricKey: "Breadth",
            value: norm.breadthPct !== null ? fmtPct(norm.breadthPct) : "—",
            desc: "% settori positivi su 30g",
            flagStatus: norm.breadthFlag
          })}

          ${metricBox({
            label: "RiskTilt",
            metricKey: "RiskTilt",
            value: fmtNum(norm.riskTilt),
            desc: "Ciclici vs Difensivi",
            flagStatus: norm.riskTiltFlag
          })}
        </div>

        <!-- CTA -->
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

      <div class="text-[11px] leading-[1.45] text-[color:var(--muted)] mt-3">
        Indicatori costruiti su flussi settoriali, ampiezza del rialzo e volatilità implicita.
        Nessuna raccomandazione operativa.
      </div>
    </section>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const norm = normalizeData(rawData);
  const view = decorateForView(norm);

  const btn = node.querySelector('[data-open-f1b-details="true"]');
  if (btn) {
    btn.addEventListener("click", () => {
      openF1Drawer(norm, view);
    });
  }

  // bind tooltip "?" dentro la card
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    window.__TradeliaUI.bindMetricInfoButtons(node);
  }
}

// ---------------------------------------------------------
// Drawer stile legacy sidebar/bottom-tabbar
// ---------------------------------------------------------

function openF1Drawer(norm, view){
  if (
    !window.__TradeliaUI ||
    typeof window.__TradeliaUI.openPanelLegacySidebar !== "function"
  ) {
    console.warn("openPanelLegacySidebar non disponibile");
    return;
  }

  // costruiamo HTML desktop e mobile
  const desktopHTML = renderDrawerDesktopShell(norm, view);
  const mobileHTML  = renderDrawerMobileShell(norm, view);

  window.__TradeliaUI.openPanelLegacySidebar({
    title: "F1 · Regime di mercato",
    subtitle: "Flussi settoriali, ampiezza del rialzo e volatilità (T-1)",
    desktopHTML,
    mobileHTML,
    footerButtons: [
      {
        label:"Chiudi",
        action: () => window.__TradeliaUI.closePanel()
      }
    ],
    blocking:false,
    wide:true
  });
}

// Desktop shell: sidebar sinistra + content destra
function renderDrawerDesktopShell(norm, view){
  return `
    <div class="f1b-panel-desktop flex flex-row gap-4 min-h-[300px]">

      <aside class="f1b-panel-menu min-w-[160px] max-w-[180px] border-r border-[color:var(--br-card)] pr-2">
        ${drawerMenuButton("regime","Regime attuale", true)}
        ${drawerMenuButton("rotation","Rotazione &amp; partecipazione", false)}
        ${drawerMenuButton("notes","Note interpretative", false)}
        ${drawerMenuButton("audit","Audit &amp; Fonti", false)}
        ${drawerMenuButton("mifid","Nota regolamentare", false)}
      </aside>

      <main class="f1b-panel-content flex-1 min-w-0 max-h-[60vh] overflow-auto space-y-4">
        <div data-f1b-view="regime">
          ${sectionRegimeBlock(norm, view)}
        </div>
        <div data-f1b-view="rotation" hidden>
          ${sectionRotationBlock(norm, view)}
        </div>
        <div data-f1b-view="notes" hidden>
          ${sectionNotesBlock(view)}
        </div>
        <div data-f1b-view="audit" hidden>
          ${sectionAuditBlock(norm)}
        </div>
        <div data-f1b-view="mifid" hidden>
          ${sectionMiFIDBlock()}
        </div>
      </main>
    </div>
  `;
}

// Mobile shell: contenuto + bottom tabbar
function renderDrawerMobileShell(norm, view){
  return `
    <div class="f1b-panel-mobile relative pb-14 min-h-[300px]">

      <main class="f1b-panel-content-mobile max-h-[60vh] overflow-auto space-y-4">
        <div data-f1b-view="regime">
          ${sectionRegimeBlock(norm, view)}
        </div>
        <div data-f1b-view="rotation" hidden>
          ${sectionRotationBlock(norm, view)}
        </div>
        <div data-f1b-view="notes" hidden>
          ${sectionNotesBlock(view)}
        </div>
        <div data-f1b-view="audit" hidden>
          ${sectionAuditBlock(norm)}
        </div>
        <div data-f1b-view="mifid" hidden>
          ${sectionMiFIDBlock()}
        </div>
      </main>

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

// Bottoni nav desktop
function drawerMenuButton(key, label, active){
  return `
    <button
      class="f1b-tab-btn block w-full text-left text-[12px] leading-[1.4] px-2 py-2
             rounded-[var(--radius-card-sm)]
             border-l-[3px] border-l-transparent
             ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
      type="button"
    >
      ${label}
    </button>
  `;
}

// Bottoni nav mobile
function drawerMobileTabButton(key, label, active){
  return `
    <button
      class="f1b-tab-btn-mobile flex-1 text-center
             rounded-[var(--radius-card-sm)]
             px-1 py-[0.4rem]
             ${active ? "is-active" : ""}"
      data-f1b-tab="${key}"
      type="button"
    >
      ${label}
    </button>
  `;
}

// ---------------------------------------------------------
// Section blocks (contenuto per ogni tab)
// Usa i token premium (var(--surface-card-alt) ecc.)
// ---------------------------------------------------------

function sectionRegimeBlock(norm, view){
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
        <span>StrategyMode: ${escapeHtml(view.strategyMode || "—")}</span>
        <button
          class="info-btn info-btn--mini"
          data-metric="StrategyMode"
          aria-label="Info StrategyMode"
        >?</button>

        <span class="regime-stance-pill ${view.toneClass}">
          ${escapeHtml(view.toneLabel)}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        ${smallMetricBlock({
          title: "RegimeScore",
          metricKey: "RegimeScore",
          value: fmtNum(norm.regimeScore),
          flagStatus: norm.regimeScoreFlag
        })}

        ${smallMetricBlock({
          title: "VIX",
          metricKey: "VIX",
          value: fmtNum(norm.vixLevel),
          flagStatus: norm.vixFlag
        })}
      </div>

      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">
        Numeri calcolati combinando volatilità implicita, ampiezza del rialzo e
        posizione dei flussi rispetto alla difensiva.
      </div>
    </section>
  `;
}

function sectionRotationBlock(norm, view){
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
          value: norm.breadthPct !== null ? fmtPct(norm.breadthPct) : "—",
          flagStatus: norm.breadthFlag
        })}

        ${smallMetricBlock({
          title: "RiskTilt",
          metricKey: "RiskTilt",
          value: fmtNum(norm.riskTilt),
          flagStatus: norm.riskTiltFlag
        })}
      </div>

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          Top settori per inflow (5d)
        </div>
        ${renderTopSectors(view.topSectors)}
      </div>

      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">
        Breadth &gt;50% = rialzo distribuito. RiskTilt alto = preferenza ciclica
        rispetto a difensivi.
      </div>
    </section>
  `;
}

function sectionNotesBlock(view){
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

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
        ${renderInterpretation(view.interpretationNotes)}
      </div>
    </section>
  `;
}

function sectionAuditBlock(norm){
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

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)] space-y-3">
        ${renderAudit(norm)}
      </div>
    </section>
  `;
}

function sectionMiFIDBlock(){
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

      <div class="text-[12.5px] leading-[1.45] text-[color:var(--muted)] space-y-2">
        <p>
          Questo materiale descrive uno scenario di mercato basato su dati quantitativi
          e fonti finanziarie primarie. Ha finalità esclusivamente informative e formative.
        </p>
        <p>
          Non costituisce raccomandazione personalizzata né invito ad aprire/chiudere
          posizioni o allocare capitale. Prima di qualsiasi decisione reale verifica
          adeguatezza e appropriatezza con un intermediario autorizzato
          (MiFID II / ESMA).
        </p>
      </div>
    </section>
  `;
}

// ---------------------------------------------------------
// Frammenti comuni (metriche piccole, flag, liste, audit…)
// ---------------------------------------------------------

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

// icone ✓ / ! / ✕
function flagIcon(flagStatus){
  if (!flagStatus || flagStatus === "neutral") return "";

  if (flagStatus === "pos") {
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

function renderTopSectors(topSectors){
  if (!Array.isArray(topSectors) || !topSectors.length) {
    return `
      <div class="text-[12px] text-[color:var(--muted)] leading-[1.4]">
        Dati settoriali non disponibili.
      </div>`;
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
      </li>`;
  }).join("");

  return `<ul class="list-disc pl-4 space-y-1">${items}</ul>`;
}

function renderInterpretation(notesArr){
  const arr = Array.isArray(notesArr) ? notesArr : [];
  if (!arr.length) {
    return `
      <div class="text-[12.5px] leading-[1.4] text-[color:var(--muted)]">
        Nessuna nota aggiuntiva.
      </div>`;
  }
  const lis = arr.map(n => `
    <li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
      ${escapeHtml(n)}
    </li>`).join("");

  return `<ul class="list-disc pl-4 space-y-1">${lis}</ul>`;
}

function renderAudit(norm){
  const srcList = Array.isArray(norm.sourcesTier1)
    ? norm.sourcesTier1.join(", ")
    : (norm.sourcesTier1 || "—");

  return `
    <div class="space-y-3 text-[12.5px] leading-[1.45] text-[color:var(--ink)]">

      <div>
        <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
          AuditPathID
        </div>
        <div class="font-mono text-[13px] font-bold text-[color:var(--ink)]">
          ${escapeHtml(norm.auditPathID || "—")}
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
            ${escapeHtml(norm.dataLagLabel || "T-1")}
          </div>
        </div>
        <div>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
            Confidence
          </div>
          <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
            ${fmtNum(norm.confidenceFinal)}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
        <div>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
            Integrità dataset
          </div>
          <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
            ${fmtNum(norm.dataIntegrity)}
          </div>
        </div>
        <div>
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
            Sync feed
          </div>
          <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
            ${fmtNum(norm.feedSyncScore)}
          </div>
        </div>
      </div>

      <div class="text-[11px] leading-[1.4] text-[color:var(--muted)]">
        Questo pannello è informativo/formativo.
        Non sostituisce la due diligence dell'investitore
        né costituisce attestazione regolamentare.
      </div>
    </div>
  `;
}

// ---------------------------------------------------------
// Data normalization + tone decoration (come prima)
// ---------------------------------------------------------

function normalizeData(d){
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

  const sourcesTier1 =
    d.sourcesTier1 ??
    d.sources ??
    ["FRED","CBOE","ETFdb","Reuters"];

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

function decorateForView(norm){
  const {strategyMode, regimeScore} = norm;
  const {toneLabel, toneClass} = computeTone(strategyMode, regimeScore);
  return {...norm, toneLabel, toneClass};
}

function computeTone(strategyMode, regimeScore){
  let toneLabel = "neutral";
  let toneClass = "regime-stance-pill--neutral";

  const modeLow = (strategyMode || "").toLowerCase();
  const scoreNum = isNum(regimeScore) ? Number(regimeScore) : null;

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

// ---------------------------------------------------------
// Utils numeriche / escape
// ---------------------------------------------------------
function fmtNum(v){
  if (!isNum(v)) return "—";
  const n = Number(v);
  return n.toFixed(2).replace('.', ',');
}
function fmtPct(v){
  if (!isNum(v)) return "—";
  const n = Number(v)*100;
  const sign = n > 0 ? "+" : "";
  return sign + n.toFixed(1).replace('.', ',') + "%";
}
function isNum(v){
  return v !== null && v !== undefined && !Number.isNaN(Number(v));
}
function valueOrNull(v){
  return isNum(v) ? Number(v) : null;
}
function escapeHtml(str){
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
