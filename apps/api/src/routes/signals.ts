import { FastifyPluginAsync } from 'fastify';
import { BinanceProvider } from '../providers/binance';
import { buildScreenerSnapshot } from '../lib/screener';
import { averageTrueRange, momentumScore, simpleMovingAverage } from '../lib/indicators';
import { computeRegime } from '../lib/regime';

export const signalsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/candidates', async (request, reply) => {
    try {
      // Check if session is running
      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });
      
      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }
      
      const profile = session.screenerProfile === 'A' ? 'A' : 'B';
      const snapshot = await buildScreenerSnapshot(profile);
      const binance = new BinanceProvider();

      const candidates = await Promise.all(
        snapshot.watchlistFinal.map(async (item) => {
          const klines = await binance.getKlines(item.symbol, '15m', 55);
          const closes = klines.map((kline) => parseFloat(kline.close));
          const sma20 = simpleMovingAverage(closes, 20);
          const atr14 = averageTrueRange(klines, 14);
          const momentum = momentumScore(closes);

          if (!sma20 || !atr14 || momentum === null) {
            return null;
          }

          const lastClose = closes[closes.length - 1];
          const regimeResult = computeRegime(lastClose, sma20, atr14, momentum);
          const side = momentum > 0 && lastClose > sma20 ? 'LONG' : momentum < 0 && lastClose < sma20 ? 'SHORT' : null;

          if (!side) {
            return null;
          }

          if (regimeResult.regime === 'RANGE' && Math.abs(momentum) < 0.005) {
            return null;
          }

          const confidence = Math.min(0.99, Math.abs(momentum) * 20);

          return {
            symbol: item.symbol,
            side,
            timestamp: Date.now(),
            features: {
              sma20,
              atr14,
              momentum,
              regime: regimeResult.regime,
              atr_pct: regimeResult.atrPct,
              funding_rate: item.fundingRate,
              spread_pct: item.spreadPct,
              depth: item.depth
            },
            funding_mode_pre: item.fundingRate >= 0 ? 'normal' : 'contrarian',
            confidence
          };
        })
      );

      fastify.log.info('Signal candidates requested');

      return {
        candidates: candidates.filter((candidate) => Boolean(candidate)),
        timestamp: Date.now(),
        session_id: session.id
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get signal candidates' });
    }
  });
};
