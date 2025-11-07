// F1B Report Saver - Salva automaticamente JSON report
// Compatibile con struttura reports/ esistente

/**
 * Genera ID report basato su data
 * Formato: YYYYMMDD-HHMM
 */
export function generateReportID(timestamp = null) {
  const date = timestamp ? new Date(timestamp) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}-${hours}${minutes}`;
}

/**
 * Genera path report basato su ID
 */
export function getReportPath(reportID = null) {
  const id = reportID || generateReportID();
  return `reports/${id}/f1b.json`;
}

/**
 * Salva report JSON in file (Node.js)
 * @param {Object} f1bOutput - Output F1B completo
 * @param {Object} config - Configurazione
 * @returns {Promise<string>} Path del file salvato
 */
export async function saveReportJSON(f1bOutput, config = {}) {
  const reportID = config.reportID || generateReportID(f1bOutput.meta?.timestampET);
  const basePath = config.basePath || '../../report';
  const reportPath = `${basePath}/reports/${reportID}`;
  const filePath = `${reportPath}/f1b.json`;
  
  // Node.js filesystem
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Crea directory se non esiste
      const fullPath = path.resolve(reportPath);
      await fs.mkdir(fullPath, { recursive: true });
      
      // Salva JSON
      await fs.writeFile(
        path.resolve(filePath),
        JSON.stringify(f1bOutput, null, 2),
        'utf8'
      );
      
      console.log(`✅ Report salvato: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ Errore salvataggio report:', error);
      throw error;
    }
  } else {
    // Browser: download file
    const blob = new Blob([JSON.stringify(f1bOutput, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f1b-${reportID}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`✅ Report scaricato: f1b-${reportID}.json`);
    return `f1b-${reportID}.json`;
  }
}

/**
 * Salva anche manifest.json (se necessario)
 */
export async function saveManifest(reportID, config = {}) {
  const basePath = config.basePath || '../../report';
  const reportPath = `${basePath}/reports/${reportID}`;
  const filePath = `${reportPath}/manifest.json`;
  
  const manifest = {
    reportID: reportID,
    timestamp: new Date().toISOString(),
    modules: ['F1B'],
    version: 'F1B v19-Dynamic'
  };
  
  if (typeof window === 'undefined') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      await fs.writeFile(
        path.resolve(filePath),
        JSON.stringify(manifest, null, 2),
        'utf8'
      );
      
      return filePath;
    } catch (error) {
      console.warn('⚠️ Errore salvataggio manifest:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Salva report completo (F1B + manifest)
 */
export async function saveCompleteReport(f1bOutput, config = {}) {
  const reportID = config.reportID || generateReportID(f1bOutput.meta?.timestampET);
  
  // Salva F1B
  const f1bPath = await saveReportJSON(f1bOutput, { ...config, reportID });
  
  // Salva manifest (opzionale)
  if (config.saveManifest !== false) {
    await saveManifest(reportID, config);
  }
  
  return {
    reportID,
    f1bPath,
    reportPath: `reports/${reportID}/`
  };
}

