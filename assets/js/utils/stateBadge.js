// ============================================================================
// File: assets/js/utils/stateBadge.js
// Istituzionale: badge di stato con SVG inline + helpers (safe & robusti)
// ============================================================================

/** Escape basilare per testo iniettato in innerHTML */
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Stato stringa → tone ('green'|'amber'|'red'|'neutral') */
export function stateToTone(state) {
  const s = String(state ?? '').trim().toUpperCase();
  if (s === 'ACTIVE') return 'green';
  if (s === 'REVIEW' || s === 'PENDING') return 'amber';
  if (s === 'HOLD' || s === 'PAUSED' || s === 'SUSPENDED') return 'red';
  return 'neutral';
}

/** Soglie confidence [0..1] → tone */
function toneFromConfidence(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 'neutral';
  if (n >= 0.80) return 'green';
  if (n >= 0.60) return 'amber';
  return 'red';
}

/** Prova a derivare il tono da una label testuale breve */
function toneFromLabel(label) {
  const s = String(label ?? '').trim().toLowerCase();
  if (!s) return 'neutral';
  if (/^(g|green|ok|high|alta|positivo)$/.test(s)) return 'green';
  if (/^(y|yellow|amber|mid|media|neutro|neutral)$/.test(s)) return 'amber';
  if (/^(r|red|low|bassa|negativo|critico)$/.test(s)) return 'red';
  return 'neutral';
}

function iconForTone(tone){
  if (tone === 'green') {
    // cerchio + check
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM10.2 15.8l5.6-5.6-1.4-1.4-4.2 4.2-1.6-1.6-1.4 1.4 3 3z"/>
    </svg>`;
  }
  if (tone === 'amber') {
    // cerchio + info
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 13H11V9h2v6zm0-8h-2V5h2v2z"/>
    </svg>`;
  }
  if (tone === 'red') {
    // cerchio + X
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM8.7 15.3l6.6-6.6 1.4 1.4-6.6 6.6-1.4-1.4zm6.6 0-1.4 1.4-6.6-6.6 1.4-1.4 6.6 6.6z"/>
    </svg>`;
  }
  // neutral: cerchio + info
  return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
  </svg>`;
}

/** Rende il badge di stato (markup HTML) */
export function renderStateBadge({ state, label } = {}) {
  const tone = stateToTone(state ?? label);
  const text = escapeHtml((label ?? state ?? 'NEUTRO').toString().toUpperCase());
  return `
    <span class="sb sb--${tone}" role="status" aria-label="Stato ${text}">
      <span class="sb__ico" aria-hidden="true">${iconForTone(tone)}</span>
      <span class="sb__tx">${text}</span>
    </span>
  `;
}

/** Monta un badge di stato dentro un target (sostituisce il contenuto) */
export function mountStateBadge(target, { state, label } = {}) {
  if (!target) return;
  target.innerHTML = renderStateBadge({ state, label });
}

/** Monta un badge di confidence (usa soglie numeriche; label opzionale) */
export function mountConfidenceBadge(target, { value, label } = {}) {
  if (!target) return;

  // Se ho un valore numerico valido → calcolo il tono; altrimenti provo dalla label
  const n = Number(value);
  const tone = Number.isFinite(n) ? toneFromConfidence(n) : toneFromLabel(label);

  const text = escapeHtml(
    (label ?? (Number.isFinite(n) ? n.toFixed(2) : '—')).toString().toUpperCase()
  );

  target.innerHTML = `
    <span class="sb sb--${tone}" role="status" aria-label="Confidence ${text}">
      <span class="sb__ico" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
        </svg>
      </span>
      <span class="sb__tx">${text}</span>
    </span>
  `;
}
