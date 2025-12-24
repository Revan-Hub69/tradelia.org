import path from 'path';
import dotenv from 'dotenv';

// IMPORTANT: load .env BEFORE importing env validator
// Try to load from current directory first, then parent directory
console.log('Loading .env from current directory...');
dotenv.config();
console.log('EXCHANGE_ENV after loading:', process.env.EXCHANGE_ENV);

if (!process.env.EXCHANGE_ENV) {
  console.log('Loading .env from parent directory...');
  const parentEnvPath = path.resolve(__dirname, '../.env');
  console.log('Parent .env path:', parentEnvPath);
  dotenv.config({ path: parentEnvPath });
  console.log('EXCHANGE_ENV after loading from parent:', process.env.EXCHANGE_ENV);
}

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { EngineServer } from './http/server';
import { env } from './config/env';
import { authPlugin } from './plugins/auth';

console.log('Initializing database connection...');

let prisma: PrismaClient | null = null;

if (env.DATABASE_URL) {
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
} else {
  console.warn('No DATABASE_URL provided - running in database-less mode for testing');
}

const server = Fastify({
  logger: {
    level: env.LOG_LEVEL,
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

// Register Swagger
server.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Tradelia OMS API',
      description: 'Autonomous Binance USDT-M Futures Trading Engine API',
      version: '1.0.0'
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  }
});

server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header
});

// Register auth plugin
server.register(authPlugin);

// Initialize OMS Engine Server
const engineServer = new EngineServer(prisma);

// Add Prisma to Fastify context (for legacy routes)
if (prisma) {
  server.decorate('prisma', prisma);

  server.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}

// Register OMS Engine routes
engineServer.registerRoutes(server);

const start = async () => {
  try {
    // Initialize engine services (WebSocket will be started after server starts)
    await engineServer.initialize();

    const port = env.PORT;
    await server.listen({ port, host: '0.0.0.0' });

    // Start WebSocket server attached to the HTTP server
    engineServer.startWebSocketServer(server.server);

    server.log.info(`🚀 OMS API server running on port ${port}`);
    server.log.info(`🌐 WebSocket server attached on path /ws`);
    server.log.info(`📊 Environment: ${env.EXCHANGE_ENV}`);
    server.log.info(`🔄 Position Mode: ${env.POSITION_MODE}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
