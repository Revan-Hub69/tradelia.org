import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const FeatureQuerySchema = z.object({
  symbol: z.string(),
  limit: z.coerce.number().int().positive().max(500).default(50)
});

export const featureSnapshotsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const query = FeatureQuerySchema.parse(request.query ?? {});
    try {
      // Prefer Prisma (feature_snapshots table). If Prisma model isn't available, fall back to Supabase.
      if ((fastify as any).prisma?.featureSnapshot) {
        const snapshots = await (fastify as any).prisma.featureSnapshot.findMany({
          where: { symbol: query.symbol },
          orderBy: { ts: 'desc' },
          take: query.limit
        });
        return { snapshots };
      }

      // Fallback to Supabase
      const supabase = (fastify as any).supabase;
      if (!supabase) {
        fastify.log.error('No DB client available for feature snapshots');
        return reply.code(500).send({ error: 'No DB client available' });
      }

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
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: 'Failed to load features' });
    }
  });
};
