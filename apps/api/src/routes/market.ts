import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { BinanceProvider } from '../providers/binance';
import { averageTrueRange, momentumScore, simpleMovingAverage } from '../lib/indicators';
import { computeRegime } from '../lib/regime';

const RegimeQuerySchema = z.object({
  symbol: z.string(),
  interval: z.string().default('15m')
});

const MicrostructureQuerySchema = z.object({
  symbol: z.string(),
  limit: z.coerce.number().int().min(5).max(100).default(50)
});

export const marketRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/regime', async (request, reply) => {
    try {
      const { symbol, interval } = RegimeQuerySchema.parse(request.query);
      const binance = new BinanceProvider();
      const klines = await binance.getKlines(symbol, interval, 55);
      const closes = klines.map((kline) => parseFloat(kline.close));
      const lastClose = closes[closes.length - 1];
      const atr14 = averageTrueRange(klines, 14);
      const sma20 = simpleMovingAverage(closes, 20);
      const momentum = momentumScore(closes);

      if (!atr14 || !sma20 || momentum === null || !lastClose) {
        return reply.code(400).send({ error: 'Insufficient market data' });
      }

      const regimeResult = computeRegime(lastClose, sma20, atr14, momentum);

      return {
        symbol,
        interval,
        regime: regimeResult.regime,
        trend_bias: regimeResult.trendBias,
        atr_pct: regimeResult.atrPct,
        momentum: regimeResult.momentum,
        sma20,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Failed to compute regime' });
    }
  });

  fastify.get('/microstructure', async (request, reply) => {
    try {
      const { symbol, limit } = MicrostructureQuerySchema.parse(request.query);
      const binance = new BinanceProvider();
      const depth = await binance.getDepth(symbol, limit);
      const bids = depth.bids.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        qty: parseFloat(qty)
      }));
      const asks = depth.asks.map(([price, qty]: [string, string]) => ({
        price: parseFloat(price),
        qty: parseFloat(qty)
      }));

      const bidSize = bids.reduce((total: number, level) => total + level.qty, 0);
      const askSize = asks.reduce((total: number, level) => total + level.qty, 0);
      const imbalance = bidSize + askSize > 0 ? (bidSize - askSize) / (bidSize + askSize) : 0;
      const bestBid = bids[0]?.price ?? 0;
      const bestAsk = asks[0]?.price ?? 0;
      const mid = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
      const spreadPct = mid > 0 ? (bestAsk - bestBid) / mid : 0;

      return {
        symbol,
        limit,
        best_bid: bestBid,
        best_ask: bestAsk,
        spread_pct: spreadPct,
        imbalance,
        depth_bid: bidSize,
        depth_ask: askSize,
        timestamp: Date.now()
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Failed to compute microstructure' });
    }
  });
};
