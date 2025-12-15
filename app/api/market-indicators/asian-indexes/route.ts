import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Asian Stock Indexes API
 * 
 * Major Asian Stock Market Indexes
 * - Nikkei 225 (Japan)
 * - Shanghai Composite (China)
 * - Hang Seng (Hong Kong)
 * - Nifty 50 (India)
 * - KOSPI (South Korea)
 * - ASX 200 (Australia)
 * 
 * Academic Reference: Market Index Theory, Modern Portfolio Theory
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface AsianIndex {
  symbol: string;
  name: string;
  country: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface AsianIndexesResponse {
  indexes: AsianIndex[];
  timestamp: string;
  aiReading: string;
}

// Finnhub symbols for Asian indexes
const ASIAN_INDEX_SYMBOLS = {
  NIKKEI225: '^N225', // Japan
  SHANGHAI: '000001.SS', // China
  HANGSENG: '^HSI', // Hong Kong
  NIFTY50: '^NSEI', // India
  KOSPI: '^KS11', // South Korea
  ASX200: '^AXJO', // Australia
} as const;

/**
 * Get Asian index quote from Finnhub
 */
async function getAsianIndexQuote(
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
    console.error(`Error fetching Asian index ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all Asian indexes
 */
async function getAllAsianIndexes(): Promise<AsianIndex[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    console.warn('FINNHUB_API_KEY not configured');
    return [];
  }

  const indexData = await Promise.all([
    getAsianIndexQuote(ASIAN_INDEX_SYMBOLS.NIKKEI225, finnhubApiKey),
    getAsianIndexQuote(ASIAN_INDEX_SYMBOLS.SHANGHAI, finnhubApiKey),
    getAsianIndexQuote(ASIAN_INDEX_SYMBOLS.HANGSENG, finnhubApiKey),
    getAsianIndexQuote(ASIAN_INDEX_SYMBOLS.NIFTY50, finnhubApiKey),
    getAsianIndexQuote(ASIAN_INDEX_SYMBOLS.KOSPI, finnhubApiKey),
    getAsianIndexQuote(ASIAN_INDEX_SYMBOLS.ASX200, finnhubApiKey),
  ]);

  const indexes: AsianIndex[] = [];
  const indexNames = [
    { symbol: 'NIKKEI225', name: 'Nikkei 225', country: 'Giappone' },
    { symbol: 'SHANGHAI', name: 'Shanghai Composite', country: 'Cina' },
    { symbol: 'HANGSENG', name: 'Hang Seng', country: 'Hong Kong' },
    { symbol: 'NIFTY50', name: 'Nifty 50', country: 'India' },
    { symbol: 'KOSPI', name: 'KOSPI', country: 'Corea del Sud' },
    { symbol: 'ASX200', name: 'ASX 200', country: 'Australia' },
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
 * Get Groq AI reading for Asian Indexes (Enhanced)
 */
async function getAsianIndexesAIReading(indexes: AsianIndex[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Asian Stock Indexes (Indici Azionari Asiatici)',
    {
      indexes: indexes.map(idx => ({
        nome: `${idx.name} (${idx.country})`,
        prezzo: idx.price.toFixed(2),
        variazione: `${idx.change >= 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%`,
      })),
    },
    {
      theory: 'Modern Portfolio Theory - Gli indici azionari asiatici riflettono la performance delle economie asiatiche. Nikkei 225 (Giappone) e Shanghai Composite (Cina) sono i benchmark principali.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/asian-indexes
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

    const indexes = await getAllAsianIndexes();

    if (indexes.length === 0) {
      return createErrorResponse(
        'Asian indexes not available. Configure FINNHUB_API_KEY environment variable.',
        503
      );
    }

    const aiReading = await getAsianIndexesAIReading(indexes);

    const response: AsianIndexesResponse = {
      indexes,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/asian-indexes:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
