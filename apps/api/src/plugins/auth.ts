import { FastifyPluginAsync } from 'fastify'
import { env } from '../config/env'

// JWT payload structure
export interface User {
  sub: string
  email?: string
  role?: string
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: User
  }
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/health',
  '/auth/login',
  '/auth/verify-otp',
  '/auth/register',
  '/auth/resend-otp'
]

// Minimal JWT verification for strict mode
function verifyJwtMinimal(token: string): User | null {
  try {
    // Decode JWT payload (without verification for minimal mode)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    // Basic validation
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null
    if (payload.iss && env.SUPABASE_ISSUER && payload.iss !== env.SUPABASE_ISSUER) return null
    if (payload.aud && env.SUPABASE_AUDIENCE && payload.aud !== env.SUPABASE_AUDIENCE) return null

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role
    }
  } catch (error) {
    return null
  }
}

export const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip auth for public routes
    if (PUBLIC_ROUTES.some(route => request.url.startsWith(route))) {
      return
    }

    // Check for Authorization header
    const authHeader = request.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        error: 'Missing or invalid Authorization header',
        code: 'MISSING_AUTH_HEADER'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer '

    let user: User | null = null

    // Try JWKS verification if available (preferred method)
    if (env.SUPABASE_JWKS_URL) {
      try {
        // For now, fall back to minimal verification
        // In production, implement full JWKS verification
        user = verifyJwtMinimal(token)
      } catch (error) {
        console.error('JWKS verification failed:', error)
      }
    } else {
      // Fallback: minimal JWT validation
      user = verifyJwtMinimal(token)

      if (!user && env.VERIFY_JWT_STRICT !== false) {
        return reply.code(401).send({
          error: 'JWT verification failed',
          code: 'INVALID_TOKEN'
        })
      }
    }

    if (!user) {
      return reply.code(401).send({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      })
    }

    // Attach user to request
    request.user = user
  })
}
