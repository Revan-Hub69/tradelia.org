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
import { aggregateFuturesData } from "@/lib/crypto/multi-exchange-futures";
import { rateLimit } from "@/lib/security/rate-limiting";
import { CryptoSymbolSchema } from "@/lib/validation/crypto-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await rateLimit(`futures-intraday:${ip}`, {
      maxRequests: 30, // 30 richieste
      windowMs: 60000, // per minuto
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Troppe richieste",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter || 60),
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol")?.toUpperCase();

    // Input validation
    const validation = CryptoSymbolSchema.safeParse({ symbol });
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Symbol non valido",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedSymbol = validation.data.symbol;

    // Fetch aggregated futures data from all exchanges (Binance, OKX, Bybit)
    const aggregatedData = await aggregateFuturesData(validatedSymbol);
    
    // Fallback to Binance only if aggregation fails
    const binanceData = aggregatedData ? null : await getBinanceFuturesData(validatedSymbol);
    
    // Use aggregated data or fallback to Binance
    const futuresData = aggregatedData ? {
      fundingRate: aggregatedData.aggregatedFundingRate,
      fundingRatePercent: aggregatedData.aggregatedFundingRatePercent,
      openInterest: aggregatedData.totalOpenInterest,
      openInterestValue: aggregatedData.totalOpenInterestUsd,
      longShortRatio: aggregatedData.weightedLongShortRatio,
      longAccount: aggregatedData.weightedLongShortRatio > 1 
        ? (aggregatedData.weightedLongShortRatio / (1 + aggregatedData.weightedLongShortRatio)) * 100
        : 50,
      shortAccount: aggregatedData.weightedLongShortRatio > 1
        ? (1 / (1 + aggregatedData.weightedLongShortRatio)) * 100
        : 50,
      markPrice: 0, // Would need to fetch separately
      indexPrice: 0,
      nextFundingTime: Date.now() + 8 * 60 * 60 * 1000,
      liquidationRisk: Math.abs(aggregatedData.aggregatedFundingRate) > 0.1 ? 'very-high' as const :
                       Math.abs(aggregatedData.aggregatedFundingRate) > 0.05 ? 'high' as const :
                       Math.abs(aggregatedData.aggregatedFundingRate) > 0.02 ? 'medium' as const : 'low' as const,
      estimatedLiquidationPriceLong: 0,
      estimatedLiquidationPriceShort: 0,
      partial: false,
      exchanges: aggregatedData.exchanges,
    } : binanceData;

    if (!futuresData) {
      // Symbol non disponibile su Binance Futures - restituisci errore chiaro
      return NextResponse.json(
        {
          error: "Symbol non disponibile su Binance Futures",
          symbol: validatedSymbol,
          message: `Il symbol ${validatedSymbol} non è disponibile per il trading futures su Binance. Prova con un symbol supportato (es. BTC, ETH, SOL).`,
          available: false,
          timestamp: new Date().toISOString(),
        },
        {
          status: 404, // Not Found
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // Se dati parziali, restituisci 206 Partial Content
    if (futuresData.partial) {
      return NextResponse.json(
        {
          symbol: validatedSymbol,
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
        symbol: validatedSymbol,
        timestamp: new Date().toISOString(),
        ...futuresData,
        leverageMetrics,
        fundingRateImpact,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
          "X-RateLimit-Limit": "30",
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/crypto/futures/intraday:", error);
    return NextResponse.json({ error: "Errore nel recupero dati futures" }, { status: 500 });
  }
}
