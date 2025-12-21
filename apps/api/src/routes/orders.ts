import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { BinanceProvider } from '../providers/binance';

const CreateOrderSchema = z.object({
  symbol: z.string(),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT', 'STOP_MARKET']),
  quantity: z.string(),
  price: z.string().optional(),
  stopPrice: z.string().optional(),
  clientOrderId: z.string().optional(),
  reduceOnly: z.boolean().optional()
});

const ModifyOrderSchema = z.object({
  symbol: z.string(),
  orderId: z.string().optional(),
  origClientOrderId: z.string().optional(),
  side: z.enum(['BUY', 'SELL']).optional(),
  price: z.string().optional(),
  quantity: z.string().optional(),
  stopPrice: z.string().optional()
}).refine((data) => data.orderId || data.origClientOrderId, {
  message: 'orderId or origClientOrderId is required'
});

const CancelOrderSchema = z.object({
  symbol: z.string(),
  orderId: z.string()
});

const OrderStatusQuerySchema = z.object({
  symbol: z.string(),
  orderId: z.string().optional(),
  clientOrderId: z.string().optional()
}).refine((data) => data.orderId || data.clientOrderId, {
  message: 'orderId or clientOrderId is required'
});

export const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  const binance = new BinanceProvider();

  fastify.post('/', async (request, reply) => {
    try {
      const body = CreateOrderSchema.parse(request.body);

      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });

      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }

      const response = await binance.createOrder(body);

      return reply.code(201).send({
        order: response,
        session_id: session.id
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Failed to create order' });
    }
  });

  fastify.patch('/', async (request, reply) => {
    try {
      const body = ModifyOrderSchema.parse(request.body);

      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });

      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }

      const response = await binance.modifyOrder(body);

      return reply.send({
        order: response,
        session_id: session.id
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Failed to modify order' });
    }
  });

  fastify.delete('/', async (request, reply) => {
    try {
      const body = CancelOrderSchema.parse(request.body);

      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });

      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }

      await binance.cancelOrder(body.symbol, body.orderId);

      return reply.code(200).send({
        status: 'CANCELLED',
        session_id: session.id
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Failed to cancel order' });
    }
  });

  fastify.get('/status', async (request, reply) => {
    try {
      const { symbol, orderId, clientOrderId } = OrderStatusQuerySchema.parse(request.query);

      const session = await fastify.prisma.session.findFirst({
        where: { status: 'RUNNING' }
      });

      if (!session) {
        return reply.code(400).send({ error: 'No active session' });
      }

      const order = await binance.getOrder(symbol, orderId, clientOrderId);

      return reply.send({
        order,
        session_id: session.id
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: 'Failed to fetch order status' });
    }
  });
};
