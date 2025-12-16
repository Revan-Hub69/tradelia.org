/**
 * WS Manager multi-exchange
 * Demo / Live toggle, snapshot L2, delta update, Redis pub/sub
 * Best practice: sicurezza, performance, logging, modularità
 */

import WebSocket from 'ws';
import Redis from 'ioredis';
import fetch from 'node-fetch';

// ---------------------- CONFIG ----------------------
const MODE: "demo" | "live" = "demo"; // cambiare per passare a reale

interface ExchangeConfig {
  name: string;
  wsEndpoint: string;
  testnetEndpoint: string;
  liveEndpoint: string;
  symbols: string[];
}

const exchanges: ExchangeConfig[] = [
  {
    name: "Binance",
    wsEndpoint: "",
    testnetEndpoint: "wss://testnet.binance.vision/ws",
    liveEndpoint: "wss://stream.binance.com/ws",
    symbols: ["btcusdt", "ethusdt"]
  },
  {
    name: "Bybit",
    wsEndpoint: "",
    testnetEndpoint: "wss://stream-testnet.bybit.com/realtime",
    liveEndpoint: "wss://stream.bybit.com/realtime",
    symbols: ["BTCUSDT", "ETHUSDT"]
  },
  {
    name: "OKX",
    wsEndpoint: "",
    testnetEndpoint: "wss://www.okx.com/ws/v5/public?brokerId=9999",
    liveEndpoint: "wss://ws.okx.com:8443/ws/v5/public",
    symbols: ["BTC-USDT", "ETH-USDT"]
  }
];

// ---------------------- REDIS ----------------------
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// ---------------------- WS MANAGER ----------------------
interface Snapshot {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

// Funzione helper: crea connessione WS per ogni exchange e simbolo
function connectExchange(exchange: ExchangeConfig) {
  const endpoint = MODE === "demo" ? exchange.testnetEndpoint : exchange.liveEndpoint;
  const ws = new WebSocket(endpoint);

  ws.on("open", () => {
    console.log(`[${exchange.name}] WS connected to ${endpoint}`);
    // Subscribes ai canali L2 per ogni simbolo
    exchange.symbols.forEach(symbol => {
      const msg = {
        op: "subscribe",
        args: [`orderbook:${symbol}`]
      };
      ws.send(JSON.stringify(msg));
    });
  });

  ws.on("message", (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      handleMessage(exchange.name, parsed);
    } catch (err) {
      console.error(`[${exchange.name}] WS parse error`, err);
    }
  });

  ws.on("close", () => {
    console.warn(`[${exchange.name}] WS disconnected, reconnecting in 5s`);
    setTimeout(() => connectExchange(exchange), 5000);
  });

  ws.on("error", (err) => {
    console.error(`[${exchange.name}] WS error`, err);
    ws.close();
  });
}

// ---------------------- HANDLER MESSAGGI ----------------------
function handleMessage(exchangeName: string, msg: any) {
  // Esempio generico: estrai snapshot bids/asks, timestamp
  if (!msg.data) return;

  const snapshot: Snapshot = {
    symbol: msg.symbol || "UNKNOWN",
    bids: msg.data.bids || [],
    asks: msg.data.asks || [],
    timestamp: Date.now(),
  };

  // Pub/Sub Redis: canale exchange:snapshot
  redis.publish(`${exchangeName}:snapshot`, JSON.stringify(snapshot));
}

// ---------------------- INIT ----------------------
function init() {
  console.log(`Starting WS Manager in ${MODE.toUpperCase()} mode`);
  exchanges.forEach(exchange => connectExchange(exchange));
}

// ---------------------- START ----------------------
init();

export { init, exchanges, redis };
