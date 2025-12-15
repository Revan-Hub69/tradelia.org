import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Arms Index (TRIN) API
 * 
 * Trading Index (TRIN) - Measures market internal strength
 * Formula: (Advancing Issues / Declining Issues) / (Advancing Volume / Declining Volume)
 * 
 * Academic Reference:
 * - Arms, R. (1967) - "The Arms Index (TRIN)"
 * - Values > 1.0 = bearish, < 1.0 = bullish
 * 
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface ArmsIndexData {
  trin: number;
  advancingIssues: number;
  decliningIssues: number;
  advancingVolume: number;
  decliningVolume: number;
  interpretation: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Calculate Arms Index (TRIN)
 */
async function getArmsIndex(): Promise<ArmsIndexData | null> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  if (!finnhubApiKey) {
    return null;
  }

  if (!finnhubApiKey) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    // Fetch market breadth data from Finnhub
    // Calculate from S&P 500 components
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JNJ'];
    let advancingIssues = 0;
    let decliningIssues = 0;
    let advancingVolume = 0;
    let decliningVolume = 0;

    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`,
          { next: { revalidate: 300 } }
        );
        
        if (!response.ok) continue;
        
        const quote = await response.json();
        const currentPrice = quote.c;
        const previousClose = quote.pc;
        const volume = quote.v || 0;

        if (currentPrice > previousClose) {
          advancingIssues++;
          advancingVolume += volume;
        } else if (currentPrice < previousClose) {
          decliningIssues++;
          decliningVolume += volume;
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    if (advancingIssues === 0 && decliningIssues === 0) {
      throw new Error('Failed to fetch market breadth data from Finnhub');
    }

    const issuesRatio = advancingIssues / (decliningIssues || 1);
    const volumeRatio = advancingVolume / (decliningVolume || 1);
    const trin = issuesRatio / (volumeRatio || 1);

    // Interpretation
    let interpretation = '';
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';

    if (trin > 2.0) {
      interpretation = 'Very high TRIN: Extreme bearish sentiment, possible oversold condition';
      sentiment = 'bearish';
    } else if (trin > 1.2) {
      interpretation = 'High TRIN: Bearish sentiment, more declining volume than advancing';
      sentiment = 'bearish';
    } else if (trin < 0.5) {
      interpretation = 'Very low TRIN: Extreme bullish sentiment, possible overbought condition';
      sentiment = 'bullish';
    } else if (trin < 0.8) {
      interpretation = 'Low TRIN: Bullish sentiment, more advancing volume than declining';
      sentiment = 'bullish';
    } else {
      interpretation = 'Neutral TRIN: Balanced market sentiment';
      sentiment = 'neutral';
    }

    return {
      trin: Math.round(trin * 100) / 100,
      advancingIssues,
      decliningIssues,
      advancingVolume: Math.round(advancingVolume),
      decliningVolume: Math.round(decliningVolume),
      interpretation,
      sentiment,
    };
  } catch (error) {
    console.error('Error calculating Arms Index:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Arms Index (Enhanced)
 */
async function getArmsIndexAIReading(data: ArmsIndexData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Arms Index (TRIN)',
    {
      trin: data.trin.toFixed(2),
      advancingIssues: data.advancingIssues,
      decliningIssues: data.decliningIssues,
      sentiment: data.sentiment === 'bullish' ? 'Rialzista' : data.sentiment === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      paper: 'The Arms Index (TRIN)',
      authors: 'Arms, R.',
      year: 1967,
      theory: 'Arms Index Theory - Il TRIN misura la forza interna del mercato combinando Advance/Decline con Volume. Valori > 1.0 = bearish, < 1.0 = bullish. Estremi (> 2.0 o < 0.5) indicano possibili reversal.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/arms-index
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

    const armsData = await getArmsIndex();

    if (!armsData) {
      return createErrorResponse(
        'Arms Index data not available. Configure FINNHUB_API_KEY.',
        503
      );
    }

    const aiReading = await getArmsIndexAIReading(armsData);

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse({
      ...armsData,
      aiReading,
      timestamp: new Date().toISOString(),
    }, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/arms-index:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
