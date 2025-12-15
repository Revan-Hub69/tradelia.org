/**
 * API: Futures Data Intraday/Scalping
 *
 * Dati real-time per trading con leva:
 * - Funding rates
 * - Open Interest
 * - Long/Short Ratio
 * - Liquidations risk
 * - Leverage metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { getBinanceFuturesData } from "@/lib/price-apis/binance-futures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol")?.toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol richiesto" }, { status: 400 });
    }

    const futuresData = await getBinanceFuturesData(symbol);

    if (!futuresData) {
      // Restituisci 503 solo se completamente non disponibile
      return NextResponse.json(
        {
          error: "Dati futures non disponibili",
          symbol,
          timestamp: new Date().toISOString(),
          retryAfter: 10, // secondi
        },
        {
          status: 503,
          headers: {
            "Retry-After": "10",
          },
        }
      );
    }

    // Se dati parziali, restituisci 206 Partial Content
    if (futuresData.partial) {
      return NextResponse.json(
        {
          symbol,
          timestamp: new Date().toISOString(),
          ...futuresData,
          warning: "Alcuni dati potrebbero essere incompleti",
        },
        {
          status: 206, // Partial Content
          headers: {
            "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
          },
        }
      );
    }

    // Calcola leverage metrics
    const leverageMetrics = {
      estimatedAvgLeverage: 10, // Stima, in produzione calcolare da dati reali
      maxLeverage: 125, // Binance max leverage per BTC
      recommendedLeverage:
        futuresData.liquidationRisk === "very-high"
          ? 5
          : futuresData.liquidationRisk === "high"
            ? 10
            : 20,
    };

    // Calcola funding rate impact
    const fundingRateImpact = {
      hourlyCost: (futuresData.fundingRate / 100) * futuresData.openInterestValue,
      dailyCost: (futuresData.fundingRate / 100) * futuresData.openInterestValue * 8, // 8 funding al giorno
      interpretation:
        futuresData.fundingRate > 0.1
          ? "very-bullish"
          : futuresData.fundingRate > 0.05
            ? "bullish"
            : futuresData.fundingRate > -0.05
              ? "neutral"
              : futuresData.fundingRate > -0.1
                ? "bearish"
                : "very-bearish",
    };

    return NextResponse.json(
      {
        symbol,
        timestamp: new Date().toISOString(),
        ...futuresData,
        leverageMetrics,
        fundingRateImpact,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/crypto/futures/intraday:", error);
    return NextResponse.json({ error: "Errore nel recupero dati futures" }, { status: 500 });
  }
}
