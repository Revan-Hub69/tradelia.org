/**
 * Multi-Exchange Futures Data Aggregator
 * 
 * Aggrega dati futures da Binance, OKX, Bybit
 */

import { getBinanceFuturesData } from '@/lib/price-apis/binance-futures';
import { getOKXFuturesData } from '@/lib/price-apis/okx-futures';
import { getBybitFuturesData } from '@/lib/price-apis/bybit-futures';

export interface AggregatedFuturesData {
  symbol: string;
  aggregatedFundingRate: number;
  aggregatedFundingRatePercent: number;
  totalOpenInterest: number;
  totalOpenInterestUsd: number;
  weightedLongShortRatio: number;
  exchanges: {
    exchange: string;
    fundingRate: number;
    fundingRatePercent: number;
    openInterest: number;
    openInterestUsd: number;
    longShortRatio: number;
  }[];
  timestamp: number;
}

/**
 * Aggrega dati futures da tutti gli exchange
 */
export async function aggregateFuturesData(symbol: string): Promise<AggregatedFuturesData | null> {
  try {
    const [binance, okx, bybit] = await Promise.allSettled([
      getBinanceFuturesData(symbol),
      getOKXFuturesData(symbol),
      getBybitFuturesData(symbol),
    ]);

    const exchanges: AggregatedFuturesData['exchanges'] = [];

    if (binance.status === 'fulfilled' && binance.value) {
      exchanges.push({
        exchange: 'Binance',
        fundingRate: binance.value.fundingRate,
        fundingRatePercent: binance.value.fundingRate, // fundingRate is already in percentage
        openInterest: binance.value.openInterest,
        openInterestUsd: binance.value.openInterestValue,
        longShortRatio: binance.value.longShortRatio,
      });
    }

    if (okx.status === 'fulfilled' && okx.value) {
      exchanges.push({
        exchange: 'OKX',
        fundingRate: okx.value.fundingRate,
        fundingRatePercent: okx.value.fundingRate, // fundingRate is already in percentage
        openInterest: okx.value.openInterest,
        openInterestUsd: okx.value.openInterestUsd,
        longShortRatio: okx.value.longShortRatio,
      });
    }

    if (bybit.status === 'fulfilled' && bybit.value) {
      exchanges.push({
        exchange: 'Bybit',
        fundingRate: bybit.value.fundingRate,
        fundingRatePercent: bybit.value.fundingRate, // fundingRate is already in percentage
        openInterest: bybit.value.openInterest,
        openInterestUsd: bybit.value.openInterestUsd,
        longShortRatio: bybit.value.longShortRatio,
      });
    }

    if (exchanges.length === 0) {
      return null;
    }

    // Calcola aggregati weighted by open interest
    const totalOI = exchanges.reduce((sum, e) => sum + e.openInterestUsd, 0);
    
    const weightedFundingRate = exchanges.reduce((sum, e) => {
      const weight = e.openInterestUsd / totalOI;
      return sum + (e.fundingRate * weight);
    }, 0);

    const weightedLongShortRatio = exchanges.reduce((sum, e) => {
      const weight = e.openInterestUsd / totalOI;
      return sum + (e.longShortRatio * weight);
    }, 0);

    return {
      symbol,
      aggregatedFundingRate: weightedFundingRate,
      aggregatedFundingRatePercent: weightedFundingRate * 100 * 365 * 3, // Annualized
      totalOpenInterest: exchanges.reduce((sum, e) => sum + e.openInterest, 0),
      totalOpenInterestUsd: totalOI,
      weightedLongShortRatio,
      exchanges,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error aggregating futures data for ${symbol}:`, error);
    return null;
  }
}

