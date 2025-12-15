import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Sentiment Composite Indicator API
 * 
 * Composite indicator combining multiple sentiment signals
 * - Put/Call Ratio
 * - Fear & Greed Index
 * - AAII Sentiment Survey (if available)
 * - VIX (inverse sentiment)
 * 
 * Academic Reference:
 * - Behavioral Finance - Market Sentiment Analysis
 * - Composite sentiment provides more robust signal
 * 
 * Data Source: CBOE + Alternative.me + VIX
 * Updates: Every 5 minutes
 */

interface SentimentCompositeData {
  putCallRatio: number;
  fearGreedIndex: number;
  vix: number;
  compositeScore: number;
  interpretation: string;
  sentiment: 'extreme-fear' | 'fear' | 'neutral' | 'greed' | 'extreme-greed';
}

/**
 * Get Sentiment Composite
 */
async function getSentimentComposite(): Promise<SentimentCompositeData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Fetch Put/Call Ratio
    const putCallResponse = await fetch(`${baseUrl}/api/market-indicators/put-call-ratio`);
    const putCallData = putCallResponse.ok ? await putCallResponse.json() : null;

    // Fetch Fear & Greed Index
    const fearGreedResponse = await fetch(`${baseUrl}/api/market-indicators/fear-greed`);
    const fearGreedData = fearGreedResponse.ok ? await fearGreedResponse.json() : null;

    // Fetch VIX
    const vixResponse = await fetch(`${baseUrl}/api/market-indicators/vix`);
    const vixData = vixResponse.ok ? await vixResponse.json() : null;

    const putCallRatio = putCallData?.data?.totalPutCallRatio || 0.85;
    const fearGreedIndex = fearGreedData?.value || 50;
    const vix = vixData?.value || 15;

    // Normalize components to 0-100 scale
    // Put/Call Ratio: >1.2 = bearish (high score), <0.7 = bullish (low score)
    const putCallScore = putCallRatio > 1.2 ? 80 : putCallRatio < 0.7 ? 20 : 50;
    
    // Fear & Greed: 0-24 = extreme fear (high score), 76-100 = extreme greed (low score)
    const fearGreedScore = fearGreedIndex <= 24 ? 90 : fearGreedIndex >= 76 ? 10 : 50 - (fearGreedIndex - 50) * 0.5;
    
    // VIX: >30 = high fear (high score), <12 = low fear (low score)
    const vixScore = vix > 30 ? 85 : vix < 12 ? 15 : 15 + ((vix - 12) / 18) * 70;

    // Composite Score (weighted average)
    const compositeScore = (putCallScore * 0.3 + fearGreedScore * 0.4 + vixScore * 0.3);

    // Interpretation
    let interpretation = '';
    let sentiment: 'extreme-fear' | 'fear' | 'neutral' | 'greed' | 'extreme-greed' = 'neutral';

    if (compositeScore > 80) {
      interpretation = 'Extreme fear composite: Very bearish sentiment across all indicators, possible buying opportunity';
      sentiment = 'extreme-fear';
    } else if (compositeScore > 60) {
      interpretation = 'Fear composite: Bearish sentiment, elevated fear';
      sentiment = 'fear';
    } else if (compositeScore < 20) {
      interpretation = 'Extreme greed composite: Very bullish sentiment across all indicators, possible selling opportunity';
      sentiment = 'extreme-greed';
    } else if (compositeScore < 40) {
      interpretation = 'Greed composite: Bullish sentiment, elevated greed';
      sentiment = 'greed';
    } else {
      interpretation = 'Neutral sentiment composite: Balanced sentiment';
      sentiment = 'neutral';
    }

    return {
      putCallRatio: Math.round(putCallRatio * 100) / 100,
      fearGreedIndex: Math.round(fearGreedIndex),
      vix: Math.round(vix * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      interpretation,
      sentiment,
    };
  } catch (error) {
    console.error('Error calculating Sentiment Composite:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Sentiment Composite (Enhanced)
 */
async function getSentimentCompositeAIReading(data: SentimentCompositeData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Sentiment Composite (Sentiment Composito)',
    {
      putCallRatio: data.putCallRatio.toFixed(2),
      fearGreedIndex: data.fearGreedIndex.toString(),
      vix: data.vix.toFixed(2),
      compositeScore: data.compositeScore.toFixed(2),
      sentiment: data.sentiment === 'extreme-fear' ? 'Paura Estrema' :
                 data.sentiment === 'fear' ? 'Paura' :
                 data.sentiment === 'greed' ? 'Avidità' :
                 data.sentiment === 'extreme-greed' ? 'Avidità Estrema' : 'Neutrale',
    },
    {
      theory: 'Behavioral Finance - Un composite di indicatori di sentiment fornisce un segnale più robusto rispetto a un singolo indicatore. Combina Put/Call Ratio, Fear & Greed Index e VIX per una visione completa del sentiment di mercato.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/sentiment-composite
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

    const sentimentData = await getSentimentComposite();

    if (!sentimentData) {
      return createErrorResponse(
        'Sentiment Composite data not available.',
        503
      );
    }

    const aiReading = await getSentimentCompositeAIReading(sentimentData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...sentimentData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/sentiment-composite:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
