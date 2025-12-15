/**
 * API: On-Chain Data
 * 
 * Exchange Reserves, Whale Movements, Trends
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getWhaleMovements,
  getExchangeReservesTrend,
} from '@/lib/price-apis/onchain';

interface OnChainData {
  symbol: string;
  whaleMovements: any[] | null;
  exchangeFlow: {
    netFlow24h: number;
    netFlowPercent: number;
    inflow24h: number;
    outflow24h: number;
    interpretation: string;
  } | null;
  explanation?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTC';
    const includeExplanation = searchParams.get('explanation') === 'true';

    // Fetch dati on-chain
    const [whaleMovements, exchangeFlow] = await Promise.all([
      getWhaleMovements(symbol, 1000000), // Min $1M
      getExchangeReservesTrend(symbol),
    ]);

    let interpretation = '';
    if (exchangeFlow) {
      if (exchangeFlow.netFlowPercent > 10) {
        interpretation = 'Forte outflow da exchange: holder stanno ritirando, segnale bullish a lungo termine.';
      } else if (exchangeFlow.netFlowPercent < -10) {
        interpretation = 'Forte inflow su exchange: holder stanno depositando, possibile selling pressure.';
      } else {
        interpretation = 'Flussi bilanciati: nessun segnale forte di accumulo o distribuzione.';
      }
    }

    const result: OnChainData = {
      symbol,
      whaleMovements,
      exchangeFlow: exchangeFlow
        ? {
            ...exchangeFlow,
            interpretation,
          }
        : null,
    };

    // Genera spiegazione AI se richiesta
    if (includeExplanation && exchangeFlow) {
      const { generateGroqExplanation } = await import('@/lib/ai/groq-helper');
      
      const prompt = `Spiega i dati on-chain per ${symbol}:

Exchange Flow (24h):
- Net Flow: $${exchangeFlow.netFlow24h.toLocaleString()} (${exchangeFlow.netFlowPercent.toFixed(2)}%)
- Inflow: $${exchangeFlow.inflow24h.toLocaleString()}
- Outflow: $${exchangeFlow.outflow24h.toLocaleString()}
- Interpretazione: ${interpretation}

Whale Movements: ${whaleMovements?.length || 0} movimenti >$1M nelle ultime 24h

Spiega:
1. Cosa significano questi dati per il mercato
2. Quando sono segnali forti vs deboli
3. Limitazioni: dati on-chain sono lenti, non per timing preciso
4. Come usare insieme ad altri indicatori`;

      const explanation = await generateGroqExplanation(prompt, {
        symbol,
        exchangeFlow,
        whaleMovements: whaleMovements?.length || 0,
        type: 'onchain',
      });

      result.explanation = explanation || undefined;
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/onchain/data:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dati on-chain' },
      { status: 500 }
    );
  }
}

