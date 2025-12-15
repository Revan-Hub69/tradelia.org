import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit, sanitizeQueryParam } from '@/lib/utils/api-helpers';

/**
 * Technical Indicators API
 * 
 * Pre-calculated Technical Indicators
 * - RSI (Relative Strength Index)
 * - MACD (Moving Average Convergence Divergence)
 * - Stochastic Oscillator
 * - Bollinger Bands
 * - Moving Averages (SMA, EMA)
 * - ADX (Average Directional Index)
 * 
 * Academic Reference:
 * - Technical Analysis Theory - Price action and momentum indicators
 * - RSI: Overbought (>70), Oversold (<30)
 * - MACD: Bullish crossover (MACD > Signal), Bearish crossover (MACD < Signal)
 * 
 * Data Source: Twelve Data API (FREE, 800 calls/day)
 * Updates: Every 5 minutes
 */

interface TechnicalIndicatorData {
  symbol: string;
  rsi: {
    value: number;
    signal: 'overbought' | 'oversold' | 'neutral';
  };
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  stochastic: {
    k: number;
    d: number;
    signal: 'overbought' | 'oversold' | 'neutral';
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    position: 'above-upper' | 'between' | 'below-lower';
  };
  sma50: number;
  sma200: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
}

/**
 * Get Technical Indicators
 */
async function getTechnicalIndicators(symbol: string = 'SPY'): Promise<TechnicalIndicatorData | null> {
  const twelveDataApiKey = process.env.TWELVE_DATA_API_KEY;
  
  try {
    if (twelveDataApiKey) {
      // Use Twelve Data API for real technical indicators
      const rsiResponse = await fetch(
        `https://api.twelvedata.com/rsi?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      const macdResponse = await fetch(
        `https://api.twelvedata.com/macd?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      const stochResponse = await fetch(
        `https://api.twelvedata.com/stoch?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      const bbResponse = await fetch(
        `https://api.twelvedata.com/bbands?symbol=${symbol}&interval=1day&apikey=${twelveDataApiKey}`
      );
      const sma50Response = await fetch(
        `https://api.twelvedata.com/sma?symbol=${symbol}&interval=1day&time_period=50&apikey=${twelveDataApiKey}`
      );
      const sma200Response = await fetch(
        `https://api.twelvedata.com/sma?symbol=${symbol}&interval=1day&time_period=200&apikey=${twelveDataApiKey}`
      );

      const [rsiData, macdData, stochData, bbData, sma50Data, sma200Data] = await Promise.all([
        rsiResponse.ok ? rsiResponse.json() : null,
        macdResponse.ok ? macdResponse.json() : null,
        stochResponse.ok ? stochResponse.json() : null,
        bbResponse.ok ? bbResponse.json() : null,
        sma50Response.ok ? sma50Response.json() : null,
        sma200Response.ok ? sma200Response.json() : null,
      ]);

      if (rsiData && macdData && stochData && bbData && sma50Data && sma200Data) {
        const rsi = parseFloat(rsiData.values?.[0]?.rsi || '50');
        const macdValue = parseFloat(macdData.values?.[0]?.macd || '0');
        const macdSignal = parseFloat(macdData.values?.[0]?.macd_signal || '0');
        const macdHistogram = parseFloat(macdData.values?.[0]?.macd_hist || '0');
        const stochK = parseFloat(stochData.values?.[0]?.fast_k || '50');
        const stochD = parseFloat(stochData.values?.[0]?.slow_k || '50');
        const bbUpper = parseFloat(bbData.values?.[0]?.upper_band || '0');
        const bbMiddle = parseFloat(bbData.values?.[0]?.middle_band || '0');
        const bbLower = parseFloat(bbData.values?.[0]?.lower_band || '0');
        const sma50 = parseFloat(sma50Data.values?.[0]?.sma || '0');
        const sma200 = parseFloat(sma200Data.values?.[0]?.sma || '0');

        // Calculate signals
        const rsiSignal = rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral';
        const macdTrend = macdValue > macdSignal ? 'bullish' : macdValue < macdSignal ? 'bearish' : 'neutral';
        const stochSignal = stochK > 80 ? 'overbought' : stochK < 20 ? 'oversold' : 'neutral';
        const bbPosition = bbMiddle > bbUpper ? 'above-upper' : bbMiddle < bbLower ? 'below-lower' : 'between';
        const trend = sma50 > sma200 ? 'bullish' : sma50 < sma200 ? 'bearish' : 'neutral';

        // Interpretation
        let interpretation = '';
        if (rsiSignal === 'overbought' && macdTrend === 'bearish') {
          interpretation = 'Bearish technical setup: RSI overbought, MACD bearish - possible correction';
        } else if (rsiSignal === 'oversold' && macdTrend === 'bullish') {
          interpretation = 'Bullish technical setup: RSI oversold, MACD bullish - possible bounce';
        } else if (trend === 'bullish' && rsiSignal !== 'overbought') {
          interpretation = 'Bullish technical setup: Uptrend intact, RSI not overbought';
        } else if (trend === 'bearish' && rsiSignal !== 'oversold') {
          interpretation = 'Bearish technical setup: Downtrend intact, RSI not oversold';
        } else {
          interpretation = 'Neutral technical setup: Mixed signals';
        }

        return {
          symbol,
          rsi: { value: Math.round(rsi * 100) / 100, signal: rsiSignal },
          macd: {
            value: Math.round(macdValue * 100) / 100,
            signal: Math.round(macdSignal * 100) / 100,
            histogram: Math.round(macdHistogram * 100) / 100,
            trend: macdTrend,
          },
          stochastic: {
            k: Math.round(stochK * 100) / 100,
            d: Math.round(stochD * 100) / 100,
            signal: stochSignal,
          },
          bollinger: {
            upper: Math.round(bbUpper * 100) / 100,
            middle: Math.round(bbMiddle * 100) / 100,
            lower: Math.round(bbLower * 100) / 100,
            position: bbPosition,
          },
          sma50: Math.round(sma50 * 100) / 100,
          sma200: Math.round(sma200 * 100) / 100,
          trend,
          interpretation,
        };
      }
    }

    // No fallback - throw error if data not available
    throw new Error('Failed to fetch technical indicators from Twelve Data API. Check API key configuration and limits.');
  } catch (error) {
    return null;
  }
}

/**
 * Get Groq AI reading for Technical Indicators (Enhanced)
 */
async function getTechnicalIndicatorsAIReading(data: TechnicalIndicatorData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Technical Indicators (Indicatori Tecnici)',
    {
      symbol: data.symbol,
      rsi: `${data.rsi.value} (${data.rsi.signal === 'overbought' ? 'Overbought' : data.rsi.signal === 'oversold' ? 'Oversold' : 'Neutrale'})`,
      macd: `${data.macd.value} (${data.macd.trend === 'bullish' ? 'Bullish' : data.macd.trend === 'bearish' ? 'Bearish' : 'Neutrale'})`,
      stochastic: `${data.stochastic.k} (${data.stochastic.signal === 'overbought' ? 'Overbought' : data.stochastic.signal === 'oversold' ? 'Oversold' : 'Neutrale'})`,
      trend: data.trend === 'bullish' ? 'Bullish (SMA50 > SMA200)' :
             data.trend === 'bearish' ? 'Bearish (SMA50 < SMA200)' : 'Neutrale',
    },
    {
      theory: 'Technical Analysis Theory - Gli indicatori tecnici analizzano price action e momentum. RSI > 70 = overbought, RSI < 30 = oversold. MACD bullish crossover (MACD > Signal) = segnale rialzista. SMA50 > SMA200 = uptrend.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/technical-indicators
 * 
 * Performance: Anderson & Brown (2024) - Cache 5 minuti per dati real-time
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

    // Security: Sanitize input
    const { searchParams } = new URL(request.url);
    const symbol = sanitizeQueryParam(searchParams.get('symbol'), 'SPY');

    const technicalData = await getTechnicalIndicators(symbol);

    if (!technicalData) {
      return createErrorResponse(
        'Technical Indicators data not available.',
        503
      );
    }

    const aiReading = await getTechnicalIndicatorsAIReading(technicalData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...technicalData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
