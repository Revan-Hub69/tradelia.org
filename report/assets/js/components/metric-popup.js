// /report/assets/js/components/metric-popup.js
// Popup semplice per metriche - collegato al glossario
// Design coerente e semplice

import Logger from '../utils/logger.js';
import { registerOverlay, unregisterOverlay, OVERLAY_TYPES } from '../utils/overlay-manager.js';
import { i18n } from '../utils/i18n.js';

const POPUP = {
  _overlay: null,
  _panel: null,
  _isOpen: false,
  _glossary: null,
  _currentMetric: null,
  _overlayId: 'metric-popup', // ID univoco per overlay manager
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
      : Number(value).toLocaleString('it-IT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }
  return String(value);
}

// ===== GLOSSARY =====
async function loadGlossary() {
  if (POPUP._glossary) return POPUP._glossary;

  try {
    // Prova prima il glossario unificato nella root, poi fallback a report/assets
    let res = await fetch('/glossario.json', { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch('/report/assets/glossary.json', { cache: 'no-store' });
    }
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
      <button class="metric-popup-close" aria-label="${i18n.t('metric.popup.close')}" type="button">×</button>
    </header>
    <div class="metric-popup-body">
      <div class="metric-popup-value">
        <span class="metric-popup-value-label">${i18n.t('metric.popup.value')}</span>
        <span class="metric-popup-value-text">${escapeHtml(formatValue(metric.value))}</span>
      </div>
      ${
        entry
          ? `
        <div class="metric-popup-section">
          <h4 class="metric-popup-section-title">${i18n.t('metric.popup.what')}</h4>
          <p class="metric-popup-section-text">${escapeHtml(entry.what || entry.definizioneAccademica || '')}</p>
        </div>
        ${
          entry.how || entry.spiegazioneAI
            ? `
          <div class="metric-popup-section">
            <h4 class="metric-popup-section-title">${i18n.t('metric.popup.how')}</h4>
            <p class="metric-popup-section-text">${escapeHtml(entry.how || entry.spiegazioneAI || '')}</p>
          </div>
        `
            : ''
        }
        ${
          entry.source || entry.fonteAccademica
            ? `
          <div class="metric-popup-section">
            <h4 class="metric-popup-section-title">${i18n.t('metric.popup.source')}</h4>
            <p class="metric-popup-section-text metric-popup-source">${escapeHtml(entry.source || entry.fonteAccademica || '')}</p>
          </div>
        `
            : ''
        }
      `
          : `
        <div class="metric-popup-section">
          <p class="metric-popup-section-text metric-popup-no-info">${i18n.t('metric.popup.noInfo')}</p>
        </div>
      `
      }
      <div class="metric-popup-meta">
        <div class="metric-popup-meta-key">
          <span class="metric-popup-meta-label">${i18n.t('metric.popup.key')}</span>
          <code class="metric-popup-code">${escapeHtml(metric.key)}</code>
        </div>
      </div>
    </div>
    <footer class="metric-popup-footer">
      <button class="metric-popup-glossary-btn" type="button">
        <svg class="metric-popup-glossary-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        ${i18n.t('metric.popup.openGlossary')}
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
    glossaryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openGlossary(); // Chiama direttamente la funzione invece di POPUP.openGlossary
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

  // Listener per close request dall'overlay manager (ESC key)
  POPUP._overlay.addEventListener('overlay-close-request', (e) => {
    if (e.detail.id === POPUP._overlayId) {
      POPUP.close();
    }
  });

  // ESC gestito da overlay-manager (rimosso listener duplicato)

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
    const found = allMetrics.find((m) => m.key === metric);
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

  // Registra overlay nello stack (gestisce z-index e overflow)
  registerOverlay(POPUP._overlayId, OVERLAY_TYPES.METRIC_POPUP, POPUP._overlay);

  Logger.debug('MetricPopup', `Popup aperto per metrica: ${metricData.key}`);
}

function openGlossary() {
  // Apri drawer glossario separato (non dentro il popup)
  import('./glossary-drawer.js')
    .then(({ glossaryDrawer }) => {
      glossaryDrawer.open();
    })
    .catch((err) => {
      Logger.error('MetricPopup', 'Errore caricamento glossary drawer', err);
    });
}

async function close() {
  if (!POPUP._overlay || !POPUP._isOpen) return;

  POPUP._overlay.hidden = true;
  POPUP._overlay.setAttribute('aria-hidden', 'true');
  POPUP._isOpen = false;
  POPUP._view = 'metric';
  POPUP._currentMetric = null;

  // Rimuovi overlay dallo stack (gestisce overflow automaticamente)
  unregisterOverlay(POPUP._overlayId);

  Logger.debug('MetricPopup', 'Popup chiuso');
}

// Export
POPUP.mount = mount;
POPUP.open = open;
POPUP.close = close;
POPUP.openGlossary = openGlossary; // Export openGlossary

export const metricPopup = POPUP;
