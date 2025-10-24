// /report/assets/js/modules/f1b.js
//
// Modulo F1B · Contesto iniziale / Regime di mercato
// Montato su #mod-f1 (vedi window.Tradelia.mountTarget.F1B)
//
// Export richiesti dal runtime:
// - renderCard(data, ctx) => string HTML
// - bindCard(node, data, ctx) => attach listeners

export function renderCard(data, ctx = {}) {
  // safety fallback
  if (!data) {
    return `
      <div class="text-[13px] text-[color:var(--ink)]">
        <div class="font-bold text-[14px] leading-[1.4] mb-2">
          Dati F1B non disponibili
        </div>
        <p class="text-[12.5px] text-[color:var(--muted)] leading-[1.4]">
          Impossibile caricare il regime di mercato.
        </p>
      </div>
    `;
  }

  // estraggo i campi con fallback
  const title          = data.module_title || "Market Strategy";
  const mode           = data.strategy_mode || "—";
  const regimeScore    = data.regime_score ?? null;
  const breadth        = data.breadth_1m ?? null;
  const vix            = data.vix_level ?? null;

  const macroTrends    = Array.isArray(data.macro_trends) ? data.macro_trends : [];
  const drivers        = Array.isArray(data.drivers) ? data.drivers : [];
  const filtersAlign   = Array.isArray(data.filters_f2_alignment) ? data.filters_f2_alignment : [];

  const decision = data.decision || {};
  const decisionSummary = decision.summary || "—";
  const decisionTone    = decision.tone || "neutral";
  const decisionScore   = decision.score ?? null;
  const decisionNotes   = decision.notes || "";

  // tono -> badge
  let toneColor = "var(--tone-n)";
  if (decisionTone === "positive") toneColor = "var(--tone-g)";
  if (decisionTone === "negative") toneColor = "var(--tone-r)";

  // helper per list rendering
  function renderList(arr) {
    if (!arr.length) {
      return `<li class="text-[12.5px] text-[color:var(--muted)] leading-[1.4]">—</li>`;
    }
    return arr.map(item => `
      <li class="leading-[1.45] text-[13px] text-[color:var(--ink)]">${item}</li>
    `).join("");
  }

  // "audit" link nel drawer: ci agganciamo via data-open-drawer
  const auditHtml = `
    <button
      class="btn btn-sm"
      data-open-drawer="audit-f1b"
      type="button"
    >
      Audit / Fonti
    </button>
  `;

  return `
    <div class="text-[13px] leading-[1.45] text-[color:var(--ink)]">
      <!-- Header titolo + mode -->
      <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div class="min-w-0">
          <div class="text-[14px] font-extrabold leading-[1.4] text-[color:var(--ink)]">
            ${escapeHtml(title)}
          </div>
          <div class="text-[12px] text-[color:var(--muted)] leading-[1.4]">
            Regime attuale: <span class="font-semibold text-[color:var(--ink)]">${escapeHtml(mode)}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <div
            class="px-2 py-1 rounded-md text-[11px] font-semibold leading-none border"
            style="
              background: color-mix(in oklab, ${toneColor} 15%, transparent);
              color:${toneColor};
              border-color: ${toneColor};
            "
          >
            ${escapeHtml(decisionTone)}
          </div>
        </div>
      </div>

      <!-- Metrichette chiave -->
      <div class="grid grid-cols-3 gap-3 mb-4 text-[12px] leading-[1.4]">
        <div class="p-2 rounded-md border border-[color:var(--br-card)] bg-[color:var(--surface-card-alt)] shadow-[var(--shadow-card)]">
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">Regime Score</div>
          <div class="font-mono font-bold text-[color:var(--ink)] text-[13px]">${fmtNum(regimeScore)}</div>
        </div>

        <div class="p-2 rounded-md border border-[color:var(--br-card)] bg-[color:var(--surface-card-alt)] shadow-[var(--shadow-card)]">
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">Breadth 1M</div>
          <div class="font-mono font-bold text-[color:var(--ink)] text-[13px]">${fmtNum(breadth)}</div>
        </div>

        <div class="p-2 rounded-md border border-[color:var(--br-card)] bg-[color:var(--surface-card-alt)] shadow-[var(--shadow-card)]">
          <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">VIX</div>
          <div class="font-mono font-bold text-[color:var(--ink)] text-[13px]">${fmtNum(vix)}</div>
        </div>
      </div>

      <!-- Macro trends / Drivers -->
      <div class="grid sm:grid-cols-2 gap-4 mb-4">
        <div class="min-w-0">
          <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-1">
            Macro trend in corso
          </div>
          <ul class="list-disc pl-4">
            ${renderList(macroTrends)}
          </ul>
        </div>

        <div class="min-w-0">
          <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-1">
            Driver principali
          </div>
          <ul class="list-disc pl-4">
            ${renderList(drivers)}
          </ul>
        </div>
      </div>

      <!-- Allineamento F2 -->
      <div class="mb-4">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-1">
          Coerenza con sentiment / flussi (F2)
        </div>
        <ul class="list-disc pl-4">
          ${renderList(filtersAlign)}
        </ul>
      </div>

      <!-- Decision block -->
      <div class="rounded-md border border-[color:var(--br-card)] bg-[color:var(--surface-card-alt)] shadow-[var(--shadow-card)] p-3">
        <div class="text-[12px] font-semibold uppercase tracking-wide text-[color:var(--muted)] mb-2">
          Sintesi Regime
        </div>
        <div class="font-semibold text-[color:var(--ink)] text-[13px] leading-[1.4]">
          ${escapeHtml(decisionSummary)}
        </div>

        <div class="grid grid-cols-2 gap-3 mt-3 text-[12px] leading-[1.4]">
          <div>
            <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">Score</div>
            <div class="font-mono font-bold text-[color:var(--ink)] text-[13px]">${fmtNum(decisionScore)}</div>
          </div>
          <div>
            <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">Note</div>
            <div class="text-[color:var(--ink)] text-[12.5px] leading-[1.4]">${escapeHtml(decisionNotes)}</div>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          ${auditHtml}
        </div>
      </div>
    </div>
  `;
}

// attacca listener tipo "Audit / Fonti" -> apre drawer con audit info
export function bindCard(node, data, ctx = {}) {
  if (!node || !data) return;

  const auditBtn = node.querySelector('[data-open-drawer="audit-f1b"]');
  if (auditBtn) {
    auditBtn.addEventListener('click', () => {
      // usiamo l'openDrawer globale definito nello script inline dell'index
      if (typeof window.openDrawer === 'function') {
        const a = data.audit || {};
        const html = `
          <div class="text-[13px] leading-[1.45] text-[color:var(--ink)] space-y-3">
            <p class="text-[12px] text-[color:var(--muted)] leading-[1.4]">
              Questo pannello ha finalità informative/formative. Non costituisce
              consulenza personalizzata, raccomandazione esecutiva o sollecitazione
              al pubblico risparmio.
            </p>

            <div>
              <div class="font-semibold text-[13px] text-[color:var(--ink)] leading-[1.4] mb-1">
                Origine dati
              </div>
              <div class="text-[12.5px] leading-[1.4] text-[color:var(--ink)]">
                ${escapeHtml(a.source_sync || "—")}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="text-[12px] leading-[1.4]">
                <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">Lag (giorni)</div>
                <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">${fmtNum(a.feed_lag_days)}</div>
              </div>
              <div class="text-[12px] leading-[1.4]">
                <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">Confidence</div>
                <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">${fmtNum(a.confidence)}</div>
              </div>
            </div>

            <div class="text-[12px] leading-[1.4]">
              <div class="text-[10px] uppercase tracking-wide text-[color:var(--muted)] font-semibold mb-1">
                Integrità dataset
              </div>
              <div class="font-mono font-bold text-[13px] text-[color:var(--ink)]">${fmtNum(a.integrity)}</div>
            </div>

            <p class="text-[12px] text-[color:var(--muted)] leading-[1.4]">
              Prima di qualsiasi scelta reale verifica sempre adeguatezza / appropriatezza
              con un consulente autorizzato, in linea con MiFID II.
            </p>
          </div>
        `;
        window.openDrawer({
          title: 'Audit F1B',
          subtitle: 'Fonti dati e qualità campione',
          html,
          blocking: false,
          showAccept: false
        });
      }
    });
  }
}

/* -- helpers locali -- */
function fmtNum(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  // mostriamo max 2 decimali
  const n = Number(v);
  return n.toFixed(2).replace('.', ',');
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
