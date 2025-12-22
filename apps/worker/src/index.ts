import dotenv from 'dotenv';
dotenv.config();

import pino from 'pino';
import { createClient } from '@supabase/supabase-js';
import { env } from './config/env';
import { executePlanJob } from './jobs/executePlan';
import { monitorPositionJob } from './jobs/monitorPosition';
import { updateSltpJob } from './jobs/updateSltp';
import { startOrderbookStream } from './collector/orderbookWs';

const logger = pino({ level: env.LOG_LEVEL });
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function resolveSymbols(): Promise<string[]> {
  if (env.LOB_SYMBOLS_MODE === 'manual') {
    return (env.LOB_MANUAL_SYMBOLS ?? '')
      .split(',')
      .map((symbol) => symbol.trim())
      .filter(Boolean);
  }

  const { data, error } = await supabase
    .from('symbol_universe')
    .select('symbol, asof_date')
    .order('asof_date', { ascending: false })
    .limit(200);

  if (error || !data?.length) {
    return [];
  }

  const latestDate = data[0].asof_date;
  return data.filter((row) => row.asof_date === latestDate).map((row) => row.symbol);
}

async function startCollector() {
  const symbols = await resolveSymbols();
  if (symbols.length === 0) {
    logger.warn('No symbols available for orderbook collector');
    return;
  }
  await startOrderbookStream(supabase, logger, symbols);
}

async function claimNextJob(): Promise<string | null> {
  const { data: pending, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'QUEUED')
    .in('type', ['EXECUTE_PLAN', 'MONITOR_POSITION', 'UPDATE_SLTP'])
    .is('locked_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!pending) return null;

  const { data: updated, error: updateError } = await supabase
    .from('jobs')
    .update({
      status: 'RUNNING',
      locked_at: new Date().toISOString(),
      locked_by: env.WORKER_ID
    })
    .eq('job_id', pending.job_id)
    .eq('status', 'QUEUED')
    .is('locked_at', null)
    .select('job_id')
    .maybeSingle();

  if (updateError) throw updateError;
  if (!updated) return null;
  return updated.job_id;
}

async function markJobCompleted(jobId: string, result: Record<string, unknown>) {
  await supabase
    .from('jobs')
    .update({
      status: 'DONE',
      result,
      error: null,
      locked_at: null,
      locked_by: null
    })
    .eq('job_id', jobId);
}

async function markJobFailed(jobId: string, errMsg: string) {
  await supabase
    .from('jobs')
    .update({
      status: 'ERROR',
      error: errMsg,
      locked_at: null,
      locked_by: null
    })
    .eq('job_id', jobId);
}

async function loop() {
  while (true) {
    try {
      const jobId = await claimNextJob();

      if (!jobId) {
        await new Promise((r) => setTimeout(r, env.JOB_POLL_MS));
        continue;
      }

      logger.info({ jobId }, 'Claimed job');

      try {
        const { data: job } = await supabase
          .from('jobs')
          .select('type')
          .eq('job_id', jobId)
          .single();

        if (!job) {
          throw new Error('Job not found');
        }

        let result: Record<string, unknown> = { ok: true, type: job.type };
        if (job.type === 'MONITOR_POSITION') {
          await monitorPositionJob(supabase, logger, jobId);
        } else if (job.type === 'UPDATE_SLTP') {
          await updateSltpJob(supabase, logger, jobId);
        } else {
          const execId = await executePlanJob(supabase, logger, jobId);
          if (execId) {
            result = { ...result, exec_id: execId };
          }
        }

        await markJobCompleted(jobId, result);
      } catch (err: any) {
        const msg = String(err?.message ?? err ?? 'Unknown worker error');
        logger.error({ jobId, err: msg }, 'Job failed');
        await markJobFailed(jobId, msg);
      }
    } catch (err: any) {
      logger.error({ err: String(err?.message ?? err) }, 'Worker loop error');
      await new Promise((r) => setTimeout(r, Math.max(1000, env.JOB_POLL_MS)));
    }
  }
}

async function start() {
  logger.info(
    {
      nodeEnv: env.NODE_ENV,
      pollMs: env.JOB_POLL_MS,
      binanceEnv: env.BINANCE_ENV
    },
    'Worker starting'
  );

  startCollector();
  await loop();
}

start().catch((e) => {
  logger.error({ err: String(e?.message ?? e) }, 'Worker fatal');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  process.exit(0);
});
