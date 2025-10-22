// /assets/js/utils/tone.js

/**
 * @typedef {'green'|'yellow'|'red'|'neutral'} ToneName
 */

const TONE_CLASS = Object.freeze({
  green:   'tone-g',
  yellow:  'tone-y',
  red:     'tone-r',
  neutral: 'tone-n',
});

const BADGE_TONE = Object.freeze({
  green:   'g',
  yellow:  'y',
  red:     'r',
  neutral: 'n',
});

/** Normalizza numeri o stringhe numeriche; NaN -> null */
function toNum(v) {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Clamp 0..1 per metriche [0,1] */
function clamp01(n) {
  if (n == null) return null;
  return Math.min(1, Math.max(0, n));
}

/** Tone safe getter */
function safeTone(t) {
  const k = String(t || 'neutral').toLowerCase();
  return (k === 'green' || k === 'yellow' || k === 'red') ? /** @type {ToneName} */(k) : 'neutral';
}

export const tone = Object.freeze({
  /**
   * Confidence ∈ [0,1]: ≥0.80 green, ≥0.60 yellow, else red
   * @param {number|string|null|undefined} v
   * @returns {ToneName}
   */
  fromConfidence(v) {
    const n = clamp01(toNum(v));
    if (n == null) return 'neutral';
    if (n >= 0.80) return 'green';
    if (n >= 0.60) return 'yellow';
    return 'red';
  },

  /**
   * Freshness label: T-0 green, T-1 yellow, T-2+ red, empty neutral
   * @param {string|null|undefined} label
   * @returns {ToneName}
   */
  fromFreshness(label) {
    const s = String(label || '').toUpperCase();
    if (!s) return 'neutral';
    if (s.includes('T-0')) return 'green';
    if (s.includes('T-1')) return 'yellow';
    return 'red';
  },

  /**
   * Generico score ∈ [0,1]: ≥0.85 green, ≥0.65 yellow, else red
   * @param {number|string|null|undefined} v
   * @returns {ToneName}
   */
  simple01(v) {
    const n = clamp01(toNum(v));
    if (n == null) return 'neutral';
    if (n >= 0.85) return 'green';
    if (n >= 0.65) return 'yellow';
    return 'red';
  },

  /**
   * Stato → tono: ACTIVE green, REVIEW yellow, HOLD red, else neutral
   * @param {string|null|undefined} s
   * @returns {ToneName}
   */
  fromState(s) {
    const map = { ACTIVE: 'green', REVIEW: 'yellow', HOLD: 'red' };
    return safeTone(map[String(s || '').toUpperCase()] || 'neutral');
  },

  /**
   * Tono → classe CSS per la tonebar
   * @param {ToneName|string|null|undefined} t
   * @returns {string}
   */
  toClass(t) {
    const k = safeTone(t);
    return TONE_CLASS[k] || TONE_CLASS.neutral;
  },

  /**
   * Tono → badge tone (g/y/r/n) per componenti che usano varianti compatte
   * @param {ToneName|string|null|undefined} t
   * @returns {'g'|'y'|'r'|'n'}
   */
  toBadgeTone(t) {
    const k = safeTone(t);
    return BADGE_TONE[k] || 'n';
  },

  /**
   * Etichetta testuale breve (facoltativa) utile per tooltip/alt
   * @param {ToneName|string|null|undefined} t
   * @returns {'OK'|'Attenzione'|'Critico'|'N/D'}
   */
  label(t) {
    const k = safeTone(t);
    if (k === 'green') return 'OK';
    if (k === 'yellow') return 'Attenzione';
    if (k === 'red') return 'Critico';
    return 'N/D';
  },
});
