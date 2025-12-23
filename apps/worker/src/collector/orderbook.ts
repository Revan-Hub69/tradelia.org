import { SupabaseClient } from '@supabase/supabase-js';
import pino from 'pino';
import { BinanceProvider } from '../providers/binance';

type OrderbookLevel = [string, string];

type OrderbookDepth = {
  lastUpdateId?: number;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
};

const sumQty = (levels: OrderbookLevel[]) =>
  levels.reduce((sum, [, qty]) => sum + Number(qty), 0);

const calcImbalance = (bids: OrderbookLevel[], asks: OrderbookLevel[]) => {
  const bidQty = sumQty(bids);
  const askQty = sumQty(asks);
  const denom = bidQty + askQty;
  if (denom === 0) return 0;
  return (bidQty - askQty) / denom;
};

const calcSpreadBps = (bid: number, ask: number) => {
  if (!bid || !ask) return 0;
  const mid = (bid + ask) / 2;
  return mid === 0 ? 0 : ((ask - bid) / mid) * 10_000;
};

export async function collectOrderbookSnapshots(
  supabase: SupabaseClient,
  logger: pino.Logger,
  symbols: string[]
) {
  const binance = new BinanceProvider();

  for (const symbol of symbols) {
    try {
      const start = Date.now();
      const depth = (await binance.getOrderBookDepth(symbol, 20)) as OrderbookDepth;
      const latencyMs = Date.now() - start;

      const bestBid = depth.bids?.[0] ? Number(depth.bids[0][0]) : 0;
      const bestAsk = depth.asks?.[0] ? Number(depth.asks[0][0]) : 0;

      const obiL1 = calcImbalance(depth.bids.slice(0, 1), depth.asks.slice(0, 1));
      const obiL5 = calcImbalance(depth.bids.slice(0, 5), depth.asks.slice(0, 5));
      const spreadBps = calcSpreadBps(bestBid, bestAsk);

      const payload = {
        exchange: 'binance',
        venue: 'futures_usdt',
        symbol,
        ts: new Date().toISOString(),
        features: {
          orderbook: {
            spread_bps: spreadBps,
            obi_l1: obiL1,
            obi_l5: obiL5
          }
        },
        quality: {
          latency_ms: latencyMs,
          missing: [],
          sync_ok: Boolean(depth.bids?.length && depth.asks?.length),
          lob_ok: Boolean(depth.bids?.length && depth.asks?.length)
        },
        source_meta: {
          lob_last_update_id: depth.lastUpdateId ?? null
        }
      };

      const { error } = await supabase.from('feature_snapshots').insert(payload);
      if (error) {
        logger.error({ symbol, err: error.message }, 'Failed to store feature snapshot');
      }
    } catch (err: any) {
      logger.error({ symbol, err: String(err?.message ?? err) }, 'Orderbook snapshot failed');
    }
  }
}
