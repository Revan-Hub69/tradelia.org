// /report/assets/js/components/metric-popup.js
// Popup semplice per metriche - collegato al glossario
// Design coerente e semplice

import Logger from '../utils/logger.js';

const POPUP = {
  _overlay: null,
  _panel: null,
  _isOpen: false,
  _glossary: null,
  _currentMetric: null,
  _view: 'metric', // 'metric' | 'glossary'
};

// ===== UTILITIES =====
function createEl(tag, className, text = null) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== null) el.textContent = text;
  return el;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? String(value)
      : Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(value);
}

// ===== GLOSSARY =====
async function loadGlossary() {
  if (POPUP._glossary) return POPUP._glossary;
  
  try {
    const res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    if (res.ok) {
      POPUP._glossary = await res.json();
      Logger.debug('MetricPopup', 'Glossario caricato');
      return POPUP._glossary;
    }
  } catch (err) {
    Logger.warn('MetricPopup', 'Errore caricamento glossario', err);
  }
  
  POPUP._glossary = {};
  return POPUP._glossary;
}

function getGlossaryEntry(key) {
  if (!POPUP._glossary) return null;
  return POPUP._glossary[key] || null;
}

// ===== RENDERING =====
function renderPopup(metric) {
  if (!POPUP._overlay) mount();
  
  const entry = getGlossaryEntry(metric.key);
  
  POPUP._panel.innerHTML = `
    <header class="metric-popup-header">
      <div class="metric-popup-header-content">
        <h3 class="metric-popup-title">${escapeHtml(metric.label || metric.key)}</h3>
        <div class="metric-popup-key">${escapeHtml(metric.key)}</div>
      </div>
      <button class="metric-popup-close" aria-label="Chiudi" type="button">×</button>
    </header>
    <div class="metric-popup-body">
      <div class="metric-popup-value">
        <span class="metric-popup-value-label">Valore:</span>
        <span class="metric-popup-value-text">${escapeHtml(formatValue(metric.value))}</span>
      </div>
      ${entry ? `
        <div class="metric-popup-section">
          <h4 class="metric-popup-section-title">Cosa</h4>
          <p class="metric-popup-section-text">${escapeHtml(entry.what || '')}</p>
        </div>
        ${entry.how ? `
          <div class="metric-popup-section">
            <h4 class="metric-popup-section-title">Come</h4>
            <p class="metric-popup-section-text">${escapeHtml(entry.how)}</p>
          </div>
        ` : ''}
        ${entry.source ? `
          <div class="metric-popup-section">
            <h4 class="metric-popup-section-title">Fonte</h4>
            <p class="metric-popup-section-text metric-popup-source">${escapeHtml(entry.source)}</p>
          </div>
        ` : ''}
      ` : `
        <div class="metric-popup-section">
          <p class="metric-popup-section-text metric-popup-no-info">Nessuna informazione disponibile nel glossario per questa metrica.</p>
        </div>
      `}
      <div class="metric-popup-meta">
        <div class="metric-popup-meta-key">
          <span class="metric-popup-meta-label">Key:</span>
          <code class="metric-popup-code">${escapeHtml(metric.key)}</code>
        </div>
      </div>
    </div>
    <footer class="metric-popup-footer">
      <button class="metric-popup-glossary-btn" type="button">
        <svg class="metric-popup-glossary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Apri glossario
      </button>
    </footer>
  `;
  
  // Store current metric
  POPUP._currentMetric = metric;
  POPUP._view = 'metric';
  
  // Close handler
  POPUP._panel.querySelector('.metric-popup-close').addEventListener('click', () => POPUP.close());
  
  // Glossary button handler
  const glossaryBtn = POPUP._panel.querySelector('.metric-popup-glossary-btn');
  if (glossaryBtn) {
    glossaryBtn.addEventListener('click', () => {
      POPUP.openGlossary();
    });
  }
}

// ===== MOUNT =====
function mount() {
  if (POPUP._overlay) return;
  
  // Overlay
  POPUP._overlay = createEl('div', 'metric-popup-overlay');
  POPUP._overlay.setAttribute('aria-modal', 'true');
  POPUP._overlay.setAttribute('aria-hidden', 'true');
  POPUP._overlay.hidden = true;
  
  // Panel
  POPUP._panel = createEl('div', 'metric-popup-panel');
  POPUP._panel.setAttribute('role', 'dialog');
  POPUP._panel.setAttribute('aria-labelledby', 'metric-popup-title');
  
  POPUP._overlay.appendChild(POPUP._panel);
  document.body.appendChild(POPUP._overlay);
  
  // Click outside to close
  POPUP._overlay.addEventListener('click', (e) => {
    if (e.target === POPUP._overlay) POPUP.close();
  });
  
  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && POPUP._isOpen) POPUP.close();
  });
  
  Logger.debug('MetricPopup', 'Popup montato');
}

// ===== PUBLIC API =====
async function open(metric, allMetrics = []) {
  if (!POPUP._overlay) mount();
  
  // Load glossary
  await loadGlossary();
  
  // Find metric in allMetrics if only key provided
  let metricData = metric;
  if (typeof metric === 'string') {
    const found = allMetrics.find(m => m.key === metric);
    if (found) {
      metricData = found;
    } else {
      metricData = { key: metric, label: metric, value: null };
    }
  }
  
  renderPopup(metricData);
  
  POPUP._overlay.hidden = false;
  POPUP._overlay.setAttribute('aria-hidden', 'false');
  POPUP._isOpen = true;
  document.body.style.overflow = 'hidden';
  
  Logger.debug('MetricPopup', `Popup aperto per metrica: ${metricData.key}`);
}

function openGlossary() {
  if (!POPUP._overlay || !POPUP._panel) return;
  
  // Import glossary component dynamically
  import('./glossary-embedded.js').then(({ glossaryEmbedded }) => {
    POPUP._view = 'glossary';
    glossaryEmbedded.mount(POPUP._panel, () => {
      // Callback: torna indietro al metric popup
      if (POPUP._currentMetric) {
        renderPopup(POPUP._currentMetric);
      }
    });
  }).catch(err => {
    Logger.error('MetricPopup', 'Errore caricamento glossario embedded', err);
  });
}

async function close() {
  if (!POPUP._overlay || !POPUP._isOpen) return;
  
  // Se siamo nella vista glossario, torna al metric prima di chiudere
  if (POPUP._view === 'glossary') {
    try {
      const { glossaryEmbedded } = await import('./glossary-embedded.js');
      glossaryEmbedded.unmount();
      if (POPUP._currentMetric) {
        renderPopup(POPUP._currentMetric);
        POPUP._view = 'metric';
        return; // Non chiudere, solo torna al metric
      }
    } catch (err) {
      Logger.error('MetricPopup', 'Errore unmount glossario', err);
    }
  }
  
  POPUP._overlay.hidden = true;
  POPUP._overlay.setAttribute('aria-hidden', 'true');
  POPUP._isOpen = false;
  POPUP._view = 'metric';
  POPUP._currentMetric = null;
  document.body.style.overflow = '';
  
  Logger.debug('MetricPopup', 'Popup chiuso');
}

// Export
POPUP.mount = mount;
POPUP.open = open;
POPUP.close = close;

export const metricPopup = POPUP;

