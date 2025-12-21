import { FastifyPluginAsync } from 'fastify';
import { TradePlanSchema } from '@tradelia/shared';

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
      
      // Mock a trade plan if none exist
      if (tradePlans.length === 0) {
        const mockPlan = {
          plan_id: 'plan_' + Date.now(),
          session_id: session.id,
          env: session.binanceEnv as 'testnet' | 'live',
          mode: session.mode as any,
          screener_profile: session.screenerProfile as 'A' | 'B',
          symbol: 'SOLUSDT',
          side: 'LONG' as const,
          entry: { type: 'MARKET' as const, price: 142.35 },
          risk: { 
            sl: 138.20, 
            tp1: 147.50, 
            tp2: 152.80, 
            trail: 'EMA20_1m' 
          },
          sizing: { 
            qty: 18.2, 
            leverage: 50, 
            marginType: 'ISOLATED' as const 
          },
          gates: {
            setup_pass: true,
            micro_pass: true,
            funding_mode: 'normal' as const,
            expires_at: Date.now() + (5 * 60 * 1000) // 5 minutes
          },
          why: [
            'EMA50 > EMA200 with positive slope',
            'Valid pullback to EMA50 + 0.20*ATR',
            'BOS confirmed above last swing high',
            'OBI5 > 0.10 and OBI20 > 0.06',
            'Delta flush to flip pattern detected'
          ],
          metrics: {
            obi5: 0.14,
            obi20: 0.08,
            delta_fast: 0.6,
            delta_slow: -0.3,
            spread: 0.0008,
            atrp15m: 0.023,
            funding: 0.0003
          }
        };
        
        return {
          plans: [mockPlan],
          timestamp: Date.now(),
          session_id: session.id
        };
      }
      
      return {
        plans: tradePlans,
        timestamp: Date.now(),
        session_id: session.id
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get trade plans' });
    }
  });
};