import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { sessionRoutes } from './routes/session';
import { screenerRoutes } from './routes/screener';
import { signalsRoutes } from './routes/signals';
import { tradePlansRoutes } from './routes/tradeplans';
import { executeRoutes } from './routes/execute';

dotenv.config();

const prisma = new PrismaClient();

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty'
    } : undefined
  }
});

// Register CORS
server.register(cors, {
  origin: process.env.CORS_ORIGIN || true
});

// Add Prisma to Fastify context
server.decorate('prisma', prisma);

// Register routes
server.register(sessionRoutes, { prefix: '/api/session' });
server.register(screenerRoutes, { prefix: '/api/screener' });
server.register(signalsRoutes, { prefix: '/api/signals' });
server.register(tradePlansRoutes, { prefix: '/api/tradeplans' });
server.register(executeRoutes, { prefix: '/api/execute' });

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`API server running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();