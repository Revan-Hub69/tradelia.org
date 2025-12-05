import { NextRequest, NextResponse } from "next/server";

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
 * Get Groq AI reading for Crypto Market Cap
 */
async function getCryptoMarketCapAIReading(
  totalMarketCap: number,
  totalVolume24h: number,
  bitcoinDominance: number
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi del mercato crypto.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessivamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Market Cap Analysis - Portfolio Theory
- Total Market Cap come indicatore di dimensione e maturità del mercato crypto`;

  const userPrompt = `Leggi i dati Total Crypto Market Cap forniti.

DATI FORNITI:
- Total Market Cap: $${(totalMarketCap / 1e12).toFixed(2)}T
- 24h Volume: $${(totalVolume24h / 1e9).toFixed(2)}B
- Bitcoin Dominance: ${bitcoinDominance.toFixed(2)}%

RIFERIMENTO ACCADEMICO:
- Market Cap Analysis - Portfolio Theory
- Total Market Cap misura la dimensione complessiva del mercato crypto
- Volume 24h indica liquidità e attività di trading

INTERPRETAZIONE ACCADEMICA:
- Market Cap elevato: Mercato maturo, maggiore adozione istituzionale. Indica dimensione e importanza del settore crypto.
- Volume elevato: Alta liquidità, forte attività di trading. Indica interesse e partecipazione attiva.
- Bitcoin Dominance: Percentuale di Bitcoin sul totale. Alta: preferenza per asset sicuro. Bassa: rotazione verso altcoin.

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale del Total Crypto Market Cap basata sui dati forniti.
MENTIONA il valore del market cap ($${(totalMarketCap / 1e12).toFixed(2)}T) e il volume 24h.
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
    const [marketCapData, history] = await Promise.all([
      getCryptoMarketCap(),
      getCryptoMarketCapHistory(),
    ]);

    if (!marketCapData) {
      return NextResponse.json(
        { error: "Failed to fetch Crypto Market Cap data" },
        { status: 500 }
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/crypto-market-cap:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
