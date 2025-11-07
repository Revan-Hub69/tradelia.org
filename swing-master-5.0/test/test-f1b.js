// Test F1B - Verifica funzionamento completo

import { processF1BComplete } from '../modules/f1b-enhanced-complete.js';

async function testF1B() {
  console.log('🧪 Testing F1B Complete...\n');
  
  try {
    // Test 1: Process F1B
    console.log('📊 Step 1: Processing F1B...');
    const result = await processF1BComplete();
    
    // Test 2: Verifica output struttura
    console.log('\n✅ Step 2: Verifica struttura output...');
    
    const checks = [
      { name: 'f1bSnapshot', value: result.f1bSnapshot },
      { name: 'finvizFilters', value: result.finvizFilters },
      { name: 'bridgeF2', value: result.bridgeF2 },
      { name: 'formattedRows', value: result.formattedRows },
      { name: 'metricsPanel', value: result.metricsPanel }
    ];
    
    checks.forEach(check => {
      if (check.value) {
        console.log(`  ✅ ${check.name}: OK`);
      } else {
        console.log(`  ❌ ${check.name}: MISSING`);
      }
    });
    
    // Test 3: Verifica metriche chiave
    console.log('\n📈 Step 3: Verifica metriche chiave...');
    
    const regime = result.f1bSnapshot?.regime_state;
    if (regime) {
      console.log(`  StrategyMode: ${regime.StrategyMode_macro || '—'}`);
      console.log(`  RegimeScore: ${regime.RegimeScore || '—'}`);
    }
    
    const finviz = result.finvizFilters;
    if (finviz) {
      console.log(`  Finviz Query: ${finviz.QueryString?.substring(0, 60) || '—'}...`);
    }
    
    // Test 4: Verifica formatted rows
    console.log('\n📝 Step 4: Verifica formatted rows...');
    if (result.formattedRows && result.formattedRows.length > 0) {
      console.log(`  ✅ ${result.formattedRows.length} righe formattate`);
      result.formattedRows.forEach((row, i) => {
        console.log(`    Row ${i + 1}: ${row.id} (${row.parts?.length || 0} parts)`);
      });
    } else {
      console.log('  ❌ Nessuna riga formattata');
    }
    
    // Test 5: Verifica metrics panel
    console.log('\n🔍 Step 5: Verifica metrics panel...');
    if (result.metricsPanel && result.metricsPanel.length > 0) {
      console.log(`  ✅ ${result.metricsPanel.length} metriche con spiegazioni`);
      const sampleKeys = result.metricsPanel.slice(0, 5).map(m => m.key);
      console.log(`    Sample: ${sampleKeys.join(', ')}`);
    } else {
      console.log('  ❌ Nessuna metrica nel panel');
    }
    
    console.log('\n✅ Test completato!');
    
    // Output completo (solo per debug)
    if (process.env.DEBUG) {
      console.log('\n📄 Output completo:');
      console.log(JSON.stringify(result, null, 2));
    }
    
    return result;
    
  } catch (error) {
    console.error('\n❌ Errore durante test:', error);
    throw error;
  }
}

// Esegui test
if (import.meta.url === `file://${process.argv[1]}`) {
  testF1B().catch(console.error);
}

export { testF1B };

