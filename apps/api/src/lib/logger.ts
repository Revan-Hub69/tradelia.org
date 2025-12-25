import pino from 'pino'
import { env } from '../config/env'

// Error taxonomy for consistent error classification
export const ERROR_TYPES = {
  // Binance API errors
  BINANCE_RATE_LIMIT: 'BINANCE_RATE_LIMIT',
  BINANCE_INVALID_API_KEY: 'BINANCE_INVALID_API_KEY',
  BINANCE_INSUFFICIENT_BALANCE: 'BINANCE_INSUFFICIENT_BALANCE',
  BINANCE_ORDER_REJECTED: 'BINANCE_ORDER_REJECTED',
  BINANCE_NETWORK_ERROR: 'BINANCE_NETWORK_ERROR',

  // WebSocket errors
  WS_CONNECTION_LOST: 'WS_CONNECTION_LOST',
  WS_INVALID_MESSAGE: 'WS_INVALID_MESSAGE',
  WS_SUBSCRIBE_FAILED: 'WS_SUBSCRIBE_FAILED',
  WS_DESYNC_DETECTED: 'WS_DESYNC_DETECTED',

  // Database errors
  DB_CONNECTION_LOST: 'DB_CONNECTION_LOST',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_MIGRATION_MISSING: 'DB_MIGRATION_MISSING',

  // Authentication errors
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // OMS errors
  OMS_JOB_LOCK_FAILED: 'OMS_JOB_LOCK_FAILED',
  OMS_ORDER_FAILED: 'OMS_ORDER_FAILED',
  OMS_RISK_VIOLATION: 'OMS_RISK_VIOLATION',

  // General errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR'
} as const

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES]

// Create logger instance with appropriate configuration
export const logger = pino({
  level: env.LOG_LEVEL,
  formatters: {
    level: (label: string) => {
      return { level: label }
    },
  },
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  // Add correlation ID to all logs
  mixin() {
    return {
      correlationId: getCorrelationId(),
      service: 'tradelia-api',
      env: env.EXCHANGE_ENV,
      version: '1.0.0'
    }
  }
})

// Correlation ID management (stored in async local storage)
const correlationIdStore = new Map<string, string>()

export function setCorrelationId(id: string): void {
  const asyncId = getCurrentAsyncId()
  correlationIdStore.set(asyncId, id)
}

export function getCorrelationId(): string | undefined {
  const asyncId = getCurrentAsyncId()
  return correlationIdStore.get(asyncId)
}

export function clearCorrelationId(): void {
  const asyncId = getCurrentAsyncId()
  correlationIdStore.delete(asyncId)
}

// Generate correlation ID for new requests
export function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper to get current async execution context ID
function getCurrentAsyncId(): string {
  // In production, use async_hooks for proper async context tracking
  // For now, use a simple fallback
  return 'main'
}

// Request logging middleware for Fastify
export function createRequestLogger() {
  return {
    logRequest: (req: any, res: any) => {
      const correlationId = generateCorrelationId()
      setCorrelationId(correlationId)

      logger.info({
        msg: 'Request started',
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      })

      // Clear correlation ID when response ends
      res.on('finish', () => {
        logger.info({
          msg: 'Request completed',
          statusCode: res.statusCode,
          responseTime: res.getResponseTime()
        })
        clearCorrelationId()
      })
    }
  }
}

// Specialized loggers for different components
export const dbLogger = logger.child({ component: 'database' })
export const wsLogger = logger.child({ component: 'websocket' })
export const apiLogger = logger.child({ component: 'api' })
export const omsLogger = logger.child({ component: 'oms' })
export const binanceLogger = logger.child({ component: 'binance' })

// Helper functions for common logging patterns
export const logError = (
  error: Error | string,
  errorType: ErrorType,
  context?: Record<string, any>
) => {
  const errorObj = error instanceof Error ? error : new Error(error)

  logger.error({
    msg: 'Error occurred',
    error: errorObj.message,
    stack: errorObj.stack,
    errorType,
    ...context
  })
}

export const logWarn = (
  message: string,
  context?: Record<string, any>
) => {
  logger.warn({
    msg: message,
    ...context
  })
}

export const logInfo = (
  message: string,
  context?: Record<string, any>
) => {
  logger.info({
    msg: message,
    ...context
  })
}

export const logDebug = (
  message: string,
  context?: Record<string, any>
) => {
  logger.debug({
    msg: message,
    ...context
  })
}

// Performance logging
export const startTimer = (label: string) => {
  return { label, startTime: Date.now() }
}

export const endTimer = (timer: { label: string; startTime: number }, context?: Record<string, any>) => {
  const duration = Date.now() - timer.startTime
  logger.info({
    msg: `Timer: ${timer.label}`,
    duration,
    ...context
  })
  return duration
}
