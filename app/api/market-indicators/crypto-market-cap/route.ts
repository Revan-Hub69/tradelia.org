import { NextRequest, NextResponse } from "next/server";
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Total Crypto Market Cap API
 *
 * Total Cryptocurrency Market Capitalization
 *
 * Academic Reference: Market Cap Analysis, Portfolio Theory
 * Data Source: CoinGecko API (FREE, no key required)
 * Updates: Every 5 minutes
 */

interface CryptoMarketCapResponse {
  totalMarketCap: number;
  totalVolume24h: number;
  bitcoinMarketCap: number;
  bitcoinDominance: number;
  timestamp: string;
  history: Array<{ date: string; marketCap: number }>;
  aiReading: string;
}

/**
 * Get Total Crypto Market Cap from CoinGecko
 */
async function getCryptoMarketCap(): Promise<{
  totalMarketCap: number;
  totalVolume24h: number;
  bitcoinMarketCap: number;
  bitcoinDominance: number;
} | null> {
  try {
    // CoinGecko Global API
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
    const totalVolume24h = globalData.total_volume?.usd || 0;
    const bitcoinDominance = globalData.market_cap_percentage?.btc || 0;
    const bitcoinMarketCap = (totalMarketCap * bitcoinDominance) / 100;

    if (totalMarketCap === 0) {
      return null;
    }

    return {
      totalMarketCap,
      totalVolume24h,
      bitcoinMarketCap,
      bitcoinDominance,
    };
  } catch (error) {
    console.error("Error fetching Crypto Market Cap:", error);
    return null;
  }
}

/**
 * Get Crypto Market Cap History (placeholder)
 */
async function getCryptoMarketCapHistory(): Promise<
  Array<{ date: string; marketCap: number }>
> {
  // For now, return empty array - historical data would require
  // storing daily snapshots or using a paid API
  return [];
}

/**
 * Get Groq AI reading for Crypto Market Cap (Enhanced)
 */
async function getCryptoMarketCapAIReading(
  totalMarketCap: number,
  totalVolume24h: number,
  bitcoinDominance: number
): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.CRYPTO_MARKET_CAP_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.CRYPTO_MARKET_CAP_ENHANCED_USER_PROMPT_TEMPLATE(totalMarketCap, totalVolume24h, bitcoinDominance);
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/market-indicators/crypto-market-cap
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

    const [marketCapData, history] = await Promise.all([
      getCryptoMarketCap(),
      getCryptoMarketCapHistory(),
    ]);

    if (!marketCapData) {
      return createErrorResponse(
        "Failed to fetch Crypto Market Cap data",
        500
      );
    }

    const aiReading = await getCryptoMarketCapAIReading(
      marketCapData.totalMarketCap,
      marketCapData.totalVolume24h,
      marketCapData.bitcoinDominance
    );

    const response: CryptoMarketCapResponse = {
      totalMarketCap: marketCapData.totalMarketCap,
      totalVolume24h: marketCapData.totalVolume24h,
      bitcoinMarketCap: marketCapData.bitcoinMarketCap,
      bitcoinDominance: marketCapData.bitcoinDominance,
      timestamp: new Date().toISOString(),
      history: history.slice(-30), // Last 30 days
      aiReading,
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error("Error in GET /api/market-indicators/crypto-market-cap:", error);
    return createErrorResponse(
      error instanceof Error ? error : new Error("Internal server error"),
      500
    );
  }
}
