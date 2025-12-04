import { NextRequest, NextResponse } from 'next/server';
import { getBinancePriceWithFallback } from '@/lib/price-apis/binance';
import { getCurrentPrice } from '@/lib/price-apis';

/**
 * Top 400 Crypto Monitor API
 * Monitoraggio live top 400 crypto con analisi Groq AI
 * 
 * Best Practice: Batch updates, caching, Groq AI analysis
 */

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  marketCap?: number;
  volume24h?: number;
}

interface CryptoMonitorResult {
  timestamp: string;
  cryptos: CryptoData[];
  summary: {
    totalTracked: number;
    totalMarketCap: number;
    gainers: number;
    losers: number;
    avgChange24h: number;
    topGainers: Array<{ symbol: string; name: string; change: number }>;
    topLosers: Array<{ symbol: string; name: string; change: number }>;
    aiAnalysis: {
      analysis: string;
      trends: string[];
      insights: string[];
      sectorAnalysis: string;
      alerts: string[];
    };
  };
}

/**
 * Get top 400 crypto from CoinGecko API (FREE)
 * CoinGecko Free Tier: 50 calls/minute, no API key required
 */
async function getTop400CryptoSymbols(): Promise<Array<{ symbol: string; name: string; id: string }>> {
  try {
    // CoinGecko free API - get top 400 by market cap
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=400&page=1&sparkline=false',
      {
        headers: {
          'Accept': 'application/json',
        },
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
      marketCap: coin.market_cap,
      price: coin.current_price,
      change24h: coin.price_change_24h,
      change24hPercent: coin.price_change_percentage_24h,
    }));
  } catch (error) {
    console.error('Error fetching top 400 crypto from CoinGecko:', error);
    // Fallback: return most common symbols
    return [
      { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
      { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
      { symbol: 'BNB', name: 'BNB', id: 'binancecoin' },
      { symbol: 'SOL', name: 'Solana', id: 'solana' },
      { symbol: 'XRP', name: 'XRP', id: 'ripple' },
      // Add more fallback symbols if needed
    ];
  }
}

// Cache for prices (5 minutes)
const priceCache = new Map<string, { data: CryptoData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Build Tradelia system prompt for crypto analysis
 */
function buildTradeliaCryptoPrompt(): string {
  return `Sei un analista crypto esperto di Tradelia, specializzato in analisi di mercato e trend.

STILE TRADELIA:
- Linguaggio chiaro, professionale ma accessibile
- Spiegazioni accademiche quando rilevante
- Sempre MIFID compliant (non consigli di investimento)
- Focus educativo e informativo
- Tonality: autorevole ma friendly

STANDARD ACCADEMICI:
- Analisi tecnica basata su principi accademici
- Riferimenti a Efficient Market Hypothesis quando rilevante
- Best practices per crypto analysis
- Risk management principles

FORMATO RISPOSTA:
- Analisi concisa e strutturata
- Identificazione trend principali
- Alert su anomalie significative
- Spiegazioni educative (non predizioni)

NON FARE:
- Predizioni di prezzo specifiche
- Consigli di investimento
- Timing market suggestions
- Promesse di guadagni

FARE:
- Analisi oggettiva di trend
- Identificazione pattern
- Educazione su best practices
- Alert su volatilità anomala`;
}

/**
 * Analyze crypto market with Groq AI - Deep Analysis
 */
async function analyzeCryptoMarketWithGroq(
  marketData: string,
  cryptos: CryptoData[]
): Promise<{
  analysis: string;
  trends: string[];
  alerts: string[];
  insights: string[];
  sectorAnalysis: string;
}> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    // Fallback: return basic analysis
    return {
      analysis: 'Analisi AI non disponibile. Configura GROQ_API_KEY per analisi avanzate.',
      trends: [],
      alerts: [],
      insights: [],
      sectorAnalysis: '',
    };
  }

  const systemPrompt = buildTradeliaCryptoPrompt();
  
  // Prepare additional context for deeper analysis
  const volatilityAnalysis = cryptos
    .filter(c => Math.abs(c.change24hPercent) > 15)
    .slice(0, 10)
    .map(c => `${c.symbol}: ${c.change24hPercent >= 0 ? '+' : ''}${c.change24hPercent.toFixed(2)}%`)
    .join(', ');

  const userPrompt = `Analizza in profondità questo snapshot LIVE del mercato crypto (top ${cryptos.length}):

${marketData}

CONTESTO AGGIUNTIVO:
- Crypto ad alta volatilità (>15%): ${volatilityAnalysis || 'Nessuna'}
- Dominanza Bitcoin: ${cryptos[0]?.symbol === 'BTC' ? ((cryptos[0].marketCap || 0) / cryptos.reduce((sum, c) => sum + (c.marketCap || 0), 0) * 100).toFixed(2) + '%' : 'N/A'}

Fornisci analisi approfondita strutturata:
1. ANALISI GENERALE (3-4 frasi): Stato generale del mercato, sentiment, direzione principale
2. TREND PRINCIPALI (lista 5-7 punti): Pattern identificati, movimenti significativi, settori in crescita/declino
3. INSIGHTS (lista 3-5 punti): Osservazioni interessanti, correlazioni, anomalie statistiche
4. SECTOR ANALYSIS (2-3 frasi): Analisi per categorie (Layer 1, DeFi, NFT, Meme, etc.) se identificabili
5. ALERTS (lista punti critici): Volatilità anomala, movimenti insoliti, potenziali rischi

IMPORTANTE:
- Usa linguaggio Tradelia: chiaro, professionale, educativo
- Riferimenti accademici quando rilevante (Efficient Market Hypothesis, Behavioral Finance)
- MIFID compliant: NO consigli di investimento, solo analisi oggettiva
- Focus educativo: spiega COSA sta succedendo, non COSA fare

Rispondi SOLO in formato JSON valido:
{
  "analysis": "Analisi generale del mercato...",
  "trends": ["Trend 1", "Trend 2", ...],
  "insights": ["Insight 1", "Insight 2", ...],
  "sectorAnalysis": "Analisi settori...",
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
        max_tokens: 1000,
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
        // Try to extract JSON from text
        try {
          analysis = JSON.parse(content);
        } catch (e2) {
          // Fallback: return structured response
          analysis = {
            analysis: content.substring(0, 500),
            trends: [],
            insights: [],
            sectorAnalysis: '',
            alerts: [],
          };
        }
      }

      return {
        analysis: analysis.analysis || '',
        trends: analysis.trends || [],
        insights: analysis.insights || [],
        sectorAnalysis: analysis.sectorAnalysis || '',
        alerts: analysis.alerts || [],
      };
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return {
      analysis: 'Errore nell\'analisi AI. Riprova più tardi.',
      trends: [],
      insights: [],
      sectorAnalysis: '',
      alerts: [],
    };
  }
}

/**
 * GET /api/crypto/top-400-monitor
 * Get top 400 crypto prices LIVE and AI analysis with Groq
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '400', 10);
    const useCache = searchParams.get('cache') !== 'false';

    const now = Date.now();
    
    // Get top 400 crypto from CoinGecko (FREE API, no key required)
    const topCryptos = await getTop400CryptoSymbols();
    const cryptosToProcess = topCryptos.slice(0, Math.min(limit, 400));

    // Fetch prices from CoinGecko (already have prices, but get fresh data)
    const cryptos: CryptoData[] = [];

    // CoinGecko already provides prices, so we use that data directly
    for (const crypto of cryptosToProcess) {
      const cacheKey = crypto.symbol;

      // Check cache
      if (useCache) {
        const cached = priceCache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_TTL) {
          cryptos.push(cached.data);
          continue;
        }
      }

      // Use CoinGecko data (already fetched)
      const cryptoData: CryptoData = {
        symbol: crypto.symbol,
        name: crypto.name,
        price: crypto.price || 0,
        change24h: crypto.change24h || 0,
        change24hPercent: crypto.change24hPercent || 0,
        marketCap: crypto.marketCap,
        volume24h: 0, // Would need additional API call
      };

      cryptos.push(cryptoData);
      priceCache.set(cacheKey, { data: cryptoData, timestamp: now });
    }

    // Sort by market cap (descending)
    cryptos.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));

    // Calculate summary
    const gainers = cryptos.filter(c => c.change24hPercent > 0).length;
    const losers = cryptos.filter(c => c.change24hPercent < 0).length;
    const topGainers = cryptos
      .filter(c => c.change24hPercent > 0)
      .sort((a, b) => b.change24hPercent - a.change24hPercent)
      .slice(0, 10)
      .map(c => ({ symbol: c.symbol, name: c.name, change: c.change24hPercent }));
    const topLosers = cryptos
      .filter(c => c.change24hPercent < 0)
      .sort((a, b) => a.change24hPercent - b.change24hPercent)
      .slice(0, 10)
      .map(c => ({ symbol: c.symbol, name: c.name, change: c.change24hPercent }));

    // Prepare detailed market data for AI analysis
    const totalMarketCap = cryptos.reduce((sum, c) => sum + (c.marketCap || 0), 0);
    const avgChange = cryptos.reduce((sum, c) => sum + c.change24hPercent, 0) / cryptos.length;
    const top10ByMarketCap = cryptos.slice(0, 10).map(c => ({
      symbol: c.symbol,
      name: c.name,
      marketCap: c.marketCap || 0,
      change: c.change24hPercent,
    }));

    const marketData = `
SNAPSHOT MERCATO CRYPTO LIVE - Top ${cryptos.length} per Market Cap

METRICHE GENERALI:
- Market Cap Totale Top ${cryptos.length}: $${(totalMarketCap / 1e12).toFixed(2)}T
- Gainers: ${gainers} (${((gainers / cryptos.length) * 100).toFixed(1)}%)
- Losers: ${losers} (${((losers / cryptos.length) * 100).toFixed(1)}%)
- Cambio Medio 24h: ${avgChange.toFixed(2)}%

TOP 10 PER MARKET CAP:
${top10ByMarketCap.map((c, i) => `${i + 1}. ${c.name} (${c.symbol}): $${(c.marketCap / 1e9).toFixed(2)}B, ${c.change >= 0 ? '+' : ''}${c.change.toFixed(2)}%`).join('\n')}

TOP 5 GAINERS 24H:
${topGainers.slice(0, 5).map((g, i) => `${i + 1}. ${g.symbol}: +${g.change.toFixed(2)}%`).join('\n')}

TOP 5 LOSERS 24H:
${topLosers.slice(0, 5).map((l, i) => `${i + 1}. ${l.symbol}: ${l.change.toFixed(2)}%`).join('\n')}

DISTRIBUZIONE PERFORMANCE:
- Forte crescita (>10%): ${cryptos.filter(c => c.change24hPercent > 10).length}
- Crescita moderata (5-10%): ${cryptos.filter(c => c.change24hPercent > 5 && c.change24hPercent <= 10).length}
- Stabile (-5% a +5%): ${cryptos.filter(c => c.change24hPercent >= -5 && c.change24hPercent <= 5).length}
- Declino moderato (-10% a -5%): ${cryptos.filter(c => c.change24hPercent >= -10 && c.change24hPercent < -5).length}
- Forte declino (<-10%): ${cryptos.filter(c => c.change24hPercent < -10).length}
`;

    // Analyze with Groq AI (deep analysis)
    const aiAnalysis = await analyzeCryptoMarketWithGroq(marketData, cryptos);

    const result: CryptoMonitorResult = {
      timestamp: new Date().toISOString(),
      cryptos: cryptos.slice(0, limit),
      summary: {
        totalTracked: cryptos.length,
        totalMarketCap,
        gainers,
        losers,
        avgChange24h: avgChange,
        topGainers,
        topLosers,
        aiAnalysis: {
          analysis: aiAnalysis.analysis,
          trends: aiAnalysis.trends,
          insights: aiAnalysis.insights,
          sectorAnalysis: aiAnalysis.sectorAnalysis,
          alerts: aiAnalysis.alerts,
        },
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/crypto/top-400-monitor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
