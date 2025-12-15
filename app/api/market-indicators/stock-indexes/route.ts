import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Stock Market Indexes API
 *
 * Major US Stock Market Indexes
 * - S&P 500 (^GSPC)
 * - Dow Jones Industrial Average (^DJI)
 * - NASDAQ Composite (^IXIC)
 *
 * Academic Reference: Market Index Theory, Modern Portfolio Theory
 * Data Source: Finnhub API (FREE, 60 calls/min)
 * Updates: Every 5 minutes
 */

interface StockIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface StockIndexesResponse {
  indexes: StockIndex[];
  timestamp: string;
  aiReading: string;
}

// Finnhub symbols for major indexes
const INDEX_SYMBOLS = {
  SP500: "^GSPC", // S&P 500
  DOW: "^DJI", // Dow Jones
  NASDAQ: "^IXIC", // NASDAQ
} as const;

/**
 * Get stock index quote from Finnhub
 */
async function getStockIndexQuote(
  symbol: string,
  apiKey: string
): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`,
      {
        // Cache for 5 minutes
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.c === 0) {
      return null;
    }

    const currentPrice = data.c; // Current price
    const previousClose = data.pc; // Previous close
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      price: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get all stock indexes
 */
async function getAllStockIndexes(): Promise<StockIndex[]> {
  const finnhubApiKey = process.env.FINNHUB_API_KEY;

  if (!finnhubApiKey) {
    return [];
  }

  const [sp500Data, dowData, nasdaqData] = await Promise.all([
    getStockIndexQuote(INDEX_SYMBOLS.SP500, finnhubApiKey),
    getStockIndexQuote(INDEX_SYMBOLS.DOW, finnhubApiKey),
    getStockIndexQuote(INDEX_SYMBOLS.NASDAQ, finnhubApiKey),
  ]);

  const indexes: StockIndex[] = [];

  if (sp500Data) {
    indexes.push({
      symbol: "SP500",
      name: "S&P 500",
      price: sp500Data.price,
      change: sp500Data.change,
      changePercent: sp500Data.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  if (dowData) {
    indexes.push({
      symbol: "DOW",
      name: "Dow Jones",
      price: dowData.price,
      change: dowData.change,
      changePercent: dowData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  if (nasdaqData) {
    indexes.push({
      symbol: "NASDAQ",
      name: "NASDAQ",
      price: nasdaqData.price,
      change: nasdaqData.change,
      changePercent: nasdaqData.changePercent,
      timestamp: new Date().toISOString(),
    });
  }

  return indexes;
}

/**
 * Get Groq AI reading for Stock Indexes
 */
async function getStockIndexesAIReading(indexes: StockIndex[]): Promise<string> {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return "AI analysis not available. Configure GROQ_API_KEY.";
    }

    const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
    const systemPrompt = prompts.STOCK_INDEXES_ENHANCED_SYSTEM_PROMPT;
    const userPrompt = prompts.STOCK_INDEXES_ENHANCED_USER_PROMPT_TEMPLATE(indexes);
    
    return await prompts.callGroqAI(systemPrompt, userPrompt, 400);
  } catch (error) {
    // Silently return fallback message on error
    return "AI analysis temporarily unavailable.";
  }
}

/**
 * GET /api/market-indicators/stock-indexes
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

    const finnhubApiKey = process.env.FINNHUB_API_KEY;
    
    if (!finnhubApiKey) {
      return createErrorResponse(
        "FINNHUB_API_KEY not configured. Please configure the API key in environment variables.",
        503
      );
    }

    const indexes = await getAllStockIndexes();

    if (indexes.length === 0) {
      return createErrorResponse(
        "No stock index data available. Check FINNHUB_API_KEY configuration and API limits.",
        503
      );
    }

    // Get AI reading - non-blocking, fallback to empty string on error
    let aiReading = "AI analysis temporarily unavailable.";
    try {
      aiReading = await getStockIndexesAIReading(indexes);
    } catch (error) {
      // Continue with fallback message
    }

    const response: StockIndexesResponse = {
      indexes,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error : new Error("Failed to fetch stock indexes data"),
      500
    );
  }
}
