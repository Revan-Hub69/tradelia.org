import { NextRequest, NextResponse } from 'next/server';

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
 * Get Groq AI reading for top movers
 */
async function getTopMoversAIReading(
  gainers: Array<{ symbol: string; changePercent: number }>,
  losers: Array<{ symbol: string; changePercent: number }>,
  highVolume: Array<{ symbol: string; volume: number }>
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return 'AI analysis not available. Configure GROQ_API_KEY.';
  }

  const topGainers = gainers.slice(0, 5).map(g => `${g.symbol} +${g.changePercent.toFixed(2)}%`).join(', ');
  const topLosers = losers.slice(0, 5).map(l => `${l.symbol} ${l.changePercent.toFixed(2)}%`).join(', ');
  const topVolume = highVolume.slice(0, 5).map(v => `${v.symbol} $${(v.volume / 1e6).toFixed(2)}M`).join(', ');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Sei un analista di mercato esperto. Leggi solo i dati forniti. NO predizioni, NO consigli. Solo lettura descrittiva.',
          },
          {
            role: 'user',
            content: `Analizza i top movers crypto:\nTop Gainers: ${topGainers}\nTop Losers: ${topLosers}\nHigh Volume: ${topVolume}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Analyzing top movers...';
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return 'Error generating AI reading.';
  }
}

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/crypto/top-movers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
