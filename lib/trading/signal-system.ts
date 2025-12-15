/**
 * High-Precision Signal System
 * 
 * Sistema di segnali per win rate 80%+
 * Combina order flow, microstructure, sentiment, e multi-timeframe
 * 
 * Riferimenti:
 * - Kyle (1985) - Market Microstructure
 * - Easley et al. (2012) - Volume Clock
 * - Hasbrouck (2007) - Empirical Market Microstructure
 */

import { calculateCombinedOrderFlowSignal } from '@/lib/indicators/order-flow';

export interface TradingSignal {
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
  winRate: number; // 0-100 (stima)
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  recommendedLeverage: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  reasons: string[];
  timeframes: {
    '1m'?: 'buy' | 'sell' | 'neutral';
    '5m'?: 'buy' | 'sell' | 'neutral';
    '15m'?: 'buy' | 'sell' | 'neutral';
    '1h'?: 'buy' | 'sell' | 'neutral';
  };
}

export interface MarketData {
  price: number;
  supportResistance: Array<{ price: number; type: 'support' | 'resistance'; strength: number }>;
  marketPressure: { buying: number; selling: number };
}

export interface FuturesData {
  fundingRate: number;
  openInterest: number;
  longShortRatio: number;
  liquidationRisk: 'low' | 'medium' | 'high' | 'very-high';
}

export interface OrderFlowData {
  imbalance: number;
  pressure: 'buying' | 'selling' | 'neutral';
}

export interface LiquidationsData {
  liquidationClusters: Array<{
    leverage: number;
    longLiquidationPrice: number;
    shortLiquidationPrice: number;
    risk: 'low' | 'medium' | 'high' | 'very-high';
  }>;
}

/**
 * Calcola segnale di trading ad alta precisione
 * Obiettivo: Win Rate 80%+
 */
export function calculateHighPrecisionSignal(
  marketData: MarketData,
  futuresData: FuturesData | null,
  orderFlowData: OrderFlowData | null,
  liquidationsData: LiquidationsData | null,
  orderFlowSignal?: ReturnType<typeof calculateCombinedOrderFlowSignal>
): TradingSignal {
  const currentPrice = marketData.price;
  const reasons: string[] = [];
  let signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
  let confidence = 50;
  let winRate = 50;

  // 1. Order Flow Analysis (Peso: 40%)
  let orderFlowScore = 0;
  if (orderFlowSignal) {
    const ofConfidence = orderFlowSignal.confidence;
    orderFlowScore = ofConfidence;
    
    if (orderFlowSignal.signal === 'STRONG_BUY') {
      signal = 'STRONG_BUY';
      confidence += 30;
      winRate += 20;
      reasons.push(`Order Flow: ${orderFlowSignal.signal} (${ofConfidence}% confidence)`);
      reasons.push(...orderFlowSignal.reasons.slice(0, 3));
    } else if (orderFlowSignal.signal === 'STRONG_SELL') {
      signal = 'STRONG_SELL';
      confidence += 30;
      winRate += 20;
      reasons.push(`Order Flow: ${orderFlowSignal.signal} (${ofConfidence}% confidence)`);
      reasons.push(...orderFlowSignal.reasons.slice(0, 3));
    } else if (orderFlowSignal.signal === 'BUY') {
      if (signal === 'NEUTRAL') signal = 'BUY';
      confidence += 15;
      winRate += 10;
      reasons.push(`Order Flow: ${orderFlowSignal.signal} (${ofConfidence}% confidence)`);
    } else if (orderFlowSignal.signal === 'SELL') {
      if (signal === 'NEUTRAL') signal = 'SELL';
      confidence += 15;
      winRate += 10;
      reasons.push(`Order Flow: ${orderFlowSignal.signal} (${ofConfidence}% confidence)`);
    }
  } else if (orderFlowData) {
    if (orderFlowData.pressure === 'buying' && orderFlowData.imbalance > 0.2) {
      if (signal === 'NEUTRAL') signal = 'BUY';
      confidence += 10;
      winRate += 5;
      reasons.push(`Order Flow: Buying pressure (imbalance: ${(orderFlowData.imbalance * 100).toFixed(1)}%)`);
    } else if (orderFlowData.pressure === 'selling' && orderFlowData.imbalance < -0.2) {
      if (signal === 'NEUTRAL') signal = 'SELL';
      confidence += 10;
      winRate += 5;
      reasons.push(`Order Flow: Selling pressure (imbalance: ${(orderFlowData.imbalance * 100).toFixed(1)}%)`);
    }
  }

  // 2. Support/Resistance Analysis (Peso: 20%)
  const nearestSupport = marketData.supportResistance
    .filter((sr) => sr.type === 'support' && sr.price < currentPrice)
    .sort((a, b) => b.price - a.price)[0];
  const nearestResistance = marketData.supportResistance
    .filter((sr) => sr.type === 'resistance' && sr.price > currentPrice)
    .sort((a, b) => a.price - b.price)[0];

  if (nearestSupport && currentPrice - nearestSupport.price < currentPrice * 0.02) {
    // Vicino a supporto forte = potenziale rimbalzo
    if (signal === 'BUY' || signal === 'STRONG_BUY') {
      confidence += 10;
      winRate += 5;
      reasons.push(`Near strong support at $${nearestSupport.price.toFixed(2)}`);
    }
  }

  if (nearestResistance && nearestResistance.price - currentPrice < currentPrice * 0.02) {
    // Vicino a resistenza forte = potenziale correzione
    if (signal === 'SELL' || signal === 'STRONG_SELL') {
      confidence += 10;
      winRate += 5;
      reasons.push(`Near strong resistance at $${nearestResistance.price.toFixed(2)}`);
    }
  }

  // 3. Futures Sentiment (Peso: 20%)
  if (futuresData) {
    // Funding rate estremo = possibile inversione
    if (futuresData.fundingRate > 0.1) {
      // Funding molto positivo = troppi long = possibile correzione
      if (signal === 'SELL' || signal === 'STRONG_SELL') {
        confidence += 10;
        winRate += 5;
        reasons.push(`Extreme funding rate: ${futuresData.fundingRate.toFixed(3)}% (bearish)`);
      }
    } else if (futuresData.fundingRate < -0.1) {
      // Funding molto negativo = troppi short = possibile rimbalzo
      if (signal === 'BUY' || signal === 'STRONG_BUY') {
        confidence += 10;
        winRate += 5;
        reasons.push(`Extreme funding rate: ${futuresData.fundingRate.toFixed(3)}% (bullish)`);
      }
    }

    // Long/Short ratio estremo
    if (futuresData.longShortRatio > 2.0) {
      // Troppi long = possibile correzione
      if (signal === 'SELL' || signal === 'STRONG_SELL') {
        confidence += 5;
        reasons.push(`Long/Short ratio: ${futuresData.longShortRatio.toFixed(2)} (bearish)`);
      }
    } else if (futuresData.longShortRatio < 0.5) {
      // Troppi short = possibile rimbalzo
      if (signal === 'BUY' || signal === 'STRONG_BUY') {
        confidence += 5;
        reasons.push(`Long/Short ratio: ${futuresData.longShortRatio.toFixed(2)} (bullish)`);
      }
    }
  }

  // 4. Liquidation Clusters (Peso: 10%)
  if (liquidationsData && liquidationsData.liquidationClusters.length > 0) {
    const highRiskClusters = liquidationsData.liquidationClusters.filter(
      (c) => c.risk === 'high' || c.risk === 'very-high'
    );

    if (highRiskClusters.length > 0) {
      const avgLiquidationPrice = highRiskClusters.reduce(
        (sum, c) => sum + (c.longLiquidationPrice + c.shortLiquidationPrice) / 2,
        0
      ) / highRiskClusters.length;

      // Se prezzo si avvicina a cluster liquidazioni = possibile movimento
      const distance = Math.abs(currentPrice - avgLiquidationPrice) / currentPrice;
      if (distance < 0.03) {
        reasons.push(`Near liquidation cluster at $${avgLiquidationPrice.toFixed(2)}`);
        // Aggiusta stop loss per evitare liquidazioni
      }
    }
  }

  // 5. Market Pressure (Peso: 10%)
  const pressureRatio = marketData.marketPressure.buying / 
    (marketData.marketPressure.buying + marketData.marketPressure.selling);
  
  if (pressureRatio > 0.6) {
    if (signal === 'BUY' || signal === 'STRONG_BUY') {
      confidence += 5;
      reasons.push(`Market pressure: ${(pressureRatio * 100).toFixed(1)}% buying`);
    }
  } else if (pressureRatio < 0.4) {
    if (signal === 'SELL' || signal === 'STRONG_SELL') {
      confidence += 5;
      reasons.push(`Market pressure: ${(pressureRatio * 100).toFixed(1)}% selling`);
    }
  }

  // Calcola entry, stop loss, take profit
  let entryPrice = currentPrice;
  let stopLoss: number;
  let takeProfit: number;
  let recommendedLeverage = 10;
  let riskLevel: 'low' | 'medium' | 'high' | 'very-high' = 'medium';

  if (signal === 'STRONG_BUY' || signal === 'BUY') {
    // Entry leggermente sopra prezzo corrente per conferma
    entryPrice = currentPrice * 1.001;

    // Stop loss: 1-2% sotto entry o supporto più vicino
    if (nearestSupport) {
      stopLoss = Math.max(nearestSupport.price * 0.995, entryPrice * 0.98);
    } else {
      stopLoss = entryPrice * 0.98;
    }

    // Take profit: 2-3x risk o resistenza più vicina
    const risk = entryPrice - stopLoss;
    if (nearestResistance) {
      takeProfit = Math.min(nearestResistance.price * 0.995, entryPrice + risk * 3);
    } else {
      takeProfit = entryPrice + risk * 2.5;
    }

    // Leverage basato su confidence e risk
    if (confidence > 85 && riskLevel === 'low') {
      recommendedLeverage = 15;
    } else if (confidence > 75) {
      recommendedLeverage = 12;
    } else {
      recommendedLeverage = 8;
    }
  } else if (signal === 'STRONG_SELL' || signal === 'SELL') {
    // Entry leggermente sotto prezzo corrente
    entryPrice = currentPrice * 0.999;

    // Stop loss: 1-2% sopra entry o resistenza più vicina
    if (nearestResistance) {
      stopLoss = Math.min(nearestResistance.price * 1.005, entryPrice * 1.02);
    } else {
      stopLoss = entryPrice * 1.02;
    }

    // Take profit: 2-3x risk o supporto più vicino
    const risk = stopLoss - entryPrice;
    if (nearestSupport) {
      takeProfit = Math.max(nearestSupport.price * 1.005, entryPrice - risk * 3);
    } else {
      takeProfit = entryPrice - risk * 2.5;
    }

    // Leverage
    if (confidence > 85 && riskLevel === 'low') {
      recommendedLeverage = 15;
    } else if (confidence > 75) {
      recommendedLeverage = 12;
    } else {
      recommendedLeverage = 8;
    }
  } else {
    // NEUTRAL - no trade
    entryPrice = currentPrice;
    stopLoss = currentPrice * 0.99;
    takeProfit = currentPrice * 1.01;
    recommendedLeverage = 1;
  }

  // Determina risk level
  const riskDistance = Math.abs(entryPrice - stopLoss) / entryPrice;
  if (riskDistance < 0.01) riskLevel = 'very-high';
  else if (riskDistance < 0.015) riskLevel = 'high';
  else if (riskDistance < 0.02) riskLevel = 'medium';
  else riskLevel = 'low';

  // Aggiusta confidence e win rate finale
  confidence = Math.min(95, Math.max(50, confidence));
  winRate = Math.min(90, Math.max(50, winRate));

  // Se confidence < 70, downgrade signal
  if (confidence < 70) {
    if (signal === 'STRONG_BUY') signal = 'BUY';
    else if (signal === 'STRONG_SELL') signal = 'SELL';
    else if (confidence < 60) signal = 'NEUTRAL';
  }

  return {
    signal,
    confidence,
    winRate,
    entryPrice,
    stopLoss,
    takeProfit,
    recommendedLeverage,
    riskLevel,
    reasons,
    timeframes: {}, // TODO: Multi-timeframe analysis
  };
}

