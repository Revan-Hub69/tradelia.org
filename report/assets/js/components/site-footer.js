// /report/assets/js/components/site-footer.js
// Componente Footer principale - Coerente con architettura modulare
// Legge dati dinamici da header.json

import Logger from '../utils/logger.js';
import { i18n } from '../utils/i18n.js';

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
            Tradelia AI produce approfondimenti didattici sui mercati con framework accademico,
            deck proprietari SRD/MTB e ensemble multi-LLM controllato.
          </p>
          <div class="ftr-quick-links" role="navigation" aria-label="Link rapidi">
            <a href="/index.html" aria-label="Vai alla homepage" data-i18n="nav.home">Homepage</a>
            <a href="/dashboard.html" aria-label="Vai alla dashboard abbonati" data-i18n="nav.dashboard">Dashboard</a>
            <!-- Tutorial temporaneamente rimosso -->
            <a href="/pricing.html" aria-label="Vai alla pagina prezzi" data-i18n="nav.pricing">Pricing</a>
            <a href="/brokers.html" aria-label="Vai alla pagina brokers" data-i18n="nav.brokers">Brokers</a>
            <a href="/glossario.html" aria-label="Vai al glossario finanziario" data-i18n="nav.glossary">Glossario</a>
          </div>
        </div>

        <div class="ftr-col">
          <h3 class="ftr-head">
            <svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2l7 4v6c0 5-3 8-7 10C8 20 5 17 5 12V6l7-4z"/><path d="M12 8v4"/>
            </svg>
            <span data-i18n="footer.legal.title">Compliance &amp; Risk</span>
          </h3>
          <ul class="ftr-list">
            <li data-i18n="footer.legal.disclaimer1"><strong>Non è consulenza in materia di investimenti</strong> (MiFID II / ESMA / CONSOB)</li>
            <li data-i18n="footer.legal.disclaimer2">Tradelia AI non è un intermediario autorizzato; <strong>non gestisce capitali né esegue ordini</strong></li>
            <li data-i18n="footer.legal.disclaimer3"><strong>Rischio di perdita totale o parziale del capitale</strong> — investire comporta rischi</li>
            <li data-i18n="footer.legal.disclaimer4">Le informazioni hanno <strong>scopo puramente informativo e formativo</strong> — non costituiscono raccomandazione personalizzata</li>
          </ul>
          <div class="ftr-quick-links" role="navigation" aria-label="Documenti legali" style="margin-top: var(--sp-4);">
            <a href="/privacy.html" aria-label="Vai alla privacy policy" data-i18n="nav.privacy">Privacy Policy</a>
            <a href="/terms.html" aria-label="Vai ai termini e condizioni" data-i18n="nav.terms">Termini e Condizioni</a>
            <a href="/refund.html" aria-label="Vai alla policy di rimborso" data-i18n="nav.refund">Policy di Rimborso</a>
          </div>
          <div style="margin-top: var(--sp-3);">
            <button id="btn-privacy-open" class="btn btn-sm" type="button" aria-label="Apri informativa privacy" data-i18n="nav.privacy">Privacy</button>
            <button id="btn-mifid-open" class="btn btn-sm" type="button" aria-label="Apri informativa MiFID" data-i18n="mifid.banner.mifid">Informativa MiFID</button>
          </div>
        </div>

        <div class="ftr-col">
          <h3 class="ftr-head">
            <svg class="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h16"/><path d="M12 4l8 8-8 8"/>
            </svg>
            <span data-i18n="footer.social.title">Canali ufficiali</span>
          </h3>
          <p style="margin-bottom: var(--sp-3);" data-i18n="footer.social.subtitle">Aggiornamenti su metodologia e release:</p>
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
            · <span data-i18n="footer.copyright">Tutti i diritti riservati</span>
          </p>
          <p style="margin: var(--sp-2) 0 0 0;">
            <a href="mailto:info@tradelia.org" class="mail-link">info@tradelia.org</a>
          </p>
        </div>
        <div>
          <p style="margin: 0; text-align: right; display: none;" id="footer-company-version-container">
            <span id="footer-company">—</span> · <span id="footer-version">—</span>
          </p>
          <p style="margin: var(--sp-2) 0 0 0; text-align: right; font-size: var(--fs-12); display: none;" id="footer-snapshot-container">
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
  
  // Bind event listeners per MiFID/Privacy (stesso sistema di index.html)
  bindLegalButtons();
  
  // Sistema traduzione disabilitato - sempre italiano
  
  // Chiama update con dati vuoti per nascondere i campi dinamici di default
  // (verranno mostrati solo quando update() viene chiamata con dati reali)
  setTimeout(() => {
    update({});
  }, 0);
  
  Logger.debug('SiteFooter', 'Footer montato');
  return node;
}

// ===== LEGAL BUTTONS BINDING =====
function bindLegalButtons() {
  // Usa setTimeout per assicurarsi che l'overlay legale sia già nel DOM
  setTimeout(() => {
    // Cerca overlay legale (deve esistere in index.html)
    const overlay = document.getElementById('legal-consent-overlay');
    if (!overlay) {
      Logger.warn('SiteFooter', 'Overlay legale non trovato');
      return;
    }
    
    const btnAccept = document.getElementById('btn-accept-legal');
    const tabM = document.getElementById('tab-mifid');
    const tabP = document.getElementById('tab-privacy');
    const panelM = document.getElementById('panel-mifid');
    const panelP = document.getElementById('panel-privacy');
    
    if (!tabM || !tabP || !panelM || !panelP) {
      Logger.warn('SiteFooter', 'Elementi legali non trovati');
      return;
    }
    
    function showTab(which) {
      const mifid = (which === 'mifid');
      if (tabM) tabM.setAttribute('aria-selected', mifid ? 'true' : 'false');
      if (tabP) tabP.setAttribute('aria-selected', mifid ? 'false' : 'true');
      if (panelM) panelM.hidden = !mifid;
      if (panelP) panelP.hidden = mifid;
    }
    
    function openLegal(which = 'mifid', blocking = true) {
      showTab(which);
      if (overlay) {
        overlay.hidden = false;
        document.body.style.overflow = 'hidden';
        if (blocking) overlay.setAttribute('data-blocking', 'true');
        else overlay.removeAttribute('data-blocking');
        setTimeout(() => {
          const targetTab = which === 'privacy' ? tabP : tabM;
          if (targetTab) targetTab.focus();
        }, 0);
      }
    }
    
    function closeLegal() {
      if (overlay) {
        overlay.hidden = true;
        document.body.style.overflow = '';
      }
    }
    
    // Bind pulsanti footer (rimuovi listener esistenti per evitare duplicati)
    const btnPrivacy = document.getElementById('btn-privacy-open');
    const btnMifid = document.getElementById('btn-mifid-open');
    
    if (btnPrivacy) {
      // Rimuovi listener esistenti
      const newBtnPrivacy = btnPrivacy.cloneNode(true);
      btnPrivacy.parentNode?.replaceChild(newBtnPrivacy, btnPrivacy);
      newBtnPrivacy.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLegal('privacy', false);
      });
    }
    
    if (btnMifid) {
      // Rimuovi listener esistenti
      const newBtnMifid = btnMifid.cloneNode(true);
      btnMifid.parentNode?.replaceChild(newBtnMifid, btnMifid);
      newBtnMifid.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openLegal('mifid', false);
      });
    }
    
    Logger.debug('SiteFooter', 'Pulsanti legali collegati');
  }, 100);
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
  const version = extractMetric('Version') || data?.meta?.version || null;
  const start = extractMetric('Start');
  const end = extractMetric('End');
  const updatedAt = extractMetric('UpdatedAt');
  
  // Aggiorna elementi dinamici
  setText('footer-year', new Date().getFullYear());
  
  // Mostra/nascondi campi dinamici solo se ci sono dati (solo nei report)
  const hasReportData = companyName || ticker || version || start || end || updatedAt;
  
  // Footer company/version (solo se ci sono dati)
  const footerCompanyVersionContainer = document.getElementById('footer-company-version-container');
  
  if (footerCompanyVersionContainer) {
    if (hasReportData && (companyName || ticker || version)) {
      footerCompanyVersionContainer.style.display = '';
      setText('footer-company', companyName || ticker || '—');
      setText('footer-version', version || '—');
    } else {
      footerCompanyVersionContainer.style.display = 'none';
    }
  }
  
  // Footer snapshot/updated (solo se ci sono dati)
  const footerSnapshotContainer = document.getElementById('footer-snapshot-container');
  
  if (footerSnapshotContainer) {
    if (hasReportData && (start || end || updatedAt)) {
      footerSnapshotContainer.style.display = '';
      setText('footer-snapshot', start && end ? `${start} → ${end}` : '—');
      setText('footer-updated', fmtDate(updatedAt));
    } else {
      footerSnapshotContainer.style.display = 'none';
    }
  }
  
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

