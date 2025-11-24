// /report/assets/js/utils/export.js
// Sistema Export Dati - CSV, JSON, PDF
// Versione 2025

import Logger from './logger.js';
import { i18n } from './i18n.js';

// ===== EXPORT CSV =====
function exportToCSV(data, filename = 'report') {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      Logger.warn('Export', 'Nessun dato da esportare');
      return false;
    }

    // Headers (prima riga)
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',');

    // Rows
    const csvRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          if (value == null) {return '""';}
          const str = String(value).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',');
    });

    // CSV completo
    const csv = [csvHeaders, ...csvRows].join('\n');

    // BOM per Excel UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

    // Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Logger.debug('Export', `CSV esportato: ${filename}`);
    return true;
  } catch (err) {
    Logger.error('Export', 'Errore export CSV', err);
    return false;
  }
}

// ===== EXPORT JSON =====
function exportToJSON(data, filename = 'report') {
  try {
    if (!data) {
      Logger.warn('Export', 'Nessun dato da esportare');
      return false;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Logger.debug('Export', `JSON esportato: ${filename}`);
    return true;
  } catch (err) {
    Logger.error('Export', 'Errore export JSON', err);
    return false;
  }
}

// ===== EXPORT PDF (Base - usando window.print) =====
function exportToPDF(filename = 'report') {
  try {
    // Salva titolo originale
    const originalTitle = document.title;

    // Aggiorna titolo per stampa
    document.title = `${filename} - ${new Date().toISOString().split('T')[0]}`;

    // Trigger stampa
    window.print();

    // Ripristina titolo
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);

    Logger.debug('Export', `PDF esportato: ${filename}`);
    return true;
  } catch (err) {
    Logger.error('Export', 'Errore export PDF', err);
    return false;
  }
}

// ===== ESTRAI DATI DA MODULI =====
function extractModuleData(moduleElement) {
  if (!moduleElement) {return null;}

  const moduleId = moduleElement.id || '';
  const moduleTitle = moduleElement.querySelector('.module-title')?.textContent || '';
  const moduleDesc = moduleElement.querySelector('.module-desc')?.textContent || '';
  const moduleStatus = moduleElement.getAttribute('data-state') || '';

  // Estrai metriche
  const metrics = [];
  const metricElements = moduleElement.querySelectorAll('.metric-inline');
  metricElements.forEach((metricEl) => {
    const key = metricEl.getAttribute('data-metric') || '';
    const value = metricEl.querySelector('.metric-inline-text')?.textContent || '';
    const tone = metricEl.classList.contains('metric-inline--ok')
      ? 'ok'
      : metricEl.classList.contains('metric-inline--warn')
        ? 'warn'
        : metricEl.classList.contains('metric-inline--err')
          ? 'err'
          : 'neutral';

    metrics.push({ key, value, tone });
  });

  // Estrai righe header-ticker (AI summary)
  const aiSummaryRows = [];
  const tickerRows = moduleElement.querySelectorAll(
    '[data-ai-summary-ticker="true"] .header-ticker-row'
  );
  tickerRows.forEach((row) => {
    const text = row.textContent?.trim() || '';
    if (text) {
      aiSummaryRows.push(text);
    }
  });

  return {
    moduleId,
    moduleTitle,
    moduleDesc,
    moduleStatus,
    metrics,
    aiSummary: aiSummaryRows.join(' '),
    exportedAt: new Date().toISOString(),
  };
}

// ===== ESTRAI TUTTI I DATI REPORT =====
function extractReportData() {
  const modules = [];
  const moduleElements = document.querySelectorAll('.report-section-block, .module-card');

  moduleElements.forEach((moduleEl) => {
    const moduleData = extractModuleData(moduleEl);
    if (moduleData) {
      modules.push(moduleData);
    }
  });

  // Estrai header data
  const headerTicker = document.querySelector('#header-ticker-slot .header-ticker');
  const headerData = {};
  if (headerTicker) {
    const tickerRows = headerTicker.querySelectorAll('.header-ticker-row');
    tickerRows.forEach((row) => {
      const text = row.textContent?.trim() || '';
      if (text) {
        headerData[`row_${row.getAttribute('id') || tickerRows.length}`] = text;
      }
    });
  }

  return {
    reportId: new URLSearchParams(window.location.search).get('id') || 'unknown',
    exportedAt: new Date().toISOString(),
    header: headerData,
    modules,
  };
}

// ===== ESPORTA MODULI SELETTI =====
function exportSelectedModules(moduleIds = [], format = 'json') {
  const allModules = document.querySelectorAll('.report-section-block, .module-card');
  const selectedModules = [];

  allModules.forEach((moduleEl) => {
    const moduleId = moduleEl.id || '';
    if (moduleIds.length === 0 || moduleIds.includes(moduleId)) {
      const moduleData = extractModuleData(moduleEl);
      if (moduleData) {
        selectedModules.push(moduleData);
      }
    }
  });

  if (selectedModules.length === 0) {
    Logger.warn('Export', 'Nessun modulo selezionato');
    return false;
  }

  const reportId = new URLSearchParams(window.location.search).get('id') || 'report';
  const filename = `${reportId}-modules-${selectedModules.length}`;

  if (format === 'csv') {
    // Flatten per CSV
    const csvData = selectedModules.flatMap((module) => {
      return module.metrics.map((metric) => ({
        moduleId: module.moduleId,
        moduleTitle: module.moduleTitle,
        metricKey: metric.key,
        metricValue: metric.value,
        metricTone: metric.tone,
        moduleStatus: module.moduleStatus,
        aiSummary: module.aiSummary,
      }));
    });
    return exportToCSV(csvData, filename);
  } else {
    return exportToJSON(selectedModules, filename);
  }
}

// ===== PUBLIC API =====
export const exportUtils = {
  /**
   * Esporta report completo in JSON
   * @param {string} filename - Nome file (opzionale)
   * @returns {boolean} Successo
   */
  exportReportJSON(filename = null) {
    const data = extractReportData();
    const reportId = filename || new URLSearchParams(window.location.search).get('id') || 'report';
    return exportToJSON(data, reportId);
  },

  /**
   * Esporta metriche in CSV
   * @param {string} filename - Nome file (opzionale)
   * @returns {boolean} Successo
   */
  exportMetricsCSV(filename = null) {
    const allModules = document.querySelectorAll('.report-section-block, .module-card');
    const allMetrics = [];

    allModules.forEach((moduleEl) => {
      const moduleData = extractModuleData(moduleEl);
      if (moduleData && moduleData.metrics.length > 0) {
        moduleData.metrics.forEach((metric) => {
          allMetrics.push({
            moduleId: moduleData.moduleId,
            moduleTitle: moduleData.moduleTitle,
            metricKey: metric.key,
            metricValue: metric.value,
            metricTone: metric.tone,
            moduleStatus: moduleData.moduleStatus,
          });
        });
      }
    });

    const reportId = filename || new URLSearchParams(window.location.search).get('id') || 'report';
    return exportToCSV(allMetrics, `${reportId}-metrics`);
  },

  /**
   * Esporta moduli selezionati
   * @param {Array<string>} moduleIds - Array ID moduli (vuoto = tutti)
   * @param {string} format - Formato ('json' o 'csv')
   * @returns {boolean} Successo
   */
  exportModules(moduleIds = [], format = 'json') {
    return exportSelectedModules(moduleIds, format);
  },

  /**
   * Esporta PDF (usa window.print)
   * @param {string} filename - Nome file (opzionale)
   * @returns {boolean} Successo
   */
  exportPDF(filename = null) {
    const reportId = filename || new URLSearchParams(window.location.search).get('id') || 'report';
    return exportToPDF(reportId);
  },

  /**
   * Ottieni dati report (senza esportare)
   * @returns {Object} Dati report
   */
  getReportData() {
    return extractReportData();
  },
};
