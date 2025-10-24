// /report/assets/js/modules/f1b.js
//
// F1B · Regime di mercato / Contesto rischio
//
// Questa versione è "institutional-ready":
// - Card con KPI regime e CTA primaria "Dettagli regime" in basso a destra
// - Drawer (panel) con TOC interno e sezioni distinte
// - Tooltip unificati su data-metric="..." (niente più sistema tooltip locale)
// - Testo MiFID/educational integrato
//
// Dipendenze globali richieste:
// - window.__TradeliaUI.openPanel(opts)
// - window.__TradeliaUI.closePanel()
//   (fornite da ui-runtime.js)
// - ui-runtime.js deve già avere il binding globale dei tooltip .info-btn[data-metric]
//
// Runtime richiesto dal core (app.js):
// - renderCard(data, ctx)
// - bindCard(node, data, ctx)
//
// NOTE IMPORTANTI
// ----------------
// 1. Tutte le metriche con "?" usano data-metric="<Key>"
//    Key deve essere presente nel glossary globale ui-runtime.js, e poi nel futuro glossary.json.
// 2. Il drawer qui non crea un overlay separato: riusa lo stesso panel overlay
//    già usato per Privacy/MiFID, ma con contenuto dinamico e TOC interno.
// 3. Lo scroll lock e i tooltip dentro il panel saranno gestiti da ui-runtime.js
//    quando aggiorniamo quel file (prossimo step).

export function renderCard(rawData, ctx = {}) {
  const data = normalizeData(rawData);

  const {
    strategyMode,
    regimeScore,
    breadthPct,
    riskTilt
  } = data;

  const { toneLabel, toneColor } = computeTone(strategyMode, regimeScore);

  // Card F1B:
  // - header titolo "Regime di mercato"
  // - StrategyMode + pill tono
  // - KPI row
  // - CTA primaria in basso a destra
  //
  // Nota: classi tipo f1b-card-container / f1b-cta-btn sono utili per styling dedicato via CSS.

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
          padding:1rem 1rem 3.25rem 1rem; /* extra bottom space per CTA */
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

        <!-- CTA primaria fissata in basso a destra -->
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

  // 1. Bind CTA "Dettagli regime"
  const btnDetails = node.querySelector('[data-open-f1b-details="true"]');
  if (btnDetails) {
    btnDetails.addEventListener("click", () => {
      openF1Drawer(data);
    });
  }

  // 2. I tooltip "?" nella card usano data-metric="..."
  // ui-runtime.js già fa il bind globale su document, ma per sicurezza
  // possiamo richiamare un eventuale hook globale se esiste:
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch(e){
      /* no-op fallback */
    }
  }
}

/* -------------------------------------------------
   Drawer / Panel con TOC
------------------------------------------------- */

function openF1Drawer(data) {
  if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
    console.warn("openPanel non disponibile");
    return;
  }

  // Generiamo le sezioni di dettaglio
  const panelSections = buildDrawerSections(data);

  // openPanel accetta:
  // { title, subtitle, sections[], footerButtons[], blocking }
  // ma noi vogliamo un layout più ricco col TOC.
  //
  // Quindi facciamo una leggera estensione:
  // - La prima "section" conterrà l'Indice + le altre sezioni rese in blocco unico html.

  const drawerHTML = renderDrawerHTML(panelSections);

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
    blocking: false
  });

  // dopo apertura del panel, ri-bind tooltip anche lì
  if (window.__TradeliaUI && typeof window.__TradeliaUI.bindMetricInfoButtons === "function") {
    // timeout micro per assicurarsi che il DOM del panel sia in pagina
    setTimeout(() => {
      const panelBody = document.getElementById("panel-body");
      const panelBodyMobile = document.getElementById("panel-body-mobile");

      if (panelBody) {
        try { window.__TradeliaUI.bindMetricInfoButtons(panelBody); } catch(e){}
      }
      if (panelBodyMobile) {
        try { window.__TradeliaUI.bindMetricInfoButtons(panelBodyMobile); } catch(e){}
      }

      // Bind TOC anchor scroll interno
      bindDrawerTOC(panelBody);
      bindDrawerTOC(panelBodyMobile);

    }, 0);
  }
}

// Costruiamo i "pezzi logici" che andranno nelle sezioni del drawer
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

  return {
    regimeHTML: `
      <section id="f1-sec-regime" class="f1-sec-block space-y-2">
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
                data-metric="RegimeScore"
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
                data-metric="VIX"
                aria-label="Info VIX"
              >?</button>
            </div>
            <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">
              ${fmtNum(vixLevel)}
            </div>
          </div>
        </div>
      </section>
    `,

    rotationHTML: `
      <section id="f1-sec-rotation" class="f1-sec-block space-y-2">
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
                data-metric="Breadth"
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
                data-metric="RiskTilt"
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
          ${renderTopSectors(topSectors)}
        </div>
      </section>
    `,

    notesHTML: `
      <section id="f1-sec-notes" class="f1-sec-block space-y-2">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Note interpretative
        </div>
        ${renderInterpretation(interpretationNotes)}
      </section>
    `,

    auditHTML: `
      <section id="f1-sec-audit" class="f1-sec-block space-y-2">
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
      </section>
    `,

    mifidHTML: `
      <section id="f1-sec-mifid" class="f1-sec-block space-y-2">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
          Nota regolamentare
        </div>
        ${renderMiFIDNotice()}
      </section>
    `
  };
}

// Drawer finale con TOC + sezioni
function renderDrawerHTML(sectionsObj) {
  // TOC interno: scrolla alle sezioni
  const tocHTML = `
    <nav class="f1b-drawer-toc text-[12px] leading-[1.45] text-[color:var(--ink)] mb-4"
      style="
        background:var(--surface-card-alt);
        border:1px solid var(--br-card);
        border-radius:var(--radius-card);
        box-shadow:var(--shadow-card);
        padding:0.75rem;
      ">
      <div class="text-[11px] font-semibold text-[color:var(--muted)] uppercase tracking-wide leading-[1.3] mb-2">
        Indice
      </div>
      <ol class="space-y-1">
        <li><a href="#f1-sec-regime"   class="f1b-toc-link underline hover:opacity-80">Regime attuale</a></li>
        <li><a href="#f1-sec-rotation" class="f1b-toc-link underline hover:opacity-80">Rotazione &amp; partecipazione</a></li>
        <li><a href="#f1-sec-notes"    class="f1b-toc-link underline hover:opacity-80">Note interpretative</a></li>
        <li><a href="#f1-sec-audit"    class="f1b-toc-link underline hover:opacity-80">Audit &amp; Fonti</a></li>
        <li><a href="#f1-sec-mifid"    class="f1b-toc-link underline hover:opacity-80">Nota regolamentare</a></li>
      </ol>
    </nav>
  `;

  return `
    <div class="text-[13px] leading-[1.5] text-[color:var(--ink)] space-y-6"
      style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">

      ${tocHTML}

      ${sectionsObj.regimeHTML}
      ${sectionsObj.rotationHTML}
      ${sectionsObj.notesHTML}
      ${sectionsObj.auditHTML}
      ${sectionsObj.mifidHTML}
    </div>
  `;
}

// click TOC -> scroll alle sezioni interne del panel
function bindDrawerTOC(panelRoot) {
  if (!panelRoot) return;
  const links = panelRoot.querySelectorAll(".f1b-toc-link");
  links.forEach(a => {
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = panelRoot.querySelector(href);
      if (!target) return;
      target.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  });
}

/* -------------------------------------------------
   Helpers UI
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

      <div class="text-[11px] leading-[1.3] text-[color:var(--muted)] mt-1">
        ${escapeHtml(desc || "")}
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
        const inflow = isNum(sec.inflow5d) ? `${fmtNum(sec.inflow5d)} flow 5d` : "";
        const perf   = isNum(sec.perf1m)   ? `${fmtPct(sec.perf1m)} 1m`       : "";
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
