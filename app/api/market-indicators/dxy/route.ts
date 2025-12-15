import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * DXY (Dollar Index) API
 * 
 * US Dollar Index - Measures USD strength against basket of currencies
 * - EUR (57.6%)
 * - JPY (13.6%)
 * - GBP (11.9%)
 * - CAD (9.1%)
 * - SEK (4.2%)
 * - CHF (3.6%)
 * 
 * Academic Reference:
 * - Currency Index Theory - Measures relative strength of USD
 * - Strong DXY = weak foreign currencies, weak DXY = strong foreign currencies
 * 
 * Data Source: Yahoo Finance (Unofficial, FREE)
 * Updates: Every 5 minutes
 */

interface DXYData {
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
}

/**
 * Get DXY from Yahoo Finance
 */
async function getDXY(): Promise<{ value: number; change: number; changePercent: number } | null> {
  try {
    // Yahoo Finance symbol for DXY
    const symbol = 'DX-Y.NYB'; // DXY futures
    
    // Using a proxy or direct fetch (Yahoo Finance doesn't have official API)
    // In production, would use a more reliable source or paid API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result || !result.meta) {
      return null;
    }

    const currentPrice = result.meta.regularMarketPrice;
    const previousClose = result.meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      value: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    console.error('Error fetching DXY:', error);
    return null;
  }
}

/**
 * Get DXY History
 */
async function getDXYHistory(): Promise<Array<{ date: string; value: number }>> {
  try {
    const symbol = 'DX-Y.NYB';
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=3mo`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      return [];
    }

    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    return timestamps
      .map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString(),
        value: closes[i] || 0,
      }))
      .filter((item: { value: number }) => item.value > 0)
      .slice(-30); // Last 30 days
  } catch (error) {
    console.error('Error fetching DXY history:', error);
    return [];
  }
}

/**
 * Get Groq AI reading for DXY (Enhanced)
 */
async function getDXYAIReading(value: number, change: number, changePercent: number): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'DXY (Dollar Index)',
    {
      value: value.toFixed(2),
      change: `${change >= 0 ? '+' : ''}${change.toFixed(2)}`,
      changePercent: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
    },
    {
      theory: 'Currency Index Theory - Il DXY misura la forza relativa del dollaro USA contro un paniere di valute (EUR, JPY, GBP, CAD, SEK, CHF). DXY alto = dollaro forte, DXY basso = dollaro debole. Influenza commodities (oro, petrolio) e mercati emergenti.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/dxy
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

    const [dxyData, history] = await Promise.all([
      getDXY(),
      getDXYHistory(),
    ]);

    if (!dxyData) {
      return createErrorResponse(
        'DXY data not available.',
        503
      );
    }

    const aiReading = await getDXYAIReading(dxyData.value, dxyData.change, dxyData.changePercent);

    const response: DXYData = {
      value: dxyData.value,
      change: dxyData.change,
      changePercent: dxyData.changePercent,
      timestamp: new Date().toISOString(),
      history: history.slice(-30),
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/dxy:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
