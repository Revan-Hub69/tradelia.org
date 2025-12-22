import pino from 'pino';
import { SupabaseClient } from '@supabase/supabase-js';

type JobPayload = {
  exec_id?: string;
  poll_ms?: number;
};

export async function monitorPositionJob(
  supabase: SupabaseClient,
  logger: pino.Logger,
  jobId: string
) {
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (jobError || !job) throw new Error('Job not found');

  const payload = (job.payload ?? {}) as JobPayload;

  if (payload.exec_id) {
    const { error: execError } = await supabase
      .from('executions')
      .update({ updated_at: new Date().toISOString() })
      .eq('exec_id', payload.exec_id)
      .eq('user_id', job.user_id);

    if (execError) throw execError;
  }

  logger.info({ jobId, execId: payload.exec_id }, 'Monitor position noop');
}
