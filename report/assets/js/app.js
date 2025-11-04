// /report/assets/js/app.js
// Orchestratore runtime Tradelia AI - Versione 2.0 (Semplificata e Robusta)
// - Carica header.json e monta HeaderTicker
// - Carica manifest.json e monta i moduli F*
// - Gestione errori robusta
// - Usa Logger centralizzato

import Logger from './utils/logger.js';

(function() {
  'use strict';
  
  // ===== CONFIGURAZIONE =====
  const ROOT = document.getElementById('app-root');
  const TICKER_SLOT = document.getElementById('header-ticker-slot');
  
  if (!ROOT) {
    Logger.error('App', 'app-root non trovato nel DOM');
    return;
  }
  
  if (!TICKER_SLOT) {
    Logger.error('App', 'header-ticker-slot non trovato nel DOM');
    return;
  }
  
  let __versionQS = '';
  let __header = null;
  
  // ===== UTILITIES =====
  async function fetchJSON(path) {
    try {
      const url = path + __versionQS;
      Logger.debug('App', `Fetching: ${url}`);
      
      const res = await fetch(url, { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${path}`);
      }
      
      const data = await res.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error(`Invalid JSON: ${path}`);
      }
      
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
  
  // ===== HEADER TICKER =====
  async function mountHeaderTicker(headerData) {
    if (!headerData || typeof headerData !== 'object') {
      Logger.warn('App', 'Header data non valido');
      showTickerError('Dati header non validi');
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
      
      Logger.debug('App', 'Header ticker montato con successo');
    } catch (err) {
      Logger.error('App', 'Errore montaggio header ticker', err);
      showTickerError(`Errore: ${err.message}`);
    }
  }
  
  function showTickerError(message) {
    TICKER_SLOT.innerHTML = `
      <div style="padding: 1rem; background: var(--surface-card); border: 1px solid var(--br-card); border-radius: var(--radius-card); color: var(--muted);">
        <div style="font-size: 13px;">⚠️ ${message}</div>
        <div style="font-size: 11px; margin-top: 0.5rem; opacity: 0.8;">Report ID: ${getReportId()}</div>
      </div>
    `;
  }
  
  // ===== CARICAMENTO HEADER =====
  async function loadHeader(reportId) {
    try {
      const headerPath = `/report/reports/${reportId}/header.json`;
      Logger.debug('App', `Caricamento header: ${headerPath}`);
      
      const header = await fetchJSON(headerPath);
      
      // Validazione base
      const hasRows = Array.isArray(header?.rows) && header.rows.length > 0;
      const hasLegacy = header?.Ticker || header?.CompanyName;
      
      if (!hasRows && !hasLegacy) {
        throw new Error('Header senza dati validi');
      }
      
      __header = header;
      
      // Cache-buster
      __versionQS = header?.Version ? `?v=${encodeURIComponent(header.Version)}` : '';
      
      // Aggiorna title e footer
      if (header?.Ticker) {
        document.title = `Framework Accademico AI, Tradelia Swing Master 5.0 · ${header.Ticker}`;
      }
      
      setText('footer-company', header?.CompanyName || header?.Ticker || '—');
      setText('footer-version', header?.Version || '—');
      setText('footer-snapshot', `${header?.Start ?? '—'} → ${header?.End ?? '—'}`);
      setText('footer-updated', fmtDate(header?.UpdatedAt));
      
      // Monta header ticker
      await mountHeaderTicker(header);
      
      Logger.debug('App', 'Header caricato con successo');
      return header;
    } catch (err) {
      Logger.error('App', 'Errore caricamento header', err);
      showTickerError(`Errore caricamento header: ${err.message}`);
      __versionQS = '';
      return null;
    }
  }
  
  // ===== CARICAMENTO MODULI =====
  async function loadModules(reportId) {
    let manifest = { order: ['F4', 'F5', 'F5B', 'F6'] };
    
    try {
      const m = await fetchJSON(`/report/reports/${reportId}/manifest.json`);
      if (Array.isArray(m?.order) && m.order.length) {
        const excluded = new Set(['f1b', 'f2', 'f3o', 'f3']);
        const filtered = m.order
          .map(id => String(id).trim())
          .filter(Boolean)
          .filter(id => !excluded.has(id.toLowerCase()));
        
        if (filtered.length) {
          manifest = { order: filtered };
        }
      }
    } catch (err) {
      Logger.warn('App', 'Manifest non trovato, uso default', err);
    }
    
    Logger.debug('App', `Montaggio ${manifest.order.length} moduli`);
    
    for (const modId of manifest.order) {
      const idLower = String(modId).toLowerCase();
      const jsonPath = `/report/reports/${reportId}/${idLower}.json`;
      const modPath = `/report/assets/js/modules/${idLower}.js`;
      
      try {
        const json = await fetchJSON(jsonPath);
        const mod = await safeImport(modPath);
        
        if (typeof mod.renderCard !== 'function') {
          Logger.warn('App', `Modulo ${modId}: renderCard non disponibile`);
          continue;
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
          }
        }
        
        // Tooltip metriche
        try {
          window.__TradeliaUI?.bindMetricInfoButtons?.(wrap);
        } catch (err) {
          Logger.debug('App', `Modulo ${modId}: errore bindMetricInfoButtons`, err);
        }
        
        Logger.debug('App', `Modulo ${modId} montato con successo`);
      } catch (err) {
        Logger.warn('App', `Modulo ${modId} non caricato`, err);
        continue;
      }
    }
  }
  
  // ===== INIZIALIZZAZIONE =====
  async function init() {
    const reportId = getReportId();
    Logger.debug('App', `Inizializzazione report: ${reportId}`);
    
    // Pulisci root
    ROOT.innerHTML = '';
    
    try {
      // Carica header (non blocca se fallisce)
      await loadHeader(reportId);
    } catch (err) {
      Logger.error('App', 'Errore critico loadHeader', err);
    }
    
    try {
      // Carica moduli (non blocca se fallisce)
      await loadModules(reportId);
    } catch (err) {
      Logger.error('App', 'Errore critico loadModules', err);
    }
    
    Logger.debug('App', 'Inizializzazione completata');
  }
  
  // ===== AVVIO =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // API pubblica
  window.TradeliaApp = {
    init,
    getReportId,
    mountHeaderTicker,
    loadHeader,
    loadModules
  };
})();
