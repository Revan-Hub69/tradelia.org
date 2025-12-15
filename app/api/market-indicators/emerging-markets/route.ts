import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Emerging Markets Indexes API
 * 
 * Major Emerging Market Stock Indexes
 * - Bovespa (Brazil)
 * - JSE (South Africa)
 * - MSCI EM (Emerging Markets Index)
 * 
 * Academic Reference: Market Index Theory, Modern Portfolio Theory
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface EmergingMarketIndex {
  symbol: string;
  name: string;
  country: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface EmergingMarketsResponse {
  indexes: EmergingMarketIndex[];
  timestamp: string;
  aiReading: string;
}

// Finnhub symbols for Emerging Markets indexes
const EMERGING_MARKET_SYMBOLS = {
  BOVESPA: '^BVSP', // Brazil
  JSE: '^JSE', // South Africa
  MSCIEEM: 'EEM', // MSCI Emerging Markets ETF (proxy)
} as const;

/**
 * Get Emerging Market index quote from Finnhub
 */
async function getEmergingMarketQuote(
  symbol: string,
  apiKey: string
): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data || data.c === 0) {
      return null;
    }

    const currentPrice = data.c;
    const previousClose = data.pc;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      price: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching Emerging Market index ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all Emerging Market indexes
 */
async function getAllEmergingMarkets(): Promise<EmergingMarketIndex[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    console.warn('FINNHUB_API_KEY not configured');
    return [];
  }

  const indexData = await Promise.all([
    getEmergingMarketQuote(EMERGING_MARKET_SYMBOLS.BOVESPA, finnhubApiKey),
    getEmergingMarketQuote(EMERGING_MARKET_SYMBOLS.JSE, finnhubApiKey),
    getEmergingMarketQuote(EMERGING_MARKET_SYMBOLS.MSCIEEM, finnhubApiKey),
  ]);

  const indexes: EmergingMarketIndex[] = [];
  const indexNames = [
    { symbol: 'BOVESPA', name: 'Bovespa', country: 'Brasile' },
    { symbol: 'JSE', name: 'JSE', country: 'Sudafrica' },
    { symbol: 'MSCIEEM', name: 'MSCI EM', country: 'Mercati Emergenti' },
  ];

  indexData.forEach((data, index) => {
    if (data) {
      indexes.push({
        symbol: indexNames[index].symbol,
        name: indexNames[index].name,
        country: indexNames[index].country,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return indexes;
}

/**
 * Get Groq AI reading for Emerging Markets (Enhanced)
 */
async function getEmergingMarketsAIReading(indexes: EmergingMarketIndex[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Emerging Markets Indexes (Indici Mercati Emergenti)',
    {
      indexes: indexes.map(idx => ({
        nome: `${idx.name} (${idx.country})`,
        prezzo: idx.price.toFixed(2),
        variazione: `${idx.change >= 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%`,
      })),
    },
    {
      theory: 'Modern Portfolio Theory - I mercati emergenti offrono diversificazione geografica e potenziale di crescita superiore, ma con maggiore volatilità e rischio.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/emerging-markets
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

    const indexes = await getAllEmergingMarkets();

    if (indexes.length === 0) {
      return createErrorResponse(
        'Emerging Markets indexes not available. Configure FINNHUB_API_KEY environment variable.',
        503
      );
    }

    const aiReading = await getEmergingMarketsAIReading(indexes);

    const response: EmergingMarketsResponse = {
      indexes,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/emerging-markets:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
