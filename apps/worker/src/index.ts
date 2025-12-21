import dotenv from 'dotenv';
dotenv.config();

import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import { env } from './config/env';
import { executePlanJob } from './jobs/executePlan';

const logger = pino({ level: env.LOG_LEVEL });
const prisma = new PrismaClient();

async function claimNextJob(): Promise<string | null> {
  // Claim one PENDING job safely (best-effort lock via conditional update)
  const pending = await prisma.job.findFirst({
    where: {
      status: 'PENDING',
      attempts: { lt: 3 },
      type: 'EXECUTE_PLAN'
    },
    orderBy: { createdAt: 'asc' }
  });

  if (!pending) return null;

  // Conditional update to avoid races (if another worker claimed it first)
  const updated = await prisma.job.updateMany({
    where: { id: pending.id, status: 'PENDING' },
    data: { status: 'PROCESSING', attempts: { increment: 1 } }
  });

  if (updated.count === 0) return null;
  return pending.id;
}

async function markJobCompleted(jobId: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: { status: 'COMPLETED', error: null }
  });
}

async function markJobFailed(jobId: string, errMsg: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return;

  const attempts = job.attempts ?? 0;
  const maxAttempts = job.maxAttempts ?? 3;

  // if more attempts remain, put back to PENDING; else FAILED
  const finalStatus = attempts < maxAttempts ? 'PENDING' : 'FAILED';

  await prisma.job.update({
    where: { id: jobId },
    data: { status: finalStatus, error: errMsg }
  });
}

async function loop() {
  while (true) {
    try {
      const jobId = await claimNextJob();

      if (!jobId) {
        await new Promise((r) => setTimeout(r, env.WORKER_POLL_MS));
        continue;
      }

      logger.info({ jobId }, 'Claimed job');

      try {
        await executePlanJob(prisma, logger, jobId);
        await markJobCompleted(jobId);
      } catch (err: any) {
        const msg = String(err?.message ?? err ?? 'Unknown worker error');
        logger.error({ jobId, err: msg }, 'Job failed');
        await markJobFailed(jobId, msg);
      }
    } catch (err: any) {
      logger.error({ err: String(err?.message ?? err) }, 'Worker loop error');
      await new Promise((r) => setTimeout(r, Math.max(1000, env.WORKER_POLL_MS)));
    }
  }
}

async function start() {
  logger.info(
    {
      nodeEnv: env.NODE_ENV,
      pollMs: env.WORKER_POLL_MS,
      binanceEnv: env.BINANCE_ENV
    },
    'Worker starting'
  );

  await loop();
}

start().catch((e) => {
  logger.error({ err: String(e?.message ?? e) }, 'Worker fatal');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
