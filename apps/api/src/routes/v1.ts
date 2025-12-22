import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { BinanceProvider } from '../providers/binance';
import { averageTrueRange } from '../lib/indicators';
import { getSymbolFilters, roundToStep } from '../lib/exchange';
import { MODE_CONFIGS } from '@tradelia/shared';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const CreateConnectionSchema = z.object({
  exchange: z.string().default('binance'),
  venue: z.string().default('futures_usdt'),
  label: z.string().default('default'),
  api_key: z.string().min(8),
  api_secret: z.string().min(8),
  is_testnet: z.boolean().default(true),
  is_enabled: z.boolean().default(true)
});

const BuildPlanSchema = z.object({
  exchange_connection_id: z.string().uuid(),
  symbol: z.string(),
  mode: z.string(),
  side: z.enum(['long', 'short']),
  strategy_version: z.string().default('kernel-v1.0'),
  risk_pct: z.coerce.number().positive().max(0.05).default(0.003),
  max_leverage_user: z.coerce.number().positive().max(125).default(20)
});

const QueueJobSchema = z.object({
  type: z.enum(['EXECUTE_PLAN', 'MONITOR_POSITION', 'UPDATE_SLTP']),
  payload: z.record(z.string(), z.unknown()).optional().default({})
});

const QueuePlanSchema = z.object({
  dry_run: z.boolean().optional().default(false)
});

const UpdateSltpSchema = z.object({
  rule: z.string(),
  params: z.record(z.string(), z.unknown()).optional().default({})
});

const UniverseQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(500).default(200)
});

const FeatureQuerySchema = z.object({
  symbol: z.string(),
  limit: z.coerce.number().int().positive().max(500).default(50)
});

const getBearerToken = (authorization?: string) => {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const requireUserId = async (authorization?: string) => {
  const token = getBearerToken(authorization);
  if (!token) {
    return { error: 'Missing bearer token' } as const;
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { error: 'Invalid user token' } as const;
  }
  return { userId: data.user.id } as const;
};

export const v1Routes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/connections', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const { data, error } = await supabase
      .from('exchange_connections')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load connections' });
    }

    return { connections: data ?? [] };
  });

  fastify.post('/connections/binance', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const payload = CreateConnectionSchema.parse(request.body);
    const secretPayload = JSON.stringify({
      apiKey: payload.api_key,
      apiSecret: payload.api_secret
    });

    const { data: vaultRow, error: vaultError } = await supabase
      .from('vault.secrets')
      .insert({
        name: `binance-${auth.userId}-${payload.label}`,
        secret: secretPayload
      })
      .select('id')
      .single();

    if (vaultError || !vaultRow) {
      fastify.log.error(vaultError);
      return reply.code(500).send({ error: 'Failed to store Vault secret' });
    }

    const apiKeyHint = `***${payload.api_key.slice(-4)}`;
    const { data, error } = await supabase
      .from('exchange_connections')
      .insert({
        user_id: auth.userId,
        exchange: payload.exchange,
        venue: payload.venue,
        label: payload.label,
        api_key_public_hint: apiKeyHint,
        is_testnet: payload.is_testnet,
        is_enabled: payload.is_enabled,
        vault_secret_id: vaultRow.id
      })
      .select()
      .single();

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create connection' });
    }

    return reply.code(201).send({ connection: data });
  });

  fastify.delete('/connections/:id', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const { error } = await supabase
      .from('exchange_connections')
      .delete()
      .eq('id', params.id)
      .eq('user_id', auth.userId);

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete connection' });
    }

    return reply.code(204).send();
  });

  fastify.get('/universe', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const query = UniverseQuerySchema.parse(request.query ?? {});
    const { data, error } = await supabase
      .from('symbol_universe')
      .select('*')
      .order('asof_date', { ascending: false })
      .limit(query.limit);

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load universe' });
    }

    return { items: data ?? [] };
  });

  fastify.get('/features', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const query = FeatureQuerySchema.parse(request.query ?? {});
    const { data, error } = await supabase
      .from('feature_snapshots')
      .select('*')
      .eq('symbol', query.symbol)
      .order('ts', { ascending: false })
      .limit(query.limit);

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load features' });
    }

    return { snapshots: data ?? [] };
  });

  fastify.post('/plans/build', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const payload = BuildPlanSchema.parse(request.body);

    const { data: connection, error: connectionError } = await supabase
      .from('exchange_connections')
      .select('*')
      .eq('id', payload.exchange_connection_id)
      .eq('user_id', auth.userId)
      .single();

    if (connectionError || !connection) {
      return reply.code(404).send({ error: 'Exchange connection not found' });
    }

    const { data: featureSnapshot } = await supabase
      .from('feature_snapshots')
      .select('*')
      .eq('symbol', payload.symbol)
      .order('ts', { ascending: false })
      .limit(1)
      .maybeSingle();

    const binance = new BinanceProvider();
    const [exchangeInfo, klines] = await Promise.all([
      binance.getExchangeInfo(),
      binance.getKlines(payload.symbol, '15m', 55)
    ]);

    const atr14 = averageTrueRange(klines, 14);
    const lastClose = Number(klines[klines.length - 1]?.close ?? 0);

    if (!atr14 || !lastClose) {
      return reply.code(400).send({ error: 'Insufficient market data for ATR' });
    }

    const filters = getSymbolFilters(exchangeInfo, payload.symbol);
    if (!filters) {
      return reply.code(400).send({ error: 'Symbol filters not available' });
    }

    const { bid, ask } = await binance.getBestBidAsk(payload.symbol);
    const mid = bid > 0 && ask > 0 ? (bid + ask) / 2 : lastClose;

    const sideMultiplier = payload.side === 'long' ? 1 : -1;
    const slRaw = mid - sideMultiplier * atr14 * 2;
    const tp1Raw = mid + sideMultiplier * atr14 * 2;
    const tp2Raw = mid + sideMultiplier * atr14 * 3.5;

    const entryPrice = roundToStep(mid, filters.tickSize);
    const sl = roundToStep(slRaw, filters.tickSize);
    const tp1 = roundToStep(tp1Raw, filters.tickSize);
    const tp2 = roundToStep(tp2Raw, filters.tickSize);

    const { leverage_cap } =
      MODE_CONFIGS[payload.mode as keyof typeof MODE_CONFIGS] ?? MODE_CONFIGS.DEMO_REALISTIC;
    const maxLeverage = Math.min(payload.max_leverage_user, leverage_cap);

    const minNotional = filters.minNotional > 0 ? filters.minNotional : 10;
    const qtyRaw = (minNotional * 1.1) / entryPrice;
    const qty = roundToStep(qtyRaw, filters.stepSize);

    if (qty <= 0) {
      return reply.code(400).send({ error: 'Computed quantity is invalid' });
    }

    const gates = {
      gate0: {
        pass: Boolean(featureSnapshot?.quality?.lob_ok ?? false),
        reasons: featureSnapshot ? [] : ['missing_feature_snapshot']
      },
      gate1: { pass: true, regime: 'UNKNOWN' },
      gate2: { pass: true, setup: payload.mode },
      gate3: { pass: true },
      quality: featureSnapshot?.quality ?? {}
    };

    const inputs = {
      risk_pct: payload.risk_pct,
      max_leverage_user: payload.max_leverage_user,
      tier_policy: {},
      tf_set: ['15m']
    };

    const decision = {
      entry: { type: 'MARKET', price: entryPrice },
      risk: {
        stop: { type: 'STRUCTURE_ATR', atr_k: 2, buffer_bps: 0 },
        take_profit: [
          { r_multiple: 1.0, pct: 0.5 },
          { r_multiple: 2.0, pct: 0.3 }
        ],
        trailing: { type: 'ATR', atr_k: 1.2 },
        break_even: { at_r: 1.0, plus_fees_bps: 1.0 }
      },
      position: {
        qty,
        leverage: maxLeverage,
        margin_mode: 'ISOLATED'
      },
      kill_switch: {
        max_spread_bps: 8,
        min_resilience: 0.35,
        quality_fail_action: 'CLOSE'
      }
    };

    const { data, error } = await supabase
      .from('trade_plans')
      .insert({
        user_id: auth.userId,
        exchange_connection_id: payload.exchange_connection_id,
        exchange: connection.exchange,
        venue: connection.venue,
        symbol: payload.symbol,
        strategy_version: payload.strategy_version,
        mode: payload.mode,
        side: payload.side,
        state: 'DRAFT',
        gates,
        inputs,
        decision,
        snapshot_refs: featureSnapshot?.snapshot_id ? [featureSnapshot.snapshot_id] : []
      })
      .select()
      .single();

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to build plan' });
    }

    return reply.code(201).send({ plan: data });
  });

  fastify.post('/plans/:planId/queue', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const params = z.object({ planId: z.string().uuid() }).parse(request.params);
    const body = QueuePlanSchema.parse(request.body ?? {});

    const { data: plan, error: planError } = await supabase
      .from('trade_plans')
      .select('*')
      .eq('plan_id', params.planId)
      .eq('user_id', auth.userId)
      .single();

    if (planError || !plan) {
      return reply.code(404).send({ error: 'Plan not found' });
    }

    const { data: existingJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('plan_id', params.planId)
      .eq('user_id', auth.userId)
      .eq('type', 'EXECUTE_PLAN')
      .eq('status', 'QUEUED')
      .maybeSingle();

    if (existingJob) {
      return reply.code(200).send({ job: existingJob });
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: auth.userId,
        plan_id: params.planId,
        type: 'EXECUTE_PLAN',
        status: 'QUEUED',
        payload: {
          plan_id: params.planId,
          exchange_connection_id: plan.exchange_connection_id,
          symbol: plan.symbol,
          dry_run: body.dry_run ?? false
        }
      })
      .select()
      .single();

    if (jobError) {
      fastify.log.error(jobError);
      return reply.code(500).send({ error: 'Failed to queue plan' });
    }

    const { error: updateError } = await supabase
      .from('trade_plans')
      .update({ state: 'QUEUED' })
      .eq('plan_id', params.planId)
      .eq('user_id', auth.userId);

    if (updateError) {
      fastify.log.error(updateError);
    }

    return reply.code(201).send({ job });
  });

  fastify.post('/jobs', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const payload = QueueJobSchema.parse(request.body ?? {});
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        user_id: auth.userId,
        type: payload.type,
        status: 'QUEUED',
        payload: payload.payload
      })
      .select()
      .single();

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to enqueue job' });
    }

    return reply.code(201).send({ job });
  });

  fastify.get('/plans', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const { data, error } = await supabase
      .from('trade_plans')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load plans' });
    }

    return { plans: data ?? [] };
  });

  fastify.get('/executions', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const { data, error } = await supabase
      .from('executions')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load executions' });
    }

    return { executions: data ?? [] };
  });

  fastify.post('/executions/:execId/update-sltp', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const params = z.object({ execId: z.string().uuid() }).parse(request.params);
    const body = UpdateSltpSchema.parse(request.body ?? {});

    const { data: execution, error: execError } = await supabase
      .from('executions')
      .select('*')
      .eq('exec_id', params.execId)
      .eq('user_id', auth.userId)
      .single();

    if (execError || !execution) {
      return reply.code(404).send({ error: 'Execution not found' });
    }

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: auth.userId,
        plan_id: execution.plan_id,
        type: 'UPDATE_SLTP',
        status: 'QUEUED',
        payload: {
          exec_id: execution.exec_id,
          rule: body.rule,
          params: body.params
        }
      })
      .select()
      .single();

    if (jobError) {
      fastify.log.error(jobError);
      return reply.code(500).send({ error: 'Failed to queue SL/TP update' });
    }

    return reply.code(201).send({ job });
  });

  fastify.get('/jobs', async (request, reply) => {
    const auth = await requireUserId(request.headers.authorization);
    if ('error' in auth) {
      return reply.code(401).send({ error: auth.error });
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load jobs' });
    }

    return { jobs: data ?? [] };
  });
};
