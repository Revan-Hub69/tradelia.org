// /report/assets/js/components/site-footer.js
// Componente Footer principale - Coerente con architettura modulare
// Legge dati dinamici da header.json

import Logger from '../utils/logger.js';

const FOOTER = {
  _node: null,
  _container: null
};

// ===== UTILITIES =====
function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function fmtDate(str) {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('it-IT');
  } catch {
    return String(str);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '—';
}

// ===== RENDER =====
function render(data = {}) {
  const year = new Date().getFullYear();
  
  return `
    <div class="container">
      <section class="ftr-grid">
        <div class="ftr-col">
          <h3 class="ftr-head">
            <svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 3h16v18H4z"/><path d="M8 7h8M8 11h8M8 15h6"/>
            </svg>
            <span>Tradelia AI</span>
          </h3>
          <p>
            Analisi multi-fattore su contesto macro, sentiment e tecnica (orizzonte 3–10 giorni).
          </p>
          <p>
            Materiale esclusivamente informativo e formativo — nessuna raccomandazione personalizzata.
          </p>
          <div class="ftr-quick-links" role="navigation" aria-label="Link rapidi">
            <a href="/index.html" target="_blank" rel="noopener" aria-label="Vai alla homepage">Homepage</a>
            <a href="/archivio.html" target="_blank" rel="noopener" aria-label="Vai all'archivio">Archivio</a>
            <a href="/brokers.html" target="_blank" rel="noopener" aria-label="Vai alla pagina brokers">Brokers</a>
            <a href="/glossario.html" target="_blank" rel="noopener" aria-label="Vai al glossario finanziario">Glossario</a>
          </div>
        </div>

        <div class="ftr-col">
          <h3 class="ftr-head">
            <svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l7 4v6c0 5-3 8-7 10C8 20 5 17 5 12V6l7-4z"/><path d="M12 8v4"/>
            </svg>
            <span>Compliance &amp; Risk</span>
          </h3>
          <ul class="ftr-list">
            <li><strong>Non è consulenza in materia di investimenti</strong> (MiFID II / ESMA / CONSOB)</li>
            <li>Tradelia AI non è un intermediario autorizzato; <strong>non gestisce capitali né esegue ordini</strong></li>
            <li><strong>Rischio di perdita totale o parziale del capitale</strong> — investire comporta rischi</li>
            <li>Le informazioni hanno <strong>scopo puramente informativo e formativo</strong> — non costituiscono raccomandazione personalizzata</li>
          </ul>
          <div style="margin-top: var(--sp-4); display: flex; flex-wrap: wrap; gap: var(--sp-4);" role="group" aria-label="Documenti legali">
            <button id="btn-privacy-open" class="btn btn-sm" type="button" aria-label="Apri informativa privacy">Privacy</button>
            <button id="btn-mifid-open" class="btn btn-sm" type="button" aria-label="Apri informativa MiFID">Informativa MiFID</button>
          </div>
        </div>

        <div class="ftr-col">
          <h3 class="ftr-head">
            <svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h16"/><path d="M12 4l8 8-8 8"/>
            </svg>
            <span>Canali ufficiali</span>
          </h3>
          <p style="margin-bottom: var(--sp-3);">Aggiornamenti su metodologia e release:</p>
          <div class="ftr-socials" role="list" aria-label="Canali social ufficiali">
            <a href="https://www.linkedin.com/company/tradelia" target="_blank" rel="noopener noreferrer" aria-label="Visita il profilo LinkedIn di Tradelia AI (si apre in nuova scheda)">LinkedIn</a>
            <a href="https://x.com/tradelia_ai" target="_blank" rel="noopener noreferrer" aria-label="Visita il profilo X (Twitter) di Tradelia AI (si apre in nuova scheda)">X (Twitter)</a>
            <a href="https://www.reddit.com/r/TradeliaAI" target="_blank" rel="noopener noreferrer" aria-label="Visita il subreddit Tradelia AI (si apre in nuova scheda)">Reddit</a>
            <a href="https://www.quora.com" target="_blank" rel="noopener noreferrer" aria-label="Visita il profilo Quora di Tradelia AI (si apre in nuova scheda)">Quora</a>
          </div>
        </div>
      </section>

      <div class="ftr-bottom">
        <div>
          <p style="margin: 0;">
            © <span id="footer-year">${year}</span>
            <span class="brand brand--sm">
              <span class="brand-word">Tradelia</span>
              <span class="brand-dot" aria-hidden="true"></span>
              <span class="brand-suffix">AI</span>
            </span>
            · Tutti i diritti riservati
          </p>
          <p style="margin: var(--sp-2) 0 0 0;">
            <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>
          </p>
        </div>
        <div>
          <p style="margin: 0; text-align: right;">
            <span id="footer-company">—</span> · <span id="footer-version">—</span>
          </p>
          <p style="margin: var(--sp-2) 0 0 0; text-align: right; font-size: var(--fs-12);">
            <span id="footer-snapshot">—</span> · <span id="footer-updated">—</span>
          </p>
        </div>
      </div>
    </div>
  `;
}

// ===== MOUNT =====
function mount(containerEl) {
  if (!containerEl) {
    Logger.error('SiteFooter', 'mount: containerEl non fornito');
    return null;
  }
  
  if (FOOTER._node) {
    Logger.warn('SiteFooter', 'Footer già montato');
    return FOOTER._node;
  }
  
  const node = createEl('footer', 'site-footer py-10');
  node.innerHTML = render();
  
  containerEl.appendChild(node);
  
  FOOTER._node = node;
  FOOTER._container = containerEl;
  
  Logger.debug('SiteFooter', 'Footer montato');
  return node;
}

// ===== UPDATE =====
function update(data = {}) {
  if (!FOOTER._node) {
    Logger.warn('SiteFooter', 'update: footer non montato');
    return;
  }
  
  // Estrai dati da header.json (se disponibili)
  const extractMetric = (key) => {
    if (!data?.rows) return null;
    for (const row of data.rows || []) {
      for (const part of row.parts || []) {
        if (part.kind === 'metric' && part.key === key) {
          return part.value;
        }
      }
    }
    return null;
  };
  
  const companyName = extractMetric('CompanyName');
  const ticker = extractMetric('Ticker');
  const version = extractMetric('Version') || data?.meta?.version || '—';
  const start = extractMetric('Start');
  const end = extractMetric('End');
  const updatedAt = extractMetric('UpdatedAt');
  
  // Aggiorna elementi dinamici
  setText('footer-year', new Date().getFullYear());
  setText('footer-company', companyName || ticker || '—');
  setText('footer-version', version);
  setText('footer-snapshot', `${start || '—'} → ${end || '—'}`);
  setText('footer-updated', fmtDate(updatedAt));
  
  Logger.debug('SiteFooter', 'Footer aggiornato');
}

// ===== PUBLIC API =====
export const siteFooter = {
  mount,
  update
};

// Esponi globalmente per aggiornamenti dinamici
if (typeof window !== 'undefined') {
  window.__TradeliaFooter = { update };
}

