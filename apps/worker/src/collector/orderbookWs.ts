import WebSocket from 'ws';
import pino from 'pino';
import { SupabaseClient } from '@supabase/supabase-js';
import { BinanceProvider } from '../providers/binance';
import { env } from '../config/env';

type DepthUpdate = {
  e: string;
  E: number;
  s: string;
  U: number;
  u: number;
  b: [string, string][];
  a: [string, string][];
};

type OrderbookState = {
  lastUpdateId: number;
  bids: Map<string, string>;
  asks: Map<string, string>;
};

const sumQty = (levels: [string, string][]) =>
  levels.reduce((sum, [, qty]) => sum + Number(qty), 0);

const toLevels = (side: Map<string, string>) =>
  Array.from(side.entries())
    .map(([price, qty]) => [price, qty] as [string, string])
    .sort((a, b) => Number(b[0]) - Number(a[0]));

const calcImbalance = (bids: [string, string][], asks: [string, string][]) => {
  const bidQty = sumQty(bids);
  const askQty = sumQty(asks);
  const denom = bidQty + askQty;
  return denom === 0 ? 0 : (bidQty - askQty) / denom;
};

const calcSpreadBps = (bid: number, ask: number) => {
  if (!bid || !ask) return 0;
  const mid = (bid + ask) / 2;
  return mid === 0 ? 0 : ((ask - bid) / mid) * 10_000;
};

const applyUpdate = (state: OrderbookState, bids: [string, string][], asks: [string, string][]) => {
  for (const [price, qty] of bids) {
    if (qty === '0' || qty === '0.0') state.bids.delete(price);
    else state.bids.set(price, qty);
  }
  for (const [price, qty] of asks) {
    if (qty === '0' || qty === '0.0') state.asks.delete(price);
    else state.asks.set(price, qty);
  }
};

async function loadSnapshot(
  binance: BinanceProvider,
  symbol: string
): Promise<OrderbookState> {
  const snapshot = await binance.getOrderBookDepth(symbol, 100);
  const bids = new Map(snapshot.bids);
  const asks = new Map(snapshot.asks);
  return {
    lastUpdateId: snapshot.lastUpdateId ?? 0,
    bids,
    asks
  };
}

async function emitSnapshot(
  supabase: SupabaseClient,
  logger: pino.Logger,
  symbol: string,
  state: OrderbookState
) {
  const bidLevels = toLevels(state.bids).slice(0, 5);
  const askLevels = toLevels(state.asks).slice(0, 5);
  const bestBid = bidLevels[0] ? Number(bidLevels[0][0]) : 0;
  const bestAsk = askLevels[0] ? Number(askLevels[0][0]) : 0;

  const payload = {
    exchange: 'binance',
    venue: 'futures_usdt',
    symbol,
    ts: new Date().toISOString(),
    features: {
      orderbook: {
        spread_bps: calcSpreadBps(bestBid, bestAsk),
        obi_l1: calcImbalance(bidLevels.slice(0, 1), askLevels.slice(0, 1)),
        obi_l5: calcImbalance(bidLevels, askLevels)
      }
    },
    quality: {
      latency_ms: 0,
      missing: [],
      sync_ok: true,
      lob_ok: Boolean(bestBid && bestAsk)
    },
    source_meta: {
      lob_last_update_id: state.lastUpdateId
    }
  };

  const { error } = await supabase.from('feature_snapshots').insert(payload);
  if (error) {
    logger.error({ symbol, err: error.message }, 'Failed to store WS feature snapshot');
  }
}

export async function startOrderbookStream(
  supabase: SupabaseClient,
  logger: pino.Logger,
  symbols: string[]
) {
  const binance = new BinanceProvider();
  const states = new Map<string, OrderbookState>();

  for (const symbol of symbols) {
    try {
      states.set(symbol, await loadSnapshot(binance, symbol));
    } catch (err: any) {
      logger.error({ symbol, err: String(err?.message ?? err) }, 'Snapshot load failed');
    }
  }

  const streams = symbols.map((symbol) => `${symbol.toLowerCase()}@depth@100ms`).join('/');
  const wsBase = env.BINANCE_FSTREAM_WS ?? 'wss://fstream.binance.com';
  const ws = new WebSocket(`${wsBase}/stream?streams=${streams}`);

  ws.on('message', (raw) => {
    try {
      const payload = JSON.parse(raw.toString());
      const data = payload.data as DepthUpdate;
      const symbol = data.s;
      const state = states.get(symbol);
      if (!state) return;

      if (data.u <= state.lastUpdateId) return;
      if (data.U > state.lastUpdateId + 1) {
        loadSnapshot(binance, symbol)
          .then((fresh) => states.set(symbol, fresh))
          .catch((err: any) =>
            logger.error({ symbol, err: String(err?.message ?? err) }, 'Resync failed')
          );
        return;
      }

      applyUpdate(state, data.b, data.a);
      state.lastUpdateId = data.u;
    } catch (err: any) {
      logger.error({ err: String(err?.message ?? err) }, 'WS parse failed');
    }
  });

  ws.on('error', (err) => {
    logger.error({ err: String(err?.message ?? err) }, 'Orderbook WS error');
  });

  setInterval(() => {
    for (const [symbol, state] of states.entries()) {
      emitSnapshot(supabase, logger, symbol, state).catch((err) => {
        logger.error({ symbol, err: String(err?.message ?? err) }, 'Emit snapshot failed');
      });
    }
  }, env.LOB_FEATURE_EMIT_MS);

  setInterval(() => {
    for (const symbol of states.keys()) {
      loadSnapshot(binance, symbol)
        .then((fresh) => states.set(symbol, fresh))
        .catch((err: any) =>
          logger.error({ symbol, err: String(err?.message ?? err) }, 'Periodic resync failed')
        );
    }
  }, env.LOB_SNAPSHOT_INTERVAL_MS);
}
