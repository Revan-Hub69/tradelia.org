import { NextRequest, NextResponse } from 'next/server';

/**
 * VIX Indicator API
 * 
 * CBOE Volatility Index - "Fear Index"
 * Academic Reference: Whaley (1993) - "Derivatives on Market Volatility"
 * 
 * Data Source: Yahoo Finance (FREE)
 * Updates: Every 1 minute
 */

interface VIXResponse {
  value: number;
  change: number;
  changePercent: number;
  timestamp: string;
  history: Array<{ date: string; value: number }>;
  aiReading: string;
}

/**
 * Get VIX data from Yahoo Finance
 */
async function getVIXFromYahoo(): Promise<{ value: number; change: number; changePercent: number } | null> {
  try {
    // Yahoo Finance symbol for VIX
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=30d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Yahoo Finance API error');
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      return null;
    }

    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;
    const currentIndex = timestamps.length - 1;
    
    const currentValue = quotes.close[currentIndex];
    const previousValue = quotes.close[currentIndex - 1] || currentValue;
    
    const change = currentValue - previousValue;
    const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

    return {
      value: currentValue,
      change,
      changePercent,
    };
  } catch (error) {
    console.error('Error fetching VIX from Yahoo Finance:', error);
    return null;
  }
}

/**
 * Get VIX history from Yahoo Finance
 */
async function getVIXHistory(): Promise<Array<{ date: string; value: number }>> {
  try {
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1d&range=30d',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      return [];
    }

    const quotes = result.indicators?.quote?.[0];
    const timestamps = result.timestamp;

    return timestamps
      .map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString(),
        value: quotes.close[index],
      }))
      .filter((item: { date: string; value: number }) => item.value != null);
  } catch (error) {
    console.error('Error fetching VIX history:', error);
    return [];
  }
}

/**
 * Get Groq AI reading for VIX
 */
async function getVIXAIReading(vixValue: number, change: number, changePercent: number): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return 'AI analysis not available. Configure GROQ_API_KEY.';
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi della volatilità.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Whaley (1993) - "Derivatives on Market Volatility"`;

  const userPrompt = `Leggi i dati VIX forniti.

DATI FORNITI:
- VIX Value: ${vixValue.toFixed(2)}
- Change: ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)

INTERPRETAZIONE VIX:
- < 12: Low Volatility
- 12-20: Normal Volatility
- 20-30: Elevated Volatility
- > 30: High Volatility (Fear)

Fornisci una lettura SEMPLICE (2-3 frasi) dello stato attuale del VIX basata sui dati forniti.
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
    return data.choices[0]?.message?.content || 'Analyzing VIX data...';
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return 'Error generating AI reading.';
  }
}

export async function GET(request: NextRequest) {
  try {
    const [vixData, history] = await Promise.all([
      getVIXFromYahoo(),
      getVIXHistory(),
    ]);

    if (!vixData) {
      return NextResponse.json(
        { error: 'Failed to fetch VIX data' },
        { status: 500 }
      );
    }

    const aiReading = await getVIXAIReading(vixData.value, vixData.change, vixData.changePercent);

    const response: VIXResponse = {
      value: vixData.value,
      change: vixData.change,
      changePercent: vixData.changePercent,
      timestamp: new Date().toISOString(),
      history: history.slice(-30), // Last 30 days
      aiReading,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/market-indicators/vix:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
