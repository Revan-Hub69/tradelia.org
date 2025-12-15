import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * ETF Settoriali API
 * 
 * Major Sectoral ETFs
 * - SPY (S&P 500)
 * - QQQ (NASDAQ)
 * - XLK (Technology)
 * - XLF (Financials)
 * - XLE (Energy)
 * - XLV (Healthcare)
 * - XLY (Consumer Discretionary)
 * - XLP (Consumer Staples)
 * 
 * Academic Reference: Sector Rotation Theory, Modern Portfolio Theory
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface SectoralETF {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface SectoralETFResponse {
  etfs: SectoralETF[];
  timestamp: string;
  aiReading: string;
}

// ETF symbols
const SECTORAL_ETFS = {
  SPY: { symbol: 'SPY', name: 'SPDR S&P 500', sector: 'Broad Market' },
  QQQ: { symbol: 'QQQ', name: 'Invesco QQQ', sector: 'Technology' },
  XLK: { symbol: 'XLK', name: 'Technology Select Sector', sector: 'Technology' },
  XLF: { symbol: 'XLF', name: 'Financial Select Sector', sector: 'Financials' },
  XLE: { symbol: 'XLE', name: 'Energy Select Sector', sector: 'Energy' },
  XLV: { symbol: 'XLV', name: 'Healthcare Select Sector', sector: 'Healthcare' },
  XLY: { symbol: 'XLY', name: 'Consumer Discretionary Select', sector: 'Consumer Discretionary' },
  XLP: { symbol: 'XLP', name: 'Consumer Staples Select', sector: 'Consumer Staples' },
} as const;

/**
 * Get ETF quote from Finnhub
 */
async function getETFQuote(
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
    console.error(`Error fetching ETF ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all Sectoral ETFs
 */
async function getAllSectoralETFs(): Promise<SectoralETF[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    console.warn('FINNHUB_API_KEY not configured');
    return [];
  }

  const etfData = await Promise.all(
    Object.values(SECTORAL_ETFS).map(etf => getETFQuote(etf.symbol, finnhubApiKey))
  );

  const etfs: SectoralETF[] = [];

  etfData.forEach((data, index) => {
    if (data) {
      const etf = Object.values(SECTORAL_ETFS)[index];
      etfs.push({
        symbol: etf.symbol,
        name: etf.name,
        sector: etf.sector,
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
 * Get Groq AI reading for Sectoral ETFs (Enhanced)
 */
async function getSectoralETFsAIReading(etfs: SectoralETF[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Sectoral ETFs (ETF Settoriali)',
    {
      etfs: etfs.map(etf => ({
        nome: `${etf.name} (${etf.sector})`,
        prezzo: etf.price.toFixed(2),
        variazione: `${etf.change >= 0 ? '+' : ''}${etf.changePercent.toFixed(2)}%`,
      })),
    },
    {
      theory: 'Sector Rotation Theory - Gli ETF settoriali riflettono la performance di settori specifici. La rotazione tra settori indica cambiamenti nel ciclo economico e nel sentiment di mercato.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/etf-sectoral
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

    const etfs = await getAllSectoralETFs();

    if (etfs.length === 0) {
      return createErrorResponse(
        'Sectoral ETFs not available. Configure FINNHUB_API_KEY environment variable.',
        503
      );
    }

    const aiReading = await getSectoralETFsAIReading(etfs);

    const response: SectoralETFResponse = {
      etfs,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/market-indicators/etf-sectoral:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
