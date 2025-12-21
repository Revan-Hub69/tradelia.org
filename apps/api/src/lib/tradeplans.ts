import { TradePlanSchema } from '@tradelia/shared';
import type { TradePlan } from '@prisma/client';

type TradePlanRecord = TradePlan;

export const isPlanExpired = (plan: TradePlanRecord, now = Date.now()): boolean => {
  if (!plan.gates || typeof plan.gates !== 'object') {
    return false;
  }

  const gates = plan.gates as { expires_at?: number };
  if (typeof gates.expires_at !== 'number') {
    return false;
  }

  return gates.expires_at <= now;
};

export const serializeTradePlan = (plan: TradePlanRecord) => {
  const payload = {
    plan_id: plan.id,
    session_id: plan.sessionId,
    env: plan.env,
    mode: plan.mode,
    screener_profile: plan.screenerProfile,
    symbol: plan.symbol,
    side: plan.side,
    entry: plan.entry,
    risk: plan.risk,
    sizing: plan.sizing,
    gates: plan.gates,
    why: plan.why,
    metrics: plan.metrics
  };

  return TradePlanSchema.parse(payload);
};
