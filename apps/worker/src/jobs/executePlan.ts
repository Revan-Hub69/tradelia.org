import { PrismaClient } from '@prisma/client';
import pino from 'pino';
import { BinanceProvider } from '../providers/binance';

export async function executePlanJob(
  prisma: PrismaClient,
  logger: pino.Logger,
  jobId: string
) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error('Job not found');

  if (!job.planId) throw new Error('Job missing planId');

  const plan = await prisma.tradePlan.findUnique({ where: { id: job.planId } });
  if (!plan) throw new Error('Trade plan not found');

  // Basic plan checks
  if (plan.status !== 'PENDING') {
    logger.info({ planId: plan.id, status: plan.status }, 'Plan not pending, skipping');
    return;
  }

  const sizing = plan.sizing as any;
  const entry = plan.entry as any;

  const symbol = plan.symbol;
  const side = plan.side === 'LONG' ? 'BUY' : 'SELL';

  const qty = String(sizing?.qty ?? '');
  const leverage = Number(sizing?.leverage ?? 0);
  const marginType = (sizing?.marginType ?? 'ISOLATED') as 'ISOLATED' | 'CROSS';

  if (!qty || Number.isNaN(Number(qty))) throw new Error('Invalid quantity in plan.sizing.qty');
  if (!leverage || Number.isNaN(leverage)) throw new Error('Invalid leverage in plan.sizing.leverage');

  // We keep v1 to MARKET only (as in shared schema)
  const orderType = 'MARKET' as const;

  const binance = new BinanceProvider();

  logger.info({ symbol, leverage, marginType }, 'Setting margin/leverage');
  await binance.setMarginType(symbol, marginType);
  await binance.setLeverage(symbol, leverage);

  logger.info({ symbol, side, orderType, qty }, 'Placing entry order');
  const res = await binance.createOrder({
    symbol,
    side,
    type: orderType,
    quantity: qty,
    clientOrderId: job.requestId
  });

  // Persist order
  await prisma.order.create({
    data: {
      planId: plan.id,
      clientOrderId: job.requestId,
      binanceOrderId: res?.orderId ? String(res.orderId) : null,
      symbol,
      side,
      type: orderType,
      quantity: qty,
      price: res?.avgPrice ? String(res.avgPrice) : (entry?.price ? String(entry.price) : null),
      stopPrice: null,
      status: String(res?.status ?? 'NEW'),
      fills: res ?? null
    }
  });

  // Mark plan executed (v1 = entry only; SL/TP management comes next)
  await prisma.tradePlan.update({
    where: { id: plan.id },
    data: { status: 'EXECUTED' }
  });

  logger.info({ planId: plan.id, binanceOrderId: res?.orderId }, 'Execution completed');
}
