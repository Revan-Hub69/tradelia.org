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

import { EngineServer } from './http/server';
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

// Initialize OMS Engine Server
const engineServer = new EngineServer(prisma);

// Add Prisma to Fastify context (for legacy routes)
server.decorate('prisma', prisma);

server.addHook('onClose', async () => {
  await prisma.$disconnect();
});

// Register OMS Engine routes
engineServer.registerRoutes(server);

// Health check
server.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      oms: 'initialized'
    }
  };
});

const start = async () => {
  try {
    // Initialize engine services
    await engineServer.initialize();

    const port = env.PORT;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`🚀 OMS API server running on port ${port}`);
    server.log.info(`📊 Environment: ${env.EXCHANGE_ENV}`);
    server.log.info(`🔄 Position Mode: ${env.POSITION_MODE}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
