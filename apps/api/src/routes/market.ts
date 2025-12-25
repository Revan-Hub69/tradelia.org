import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { ScreenerService } from '../screener/screenerService'
import { TradingEngine } from '../strategy/tradingEngine'
import { env } from '../config/env'
import { apiLogger } from '../lib/logger'

const supabase = createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const marketRoutes: FastifyPluginAsync = async (fastify) => {
  const prisma = new PrismaClient()
  const screenerService = new ScreenerService(prisma)

  // GET /market/snapshot - Screener data for frontend
  fastify.get('/snapshot', async (request, reply) => {
    try {
      apiLogger.info('Market snapshot requested')

      // Get latest screener data from database
      const { data: snapshots, error } = await supabase
        .from('feature_snapshots')
        .select('*')
        .order('ts', { ascending: false })
        .limit(100)

      if (error) {
        apiLogger.error({
          msg: 'Error fetching market snapshot',
          error
        })
        return reply.code(500).send({ error: 'Failed to fetch market data' })
      }

      // Transform data to match expected format
      const symbols = snapshots?.map(snapshot => ({
        symbol: snapshot.symbol,
        score: snapshot.score || 0,
        price: snapshot.price || 0,
        volume: snapshot.volume_24h || 0,
        change24h: snapshot.price_change_24h || 0,
        liquidity: snapshot.liquidity_score || 0,
        volatility: snapshot.volatility_score || 0,
        // Add other fields as needed
      })) || []

      return {
        success: true,
        snapshot: {
          timestamp: new Date().toISOString(),
          symbols,
          totalSymbols: symbols.length
        }
      }
    } catch (error) {
      apiLogger.error({
        msg: 'Market snapshot error',
        error: error as Error
      })
      return reply.code(500).send({
        success: false,
        error: 'Failed to get market snapshot'
      })
    }
  })

  // GET /market/symbols - Available trading symbols
  fastify.get('/symbols', async (request, reply) => {
    try {
      apiLogger.info('Symbols list requested')

      // Get available trading symbols
      const { data: symbols, error } = await supabase
        .from('symbol_universe')
        .select('symbol, base_asset, quote_asset, status')
        .eq('status', 'TRADING')
        .order('symbol')
        .limit(1000)

      if (error) {
        apiLogger.error({
          msg: 'Error fetching symbols',
          error
        })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch symbols'
        })
      }

      return {
        success: true,
        symbols: symbols || [],
        total: symbols?.length || 0
      }
    } catch (error) {
      apiLogger.error({
        msg: 'Symbols endpoint error',
        error: error as Error
      })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
  })

  // GET /market/features/:symbol - Feature snapshots for symbol
  fastify.get('/features/:symbol', async (request, reply) => {
    const params = request.params as { symbol: string }
    const query = request.query as { limit?: string }

    try {
      apiLogger.info({
        msg: 'Features requested',
        symbol: params.symbol
      })

      const limit = parseInt(query.limit || '50', 10)

      const { data: snapshots, error } = await supabase
        .from('feature_snapshots')
        .select('*')
        .eq('symbol', params.symbol)
        .order('ts', { ascending: false })
        .limit(limit)

      if (error) {
        apiLogger.error({
          msg: 'Error fetching features',
          symbol: params.symbol,
          error
        })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch features'
        })
      }

      return {
        success: true,
        snapshots: snapshots || [],
        total: snapshots?.length || 0
      }
    } catch (error) {
      apiLogger.error({
        msg: 'Features endpoint error',
        symbol: params.symbol,
        error: error as Error
      })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
  })

  // GET /market/universe - Symbol universe with tiers
  fastify.get('/universe', async (request, reply) => {
    const query = request.query as { limit?: string }

    try {
      apiLogger.info('Universe requested')

      const limit = parseInt(query.limit || '200', 10)

      const { data: universe, error } = await supabase
        .from('symbol_universe')
        .select('*')
        .order('asof_date', { ascending: false })
        .limit(limit)

      if (error) {
        apiLogger.error({
          msg: 'Error fetching universe',
          error
        })
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch universe'
        })
      }

      return {
        success: true,
        items: universe || [],
        total: universe?.length || 0
      }
    } catch (error) {
      apiLogger.error({
        msg: 'Universe endpoint error',
        error: error as Error
      })
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      })
    }
  })

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
}
