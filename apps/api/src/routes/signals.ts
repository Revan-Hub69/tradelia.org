import { FastifyPluginAsync } from 'fastify';

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
      
      // Mock signal candidates
      const mockCandidates = [
        {
          symbol: 'SOLUSDT',
          side: 'LONG',
          timestamp: Date.now(),
          features: {
            ema50: 142.35,
            ema200: 138.20,
            slope: 0.0023,
            atr14: 3.45,
            regime: 'TREND',
            pullback_valid: true,
            bos_confirmed: true
          },
          funding_mode_pre: 'normal',
          confidence: 0.82
        }
      ];
      
      fastify.log.info('Signal candidates requested');
      
      return {
        candidates: mockCandidates,
        timestamp: Date.now(),
        session_id: session.id
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get signal candidates' });
    }
  });
};