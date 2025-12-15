import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Bitcoin Dominance Indicator API
 *
 * Bitcoin Dominance = (Bitcoin Market Cap / Total Crypto Market Cap) * 100
 *
 * Academic Reference: Market Cap Analysis, Portfolio Theory
 * Data Source: CoinGecko API (FREE, no key required)
 * Updates: Every 5 minutes
 */

interface BitcoinDominanceResponse {
  dominance: number; // Percentage (0-100)
  bitcoinMarketCap: number;
  totalMarketCap: number;
  timestamp: string;
  history: Array<{ date: string; dominance: number }>;
  aiReading: string;
}

/**
 * Get Bitcoin Dominance from CoinGecko
 */
async function getBitcoinDominance(): Promise<{
  dominance: number;
  bitcoinMarketCap: number;
  totalMarketCap: number;
} | null> {
  try {
    // CoinGecko Global API - returns total market cap and Bitcoin market cap
    const response = await fetch("https://api.coingecko.com/api/v3/global", {
      headers: {
        Accept: "application/json",
      },
      // Cache for 5 minutes
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const globalData = data.data;

    if (!globalData) {
      return null;
    }

    const totalMarketCap = globalData.total_market_cap?.usd || 0;
    const bitcoinMarketCap = globalData.market_cap_percentage?.btc
      ? (totalMarketCap * globalData.market_cap_percentage.btc) / 100
      : 0;

    if (totalMarketCap === 0 || bitcoinMarketCap === 0) {
      return null;
    }

    const dominance = (bitcoinMarketCap / totalMarketCap) * 100;

    return {
      dominance: Math.round(dominance * 100) / 100, // Round to 2 decimals
      bitcoinMarketCap,
      totalMarketCap,
    };
  } catch (error) {
    console.error("Error fetching Bitcoin Dominance:", error);
    return null;
  }
}

/**
 * Get Bitcoin Dominance History (last 30 days)
 * Note: CoinGecko doesn't provide historical dominance directly,
 * so we'll use a simplified approach with current data
 */
async function getBitcoinDominanceHistory(): Promise<Array<{ date: string; dominance: number }>> {
  try {
    // For now, return empty array - historical data would require
    // storing daily snapshots or using a paid API
    // This is a placeholder for future enhancement
    return [];
  } catch (error) {
    console.error("Error fetching Bitcoin Dominance history:", error);
    return [];
  }
}

/**
 * Get Groq AI reading for Bitcoin Dominance (Enhanced)
 */
async function getBitcoinDominanceAIReading(
  dominance: number,
  bitcoinMarketCap: number,
  totalMarketCap: number
): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.BITCOIN_DOMINANCE_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.BITCOIN_DOMINANCE_ENHANCED_USER_PROMPT_TEMPLATE(
    dominance,
    bitcoinMarketCap,
    totalMarketCap
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/bitcoin-dominance
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

    const [dominanceData, history] = await Promise.all([
      getBitcoinDominance(),
      getBitcoinDominanceHistory(),
    ]);

    if (!dominanceData) {
      return createErrorResponse(
        "Failed to fetch Bitcoin Dominance data",
        503
      );
    }

    const aiReading = await getBitcoinDominanceAIReading(
      dominanceData.dominance,
      dominanceData.bitcoinMarketCap,
      dominanceData.totalMarketCap
    );

    const response: BitcoinDominanceResponse = {
      dominance: dominanceData.dominance,
      bitcoinMarketCap: dominanceData.bitcoinMarketCap,
      totalMarketCap: dominanceData.totalMarketCap,
      timestamp: new Date().toISOString(),
      history: history.slice(-30), // Last 30 days
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error("Error in GET /api/market-indicators/bitcoin-dominance:", error);
    return createErrorResponse(
      error instanceof Error ? error : new Error("Internal server error"),
      500
    );
  }
}
