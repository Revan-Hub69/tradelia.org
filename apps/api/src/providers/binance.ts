import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { MarketDataProvider, TradingProvider, Kline, Depth, FundingRate } from '@tradelia/shared';

export class BinanceProvider implements MarketDataProvider, TradingProvider {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';
    
    // Use testnet or live based on env
    this.baseURL = process.env.BINANCE_ENV === 'live' 
      ? 'https://fapi.binance.com'
      : 'https://testnet.binancefuture.com';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000
    });
  }

  private ensureSignedCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('BINANCE_API_KEY and BINANCE_API_SECRET are required for signed requests.');
    }
  }

  private sign(queryString: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  private async makeSignedRequest(method: string, endpoint: string, params: any = {}) {
    this.ensureSignedCredentials();
    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
      recvWindow: params.recvWindow?.toString() ?? '5000'
    }).toString();
    
    const signature = this.sign(queryString);
    const finalQuery = `${queryString}&signature=${signature}`;
    
    return this.client.request({
      method,
      url: `${endpoint}?${finalQuery}`,
      headers: {
        'X-MBX-APIKEY': this.apiKey
      }
    });
  }

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
    // For REST fallback, we'll use recent trades
    const response = await this.client.get('/fapi/v1/aggTrades', {
      params: { 
        symbol, 
        limit: 100,
        startTime: Date.now() - (windowSec * 1000)
      }
    });
    
    let buyVolume = 0;
    let sellVolume = 0;
    
    response.data.forEach((trade: any) => {
      const qty = parseFloat(trade.q);
      if (trade.m) { // maker order (sell)
        sellVolume += qty;
      } else { // taker order (buy)
        buyVolume += qty;
      }
    });
    
    return buyVolume - sellVolume;
  }

  async getBestBidAsk(symbol: string): Promise<{ bid: number; ask: number }> {
    const response = await this.client.get('/fapi/v1/bookTicker', {
      params: { symbol }
    });
    
    return {
      bid: parseFloat(response.data.bidPrice),
      ask: parseFloat(response.data.askPrice)
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

  // Trading methods
  async setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSS'): Promise<void> {
    await this.makeSignedRequest('POST', '/fapi/v1/marginType', {
      symbol,
      marginType
    });
  }

  async setLeverage(symbol: string, leverage: number): Promise<void> {
    await this.makeSignedRequest('POST', '/fapi/v1/leverage', {
      symbol,
      leverage
    });
  }

  async createOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_MARKET';
    quantity: string;
    price?: string;
    stopPrice?: string;
    clientOrderId?: string;
    reduceOnly?: boolean;
  }): Promise<any> {
    const response = await this.makeSignedRequest('POST', '/fapi/v1/order', params);
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
