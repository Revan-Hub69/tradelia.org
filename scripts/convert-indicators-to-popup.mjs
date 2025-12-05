#!/usr/bin/env node

/**
 * Script Helper per Convertire Indicatori a MethodologyPopup
 * 
 * Questo script aiuta a convertire tutti gli indicatori da sezioni inline
 * a MethodologyPopup discreto seguendo lo standard Tradelia AI
 */

const indicators = [
  'VIXIndicator',
  'EconomicIndicatorsIndicator',
  'BondYieldsIndicator',
  'StockIndexesIndicator',
  'CommoditiesIndicator',
  'ForexIndicator',
  'CryptoMarketCapIndicator',
];

const methodologyFunctions = {
  VIXIndicator: 'getVIXMethodology',
  EconomicIndicatorsIndicator: 'getEconomicIndicatorsMethodology',
  BondYieldsIndicator: 'getBondYieldsMethodology',
  StockIndexesIndicator: 'getStockIndexesMethodology',
  CommoditiesIndicator: 'getCommoditiesMethodology',
  ForexIndicator: 'getForexMethodology',
  CryptoMarketCapIndicator: 'getCryptoMarketCapMethodology',
};

console.log('📋 Indicatori da convertire:');
indicators.forEach((indicator, index) => {
  console.log(`${index + 1}. ${indicator} -> ${methodologyFunctions[indicator]}`);
});

console.log('\n✅ Pattern da applicare:');
console.log(`
1. Import:
   import { IndicatorHeader } from './IndicatorHeader';
   import { ${Object.values(methodologyFunctions)[0]} } from './IndicatorMethodologyNotes';

2. Nel componente:
   const methodology = useMemo(() => ${Object.values(methodologyFunctions)[0]}(locale), [locale]);

3. Sostituire header:
   <IndicatorHeader title="..." methodology={methodology} />

4. Rimuovere SEZIONE 1, 2, 3 (mantenere solo AI Reading)
`);
