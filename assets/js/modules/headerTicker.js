import { mountStateBadge, stateToTone } from '../utils/stateBadge.js';
import { tone } from '../utils/tone.js'; // deve esistere: toClass(), fromFreshness(), fromConfidence(), simple01()

function pillHTML(key, label, { helpKey, asBadge } = {}) {
  const help = helpKey ? `<button class="hx" data-k="${helpKey}" aria-label="Aiuto ${label}"></button>` : '';
  return `
    <div class="pill">
      <span class="tonebar ${tone.toClass('neutral')}" data-bind="tone:${key}"></span>
      <div class="min-w-0">
        <div class="lab">${label} ${help}</div>
        <div class="val truncate" data-bind="value:${key}" ${asBadge ? 'data-as-badge="1"' : ''}>—</div>
      </div>
    </div>
  `;
}

function setField(root, key, { value, toneName, asBadge = false }) {
  const v = root.querySelector(`[data-bind="value:${key}"]`);
  const t = root.querySelector(`[data-bind="tone:${key}"]`);
  if (v) {
    if (asBadge) {
      mountStateBadge(v, { state: value, label: value });
    } else {
      v.textContent = value ?? '—';
    }
  }
  if (t) {
    const tn = (toneName ?? 'neutral');
    t.className = 'tonebar ' + tone.toClass(tn);
    t.setAttribute('data-tone', tn);
  }
}

export function initHeaderTicker(data = {}) {
  const root = document.getElementById('header-ticker');
  if (!root) return;

  // Build structure
  root.innerHTML = [
    pillHTML('DataStart',       'Inizio',     { helpKey: 'DataStart' }),
    pillHTML('DataEnd',         'Fine',       { helpKey: 'DataEnd' }),
    pillHTML('Ticker',          'Ticker',     { helpKey: 'Ticker' }),
    pillHTML('Venue',           'Venue',      { helpKey: 'Venue' }),
    pillHTML('Freshness',       'Freshness',  { helpKey: 'Freshness' }),
    pillHTML('State',           'Stato',      { helpKey: 'StatoReport', asBadge: true }),
    pillHTML('ConfidenceFinal', 'Confidence', { helpKey: 'ConfidenceFinal' }),
    pillHTML('OCR_Conf',        'OCR',        { helpKey: 'OCR_Conf' }),
    pillHTML('DataIntegrity',   'DataInt',    { helpKey: 'DataIntegrity' }),
    pillHTML('FeedSync',        'FeedSync',   { helpKey: 'FeedSync' })
  ].join('');

  // Values
  const fresh = data?.FreshnessLabel ?? data?.Freshness;
  const conf  = Number(data?.ConfidenceFinal);
  const ocr   = Number(data?.OCR_Conf);
  const di    = Number(data?.DataIntegrity);
  const fs    = Number(data?.FeedSync);
  const state = data?.State ?? data?.ReportState;

  // Bind
  setField(root, 'DataStart',       { value: data?.Start, toneName: 'neutral' });
  setField(root, 'DataEnd',         { value: data?.End, toneName: 'neutral' });
  setField(root, 'Ticker',          { value: data?.Ticker, toneName: 'neutral' });
  setField(root, 'Venue',           { value: data?.Venue, toneName: 'neutral' });
  setField(root, 'Freshness',       { value: fresh, toneName: tone.fromFreshness(fresh) });
  setField(root, 'ConfidenceFinal', { value: Number.isFinite(conf) ? conf.toFixed(2) : '—', toneName: tone.fromConfidence(conf) });
  setField(root, 'OCR_Conf',        { value: Number.isFinite(ocr) ? ocr.toFixed(2) : '—', toneName: tone.simple01(ocr) });
  setField(root, 'DataIntegrity',   { value: Number.isFinite(di)  ? di.toFixed(2)  : '—', toneName: tone.simple01(di) });
  setField(root, 'FeedSync',        { value: Number.isFinite(fs)  ? fs.toFixed(2)  : '—', toneName: tone.simple01(fs) });
  setField(root, 'State',           { value: state ?? '—', toneName: stateToTone(state), asBadge: true });

  // Hydrate icons (Lucide) dopo iniezione dinamica
  if (window.lucide?.createIcons) {
    try { window.lucide.createIcons(); } catch { /* silent */ }
  }
}
