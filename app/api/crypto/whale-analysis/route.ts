import { NextRequest, NextResponse } from 'next/server';

/**
 * Crypto Whale Analysis API
 * 
 * Features:
 * - Real-time whale transactions (Whale Alert API)
 * - Exchange flows (Glassnode API - fallback to mock)
 * - Whale ratio analysis
 * - Groq AI reading
 * 
 * Updates: Every 30 seconds (real-time)
 * Pro Feature: Full access
 */

interface WhaleTransaction {
  symbol: string;
  amount: number;
  value: number;
  from: string;
  to: string;
  timestamp: string;
}

interface WhaleAnalysisResponse {
  transactions: WhaleTransaction[];
  exchangeFlows: {
    deposits: number;
    withdrawals: number;
    netFlow: number;
  };
  whaleRatio: number;
  aiReading: string;
  timestamp: string;
}

/**
 * Get whale transactions from Whale Alert API (FREE tier)
 */
async function getWhaleTransactions(): Promise<WhaleTransaction[]> {
  const whaleAlertApiKey = process.env.WHALE_ALERT_API_KEY;
  
  if (!whaleAlertApiKey) {
    // Fallback: return empty or mock data
    console.warn('WHALE_ALERT_API_KEY not configured, using mock data');
    return [];
  }

  try {
    // Whale Alert API: last 100 transactions > $1M
    const response = await fetch(
      `https://api.whale-alert.io/v1/transactions?api_key=${whaleAlertApiKey}&min_value=1000000&limit=100`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Whale Alert API error');
    }

    const data = await response.json();
    const transactions = data.transactions || [];

    return transactions
      .filter((tx: any) => tx.blockchain && tx.symbol)
      .map((tx: any) => ({
        symbol: tx.symbol,
        amount: parseFloat(tx.amount) || 0,
        value: parseFloat(tx.amount_usd) || 0,
        from: tx.from?.address || 'Unknown',
        to: tx.to?.address || 'Unknown',
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
      }))
      .slice(0, 50); // Last 50 transactions
  } catch (error) {
    console.error('Error fetching whale transactions:', error);
    return [];
  }
}

/**
 * Get exchange flows (mock for now - Glassnode requires paid tier)
 */
async function getExchangeFlows(): Promise<{ deposits: number; withdrawals: number; netFlow: number }> {
  // TODO: Implement with Glassnode API when available
  // For now, return mock data
  return {
    deposits: 500000000, // $500M
    withdrawals: 450000000, // $450M
    netFlow: 50000000, // $50M net inflow
  };
}

/**
 * Calculate whale ratio (simplified)
 */
function calculateWhaleRatio(transactions: WhaleTransaction[]): number {
  if (transactions.length === 0) return 0;
  
  // Simple calculation: average transaction value / $1M
  const avgValue = transactions.reduce((sum, tx) => sum + tx.value, 0) / transactions.length;
  return Math.min(avgValue / 1000000, 100); // Cap at 100
}

/**
 * Get Groq AI reading for whale analysis
 */
async function getWhaleAIReading(
  transactions: WhaleTransaction[],
  exchangeFlows: { deposits: number; withdrawals: number; netFlow: number },
  whaleRatio: number
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return 'AI analysis not available. Configure GROQ_API_KEY.';
  }

  const systemPrompt = `Sei un analista di mercato esperto di Tradelia, specializzato nell'analisi dei movimenti whale.

REGOLA FONDAMENTALE:
- LEGGI SOLO I DATI FORNITI. Descrivi cosa vedi, NON analizzare o interpretare complessamente.
- NO invenzioni, NO pattern non evidenti, NO correlazioni.
- Linguaggio semplice e diretto.

STILE TRADELIA:
- Chiaro, professionale ma accessibile
- Sempre MIFID 2 compliant (solo lettura dati, zero consigli)
- Focus informativo semplice

RIFERIMENTI ACCADEMICI:
- Kyle (1985) - "Continuous Auctions and Insider Trading" (market impact)
- Easley & O'Hara (1987) - "Price, Trade Size, and Information in Securities Markets"`;

  const topTransactions = transactions.slice(0, 5);
  const transactionSummary = topTransactions
    .map((tx, i) => `${i + 1}. ${tx.symbol}: $${(tx.value / 1e6).toFixed(2)}M`)
    .join('\n');

  const userPrompt = `Leggi i dati whale analysis forniti.

DATI FORNITI:
- Recent Transactions: ${transactions.length}
- Top Transactions:
${transactionSummary}
- Exchange Deposits: $${(exchangeFlows.deposits / 1e6).toFixed(2)}M
- Exchange Withdrawals: $${(exchangeFlows.withdrawals / 1e6).toFixed(2)}M
- Net Flow: $${(exchangeFlows.netFlow / 1e6).toFixed(2)}M
- Whale Ratio: ${whaleRatio.toFixed(2)}

Fornisci una lettura SEMPLICE (3-4 frasi) dei movimenti whale basata sui dati forniti.
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
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Analyzing whale movements...';
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    return 'Error generating AI reading.';
  }
}

export async function GET(request: NextRequest) {
  try {
    const [transactions, exchangeFlows] = await Promise.all([
      getWhaleTransactions(),
      getExchangeFlows(),
    ]);

    const whaleRatio = calculateWhaleRatio(transactions);
    const aiReading = await getWhaleAIReading(transactions, exchangeFlows, whaleRatio);

    const response: WhaleAnalysisResponse = {
      transactions: transactions.slice(0, 20), // Last 20 for display
      exchangeFlows,
      whaleRatio,
      aiReading,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/crypto/whale-analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
