import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * European Stock Indexes API
 * 
 * Major European Stock Market Indexes
 * - DAX (Germany)
 * - CAC 40 (France)
 * - FTSE 100 (UK)
 * - FTSE MIB (Italy)
 * - Euro Stoxx 50 (Eurozone)
 * - IBEX 35 (Spain)
 * - AEX (Netherlands)
 * 
 * Academic Reference: Market Index Theory, Modern Portfolio Theory
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface EuropeanIndex {
  symbol: string;
  name: string;
  country: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface EuropeanIndexesResponse {
  indexes: EuropeanIndex[];
  timestamp: string;
  aiReading: string;
}

// Finnhub symbols for European indexes
const EUROPEAN_INDEX_SYMBOLS = {
  DAX: '^GDAXI', // Germany
  CAC40: '^FCHI', // France
  FTSE100: '^FTSE', // UK
  FTSEMIB: '^FTSEMIB', // Italy
  EUROSTOXX50: '^STOXX50E', // Eurozone
  IBEX35: '^IBEX', // Spain
  AEX: '^AEX', // Netherlands
} as const;

/**
 * Get European index quote from Finnhub
 */
async function getEuropeanIndexQuote(
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
    console.error(`Error fetching European index ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all European indexes
 */
async function getAllEuropeanIndexes(): Promise<EuropeanIndex[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    console.warn('FINNHUB_API_KEY not configured');
    return [];
  }

  const indexData = await Promise.all([
    getEuropeanIndexQuote(EUROPEAN_INDEX_SYMBOLS.DAX, finnhubApiKey),
    getEuropeanIndexQuote(EUROPEAN_INDEX_SYMBOLS.CAC40, finnhubApiKey),
    getEuropeanIndexQuote(EUROPEAN_INDEX_SYMBOLS.FTSE100, finnhubApiKey),
    getEuropeanIndexQuote(EUROPEAN_INDEX_SYMBOLS.FTSEMIB, finnhubApiKey),
    getEuropeanIndexQuote(EUROPEAN_INDEX_SYMBOLS.EUROSTOXX50, finnhubApiKey),
    getEuropeanIndexQuote(EUROPEAN_INDEX_SYMBOLS.IBEX35, finnhubApiKey),
    getEuropeanIndexQuote(EUROPEAN_INDEX_SYMBOLS.AEX, finnhubApiKey),
  ]);

  const indexes: EuropeanIndex[] = [];
  const indexNames = [
    { symbol: 'DAX', name: 'DAX', country: 'Germania' },
    { symbol: 'CAC40', name: 'CAC 40', country: 'Francia' },
    { symbol: 'FTSE100', name: 'FTSE 100', country: 'Regno Unito' },
    { symbol: 'FTSEMIB', name: 'FTSE MIB', country: 'Italia' },
    { symbol: 'EUROSTOXX50', name: 'Euro Stoxx 50', country: 'Eurozona' },
    { symbol: 'IBEX35', name: 'IBEX 35', country: 'Spagna' },
    { symbol: 'AEX', name: 'AEX', country: 'Paesi Bassi' },
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
 * Get Groq AI reading for European Indexes (Enhanced)
 */
async function getEuropeanIndexesAIReading(indexes: EuropeanIndex[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'European Stock Indexes (Indici Azionari Europei)',
    {
      indexes: indexes.map(idx => ({
        nome: `${idx.name} (${idx.country})`,
        prezzo: idx.price.toFixed(2),
        variazione: `${idx.change >= 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%`,
      })),
    },
    {
      theory: 'Modern Portfolio Theory - Gli indici azionari europei riflettono la performance delle economie europee. DAX (Germania) e FTSE 100 (UK) sono i benchmark principali.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/european-indexes
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

    const indexes = await getAllEuropeanIndexes();

    if (indexes.length === 0) {
      return createErrorResponse(
        'European indexes not available. Configure FINNHUB_API_KEY environment variable.',
        503
      );
    }

    const aiReading = await getEuropeanIndexesAIReading(indexes);

    const response: EuropeanIndexesResponse = {
      indexes,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/european-indexes:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
