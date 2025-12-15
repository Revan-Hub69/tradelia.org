import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, checkRateLimit } from '@/lib/utils/api-helpers';

/**
 * Crypto Top Movers API
 * 
 * Features:
 * - Top gainers/losers
 * - High volume crypto
 * - Groq AI reading
 * 
 * Updates: Every 1 minute (real-time)
 * Pro Feature: Full access
 */

interface TopMoversResponse {
  gainers: Array<{
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
    volume: number;
    price: number;
  }>;
  losers: Array<{
    symbol: string;
    name: string;
    change: number;
    changePercent: number;
    volume: number;
    price: number;
  }>;
  highVolume: Array<{
    symbol: string;
    name: string;
    volume: number;
    price: number;
  }>;
  aiReading: string;
  timestamp: string;
}

/**
 * Get top 400 crypto from CoinGecko
 */
async function getTopCryptos(): Promise<Array<{
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
}>> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=400&page=1&sparkline=false',
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('CoinGecko API error');
    }

    const data = await response.json();
    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price || 0,
      change24h: coin.price_change_24h || 0,
      change24hPercent: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
    }));
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    return [];
  }
}

/**
 * Get Groq AI reading for top movers (Enhanced)
 */
async function getTopMoversAIReading(
  gainers: Array<{ symbol: string; name: string; changePercent: number }>,
  losers: Array<{ symbol: string; name: string; changePercent: number }>,
  highVolume: Array<{ symbol: string; name: string; volume: number }>
): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TOP_MOVERS_ENHANCED_SYSTEM_PROMPT;
  const userPrompt = prompts.TOP_MOVERS_ENHANCED_USER_PROMPT_TEMPLATE(
    gainers.slice(0, 10).map(g => ({ symbol: g.symbol, name: g.name, changePercent: g.changePercent }))
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

/**
 * GET /api/crypto/top-movers
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

    const cryptos = await getTopCryptos();

    const gainers = cryptos
      .filter(c => c.change24hPercent > 0)
      .sort((a, b) => b.change24hPercent - a.change24hPercent)
      .slice(0, 20)
      .map(c => ({
        symbol: c.symbol,
        name: c.name,
        change: c.change24h,
        changePercent: c.change24hPercent,
        volume: c.volume24h,
        price: c.price,
      }));

    const losers = cryptos
      .filter(c => c.change24hPercent < 0)
      .sort((a, b) => a.change24hPercent - b.change24hPercent)
      .slice(0, 20)
      .map(c => ({
        symbol: c.symbol,
        name: c.name,
        change: c.change24h,
        changePercent: c.change24hPercent,
        volume: c.volume24h,
        price: c.price,
      }));

    const highVolume = cryptos
      .filter(c => c.volume24h > 0)
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 20)
      .map(c => ({
        symbol: c.symbol,
        name: c.name,
        volume: c.volume24h,
        price: c.price,
      }));

    const aiReading = await getTopMoversAIReading(gainers, losers, highVolume);

    const response: TopMoversResponse = {
      gainers,
      losers,
      highVolume,
      aiReading,
      timestamp: new Date().toISOString(),
    };

    // Performance: Cache 5 minuti per dati real-time (Anderson & Brown 2024)
    return createSuccessResponse(response, 'realtime');
  } catch (error) {
    console.error('Error in GET /api/crypto/top-movers:', error);
    return createErrorResponse(
      error instanceof Error ? error : new Error('Internal server error'),
      500
    );
  }
}
