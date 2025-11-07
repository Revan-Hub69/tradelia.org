// /report/assets/js/modules/f1a.js
//
// F1A · Ticker Macro Context
//
// Scopo
// - Contesto macro per il ticker specifico
// - Dati contestuali ticker-level (non market-wide come F1B)
// - Finalità esclusivamente informativa e didattica
//
// Architettura
// - Tutti i contenuti dinamici arrivano da rawData (JSON back-end)
// - Usa formato rows + parts per rendering con header-ticker component
// - Metriche cliccabili con popup dal glossario
//
// Export
//   renderCard(rawData, ctx?)
//   bindCard(node, rawData, ctx?)

// Import formatter per generare rows
import { formatF1AToRows } from './f1a-formatter.js';

// Helper functions
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Normalizza dati F1A (supporta diversi formati)
 */
function normalizeDataPublicF1A(src = {}) {
  return {
    meta: {
      timestampET: src?.meta?.timestampET ?? "—",
      module: src?.meta?.module ?? "F1A · Ticker Macro Context",
      moduleVersion: src?.meta?.moduleVersion ?? "v1.0",
      moduleStatus: src?.meta?.moduleStatus ?? "ACTIVE",
      freshness: src?.meta?.freshness ?? "≤ T-1",
      hero_intro: src?.meta?.hero_intro ?? "Contesto macro contestuale per il ticker specifico.",
      hero_disclaimer: src?.meta?.hero_disclaimer ?? "Output a fini educativi/informativi (orizzonte 3–10 giorni). Non costituisce consulenza o raccomandazione (MiFID II)."
    },
    ticker: src.ticker || src?.meta?.ticker || "—",
    ticker_context: src.ticker_context || src.context || {}
  };
}

/**
 * Renderizza card F1A
 */
export function renderCard(rawData, ctx = {}) {
  const d = normalizeDataPublicF1A(rawData);

  // Genera rows formattate (formato header-ticker) da F1A
  const formattedRows = rawData?.rows || rawData?.formattedRows || formatF1AToRows(rawData);
  
  // Usa header-ticker rendering (SCORREVOLE, non tabelle)
  if (formattedRows && Array.isArray(formattedRows) && formattedRows.length > 0) {
    return `
      <section class="f1a-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]"
        style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        <header class="section-headline mb-4">
          <div class="section-head-left">
            <div class="section-head-topline flex items-center flex-wrap gap-2">
              <span class="section-badge">F1A</span>
              <span class="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                Ticker Macro Context · Orizzonte 3–10 giorni
              </span>
              <span class="module-status-pill text-[10px] font-semibold leading-[1.2] px-[6px] py-[2px] rounded-[4px] border"
                data-state="${escapeAttr(d.meta?.moduleStatus || 'ACTIVE')}"
                style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);">
                ${escapeHtml(d.meta?.moduleStatus || "ACTIVE")}
              </span>
              <span class="text-[10px] leading-[1.3] text-[color:var(--muted)]">
                ${escapeHtml(d.meta?.freshness || "≤ T-1")}
              </span>
            </div>
            <div class="section-title-main text-[14px] font-bold leading-[1.4] text-[color:var(--ink)] mt-1">
              Contesto macro contestuale per il ticker
            </div>
            <div class="section-desc text-[12px] text-[color:var(--muted)] leading-[1.45] mt-1">
              ${escapeHtml(d.meta?.hero_intro || "")}
              <br/>
              <span class="text-[11px] text-[color:var(--muted)]">
                Lettura di contesto. Non è un'istruzione operativa.
              </span>
            </div>
          </div>
        </header>
        <div class="f1a-ticker-container" data-f1a-ticker="true" style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);padding:1rem;"></div>
      </section>
    `;
  }

  // Fallback se non ci sono rows
  return `
    <section class="f1a-card-container text-[13px] leading-[1.5] text-[color:var(--ink)]">
      <div class="error-state">
        <div class="error-state-title">F1A: Dati non disponibili</div>
        <div class="error-state-message">Impossibile generare formato rows per F1A</div>
      </div>
    </section>
  `;
}

/**
 * Bind eventi e monta header-ticker per F1A
 */
export function bindCard(node, rawData, ctx = {}) {
  if (!node || !rawData) return;
  const data = normalizeDataPublicF1A(rawData);

  // Genera rows formattate se non presenti
  const formattedRows = rawData?.rows || rawData?.formattedRows || formatF1AToRows(rawData);
  const tickerContainer = node.querySelector('[data-f1a-ticker="true"]');
  
  // Monta header-ticker per renderizzare F1A in formato scorrevole (come header-ticker)
  if (formattedRows && Array.isArray(formattedRows) && formattedRows.length > 0 && tickerContainer) {
    // Importa e monta header-ticker component (stesso sistema di header.json)
    import('../components/header-ticker.js').then(({ headerTicker }) => {
      const tickerNode = headerTicker.mount(tickerContainer);
      if (tickerNode) {
        // Prepara dati per header-ticker (stesso formato di header.json)
        const tickerData = {
          ...rawData.meta,
          rows: formattedRows,
          metricsPanel: rawData?.metricsPanel || []
        };
        headerTicker.update(tickerNode, tickerData);
      }
    }).catch(err => {
      console.warn('F1A: Errore caricamento header-ticker', err);
    });
  }

  // Tooltip "?" nella card (metriche cliccabili)
  if (
    window.__TradeliaUI &&
    typeof window.__TradeliaUI.bindMetricInfoButtons === "function"
  ) {
    try {
      window.__TradeliaUI.bindMetricInfoButtons(node);
    } catch (e) {
      console.warn('F1A: Errore bind metric info buttons', e);
    }
  }
}

