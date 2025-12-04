import { NextRequest, NextResponse } from 'next/server';

/**
 * Top 400 Crypto Market Depth API
 * Profondità di mercato (order book depth) per top 400 crypto
 * 
 * Best Practice: Binance order book API (FREE), Groq AI analysis
 */

interface OrderBookLevel {
  price: number;
  quantity: number;
}

interface MarketDepth {
  symbol: string;
  name: string;
  bids: OrderBookLevel[]; // Ordini di acquisto (dal prezzo più alto)
  asks: OrderBookLevel[]; // Ordini di vendita (dal prezzo più basso)
  bidTotal: number; // Volume totale bid
  askTotal: number; // Volume totale ask
  spread: number; // Spread percentuale
  imbalance: number; // Imbalance bid/ask (positive = più bid, negative = più ask)
  depthScore: number; // Score profondità (0-100)
}

interface CryptoDepthResult {
  timestamp: string;
  depths: MarketDepth[];
  summary: {
    totalTracked: number;
    avgSpread: number;
    avgImbalance: number;
    highDepth: Array<{ symbol: string; depthScore: number }>;
    lowDepth: Array<{ symbol: string; depthScore: number }>;
    aiAnalysis: {
      analysis: string;
      insights: string[];
      liquidityAnalysis: string;
      marketStructure: string;
      alerts: string[];
    };
  };
}

// Cache for order books (2 minutes - order books change frequently)
const depthCache = new Map<string, { data: MarketDepth; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000;

/**
 * Get top 400 crypto from CoinGecko
 */
async function getTop400CryptoSymbols(): Promise<Array<{ symbol: string; name: string; id: string }>> {
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
    }));
  } catch (error) {
    console.error('Error fetching top 400 crypto:', error);
    // Fallback to major cryptos
    return [
      { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
      { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
      { symbol: 'BNB', name: 'BNB', id: 'binancecoin' },
      { symbol: 'SOL', name: 'Solana', id: 'solana' },
      { symbol: 'XRP', name: 'XRP', id: 'ripple' },
    ];
  }
}

/**
 * Get order book depth from Binance
 * Binance Free API: /api/v3/depth
 */
async function getBinanceOrderBook(symbol: string, limit: number = 20): Promise<MarketDepth | null> {
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

    // Depth score: combination of volume and spread (0-100)
    // Higher volume + lower spread = higher score
    const volumeScore = Math.min((totalVolume / 1000) * 50, 50); // Max 50 points for volume
    const spreadScore = Math.max(50 - (spread * 10), 0); // Max 50 points for tight spread
    const depthScore = Math.min(volumeScore + spreadScore, 100);

    return {
      symbol,
      name: symbol, // Will be updated with CoinGecko name
      bids,
      asks,
      bidTotal,
      askTotal,
      spread,
      imbalance,
      depthScore,
    };
  } catch (error) {
    console.error(`Error fetching order book for ${symbol}:`, error);
    return null;
  }
}

/**
 * Build Tradelia system prompt for market depth analysis
 */
function buildTradeliaDepthPrompt(): string {
  return `Sei un analista di mercato esperto di Tradelia, specializzato in analisi di profondità di mercato (market depth) e liquidità.

STILE TRADELIA:
- Linguaggio chiaro, professionale ma accessibile
- Spiegazioni accademiche quando rilevante
- Sempre MIFID compliant (non consigli di investimento)
- Focus educativo e informativo
- Tonality: autorevole ma friendly

STANDARD ACCADEMICI:
- Market Microstructure Theory
- Order Book Dynamics
- Liquidity Analysis
- Bid-Ask Spread analysis
- Market Impact Theory

FORMATO RISPOSTA:
- Analisi strutturata e approfondita
- Identificazione pattern di liquidità
- Analisi struttura di mercato
- Alert su anomalie di profondità
- Spiegazioni educative (non predizioni)

NON FARE:
- Predizioni di prezzo
- Consigli di investimento
- Timing market
- Promesse di guadagni

FARE:
- Analisi oggettiva di liquidità
- Identificazione pattern order book
- Educazione su market microstructure
- Alert su spread anomali o imbalance`;
}

/**
 * Analyze market depth with Groq AI
 */
async function analyzeMarketDepthWithGroq(
  depthData: string,
  depths: MarketDepth[]
): Promise<{
  analysis: string;
  insights: string[];
  liquidityAnalysis: string;
  marketStructure: string;
  alerts: string[];
}> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return {
      analysis: 'Analisi AI non disponibile. Configura GROQ_API_KEY.',
      insights: [],
      liquidityAnalysis: '',
      marketStructure: '',
      alerts: [],
    };
  }

  const systemPrompt = buildTradeliaDepthPrompt();
  
  const userPrompt = `Analizza in profondità la struttura di mercato (order book depth) delle top ${depths.length} crypto:

${depthData}

Fornisci analisi approfondita strutturata:
1. ANALISI GENERALE (3-4 frasi): Stato generale della liquidità, spread medi, struttura di mercato
2. INSIGHTS (lista 5-7 punti): Pattern identificati, correlazioni, osservazioni interessanti sulla profondità
3. LIQUIDITY ANALYSIS (2-3 frasi): Analisi liquidità aggregata, crypto più/meno liquide, distribuzione
4. MARKET STRUCTURE (2-3 frasi): Struttura order book, presenza market makers, pattern di trading
5. ALERTS (lista punti critici): Spread anomali, imbalance significativi, bassa liquidità, potenziali rischi

IMPORTANTE:
- Usa linguaggio Tradelia: chiaro, professionale, educativo
- Riferimenti accademici quando rilevante (Market Microstructure, Order Book Dynamics)
- MIFID compliant: NO consigli, solo analisi oggettiva
- Focus educativo: spiega COSA mostra la profondità, non COSA fare

Rispondi SOLO in formato JSON valido:
{
  "analysis": "Analisi generale...",
  "insights": ["Insight 1", "Insight 2", ...],
  "liquidityAnalysis": "Analisi liquidità...",
  "marketStructure": "Struttura mercato...",
  "alerts": ["Alert 1", "Alert 2", ...]
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
      analysis: analysis.analysis || '',
      insights: analysis.insights || [],
      liquidityAnalysis: analysis.liquidityAnalysis || '',
      marketStructure: analysis.marketStructure || '',
      alerts: analysis.alerts || [],
    };
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return {
      analysis: 'Errore nell\'analisi AI. Riprova più tardi.',
      insights: [],
      liquidityAnalysis: '',
      marketStructure: '',
      alerts: [],
    };
  }
}

/**
 * GET /api/crypto/top-400-depth
 * Get market depth (order book) for top 400 crypto with Groq AI analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '400', 10);
    const useCache = searchParams.get('cache') !== 'false';
    const orderBookLimit = parseInt(searchParams.get('depth') || '20', 10); // Number of levels

    const now = Date.now();

    // Get top 400 crypto symbols
    const topCryptos = await getTop400CryptoSymbols();
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
            const depth = await getBinanceOrderBook(crypto.symbol, orderBookLimit);
            if (depth) {
              depth.name = crypto.name; // Update with CoinGecko name
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

    // Sort by depth score (descending)
    depths.sort((a, b) => b.depthScore - a.depthScore);

    // Calculate summary
    const avgSpread = depths.reduce((sum, d) => sum + d.spread, 0) / depths.length;
    const avgImbalance = depths.reduce((sum, d) => sum + d.imbalance, 0) / depths.length;
    const highDepth = depths.slice(0, 10).map(d => ({ symbol: d.symbol, depthScore: d.depthScore }));
    const lowDepth = depths.slice(-10).reverse().map(d => ({ symbol: d.symbol, depthScore: d.depthScore }));

    // Prepare depth data for AI
    const totalBidVolume = depths.reduce((sum, d) => sum + d.bidTotal, 0);
    const totalAskVolume = depths.reduce((sum, d) => sum + d.askTotal, 0);
    const overallImbalance = ((totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume)) * 100;

    const depthData = `
SNAPSHOT PROFONDITÀ DI MERCATO LIVE - Top ${depths.length} Crypto

METRICHE AGGREGATE:
- Crypto analizzate: ${depths.length}
- Spread medio: ${avgSpread.toFixed(4)}%
- Imbalance medio: ${avgImbalance.toFixed(2)}%
- Volume totale Bid: ${(totalBidVolume / 1e6).toFixed(2)}M
- Volume totale Ask: ${(totalAskVolume / 1e6).toFixed(2)}M
- Imbalance globale: ${overallImbalance >= 0 ? '+' : ''}${overallImbalance.toFixed(2)}%

TOP 10 PER LIQUIDITÀ (Depth Score):
${highDepth.map((d, i) => `${i + 1}. ${d.symbol}: Score ${d.depthScore.toFixed(1)}/100`).join('\n')}

BOTTOM 10 PER LIQUIDITÀ:
${lowDepth.map((d, i) => `${i + 1}. ${d.symbol}: Score ${d.depthScore.toFixed(1)}/100`).join('\n')}

DISTRIBUZIONE SPREAD:
- Spread molto stretto (<0.01%): ${depths.filter(d => d.spread < 0.01).length}
- Spread stretto (0.01-0.1%): ${depths.filter(d => d.spread >= 0.01 && d.spread < 0.1).length}
- Spread moderato (0.1-0.5%): ${depths.filter(d => d.spread >= 0.1 && d.spread < 0.5).length}
- Spread ampio (>0.5%): ${depths.filter(d => d.spread >= 0.5).length}

DISTRIBUZIONE IMBALANCE:
- Forte domanda (imbalance >10%): ${depths.filter(d => d.imbalance > 10).length}
- Domanda moderata (5-10%): ${depths.filter(d => d.imbalance > 5 && d.imbalance <= 10).length}
- Bilanciato (-5% a +5%): ${depths.filter(d => d.imbalance >= -5 && d.imbalance <= 5).length}
- Offerta moderata (-10% a -5%): ${depths.filter(d => d.imbalance >= -10 && d.imbalance < -5).length}
- Forte offerta (imbalance <-10%): ${depths.filter(d => d.imbalance < -10).length}
`;

    // Analyze with Groq AI
    const aiAnalysis = await analyzeMarketDepthWithGroq(depthData, depths);

    const result: CryptoDepthResult = {
      timestamp: new Date().toISOString(),
      depths,
      summary: {
        totalTracked: depths.length,
        avgSpread,
        avgImbalance,
        highDepth,
        lowDepth,
        aiAnalysis: {
          analysis: aiAnalysis.analysis,
          insights: aiAnalysis.insights,
          liquidityAnalysis: aiAnalysis.liquidityAnalysis,
          marketStructure: aiAnalysis.marketStructure,
          alerts: aiAnalysis.alerts,
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
