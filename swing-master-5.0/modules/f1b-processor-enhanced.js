// F1B Processor Enhanced - Works with ETF Proxy data
// Enhanced version that accepts ETF proxy data format

import { collectF1BMarketData } from './f1b-data-collector.js';

// Import processor - IMPORTANTE: Aggiusta il path in base al tuo setup
// Opzione 1: Browser (se serve da root web)
// import { processF1B } from '/report/assets/js/modules/f1b-processor.js';

// Opzione 2: Node/Relative (path relativo)
// import { processF1B } from '../../report/assets/js/modules/f1b-processor.js';

// Opzione 3: Dynamic import (usa questa se path non certo)
let processF1B;

/**
 * Process F1B with ETF proxy data collection
 * Complete workflow: collect data → process → output
 * 
 * @param {Object} config - Configuration
 * @param {string} config.fredApiKey - Optional FRED API key
 * @param {Object} config.customData - Optional custom data override
 * @returns {Promise<Object>} Complete F1B output
 */
// Lazy load processor
async function getProcessor() {
  if (processF1B) return processF1B;
  
  try {
    // Prova path relativo (Node)
    const module = await import('../../report/assets/js/modules/f1b-processor.js');
    processF1B = module.processF1B;
    return processF1B;
  } catch (e) {
    try {
      // Prova path browser
      const module = await import('/report/assets/js/modules/f1b-processor.js');
      processF1B = module.processF1B;
      return processF1B;
    } catch (e2) {
      throw new Error('F1B processor not found. Check import path in f1b-processor-enhanced.js');
    }
  }
}

export async function processF1BWithETFProxy(config = {}) {
  try {
    // Step 1: Collect market data using ETF proxies and free APIs
    console.log('📊 Collecting market data...');
    const marketData = await collectF1BMarketData({
      fredApiKey: config.fredApiKey,
      period1m: config.period1m || '1m',
      period1w: config.period1w || '1w'
    });
    
    // Step 2: Merge with custom data if provided
    const rawMarketData = {
      ...marketData,
      ...(config.customData || {})
    };
    
    // Step 3: Load processor and process
    console.log('⚙️ Processing F1B metrics...');
    const processor = await getProcessor();
    const f1bOutput = processor(rawMarketData, {
      timestampET: config.timestampET || new Date().toISOString(),
      auditPathID: config.auditPathID || null
    });
    
    // Step 4: Add data source metadata
    f1bOutput.meta.dataSource = 'ETF_Proxy_Free_APIs';
    f1bOutput.meta.dataCollectionMethod = 'Automated_ETF_Proxy';
    f1bOutput.meta.confidence = marketData.meta.confidence;
    
    console.log('✅ F1B processing complete');
    return f1bOutput;
    
  } catch (error) {
    console.error('❌ Error in F1B processing:', error);
    throw error;
  }
}

/**
 * Simple usage example
 */
export async function example() {
  try {
    const result = await processF1BWithETFProxy({
      // Optional: Add FRED API key for better Treasury data
      // fredApiKey: 'YOUR_FRED_API_KEY'
    });
    
    console.log('F1B Output:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

