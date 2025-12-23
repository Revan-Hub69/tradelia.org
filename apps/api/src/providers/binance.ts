import axios, { AxiosInstance } from 'axios';
import crypto from 'node:crypto';
import { MarketDataProvider, TradingProvider, Kline, Depth, FundingRate } from '@tradelia/shared';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function sanitizeParams(params: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    // Binance expects strings in query for signing
    out[k] = typeof v === 'string' ? v : String(v);
  }
  return out;
}

function extractBinanceErrorMessage(err: any): string {
  const data = err?.response?.data;
  if (data?.msg) return `${data.code ?? 'BINANCE_ERROR'}: ${data.msg}`;
  return err?.message ?? 'Unknown error';
}

export class BinanceProvider implements MarketDataProvider, TradingProvider {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';

    // Futures USD-M base URL
    // live: https://fapi.binance.com
    // testnet: https://testnet.binancefuture.com
    this.baseURL =
      process.env.BINANCE_ENV === 'live'
        ? 'https://fapi.binance.com'
        : 'https://testnet.binancefuture.com';

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15_000
    });
  }

  private ensureSignedCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('BINANCE_API_KEY and BINANCE_API_SECRET are required for signed requests.');
    }
  }

  private sign(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  private async makeSignedRequest(
    method: HttpMethod,
    endpoint: string,
    params: Record<string, unknown> = {}
  ) {
    this.ensureSignedCredentials();

    const timestamp = Date.now();
    const recvWindow = (params.recvWindow ?? 5000) as number;

    // Remove undefined/null BEFORE signing (critical)
    const cleaned = sanitizeParams({
      ...params,
      timestamp,
      recvWindow
    });

    const queryString = new URLSearchParams(cleaned).toString();
    const signature = this.sign(queryString);
    const finalQuery = `${queryString}&signature=${signature}`;

    try {
      return await this.client.request({
        method,
        url: `${endpoint}?${finalQuery}`,
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
    } catch (err) {
      throw new Error(extractBinanceErrorMessage(err));
    }
  }

  // -------- Market Data --------

  async getKlines(symbol: string, interval: string, limit: number): Promise<Kline[]> {
    const response = await this.client.get('/fapi/v1/klines', {
      params: { symbol, interval, limit }
    });

    return response.data.map((k: any[]) => ({
      openTime: k[0],
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5],
      closeTime: k[6]
    }));
  }

  async getDepth(symbol: string, limit: number = 20): Promise<Depth> {
    const response = await this.client.get('/fapi/v1/depth', {
      params: { symbol, limit }
    });

    return {
      bids: response.data.bids,
      asks: response.data.asks,
      lastUpdateId: response.data.lastUpdateId
    };
  }

  async getFunding(symbol: string): Promise<FundingRate> {
    const response = await this.client.get('/fapi/v1/fundingRate', {
      params: { symbol, limit: 1 }
    });

    const data = response.data[0];
    return {
      symbol: data.symbol,
      fundingRate: data.fundingRate,
      fundingTime: data.fundingTime
    };
  }

  async getRealtimeDelta(symbol: string, windowSec: number): Promise<number> {
    // REST fallback: aggTrades in time window
    const response = await this.client.get('/fapi/v1/aggTrades', {
      params: {
        symbol,
        limit: 1000,
        startTime: Date.now() - windowSec * 1000
      }
    });

    let buyVolume = 0;
    let sellVolume = 0;

    for (const trade of response.data) {
      const qty = Number(trade.q);
      if (Number.isNaN(qty)) continue;

      // m = true means buyer is the maker -> taker was SELL
      if (trade.m) sellVolume += qty;
      else buyVolume += qty;
    }

    return buyVolume - sellVolume;
  }

  async getBestBidAsk(symbol: string): Promise<{ bid: number; ask: number }> {
    const response = await this.client.get('/fapi/v1/bookTicker', {
      params: { symbol }
    });

    return {
      bid: Number(response.data.bidPrice),
      ask: Number(response.data.askPrice)
    };
  }

  async getExchangeInfo(): Promise<any> {
    const response = await this.client.get('/fapi/v1/exchangeInfo');
    return response.data;
  }

  async getBookTickers(): Promise<any[]> {
    const response = await this.client.get('/fapi/v1/bookTicker');
    return response.data;
  }

  async get24hTickers(): Promise<any[]> {
    const response = await this.client.get('/fapi/v1/ticker/24hr');
    return response.data;
  }

  async getPremiumIndex(): Promise<any[]> {
    const response = await this.client.get('/fapi/v1/premiumIndex');
    return response.data;
  }

  // -------- Trading --------

  async setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSS'): Promise<void> {
    try {
      await this.makeSignedRequest('POST', '/fapi/v1/marginType', {
        symbol,
        marginType
      });
    } catch (err: any) {
      // Binance returns an error if margin type is already set; treat as ok
      const msg = String(err?.message ?? '');
      if (msg.includes('No need to change margin type')) return;
      throw err;
    }
  }

  async setLeverage(symbol: string, leverage: number): Promise<void> {
    try {
      await this.makeSignedRequest('POST', '/fapi/v1/leverage', {
        symbol,
        leverage
      });
    } catch (err: any) {
      // Some cases: leverage unchanged can error; treat as ok
      const msg = String(err?.message ?? '');
      if (msg.includes('No need to change leverage')) return;
      throw err;
    }
  }

  async createOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_MARKET';
    quantity: string;
    price?: string;
    stopPrice?: string;
    clientOrderId?: string; // internal name
    reduceOnly?: boolean;
  }): Promise<any> {
    // Map internal clientOrderId -> Binance newClientOrderId (important for idempotency)
    const { clientOrderId, ...rest } = params;

    const response = await this.makeSignedRequest('POST', '/fapi/v1/order', {
      ...rest,
      ...(clientOrderId ? { newClientOrderId: clientOrderId } : {})
    });

    return response.data;
  }

  async modifyOrder(params: {
    symbol: string;
    orderId?: string;
    origClientOrderId?: string;
    side?: 'BUY' | 'SELL';
    price?: string;
    quantity?: string;
    stopPrice?: string;
  }): Promise<any> {
    const response = await this.makeSignedRequest('PUT', '/fapi/v1/order', params);
    return response.data;
  }

  async getOrder(symbol: string, orderId?: string, origClientOrderId?: string): Promise<any> {
    const response = await this.makeSignedRequest('GET', '/fapi/v1/order', {
      symbol,
      orderId,
      origClientOrderId
    });
    return response.data;
  }

  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    await this.makeSignedRequest('DELETE', '/fapi/v1/order', {
      symbol,
      orderId
    });
  }

  async getPositions(): Promise<any[]> {
    const response = await this.makeSignedRequest('GET', '/fapi/v2/positionRisk');
    return response.data;
  }

  async getBalance(): Promise<any> {
    const response = await this.makeSignedRequest('GET', '/fapi/v2/balance');
    return response.data;
  }
}
