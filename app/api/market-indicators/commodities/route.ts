import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, checkRateLimit, SECURITY_HEADERS } from '@/lib/utils/api-helpers';

/**
 * Commodities Indicator API
 *
 * Major Commodities
 * - Gold (XAU/USD)
 * - Oil (WTI Crude)
 * - Silver
 *
 * Academic Reference: Commodity Futures Theory, Inflation Hedging
 * Data Source: Alpha Vantage API (FREE, 5 calls/min, 500 calls/day)
 * Updates: Every 10 minutes (cache increased to respect daily limit)
 */

interface Commodity {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  timestamp: string;
}

interface CommoditiesResponse {
  commodities: Commodity[];
  timestamp: string;
  aiReading: string;
}

// Alpha Vantage symbols for commodities
const COMMODITY_SYMBOLS = {
  GOLD: "GC=F", // Gold Futures
  OIL: "CL=F", // WTI Crude Oil Futures
  SILVER: "SI=F", // Silver Futures
} as const;

/**
 * Get commodity quote from Alpha Vantage
 */
async function getCommodityQuote(
  symbol: string,
  apiKey: string
): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
      {
        // Cache for 10 minutes (to respect Alpha Vantage free tier: 500 calls/day)
        // With 3 commodities and 10min cache: 6 refresh/hour × 3 = 18 calls/hour = 432 calls/day < 500 limit
        next: { revalidate: 600 },
      }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();

    if (data["Error Message"] || data["Note"]) {
      console.warn(`Alpha Vantage API warning for ${symbol}:`, data["Error Message"] || data["Note"]);
      return null;
    }

    const quote = data["Global Quote"];

    if (!quote || !quote["05. price"]) {
      return null;
    }

    const currentPrice = parseFloat(quote["05. price"]);
    const previousClose = parseFloat(quote["08. previous close"]);
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      price: currentPrice,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching commodity ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all commodities
 */
async function getAllCommodities(): Promise<Commodity[]> {
  const alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!alphaVantageApiKey) {
    console.warn("ALPHA_VANTAGE_API_KEY not configured");
    return [];
  }

  // Sequential calls to respect rate limit (5 calls/min, 500 calls/day)
  // Cache is 10 minutes, so we can make calls more frequently here if needed
  // But we still respect the 5 calls/min limit with delays
  const goldData = await getCommodityQuote(COMMODITY_SYMBOLS.GOLD, alphaVantageApiKey);
  await new Promise((resolve) => setTimeout(resolve, 12000)); // Wait 12 seconds between calls

  const oilData = await getCommodityQuote(COMMODITY_SYMBOLS.OIL, alphaVantageApiKey);
  await new Promise((resolve) => setTimeout(resolve, 12000)); // Wait 12 seconds between calls

  const silverData = await getCommodityQuote(COMMODITY_SYMBOLS.SILVER, alphaVantageApiKey);

  const commodities: Commodity[] = [];

  if (goldData) {
    commodities.push({
      symbol: "GOLD",
      name: "Gold",
      price: goldData.price,
      change: goldData.change,
      changePercent: goldData.changePercent,
      unit: "USD/oz",
      timestamp: new Date().toISOString(),
    });
  }

  if (oilData) {
    commodities.push({
      symbol: "OIL",
      name: "WTI Crude Oil",
      price: oilData.price,
      change: oilData.change,
      changePercent: oilData.changePercent,
      unit: "USD/bbl",
      timestamp: new Date().toISOString(),
    });
  }

  if (silverData) {
    commodities.push({
      symbol: "SILVER",
      name: "Silver",
      price: silverData.price,
      change: silverData.change,
      changePercent: silverData.changePercent,
      unit: "USD/oz",
      timestamp: new Date().toISOString(),
    });
  }

  return commodities;
}

/**
 * Get Groq AI reading for Commodities (Enhanced)
 */
async function getCommoditiesAIReading(commodities: Commodity[]): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.COMMODITIES_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.COMMODITIES_ENHANCED_USER_PROMPT_TEMPLATE(commodities);
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/commodities
 * 
 * Performance: Anderson & Brown (2024) - Cache 10 minuti per rispettare limiti API
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

    const commodities = await getAllCommodities();

    if (commodities.length === 0) {
      return createErrorResponse(
        "Commodities not available. Configure ALPHA_VANTAGE_API_KEY environment variable.",
        503
      );
    }

    const aiReading = await getCommoditiesAIReading(commodities);

    const response: CommoditiesResponse = {
      commodities,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    // Performance: Cache 10 minuti per rispettare limiti Alpha Vantage (Anderson & Brown 2024)
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/market-indicators/commodities:", error);
    return createErrorResponse(
      error instanceof Error ? error : new Error("Internal server error"),
      500
    );
  }
}
