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
    gainers: number;
    losers: number;
    topGainers: Array<{ symbol: string; change: number }>;
    topLosers: Array<{ symbol: string; change: number }>;
    aiAnalysis: string;
    trends: string[];
    alerts: string[];
  };
}

// Top 400 crypto symbols (most liquid/important)
const TOP_400_CRYPTO = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'AVAX',
  'SHIB', 'LINK', 'UNI', 'ATOM', 'LTC', 'ETC', 'XLM', 'BCH', 'ALGO', 'VET',
  'ICP', 'FIL', 'TRX', 'EOS', 'AAVE', 'GRT', 'THETA', 'AXS', 'SAND', 'MANA',
  'CRV', 'MKR', 'COMP', 'SNX', 'YFI', 'SUSHI', '1INCH', 'ENJ', 'CHZ', 'BAT',
  // Add more as needed (up to 400)
  // This is a sample - in production, fetch from CoinGecko API or similar
];

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
 * Analyze crypto market with Groq AI
 */
async function analyzeCryptoMarketWithGroq(
  marketData: string
): Promise<{
  analysis: string;
  trends: string[];
  alerts: string[];
}> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    // Fallback: return basic analysis
    return {
      analysis: 'Analisi AI non disponibile. Configura GROQ_API_KEY per analisi avanzate.',
      trends: [],
      alerts: [],
    };
  }

  const systemPrompt = buildTradeliaCryptoPrompt();
  const userPrompt = `Analizza questo snapshot del mercato crypto (top 400):

${marketData}

Fornisci:
1. Analisi generale del mercato (2-3 frasi)
2. Trend principali identificati (lista breve)
3. Alert su anomalie significative (volatilità, movimenti insoliti)

Rispondi in formato JSON:
{
  "analysis": "...",
  "trends": ["...", "..."],
  "alerts": ["...", "..."]
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
      analysis = JSON.parse(content);
    }

    return {
      analysis: analysis.analysis || '',
      trends: analysis.trends || [],
      alerts: analysis.alerts || [],
    };
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return {
      analysis: 'Errore nell\'analisi AI. Riprova più tardi.',
      trends: [],
      alerts: [],
    };
  }
}

/**
 * GET /api/crypto/top-400-monitor
 * Get top 400 crypto prices and AI analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '400', 10);
    const useCache = searchParams.get('cache') !== 'false';

    const now = Date.now();
    const symbolsToFetch = TOP_400_CRYPTO.slice(0, Math.min(limit, 400));

    // Fetch prices (with caching and rate limiting)
    const cryptos: CryptoData[] = [];
    const fetchPromises: Promise<void>[] = [];

    for (let i = 0; i < symbolsToFetch.length; i++) {
      const symbol = symbolsToFetch[i];
      const cacheKey = symbol;

      // Check cache
      if (useCache) {
        const cached = priceCache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_TTL) {
          cryptos.push(cached.data);
          continue;
        }
      }

      // Fetch with delay to respect rate limits
      fetchPromises.push(
        (async () => {
          await new Promise(resolve => setTimeout(resolve, i * 50)); // 50ms delay between requests

          try {
            const priceResult = await getCurrentPrice(symbol, 'crypto');
            if (priceResult.price !== null && priceResult.price > 0) {
              // For now, we only have price. In production, fetch from CoinGecko for full data
              const cryptoData: CryptoData = {
                symbol,
                name: symbol, // In production, fetch name from API
                price: priceResult.price,
                change24h: 0, // Would need historical data
                change24hPercent: 0,
              };

              cryptos.push(cryptoData);
              priceCache.set(cacheKey, { data: cryptoData, timestamp: now });
            }
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
          }
        })()
      );
    }

    // Wait for all fetches (in batches to avoid overwhelming)
    const batchSize = 20;
    for (let i = 0; i < fetchPromises.length; i += batchSize) {
      await Promise.all(fetchPromises.slice(i, i + batchSize));
    }

    // Sort by market cap (or price if market cap unavailable)
    cryptos.sort((a, b) => (b.marketCap || b.price) - (a.marketCap || a.price));

    // Calculate summary
    const gainers = cryptos.filter(c => c.change24hPercent > 0).length;
    const losers = cryptos.filter(c => c.change24hPercent < 0).length;
    const topGainers = cryptos
      .filter(c => c.change24hPercent > 0)
      .sort((a, b) => b.change24hPercent - a.change24hPercent)
      .slice(0, 10)
      .map(c => ({ symbol: c.symbol, change: c.change24hPercent }));
    const topLosers = cryptos
      .filter(c => c.change24hPercent < 0)
      .sort((a, b) => a.change24hPercent - b.change24hPercent)
      .slice(0, 10)
      .map(c => ({ symbol: c.symbol, change: c.change24hPercent }));

    // Prepare market data for AI
    const marketData = `
Snapshot Mercato Crypto (Top ${cryptos.length}):
- Gainers: ${gainers} (${((gainers / cryptos.length) * 100).toFixed(1)}%)
- Losers: ${losers} (${((losers / cryptos.length) * 100).toFixed(1)}%)
- Top Gainers: ${topGainers.slice(0, 5).map(g => `${g.symbol} (+${g.change.toFixed(2)}%)`).join(', ')}
- Top Losers: ${topLosers.slice(0, 5).map(l => `${l.symbol} (${l.change.toFixed(2)}%)`).join(', ')}
`;

    // Analyze with Groq AI
    const aiAnalysis = await analyzeCryptoMarketWithGroq(marketData);

    const result: CryptoMonitorResult = {
      timestamp: new Date().toISOString(),
      cryptos: cryptos.slice(0, limit),
      summary: {
        totalTracked: cryptos.length,
        gainers,
        losers,
        topGainers,
        topLosers,
        aiAnalysis: aiAnalysis.analysis,
        trends: aiAnalysis.trends,
        alerts: aiAnalysis.alerts,
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
