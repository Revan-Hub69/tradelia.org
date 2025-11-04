// /report/assets/js/app.js
// Orchestratore runtime Tradelia AI - Versione 3.0 (DA ZERO, senza runtime)
// - Carica header.json e monta HeaderTicker
// - Carica manifest.json e monta moduli F*
// - Nessun runtime complesso
// - Solo metriche colorate inline

import Logger from './utils/logger.js';

(function() {
  'use strict';
  
  const ROOT = document.getElementById('app-root');
  const TICKER_SLOT = document.getElementById('header-ticker-slot');
  
  if (!ROOT || !TICKER_SLOT) {
    Logger.error('App', 'DOM non valido');
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
  
  // ===== HEADER TICKER =====
  async function mountHeaderTicker(headerData) {
    if (!headerData || typeof headerData !== 'object') {
      TICKER_SLOT.innerHTML = `
        <div style="padding: 1rem; background: #1e2535; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: #94a3b8; font-size: 13px;">
          ⚠️ Dati header non validi
        </div>
      `;
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
      TICKER_SLOT.innerHTML = `
        <div style="padding: 1rem; background: #1e2535; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: #94a3b8; font-size: 13px;">
          ⚠️ Errore: ${err.message}
        </div>
      `;
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
      }
      
      setText('footer-company', companyName || ticker || '—');
      setText('footer-version', version);
      setText('footer-snapshot', `${start || '—'} → ${end || '—'}`);
      setText('footer-updated', fmtDate(updatedAt));
      
      await mountHeaderTicker(header);
      Logger.debug('App', 'Header caricato');
      return header;
    } catch (err) {
      Logger.error('App', 'Errore caricamento header', err);
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
        
        Logger.debug('App', `Modulo ${modId} montato`);
      } catch (err) {
        Logger.warn('App', `Modulo ${modId} non caricato`, err);
        continue;
      }
    }
  }
  
  // ===== INIZIALIZZAZIONE =====
  async function init() {
    const reportId = getReportId();
    Logger.debug('App', `Inizializzazione: ${reportId}`);
    
    ROOT.innerHTML = '';
    
    try {
      await loadHeader(reportId);
    } catch (err) {
      Logger.error('App', 'Errore loadHeader', err);
    }
    
    try {
      await loadModules(reportId);
    } catch (err) {
      Logger.error('App', 'Errore loadModules', err);
    }
    
    Logger.debug('App', 'Inizializzazione completata');
  }
  
  // ===== AVVIO =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.TradeliaApp = {
    init,
    getReportId,
    loadHeader,
    loadModules
  };
})();
