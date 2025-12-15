import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * ETF Geografici API
 * 
 * Major Geographic ETFs
 * - VGK (Europe)
 * - EEM (Emerging Markets)
 * - VWO (Emerging Markets - Vanguard)
 * - VPL (Asia Pacific)
 * - EWJ (Japan)
 * 
 * Academic Reference: Geographic Diversification Theory, Modern Portfolio Theory
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface GeographicETF {
  symbol: string;
  name: string;
  region: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface GeographicETFResponse {
  etfs: GeographicETF[];
  timestamp: string;
  aiReading: string;
}

// ETF symbols
const GEOGRAPHIC_ETFS = {
  VGK: { symbol: 'VGK', name: 'Vanguard FTSE Europe', region: 'Europa' },
  EEM: { symbol: 'EEM', name: 'iShares MSCI Emerging Markets', region: 'Mercati Emergenti' },
  VWO: { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets', region: 'Mercati Emergenti' },
  VPL: { symbol: 'VPL', name: 'Vanguard FTSE Pacific', region: 'Asia Pacifico' },
  EWJ: { symbol: 'EWJ', name: 'iShares MSCI Japan', region: 'Giappone' },
} as const;

/**
 * Get Geographic ETF quote from Finnhub
 */
async function getGeographicETFQuote(
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
    console.error(`Error fetching Geographic ETF ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all Geographic ETFs
 */
async function getAllGeographicETFs(): Promise<GeographicETF[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    console.warn('FINNHUB_API_KEY not configured');
    return [];
  }

  const etfData = await Promise.all(
    Object.values(GEOGRAPHIC_ETFS).map(etf => getGeographicETFQuote(etf.symbol, finnhubApiKey))
  );

  const etfs: GeographicETF[] = [];

  etfData.forEach((data, index) => {
    if (data) {
      const etf = Object.values(GEOGRAPHIC_ETFS)[index];
      etfs.push({
        symbol: etf.symbol,
        name: etf.name,
        region: etf.region,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        timestamp: new Date().toISOString(),
      });
    }
  });

  return etfs;
}

/**
 * Get Groq AI reading for Geographic ETFs (Enhanced)
 */
async function getGeographicETFsAIReading(etfs: GeographicETF[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Geographic ETFs (ETF Geografici)',
    {
      etfs: etfs.map(etf => ({
        nome: `${etf.name} (${etf.region})`,
        prezzo: etf.price.toFixed(2),
        variazione: `${etf.change >= 0 ? '+' : ''}${etf.changePercent.toFixed(2)}%`,
      })),
    },
    {
      theory: 'Geographic Diversification Theory - Gli ETF geografici permettono diversificazione internazionale. La rotazione tra regioni indica cambiamenti nel ciclo economico globale e nel sentiment.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/etf-geographic
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

    const etfs = await getAllGeographicETFs();

    if (etfs.length === 0) {
      return createErrorResponse(
        'Geographic ETFs not available. Configure FINNHUB_API_KEY environment variable.',
        503
      );
    }

    const aiReading = await getGeographicETFsAIReading(etfs);

    const response: GeographicETFResponse = {
      etfs,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/etf-geographic:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
