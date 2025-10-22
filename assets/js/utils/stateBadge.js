// ============================================================================
// File: assets/js/utils/stateBadge.js
// Istituzionale: badge di stato con SVG inline + helpers
// ============================================================================
const TONES = {
  green:  { bg:'#ecfdf5', bd:'#a7f3d0', fg:'#065f46' },
  amber:  { bg:'#fffbeb', bd:'#fcd34d', fg:'#92400e' },
  red:    { bg:'#fef3c7', bd:'#fbbf24', fg:'#7c2d12' },
  neutral:{ bg:'#f1f5f9', bd:'#e5e7eb', fg:'#334155' }
};

export function stateToTone(state) {
  const s = String(state ?? '').trim().toUpperCase();
  if (s === 'ACTIVE') return 'green';
  if (s === 'REVIEW' || s === 'PENDING') return 'amber';
  if (s === 'HOLD' || s === 'PAUSED' || s === 'SUSPENDED') return 'red';
  return 'neutral';
}

function iconForTone(tone){
  if (tone === 'green') {
    // circle + check
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM10.2 15.8l5.6-5.6-1.4-1.4-4.2 4.2-1.6-1.6-1.4 1.4 3 3z"/>
    </svg>`;
  }
  if (tone === 'amber') {
    // circle + pause/info combo (cauto)
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 13H11V9h2v6zm0-8h-2V5h2v2z"/>
    </svg>`;
  }
  if (tone === 'red') {
    // circle + cross
    return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM8.7 15.3l6.6-6.6 1.4 1.4-6.6 6.6-1.4-1.4zm6.6 0-1.4 1.4-6.6-6.6 1.4-1.4 6.6 6.6z"/>
    </svg>`;
  }
  // neutral: circle + info
  return `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
  </svg>`;
}

export function renderStateBadge({ state, label } = {}) {
  const text = (label ?? state ?? 'NEUTRO').toString().toUpperCase();
  const tone = stateToTone(state ?? label);
  return `
    <span class="sb sb--${tone}" role="status" aria-label="Stato ${text}">
      <span class="sb__ico" aria-hidden="true">${iconForTone(tone)}</span>
      <span class="sb__tx">${text}</span>
    </span>
  `;
}

export function mountStateBadge(target, { state, label } = {}) {
  if (!target) return;
  target.innerHTML = renderStateBadge({ state, label });
}

export function mountConfidenceBadge(target, { value, label } = {}) {
  if (!target) return;
  const text = (label ?? (Number.isFinite(value) ? value.toFixed(2) : '—')).toString().toUpperCase();
  const tone = label ? stateToTone(label) : (Number(value) >= 0.80 ? 'green' : Number(value) >= 0.60 ? 'amber' : 'red');
  target.innerHTML = `
    <span class="sb sb--${tone}" role="status" aria-label="Confidence ${text}">
      <span class="sb__ico" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
      </span>
      <span class="sb__tx">${text}</span>
    </span>
  `;
}
