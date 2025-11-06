// /report/assets/js/modules/_placeholder.js
// Modulo placeholder generico per tutti i moduli da rifare
// Coerente con design istituzionale header-ticker

import Logger from '../utils/logger.js';

const MODULE_NAMES = {
  'f1': 'F1 - Analisi',
  'f1b': 'F1B - Regime di mercato',
  'f2': 'F2 - Macro & Sentiment',
  'f3': 'F3 - Analisi Tecnica',
  'f3o': 'F3O - Options Overlay',
  'f4': 'F4 - Analisi',
  'f5': 'F5 - Analisi',
  'f5b': 'F5B - Analisi',
  'f6': 'F6 - Analisi',
  'f7': 'F7 - Analisi'
};

const MODULE_DESCRIPTIONS = {
  'f1': 'Analisi in sviluppo',
  'f1b': 'Regime di mercato e contesto rischio (orizzonte 3–10 giorni)',
  'f2': 'Macro & Sentiment overlay (orizzonte 3–10 giorni)',
  'f3': 'Analisi tecnica multi-timeframe (orizzonte 3–10 giorni)',
  'f3o': 'Options overlay e derivati (orizzonte 3–10 giorni)',
  'f4': 'Analisi in sviluppo',
  'f5': 'Analisi in sviluppo',
  'f5b': 'Analisi in sviluppo',
  'f6': 'Analisi in sviluppo',
  'f7': 'Analisi in sviluppo'
};

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ===== RENDER CARD =====
export function renderCard(rawData, ctx = {}) {
  const modId = String(ctx.modId || '').toLowerCase();
  const moduleName = MODULE_NAMES[modId] || `Modulo ${ctx.modId || 'Unknown'}`;
  const moduleDesc = MODULE_DESCRIPTIONS[modId] || 'Modulo in sviluppo';
  
  const isPlaceholder = rawData?._placeholder === true || !rawData || Object.keys(rawData).length === 0;
  
  return `
    <section class="module-card">
      <header class="module-header">
        <div class="module-header-content">
          <div class="module-badge">${escapeHtml(ctx.modId || 'F?')}</div>
          <div class="module-title-section">
            <h2 class="module-title">${escapeHtml(moduleName)}</h2>
            <p class="module-subtitle">${escapeHtml(moduleDesc)}</p>
          </div>
        </div>
        <div class="module-status">
          <span class="module-status-badge module-status-badge--placeholder">In sviluppo</span>
        </div>
      </header>
      
      <div class="module-body">
        ${isPlaceholder ? `
          <div class="module-placeholder">
            <div class="module-placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            <h3 class="module-placeholder-title">Modulo in sviluppo</h3>
            <p class="module-placeholder-text">
              Questo modulo è in fase di sviluppo e sarà disponibile a breve.
            </p>
          </div>
        ` : `
          <div class="module-content">
            <p class="module-content-text">
              Dati caricati. Il modulo è in fase di sviluppo.
            </p>
          </div>
        `}
      </div>
    </section>
  `;
}

// ===== BIND CARD =====
export function bindCard(node, rawData, ctx = {}) {
  Logger.debug('Placeholder', `bindCard per modulo ${ctx.modId}`);
  // Nessun binding necessario per placeholder
}

