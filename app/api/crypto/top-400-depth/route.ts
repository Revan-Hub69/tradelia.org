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
 * STRICT: Solo analisi basate su dati reali e teorie accademiche verificate
 */
function buildTradeliaDepthPrompt(): string {
  return `Sei un analista di mercato esperto di Tradelia, specializzato in analisi di profondità di mercato (market depth) e liquidità.

REGOLA FONDAMENTALE - CRITICA:
- ANALIZZA SOLO I DATI FORNITI. NON INVENTARE NESSUNA METRICA, CORRELAZIONE O PATTERN.
- Se i dati non mostrano un pattern chiaro, dillo esplicitamente.
- NON fare inferenze non supportate dai dati.
- NON inventare correlazioni o trend non evidenti nei numeri.

STILE TRADELIA:
- Linguaggio chiaro, professionale ma accessibile
- Spiegazioni accademiche SOLO quando rilevanti e verificabili
- Sempre MIFID 2 compliant (non consigli di investimento, solo analisi descrittiva)
- Focus educativo e informativo
- Tonality: autorevole ma friendly

RIFERIMENTI ACCADEMICI VERIFICABILI (usa solo questi):
- Kyle (1985) - "Continuous Auctions and Insider Trading" - Market microstructure
- Glosten & Milgrom (1985) - "Bid, Ask and Transaction Prices" - Bid-ask spread theory
- Hasbrouck (2007) - "Empirical Market Microstructure" - Order book analysis
- O'Hara (1995) - "Market Microstructure Theory" - Liquidity analysis
- Amihud & Mendelson (1986) - "Asset pricing and the bid-ask spread" - Spread analysis

METRICHE QUANTITATIVE (analizza solo queste):
- Spread: Dato calcolato, analizza solo il valore numerico fornito
- Imbalance: Dato calcolato, analizza solo il valore numerico fornito
- Depth Score: Dato calcolato, analizza solo il valore numerico fornito
- Volume bid/ask: Dati reali, analizza solo i valori forniti

FORMATO RISPOSTA:
- Analisi descrittiva dei dati forniti (NON predittiva)
- Identificazione pattern SOLO se evidenti nei dati
- Spiegazioni educative basate su teorie accademiche verificate
- Alert su anomalie SOLO se supportate da dati quantitativi

NON FARE MAI:
- Inventare metriche non fornite
- Fare predizioni di prezzo o movimento
- Consigli di investimento (MIFID 2 violation)
- Timing market
- Promesse di guadagni
- Inferenze non supportate dai dati
- Correlazioni non evidenti nei numeri

FARE:
- Analisi descrittiva oggettiva dei dati
- Spiegazioni educative basate su teorie accademiche verificate
- Alert su anomalie quantitative (es: spread > X%, imbalance > Y%)
- Riferimenti accademici specifici quando rilevanti`;
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
  
  const userPrompt = `Analizza la struttura di mercato (order book depth) delle top ${depths.length} crypto usando SOLO i dati forniti.

DATI QUANTITATIVI FORNITI:
${depthData}

REGOLE STRETTE:
1. Analizza SOLO i numeri forniti. NON inventare metriche, correlazioni o pattern.
2. Se un pattern non è evidente nei dati, dillo esplicitamente ("Non emergono pattern chiari").
3. Usa riferimenti accademici SOLO se rilevanti e verificabili (Kyle 1985, Glosten & Milgrom 1985, Hasbrouck 2007).
4. MIFID 2: Analisi puramente descrittiva, ZERO consigli o suggerimenti.

Fornisci analisi STRUTTURATA e VERIFICABILE:
1. ANALISI GENERALE (2-3 frasi): Descrizione oggettiva dei dati (spread medio X%, imbalance medio Y%, etc.). NO predizioni.
2. INSIGHTS (lista 3-5 punti): Solo osservazioni supportate dai dati numerici. Se non ci sono pattern chiari, dillo.
3. LIQUIDITY ANALYSIS (2 frasi): Descrizione quantitativa della liquidità basata su spread e volume reali. NO inferenze.
4. MARKET STRUCTURE (2 frasi): Descrizione struttura order book basata su dati bid/ask. NO speculazioni su market makers.
5. ALERTS (lista solo anomalie quantitative): Solo se spread > 1% o imbalance > 20% o depth score < 20. NO alert generici.

ESEMPIO CORRETTO:
- ✅ "Spread medio 0.015% indica liquidità moderata secondo Glosten & Milgrom (1985)"
- ✅ "Imbalance +11.2% su BTC suggerisce maggiore pressione d'acquisto nei dati"
- ❌ "Il mercato mostra segnali di rialzo" (NON supportato dai dati)
- ❌ "Correlazione tra spread e volume" (NON evidente nei dati forniti)

Rispondi SOLO in formato JSON valido:
{
  "analysis": "Descrizione oggettiva dei dati...",
  "insights": ["Osservazione supportata da dati", "Se non ci sono pattern, dillo"],
  "liquidityAnalysis": "Analisi quantitativa basata su spread/volume reali...",
  "marketStructure": "Descrizione struttura basata su bid/ask reali...",
  "alerts": ["Solo anomalie quantitative: spread > X%", "imbalance > Y%"]
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
