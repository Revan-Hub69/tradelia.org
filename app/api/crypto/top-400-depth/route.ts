import { NextRequest, NextResponse } from 'next/server';

/**
 * Top 400 Crypto Market Depth Feed API
 * Feed semplice profondità di mercato crypto con letture Groq AI
 * 
 * Best Practice: Solo letture semplici (prezzi, volumi, crescita/discesa), NO analisi complesse
 * Pro Feature: Analytics avanzate disponibili a pagamento
 */

interface OrderBookLevel {
  price: number;
  quantity: number;
}

interface MarketDepth {
  symbol: string;
  name: string;
  price: number; // Prezzo corrente
  change24h: number; // Cambio 24h (valore assoluto)
  change24hPercent: number; // Cambio 24h (%)
  volume24h: number; // Volume 24h
  bidTotal: number; // Volume totale bid (order book)
  askTotal: number; // Volume totale ask (order book)
  spread: number; // Spread percentuale
  imbalance: number; // Imbalance bid/ask (positive = più bid, negative = più ask)
  trend: 'up' | 'down' | 'neutral'; // Trend semplice
}

interface CryptoDepthResult {
  timestamp: string;
  depths: MarketDepth[];
  summary: {
    totalTracked: number;
    gainers: number; // Crypto in crescita
    losers: number; // Crypto in discesa
    topGainers: Array<{ symbol: string; name: string; change: number; volume: number }>;
    topLosers: Array<{ symbol: string; name: string; change: number; volume: number }>;
    highVolume: Array<{ symbol: string; name: string; volume: number }>; // Crypto con volume alto
    aiReadings: {
      marketOverview: string; // Lettura semplice stato mercato (2-3 frasi)
      notableMovements: string[]; // Movimenti notevoli (solo dati, no analisi)
      volumeHighlights: string[]; // Highlight volumi (solo dati)
    };
  };
}

// Cache for order books (2 minutes - order books change frequently)
const depthCache = new Map<string, { data: MarketDepth; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000;

/**
 * Get top 400 crypto from CoinGecko with price/volume data
 */
async function getTop400CryptoWithData(): Promise<Array<{ 
  symbol: string; 
  name: string; 
  id: string;
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
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      id: coin.id,
      price: coin.current_price || 0,
      change24h: coin.price_change_24h || 0,
      change24hPercent: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
    }));
  } catch (error) {
    console.error('Error fetching top 400 crypto:', error);
    // Fallback to major cryptos
    return [
      { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin', price: 0, change24h: 0, change24hPercent: 0, volume24h: 0 },
      { symbol: 'ETH', name: 'Ethereum', id: 'ethereum', price: 0, change24h: 0, change24hPercent: 0, volume24h: 0 },
      { symbol: 'BNB', name: 'BNB', id: 'binancecoin', price: 0, change24h: 0, change24hPercent: 0, volume24h: 0 },
      { symbol: 'SOL', name: 'Solana', id: 'solana', price: 0, change24h: 0, change24hPercent: 0, volume24h: 0 },
      { symbol: 'XRP', name: 'XRP', id: 'ripple', price: 0, change24h: 0, change24hPercent: 0, volume24h: 0 },
    ];
  }
}

/**
 * Get order book depth from Binance
 * Binance Free API: /api/v3/depth
 * Returns simplified order book data
 */
async function getBinanceOrderBook(symbol: string, limit: number = 20): Promise<{
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bidTotal: number;
  askTotal: number;
  spread: number;
  imbalance: number;
} | null> {
  try {
    // Binance format: BTCUSDT, ETHUSDT, etc.
    const binanceSymbol = `${symbol}USDT`;

    const response = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${binanceSymbol}&limit=${limit}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      // Symbol might not be on Binance, skip
      return null;
    }

    const data = await response.json();

    // Parse bids and asks
    const bids: OrderBookLevel[] = data.bids.map(([price, quantity]: [string, string]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    }));

    const asks: OrderBookLevel[] = data.asks.map(([price, quantity]: [string, string]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity),
    }));

    // Calculate metrics
    const bestBid = bids[0]?.price || 0;
    const bestAsk = asks[0]?.price || 0;
    const midPrice = (bestBid + bestAsk) / 2;
    const spread = midPrice > 0 ? ((bestAsk - bestBid) / midPrice) * 100 : 0;

    const bidTotal = bids.reduce((sum, b) => sum + b.quantity, 0);
    const askTotal = asks.reduce((sum, a) => sum + a.quantity, 0);
    const totalVolume = bidTotal + askTotal;
    const imbalance = totalVolume > 0 ? ((bidTotal - askTotal) / totalVolume) * 100 : 0;

    return {
      bids,
      asks,
      bidTotal,
      askTotal,
      spread,
      imbalance,
    };
  } catch (error) {
    console.error(`Error fetching order book for ${symbol}:`, error);
    return null;
  }
}

/**
 * Build Tradelia system prompt for simple market depth readings
 * SEMPLICE: Solo letture dati, NO analisi complesse
 */
function buildTradeliaDepthPrompt(): string {
  return `Sei un lettore di dati di mercato crypto per Tradelia.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

FORMATO RISPOSTA:
- Market Overview: 2-3 frasi descrittive semplici (es: "X crypto in crescita, Y in discesa")
- Notable Movements: Lista movimenti notevoli (solo numeri, no interpretazione)
- Volume Highlights: Lista crypto con volume alto (solo dati)

NON FARE:
- Analisi complesse
- Pattern recognition
- Predizioni
- Consigli
- Interpretazioni avanzate

FARE:
- Leggere e descrivere i dati forniti
- Evidenziare movimenti significativi (solo numeri)
- Evidenziare volumi alti (solo numeri)
- Linguaggio semplice e diretto`;
}

/**
 * Simple market depth readings with Groq AI
 * Solo letture semplici, NO analisi complesse
 */
async function readMarketDepthWithGroq(
  depthData: string,
  depths: MarketDepth[]
): Promise<{
  marketOverview: string;
  notableMovements: string[];
  volumeHighlights: string[];
}> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return {
      marketOverview: 'Lettura AI non disponibile. Configura GROQ_API_KEY.',
      notableMovements: [],
      volumeHighlights: [],
    };
  }

  const systemPrompt = buildTradeliaDepthPrompt();
  
  const userPrompt = `Leggi semplicemente i dati di profondità di mercato (order book depth) delle top ${depths.length} crypto.

DATI FORNITI:
${depthData}

REGOLE SEMPLICI:
1. LEGGI solo i numeri forniti. Descrivi cosa vedi.
2. NO analisi, NO pattern, NO interpretazioni.
3. Solo lettura dati: prezzi, volumi, crescita/discesa.

Fornisci letture SEMPLICI:
1. MARKET OVERVIEW (2-3 frasi): Descrizione semplice stato mercato (es: "X crypto in crescita, Y in discesa, volume totale Z")
2. NOTABLE MOVEMENTS (lista 3-5 punti): Solo movimenti notevoli con numeri (es: "BTC +15%, volume 1.2B")
3. VOLUME HIGHLIGHTS (lista 3-5 punti): Solo crypto con volume alto (es: "ETH volume 500M")

ESEMPIO CORRETTO:
- ✅ "65 crypto in crescita, 35 in discesa. Volume totale 5.2B"
- ✅ "BTC mostra +15% con volume 1.2B nelle ultime 24h"
- ✅ "ETH, SOL, BNB mostrano volumi superiori a 500M"
- ❌ "Il mercato mostra trend positivo" (troppo interpretativo)
- ❌ "Pattern di accumulo su BTC" (NO pattern)

Rispondi SOLO in formato JSON valido:
{
  "marketOverview": "Descrizione semplice stato mercato...",
  "notableMovements": ["BTC +15%, volume 1.2B", "ETH -5%, volume 800M"],
  "volumeHighlights": ["ETH volume 500M", "SOL volume 300M"]
}`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';

    // Parse JSON
    let analysis;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (e) {
      try {
        analysis = JSON.parse(content);
      } catch (e2) {
        analysis = {
          analysis: content.substring(0, 500),
          insights: [],
          liquidityAnalysis: '',
          marketStructure: '',
          alerts: [],
        };
      }
    }

    return {
      marketOverview: analysis.marketOverview || '',
      notableMovements: analysis.notableMovements || [],
      volumeHighlights: analysis.volumeHighlights || [],
    };
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return {
      marketOverview: 'Errore nella lettura AI. Riprova più tardi.',
      notableMovements: [],
      volumeHighlights: [],
    };
  }
}

/**
 * GET /api/crypto/top-400-depth
 * Get market depth feed (order book) for top 400 crypto with simple Groq AI readings
 * 
 * Simple feed: prezzi, volumi, crescita/discesa, order book depth
 * NO analisi complesse (quelle sono Pro feature)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '400', 10);
    const useCache = searchParams.get('cache') !== 'false';
    const orderBookLimit = parseInt(searchParams.get('depth') || '20', 10); // Number of levels

    const now = Date.now();

    // Get top 400 crypto with price/volume data
    const topCryptos = await getTop400CryptoWithData();
    const cryptosToProcess = topCryptos.slice(0, Math.min(limit, 400));

    // Fetch order book depth (with caching and rate limiting)
    const depths: MarketDepth[] = [];
    const fetchPromises: Promise<void>[] = [];

    for (let i = 0; i < cryptosToProcess.length; i++) {
      const crypto = cryptosToProcess[i];
      const cacheKey = crypto.symbol;

      // Check cache
      if (useCache) {
        const cached = depthCache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_TTL) {
          depths.push(cached.data);
          continue;
        }
      }

      // Fetch with delay to respect rate limits (Binance: 1200 calls/min)
      fetchPromises.push(
        (async () => {
          await new Promise(resolve => setTimeout(resolve, i * 50)); // 50ms delay

          try {
            const orderBook = await getBinanceOrderBook(crypto.symbol, orderBookLimit);
            if (orderBook) {
              const depth: MarketDepth = {
                symbol: crypto.symbol,
                name: crypto.name,
                price: crypto.price,
                change24h: crypto.change24h,
                change24hPercent: crypto.change24hPercent,
                volume24h: crypto.volume24h,
                bidTotal: orderBook.bidTotal,
                askTotal: orderBook.askTotal,
                spread: orderBook.spread,
                imbalance: orderBook.imbalance,
                trend: crypto.change24hPercent > 0 ? 'up' : crypto.change24hPercent < 0 ? 'down' : 'neutral',
              };
              
              depths.push(depth);
              depthCache.set(cacheKey, { data: depth, timestamp: now });
            }
          } catch (error) {
            console.error(`Error fetching depth for ${crypto.symbol}:`, error);
          }
        })()
      );
    }

    // Wait for all fetches (in batches)
    const batchSize = 20;
    for (let i = 0; i < fetchPromises.length; i += batchSize) {
      await Promise.all(fetchPromises.slice(i, i + batchSize));
    }

    // Sort by volume (descending) - most liquid first
    depths.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));

    // Calculate summary
    const gainers = depths.filter(d => d.change24hPercent > 0).length;
    const losers = depths.filter(d => d.change24hPercent < 0).length;
    
    const topGainers = depths
      .filter(d => d.change24hPercent > 0)
      .sort((a, b) => b.change24hPercent - a.change24hPercent)
      .slice(0, 10)
      .map(d => ({ symbol: d.symbol, name: d.name, change: d.change24hPercent, volume: d.volume24h || 0 }));
    
    const topLosers = depths
      .filter(d => d.change24hPercent < 0)
      .sort((a, b) => a.change24hPercent - b.change24hPercent)
      .slice(0, 10)
      .map(d => ({ symbol: d.symbol, name: d.name, change: d.change24hPercent, volume: d.volume24h || 0 }));
    
    const highVolume = depths
      .filter(d => (d.volume24h || 0) > 0)
      .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
      .slice(0, 10)
      .map(d => ({ symbol: d.symbol, name: d.name, volume: d.volume24h || 0 }));

    // Prepare simple data for AI reading
    const totalVolume = depths.reduce((sum, d) => sum + (d.volume24h || 0), 0);
    const totalBidVolume = depths.reduce((sum, d) => sum + d.bidTotal, 0);
    const totalAskVolume = depths.reduce((sum, d) => sum + d.askTotal, 0);

    const depthData = `
SNAPSHOT PROFONDITÀ DI MERCATO LIVE - Top ${depths.length} Crypto

DATI SEMPLICI:
- Crypto analizzate: ${depths.length}
- Gainers: ${gainers} (${((gainers / depths.length) * 100).toFixed(1)}%)
- Losers: ${losers} (${((losers / depths.length) * 100).toFixed(1)}%)
- Volume totale 24h: $${(totalVolume / 1e9).toFixed(2)}B
- Volume totale Bid (order book): ${(totalBidVolume / 1e6).toFixed(2)}M
- Volume totale Ask (order book): ${(totalAskVolume / 1e6).toFixed(2)}M

TOP 5 GAINERS:
${topGainers.slice(0, 5).map((g, i) => `${i + 1}. ${g.symbol} (${g.name}): +${g.change.toFixed(2)}%, volume $${(g.volume / 1e6).toFixed(2)}M`).join('\n')}

TOP 5 LOSERS:
${topLosers.slice(0, 5).map((l, i) => `${i + 1}. ${l.symbol} (${l.name}): ${l.change.toFixed(2)}%, volume $${(l.volume / 1e6).toFixed(2)}M`).join('\n')}

TOP 5 PER VOLUME:
${highVolume.slice(0, 5).map((v, i) => `${i + 1}. ${v.symbol} (${v.name}): volume $${(v.volume / 1e6).toFixed(2)}M`).join('\n')}
`;

    // Simple readings with Groq AI
    const aiReadings = await readMarketDepthWithGroq(depthData, depths);

    const result: CryptoDepthResult = {
      timestamp: new Date().toISOString(),
      depths,
      summary: {
        totalTracked: depths.length,
        gainers,
        losers,
        topGainers,
        topLosers,
        highVolume,
        aiReadings: {
          marketOverview: aiReadings.marketOverview,
          notableMovements: aiReadings.notableMovements,
          volumeHighlights: aiReadings.volumeHighlights,
        },
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/crypto/top-400-depth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
