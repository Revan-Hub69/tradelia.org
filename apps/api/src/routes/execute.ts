import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { generateRequestId } from '@tradelia/shared';

const ExecuteRequestSchema = z.object({
  plan_id: z.string(),
  request_id: z.string().optional()
});

export const executeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    try {
      const body = ExecuteRequestSchema.parse(request.body);
      const requestId = body.request_id || generateRequestId();
      
      // Check if session is running
      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });
      
      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }
      
      // Check if request already exists (idempotency)
      const existingJob = await fastify.prisma.job.findUnique({
        where: { requestId }
      });
      
      if (existingJob) {
        return reply.code(200).send({
          request_id: requestId,
          status: existingJob.status,
          message: 'Request already processed'
        });
      }
      
      // Create execution job
      const job = await fastify.prisma.job.create({
        data: {
          sessionId: session.id,
          planId: body.plan_id,
          requestId,
          type: 'EXECUTE_PLAN',
          payload: { plan_id: body.plan_id },
          status: 'PENDING'
        }
      });
      
      fastify.log.info(`Execution job created: ${job.id} for plan: ${body.plan_id}`);
      
      return reply.code(202).send({
        request_id: requestId,
        job_id: job.id,
        status: 'ACCEPTED',
        message: 'Execution job queued'
      });
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Invalid execution request' });
    }
  });
  
  // Get execution status
  fastify.get('/status/:requestId', async (request, reply) => {
    try {
      const { requestId } = request.params as { requestId: string };
      
      const job = await fastify.prisma.job.findUnique({
        where: { requestId },
        include: {
          session: true
        }
      });
      
      if (!job) {
        return reply.code(404).send({ error: 'Request not found' });
      }
      
      return {
        request_id: requestId,
        job_id: job.id,
        status: job.status,
        attempts: job.attempts,
        error: job.error,
        created_at: job.createdAt,
        updated_at: job.updatedAt
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get execution status' });
    }
  });
};