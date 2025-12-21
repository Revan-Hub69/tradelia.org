import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { buildScreenerSnapshot } from '../lib/screener';

const ScreenerQuerySchema = z.object({
  profile: z.enum(['A', 'B'])
});

export const screenerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/top', async (request, reply) => {
    try {
      const { profile } = ScreenerQuerySchema.parse(request.query);
      const snapshot = await buildScreenerSnapshot(profile);
      
      // Check if session is running
      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });
      
      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }
      
      fastify.log.info(`Screener request for profile ${profile}`);

      return {
        profile,
        k_dynamic: snapshot.kDynamic,
        k_cap: snapshot.kCap,
        top_k: snapshot.topK,
        watchlist_final: snapshot.watchlistFinal,
        timestamp: Date.now(),
        total_screened: snapshot.totalScreened,
        selected: snapshot.watchlistFinal.length
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Invalid screener request' });
    }
  });
};
