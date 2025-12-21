import { FastifyPluginAsync } from 'fastify';
import { SessionSchema } from '@tradelia/shared';

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  // Start session
  fastify.post('/start', async (request, reply) => {
    try {
      const body = SessionSchema.parse(request.body);
      
      // Check if there's already a running session
      const existingSession = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });
      
      if (existingSession) {
        return reply.code(400).send({ 
          error: 'A session is already running. Stop it first.' 
        });
      }
      
      const session = await fastify.prisma.session.create({
        data: {
          mode: body.mode,
          screenerProfile: body.screener_profile,
          executionMode: body.execution_mode,
          binanceEnv: body.binance_env,
          status: 'RUNNING'
        }
      });
      
      fastify.log.info(`Session started: ${session.id}`);
      return { session_id: session.id, status: 'RUNNING' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Invalid session configuration' });
    }
  });
  
  // Stop session
  fastify.post('/stop', async (request, reply) => {
    try {
      const runningSession = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });
      
      if (!runningSession) {
        return reply.code(404).send({ error: 'No running session found' });
      }
      
      await fastify.prisma.session.update({
        where: { id: runningSession.id },
        data: { status: 'STOPPED' }
      });
      
      fastify.log.info(`Session stopped: ${runningSession.id}`);
      return { session_id: runningSession.id, status: 'STOPPED' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to stop session' });
    }
  });
  
  // Get session state
  fastify.get('/state', async (request, reply) => {
    try {
      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' },
        orderBy: { createdAt: 'desc' }
      });
      
      if (!session) {
        return { status: 'NO_SESSION' };
      }
      
      const badge = session.binanceEnv === 'live' ? 'LIVE' : 'DEMO';
      
      return {
        session_id: session.id,
        mode: session.mode,
        screener_profile: session.screenerProfile,
        execution_mode: session.executionMode,
        binance_env: session.binanceEnv,
        status: session.status,
        badge,
        created_at: session.createdAt
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get session state' });
    }
  });
};