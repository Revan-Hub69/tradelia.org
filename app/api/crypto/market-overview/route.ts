/**
 * API: Crypto Market Overview
 *
 * Dashboard completa con top crypto, indicatori, supporti/resistenze, pressione
 */

import { NextRequest, NextResponse } from "next/server";
import { getBinanceOrderBook, OrderBookEntry } from "@/lib/price-apis/binance";
import { getOKXOrderBook } from "@/lib/price-apis/okx";
import { getBybitOrderBook } from "@/lib/price-apis/bybit";
import { calculateSupportResistance } from "@/lib/analysis/support-resistance";
import { calculateMarketPressure } from "@/lib/analysis/market-pressure";
import { rateLimit } from "@/lib/security/rate-limiting";

// Top 20 crypto per market cap
const TOP_CRYPTO = [
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "XRP",
  "ADA",
  "DOGE",
  "TRX",
  "AVAX",
  "SHIB",
  "DOT",
  "MATIC",
  "LINK",
  "UNI",
  "ATOM",
  "ETC",
  "LTC",
  "NEAR",
  "XLM",
  "ALGO",
];

interface CryptoOverview {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  marketCap?: number;
  orderBook: {
    totalBidVolume: number;
    totalAskVolume: number;
    spread: number;
    spreadPercent: number;
    imbalance: number;
  };
  supportResistance: Array<{
    price: number;
    strength: string;
    type: "support" | "resistance";
    distancePercent: number;
  }>;
  pressure: {
    overall: number;
    strength: string;
    interpretation: string;
  };
  liquidity: {
    score: number; // 0-100, più alto = più liquido
    assessment: "low" | "medium" | "high" | "very-high";
  };
}

/**
 * Aggrega order book da più exchange
 */
async function getAggregatedOrderBook(symbol: string) {
  const [binanceBook, okxBook, bybitBook] = await Promise.all([
    getBinanceOrderBook(symbol, 100),
    getOKXOrderBook(symbol, 100),
    getBybitOrderBook(symbol, 100),
  ]);

  const bidMap = new Map<number, number>();
  const askMap = new Map<number, number>();

  if (binanceBook) {
    for (const bid of binanceBook.bids) {
      bidMap.set(bid.price, (bidMap.get(bid.price) || 0) + bid.quantity);
    }
    for (const ask of binanceBook.asks) {
      askMap.set(ask.price, (askMap.get(ask.price) || 0) + ask.quantity);
    }
  }

  if (okxBook) {
    for (const bid of okxBook.bids) {
      bidMap.set(bid.price, (bidMap.get(bid.price) || 0) + bid.quantity);
    }
    for (const ask of okxBook.asks) {
      askMap.set(ask.price, (askMap.get(ask.price) || 0) + ask.quantity);
    }
  }

  if (bybitBook) {
    for (const bid of bybitBook.bids) {
      bidMap.set(bid.price, (bidMap.get(bid.price) || 0) + bid.quantity);
    }
    for (const ask of bybitBook.asks) {
      askMap.set(ask.price, (askMap.get(ask.price) || 0) + ask.quantity);
    }
  }

  const bids: OrderBookEntry[] = Array.from(bidMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => b.price - a.price);

  const asks: OrderBookEntry[] = Array.from(askMap.entries())
    .map(([price, quantity]) => ({ price, quantity }))
    .sort((a, b) => a.price - b.price);

  return { bids, asks };
}

/**
 * Ottiene prezzo e dati 24h (semplificato, in produzione usare API dedicata)
 */
async function getCryptoPriceData(symbol: string) {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`,
      { cache: 'no-store' }
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      price: parseFloat(data.lastPrice),
      change24h: parseFloat(data.priceChange),
      change24hPercent: parseFloat(data.priceChangePercent),
      volume24h: parseFloat(data.volume),
    };
  } catch {
    return null;
  }
}

/**
 * Calcola liquidity score
 */
function calculateLiquidityScore(
  totalBidVolume: number,
  totalAskVolume: number,
  spreadPercent: number
): { score: number; assessment: "low" | "medium" | "high" | "very-high" } {
  const totalVolume = totalBidVolume + totalAskVolume;

  // Score basato su volume totale e spread
  let score = 0;

  // Volume component (0-60 punti)
  if (totalVolume > 1000) {
    score += 60;
  } else if (totalVolume > 500) {
    score += 40;
  } else if (totalVolume > 200) {
    score += 20;
  } else if (totalVolume > 100) {
    score += 10;
  }

  // Spread component (0-40 punti)
  if (spreadPercent < 0.01) {
    score += 40;
  } else if (spreadPercent < 0.05) {
    score += 30;
  } else if (spreadPercent < 0.1) {
    score += 20;
  } else if (spreadPercent < 0.2) {
    score += 10;
  }

  let assessment: "low" | "medium" | "high" | "very-high";
  if (score >= 80) {
    assessment = "very-high";
  } else if (score >= 60) {
    assessment = "high";
  } else if (score >= 40) {
    assessment = "medium";
  } else {
    assessment = "low";
  }

  return { score, assessment };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await rateLimit(`market-overview:${ip}`, {
      maxRequests: 20, // 20 richieste
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
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 50) : 20; // Clamp 1-50
    const symbols = TOP_CRYPTO.slice(0, limit);

    // Fetch dati per tutte le crypto in parallelo
    const cryptoDataPromises = symbols.map(async (symbol) => {
      try {
        const [priceData, orderBook] = await Promise.all([
          getCryptoPriceData(symbol),
          getAggregatedOrderBook(symbol),
        ]);

        if (
          !priceData ||
          !orderBook ||
          orderBook.bids.length === 0 ||
          orderBook.asks.length === 0
        ) {
          return null;
        }

        const currentPrice = priceData.price;
        const totalBidVolume = orderBook.bids.reduce((sum, b) => sum + b.quantity, 0);
        const totalAskVolume = orderBook.asks.reduce((sum, a) => sum + a.quantity, 0);
        const bestBid = orderBook.bids[0].price;
        const bestAsk = orderBook.asks[0].price;
        const spread = bestAsk - bestBid;
        const spreadPercent = (spread / currentPrice) * 100;
        const imbalance =
          totalBidVolume + totalAskVolume > 0
            ? (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume)
            : 0;

        // Calcola supporti/resistenze
        const supportResistance = calculateSupportResistance(
          orderBook.bids,
          orderBook.asks,
          currentPrice,
          5 // Top 5 livelli
        );

        // Calcola pressione
        const pressure = calculateMarketPressure(orderBook.bids, orderBook.asks, currentPrice);

        // Calcola liquidità
        const liquidity = calculateLiquidityScore(totalBidVolume, totalAskVolume, spreadPercent);

        const overview: CryptoOverview = {
          symbol,
          price: currentPrice,
          change24h: priceData.change24h,
          change24hPercent: priceData.change24hPercent,
          volume24h: priceData.volume24h,
          orderBook: {
            totalBidVolume,
            totalAskVolume,
            spread,
            spreadPercent,
            imbalance,
          },
          supportResistance: supportResistance.map((sr) => ({
            price: sr.price,
            strength: sr.strength,
            type: sr.type,
            distancePercent: sr.distancePercent,
          })),
          pressure: {
            overall: pressure.overall,
            strength: pressure.strength,
            interpretation: pressure.interpretation,
          },
          liquidity,
        };

        return overview;
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
        return null;
      }
    });

    const results = await Promise.all(cryptoDataPromises);
    const validResults = results.filter((r): r is CryptoOverview => r !== null);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        cryptos: validResults,
        total: validResults.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  } catch (error) {
    console.error("Error in /api/crypto/market-overview:", error);
    return NextResponse.json({ error: "Errore nel recupero market overview" }, { status: 500 });
  }
}
