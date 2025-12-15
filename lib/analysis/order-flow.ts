/**
 * Order Flow Analysis
 * 
 * Analisi del flusso degli ordini per scalping:
 * - Bid/Ask imbalance real-time
 * - Order flow direction
 * - Aggressive vs passive orders
 * - Order book changes
 */

export interface OrderFlowData {
  imbalance: number; // -1 (tutto ask) a +1 (tutto bid)
  flowDirection: 'buying' | 'selling' | 'neutral';
  aggressiveBuyVolume: number;
  aggressiveSellVolume: number;
  passiveBuyVolume: number;
  passiveSellVolume: number;
  orderBookChange: number; // Variazione order book (delta)
  interpretation: string;
}

/**
 * Analizza order flow da order book
 */
export function analyzeOrderFlow(
  bids: Array<{ price: number; quantity: number }>,
  asks: Array<{ price: number; quantity: number }>,
  previousBids?: Array<{ price: number; quantity: number }>,
  previousAsks?: Array<{ price: number; quantity: number }>
): OrderFlowData {
  const totalBidVolume = bids.reduce((sum, b) => sum + b.quantity, 0);
  const totalAskVolume = asks.reduce((sum, a) => sum + a.quantity, 0);
  const totalVolume = totalBidVolume + totalAskVolume;

  // Imbalance
  const imbalance = totalVolume > 0
    ? (totalBidVolume - totalAskVolume) / totalVolume
    : 0;

  // Aggressive vs Passive
  // Aggressive = ordini che consumano liquidità (market orders)
  // Passive = ordini che forniscono liquidità (limit orders)
  // Stima: ordini vicini al mid-price sono più aggressivi
  if (bids.length === 0 || asks.length === 0) {
    return {
      imbalance,
      flowDirection: 'neutral',
      aggressiveBuyVolume: 0,
      aggressiveSellVolume: 0,
      passiveBuyVolume: totalBidVolume,
      passiveSellVolume: totalAskVolume,
      orderBookChange: 0,
      interpretation: 'Order book insufficiente',
    };
  }

  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  const midPrice = (bestBid + bestAsk) / 2;
  const spread = bestAsk - bestBid;

  // Aggressive buy = bid vicini al best ask (entro 2x spread)
  const aggressiveBuyThreshold = bestAsk - (spread * 2);
  const aggressiveBuyVolume = bids
    .filter(b => b.price >= aggressiveBuyThreshold)
    .reduce((sum, b) => sum + b.quantity, 0);

  // Aggressive sell = ask vicini al best bid (entro 2x spread)
  const aggressiveSellThreshold = bestBid + (spread * 2);
  const aggressiveSellVolume = asks
    .filter(a => a.price <= aggressiveSellThreshold)
    .reduce((sum, a) => sum + a.quantity, 0);

  const passiveBuyVolume = totalBidVolume - aggressiveBuyVolume;
  const passiveSellVolume = totalAskVolume - aggressiveSellVolume;

  // Order book change (se abbiamo dati precedenti)
  let orderBookChange = 0;
  if (previousBids && previousAsks) {
    const prevBidVolume = previousBids.reduce((sum, b) => sum + b.quantity, 0);
    const prevAskVolume = previousAsks.reduce((sum, a) => sum + a.quantity, 0);
    const prevTotal = prevBidVolume + prevAskVolume;
    const currentTotal = totalBidVolume + totalAskVolume;
    
    if (prevTotal > 0) {
      orderBookChange = ((currentTotal - prevTotal) / prevTotal) * 100;
    }
  }

  // Flow direction
  let flowDirection: 'buying' | 'selling' | 'neutral';
  if (imbalance > 0.1) {
    flowDirection = 'buying';
  } else if (imbalance < -0.1) {
    flowDirection = 'selling';
  } else {
    flowDirection = 'neutral';
  }

  // Interpretation
  let interpretation = '';
  if (imbalance > 0.2 && aggressiveBuyVolume > aggressiveSellVolume) {
    interpretation = 'Forte pressione rialzista - molti ordini aggressivi di acquisto';
  } else if (imbalance < -0.2 && aggressiveSellVolume > aggressiveBuyVolume) {
    interpretation = 'Forte pressione ribassista - molti ordini aggressivi di vendita';
  } else if (imbalance > 0.1) {
    interpretation = 'Pressione rialzista moderata';
  } else if (imbalance < -0.1) {
    interpretation = 'Pressione ribassista moderata';
  } else {
    interpretation = 'Equilibrio tra domanda e offerta';
  }

  return {
    imbalance,
    flowDirection,
    aggressiveBuyVolume,
    aggressiveSellVolume,
    passiveBuyVolume,
    passiveSellVolume,
    orderBookChange,
    interpretation,
  };
}

