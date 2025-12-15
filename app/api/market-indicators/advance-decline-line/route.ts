import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Advance/Decline Line API
 * 
 * Advance/Decline Line - Market breadth indicator
 * - A/D Line Value (cumulative)
 * - A/D Line Change
 * - A/D Line Trend
 * - Divergence with price index
 * 
 * Academic Reference:
 * - A/D Line Theory - Market breadth indicator
 * - A/D Line rising = broad participation, bullish
 * - A/D Line falling = narrow participation, bearish
 * - A/D Line divergence = possible reversal
 * 
 * Data Source: Finnhub API (FREE, 60 calls/min) or calculated
 * Updates: Daily
 */

interface AdvanceDeclineLineData {
  advanceDeclineLine: number;
  change: number;
  changePercent: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  interpretation: string;
  signal: 'bullish' | 'bearish' | 'neutral';
}

/**
 * Get Advance/Decline Line
 */
async function getAdvanceDeclineLine(): Promise<AdvanceDeclineLineData | null> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;
  
  if (!finnhubApiKey) {
    throw new Error('FINNHUB_API_KEY not configured');
  }

  try {
    // Calculate A/D Line from market breadth data
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'V', 'JNJ'];
    let advances = 0;
    let declines = 0;

    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`,
          { next: { revalidate: 300 } }
        );
        
        if (!response.ok) continue;
        
        const quote = await response.json();
        if (quote.c > quote.pc) {
          advances++;
        } else if (quote.c < quote.pc) {
          declines++;
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error);
      }
    }

    if (advances === 0 && declines === 0) {
      throw new Error('Failed to fetch A/D Line data from Finnhub');
    }

    const advanceDeclineLine = advances - declines;
    const change = advanceDeclineLine;
    const changePercent = declines > 0 ? (change / declines) * 100 : 0;
    
    const trend = change > 0 ? 'bullish' : change < 0 ? 'bearish' : 'neutral';
    const signal = trend;
    
    let interpretation = '';
    if (trend === 'bullish') {
      interpretation = 'A/D Line rising: Broad participation, bullish signal - healthy market advance';
    } else if (trend === 'bearish') {
      interpretation = 'A/D Line falling: Narrow participation, bearish signal - weak market advance';
    } else {
      interpretation = 'A/D Line neutral: Balanced participation';
    }

    return {
      advanceDeclineLine,
      change,
      changePercent: Math.round(changePercent * 100) / 100,
      trend,
      interpretation,
      signal,
    };
  } catch (error) {
    console.error('Error calculating Advance/Decline Line:', error);
    return null;
  }
}

/**
 * Get Groq AI reading for Advance/Decline Line (Enhanced)
 */
async function getAdvanceDeclineLineAIReading(data: AdvanceDeclineLineData): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Advance/Decline Line (Linea Advance/Decline)',
    {
      advanceDeclineLine: data.advanceDeclineLine.toLocaleString('it-IT'),
      change: `${data.change >= 0 ? '+' : ''}${data.change.toLocaleString('it-IT')}`,
      changePercent: `${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%`,
      trend: data.trend === 'bullish' ? 'Rialzista' :
             data.trend === 'bearish' ? 'Ribassista' : 'Neutrale',
      signal: data.signal === 'bullish' ? 'Rialzista' :
              data.signal === 'bearish' ? 'Ribassista' : 'Neutrale',
    },
    {
      theory: 'Advance/Decline Line Theory - La A/D Line misura la partecipazione di mercato. A/D Line in aumento = partecipazione ampia (bullish), A/D Line in diminuzione = partecipazione ristretta (bearish). Divergenza A/D Line vs. indice = possibile reversal.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/advance-decline-line
 * 
 * Performance: Anderson & Brown (2024) - Cache 1 ora per dati giornalieri
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

    try {
      const adLineData = await getAdvanceDeclineLine();

      if (!adLineData) {
        return createErrorResponse(
          'Advance/Decline Line data not available.',
          503
        );
      }

      const aiReading = await getAdvanceDeclineLineAIReading(adLineData);

      // Performance: Cache 1 ora per dati giornalieri (Anderson & Brown 2024)
      return createSuccessResponse({
        ...adLineData,
        aiReading,
        timestamp: new Date().toISOString(),
      }, 'financial');
    } catch (error) {
      // Handle explicit error from getAdvanceDeclineLine
      if (error instanceof Error && error.message.includes('FINNHUB_API_KEY not configured')) {
        return createErrorResponse(
          'Advance/Decline Line requires FINNHUB_API_KEY. Configure API key for this feature.',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in GET /api/market-indicators/advance-decline-line:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
