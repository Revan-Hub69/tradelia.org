// /report/assets/js/app.js
// Orchestratore runtime Tradelia AI - Versione 3.0 (DA ZERO, senza runtime)
// - Carica header.json e monta HeaderTicker
// - Carica manifest.json e monta moduli F*
// - Nessun runtime complesso
// - Solo metriche colorate inline

import Logger from './utils/logger.js';
import { metricPopup } from './components/metric-popup.js';

(function() {
  'use strict';
  
  const ROOT = document.getElementById('app-root');
  const TICKER_SLOT = document.getElementById('header-ticker-slot');
  const HEADER_SLOT = document.getElementById('site-header-slot');
  const FOOTER_SLOT = document.getElementById('site-footer-slot');
  
  if (!ROOT || !TICKER_SLOT) {
    Logger.error('App', 'DOM non valido');
    return;
  }
  
  let __versionQS = '';
  let __header = null;
  
  // ===== ERROR STATES =====
  function showErrorState(container, error, title = 'Errore di caricamento') {
    const message = error?.message || 'Si è verificato un errore temporaneo.';
    container.innerHTML = `
      <div class="error-state">
        <div class="error-state-title">${escapeHtml(title)}</div>
        <div class="error-state-message">${escapeHtml(message)}</div>
        <button class="btn btn-sm" onclick="location.reload()">Ricarica pagina</button>
      </div>
    `;
  }
  
  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }
  
  // ===== UTILITIES =====
  async function fetchJSON(path) {
    try {
      const url = path + __versionQS;
      Logger.debug('App', `Fetching: ${url}`);
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
      const data = await res.json();
      if (!data || typeof data !== 'object') throw new Error(`Invalid JSON: ${path}`);
      return data;
    } catch (err) {
      Logger.error('App', `Errore fetch ${path}`, err);
      throw err;
    }
  }
  
  async function safeImport(path) {
    try {
      return await import(path + __versionQS);
    } catch (err) {
      Logger.error('App', `Errore import ${path}`, err);
      throw err;
    }
  }
  
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val ?? '—';
  }
  
  function fmtDate(str) {
    if (!str) return '—';
    try {
      return new Date(str).toLocaleDateString('it-IT');
    } catch {
      return String(str);
    }
  }
  
  function getReportId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'sample-id';
  }
  
  // ===== META TAGS DINAMICI =====
  function updateMetaTags(ticker, companyName, version) {
    const title = `Framework Accademico AI, Tradelia Swing Master 5.0 · ${ticker}`;
    const description = `Analisi multi-fattore su ${companyName} (${ticker}) - Contesto macro, sentiment e tecnica (orizzonte 3–10 giorni)`;
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const imageUrl = `${window.location.origin}/img/tradelia_og_vC_white_clean.png`;
    const imageAlt = `${companyName} (${ticker}) - Analisi Tradelia AI`;
    
    // Update title
    document.title = title;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = description;
    
    // Update Open Graph
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:url', url);
    updateMetaProperty('og:image', imageUrl);
    updateMetaProperty('og:image:alt', imageAlt);
    
    // Update Twitter Card
    updateMetaName('twitter:title', title);
    updateMetaName('twitter:description', description);
    updateMetaName('twitter:url', url);
    updateMetaName('twitter:image', imageUrl);
    updateMetaName('twitter:image:alt', imageAlt);
  }
  
  function updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
  
  function updateMetaName(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }
  
  // ===== STRUCTURED DATA DINAMICO =====
  function updateStructuredData(ticker, companyName, version, start, end) {
    const structuredDataScript = document.getElementById('structured-data');
    if (!structuredDataScript) return;
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": `${companyName} (${ticker}) - Analisi Tradelia AI`,
      "description": `Framework Accademico AI per analisi finanziaria multi-fattore su ${companyName} (${ticker})`,
      "provider": {
        "@type": "Organization",
        "name": "Tradelia AI",
        "url": "https://tradelia.org"
      },
      "additionalType": "https://schema.org/InvestmentOrDeposit",
      "category": "Analisi Finanziaria",
      "applicationCategory": "FinanceApplication",
      "version": version || undefined,
      ...(start && end ? {
        "validFrom": start,
        "validThrough": end
      } : {})
    };
    
    structuredDataScript.textContent = JSON.stringify(structuredData, null, 2);
  }
  
  // ===== HEADER TICKER =====
  async function mountHeaderTicker(headerData) {
    if (!headerData || typeof headerData !== 'object') {
      showErrorState(TICKER_SLOT, new Error('Dati header non validi'), 'Dati non disponibili');
      return;
    }
    
    try {
      const { headerTicker } = await safeImport('/report/assets/js/components/header-ticker.js');
      
      if (!headerTicker || typeof headerTicker.mount !== 'function') {
        throw new Error('headerTicker.mount non disponibile');
      }
      
      const node = headerTicker.mount(TICKER_SLOT);
      if (!node) {
        throw new Error('headerTicker.mount ha restituito null');
      }
      
      await headerTicker.update(node, headerData);
      Logger.debug('App', 'Header ticker montato');
    } catch (err) {
      Logger.error('App', 'Errore montaggio header ticker', err);
      showErrorState(TICKER_SLOT, err, 'Errore caricamento metriche');
    }
  }
  
  // ===== CARICAMENTO HEADER =====
  async function loadHeader(reportId) {
    try {
      const headerPath = `/report/reports/${reportId}/header.json`;
      const header = await fetchJSON(headerPath);
      
      const hasRows = Array.isArray(header?.rows) && header.rows.length > 0;
      const hasLegacy = header?.Ticker || header?.CompanyName;
      
      if (!hasRows && !hasLegacy) {
        throw new Error('Header senza dati validi');
      }
      
      __header = header;
      
      // Estrai valori dalle metriche nelle rows
      const extractMetric = (key) => {
        for (const row of header.rows || []) {
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
      const version = extractMetric('Version') || header?.meta?.version || '—';
      const start = extractMetric('Start');
      const end = extractMetric('End');
      const updatedAt = extractMetric('UpdatedAt');
      
      __versionQS = version && version !== '—' ? `?v=${encodeURIComponent(version)}` : '';
      
      if (ticker) {
        document.title = `Framework Accademico AI, Tradelia Swing Master 5.0 · ${ticker}`;
        
        // Aggiorna meta tags dinamici per SEO e social sharing
        updateMetaTags(ticker, companyName || ticker, version);
        
        // Aggiorna structured data dinamico
        updateStructuredData(ticker, companyName || ticker, version, start, end);
      }
      
      await mountHeaderTicker(header);
      
      // Aggiorna footer se già montato
      if (FOOTER_SLOT && window.__TradeliaFooter) {
        window.__TradeliaFooter.update(header);
      }
      Logger.debug('App', 'Header caricato');
      return header;
    } catch (err) {
      Logger.error('App', 'Errore caricamento header', err);
      showErrorState(TICKER_SLOT, err, 'Errore caricamento dati');
      return null;
    }
  }
  
  // ===== CARICAMENTO MODULI =====
  async function loadModules(reportId) {
    // Tutti i moduli sono placeholder (da rifare da zero)
    // Carica tutti i moduli dal manifest, con fallback a placeholder se mancanti
    let manifest = { order: ['F1', 'F1B', 'F2', 'F3', 'F3O', 'F4', 'F5', 'F5B', 'F6', 'F7'] };
    
    try {
      const m = await fetchJSON(`/report/reports/${reportId}/manifest.json`);
      if (Array.isArray(m?.order) && m.order.length) {
        manifest = { order: m.order };
      }
    } catch (err) {
      Logger.warn('App', 'Manifest non trovato, uso default', err);
    }
    
    Logger.debug('App', `Montaggio ${manifest.order.length} moduli`);
    
    let loadedCount = 0;
    const totalModules = manifest.order.length;
    
    for (const modId of manifest.order) {
      const idLower = String(modId).toLowerCase();
      const jsonPath = `/report/reports/${reportId}/${idLower}.json`;
      const modPath = `/report/assets/js/modules/${idLower}.js`;
      
      try {
        // Carica JSON (fallback a oggetto vuoto se mancante)
        let json = {};
        try {
          json = await fetchJSON(jsonPath);
          // Se JSON non esiste o è vuoto, salta questo modulo
          if (!json || Object.keys(json).length === 0 || json._placeholder) {
            Logger.debug('App', `Modulo ${modId}: JSON non disponibile, salto`);
            continue;
          }
        } catch (jsonErr) {
          Logger.debug('App', `Modulo ${modId}: JSON non trovato, salto`, jsonErr);
          continue; // Salta se JSON non esiste (montaggio dinamico)
        }
        
        // Carica modulo (fallback a placeholder se mancante)
        let mod;
        try {
          mod = await safeImport(modPath);
        } catch (modErr) {
          Logger.warn('App', `Modulo ${modPath} non trovato, uso placeholder`, modErr);
          // Importa placeholder generico
          const placeholderModule = await safeImport('/report/assets/js/modules/_placeholder.js');
          mod = placeholderModule;
        }
        
        if (typeof mod.renderCard !== 'function') {
          Logger.warn('App', `Modulo ${modId}: renderCard non disponibile, uso placeholder`);
          const placeholderModule = await safeImport('/report/assets/js/modules/_placeholder.js');
          mod = placeholderModule;
        }
        
        const cardHTML = mod.renderCard(json, { reportId, modId, header: __header });
        const wrap = document.createElement('article');
        wrap.id = `sec-${idLower}`;
        wrap.className = 'report-section-block mb-8';
        wrap.innerHTML = cardHTML;
        ROOT.appendChild(wrap);
        
        if (typeof mod.bindCard === 'function') {
          try {
            mod.bindCard(wrap, json, { reportId, modId, header: __header });
          } catch (err) {
            Logger.warn('App', `Modulo ${modId}: errore bindCard`, err);
            // Error boundary: mostra errore nel modulo ma continua
            const errorEl = document.createElement('div');
            errorEl.className = 'error-state';
            errorEl.innerHTML = `
              <div class="error-state-title">Errore nel modulo ${modId}</div>
              <div class="error-state-message">${escapeHtml(err.message)}</div>
            `;
            wrap.appendChild(errorEl);
          }
        }
        
        loadedCount++;
        Logger.debug('App', `Modulo ${modId} montato (${loadedCount}/${totalModules})`);
      } catch (err) {
        Logger.warn('App', `Modulo ${modId} non caricato`, err);
        // Error boundary: mostra errore ma continua con altri moduli
        const errorWrap = document.createElement('article');
        errorWrap.id = `sec-${idLower}-error`;
        errorWrap.className = 'report-section-block mb-8';
        showErrorState(errorWrap, err, `Errore caricamento ${modId}`);
        ROOT.appendChild(errorWrap);
        continue;
      }
    }
  }
  
  // ===== MOUNT HEADER & FOOTER =====
  async function mountSiteHeader() {
    if (!HEADER_SLOT) {
      Logger.warn('App', 'Header slot non trovato, skip');
      return;
    }
    
    try {
      const { siteHeader } = await safeImport('/report/assets/js/components/site-header.js');
      if (siteHeader && typeof siteHeader.mount === 'function') {
        siteHeader.mount(HEADER_SLOT);
        Logger.debug('App', 'Site header montato');
      }
    } catch (err) {
      Logger.warn('App', 'Errore montaggio site header', err);
    }
  }
  
  async function mountSiteFooter(headerData) {
    if (!FOOTER_SLOT) {
      Logger.warn('App', 'Footer slot non trovato, skip');
      return;
    }
    
    try {
      const { siteFooter } = await safeImport('/report/assets/js/components/site-footer.js');
      if (siteFooter && typeof siteFooter.mount === 'function') {
        siteFooter.mount(FOOTER_SLOT);
        // Aggiorna footer con dati da header.json
        if (headerData) {
          siteFooter.update(headerData);
        }
        Logger.debug('App', 'Site footer montato');
      }
    } catch (err) {
      Logger.warn('App', 'Errore montaggio site footer', err);
    }
  }
  
  // ===== INIZIALIZZAZIONE =====
  async function init() {
    const reportId = getReportId();
    Logger.debug('App', `Inizializzazione: ${reportId}`);
    
    // Monta header (statico, non dipende da reportId)
    await mountSiteHeader();
    
    ROOT.innerHTML = '';
    
    // Error boundary globale per inizializzazione
    let headerData = null;
    try {
      headerData = await loadHeader(reportId);
    } catch (err) {
      Logger.error('App', 'Errore loadHeader', err);
      showErrorState(TICKER_SLOT, err, 'Errore caricamento header');
      // Continua comunque con i moduli
    }
    
    try {
      await loadModules(reportId);
    } catch (err) {
      Logger.error('App', 'Errore loadModules', err);
      // Se ROOT è vuoto, mostra errore globale
      if (!ROOT.innerHTML) {
        showErrorState(ROOT, err, 'Errore caricamento moduli');
      }
    }
    
    // Monta footer DOPO il contenuto (con dati dinamici)
    await mountSiteFooter(headerData);
    
    Logger.debug('App', 'Inizializzazione completata');
  }
  
  // ===== AVVIO =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // ===== EXPOSE UI API =====
  window.__TradeliaUI = {
    openMetricPopup: (metricKey, allMetrics = []) => {
      metricPopup.open(metricKey, allMetrics);
    },
    closeMetricPopup: () => {
      metricPopup.close();
    },
    bindMetricInfoButtons: (container) => {
      // Trova tutti i pulsanti info-btn con data-metric e collega al glossario
      if (!container) return;
      
      const infoButtons = container.querySelectorAll('.info-btn[data-metric]');
      infoButtons.forEach(btn => {
        // Rimuovi listener esistenti per evitare duplicati
        const newBtn = btn.cloneNode(true);
        btn.parentNode?.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const metricKey = newBtn.getAttribute('data-metric');
          if (!metricKey) return;
          
          // Rimuovi suffisso "_info" se presente
          const cleanKey = metricKey.replace(/_info$/, '');
          
          // Apri drawer glossario (stesso sistema di glossario.html)
          try {
            const { glossaryPopup } = await import('./components/glossary-popup.js');
            if (glossaryPopup && glossaryPopup.openTerm) {
              await glossaryPopup.openTerm(cleanKey);
            }
          } catch (err) {
            Logger.warn('App', 'Errore apertura drawer glossario', err);
          }
        });
      });
      
      Logger.debug('App', `Collegati ${infoButtons.length} pulsanti metriche al glossario`);
    }
  };
  
  window.TradeliaApp = {
    init,
    getReportId,
    loadHeader,
    loadModules
  };
})();
