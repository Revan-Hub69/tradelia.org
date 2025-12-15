/**
 * Microstructure Alert System
 * 
 * Alert quando condizioni microstrutturali si verificano
 * Per semi-automazione (decision support, non trading automatico)
 */

import { OrderBookEntry } from '@/lib/price-apis/binance';

export interface AlertCondition {
  id: string;
  name: string;
  description: string;
  check: (data: MarketData) => boolean;
  severity: 'info' | 'warning' | 'critical';
  message: (data: MarketData) => string;
}

export interface MarketData {
  orderBook: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    totalBidVolume: number;
    totalAskVolume: number;
  };
  imbalance: {
    overallImbalance: number;
    spreadPercent: number;
  };
  futures?: {
    fundingRatePercent?: number;
    openInterest?: number;
  };
}

/**
 * Condizioni di alert predefinite
 */
export const ALERT_CONDITIONS: AlertCondition[] = [
  {
    id: 'high-imbalance',
    name: 'Imbalance Estremo',
    description: 'Imbalance bid/ask molto alto (>70%)',
    check: (data) => Math.abs(data.imbalance.overallImbalance) > 0.7,
    severity: 'warning',
    message: (data) => {
      const direction = data.imbalance.overallImbalance > 0 ? 'domanda' : 'offerta';
      return `Imbalance estremo: ${(Math.abs(data.imbalance.overallImbalance) * 100).toFixed(1)}% a favore della ${direction}. Possibile manipolazione o liquidità artificiale.`;
    },
  },
  {
    id: 'wide-spread',
    name: 'Spread Largo',
    description: 'Spread >0.1% (rischio slippage alto)',
    check: (data) => data.imbalance.spreadPercent > 0.1,
    severity: 'warning',
    message: (data) =>
      `Spread molto largo: ${data.imbalance.spreadPercent.toFixed(3)}%. Rischio slippage elevato. Evitare market orders.`,
  },
  {
    id: 'low-liquidity',
    name: 'Liquidità Bassa',
    description: 'Volume totale order book < threshold',
    check: (data) => {
      const totalVolume = data.orderBook.totalBidVolume + data.orderBook.totalAskVolume;
      return totalVolume < 100; // Threshold configurabile
    },
    severity: 'warning',
    message: () =>
      'Liquidità molto bassa nel order book. Rischio di esecuzione difficile o slippage estremo.',
  },
  {
    id: 'extreme-funding',
    name: 'Funding Rate Estremo',
    description: 'Funding rate >0.1% o <-0.1%',
    check: (data) => {
      if (!data.futures?.fundingRatePercent) return false;
      return Math.abs(data.futures.fundingRatePercent) > 0.1;
    },
    severity: 'info',
    message: (data) => {
      const rate = data.futures!.fundingRatePercent!;
      const direction = rate > 0 ? 'long pagano short' : 'short pagano long';
      return `Funding rate estremo: ${rate.toFixed(4)}% (${direction}). Possibile eccesso di sentiment, rischio reversal.`;
    },
  },
  {
    id: 'favorable-conditions',
    name: 'Condizioni Favorevoli',
    description: 'Imbalance moderato + spread stretto + liquidità buona',
    check: (data) => {
      const imbalanceAbs = Math.abs(data.imbalance.overallImbalance);
      const totalVolume = data.orderBook.totalBidVolume + data.orderBook.totalAskVolume;
      return (
        imbalanceAbs > 0.3 &&
        imbalanceAbs < 0.6 &&
        data.imbalance.spreadPercent < 0.05 &&
        totalVolume > 500
      );
    },
    severity: 'info',
    message: (data) => {
      const direction = data.imbalance.overallImbalance > 0 ? 'long' : 'short';
      return `Condizioni microstrutturali favorevoli per ${direction}: imbalance ${(data.imbalance.overallImbalance * 100).toFixed(1)}%, spread ${data.imbalance.spreadPercent.toFixed(3)}%, liquidità buona. ATTENZIONE: Edge piccolo, costi possono mangiarlo.`;
    },
  },
];

/**
 * Controlla tutte le condizioni e ritorna alert attivi
 */
export function checkAlerts(data: MarketData): Array<{
  condition: AlertCondition;
  message: string;
}> {
  const activeAlerts: Array<{ condition: AlertCondition; message: string }> = [];

  for (const condition of ALERT_CONDITIONS) {
    try {
      if (condition.check(data)) {
        activeAlerts.push({
          condition,
          message: condition.message(data),
        });
      }
    } catch (error) {
      console.error(`Error checking alert condition ${condition.id}:`, error);
    }
  }

  return activeAlerts;
}

/**
 * Suggerimenti di trading basati su dati microstrutturali
 * NOTA: Non sono consigli operativi, ma analisi di condizioni
 */
export interface TradingSuggestion {
  direction: 'long' | 'short' | 'neutral';
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  risks: string[];
  recommendedSize?: string; // Es: "Small (0.1x)", "Medium (0.5x)", "Large (1x)"
  stopLoss?: string;
  takeProfit?: string;
}

export function generateTradingSuggestion(data: MarketData): TradingSuggestion | null {
  // Non generare suggerimenti se condizioni non sono chiare
  if (Math.abs(data.imbalance.overallImbalance) < 0.2) {
    return null; // Mercato troppo bilanciato
  }

  const imbalanceAbs = Math.abs(data.imbalance.overallImbalance);
  const direction: 'long' | 'short' = data.imbalance.overallImbalance > 0 ? 'long' : 'short';
  
  // Confidence basata su forza del segnale
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (imbalanceAbs > 0.6 && data.imbalance.spreadPercent < 0.05) {
    confidence = 'high';
  } else if (imbalanceAbs > 0.4 && data.imbalance.spreadPercent < 0.1) {
    confidence = 'medium';
  }

  const reasoning = `Imbalance ${(imbalanceAbs * 100).toFixed(1)}% a favore ${direction === 'long' ? 'domanda' : 'offerta'}, spread ${data.imbalance.spreadPercent.toFixed(3)}%. Segnale microstrutturale ${confidence === 'high' ? 'forte' : confidence === 'medium' ? 'moderato' : 'debole'}.`;

  const risks: string[] = [
    'Edge microstrutturale è piccolo (tipicamente <0.1%)',
    'Costi di transazione (fee + spread) possono eliminare l\'edge',
    'Effetto è locale nel tempo (minuti, non ore)',
    'Non è un segnale garantito, solo relazione statistica debole',
  ];

  if (data.imbalance.spreadPercent > 0.1) {
    risks.push('Spread largo aumenta rischio slippage');
  }

  if (data.orderBook.totalBidVolume + data.orderBook.totalAskVolume < 200) {
    risks.push('Liquidità bassa aumenta rischio esecuzione difficile');
  }

  // Size suggerita basata su confidence e liquidità
  let recommendedSize: string | undefined;
  if (confidence === 'high') {
    recommendedSize = 'Small (0.1-0.2x position size normale)';
  } else if (confidence === 'medium') {
    recommendedSize = 'Very Small (0.05-0.1x)';
  } else {
    recommendedSize = 'Minimal (0.01-0.05x) o evitare';
  }

  return {
    direction,
    confidence,
    reasoning,
    risks,
    recommendedSize,
    stopLoss: '2-3x spread attuale',
    takeProfit: '0.5-1% o quando imbalance si inverte',
  };
}

