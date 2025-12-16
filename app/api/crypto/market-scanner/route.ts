/**
 * API Route: Market Scanner
 * 
 * GET /api/crypto/market-scanner
 * 
 * Scanner automatico per trovare le migliori opportunità di trading
 * 
 * Query params:
 * - minConfidence: number (optional) - Min confidence (default: 70)
 * - minWinRate: number (optional) - Min win rate (default: 75)
 * - maxRisk: string (optional) - Max risk level (default: 'high')
 * - limit: number (optional) - Max results (default: 20)
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security/rate-limiting';
import { calculateHighPrecisionSignal } from '@/lib/trading/signal-system';
import { getBinanceFuturesData } from '@/lib/price-apis/binance-futures';
import { calculateSupportResistance } from '@/lib/analysis/support-resistance';
import { calculateMarketPressure } from '@/lib/analysis/market-pressure';
import { getTopBinanceCryptocurrencies } from '@/lib/crypto/top-crypto-list';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScannerResult {
  symbol: string;
  name: string;
  price: number;
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  winRate: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  recommendedLeverage: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  reasons: string[];
  score: number; // Overall score 0-100
  metrics: {
    fundingRate: number;
    orderFlowImbalance: number;
    marketPressure: number;
    liquidationRisk: string;
    multiTimeframeAlignment?: number;
  };
}

async function scanCrypto(symbol: string): Promise<ScannerResult | null> {
  try {
    // Fetch all data in parallel
    const [marketData, futuresData, orderFlowData] = await Promise.allSettled([
      // Market data
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`).then(r => r.json()),
      // Futures data
      getBinanceFuturesData(symbol),
      // Order flow (simplified - use recent trades)
      fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}USDT&limit=100`).then(r => r.json()),
    ]);

    if (marketData.status !== 'fulfilled' || !marketData.value) {
      return null;
    }

    const ticker = marketData.value;
    const price = parseFloat(ticker.lastPrice);
    const change24h = parseFloat(ticker.priceChangePercent);

    // Get futures data
    const futures = futuresData.status === 'fulfilled' ? futuresData.value : null;
    
    // Calculate order flow imbalance (simplified)
    const trades = orderFlowData.status === 'fulfilled' ? orderFlowData.value : [];
    let buyVolume = 0;
    let sellVolume = 0;
    
    if (Array.isArray(trades)) {
      trades.forEach((trade: any) => {
        const volume = parseFloat(trade.qty) * parseFloat(trade.price);
        if (!trade.m) { // Buyer is maker = sell pressure
          sellVolume += volume;
        } else {
          buyVolume += volume;
        }
      });
    }
    
    const totalVolume = buyVolume + sellVolume;
    const orderFlowImbalance = totalVolume > 0 ? (buyVolume - sellVolume) / totalVolume : 0;

    // Calculate support/resistance and market pressure (fetch order book first)
    let supportResistance: any[] = [];
    let marketPressure: any = { buying: 0, selling: 0, overall: 0, strength: 'weak' };
    try {
      const orderBookResponse = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}USDT&limit=20`);
      if (orderBookResponse.ok) {
        const orderBook = await orderBookResponse.json();
        const bids = orderBook.bids.map(([price, qty]: [string, string]) => ({ price: parseFloat(price), quantity: parseFloat(qty) }));
        const asks = orderBook.asks.map(([price, qty]: [string, string]) => ({ price: parseFloat(price), quantity: parseFloat(qty) }));
        
        supportResistance = calculateSupportResistance(bids, asks, price, 10);
        
        // Calculate market pressure
        const pressureResult = calculateMarketPressure(
          bids,
          asks,
          price,
          futures?.fundingRate
        );
        marketPressure = {
          buying: pressureResult.overall > 0 ? pressureResult.overall : 0,
          selling: pressureResult.overall < 0 ? Math.abs(pressureResult.overall) : 0,
          overall: pressureResult.overall,
          strength: pressureResult.strength,
        };
      }
    } catch (error) {
      console.error(`Error fetching order book for ${symbol}:`, error);
    }

    // Generate signal
    const signal = calculateHighPrecisionSignal(
      {
        price,
        supportResistance: supportResistance || [],
        marketPressure: {
          buying: marketPressure.buying,
          selling: marketPressure.selling,
        },
      },
      futures ? {
        fundingRate: futures.fundingRate || 0,
        openInterest: futures.openInterest || 0,
        longShortRatio: futures.longShortRatio || 1,
        liquidationRisk: futures.liquidationRisk || 'medium',
      } : null,
      {
        imbalance: orderFlowImbalance,
        pressure: orderFlowImbalance > 0.1 ? 'buying' : orderFlowImbalance < -0.1 ? 'selling' : 'neutral',
      },
      null,
      undefined
    );

    // Calculate score (0-100)
    let score = 50; // Base score

    // Signal strength
    if (signal.signal === 'STRONG_BUY' || signal.signal === 'STRONG_SELL') {
      score += 25;
    } else if (signal.signal === 'BUY' || signal.signal === 'SELL') {
      score += 15;
    }

    // Confidence
    score += (signal.confidence / 100) * 20;

    // Risk adjustment
    if (signal.riskLevel === 'low') {
      score += 10;
    } else if (signal.riskLevel === 'very-high') {
      score -= 20;
    }

    // Win rate
    score += (signal.winRate / 100) * 15;

    // Order flow alignment
    if (Math.abs(orderFlowImbalance) > 0.2) {
      score += 10;
    }

    // Funding rate (avoid extreme funding)
    if (futures && Math.abs(futures.fundingRate) < 0.1) {
      score += 5;
    }

    score = Math.max(0, Math.min(100, score));

    return {
      symbol,
      name: symbol, // Will be enriched later
      price,
      signal: signal.signal,
      confidence: signal.confidence,
      winRate: signal.winRate,
      riskLevel: signal.riskLevel,
      recommendedLeverage: signal.recommendedLeverage,
      entryPrice: signal.entryPrice,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
      reasons: signal.reasons,
      score,
      metrics: {
        fundingRate: futures?.fundingRate || 0,
        orderFlowImbalance,
        marketPressure: marketPressure.overall,
        liquidationRisk: futures?.liquidationRisk || 'medium',
      },
    };
  } catch (error) {
    console.error(`Error scanning ${symbol}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
  const rateLimitResult = await rateLimit(identifier, {
    maxRequests: 20, // Aumentato per supportare refresh ogni 15 secondi
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra poco.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const minConfidence = parseFloat(searchParams.get('minConfidence') || '70');
    const minWinRate = parseFloat(searchParams.get('minWinRate') || '75');
    const maxRisk = searchParams.get('maxRisk') || 'high';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get top cryptos
    const cryptos = await getTopBinanceCryptocurrencies(50);

    // Scan all cryptos in parallel (with concurrency limit)
    const scanPromises: Promise<ScannerResult | null>[] = [];
    const concurrency = 3; // Reduced to avoid rate limits
    const delayBetweenBatches = 500; // Increased delay
    
    for (let i = 0; i < cryptos.length; i += concurrency) {
      const batch = cryptos.slice(i, i + concurrency);
      const batchPromises = batch.map(crypto => 
        scanCrypto(crypto.symbol).catch(err => {
          console.error(`Error scanning ${crypto.symbol}:`, err);
          return null;
        })
      );
      scanPromises.push(...batchPromises);
      
      // Delay between batches to avoid rate limits
      if (i + concurrency < cryptos.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const results = await Promise.all(scanPromises);
    const validResults = results.filter((r): r is ScannerResult => 
      r !== null &&
      r.confidence >= minConfidence &&
      r.winRate >= minWinRate &&
      (r.riskLevel === 'low' || r.riskLevel === 'medium' || (maxRisk === 'high' && r.riskLevel === 'high')) &&
      (r.signal === 'STRONG_BUY' || r.signal === 'BUY' || r.signal === 'STRONG_SELL' || r.signal === 'SELL')
    );

    // Sort by score (highest first)
    validResults.sort((a, b) => b.score - a.score);

    // Enrich with names
    const enrichedResults = validResults.slice(0, limit).map(result => {
      const crypto = cryptos.find(c => c.symbol === result.symbol);
      return {
        ...result,
        name: crypto?.name || result.symbol,
      };
    });

    return NextResponse.json({
      success: true,
      results: enrichedResults,
      total: enrichedResults.length,
      timestamp: Date.now(),
      filters: {
        minConfidence,
        minWinRate,
        maxRisk,
        limit,
      },
    });
  } catch (error) {
    console.error('Error in market scanner:', error);
    return NextResponse.json(
      {
        error: 'Errore nello scanner',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

