// Example: Orchestrator - Workflow completo automatico

import { executeFullWorkflow } from '../modules/orchestrator.js';

/**
 * Esempio 1: Workflow completo per ticker
 */
async function exampleFullWorkflow() {
  console.log('=== Workflow Completo Automatico ===\n');

  // Basta dare il ticker, tutto il resto è automatico
  const result = await executeFullWorkflow('AAPL', {
    // Opzionale: custom config
    // reportID: 'custom-20251107',
    // basePath: '../../report'
  });

  // Output include:
  // - result.header (header.json)
  // - result.f1b (f1b.json)
  // - result.reportPath (dove è salvato)

  console.log('\n✅ Workflow completato!');
  console.log('Report ID:', result.reportID);
  console.log('Ticker:', result.ticker);
  console.log('Path:', result.reportPath);

  return result;
}

/**
 * Esempio 2: Con ticker custom
 */
async function exampleCustomTicker() {
  const ticker = 'MSFT'; // Microsoft

  const result = await executeFullWorkflow(ticker);

  return result;
}

/**
 * Esempio 3: Batch (più ticker)
 */
async function exampleBatch() {
  const tickers = ['AAPL', 'MSFT', 'GOOGL'];

  const results = [];
  for (const ticker of tickers) {
    console.log(`\nProcessing ${ticker}...`);
    const result = await executeFullWorkflow(ticker);
    results.push(result);

    // Pausa tra richieste (rate limiting)
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Processati ${results.length} ticker`);
  return results;
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleFullWorkflow().catch(console.error);
}

export { exampleFullWorkflow, exampleCustomTicker, exampleBatch };
