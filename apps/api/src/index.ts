import dotenv from 'dotenv';

// IMPORTANT: load .env BEFORE importing env validator
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { sessionRoutes } from './routes/session';
import { screenerRoutes } from './routes/screener';
import { signalsRoutes } from './routes/signals';
import { tradePlansRoutes } from './routes/tradeplans';
import { executeRoutes } from './routes/execute';
import { ordersRoutes } from './routes/orders';
import { marketRoutes } from './routes/market';
import { v1Routes } from './routes/v1';
import { featureSnapshotsRoutes } from './routes/featureSnapshots';
import { authRoutes } from './routes/auth';
import { env } from './config/env';

console.log('Initializing database connection...');

let prisma: PrismaClient;

try {
  // Create a connection pool
  const connectionString = env.DATABASE_URL;
  const pool = new Pool({ connectionString });

  // Create the PrismaPg adapter
  const adapter = new PrismaPg(pool);

  // Instantiate Prisma Client with the adapter
  prisma = new PrismaClient({ adapter });

  console.log('Database connection initialized successfully');
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  console.error('Please check your DATABASE_URL configuration');
  throw error;
}

const server = Fastify({
  logger: {
    level: env.LOG_LEVEL,
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty'
          }
        : undefined
  },
  trustProxy: env.TRUST_PROXY
});

// Register CORS
server.register(cors, {
  origin: env.CORS_ORIGIN ?? false
});

server.register(helmet);
server.register(rateLimit, {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW_MS
});

// Add Prisma to Fastify context
server.decorate('prisma', prisma);

server.addHook('onClose', async () => {
  await prisma.$disconnect();
});

// Register routes
server.register(sessionRoutes, { prefix: '/api/session' });
server.register(screenerRoutes, { prefix: '/api/screener' });
server.register(signalsRoutes, { prefix: '/api/signals' });
server.register(tradePlansRoutes, { prefix: '/api/tradeplans' });
server.register(executeRoutes, { prefix: '/api/execute' });
server.register(ordersRoutes, { prefix: '/api/orders' });
server.register(marketRoutes, { prefix: '/api/market' });server.register(featureSnapshotsRoutes, { prefix: '/api/features' });server.register(v1Routes, { prefix: '/v1' });
server.register(authRoutes, { prefix: '/api/auth' });

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = env.PORT;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`API server running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
