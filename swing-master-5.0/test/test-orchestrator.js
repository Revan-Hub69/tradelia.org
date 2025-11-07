// Test Orchestrator - Workflow completo automatico

import { executeFullWorkflow } from '../modules/orchestrator.js';

/**
 * Test completo workflow
 */
async function testWorkflow() {
  console.log('🧪 Test Orchestrator - Workflow Completo\n');
  
  try {
    // Test con ticker AAPL
    const ticker = 'AAPL';
    console.log(`📊 Esecuzione workflow per ticker: ${ticker}\n`);
    
    const result = await executeFullWorkflow(ticker, {
      basePath: '../../report'
    });
    
    console.log('\n✅ Test completato con successo!');
    console.log('\n📋 Risultati:');
    console.log(`  - Report ID: ${result.reportID}`);
    console.log(`  - Ticker: ${result.ticker}`);
    console.log(`  - Report Path: ${result.reportPath}`);
    console.log(`  - Header version: ${result.header.meta.version}`);
    console.log(`  - F1B StrategyMode: ${result.f1b.f1bSnapshot?.regime_state?.StrategyMode_macro || 'N/A'}`);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ Errore durante il test:', error);
    throw error;
  }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
  testWorkflow().catch(console.error);
}

export { testWorkflow };

