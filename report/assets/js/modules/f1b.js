// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio
//
// Versione aggiornata 24 Ott 2025 per runtime istituzionale Tradelia.
// Usa window.__TradeliaUI.openPanel() invece di drawer legacy.
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

  // bottone "Dettagli regime"
  const btnDetails = root.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener("click", () => {
      openF1BPanel(data);
    });
  }

  // Tooltip "?" nei KPI:
  // Qui non attacchiamo noi gli handler, perché lo fa ui-runtime.js
  // tramite window.__TradeliaUI.bindMetricInfoButtons() richiamata da app.js
}

// -------------------------------------------------------------
// Apre il pannello laterale / bottom sheet istituzionale
// -------------------------------------------------------------

function openF1BPanel(data) {
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
    console.warn("openPanel non disponibile");
    return;
  }

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

  const secNotes = {
    title: "Note interpretative",
    body: renderInterpretation(interpretationNotes),
    meta: `
      Lettura qualitativa di contesto.
      Non è una raccomandazione operativa.
    `
  };

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
// KPI box con tooltip "?" (compat con ui-runtime bindMetricInfoButtons)
// -------------------------------------------------------------

function metricBox({ label, value, metricKey }) {
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
// blocchi usati nel pannello
// -------------------------------------------------------------

function renderTopSectors(topSectors) {
  if (!Array.isArray(topSectors) || !topSectors.length) {
    return `
      <div class="text-[12px] text-[color:var(--muted)] leading-[1.4]">
        Dati settoriali non disponibili.
      </div>
    `;
  }

  return `
    <ul class="list-disc pl-4 space-y-1">
      ${topSectors.map(sec => {
        const name   = sec.name || sec.sector || "—";
        const inflow = sec.inflow5d !== undefined ? `${fmtNum(sec.inflow5d)} flow 5d` : "";
        const perf   = sec.perf1m  !== undefined ? `${fmtPct(sec.perf1m)} 1m` : "";
        return `
          <li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
            <span class="font-semibold">${escapeHtml(name)}</span>
            <span class="text-[color:var(--muted)]"> ${escapeHtml(inflow)} ${escapeHtml(perf)}</span>
          </li>
        `;
      }).join("")}
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

  return `
    <ul class="list-disc pl-4 space-y-1">
      ${arr.map(n => `
        <li class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
          ${escapeHtml(n)}
        </li>
      `).join("")}
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
        Questo materiale descrive un contesto di mercato basato su dati quantitativi
        e fonti finanziarie primarie. Ha finalità informative e formative.
      </p>
      <p>
        Non costituisce una raccomandazione personalizzata, né un invito ad
        eseguire operazioni o a allocare capitale. Prima di qualsiasi decisione
        reale verifica adeguatezza e appropriatezza con un intermediario autorizzato
        ai sensi MiFID II e della normativa locale.
      </p>
    </div>
  `;
}

// -------------------------------------------------------------
// Normalizzazione dati e tono
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

// -------------------------------------------------------------
// Utils numeriche e escape HTML
// -------------------------------------------------------------

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
