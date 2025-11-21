// Example: F1B Complete con salvataggio automatico JSON

import { processF1BComplete } from '../modules/f1b-enhanced-complete.js';

/**
 * Esempio 1: Processa e salva automaticamente
 */
async function exampleAutoSave() {
  console.log('=== F1B Complete con Auto-Save ===\n');

  const result = await processF1BComplete({
    saveReport: true, // Salva automaticamente JSON
    // reportID: 'custom-20251107',  // Opzionale: ID custom
    // basePath: '../../report'  // Opzionale: path custom
  });

  // Output include:
  // - result.f1bSnapshot (dati completi)
  // - result.formattedRows (per UI)
  // - result.metricsPanel (per popup)
  // - result.meta.savedReport (info salvataggio)

  console.log('\n✅ Processing completato!');
  console.log('StrategyMode:', result.f1bSnapshot.regime_state.StrategyMode_macro);
  console.log('RegimeScore:', result.f1bSnapshot.regime_state.RegimeScore);

  if (result.meta.savedReport) {
    console.log('\n💾 Report salvato:');
    console.log('  Report ID:', result.meta.savedReport.reportID);
    console.log('  Path:', result.meta.savedReport.reportPath);
    console.log('  File:', result.meta.savedReport.f1bPath);
  }

  return result;
}

/**
 * Esempio 2: Processa senza salvare
 */
async function exampleNoSave() {
  console.log('=== F1B Complete senza Save ===\n');

  const result = await processF1BComplete({
    saveReport: false, // Non salvare
  });

  // Stesso output ma senza savedReport info
  return result;
}

/**
 * Esempio 3: Processa con custom data + save
 */
async function exampleCustomData() {
  console.log('=== F1B con Custom Data + Save ===\n');

  const result = await processF1BComplete({
    saveReport: true,
    customData: {
      // Override specific data if needed
      VIX: 18.5,
      VIX_change_7d: -0.021,
    },
  });

  return result;
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleAutoSave().catch(console.error);
}

export { exampleAutoSave, exampleNoSave, exampleCustomData };
