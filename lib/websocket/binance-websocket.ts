/**
 * Binance WebSocket Client
 * 
 * Connessione real-time a Binance WebSocket per:
 * - Trades stream (Time & Sales)
 * - Order book depth updates
 * - Kline/candlestick streams
 * - Ticker updates
 * 
 * Tutto GRATUITO - nessun limite per dati pubblici
 * 
 * Docs: https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams
 */

export interface BinanceTrade {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is buyer maker?
  M: boolean; // Ignore
}

export interface BinanceOrderBookUpdate {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  U: number; // First update ID
  u: number; // Final update ID
  b: Array<[string, string]>; // Bids [price, quantity]
  a: Array<[string, string]>; // Asks [price, quantity]
}

export interface BinanceKline {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base volume
    Q: string; // Taker buy quote volume
    B: string; // Ignore
  };
}

type WebSocketCallback<T> = (data: T) => void;

class BinanceWebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private callbacks: Map<string, Set<WebSocketCallback<any>>> = new Map();

  /**
   * Subscribe to trade stream
   * @param symbol - Crypto symbol (e.g., 'BTCUSDT')
   * @param callback - Callback for trade updates
   */
  subscribeTrades(symbol: string, callback: WebSocketCallback<BinanceTrade>): () => void {
    const streamName = `${symbol.toLowerCase()}@trade`;
    const ws = this.getOrCreateConnection(streamName);

    this.addCallback(streamName, callback);

    return () => this.removeCallback(streamName, callback);
  }

  /**
   * Subscribe to order book depth stream
   * @param symbol - Crypto symbol
   * @param levels - Depth levels (5, 10, 20)
   * @param callback - Callback for order book updates
   */
  subscribeOrderBook(
    symbol: string,
    levels: 5 | 10 | 20 = 20,
    callback: WebSocketCallback<BinanceOrderBookUpdate>
  ): () => void {
    const streamName = `${symbol.toLowerCase()}@depth${levels}@100ms`;
    const ws = this.getOrCreateConnection(streamName);

    this.addCallback(streamName, callback);

    return () => this.removeCallback(streamName, callback);
  }

  /**
   * Subscribe to kline/candlestick stream
   * @param symbol - Crypto symbol
   * @param interval - Kline interval (1m, 5m, 15m, 1h, etc.)
   * @param callback - Callback for kline updates
   */
  subscribeKlines(
    symbol: string,
    interval: string = '1m',
    callback: WebSocketCallback<BinanceKline>
  ): () => void {
    const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
    const ws = this.getOrCreateConnection(streamName);

    this.addCallback(streamName, callback);

    return () => this.removeCallback(streamName, callback);
  }

  /**
   * Subscribe to ticker stream (24h statistics)
   * @param symbol - Crypto symbol
   * @param callback - Callback for ticker updates
   */
  subscribeTicker(symbol: string, callback: WebSocketCallback<any>): () => void {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    const ws = this.getOrCreateConnection(streamName);

    this.addCallback(streamName, callback);

    return () => this.removeCallback(streamName, callback);
  }

  /**
   * Subscribe to multiple streams (combined)
   * @param streams - Array of stream names
   * @param callback - Callback for updates
   */
  subscribeCombined(streams: string[], callback: WebSocketCallback<any>): () => void {
    // Binance combined stream format: stream1/stream2/stream3
    const combinedStream = streams.join('/');
    const ws = this.getOrCreateConnection(combinedStream);

    this.addCallback(combinedStream, callback);

    return () => this.removeCallback(combinedStream, callback);
  }

  private getOrCreateConnection(streamName: string): WebSocket {
    if (this.connections.has(streamName)) {
      return this.connections.get(streamName)!;
    }

    // Single stream: wss://stream.binance.com:9443/ws/{stream}
    // Combined: wss://stream.binance.com:9443/stream?streams={stream1}/{stream2}
    const isCombined = streamName.includes('/');
    const url = isCombined
      ? `wss://stream.binance.com:9443/stream?streams=${streamName}`
      : `wss://stream.binance.com:9443/ws/${streamName}`;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`[Binance WS] Connected: ${streamName}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Combined stream format: { stream: 'btcusdt@trade', data: {...} }
        if (isCombined && data.stream) {
          const callbacks = this.callbacks.get(data.stream);
          if (callbacks) {
            callbacks.forEach((cb) => cb(data.data));
          }
        } else {
          const callbacks = this.callbacks.get(streamName);
          if (callbacks) {
            callbacks.forEach((cb) => cb(data));
          }
        }
      } catch (error) {
        console.error(`[Binance WS] Error parsing message:`, error);
      }
    };

    ws.onerror = (error) => {
      console.error(`[Binance WS] Error: ${streamName}`, error);
    };

    ws.onclose = () => {
      console.log(`[Binance WS] Closed: ${streamName}`);
      this.connections.delete(streamName);
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (this.callbacks.has(streamName) && this.callbacks.get(streamName)!.size > 0) {
          this.getOrCreateConnection(streamName);
        }
      }, 3000);
    };

    this.connections.set(streamName, ws);
    return ws;
  }

  private addCallback(streamName: string, callback: WebSocketCallback<any>): void {
    if (!this.callbacks.has(streamName)) {
      this.callbacks.set(streamName, new Set());
    }
    this.callbacks.get(streamName)!.add(callback);
  }

  private removeCallback(streamName: string, callback: WebSocketCallback<any>): void {
    const callbacks = this.callbacks.get(streamName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        // Close connection if no more callbacks
        const ws = this.connections.get(streamName);
        if (ws) {
          ws.close();
          this.connections.delete(streamName);
        }
        this.callbacks.delete(streamName);
      }
    }
  }

  /**
   * Close all connections
   */
  closeAll(): void {
    this.connections.forEach((ws) => ws.close());
    this.connections.clear();
    this.callbacks.clear();
  }
}

// Singleton instance
let wsManager: BinanceWebSocketManager | null = null;

export function getBinanceWebSocketManager(): BinanceWebSocketManager {
  if (!wsManager) {
    wsManager = new BinanceWebSocketManager();
  }
  return wsManager;
}

/**
 * React hook for Binance WebSocket trades
 */
export function useBinanceTrades(symbol: string) {
  const [trades, setTrades] = useState<BinanceTrade[]>([]);
  const [latestTrade, setLatestTrade] = useState<BinanceTrade | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const manager = getBinanceWebSocketManager();
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

    const unsubscribe = manager.subscribeTrades(binanceSymbol, (trade) => {
      setLatestTrade(trade);
      setTrades((prev) => {
        const newTrades = [trade, ...prev].slice(0, 100); // Keep last 100
        return newTrades;
      });
    });

    return unsubscribe;
  }, [symbol]);

  return { trades, latestTrade };
}

/**
 * React hook for Binance WebSocket order book
 */
export function useBinanceOrderBook(symbol: string, levels: 5 | 10 | 20 = 20) {
  const [orderBook, setOrderBook] = useState<BinanceOrderBookUpdate | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const manager = getBinanceWebSocketManager();
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

    const unsubscribe = manager.subscribeOrderBook(binanceSymbol, levels, (update) => {
      setOrderBook(update);
    });

    return unsubscribe;
  }, [symbol, levels]);

  return { orderBook };
}

/**
 * React hook for Binance WebSocket klines
 */
export function useBinanceKlines(symbol: string, interval: string = '1m') {
  const [kline, setKline] = useState<BinanceKline | null>(null);
  const [klines, setKlines] = useState<BinanceKline['k'][]>([]);

  useEffect(() => {
    if (!symbol) return;

    const manager = getBinanceWebSocketManager();
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

    const unsubscribe = manager.subscribeKlines(binanceSymbol, interval, (kline) => {
      setKline(kline);
      if (kline.k.x) {
        // Kline closed, add to history
        setKlines((prev) => {
          const newKlines = [...prev, kline.k].slice(-100); // Keep last 100
          return newKlines;
        });
      }
    });

    return unsubscribe;
  }, [symbol, interval]);

  return { kline, klines };
}

// Import React hooks (for client-side only)
import { useState, useEffect } from 'react';

