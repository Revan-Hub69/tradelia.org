import { NextResponse } from 'next/server';
import { AssetType } from '@/lib/types/market';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

interface MarketData {
  symbol: string;
  assetType: AssetType;
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  volume24h?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
  timestamp: number;
}

async function fetchCryptoData(symbol: string): Promise<MarketData | null> {
  try {
    // Map crypto symbols to CoinGecko IDs
    const coinMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'ADA': 'cardano',
      'XRP': 'ripple',
      'DOT': 'polkadot',
      'DOGE': 'dogecoin',
    };

    const coinId = coinMap[symbol.toUpperCase()];
    if (!coinId) return null;

    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    const priceData = data[coinId];

    if (!priceData) return null;

    return {
      symbol,
      assetType: 'crypto',
      currentPrice: priceData.usd || 0,
      change24h: priceData.usd_24h_change || 0,
      change24hPercent: priceData.usd_24h_change || 0,
      volume24h: priceData.usd_24h_vol || 0,
      marketCap: priceData.usd_market_cap || 0,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching crypto data for ${symbol}:`, error);
    return null;
  }
}

async function fetchStockData(symbol: string): Promise<MarketData | null> {
  try {
    if (!FINNHUB_API_KEY) return null;

    // Get quote
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const quoteResponse = await fetch(quoteUrl);

    if (!quoteResponse.ok) return null;

    const quote = await quoteResponse.json();

    if (!quote.c || quote.c === 0) return null;

    const currentPrice = quote.c;
    const previousClose = quote.pc || currentPrice;
    const change24h = currentPrice - previousClose;
    const change24hPercent = previousClose > 0 ? (change24h / previousClose) * 100 : 0;

    return {
      symbol,
      assetType: 'stock',
      currentPrice,
      change24h,
      change24hPercent,
      high24h: quote.h,
      low24h: quote.l,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

async function fetchForexData(symbol: string): Promise<MarketData | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) return null;

    // Alpha Vantage uses different symbol format (e.g., EURUSD -> EUR/USD)
    const base = symbol.substring(0, 3);
    const quote = symbol.substring(3, 6);
    const avSymbol = `${base}/${quote}`;

    const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${base}&to_symbol=${quote}&interval=60min&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();

    if (data['Error Message'] || data['Note']) return null;

    const timeSeries = data['Time Series FX (60min)'];
    if (!timeSeries) return null;

    const latestKey = Object.keys(timeSeries)[0];
    const latest = timeSeries[latestKey];

    const currentPrice = parseFloat(latest['4. close']);
    const openPrice = parseFloat(latest['1. open']);
    const change24h = currentPrice - openPrice;
    const change24hPercent = openPrice > 0 ? (change24h / openPrice) * 100 : 0;

    return {
      symbol,
      assetType: 'forex',
      currentPrice,
      change24h,
      change24hPercent,
      high24h: parseFloat(latest['2. high']),
      low24h: parseFloat(latest['3. low']),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching forex data for ${symbol}:`, error);
    return null;
  }
}

async function fetchCommodityData(symbol: string): Promise<MarketData | null> {
  try {
    if (!ALPHA_VANTAGE_API_KEY) return null;

    // Map commodity symbols to Alpha Vantage symbols
    const commodityMap: Record<string, string> = {
      'GOLD': 'XAU',
      'SILVER': 'XAG',
      'OIL': 'WTI',
      'NATURAL_GAS': 'NG',
      'COPPER': 'HG',
    };

    const avSymbol = commodityMap[symbol.toUpperCase()];
    if (!avSymbol) return null;

    // Use Alpha Vantage commodity API
    const url = `https://www.alphavantage.co/query?function=${avSymbol}&interval=daily&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();

    if (data['Error Message'] || data['Note']) return null;

    // Extract latest price
    const timeSeries = data[`Time Series (Daily)`] || data[`data`];
    if (!timeSeries) return null;

    const latestKey = Object.keys(timeSeries)[0];
    const latest = timeSeries[latestKey];

    const currentPrice = parseFloat(latest['4. close'] || latest['close'] || latest['value']);
    const previousClose = parseFloat(latest['1. open'] || latest['open'] || currentPrice);
    const change24h = currentPrice - previousClose;
    const change24hPercent = previousClose > 0 ? (change24h / previousClose) * 100 : 0;

    return {
      symbol,
      assetType: 'commodity',
      currentPrice,
      change24h,
      change24hPercent,
      high24h: parseFloat(latest['2. high'] || latest['high'] || currentPrice),
      low24h: parseFloat(latest['3. low'] || latest['low'] || currentPrice),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching commodity data for ${symbol}:`, error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const assetType = searchParams.get('assetType') as AssetType | null;
    const symbols = searchParams.get('symbols'); // Comma-separated list

    if (symbols) {
      // Fetch multiple symbols
      const symbolList = symbols.split(',').map(s => s.trim());
      const promises = symbolList.map(async (sym) => {
        // Try to determine asset type from symbol
        let type = assetType;
        if (!type) {
          if (sym.length <= 4 && !sym.includes('USD') && !sym.includes('EUR')) {
            type = 'stock';
          } else if (sym.includes('USD') || sym.includes('EUR') || sym.includes('JPY')) {
            type = 'forex';
          } else if (['GOLD', 'SILVER', 'OIL', 'NATURAL_GAS', 'COPPER'].includes(sym)) {
            type = 'commodity';
          } else {
            type = 'crypto';
          }
        }

        switch (type) {
          case 'crypto':
            return fetchCryptoData(sym);
          case 'stock':
            return fetchStockData(sym);
          case 'forex':
            return fetchForexData(sym);
          case 'commodity':
            return fetchCommodityData(sym);
          default:
            return fetchCryptoData(sym); // Default to crypto
        }
      });

      const results = await Promise.all(promises);
      const data = results.filter((r): r is MarketData => r !== null);

      return NextResponse.json({
        success: true,
        data,
        total: data.length,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 1 min cache
        },
      });
    }

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol or symbols parameter required' },
        { status: 400 }
      );
    }

    // Fetch single symbol
    const type = assetType || 'crypto'; // Default to crypto

    let data: MarketData | null = null;

    switch (type) {
      case 'crypto':
        data = await fetchCryptoData(symbol);
        break;
      case 'stock':
        data = await fetchStockData(symbol);
        break;
      case 'forex':
        data = await fetchForexData(symbol);
        break;
      case 'commodity':
        data = await fetchCommodityData(symbol);
        break;
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch market data' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // 1 min cache
      },
    });
  } catch (error) {
    console.error('Error in market data route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
