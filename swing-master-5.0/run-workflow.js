// Run Workflow - Esegue workflow completo per ticker
// Usage: node run-workflow.js AAPL

import { executeFullWorkflow } from './modules/orchestrator.js';

const ticker = process.argv[2] || 'AAPL';

console.log(`🚀 Eseguendo workflow per ticker: ${ticker}\n`);

executeFullWorkflow(ticker, {
  basePath: '../../report'
})
  .then(result => {
    console.log('\n✅ Workflow completato con successo!');
    console.log(`\n📋 Report generato:`);
    console.log(`  - Report ID: ${result.reportID}`);
    console.log(`  - Ticker: ${result.ticker}`);
    console.log(`  - Path: ${result.reportPath}`);
    console.log(`  - Header version: ${result.header.meta.version}`);
    console.log(`  - F1B StrategyMode: ${result.f1b.f1bSnapshot?.regime_state?.StrategyMode_macro || 'N/A'}`);
    console.log(`  - F1B RegimeScore: ${result.f1b.f1bSnapshot?.regime_state?.RegimeScore || 'N/A'}`);
  })
  .catch(error => {
    console.error('\n❌ Errore durante workflow:', error);
    process.exit(1);
  });

