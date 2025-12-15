/**
 * API: Liquidations Analysis (Intraday/Scalping)
 * 
 * Analisi liquidazioni e rischio per trading con leva
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBinanceFuturesData } from '@/lib/price-apis/binance-futures';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol')?.toUpperCase();

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol richiesto' },
        { status: 400 }
      );
    }

    const futuresData = await getBinanceFuturesData(symbol);

    if (!futuresData) {
      return NextResponse.json(
        { error: 'Dati futures non disponibili' },
        { status: 404 }
      );
    }

    // Calcola liquidation clusters
    // Assumiamo leverage distribuito: 5x, 10x, 20x, 50x, 100x
    const leverageLevels = [5, 10, 20, 50, 100];
    const currentPrice = futuresData.markPrice;
    
    const liquidationClusters = leverageLevels.map(leverage => {
      // Prezzo di liquidazione long = prezzo * (1 - 1/leverage)
      const longLiquidationPrice = currentPrice * (1 - 1 / leverage);
      // Prezzo di liquidazione short = prezzo * (1 + 1/leverage)
      const shortLiquidationPrice = currentPrice * (1 + 1 / leverage);
      
      const distanceLong = ((currentPrice - longLiquidationPrice) / currentPrice) * 100;
      const distanceShort = ((shortLiquidationPrice - currentPrice) / currentPrice) * 100;

      return {
        leverage,
        longLiquidationPrice,
        shortLiquidationPrice,
        distanceLong,
        distanceShort,
        risk: distanceLong < 2 || distanceShort < 2 ? 'very-high' :
              distanceLong < 5 || distanceShort < 5 ? 'high' :
              distanceLong < 10 || distanceShort < 10 ? 'medium' : 'low',
      };
    });

    // Stima liquidazioni potenziali basate su funding rate e open interest
    // Funding rate alto = molti long = rischio liquidazione long se prezzo scende
    const estimatedLiquidations = {
      longRisk: futuresData.fundingRate > 0.05 ? 'high' :
                futuresData.fundingRate > 0.02 ? 'medium' : 'low',
      shortRisk: futuresData.fundingRate < -0.05 ? 'high' :
                 futuresData.fundingRate < -0.02 ? 'medium' : 'low',
      totalLiquidationValue: futuresData.openInterestValue * 0.1, // Stima 10% OI a rischio
    };

    return NextResponse.json({
      symbol,
      timestamp: new Date().toISOString(),
      currentPrice,
      liquidationClusters,
      estimatedLiquidations,
      liquidationRisk: futuresData.liquidationRisk,
      estimatedLiquidationPriceLong: futuresData.estimatedLiquidationPriceLong,
      estimatedLiquidationPriceShort: futuresData.estimatedLiquidationPriceShort,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Error in /api/crypto/intraday/liquidations:', error);
    return NextResponse.json(
      { error: 'Errore nell\'analisi liquidazioni' },
      { status: 500 }
    );
  }
}

