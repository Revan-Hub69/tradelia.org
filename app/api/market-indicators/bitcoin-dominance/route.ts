import { NextRequest, NextResponse } from "next/server";

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
 * Get Groq AI reading for Bitcoin Dominance
 */
async function getBitcoinDominanceAIReading(
  dominance: number,
  bitcoinMarketCap: number,
  totalMarketCap: number
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi del mercato crypto.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Market Cap Analysis - Portfolio Theory
- Bitcoin Dominance come indicatore di sentiment crypto`;

  const userPrompt = `Leggi i dati Bitcoin Dominance forniti.

DATI FORNITI:
- Bitcoin Dominance: ${dominance.toFixed(2)}%
- Bitcoin Market Cap: $${(bitcoinMarketCap / 1e12).toFixed(2)}T
- Total Crypto Market Cap: $${(totalMarketCap / 1e12).toFixed(2)}T

RIFERIMENTO ACCADEMICO:
- Market Cap Analysis - Portfolio Theory
- Bitcoin Dominance misura la percentuale di Bitcoin sul totale market cap crypto
- Indica se il mercato è in "Bitcoin season" (dominance alta) o "Altcoin season" (dominance bassa)

INTERPRETAZIONE ACCADEMICA:
- >60% (High Dominance): Bitcoin domina il mercato. Indica preferenza per asset più sicuro, possibile fase conservativa. Storicamente associato a fasi di accumulo Bitcoin.
- 50-60% (Moderate Dominance): Dominance bilanciata. Mercato in equilibrio tra Bitcoin e altcoin.
- 40-50% (Low Dominance): Altcoin stanno guadagnando terreno. Possibile "Altcoin season", maggiore appetito per rischio.
- <40% (Very Low Dominance): Altcoin dominano. Indica forte rotazione verso altcoin, possibile fase speculativa estrema.

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale del Bitcoin Dominance basata sui dati forniti.
MENTIONA il valore attuale (${dominance.toFixed(2)}%) e la sua interpretazione accademica.
NO predizioni, NO consigli, solo lettura descrittiva.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error("Groq API error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("Groq API returned empty content:", data);
      return "Error generating AI reading.";
    }
    return content;
  } catch (error: any) {
    console.error("Error calling Groq AI:", error);
    if (error?.message?.includes("401") || error?.message?.includes("Unauthorized")) {
      return "AI analysis unavailable: Invalid API key.";
    }
    if (error?.message?.includes("429") || error?.message?.includes("rate limit")) {
      return "AI analysis temporarily unavailable: Rate limit exceeded.";
    }
    return "Error generating AI reading. Please try again later.";
  }
}

export async function GET(_request: NextRequest) {
  try {
    const [dominanceData, history] = await Promise.all([
      getBitcoinDominance(),
      getBitcoinDominanceHistory(),
    ]);

    if (!dominanceData) {
      return NextResponse.json(
        { error: "Failed to fetch Bitcoin Dominance data" },
        { status: 500 }
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/bitcoin-dominance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
