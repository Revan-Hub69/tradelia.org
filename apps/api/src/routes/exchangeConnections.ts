import { FastifyPluginAsync, FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'
import { BinanceRestClient } from '../exchange/binance/restClient'

// Supabase client for server-side operations
const supabase = createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Validation schemas
const CreateExchangeConnectionSchema = z.object({
  exchange: z.string().min(1),
  venue: z.string().min(1),
  label: z.string().min(1).default('default'),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  isTestnet: z.boolean().default(true),
  isEnabled: z.boolean().default(true)
})

const UpdateExchangeConnectionSchema = z.object({
  label: z.string().min(1).optional(),
  isTestnet: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  apiKey: z.string().min(1).optional(),
  apiSecret: z.string().min(1).optional()
})

// Simple encryption for API keys (in produzione usare Vault o KMS)
function encrypt(text: string): string {
  // Basic base64 encoding - in produzione implementare crittografia reale
  return Buffer.from(text).toString('base64')
}

function decrypt(encrypted: string): string {
  // Basic base64 decoding - in produzione implementare decrittografia reale
  return Buffer.from(encrypted, 'base64').toString()
}

export const exchangeConnectionsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  // GET /exchange-connections - Lista connections dell'utente
  fastify.get('/exchange-connections', async (request, reply) => {
    try {
      const userId = request.user?.sub

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' })
      }

      const { data, error } = await supabase
        .from('exchange_connections')
        .select('id, exchange, venue, label, api_key_public_hint, is_testnet, is_enabled, created_at, updated_at')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching exchange connections:', error)
        return reply.code(500).send({ error: 'Failed to fetch exchange connections' })
      }

      return reply.code(200).send({
        connections: data || []
      })

    } catch (error) {
      console.error('Exchange connections fetch error:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // POST /exchange-connections - Crea nuova connection
  fastify.post('/exchange-connections', async (request, reply) => {
    try {
      const userId = request.user?.sub
      const payload = CreateExchangeConnectionSchema.parse(request.body)

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' })
      }

      // Test the connection before saving
      try {
        if (payload.exchange === 'binance') {
          const testClient = new BinanceRestClient(payload.isTestnet ? 'testnet' : 'live')

          // Test with a simple API call (account info requires auth)
          await testClient.getAccount(payload.apiKey, payload.apiSecret)
        }
      } catch (testError: any) {
        console.warn('Exchange connection test failed:', testError.message)
        return reply.code(400).send({
          error: 'Connection test failed',
          details: testError.message
        })
      }

      // Create public hint for the API key (first 4 + last 4 chars)
      const apiKeyHint = `${payload.apiKey.substring(0, 4)}...${payload.apiKey.substring(payload.apiKey.length - 4)}`

      const { data, error } = await supabase
        .from('exchange_connections')
        .insert({
          user_id: userId,
          exchange: payload.exchange,
          venue: payload.venue,
          label: payload.label,
          api_key_public_hint: apiKeyHint,
          is_testnet: payload.isTestnet,
          is_enabled: payload.isEnabled
          // Note: In production, store encrypted keys in Vault, not DB
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating exchange connection:', error)
        return reply.code(500).send({ error: 'Failed to create exchange connection' })
      }

      return reply.code(201).send({
        connection: {
          id: data.id,
          exchange: data.exchange,
          venue: data.venue,
          label: data.label,
          apiKeyHint: data.api_key_public_hint,
          isTestnet: data.is_testnet,
          isEnabled: data.is_enabled,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        },
        message: 'Exchange connection created successfully'
      })

    } catch (error) {
      console.error('Exchange connection creation error:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // PUT /exchange-connections/:id - Aggiorna connection
  fastify.put('/exchange-connections/:id', async (request, reply) => {
    try {
      const userId = request.user?.sub
      const { id } = request.params as { id: string }
      const payload = UpdateExchangeConnectionSchema.parse(request.body)

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' })
      }

      // First check if the connection belongs to the user
      const { data: existing, error: fetchError } = await supabase
        .from('exchange_connections')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !existing) {
        return reply.code(404).send({ error: 'Exchange connection not found' })
      }

      const updateData: any = {}
      if (payload.label !== undefined) updateData.label = payload.label
      if (payload.isTestnet !== undefined) updateData.is_testnet = payload.isTestnet
      if (payload.isEnabled !== undefined) updateData.is_enabled = payload.isEnabled

      const { data, error } = await supabase
        .from('exchange_connections')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating exchange connection:', error)
        return reply.code(500).send({ error: 'Failed to update exchange connection' })
      }

      return reply.code(200).send({
        connection: {
          id: data.id,
          exchange: data.exchange,
          venue: data.venue,
          label: data.label,
          apiKeyHint: data.api_key_public_hint,
          isTestnet: data.is_testnet,
          isEnabled: data.is_enabled,
          updatedAt: data.updated_at
        },
        message: 'Exchange connection updated successfully'
      })

    } catch (error) {
      console.error('Exchange connection update error:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // DELETE /exchange-connections/:id - Elimina connection
  fastify.delete('/exchange-connections/:id', async (request, reply) => {
    try {
      const userId = request.user?.sub
      const { id } = request.params as { id: string }

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' })
      }

      const { error } = await supabase
        .from('exchange_connections')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting exchange connection:', error)
        return reply.code(500).send({ error: 'Failed to delete exchange connection' })
      }

      return reply.code(200).send({
        message: 'Exchange connection deleted successfully'
      })

    } catch (error) {
      console.error('Exchange connection deletion error:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })

  // POST /exchange-connections/:id/test - Test connection
  fastify.post('/exchange-connections/:id/test', async (request, reply) => {
    try {
      const userId = request.user?.sub
      const { id } = request.params as { id: string }

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' })
      }

      // Get connection details (in produzione recuperare chiavi da Vault)
      const { data: connection, error: fetchError } = await supabase
        .from('exchange_connections')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (fetchError || !connection) {
        return reply.code(404).send({ error: 'Exchange connection not found' })
      }

      // For now, we can't test without the actual keys (stored securely)
      // In production, retrieve from Vault and test
      return reply.code(200).send({
        success: true,
        message: 'Connection test not implemented yet (requires secure key retrieval)'
      })

    } catch (error) {
      console.error('Exchange connection test error:', error)
      return reply.code(500).send({ error: 'Internal server error' })
    }
  })
}
