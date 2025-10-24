// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio
//
// Versione aggiornata 24 Ott 2025 per runtime istituzionale Tradelia.
// Questa versione parla con ui-runtime.js (window.__TradeliaUI)
// invece di usare openDrawer legacy.
//
// Esporta:
//   renderCard(data, ctx)
//   bindCard(root, data, ctx)

export function renderCard(rawData, ctx = {}) {
  const data = normalizeData(rawData);

  const {
    strategyMode,
    regimeScore,
    breadthPct,
    riskTilt
  } = data;

  const { toneLabel, toneColor } = computeTone(strategyMode, regimeScore);

  return `
    <section class="section-headline">
      <div class="section-head-left">
        <div class="section-head-topline">
          <span class="section-badge">F1</span>
          <span class="module-status-pill" data-state="ok">ACTIVE</span>
        </div>

        <div class="section-title-main">
          Regime di mercato
        </div>

        <div class="section-desc">
          Contesto rischio / appetito rischio (T-1). Valori descrittivi, finalità formative.
          Non è una raccomandazione operativa.
        </div>
      </div>

      <div class="section-head-right">
        <button
          class="btn btn-sm"
          data-open-f1b-details="true"
          type="button"
        >
          Dettagli regime
        </button>
      </div>
    </section>

    <div class="card-compact mt-4 text-[13px] leading-[1.5] text-[color:var(--ink)]">

      <!-- Riga stato regime -->
      <div class="mb-4">
        <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4]">
          Stato corrente
        </div>

        <div class="text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] flex flex-wrap items-center gap-2 mt-1">
          <span>StrategyMode: ${escapeHtml(strategyMode || "—")}</span>
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
          value: fmtNum(regimeScore),
          metricKey: "RegimeScore"
        })}

        ${metricBox({
          label: "Breadth (1M)",
          value: isNum(breadthPct) ? fmtPct(breadthPct) : "—",
          metricKey: "Breadth"
        })}

        ${metricBox({
          label: "RiskTilt",
          value: fmtNum(riskTilt),
          metricKey: "RiskTilt"
        })}
      </div>

      <div class="text-[11px] text-[color:var(--muted)] leading-[1.4] mt-4">
        Fonte: flussi settoriali, ampiezza del rialzo, volatilità implicita (T-1).
        Dati puramente informativi/formativi.
      </div>
    </div>
  `;
}

export function bindCard(root, rawData, ctx = {}) {
  if (!root || !rawData) return;
  const data = normalizeData(rawData);

  // 1. Aggancia "Dettagli regime"
  const btnDetails = root.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener("click", () => {
      openF1BPanel(data, ctx);
    });
  }

  // 2. I tooltip "?" dentro la card
  //    NOTA: i box KPI generano <button class="info-btn" data-metric="...">?</button>
  //    Il runtime globale (ui-runtime.js) deve ri-bindare questi bottoni
  //    dopo il mount del modulo. app.js lo chiamerà.
}

// -------------------------------------------------------------
// openF1BPanel(data, ctx)
// Apre il pannello laterale / bottom sheet istituzionale
// usando window.__TradeliaUI.openPanel().
// -------------------------------------------------------------

function openF1BPanel(data, ctx) {
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
    console.warn("openPanel non disponibile");
    return;
  }

  // sezioni principali del pannello (sono quelle del vecchio drawer)
  const panelSections = buildPanelSections(data);

  window.__TradeliaUI.openPanel({
    title: "F1 · Regime di mercato",
    subtitle: "Flussi settoriali, ampiezza del rialzo e volatilità (T-1)",
    sections: panelSections,
    footerButtons: [
      {
        label: "Chiudi",
        action: () => {
          if (window.__TradeliaUI && typeof window.__TradeliaUI.closePanel === "function") {
            window.__TradeliaUI.closePanel();
          }
        }
      }
    ],
    blocking: false
  });
}

// Costruisce le sezioni per openPanel()
function buildPanelSections(data) {
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

  // -- Sezione 1: Regime attuale
  const secRegime = {
    title: "Regime attuale",
    body: `
      <div class="text-[13px] leading-[1.45] text-[color:var(--ink)] space-y-3">
        <div>
          <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] uppercase tracking-wide mb-1">
            StrategyMode
          </div>
          <div class="text-[13px] font-semibold text-[color:var(--ink)] leading-[1.4]">
            ${escapeHtml(strategyMode || "—")}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
          <div class="p-2"
               style="
                 background:var(--surface-card-alt);
                 border:1px solid var(--br-card);
                 border-radius:var(--radius-card);
                 box-shadow:var(--shadow-card);
               ">
            <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] flex items-start justify-between gap-1 mb-1">
              <span>RegimeScore</span>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${fmtNum(regimeScore)}
            </div>
          </div>

          <div class="p-2"
               style="
                 background:var(--surface-card-alt);
                 border:1px solid var(--br-card);
                 border-radius:var(--radius-card);
                 box-shadow:var(--shadow-card);
               ">
            <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] flex items-start justify-between gap-1 mb-1">
              <span>VIX</span>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${fmtNum(vixLevel)}
            </div>
          </div>
        </div>
      </div>
    `,
    meta: `
      StrategyMode indica l'impostazione di rischio prevalente del mercato.
      RegimeScore e VIX sono calcolati/registrati su base T-1.
    `
  };

  // -- Sezione 2: Rotazione & partecipazione
  const secRotation = {
    title: "Rotazione & partecipazione",
    body: `
      <div class="text-[13px] leading-[1.45] text-[color:var(--ink)] space-y-4">
        <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
          <div class="p-2"
               style="
                 background:var(--surface-card-alt);
                 border:1px solid var(--br-card);
                 border-radius:var(--radius-card);
                 box-shadow:var(--shadow-card);
               ">
            <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] flex items-start justify-between gap-1 mb-1">
              <span>Breadth (1M)</span>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${isNum(breadthPct) ? fmtPct(breadthPct) : "—"}
            </div>
          </div>

          <div class="p-2"
               style="
                 background:var(--surface-card-alt);
                 border:1px solid var(--br-card);
                 border-radius:var(--radius-card);
                 box-shadow:var(--shadow-card);
               ">
            <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] flex items-start justify-between gap-1 mb-1">
              <span>RiskTilt</span>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${fmtNum(riskTilt)}
            </div>
          </div>
        </div>

        <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
          <div class="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide leading-[1.3] mb-1">
            Top settori per inflow (5d)
          </div>
          ${renderTopSectors(topSectors)}
        </div>
      </div>
    `,
    meta: `
      Breadth = ampiezza del rialzo settoriale.
      RiskTilt >0 implica rotazione verso rischio/ciclici.
    `
  };

  // -- Sezione 3: Note interpretative
  const secNotes = {
    title: "Note interpretative",
    body: renderInterpretation(interpretationNotes),
    meta: `
      Lettura qualitativa di contesto.
      Non è una raccomandazione operativa.
    `
  };

  // -- Sezione 4: Audit & Fonti
  const secAudit = {
    title: "Audit & Fonti",
    body: renderAuditBlock({
      auditPathID,
      sourcesTier1,
      dataLagLabel,
      confidenceFinal,
      dataIntegrity,
      feedSyncScore
    }),
    meta: `
      Dati raccolti e consolidati su base T-1.
      Controllo interno di coerenza, integrità e ritardo feed.
    `
  };

  // -- Sezione 5: Nota regolamentare
  const secMiFID = {
    title: "Nota regolamentare",
    body: renderMiFIDNotice(),
    meta: `
      Tradelia AI non fornisce consulenza personalizzata.
      Verifica sempre adeguatezza/appropriatezza con un intermediario autorizzato
      prima di qualsiasi decisione reale.
    `
  };

  return [secRegime, secRotation, secNotes, secAudit, secMiFID];
}

// -------------------------------------------------------------
// metricBox() aggiornato per usare data-metric="..." (compat ui-runtime)
// -------------------------------------------------------------
function metricBox({ label, value, metricKey }) {
  // Nel runtime nuovo, i tooltip metriche usano:
  //   class="info-btn"
  //   data-metric="RegimeScore" (ecc.)
  // e poi ui-runtime.js (bindMetricInfoButtons) si occupa di gestirli.
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
          type="button"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[color:var(--ink)] text-[13px] leading-[1.4]">
        ${escapeHtml(value)}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// Helpers (normalizzazione, tono, numerica, escape)
// -------------------------------------------------------------

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

  const sourcesTier1 = d.sourcesTier1 ||
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

function escapeAttr(str){
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
