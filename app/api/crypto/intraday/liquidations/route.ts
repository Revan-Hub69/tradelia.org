/**
 * API: Liquidations Analysis (Intraday/Scalping)
 *
 * Analisi liquidazioni e rischio per trading con leva
 */

import { NextRequest, NextResponse } from "next/server";
import { getBinanceFuturesData } from "@/lib/price-apis/binance-futures";
import { rateLimit } from "@/lib/security/rate-limiting";
import { CryptoSymbolSchema } from "@/lib/validation/crypto-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await rateLimit(`liquidations:${ip}`, {
      maxRequests: 30,
      windowMs: 60000,
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

    const futuresData = await getBinanceFuturesData(validatedSymbol);

    if (!futuresData) {
      return NextResponse.json(
        {
          error: "Dati futures non disponibili",
          symbol: validatedSymbol,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Calcola liquidation clusters
    // Assumiamo leverage distribuito: 5x, 10x, 20x, 50x, 100x
    const leverageLevels = [5, 10, 20, 50, 100];
    const currentPrice = futuresData.markPrice;

    const liquidationClusters = leverageLevels.map((leverage) => {
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
        risk:
          distanceLong < 2 || distanceShort < 2
            ? "very-high"
            : distanceLong < 5 || distanceShort < 5
              ? "high"
              : distanceLong < 10 || distanceShort < 10
                ? "medium"
                : "low",
      };
    });

    // Stima liquidazioni potenziali basate su funding rate e open interest
    // Funding rate alto = molti long = rischio liquidazione long se prezzo scende
    const estimatedLiquidations = {
      longRisk:
        futuresData.fundingRate > 0.05 ? "high" : futuresData.fundingRate > 0.02 ? "medium" : "low",
      shortRisk:
        futuresData.fundingRate < -0.05
          ? "high"
          : futuresData.fundingRate < -0.02
            ? "medium"
            : "low",
      totalLiquidationValue: futuresData.openInterestValue * 0.1, // Stima 10% OI a rischio
    };

    return NextResponse.json(
      {
        symbol: validatedSymbol,
        timestamp: new Date().toISOString(),
        currentPrice,
        liquidationClusters,
        estimatedLiquidations,
        liquidationRisk: futuresData.liquidationRisk,
        estimatedLiquidationPriceLong: futuresData.estimatedLiquidationPriceLong,
        estimatedLiquidationPriceShort: futuresData.estimatedLiquidationPriceShort,
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
    console.error("Error in /api/crypto/intraday/liquidations:", error);
    return NextResponse.json({ error: "Errore nell'analisi liquidazioni" }, { status: 500 });
  }
}
