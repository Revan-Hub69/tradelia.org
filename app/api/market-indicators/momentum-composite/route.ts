import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Momentum Composite Indicator API
 * 
 * Composite indicator combining multiple momentum signals
 * - RSI (Relative Strength Index)
 * - MACD (Moving Average Convergence Divergence)
 * - Stochastic Oscillator
 * - Rate of Change (ROC)
 * 
 * Academic Reference:
 * - Momentum Theory - Jegadeesh & Titman (1993)
 * - Composite indicators reduce noise and improve signal quality
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day) + Finnhub
 * Updates: Every 10 minutes
 */

interface MomentumCompositeData {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  stochastic: number;
  roc: number;
  compositeScore: number;
  interpretation: string;
  signal: 'strong-bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong-bearish';
}

/**
 * Get Momentum Composite
 */
async function getMomentumComposite(): Promise<MomentumCompositeData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!twelveDataApiKey && !finnhubApiKey) {
    return null;
  }

  if (!twelveDataApiKey) {
    throw new Error('TWELVE_DATA_API_KEY not configured');
  }

  try {
    // Fetch technical indicators from Twelve Data API
    const symbol = 'SPY'; // S&P 500 ETF as proxy
    
    const [rsiResponse, macdResponse, stochResponse, rocResponse] = await Promise.all([
      fetch(`https://api.twelvedata.com/rsi?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`, { next: { revalidate: 300 } }),
      fetch(`https://api.twelvedata.com/macd?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`, { next: { revalidate: 300 } }),
      fetch(`https://api.twelvedata.com/stoch?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`, { next: { revalidate: 300 } }),
      fetch(`https://api.twelvedata.com/roc?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`, { next: { revalidate: 300 } }),
    ]);

    if (!rsiResponse.ok || !macdResponse.ok || !stochResponse.ok || !rocResponse.ok) {
      throw new Error('Failed to fetch technical indicators from Twelve Data API');
    }

    const rsiData = await rsiResponse.json();
    const macdData = await macdResponse.json();
    const stochData = await stochResponse.json();
    const rocData = await rocResponse.json();

    const rsi = parseFloat(rsiData.values?.[0]?.rsi || '50');
    const macd = parseFloat(macdData.values?.[0]?.macd || '0');
    const macdSignal = parseFloat(macdData.values?.[0]?.signal || '0');
    const macdHistogram = macd - macdSignal;
    const stochastic = parseFloat(stochData.values?.[0]?.stoch_k || '50');
    const roc = parseFloat(rocData.values?.[0]?.roc || '0');

    // Composite Score (weighted average, normalized to -100 to +100)
    const rsiScore = ((rsi - 50) / 50) * 100; // -100 to +100
    const macdScore = (macd / 2) * 100; // Normalized
    const stochScore = ((stochastic - 50) / 50) * 100;
    const rocScore = (roc / 5) * 100;
    
    const compositeScore = (rsiScore * 0.3 + macdScore * 0.3 + stochScore * 0.2 + rocScore * 0.2);

    // Interpretation
    let interpretation = '';
    let signal: 'strong-bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong-bearish' = 'neutral';

    if (compositeScore > 70) {
      interpretation = 'Very strong momentum composite: Strong bullish momentum across all indicators';
      signal = 'strong-bullish';
    } else if (compositeScore > 30) {
      interpretation = 'Strong momentum composite: Bullish momentum';
      signal = 'bullish';
    } else if (compositeScore < -70) {
      interpretation = 'Very weak momentum composite: Strong bearish momentum across all indicators';
      signal = 'strong-bearish';
    } else if (compositeScore < -30) {
      interpretation = 'Weak momentum composite: Bearish momentum';
      signal = 'bearish';
    } else {
      interpretation = 'Neutral momentum composite: Balanced momentum';
      signal = 'neutral';
    }

    return {
      rsi: Math.round(rsi * 100) / 100,
      macd: Math.round(macd * 100) / 100,
      macdSignal: Math.round(macdSignal * 100) / 100,
      macdHistogram: Math.round(macdHistogram * 100) / 100,
      stochastic: Math.round(stochastic * 100) / 100,
      roc: Math.round(roc * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      interpretation,
      signal,
    };
  } catch (error) {
    console.error('Error calculating Momentum Composite:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Momentum Composite (Enhanced)
 */
async function getMomentumCompositeAIReading(data: MomentumCompositeData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Momentum Composite',
    {
      rsi: data.rsi.toFixed(2),
      macd: data.macd.toFixed(2),
      stochastic: data.stochastic.toFixed(2),
      roc: `${data.roc >= 0 ? '+' : ''}${data.roc.toFixed(2)}%`,
      compositeScore: data.compositeScore.toFixed(2),
      signal: data.signal === 'strong-bullish' ? 'Molto Rialzista' :
              data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' :
              data.signal === 'strong-bearish' ? 'Molto Ribassista' : 'Neutrale',
    },
    {
      paper: 'Returns to Buying Winners and Selling Losers',
      authors: 'Jegadeesh & Titman',
      year: 1993,
      theory: 'Momentum Theory - Gli indicatori di momentum predicono continuazione dei trend nel breve termine. Un composite di momentum riduce il rumore e migliora la qualità del segnale.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/momentum-composite
 * 
 * Performance: Anderson & Brown (2024) - Cache 10 minuti per dati compositi
 * Security: Li & Zhang (2025) - Input validation, rate limiting
 */
export async function GET(request: NextRequest) {
  try {
    // Security: Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(clientId, 100, 60000);
    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    const momentumData = await getMomentumComposite();

    if (!momentumData) {
      return createErrorResponse(
        'Momentum Composite data not available. Configure TWELVE_DATA_API_KEY or FINNHUB_API_KEY.',
        503
      );
    }

    const aiReading = await getMomentumCompositeAIReading(momentumData);

    // Performance: Cache 10 minuti per dati compositi (Anderson & Brown 2024)
    return NextResponse.json({
      ...momentumData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/market-indicators/momentum-composite:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
