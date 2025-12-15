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
  const rateLimitResult = await rateLimit(request, {
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
    } = body as Partial<BacktestConfig> & { symbol: string };

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
    const adaptedSignalFunction = (data: any[], index: number) => {
      try {
        const signal = strategyFunction(data, index);
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

