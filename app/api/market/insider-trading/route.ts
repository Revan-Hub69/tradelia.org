import { NextRequest, NextResponse } from 'next/server';

/**
 * Insider Trading API
 * 
 * SEC EDGAR Insider Trading data
 * - Form 4 Filings (Insider Transactions)
 * - Form 3/5 Filings (Initial/Amended Ownership)
 * - Transaction Types (Buy, Sell, Option Exercise)
 * 
 * Academic Reference:
 * - Insider Trading Theory - Insiders have superior information
 * - Net buying by insiders = bullish signal
 * 
 * Data Source: SEC EDGAR (FREE, HTML/XML parsing required)
 * Updates: Daily (when filings available)
 */

interface InsiderTransaction {
  company: string;
  ticker: string;
  insider: string;
  position: string;
  transactionType: 'buy' | 'sell' | 'option-exercise' | 'grant';
  shares: number;
  value: number;
  date: string;
}

interface InsiderTradingResponse {
  transactions: InsiderTransaction[];
  netBuying: number;
  netSelling: number;
  interpretation: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  timestamp: string;
  aiReading: string;
}

/**
 * Get Insider Trading from SEC EDGAR
 * 
 * NOTE: SEC EDGAR provides data via HTML/XML
 * In production, would parse EDGAR filings or use a third-party API
 */
async function getInsiderTrading(): Promise<InsiderTransaction[]> {
  // SEC EDGAR data requires web scraping or paid API
  // No free API available - throw error
  throw new Error('Insider Trading requires web scraping of SEC EDGAR website or paid API (FMP). Configure FMP_API_KEY for this feature.');
}

/**
 * Get Groq AI reading for Insider Trading (Enhanced)
 */
async function getInsiderTradingAIReading(data: InsiderTradingResponse): Promise<string> {
  const prompts = await import('@/lib/ai/indicator-prompts-enhanced');
  const systemPrompt = prompts.TRADELIA_AI_BASE_SYSTEM_PROMPT;
  const userPrompt = prompts.createGenericIndicatorPrompt(
    'Insider Trading (Trading degli Insider)',
    {
      totalTransactions: data.transactions.length,
      netBuying: `$${(data.netBuying / 1e6).toFixed(2)}M`,
      netSelling: `$${(data.netSelling / 1e6).toFixed(2)}M`,
      sentiment: data.sentiment === 'bullish' ? 'Rialzista' :
                 data.sentiment === 'bearish' ? 'Ribassista' : 'Neutrale',
      topTransactions: data.transactions.slice(0, 5).map(t => ({
        azienda: t.ticker,
        tipo: t.transactionType === 'buy' ? 'Acquisto' :
              t.transactionType === 'sell' ? 'Vendita' : 'Esercizio Opzioni',
        valore: `$${(t.value / 1e3).toFixed(0)}K`,
      })),
    },
    {
      paper: 'Insider Trading and Stock Returns',
      authors: 'Jeng, Metrick, & Zeckhauser',
      year: 2003,
      theory: 'Insider Trading Theory - Gli insider hanno informazioni superiori. Net buying da parte di insider = segnale bullish, net selling = segnale bearish. Gli insider sono tipicamente corretti nel timing delle loro transazioni.',
    }
  );
  
  return prompts.callGroqAI(systemPrompt, userPrompt, 400);
}

export async function GET(_request: NextRequest) {
  try {
    const transactions = await getInsiderTrading();

    const netBuying = transactions
      .filter(t => t.transactionType === 'buy')
      .reduce((sum, t) => sum + t.value, 0);
    
    const netSelling = transactions
      .filter(t => t.transactionType === 'sell')
      .reduce((sum, t) => sum + t.value, 0);

    const netFlow = netBuying - netSelling;

    // Interpretation
    let interpretation = '';
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';

    if (netFlow > 10000000) {
      interpretation = 'Strong insider buying: Net buying significantly exceeds selling, bullish signal';
      sentiment = 'bullish';
    } else if (netFlow < -10000000) {
      interpretation = 'Strong insider selling: Net selling significantly exceeds buying, bearish signal';
      sentiment = 'bearish';
    } else if (netFlow > 0) {
      interpretation = 'Moderate insider buying: Net buying, slightly bullish';
      sentiment = 'bullish';
    } else if (netFlow < 0) {
      interpretation = 'Moderate insider selling: Net selling, slightly bearish';
      sentiment = 'bearish';
    } else {
      interpretation = 'Neutral insider activity: Balanced buying and selling';
      sentiment = 'neutral';
    }

    const response: InsiderTradingResponse = {
      transactions: transactions.slice(0, 50), // Top 50
      netBuying: Math.round(netBuying),
      netSelling: Math.round(netSelling),
      interpretation,
      sentiment,
      timestamp: new Date().toISOString(),
      aiReading: '', // Will be set below
    };

    const aiReading = await getInsiderTradingAIReading(response);
    response.aiReading = aiReading;

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // 1 hour cache
      },
    });
  } catch (error) {
    console.error('Error in GET /api/market/insider-trading:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
