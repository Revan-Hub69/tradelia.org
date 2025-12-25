import { binanceLogger, ERROR_TYPES, logError } from './logger'

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening circuit
  recoveryTimeout: number // Time in ms before trying to close circuit
  monitoringPeriod: number // Time window in ms for failure counting
  name: string // Circuit breaker name for logging
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Circuit is open, failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures: number = 0
  private lastFailureTime: number = 0
  private nextAttemptTime: number = 0
  private successCount: number = 0
  private config: CircuitBreakerConfig

  constructor(config: CircuitBreakerConfig) {
    this.config = config
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        // Circuit is open, fail fast
        throw new Error(`Circuit breaker '${this.config.name}' is OPEN`)
      } else {
        // Time to try half-open
        this.state = CircuitState.HALF_OPEN
        binanceLogger.info(`Circuit breaker '${this.config.name}' entering HALF_OPEN state`)
      }
    }

    try {
      const result = await fn()

      // Success - reset failures and close circuit if half-open
      this.onSuccess()

      return result
    } catch (error) {
      // Failure - record and potentially open circuit
      this.onFailure(error as Error)

      throw error
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failures = 0
    this.successCount++

    if (this.state === CircuitState.HALF_OPEN) {
      // Service recovered, close circuit
      this.state = CircuitState.CLOSED
      binanceLogger.info(`Circuit breaker '${this.config.name}' recovered, closing circuit`)
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(error: Error): void {
    this.failures++
    this.lastFailureTime = Date.now()

    // Check if we should open the circuit
    if (this.state === CircuitState.CLOSED && this.failures >= this.config.failureThreshold) {
      this.openCircuit()
    } else if (this.state === CircuitState.HALF_OPEN) {
      // Half-open attempt failed, go back to open
      this.openCircuit()
    }

    binanceLogger.warn({
      msg: `Circuit breaker '${this.config.name}' failure`,
      failureCount: this.failures,
      state: this.state,
      error: error.message
    })
  }

  /**
   * Open the circuit
   */
  private openCircuit(): void {
    this.state = CircuitState.OPEN
    this.nextAttemptTime = Date.now() + this.config.recoveryTimeout
    binanceLogger.error({
      msg: `Circuit breaker '${this.config.name}' OPENED`,
      failures: this.failures,
      nextAttemptIn: this.config.recoveryTimeout
    })
  }

  /**
   * Get current circuit breaker status
   */
  getStatus() {
    return {
      name: this.config.name,
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      successCount: this.successCount
    }
  }

  /**
   * Reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successCount = 0
    this.lastFailureTime = 0
    this.nextAttemptTime = 0
    binanceLogger.info(`Circuit breaker '${this.config.name}' manually reset`)
  }
}

/**
 * Backoff strategy for retries
 */
export class ExponentialBackoff {
  private attempt: number = 0
  private readonly baseDelay: number
  private readonly maxDelay: number
  private readonly maxAttempts: number
  private readonly jitter: boolean

  constructor(
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    maxAttempts: number = 5,
    jitter: boolean = true
  ) {
    this.baseDelay = baseDelay
    this.maxDelay = maxDelay
    this.maxAttempts = maxAttempts
    this.jitter = jitter
  }

  /**
   * Get next delay duration
   */
  getDelay(): number {
    if (this.attempt >= this.maxAttempts) {
      throw new Error('Max retry attempts exceeded')
    }

    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.attempt),
      this.maxDelay
    )

    // Add jitter to prevent thundering herd
    const jitteredDelay = this.jitter
      ? delay * (0.5 + Math.random() * 0.5) // ±50% jitter
      : delay

    this.attempt++

    return Math.floor(jitteredDelay)
  }

  /**
   * Reset the backoff counter
   */
  reset(): void {
    this.attempt = 0
  }

  /**
   * Check if more attempts are available
   */
  canRetry(): boolean {
    return this.attempt < this.maxAttempts
  }

  /**
   * Get current attempt number
   */
  getAttempt(): number {
    return this.attempt
  }
}

/**
 * Pre-configured circuit breakers for different Binance endpoints
 */
export const binanceCircuitBreakers = {
  // REST API endpoints
  restApi: new CircuitBreaker({
    name: 'binance-rest-api',
    failureThreshold: 5, // Open after 5 consecutive failures
    recoveryTimeout: 60000, // Try again after 1 minute
    monitoringPeriod: 300000 // 5 minutes window
  }),

  // Futures API (more critical, stricter thresholds)
  futuresApi: new CircuitBreaker({
    name: 'binance-futures-api',
    failureThreshold: 3,
    recoveryTimeout: 30000, // Try again after 30 seconds
    monitoringPeriod: 300000
  }),

  // WebSocket connections
  websocket: new CircuitBreaker({
    name: 'binance-websocket',
    failureThreshold: 10, // WS can be more tolerant
    recoveryTimeout: 30000,
    monitoringPeriod: 600000 // 10 minutes window
  })
}

/**
 * Execute with circuit breaker and backoff
 */
export async function executeWithCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitBreaker: CircuitBreaker,
  backoff: ExponentialBackoff,
  operationName: string
): Promise<T> {
  let lastError: Error = new Error('Initial error')

  while (backoff.canRetry()) {
    try {
      return await circuitBreaker.execute(operation)
    } catch (error) {
      lastError = error as Error

      // Check if it's a rate limit or server error (retryable)
      const isRetryable = isRetryableError(error as Error)

      if (!isRetryable) {
        // Non-retryable error, fail immediately
        logError(error as Error, ERROR_TYPES.EXTERNAL_API_ERROR, {
          operation: operationName,
          attempt: backoff.getAttempt(),
          circuitBreaker: circuitBreaker.getStatus().name
        })
        throw error
      }

      // Wait before retry
      const delay = backoff.getDelay()
      binanceLogger.warn({
        msg: `Retrying ${operationName} after ${delay}ms`,
        attempt: backoff.getAttempt(),
        error: lastError.message,
        circuitBreaker: circuitBreaker.getStatus().name
      })

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // Max retries exceeded
  logError(lastError, ERROR_TYPES.EXTERNAL_API_ERROR, {
    operation: operationName,
    maxAttempts: backoff.getAttempt(),
    circuitBreaker: circuitBreaker.getStatus().name
  })

  throw lastError
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()

  // Rate limit errors
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
    return true
  }

  // Server errors (5xx)
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return true
  }

  // Network/timeout errors
  if (message.includes('timeout') || message.includes('network') || message.includes('connection')) {
    return true
  }

  // Binance specific errors
  if (message.includes('service unavailable') || message.includes('internal error')) {
    return true
  }

  return false
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus() {
  return {
    restApi: binanceCircuitBreakers.restApi.getStatus(),
    futuresApi: binanceCircuitBreakers.futuresApi.getStatus(),
    websocket: binanceCircuitBreakers.websocket.getStatus()
  }
}
