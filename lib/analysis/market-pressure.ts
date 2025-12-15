/**
 * Market Pressure Calculator
 * 
 * Calcola pressione di acquisto/vendita basata su:
 * - Order book imbalance
 * - Trade flow (buy vs sell)
 * - Volume concentration
 * - Funding rates (futures)
 */

import { OrderBookEntry } from '@/lib/price-apis/binance';

export interface MarketPressure {
  overall: number; // -1 (selling) to +1 (buying)
  orderBookPressure: number; // Pressione da order book
  volumePressure: number; // Pressione da volumi
  fundingPressure: number; // Pressione da funding rate (se disponibile)
  interpretation: string; // Interpretazione testuale
  strength: 'weak' | 'moderate' | 'strong' | 'extreme';
}

/**
 * Calcola pressione di mercato da order book
 */
export function calculateOrderBookPressure(
  bids: OrderBookEntry[],
  asks: OrderBookEntry[],
  currentPrice: number
): number {
  // Calcola volume totale bid e ask entro ±1% dal prezzo corrente
  const priceRange = currentPrice * 0.01; // 1%
  const minPrice = currentPrice - priceRange;
  const maxPrice = currentPrice + priceRange;

  let bidVolume = 0;
  let askVolume = 0;

  for (const bid of bids) {
    if (bid.price >= minPrice && bid.price <= currentPrice) {
      bidVolume += bid.quantity;
    }
  }

  for (const ask of asks) {
    if (ask.price >= currentPrice && ask.price <= maxPrice) {
      askVolume += ask.quantity;
    }
  }

  const totalVolume = bidVolume + askVolume;
  if (totalVolume === 0) return 0;

  // Pressione: positivo = buying, negativo = selling
  return (bidVolume - askVolume) / totalVolume;
}

/**
 * Calcola pressione da concentrazione volume
 */
export function calculateVolumePressure(
  bids: OrderBookEntry[],
  asks: OrderBookEntry[],
  currentPrice: number
): number {
  // Analizza concentrazione: se volume è concentrato vicino al prezzo = alta pressione
  const priceRange = currentPrice * 0.005; // 0.5%
  const minPrice = currentPrice - priceRange;
  const maxPrice = currentPrice + priceRange;

  let nearBidVolume = 0;
  let nearAskVolume = 0;
  let farBidVolume = 0;
  let farAskVolume = 0;

  for (const bid of bids) {
    if (bid.price >= minPrice && bid.price <= currentPrice) {
      nearBidVolume += bid.quantity;
    } else if (bid.price < minPrice) {
      farBidVolume += bid.quantity;
    }
  }

  for (const ask of asks) {
    if (ask.price >= currentPrice && ask.price <= maxPrice) {
      nearAskVolume += ask.quantity;
    } else if (ask.price > maxPrice) {
      farAskVolume += ask.quantity;
    }
  }

  // Se volume è concentrato vicino = alta pressione
  const nearTotal = nearBidVolume + nearAskVolume;
  const farTotal = farBidVolume + farAskVolume;
  const total = nearTotal + farTotal;

  if (total === 0) return 0;

  const concentration = nearTotal / total;
  const imbalance = (nearBidVolume - nearAskVolume) / (nearTotal || 1);

  // Combina concentrazione e imbalance
  return concentration * imbalance;
}

/**
 * Calcola pressione complessiva di mercato
 */
export function calculateMarketPressure(
  bids: OrderBookEntry[],
  asks: OrderBookEntry[],
  currentPrice: number,
  fundingRate?: number
): MarketPressure {
  const orderBookPressure = calculateOrderBookPressure(bids, asks, currentPrice);
  const volumePressure = calculateVolumePressure(bids, asks, currentPrice);

  // Funding rate pressure: positivo = long pagano (bearish), negativo = short pagano (bullish)
  let fundingPressure = 0;
  if (fundingRate !== undefined) {
    // Normalizza funding rate: estremo (>0.1%) = alta pressione
    fundingPressure = Math.max(-1, Math.min(1, -fundingRate * 10)); // Inverti: funding positivo = selling pressure
  }

  // Pressione complessiva: media pesata
  const overall = (orderBookPressure * 0.5 + volumePressure * 0.3 + fundingPressure * 0.2);

  // Determina forza
  let strength: 'weak' | 'moderate' | 'strong' | 'extreme';
  const absOverall = Math.abs(overall);
  if (absOverall >= 0.7) {
    strength = 'extreme';
  } else if (absOverall >= 0.5) {
    strength = 'strong';
  } else if (absOverall >= 0.3) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }

  // Interpretazione
  let interpretation = '';
  if (overall > 0.5) {
    interpretation = `Forte pressione di acquisto: order book sbilanciato a favore domanda, volume concentrato vicino al prezzo.`;
  } else if (overall > 0.3) {
    interpretation = `Moderata pressione di acquisto: più domanda che offerta nel order book.`;
  } else if (overall < -0.5) {
    interpretation = `Forte pressione di vendita: order book sbilanciato a favore offerta, volume concentrato vicino al prezzo.`;
  } else if (overall < -0.3) {
    interpretation = `Moderata pressione di vendita: più offerta che domanda nel order book.`;
  } else {
    interpretation = `Pressione bilanciata: order book relativamente equilibrato.`;
  }

  return {
    overall,
    orderBookPressure,
    volumePressure,
    fundingPressure,
    interpretation,
    strength,
  };
}

