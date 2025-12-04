import { NextRequest, NextResponse } from 'next/server';

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
  structure: 'contango' | 'backwardation' | 'neutral';
  timestamp: string;
  aiReading: string;
}

/**
 * Get futures contracts for a symbol (e.g., ES for S&P 500)
 */
async function getFuturesContracts(symbol: string): Promise<Array<{ symbol: string; expiration: string; price: number }>> {
  try {
    // For now, use mock data - Yahoo Finance doesn't have easy futures API
    // In production, would use CME Group API or similar
    const contracts = [
      { symbol: 'ES=F', expiration: '2024-03', price: 5200 },
      { symbol: 'ES=F', expiration: '2024-06', price: 5210 },
      { symbol: 'ES=F', expiration: '2024-09', price: 5220 },
    ];

    // Try to get real data from Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (result) {
        const quotes = result.indicators?.quote?.[0];
        const currentPrice = quotes.close[quotes.close.length - 1];
        if (currentPrice) {
          contracts[0].price = currentPrice;
        }
      }
    }

    return contracts;
  } catch (error) {
    console.error(`Error fetching futures contracts for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get spot price for a symbol
 */
async function getSpotPrice(symbol: string): Promise<number | null> {
  try {
    // For S&P 500, use ^GSPC
    const spotSymbol = symbol === 'ES' ? '^GSPC' : symbol;
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${spotSymbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
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
    return 'AI analysis not available. Configure GROQ_API_KEY.';
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
- Contracts: ${contracts.map(c => `${c.symbol}: ${c.basis >= 0 ? '+' : ''}${c.basis.toFixed(2)}%`).join(', ')}

INTERPRETAZIONE:
- Contango: Futures > Spot (normal market)
- Backwardation: Futures < Spot (inverted market)
- Neutral: Futures ≈ Spot

Fornisci una lettura SEMPLICE (2-3 frasi) della term structure basata sui dati forniti.
NO predizioni, NO consigli, solo lettura descrittiva.`;

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
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Analyzing term structure...';
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return 'Error generating AI reading.';
  }
}

export async function GET(request: NextRequest) {
  try {
    // Analyze S&P 500 futures (ES)
    const spotPrice = await getSpotPrice('ES');
    const contracts = await getFuturesContracts('ES');

    if (!spotPrice || contracts.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch term structure data' },
        { status: 500 }
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
    const avgBasis = contractsWithBasis.reduce((sum, c) => sum + c.basis, 0) / contractsWithBasis.length;
    let structure: 'contango' | 'backwardation' | 'neutral' = 'neutral';
    if (avgBasis > 0.5) {
      structure = 'contango';
    } else if (avgBasis < -0.5) {
      structure = 'backwardation';
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
    console.error('Error in GET /api/market-indicators/term-structure:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
