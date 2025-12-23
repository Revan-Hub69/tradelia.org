import pino from 'pino';
import { SupabaseClient } from '@supabase/supabase-js';

type JobPayload = {
  exec_id?: string;
  rule?: string;
  params?: Record<string, unknown>;
};

export async function updateSltpJob(
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

  if (!payload.exec_id) {
    throw new Error('Job payload missing exec_id');
  }

  const update = {
    audit: {
      last_update_sltp: {
        rule: payload.rule ?? 'UNSPECIFIED',
        params: payload.params ?? {},
        requested_at: new Date().toISOString()
      }
    }
  };

  const { error: execError } = await supabase
    .from('executions')
    .update(update)
    .eq('exec_id', payload.exec_id)
    .eq('user_id', job.user_id);

  if (execError) throw execError;

  logger.info({ jobId, execId: payload.exec_id }, 'Update SL/TP recorded');
}
