/**
 * Spread & Arbitrage Analysis
 * 
 * Identifica opportunità di arbitraggio cross-exchange per scalping:
 * - Spread tra exchange
 * - Opportunità di arbitraggio
 * - Costi di transazione
 */

export interface SpreadOpportunity {
  symbol: string;
  exchangeA: string;
  exchangeB: string;
  priceA: number;
  priceB: number;
  spread: number;
  spreadPercent: number;
  arbitrageProfit: number; // Dopo costi
  arbitrageProfitPercent: number;
  feasible: boolean; // Se profittevole dopo costi
  minTradeSize: number; // Dimensione minima trade per essere profittevole
}

/**
 * Calcola spread e opportunità di arbitraggio
 */
export function calculateSpreadArbitrage(
  prices: Array<{ exchange: string; price: number; fee: number }>,
  minProfitPercent: number = 0.1 // Minimo 0.1% di profitto dopo costi
): SpreadOpportunity[] {
  const opportunities: SpreadOpportunity[] = [];

  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      const exchangeA = prices[i];
      const exchangeB = prices[j];

      const spread = Math.abs(exchangeA.price - exchangeB.price);
      const spreadPercent = (spread / Math.min(exchangeA.price, exchangeB.price)) * 100;

      // Calcola profitto dopo costi
      // Compra su exchange più economico, vendi su exchange più caro
      const buyPrice = exchangeA.price < exchangeB.price ? exchangeA.price : exchangeB.price;
      const sellPrice = exchangeA.price < exchangeB.price ? exchangeB.price : exchangeA.price;
      const buyExchange = exchangeA.price < exchangeB.price ? exchangeA.exchange : exchangeB.exchange;
      const sellExchange = exchangeA.price < exchangeB.price ? exchangeB.exchange : exchangeA.exchange;
      const buyFee = exchangeA.price < exchangeB.price ? exchangeA.fee : exchangeB.fee;
      const sellFee = exchangeA.price < exchangeB.price ? exchangeB.fee : exchangeA.fee;

      // Profitto = (sellPrice - buyPrice) - (buyPrice * buyFee) - (sellPrice * sellFee)
      const grossProfit = sellPrice - buyPrice;
      const totalFees = (buyPrice * buyFee) + (sellPrice * sellFee);
      const netProfit = grossProfit - totalFees;
      const netProfitPercent = (netProfit / buyPrice) * 100;

      const feasible = netProfitPercent >= minProfitPercent;

      // Dimensione minima trade (assumendo costi fissi di ~$1)
      const fixedCosts = 1; // Stima costi fissi (gas, withdrawal, etc.)
      const minTradeSize = fixedCosts / (netProfitPercent / 100);

      opportunities.push({
        symbol: 'BTC', // TODO: passare come parametro
        exchangeA: buyExchange,
        exchangeB: sellExchange,
        priceA: buyPrice,
        priceB: sellPrice,
        spread,
        spreadPercent,
        arbitrageProfit: netProfit,
        arbitrageProfitPercent: netProfitPercent,
        feasible,
        minTradeSize,
      });
    }
  }

  // Ordina per profitto decrescente
  return opportunities
    .filter(opp => opp.feasible)
    .sort((a, b) => b.arbitrageProfitPercent - a.arbitrageProfitPercent);
}

