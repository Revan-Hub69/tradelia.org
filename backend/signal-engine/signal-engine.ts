/**
 * Signal Engine Intraday Linkaday
 * Input: snapshot L2 da Redis (Binance, Bybit, OKX)
 * Output: segnali intraday
 * Principi: sicurezza, performance, logging, modularità
 */

import Redis from 'ioredis';

// ---------------------- CONFIG ----------------------
const MODE: "demo" | "live" = "demo"; // toggle demo/live

interface Snapshot {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

interface Signal {
  symbol: string;
  direction: "LONG" | "SHORT" | "NEUTRAL";
  confidence: number; // 0-1
  timestamp: number;
  exchange: string;
}

// ---------------------- REDIS ----------------------
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// ---------------------- UTILITY ----------------------
function calculateImbalance(snapshot: Snapshot): number {
  const bidVol = snapshot.bids.reduce((sum, [price, qty]) => sum + qty, 0);
  const askVol = snapshot.asks.reduce((sum, [price, qty]) => sum + qty, 0);
  return (bidVol - askVol) / (bidVol + askVol); // -1 -> dominance ask, +1 -> dominance bid
}

function generateSignal(imbalance: number): "LONG" | "SHORT" | "NEUTRAL" {
  if (imbalance > 0.3) return "LONG";
  if (imbalance < -0.3) return "SHORT";
  return "NEUTRAL";
}

// ---------------------- LISTENER REDIS ----------------------
function subscribeSnapshots() {
  const channels = ["Binance:snapshot", "Bybit:snapshot", "OKX:snapshot"];
  channels.forEach(ch => {
    const sub = new Redis({ host: "127.0.0.1", port: 6379 });
    sub.subscribe(ch, (err, count) => {
      if (err) console.error(`Subscribe error: ${err}`);
      else console.log(`Subscribed to ${ch}`);
    });

    sub.on("message", (channel, message) => {
      try {
        const snapshot: Snapshot = JSON.parse(message);
        processSnapshot(snapshot, channel.split(":")[0]);
      } catch (err) {
        console.error("Error parsing snapshot", err);
      }
    });
  });
}

// ---------------------- PROCESS SNAPSHOT ----------------------
function processSnapshot(snapshot: Snapshot, exchange: string) {
  const imbalance = calculateImbalance(snapshot);
  const direction = generateSignal(imbalance);

  const signal: Signal = {
    symbol: snapshot.symbol,
    direction,
    confidence: Math.abs(imbalance), // esempio base
    timestamp: Date.now(),
    exchange,
  };

  // Pubblica il segnale su Redis per il frontend o Execution API
  redis.publish("signals:intraday", JSON.stringify(signal));

  console.log(`[${exchange}] Signal generated: ${signal.symbol} -> ${signal.direction} (conf ${signal.confidence.toFixed(2)})`);
}

// ---------------------- INIT ----------------------
function init() {
  console.log(`Starting Signal Engine in ${MODE.toUpperCase()} mode`);
  subscribeSnapshots();
}

// ---------------------- START ----------------------
init();

export { init, subscribeSnapshots, processSnapshot };
