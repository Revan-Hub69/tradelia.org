/**
 * VWAP (Volume-Weighted Average Price)
 * 
 * Indicatore accademico validato in letteratura:
 * - "The Information Content of Volume-Weighted Average Price" (Berkman et al., 2008)
 * - "VWAP as a Trading Benchmark" (Madhavan, 2002)
 * 
 * VWAP è il prezzo medio ponderato per volume, usato come benchmark
 * per valutare se un trade è stato eseguito a buon prezzo.
 * 
 * Formula: VWAP = Σ(Price × Volume) / Σ(Volume)
 */

export interface VWAPData {
  vwap: number;
  deviation: number; // Deviazione prezzo corrente da VWAP (%)
  interpretation: 'above' | 'below' | 'at';
  significance: 'high' | 'medium' | 'low';
}

/**
 * Calcola VWAP da order book
 * 
 * @param bids - Order book bids
 * @param asks - Order book asks
 * @param currentPrice - Prezzo corrente
 */
export function calculateVWAP(
  bids: Array<{ price: number; quantity: number }>,
  asks: Array<{ price: number; quantity: number }>,
  currentPrice: number
): VWAPData {
  // Usa mid-price per ogni livello come proxy del prezzo di esecuzione
  const allLevels = [
    ...bids.map(b => ({ price: b.price, volume: b.quantity })),
    ...asks.map(a => ({ price: a.price, volume: a.quantity })),
  ];

  if (allLevels.length === 0) {
    return {
      vwap: currentPrice,
      deviation: 0,
      interpretation: 'at',
      significance: 'low',
    };
  }

  // Calcola VWAP
  let totalPriceVolume = 0;
  let totalVolume = 0;

  for (const level of allLevels) {
    totalPriceVolume += level.price * level.volume;
    totalVolume += level.volume;
  }

  const vwap = totalVolume > 0 ? totalPriceVolume / totalVolume : currentPrice;

  // Calcola deviazione
  const deviation = ((currentPrice - vwap) / vwap) * 100;

  // Interpretazione
  let interpretation: 'above' | 'below' | 'at';
  let significance: 'high' | 'medium' | 'low';

  if (Math.abs(deviation) < 0.1) {
    interpretation = 'at';
    significance = 'low';
  } else if (deviation > 0) {
    interpretation = 'above';
    significance = Math.abs(deviation) > 1 ? 'high' : 'medium';
  } else {
    interpretation = 'below';
    significance = Math.abs(deviation) > 1 ? 'high' : 'medium';
  }

  return {
    vwap,
    deviation,
    interpretation,
    significance,
  };
}

/**
 * Calcola VWAP da dati storici (per uso futuro con dati reali)
 */
export function calculateVWAPFromHistory(
  priceVolumeData: Array<{ price: number; volume: number }>
): number {
  if (priceVolumeData.length === 0) return 0;

  let totalPriceVolume = 0;
  let totalVolume = 0;

  for (const data of priceVolumeData) {
    totalPriceVolume += data.price * data.volume;
    totalVolume += data.volume;
  }

  return totalVolume > 0 ? totalPriceVolume / totalVolume : 0;
}

