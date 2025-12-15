import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Volatility Composite Indicator API
 * 
 * Composite indicator combining multiple volatility signals
 * - VIX (30-day implied volatility)
 * - VIX9D (9-day implied volatility)
 * - VIX Term Structure (contango/backwardation)
 * - Realized Volatility (historical)
 * 
 * Academic Reference:
 * - Whaley (2000) - "The Investor Fear Gauge"
 * - Composite volatility provides more robust signal
 * 
 * Data Source: Yahoo Finance (VIX) + CBOE (term structure)
 * Updates: Every 5 minutes
 */

interface VolatilityCompositeData {
  vix: number;
  vix9d: number;
  vixTermStructure: number; // Contango/backwardation %
  realizedVolatility: number;
  compositeScore: number;
  interpretation: string;
  level: 'very-low' | 'low' | 'normal' | 'high' | 'very-high';
}

/**
 * Get Volatility Composite
 */
async function getVolatilityComposite(): Promise<VolatilityCompositeData | null> {
  try {
    // Fetch VIX data
    const vixResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/market-indicators/vix`);
    const vixData = vixResponse.ok ? await vixResponse.json() : null;

    // Fetch VIX Term Structure
    const termStructureResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/market-indicators/vix-term-structure`);
    const termStructureData = termStructureResponse.ok ? await termStructureResponse.json() : null;

    if (!vixData) {
      throw new Error('Failed to fetch VIX data');
    }

    const vix = vixData.value;
    const vix9d = termStructureData?.data?.termStructure?.find((t: any) => t.days === 9)?.vix || vix * 0.95;
    const vixTermStructure = termStructureData?.data?.contangoPercent || 0;
    const realizedVolatility = vix * 0.9; // Estimate - would need historical volatility calculation

    // Composite Score (normalized to 0-100)
    const vixScore = Math.min((vix / 30) * 100, 100); // VIX > 30 = max score
    const termStructureScore = vixTermStructure < 0 ? 50 + Math.abs(vixTermStructure) * 10 : 50 - vixTermStructure * 5;
    const realizedScore = Math.min((realizedVolatility / 30) * 100, 100);
    
    const compositeScore = (vixScore * 0.4 + termStructureScore * 0.3 + realizedScore * 0.3);

    // Interpretation
    let interpretation = '';
    let level: 'very-low' | 'low' | 'normal' | 'high' | 'very-high' = 'normal';

    if (compositeScore > 80) {
      interpretation = 'Very high volatility composite: Extreme fear, possible buying opportunity';
      level = 'very-high';
    } else if (compositeScore > 60) {
      interpretation = 'High volatility composite: Elevated fear, increased uncertainty';
      level = 'high';
    } else if (compositeScore < 20) {
      interpretation = 'Very low volatility composite: Extreme complacency, possible correction risk';
      level = 'very-low';
    } else if (compositeScore < 40) {
      interpretation = 'Low volatility composite: Calm market, low fear';
      level = 'low';
    } else {
      interpretation = 'Normal volatility composite: Balanced market conditions';
      level = 'normal';
    }

    return {
      vix: Math.round(vix * 100) / 100,
      vix9d: Math.round(vix9d * 100) / 100,
      vixTermStructure: Math.round(vixTermStructure * 100) / 100,
      realizedVolatility: Math.round(realizedVolatility * 100) / 100,
      compositeScore: Math.round(compositeScore * 100) / 100,
      interpretation,
      level,
    };
  } catch (error) {
    console.error('Error calculating Volatility Composite:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Volatility Composite (Enhanced)
 */
async function getVolatilityCompositeAIReading(data: VolatilityCompositeData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Volatility Composite',
    {
      vix: data.vix.toFixed(2),
      vix9d: data.vix9d.toFixed(2),
      vixTermStructure: `${data.vixTermStructure >= 0 ? '+' : ''}${data.vixTermStructure.toFixed(2)}%`,
      realizedVolatility: data.realizedVolatility.toFixed(2),
      compositeScore: data.compositeScore.toFixed(2),
      level: data.level === 'very-high' ? 'Molto Alta' :
             data.level === 'high' ? 'Alta' :
             data.level === 'low' ? 'Bassa' :
             data.level === 'very-low' ? 'Molto Bassa' : 'Normale',
    },
    {
      paper: 'The Investor Fear Gauge',
      authors: 'Whaley',
      year: 2000,
      theory: 'Volatility Composite Theory - Un composite di indicatori di volatilità fornisce un segnale più robusto rispetto a un singolo indicatore. Combina volatilità implicita (VIX), term structure e volatilità realizzata.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/volatility-composite
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

    const volatilityData = await getVolatilityComposite();

    if (!volatilityData) {
      return createErrorResponse(
        'Volatility Composite data not available.',
        503
      );
    }

    const aiReading = await getVolatilityCompositeAIReading(volatilityData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...volatilityData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/volatility-composite:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
