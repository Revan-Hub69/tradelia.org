// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio
//
// - Card breve con StrategyMode + KPI chiave
// - Drawer con sezioni modulari (Regime attuale / Rotazione / Note / Audit / MiFID)
// - Tooltip ? sia nella card sia nel drawer
//
// Compliance:
// - descrittivo/formativo, nessuna raccomandazione operativa
// - NON parla di F2
//
// Dipendenze globali che già esistono:
// - window.openDrawer (definita in bootstrap-inline.js)
// - popover / metric-sheet-overlay presenti in index
//
// Export richiesti dal runtime:
// - renderCard(data, ctx)
// - bindCard(node, data, ctx)

export function renderCard(rawData, ctx = {}) {
  const data = normalizeData(rawData);

  const {
    strategyMode,
    regimeScore,
    breadthPct,
    riskTilt,
  } = data;

  const { toneLabel, toneColor } = computeTone(strategyMode, regimeScore);

  return `
    <div class="text-[13px] leading-[1.5] text-[color:var(--ink)]"
         style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- Header regime -->
      <div>
        <div class="text-[12px] font-semibold text-[color:var(--muted)] leading-[1.4]">
          Regime di mercato
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
      <div class="flex flex-wrap gap-3 mt-4">
        ${metricBox({
          label: "RegimeScore",
          value: fmtNum(regimeScore),
          metricKey: "RegimeScore",
        })}

        ${metricBox({
          label: "Breadth",
          value: breadthPct !== null ? fmtPct(breadthPct) : "—",
          metricKey: "Breadth",
        })}

        ${metricBox({
          label: "RiskTilt",
          value: fmtNum(riskTilt),
          metricKey: "RiskTilt",
        })}
      </div>

      <!-- CTA -->
      <div class="flex flex-wrap gap-2 mt-4">
        <button
          class="btn btn-sm"
          data-open-f1b-details="true"
          type="button"
        >
          Dettagli regime
        </button>
      </div>

    </div>
  `;
}

export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;

  const data = normalizeData(rawData);

  // tooltip ? nella card
  attachTooltipHandlers(node);

  // drawer open
  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener('click', () => {
      if (typeof window.openDrawer === 'function') {
        const drawerHtml = renderDrawerHTML(data);

        window.openDrawer({
          title: 'F1 · Regime di mercato',
          subtitle: 'Flussi settoriali, ampiezza del rialzo e volatilità (T-1)',
          html: drawerHtml,
          blocking: false,
          showAccept: false
        });

        // dopo l'apertura, il drawer è nel DOM.
        // aspettiamo il prossimo tick per selezionarlo e agganciarci i tooltip
        setTimeout(() => {
          const drawerContent = document.getElementById('drawer-content');
          if (drawerContent) {
            attachTooltipHandlers(drawerContent);
          }
        }, 0);
      }
    });
  }
}

/* -------------------------------------------------
   Drawer HTML con sezioni modulari
------------------------------------------------- */

function renderDrawerHTML(data) {
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
    feedSyncScore,
  } = data;

  const sectorsHtml = renderTopSectors(topSectors);
  const interpHtml  = renderInterpretation(interpretationNotes);
  const auditHtml   = renderAuditBlock({
    auditPathID,
    sourcesTier1,
    dataLagLabel,
    confidenceFinal,
    dataIntegrity,
    feedSyncScore
  });
  const mifidHtml   = renderMiFIDNotice();

  return `
    <div class="text-[13px] leading-[1.5] text-[color:var(--ink)] space-y-6"
         style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      <!-- 1. Regime attuale -->
      <section class="space-y-2">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Regime attuale
        </div>

        <div class="text-[13px] text-[color:var(--ink)] leading-[1.45] font-semibold flex flex-wrap items-center gap-2">
          <span>StrategyMode: ${escapeHtml(strategyMode || "—")}</span>
          <button
            class="info-btn info-btn--mini"
            data-tooltip="StrategyMode"
            aria-label="Info StrategyMode"
          >?</button>
        </div>

        <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
          <div class="p-2"
               style="
                 background:var(--surface-card-alt);
                 border:1px solid var(--br-card);
                 border-radius:var(--radius-card);
                 box-shadow:var(--shadow-card);
               ">
            <div class="flex items-start justify-between gap-1 mb-1">
              <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3]">
                RegimeScore
              </div>
              <button
                class="info-btn info-btn--mini"
                data-tooltip="RegimeScore"
                aria-label="Info RegimeScore"
              >?</button>
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
            <div class="flex items-start justify-between gap-1 mb-1">
              <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3]">
                VIX
              </div>
              <button
                class="info-btn info-btn--mini"
                data-tooltip="VIX"
                aria-label="Info VIX"
              >?</button>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${fmtNum(vixLevel)}
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Rotazione & partecipazione -->
      <section class="space-y-2">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Rotazione &amp; partecipazione
        </div>

        <div class="grid grid-cols-2 gap-3 text-[12px] leading-[1.4]">
          <div class="p-2"
               style="
                 background:var(--surface-card-alt);
                 border:1px solid var(--br-card);
                 border-radius:var(--radius-card);
                 box-shadow:var(--shadow-card);
               ">
            <div class="flex items-start justify-between gap-1 mb-1">
              <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3]">
                Breadth (1M)
              </div>
              <button
                class="info-btn info-btn--mini"
                data-tooltip="Breadth"
                aria-label="Info Breadth"
              >?</button>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${breadthPct !== null ? fmtPct(breadthPct) : "—"}
            </div>
          </div>

          <div class="p-2"
               style="
                 background:var(--surface-card-alt);
                 border:1px solid var(--br-card);
                 border-radius:var(--radius-card);
                 box-shadow:var(--shadow-card);
               ">
            <div class="flex items-start justify-between gap-1 mb-1">
              <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3]">
                RiskTilt
              </div>
              <button
                class="info-btn info-btn--mini"
                data-tooltip="RiskTilt"
                aria-label="Info RiskTilt"
              >?</button>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${fmtNum(riskTilt)}
            </div>
          </div>
        </div>

        <div class="text-[12.5px] leading-[1.45] text-[color:var(--ink)]">
          <div class="text-[11px] font-semibold text-[color:var(--muted)] leading-[1.3] mb-1 uppercase tracking-wide">
            Top settori per inflow (5d)
          </div>
          ${sectorsHtml}
        </div>
      </section>

      <!-- 3. Note interpretative -->
      <section class="space-y-2">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Note interpretative
        </div>
        ${interpHtml}
      </section>

      <!-- 4. Audit & Fonti -->
      <section class="space-y-2">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Audit &amp; Fonti
        </div>
        ${auditHtml}
      </section>

      <!-- 5. Nota regolamentare -->
      <section class="space-y-2">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Nota regolamentare
        </div>
        ${mifidHtml}
      </section>

    </div>
  `;
}

/* -------------------------------------------------
   Tooltip system per i bottoni data-tooltip (F1B)
   - Desktop → popover
   - Mobile  → bottom sheet
------------------------------------------------- */

function getTooltipContent(metricKey) {
  const map = {
    "StrategyMode": {
      title: "StrategyMode",
      text: [
        "Classificazione del regime corrente di mercato basata su flussi settoriali, ampiezza del rialzo e volatilità implicita.",
        "≥ +0.35 → Momentum · +0.10–+0.35 → Momentum-light · < +0.10 → Pullback.",
        "Valori calcolati su dati T-1."
      ].join(" "),
      source: "Fonti: ETFdb (flussi settoriali), CBOE (volatilità), Reuters."
    },
    "RegimeScore": {
      title: "RegimeScore",
      text: [
        "Indice sintetico di 'risk-on vs risk-off'.",
        "Formula: 0.8·FlowScore + 0.2·s(-VIX).",
        "FlowScore riflette afflussi nei settori ciclici/growth rispetto ai difensivi.",
        "Valori più alti = mercato orientato al rischio."
      ].join(" "),
      source: "Fonti: ETFdb (flussi), CBOE (VIX), Reuters."
    },
    "Breadth": {
      title: "Breadth",
      text: [
        "Percentuale dei principali settori azionari che sono positivi negli ultimi 30 giorni.",
        "Breadth alta ⇒ rialzo ampio e partecipato.",
        "Breadth bassa ⇒ rialzo concentrato in poche aree."
      ].join(" "),
      source: "Fonti: SPDR sector ETFs (performance 1M)."
    },
    "RiskTilt": {
      title: "RiskTilt",
      text: [
        "Differenza fra la forza media dei settori ciclici/growth",
        "(Tech, Discretionary, Industrials, Communications)",
        "e la forza dei settori difensivi (Staples, Utilities, Healthcare).",
        "Valori > 0 ⇒ appetito per rischio.",
        "Valori < 0 ⇒ rotazione difensiva."
      ].join(" "),
      source: "Fonti: ETFdb, Reuters (settori SPDR)."
    },
    "VIX": {
      title: "VIX",
      text: [
        "Volatilità implicita sull'S&P500 (~30 giorni).",
        "Valori alti ⇒ mercato prezza stress / rischio evento.",
        "Valori bassi ⇒ mercato prezza stabilità."
      ].join(" "),
      source: "Fonte: CBOE."
    }
  };

  return map[metricKey] || {
    title: metricKey,
    text: "—",
    source: ""
  };
}

function attachTooltipHandlers(rootEl) {
  const btns = rootEl.querySelectorAll('[data-tooltip]');
  btns.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const metricKey = btn.getAttribute('data-tooltip');
      const tip = getTooltipContent(metricKey);
      openMetricTooltip(ev.currentTarget, tip);
    });
  });
}

function openMetricTooltip(targetEl, tip) {
  const isMobile = window.matchMedia("(max-width: 640px)").matches;

  if (isMobile) {
    // bottom sheet mobile
    const overlay = document.getElementById('metric-sheet-overlay');
    const body    = document.getElementById('metric-sheet-body');
    const titleEl = document.getElementById('metric-sheet-title');
    const srcEl   = document.getElementById('metric-sheet-source');

    if (overlay && body && titleEl && srcEl) {
      titleEl.textContent = tip.title || "—";
      body.textContent    = tip.text  || "—";
      srcEl.textContent   = tip.source || "";
      overlay.setAttribute('aria-hidden','false');
    }
  } else {
    // popover desktop
    const pop = document.getElementById('popover');
    const popTitle  = document.getElementById('popover-title');
    const popText   = document.getElementById('popover-text');
    const popSource = document.getElementById('popover-source');

    if (pop && popTitle && popText && popSource) {
      popTitle.textContent  = tip.title || "—";
      popText.textContent   = tip.text  || "—";
      popSource.textContent = tip.source || "";

      const rect = targetEl.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;

      const top  = rect.top  + scrollY + rect.height + 8;
      const left = rect.left + scrollX;

      pop.style.position = 'absolute';
      pop.style.top  = `${top}px`;
      pop.style.left = `${left}px`;

      pop.setAttribute('aria-hidden','false');
    }
  }
}

/* -------------------------------------------------
   Helpers UI
------------------------------------------------- */

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
          data-tooltip="${escapeAttr(metricKey)}"
          aria-label="Info ${escapeAttr(metricKey)}"
        >?</button>
      </div>

      <div class="font-mono font-bold text-[color:var(--ink)] text-[13px] leading-[1.4]">
        ${escapeHtml(value)}
      </div>
    </div>
  `;
}

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
