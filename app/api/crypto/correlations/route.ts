/**
 * API: Crypto Correlations
 * 
 * Calcola correlazioni tra crypto basate su movimenti di prezzo
 */

import { NextRequest, NextResponse } from 'next/server';

interface Correlation {
  symbol1: string;
  symbol2: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
}

export async function GET(request: NextRequest) {
  try {
    const baseUrl = request.nextUrl.origin;
    const overviewRes = await fetch(`${baseUrl}/api/crypto/market-overview?limit=20`);
    
    if (!overviewRes.ok) {
      return NextResponse.json(
        { error: 'Errore nel recupero market overview' },
        { status: 503 }
      );
    }

    const overview = await overviewRes.json();
    const cryptos = overview.cryptos || [];

    if (cryptos.length < 2) {
      return NextResponse.json(
        { error: 'Dati insufficienti per calcolare correlazioni' },
        { status: 503 }
      );
    }

    // Calcola correlazioni basate su change24hPercent
    const correlations: Correlation[] = [];

    for (let i = 0; i < cryptos.length; i++) {
      for (let j = i + 1; j < cryptos.length; j++) {
        const c1 = cryptos[i];
        const c2 = cryptos[j];

        // Correlazione semplice basata su direzione e magnitudine del cambio
        // In produzione, usare Pearson correlation su dati storici
        const change1 = c1.change24hPercent;
        const change2 = c2.change24hPercent;

        // Normalizza per calcolare correlazione approssimata
        const maxChange = Math.max(Math.abs(change1), Math.abs(change2), 1);
        const normalized1 = change1 / maxChange;
        const normalized2 = change2 / maxChange;

        // Correlazione: prodotto normalizzato (semplificato)
        // In produzione, usare Pearson su serie temporali
        let correlation = normalized1 * normalized2;

        // Se entrambi positivi o entrambi negativi = correlazione positiva
        if ((change1 > 0 && change2 > 0) || (change1 < 0 && change2 < 0)) {
          correlation = Math.abs(correlation);
        } else {
          correlation = -Math.abs(correlation);
        }

        // Clamp a -1, 1
        correlation = Math.max(-1, Math.min(1, correlation));

        let strength: 'weak' | 'moderate' | 'strong';
        const absCorr = Math.abs(correlation);
        if (absCorr >= 0.7) {
          strength = 'strong';
        } else if (absCorr >= 0.4) {
          strength = 'moderate';
        } else {
          strength = 'weak';
        }

        correlations.push({
          symbol1: c1.symbol,
          symbol2: c2.symbol,
          correlation,
          strength,
        });
      }
    }

    // Ordina per correlazione assoluta (più forti prima)
    correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      correlations: correlations.slice(0, 50), // Top 50 correlazioni
      total: correlations.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/correlations:', error);
    return NextResponse.json(
      { error: 'Errore nel calcolo correlazioni' },
      { status: 500 }
    );
  }
}

