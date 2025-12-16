/**
 * Execution API – piazza ordini demo/reali
 * Input: segnali intraday da Redis
 * Principi: sicurezza, performance, logging, modularità, toggle demo/live
 */

import Redis from 'ioredis';
import fetch from 'node-fetch';

type Mode = "demo" | "live";
const MODE: Mode = "demo"; // cambiare per passare a reale

interface Signal {
  symbol: string;
  direction: "LONG" | "SHORT" | "NEUTRAL";
  confidence: number;
  timestamp: number;
  exchange: string;
}

interface Order {
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: number;
}

// ---------------------- REDIS ----------------------
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// ---------------------- ORDER PLACE ----------------------
async function placeOrder(signal: Signal) {
  if (signal.direction === "NEUTRAL") return;

  const side: "BUY" | "SELL" = signal.direction === "LONG" ? "BUY" : "SELL";

  const order: Order = {
    symbol: signal.symbol,
    side,
    type: "MARKET",
    quantity: calculateQuantity(signal),
    stopLoss: calculateStopLoss(signal),
    takeProfit: calculateTakeProfit(signal),
    timestamp: Date.now(),
  };

  const apiUrl = getExchangeEndpoint(signal.exchange);
  const apiKey = getApiKey(signal.exchange);

  // invio ordine demo/live
  try {
    const res = await fetch(`${apiUrl}/order`, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    const data = await res.json();
    console.log(`[${signal.exchange}] Order placed: ${JSON.stringify(order)}, response: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error(`[${signal.exchange}] Order error:`, err);
  }
}

// ---------------------- HELPERS ----------------------
function calculateQuantity(signal: Signal): number {
  // esempio base: quantità proporzionale a confidence
  const baseQty = 0.001; // BTC o ETH
  return baseQty * signal.confidence;
}

function calculateStopLoss(signal: Signal): number {
  // esempio base: 0.5% SL
  return signal.direction === "LONG" ? 0.995 : 1.005;
}

function calculateTakeProfit(signal: Signal): number {
  // esempio base: 1% TP
  return signal.direction === "LONG" ? 1.01 : 0.99;
}

function getExchangeEndpoint(exchange: string): string {
  const endpoints: Record<string, { demo: string; live: string }> = {
    Binance: { demo: "https://testnet.binance.vision/api/v3", live: "https://api.binance.com/api/v3" },
    Bybit: { demo: "https://api-testnet.bybit.com", live: "https://api.bybit.com" },
    OKX: { demo: "https://www.okx.com/api/v5", live: "https://www.okx.com/api/v5" },
  };
  return MODE === "demo" ? endpoints[exchange].demo : endpoints[exchange].live;
}

function getApiKey(exchange: string): string {
  if (MODE === "demo") return process.env[`${exchange.toUpperCase()}_TESTNET_KEY`] || "";
  return process.env[`${exchange.toUpperCase()}_LIVE_KEY`] || "";
}

// ---------------------- REDIS SUBSCRIBE ----------------------
function subscribeSignals() {
  const sub = new Redis({ host: "127.0.0.1", port: 6379 });
  sub.subscribe("signals:intraday", (err, count) => {
    if (err) console.error("Subscribe error:", err);
    else console.log(`Subscribed to signals:intraday`);
  });

  sub.on("message", (channel, message) => {
    try {
      const signal: Signal = JSON.parse(message);
      placeOrder(signal);
    } catch (err) {
      console.error("Error parsing signal", err);
    }
  });
}

// ---------------------- INIT ----------------------
function init() {
  console.log(`Starting Execution API in ${MODE.toUpperCase()} mode`);
  subscribeSignals();
}

// ---------------------- START ----------------------
init();

export { init, placeOrder };
