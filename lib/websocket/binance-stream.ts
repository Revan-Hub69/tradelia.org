/**
 * Binance WebSocket Stream
 * 
 * Stream real-time per order book e trades
 * 
 * Docs: https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams
 */

export interface OrderBookUpdate {
  symbol: string;
  bids: Array<[string, string]>; // [price, quantity]
  asks: Array<[string, string]>;
  lastUpdateId: number;
  timestamp: number;
}

export interface TradeUpdate {
  symbol: string;
  price: string;
  quantity: string;
  tradeId: number;
  timestamp: number;
  isBuyerMaker: boolean;
}

type OrderBookCallback = (update: OrderBookUpdate) => void;
type TradeCallback = (update: TradeUpdate) => void;

/**
 * Classe per gestire WebSocket Binance Stream
 */
export class BinanceStream {
  private ws: WebSocket | null = null;
  private orderBookCallbacks: Set<OrderBookCallback> = new Set();
  private tradeCallbacks: Set<TradeCallback> = new Set();
  private streams: string[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isIntentionallyDisconnected = false;

  constructor(private symbol: string) {
    // Binance usa formato lowercase per streams
    const streamSymbol = symbol.toLowerCase();
    this.streams = [
      `${streamSymbol}@depth@100ms`, // Order book updates ogni 100ms
      `${streamSymbol}@trade`, // Trade-by-trade stream
    ];
  }

  /**
   * Aggiungi callback per order book updates
   */
  onOrderBookUpdate(callback: OrderBookCallback) {
    this.orderBookCallbacks.add(callback);
  }

  /**
   * Rimuovi callback per order book updates
   */
  offOrderBookUpdate(callback: OrderBookCallback) {
    this.orderBookCallbacks.delete(callback);
  }

  /**
   * Aggiungi callback per trade updates
   */
  onTradeUpdate(callback: TradeCallback) {
    this.tradeCallbacks.add(callback);
  }

  /**
   * Rimuovi callback per trade updates
   */
  offTradeUpdate(callback: TradeCallback) {
    this.tradeCallbacks.delete(callback);
  }

  /**
   * Connetti al WebSocket stream
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Binance WebSocket URL
        const streamNames = this.streams.join('/');
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streamNames}`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log(`Binance WebSocket connected for ${this.symbol}`);
          this.reconnectAttempts = 0;
          this.isIntentionallyDisconnected = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data);
            this.handleMessage(rawData);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            // Non bloccare per errori di parsing singoli messaggi
          }
        };

        this.ws.onerror = (error) => {
          console.error('Binance WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Binance WebSocket closed');
          this.handleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gestisci messaggi WebSocket
   */
  private handleMessage(rawData: unknown) {
    try {
      // Validazione base struttura
      if (
        !rawData ||
        typeof rawData !== 'object' ||
        !('stream' in rawData) ||
        !('data' in rawData)
      ) {
        return; // Ignora messaggi malformati
      }

      const data = rawData as { stream: string; data: any };
      const stream = data.stream;
      const payload = data.data;

      // Order book depth stream
      if (stream.includes('@depth') && payload) {
        const update: OrderBookUpdate = {
          symbol: payload.s || '',
          bids: Array.isArray(payload.b) ? payload.b : [],
          asks: Array.isArray(payload.a) ? payload.a : [],
          lastUpdateId: typeof payload.u === 'number' ? payload.u : 0,
          timestamp: typeof payload.E === 'number' ? payload.E : Date.now(),
        };

        // Esegui callback in modo safe
        this.orderBookCallbacks.forEach((callback) => {
          try {
            callback(update);
          } catch (error) {
            console.error('Error in order book callback:', error);
          }
        });
      }

      // Trade stream
      if (stream.includes('@trade') && payload) {
        const update: TradeUpdate = {
          symbol: payload.s || '',
          price: payload.p || '0',
          quantity: payload.q || '0',
          tradeId: typeof payload.t === 'number' ? payload.t : 0,
          timestamp: typeof payload.T === 'number' ? payload.T : Date.now(),
          isBuyerMaker: Boolean(payload.m),
        };

        // Esegui callback in modo safe
        this.tradeCallbacks.forEach((callback) => {
          try {
            callback(update);
          } catch (error) {
            console.error('Error in trade callback:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  /**
   * Gestisci riconnessione automatica
   */
  private handleReconnect() {
    // Non riconnettere se disconnesso intenzionalmente
    if (this.isIntentionallyDisconnected) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Reconnecting Binance WebSocket (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      
      // Cancella timer precedente se esiste
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Disconnetti WebSocket
   */
  disconnect() {
    this.isIntentionallyDisconnected = true;
    
    // Cancella timer di riconnessione
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Rimuovi tutti i callback
    this.orderBookCallbacks.clear();
    this.tradeCallbacks.clear();
    
    // Chiudi WebSocket
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Verifica se connesso
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

/**
 * Hook React per usare Binance Stream
 * Nota: Questo hook deve essere usato solo in componenti React client-side
 */
import { useState, useEffect } from 'react';

/**
 * Throttle helper per limitare frequenza updates
 */
function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export function useBinanceStream(symbol: string) {
  const [stream, setStream] = useState<BinanceStream | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookUpdate | null>(null);
  const [trades, setTrades] = useState<TradeUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setConnected(false);

    const binanceStream = new BinanceStream(symbol);

    // Throttle order book updates a 100ms (10 updates/sec max)
    const handleOrderBook = throttle((update: OrderBookUpdate) => {
      setOrderBook(update);
    }, 100);

    const handleTrade = (update: TradeUpdate) => {
      setTrades((prev) => [update, ...prev].slice(0, 100)); // Mantieni ultimi 100
    };

    binanceStream.onOrderBookUpdate(handleOrderBook);
    binanceStream.onTradeUpdate(handleTrade);

    binanceStream
      .connect()
      .then(() => {
        setConnected(true);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
        setConnected(false);
      });

    setStream(binanceStream);

    return () => {
      // Cleanup: rimuovi callback prima di disconnettere
      binanceStream.offOrderBookUpdate(handleOrderBook);
      binanceStream.offTradeUpdate(handleTrade);
      binanceStream.disconnect();
    };
  }, [symbol]);

  return { stream, orderBook, trades, loading, error, connected };
}

