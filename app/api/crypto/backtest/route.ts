/**
 * API Route: Backtesting
 * 
 * POST /api/crypto/backtest
 * 
 * Esegue backtesting di una strategia
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security/rate-limiting';
import { runBacktest, type BacktestConfig, type BacktestResult } from '@/lib/backtesting/backtest-engine';
import { getStrategyFunction } from '@/lib/backtesting/strategy-implementations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
  const rateLimitResult = await rateLimit(identifier, {
    maxRequests: 10, // Limit backtesting calls
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra poco.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      symbol,
      strategy,
      startDate,
      endDate,
      initialCapital,
      leverage,
      stopLossPercent,
      takeProfitPercent,
    } = body as Partial<BacktestConfig> & { 
      symbol: string;
      strategy: string;
      startDate?: string;
      endDate?: string;
      initialCapital?: number;
      leverage?: number;
      stopLossPercent?: number;
      takeProfitPercent?: number;
    };

    if (!symbol || !strategy || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Parametri richiesti: symbol, strategy, startDate, endDate' },
        { status: 400 }
      );
    }

    const config: BacktestConfig = {
      symbol,
      startDate: startDate as string,
      endDate: endDate as string,
      timeframe: '1h', // Default timeframe
      initialCapital: initialCapital || 10000,
      leverage: leverage || 10,
      commission: 0.001, // 0.1% default
    };

    // Get strategy function
    const strategyFunction = getStrategyFunction(strategy, {
      stopLossPercent: stopLossPercent || 0.02,
      takeProfitPercent: takeProfitPercent || 0.04,
    });

    // Convert to format expected by runBacktest
    // runBacktest expects: (data: any[], index: number) => { signal, confidence, stopLoss?, takeProfit? }
    // Note: getStrategyFunction returns (data: OHLCV[], index: number) => StrategySignal
    // We need to convert data format and call it correctly
    const adaptedSignalFunction = (data: any[], index: number) => {
      try {
        // Convert data to OHLCV format if needed
        const ohlcvData = data.map((d: any) => ({
          timestamp: d.timestamp || d[0] || Date.now(),
          open: d.open || d[1] || 0,
          high: d.high || d[2] || 0,
          low: d.low || d[3] || 0,
          close: d.close || d[4] || 0,
          volume: d.volume || d[5] || 0,
        }));
        const signal = strategyFunction(ohlcvData, index);
        return {
          signal: signal.type === 'buy' ? 'buy' : signal.type === 'sell' ? 'sell' : 'hold',
          confidence: signal.confidence || 0.5,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
        };
      } catch (error) {
        // Fallback on error
        console.error('Error in strategy function:', error);
        return {
          signal: 'hold' as const,
          confidence: 0,
        };
      }
    };

    const result = await runBacktest(config, adaptedSignalFunction);

    return NextResponse.json({
      success: true,
      result,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in backtesting:', error);
    return NextResponse.json(
      {
        error: 'Errore nel backtesting',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

