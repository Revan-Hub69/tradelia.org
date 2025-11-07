// Example: Using F1B with ETF Proxy and Free APIs

import { processF1BWithETFProxy } from '../modules/f1b-processor-enhanced.js';

/**
 * Example 1: Basic usage (no API keys needed)
 */
async function exampleBasic() {
  console.log('=== Example 1: Basic Usage ===');
  
  const result = await processF1BWithETFProxy();
  
  console.log('StrategyMode:', result.f1bSnapshot.regime_state.StrategyMode_macro);
  console.log('RegimeScore:', result.f1bSnapshot.regime_state.RegimeScore);
  console.log('Finviz Query:', result.finvizFilters.QueryString);
  
  return result;
}

/**
 * Example 2: With FRED API key (better Treasury data)
 */
async function exampleWithFRED() {
  console.log('=== Example 2: With FRED API Key ===');
  
  const result = await processF1BWithETFProxy({
    fredApiKey: 'YOUR_FRED_API_KEY' // Get free at: https://fred.stlouisfed.org/docs/api/api_key.html
  });
  
  return result;
}

/**
 * Example 3: With custom data override
 */
async function exampleWithCustomData() {
  console.log('=== Example 3: With Custom Data Override ===');
  
  const result = await processF1BWithETFProxy({
    customData: {
      // Override specific data if needed
      VIX: 18.5,
      VIX_change_7d: -0.021,
      // ... other overrides
    }
  });
  
  return result;
}

/**
 * Example 4: Save to file
 */
async function exampleSaveToFile() {
  console.log('=== Example 4: Save to File ===');
  
  const result = await processF1BWithETFProxy();
  
  // Save to JSON file
  const fs = await import('fs/promises');
  await fs.writeFile(
    './output/f1b-output.json',
    JSON.stringify(result, null, 2)
  );
  
  console.log('✅ Saved to ./output/f1b-output.json');
  
  return result;
}

// Run example
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleBasic().catch(console.error);
}

