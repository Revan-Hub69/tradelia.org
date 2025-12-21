import { Kline, Depth, FundingRate } from './types';

export interface MarketDataProvider {
  getKlines(symbol: string, interval: string, limit: number): Promise<Kline[]>;
  getDepth(symbol: string, limit: number): Promise<Depth>;
  getFunding(symbol: string): Promise<FundingRate>;
  getRealtimeDelta(symbol: string, windowSec: number): Promise<number>;
  getBestBidAsk(symbol: string): Promise<{ bid: number; ask: number }>;
}

export interface WebSocketProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(streams: string[]): Promise<void>;
  unsubscribe(streams: string[]): Promise<void>;
  on(event: string, callback: (data: any) => void): void;
  isConnected(): boolean;
}

export interface TradingProvider {
  setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSS'): Promise<void>;
  setLeverage(symbol: string, leverage: number): Promise<void>;
  createOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_MARKET';
    quantity: string;
    price?: string;
    stopPrice?: string;
    clientOrderId?: string;
    reduceOnly?: boolean;
  }): Promise<any>;
  getOrder(symbol: string, orderId: string): Promise<any>;
  cancelOrder(symbol: string, orderId: string): Promise<void>;
  getPositions(): Promise<any[]>;
  getBalance(): Promise<any>;
}