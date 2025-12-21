import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { MODE_CONFIGS } from '@tradelia/shared';
import { serializeTradePlan, isPlanExpired } from '../lib/tradeplans';
import { BinanceProvider } from '../providers/binance';
import { averageTrueRange } from '../lib/indicators';
import { getSymbolFilters, roundToStep } from '../lib/exchange';

const GenerateTradePlanSchema = z.object({
  symbol: z.string(),
  side: z.enum(['LONG', 'SHORT'])
});

export const tradePlansRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      // Check if session is running
      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });
      
      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }
      
      // Get pending trade plans
      const tradePlans = await fastify.prisma.tradePlan.findMany({
        where: {
          sessionId: session.id,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      });

      const now = Date.now();
      const expiredPlans = tradePlans.filter((plan) => isPlanExpired(plan, now));
      if (expiredPlans.length > 0) {
        await fastify.prisma.tradePlan.updateMany({
          where: { id: { in: expiredPlans.map((plan) => plan.id) } },
          data: { status: 'EXPIRED' }
        });
      }

      return {
        plans: tradePlans.filter((plan) => !isPlanExpired(plan, now)).map(serializeTradePlan),
        timestamp: Date.now(),
        session_id: session.id
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get trade plans' });
    }
  });

  fastify.post('/generate', async (request, reply) => {
    try {
      const { symbol, side } = GenerateTradePlanSchema.parse(request.body);
      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });

      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }

      const binance = new BinanceProvider();
      const [exchangeInfo, klines] = await Promise.all([
        binance.getExchangeInfo(),
        binance.getKlines(symbol, '15m', 55)
      ]);
      const lastClose = parseFloat(klines[klines.length - 1].close);
      const atr14 = averageTrueRange(klines, 14);

      if (!atr14 || !lastClose) {
        return reply.code(400).send({ error: 'Insufficient market data' });
      }

      const filters = getSymbolFilters(exchangeInfo, symbol);
      if (!filters) {
        return reply.code(400).send({ error: 'Symbol filters not available' });
      }

      const multiplier = side === 'LONG' ? 1 : -1;
      const slRaw = lastClose - multiplier * atr14 * 2;
      const tp1Raw = lastClose + multiplier * atr14 * 2;
      const tp2Raw = lastClose + multiplier * atr14 * 3.5;
      const entryPrice = roundToStep(lastClose, filters.tickSize);
      const sl = roundToStep(slRaw, filters.tickSize);
      const tp1 = roundToStep(tp1Raw, filters.tickSize);
      const tp2 = roundToStep(tp2Raw, filters.tickSize);
      const { leverage_cap } = MODE_CONFIGS[session.mode as keyof typeof MODE_CONFIGS] ?? MODE_CONFIGS.DEMO_REALISTIC;

      const { bid, ask } = await binance.getBestBidAsk(symbol);
      const spread = bid > 0 ? (ask - bid) / ((ask + bid) / 2) : 0;
      const premiumIndex = await binance.getPremiumIndex();
      const premium = premiumIndex.find((item: any) => item.symbol === symbol);
      const funding = premium ? parseFloat(premium.lastFundingRate ?? premium.fundingRate) : 0;
      const now = Date.now();
      const minNotional = filters.minNotional > 0 ? filters.minNotional : 10;
      const qtyRaw = (minNotional * 1.1) / entryPrice;
      const qty = roundToStep(qtyRaw, filters.stepSize);

      if (qty <= 0) {
        return reply.code(400).send({ error: 'Computed quantity is invalid' });
      }

      const plan = await fastify.prisma.tradePlan.create({
        data: {
          sessionId: session.id,
          env: session.binanceEnv,
          mode: session.mode,
          screenerProfile: session.screenerProfile,
          symbol,
          side,
          entry: { type: 'MARKET', price: entryPrice },
          risk: {
            sl,
            tp1,
            tp2,
            trail: 'ATR14_15m'
          },
          sizing: {
            qty,
            leverage: leverage_cap,
            marginType: 'ISOLATED'
          },
          gates: {
            setup_pass: true,
            micro_pass: true,
            funding_mode: funding >= 0 ? 'normal' : 'contrarian',
            expires_at: now + 5 * 60 * 1000
          },
          why: [
            'Deterministic signal-based trade plan',
            `ATR14=${atr14.toFixed(4)}`,
            `Spread=${spread.toFixed(6)}`
          ],
          metrics: {
            obi5: 0,
            obi20: 0,
            delta_fast: 0,
            delta_slow: 0,
            spread,
            atrp15m: atr14 / lastClose,
            funding
          }
        }
      });

      return reply.code(201).send({
        plan: serializeTradePlan(plan),
        timestamp: now
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Failed to generate trade plan' });
    }
  });
};
