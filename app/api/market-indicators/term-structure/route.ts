import { NextRequest, NextResponse } from "next/server";

/**
 * Term Structure Indicator API
 *
 * Futures Term Structure Analysis
 * Academic Reference: Fama & French (1987) - "Commodity Futures Prices"
 *
 * Data Source: Yahoo Finance (FREE)
 * Updates: Every 2 minutes
 */

interface TermStructureResponse {
  contracts: Array<{
    symbol: string;
    expiration: string;
    price: number;
    basis: number; // Basis vs spot
  }>;
  spotPrice: number;
  structure: "contango" | "backwardation" | "neutral";
  timestamp: string;
  aiReading: string;
}

/**
 * Get futures contracts for a symbol (e.g., ES for S&P 500)
 * 
 * NOTA IMPORTANTE: 
 * - Yahoo Finance non ha un'API ufficiale per futures
 * - CME Group ha API ma richiede subscription
 * - Per ora, questa funzione restituisce array vuoto perché:
 *   - Non vogliamo dati mock in produzione
 *   - Non vogliamo scraping fragile
 *   - Meglio implementare quando avremo un'API affidabile
 */
async function getFuturesContracts(
  symbol: string
): Promise<Array<{ symbol: string; expiration: string; price: number }>> {
  // TODO: Implementare quando avremo un'API affidabile per futures (CME Group, Bloomberg, etc.)
  // Per ora, restituiamo array vuoto per evitare dati mock o scraping fragile
  return [];
}

/**
 * Get spot price for a symbol
 */
async function getSpotPrice(symbol: string): Promise<number | null> {
  try {
    // For S&P 500, use ^GSPC
    const spotSymbol = symbol === "ES" ? "^GSPC" : symbol;

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${spotSymbol}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      return null;
    }

    const quotes = result.indicators?.quote?.[0];
    const currentPrice = quotes.close[quotes.close.length - 1];

    return currentPrice || null;
  } catch (error) {
    console.error(`Error fetching spot price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get Groq AI reading for Term Structure
 */
async function getTermStructureAIReading(
  structure: string,
  contracts: Array<{ symbol: string; basis: number }>
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return "AI analysis not available. Configure GROQ_API_KEY.";
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi della term structure dei futures.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Fama & French (1987) - "Commodity Futures Prices"`;

  const userPrompt = `Leggi i dati Term Structure forniti.

DATI FORNITI:
- Structure: ${structure}
- Contracts: ${contracts.map((c) => `${c.symbol}: ${c.basis >= 0 ? "+" : ""}${c.basis.toFixed(2)}%`).join(", ")}

INTERPRETAZIONE:
- Contango: Futures > Spot (normal market)
- Backwardation: Futures < Spot (inverted market)
- Neutral: Futures ≈ Spot

Fornisci una lettura SEMPLICE (2-3 frasi) della term structure basata sui dati forniti.
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
    // Se è un errore di autenticazione o rate limit, restituisci un messaggio più specifico
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
    // Analyze S&P 500 futures (ES)
    const spotPrice = await getSpotPrice("ES");
    const contracts = await getFuturesContracts("ES");

    if (!spotPrice || contracts.length === 0) {
      return NextResponse.json(
        { 
          error: "Term Structure data not yet available. Futures contracts require a reliable API (CME Group, Bloomberg, etc.). Coming soon.",
          spotPrice: spotPrice || null,
          contracts: []
        }, 
        { status: 503 }
      );
    }

    // Calculate basis for each contract
    const contractsWithBasis = contracts.map((contract) => ({
      symbol: contract.symbol,
      expiration: contract.expiration,
      price: contract.price,
      basis: spotPrice > 0 ? ((contract.price - spotPrice) / spotPrice) * 100 : 0,
    }));

    // Determine structure
    const avgBasis =
      contractsWithBasis.reduce((sum, c) => sum + c.basis, 0) / contractsWithBasis.length;
    let structure: "contango" | "backwardation" | "neutral" = "neutral";
    if (avgBasis > 0.5) {
      structure = "contango";
    } else if (avgBasis < -0.5) {
      structure = "backwardation";
    }

    const aiReading = await getTermStructureAIReading(structure, contractsWithBasis);

    const response: TermStructureResponse = {
      contracts: contractsWithBasis,
      spotPrice,
      structure,
      timestamp: new Date().toISOString(),
      aiReading,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in GET /api/market-indicators/term-structure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
