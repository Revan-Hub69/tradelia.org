/**
 * Volume Profile Analysis
 * 
 * Analisi accademica della distribuzione del volume per livello di prezzo.
 * Basato su: "Volume Profile: A Tool for Technical Analysis" (TradingView Research)
 * 
 * Il Volume Profile mostra dove è stato scambiato più volume, identificando
 * aree di supporto/resistenza basate su attività reale, non solo prezzi.
 */

export interface VolumeProfileLevel {
  price: number;
  volume: number;
  percentage: number; // % del volume totale
  type: 'poc' | 'value-area-high' | 'value-area-low' | 'value-area' | 'normal';
}

export interface VolumeProfileResult {
  levels: VolumeProfileLevel[];
  poc: number; // Point of Control (prezzo con più volume)
  valueAreaHigh: number; // 70% del volume sopra
  valueAreaLow: number; // 70% del volume sotto
  totalVolume: number;
}

/**
 * Calcola Volume Profile da dati order book
 * 
 * @param bids - Order book bids
 * @param asks - Order book asks
 * @param currentPrice - Prezzo corrente
 * @param priceBuckets - Numero di bucket di prezzo (default 50)
 */
export function calculateVolumeProfile(
  bids: Array<{ price: number; quantity: number }>,
  asks: Array<{ price: number; quantity: number }>,
  currentPrice: number,
  priceBuckets: number = 50
): VolumeProfileResult {
  // Combina bids e asks
  const allOrders = [
    ...bids.map(b => ({ price: b.price, volume: b.quantity, side: 'bid' as const })),
    ...asks.map(a => ({ price: a.price, volume: a.quantity, side: 'ask' as const })),
  ];

  if (allOrders.length === 0) {
    return {
      levels: [],
      poc: currentPrice,
      valueAreaHigh: currentPrice,
      valueAreaLow: currentPrice,
      totalVolume: 0,
    };
  }

  // Trova range di prezzi
  const prices = allOrders.map(o => o.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const bucketSize = priceRange / priceBuckets;

  // Raggruppa volume per bucket
  const volumeByBucket = new Map<number, number>();

  for (const order of allOrders) {
    const bucketIndex = Math.floor((order.price - minPrice) / bucketSize);
    const bucketPrice = minPrice + (bucketIndex * bucketSize) + (bucketSize / 2);
    const currentVolume = volumeByBucket.get(bucketPrice) || 0;
    volumeByBucket.set(bucketPrice, currentVolume + order.volume);
  }

  // Calcola totale
  const totalVolume = Array.from(volumeByBucket.values()).reduce((sum, v) => sum + v, 0);

  // Converti in array e ordina per prezzo
  const levels: VolumeProfileLevel[] = Array.from(volumeByBucket.entries())
    .map(([price, volume]) => ({
      price,
      volume,
      percentage: totalVolume > 0 ? (volume / totalVolume) * 100 : 0,
      type: 'normal' as const,
    }))
    .sort((a, b) => a.price - b.price);

  // Trova POC (Point of Control) - prezzo con più volume
  const pocLevel = levels.reduce((max, level) => 
    level.volume > max.volume ? level : max
  );
  const poc = pocLevel.price;

  // Marca POC
  pocLevel.type = 'poc';

  // Calcola Value Area (70% del volume)
  // Ordiniamo per volume decrescente e prendiamo il 70%
  const sortedByVolume = [...levels].sort((a, b) => b.volume - a.volume);
  let cumulativeVolume = 0;
  const valueAreaLevels: number[] = [];

  for (const level of sortedByVolume) {
    cumulativeVolume += level.volume;
    valueAreaLevels.push(level.price);
    if (cumulativeVolume >= totalVolume * 0.7) {
      break;
    }
  }

  const valueAreaHigh = Math.max(...valueAreaLevels);
  const valueAreaLow = Math.min(...valueAreaLevels);

  // Marca value area
  for (const level of levels) {
    if (level.price === valueAreaHigh) {
      level.type = 'value-area-high';
    } else if (level.price === valueAreaLow) {
      level.type = 'value-area-low';
    } else if (level.price >= valueAreaLow && level.price <= valueAreaHigh) {
      level.type = 'value-area';
    }
  }

  return {
    levels,
    poc,
    valueAreaHigh,
    valueAreaLow,
    totalVolume,
  };
}

