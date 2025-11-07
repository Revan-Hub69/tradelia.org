// F1B Enhanced Complete - Workflow completo con spiegazioni
// Combina: data collection → processing → formatting → saving

import { processF1BWithETFProxy } from './f1b-processor-enhanced.js';
import { formatF1BWithExplanations } from './f1b-output-formatter.js';
import { saveCompleteReport } from './f1b-report-saver.js';

/**
 * Processa F1B completo con spiegazioni inline
 * Output formattato per header-ticker system
 * Salva automaticamente JSON report se config.saveReport = true
 * 
 * @param {Object} config - Configuration
 * @param {boolean} config.saveReport - Salva automaticamente JSON (default: false)
 * @param {string} config.reportID - ID report custom (default: auto-generato)
 * @param {string} config.basePath - Base path per salvataggio (default: '../../report')
 * @returns {Promise<Object>} F1B output con spiegazioni + info salvataggio
 */
export async function processF1BComplete(config = {}) {
  try {
    // Step 1: Collect data and process
    console.log('📊 Processing F1B...');
    const f1bOutput = await processF1BWithETFProxy(config);
    
    // Step 2: Format with explanations
    console.log('📝 Formatting with explanations...');
    const formatted = formatF1BWithExplanations(f1bOutput);
    
    // Step 3: Combine original output + formatted rows
    const completeOutput = {
      // Original F1B output (completo)
      ...f1bOutput,
      
      // Formatted rows per header-ticker
      formattedRows: formatted.rows,
      metricsPanel: formatted.metricsPanel,
      
      // Metadata
      meta: {
        ...f1bOutput.meta,
        formatted: true,
        explanationsIncluded: true
      }
    };
    
    // Step 4: Save report JSON se richiesto
    let saveInfo = null;
    if (config.saveReport) {
      console.log('💾 Saving report JSON...');
      try {
        saveInfo = await saveCompleteReport(completeOutput, {
          reportID: config.reportID,
          basePath: config.basePath,
          saveManifest: config.saveManifest !== false
        });
        console.log(`✅ Report salvato: ${saveInfo.reportPath}`);
      } catch (error) {
        console.warn('⚠️ Errore salvataggio report:', error);
        // Non fallire se salvataggio fallisce
      }
    }
    
    // Aggiungi info salvataggio all'output
    if (saveInfo) {
      completeOutput.meta.savedReport = saveInfo;
    }
    
    return completeOutput;
    
  } catch (error) {
    console.error('❌ Error in F1B complete processing:', error);
    throw error;
  }
}

/**
 * Esempio utilizzo base
 */
export async function example() {
  const result = await processF1BComplete();
  
  // Output include:
  // - result.f1bSnapshot (dati completi)
  // - result.formattedRows (per header-ticker)
  // - result.metricsPanel (per popup spiegazioni)
  
  console.log('Formatted rows:', result.formattedRows);
  console.log('Metrics panel:', result.metricsPanel.length, 'metriche');
  
  return result;
}

/**
 * Esempio con salvataggio automatico
 */
export async function exampleWithSave() {
  const result = await processF1BComplete({
    saveReport: true,  // Salva automaticamente
    // reportID: 'custom-id',  // Opzionale: ID custom
    // basePath: '../../report'  // Opzionale: path custom
  });
  
  // Report salvato in: reports/{reportID}/f1b.json
  if (result.meta.savedReport) {
    console.log('Report salvato:', result.meta.savedReport.reportPath);
  }
  
  return result;
}

