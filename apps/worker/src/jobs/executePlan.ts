import pino from 'pino';
import { SupabaseClient } from '@supabase/supabase-js';
import { BinanceProvider } from '../providers/binance';

type JobPayload = {
  plan_id: string;
  exchange_connection_id: string;
  symbol: string;
  dry_run?: boolean;
};

type VaultSecret = {
  apiKey?: string;
  apiSecret?: string;
};

export async function executePlanJob(
  supabase: SupabaseClient,
  logger: pino.Logger,
  jobId: string
): Promise<string | null> {
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('job_id', jobId)
    .single();

  if (jobError || !job) throw new Error('Job not found');
  if (!job.plan_id) throw new Error('Job missing plan_id');

  const { data: plan, error: planError } = await supabase
    .from('trade_plans')
    .select('*')
    .eq('plan_id', job.plan_id)
    .single();

  if (planError || !plan) throw new Error('Trade plan not found');

  if (!['QUEUED', 'RUNNING'].includes(plan.state)) {
    logger.info({ planId: plan.plan_id, state: plan.state }, 'Plan not queued, skipping');
    return null;
  }

  const { data: existingExecution, error: existingError } = await supabase
    .from('executions')
    .select('exec_id')
    .eq('plan_id', plan.plan_id)
    .eq('user_id', job.user_id)
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingExecution?.exec_id) {
    logger.info({ planId: plan.plan_id, execId: existingExecution.exec_id }, 'Execution exists');
    return null;
  }

  if (plan.state !== 'RUNNING') {
    const { error: stateError } = await supabase
      .from('trade_plans')
      .update({ state: 'RUNNING' })
      .eq('plan_id', plan.plan_id)
      .eq('user_id', job.user_id);

    if (stateError) throw stateError;
  }

  const payload = (job.payload ?? {}) as JobPayload;
  const dryRun = payload.dry_run ?? false;

  const { data: connection, error: connectionError } = await supabase
    .from('exchange_connections')
    .select('*')
    .eq('id', payload.exchange_connection_id)
    .eq('user_id', job.user_id)
    .single();

  if (connectionError || !connection) {
    throw new Error('Exchange connection not found');
  }

  let secret: VaultSecret | null = null;
  if (connection.vault_secret_id) {
    const { data: vaultRow, error: vaultError } = await supabase
      .from('vault.decrypted_secrets')
      .select('secret')
      .eq('id', connection.vault_secret_id)
      .maybeSingle();

    if (vaultError) {
      throw new Error(`Failed to read vault secret: ${vaultError.message}`);
    }

    if (vaultRow?.secret) {
      try {
        secret = JSON.parse(vaultRow.secret) as VaultSecret;
      } catch {
        throw new Error('Vault secret is not valid JSON');
      }
    }
  }

  if (!dryRun) {
    if (!secret?.apiKey || !secret?.apiSecret) {
      throw new Error('Missing Binance API credentials in Vault');
    }
  }

  if (!connection.is_enabled) {
    throw new Error('Exchange connection is disabled');
  }

  const executionPayload: Record<string, unknown> = {
    user_id: job.user_id,
    plan_id: plan.plan_id,
    exchange: plan.exchange ?? 'binance',
    venue: plan.venue ?? 'futures_usdt',
    symbol: plan.symbol,
    state: 'CLOSED',
    position: {},
    orders: [],
    fills: [],
    metrics: { dry_run: dryRun },
    audit: {
      strategy_version: plan.strategy_version,
      snapshot_refs: plan.snapshot_refs ?? [],
      note: dryRun ? 'Dry-run execution' : 'Live execution'
    }
  };

  if (!dryRun) {
    const sizing = (plan.decision as any)?.position ?? {};
    const qty = String(sizing.qty ?? '');
    const leverage = Number(sizing.leverage ?? 0);
    const marginMode = (sizing.margin_mode ?? 'ISOLATED') as 'ISOLATED' | 'CROSS';

    if (!qty || Number.isNaN(Number(qty))) {
      throw new Error('Invalid qty in decision.position');
    }
    if (!leverage || Number.isNaN(leverage)) {
      throw new Error('Invalid leverage in decision.position');
    }

    const binance = new BinanceProvider({
      apiKey: secret?.apiKey,
      apiSecret: secret?.apiSecret
    });

    await binance.setMarginType(plan.symbol, marginMode);
    await binance.setLeverage(plan.symbol, leverage);

    const order = await binance.createOrder({
      symbol: plan.symbol,
      side: plan.side === 'long' ? 'BUY' : 'SELL',
      type: 'MARKET',
      quantity: qty
    });

    executionPayload.orders = [order];
    executionPayload.fills = order?.fills ? [order.fills] : [];
    executionPayload.state = 'OPEN';
  }

  const { data: execRow, error: execError } = await supabase
    .from('executions')
    .insert(executionPayload)
    .select('exec_id')
    .single();
  if (execError) throw execError;

  const { data: execution } = await supabase
    .from('executions')
    .select('exec_id')
    .eq('plan_id', plan.plan_id)
    .eq('user_id', job.user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (execution?.exec_id && dryRun) {
    const { error: monitorError } = await supabase.from('jobs').insert({
      user_id: job.user_id,
      plan_id: plan.plan_id,
      type: 'MONITOR_POSITION',
      status: 'QUEUED',
      payload: {
        exec_id: execution.exec_id,
        poll_ms: 1500
      }
    });

    if (monitorError) throw monitorError;
  }

  const nextState = dryRun ? 'DONE' : 'RUNNING';
  const { error: planUpdateError } = await supabase
    .from('trade_plans')
    .update({ state: nextState })
    .eq('plan_id', plan.plan_id)
    .eq('user_id', job.user_id);

  if (planUpdateError) throw planUpdateError;

  logger.info({ planId: plan.plan_id }, 'Dry-run execution completed');
  return execRow?.exec_id ?? execution?.exec_id ?? null;
}
