import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const ScreenerQuerySchema = z.object({
  profile: z.enum(['A', 'B'])
});

export const screenerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/top', async (request, reply) => {
    try {
      const { profile } = ScreenerQuerySchema.parse(request.query);
      
      // Check if session is running
      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });
      
      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }
      
      // Mock screener results for now
      const mockSymbols = [
        {
          symbol: 'SOLUSDT',
          score: 0.85,
          bucket: 'TREND_CLEAN',
          metrics: {
            atr_pct: 0.023,
            funding: 0.0003,
            spread: 0.0008,
            volume_24h: 1250000000
          }
        },
        {
          symbol: 'AVAXUSDT', 
          score: 0.78,
          bucket: 'VOL_BREAKOUT',
          metrics: {
            atr_pct: 0.031,
            funding: -0.0001,
            spread: 0.0012,
            volume_24h: 890000000
          }
        }
      ];
      
      fastify.log.info(`Screener request for profile ${profile}`);
      
      return {
        profile,
        symbols: mockSymbols,
        timestamp: Date.now(),
        total_screened: 150,
        selected: mockSymbols.length
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Invalid screener request' });
    }
  });
};