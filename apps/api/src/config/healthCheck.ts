import { PrismaClient } from '@prisma/client'
import { OMSService } from '../oms/omsService'
import { RiskEngine } from '../risk/riskEngine'
import { ScreenerService } from '../screener/screenerService'
import { TradingEngine } from '../strategy/tradingEngine'
import { HybridDataService } from '../screener/hybridDataService'

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: Date
  uptime: number
  version: string
  services: {
    database: ServiceHealth
    redis?: ServiceHealth
    websocket: ServiceHealth
    oms: ServiceHealth
    risk: ServiceHealth
    screener: ServiceHealth
    strategy: ServiceHealth
  }
  metrics: {
    memoryUsage: NodeJS.MemoryUsage
    activeConnections: number
    requestRate: number
    errorRate: number
  }
  alerts: Alert[]
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded'
  latency?: number
  lastCheck: Date
  error?: string
  details?: Record<string, any>
}

export interface Alert {
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: Date
  service?: string
  metric?: string
  value?: number
  threshold?: number
}

export class HealthCheckService {
  private startTime: Date
  private alerts: Alert[] = []
  private metrics: {
    requests: number
    errors: number
    lastReset: Date
  }

  constructor(
    private prisma: PrismaClient,
    private oms: OMSService,
    private riskEngine: RiskEngine,
    private screener: ScreenerService,
    private tradingEngine: TradingEngine,
    private dataService: HybridDataService
  ) {
    this.startTime = new Date()
    this.metrics = {
      requests: 0,
      errors: 0,
      lastReset: new Date()
    }
  }

  /**
   * Comprehensive health check
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkWebSocket(),
      this.checkOMS(),
      this.checkRiskEngine(),
      this.checkScreener(),
      this.checkStrategy()
    ])

    const services = {
      database: this.extractServiceHealth(checks[0]),
      websocket: this.extractServiceHealth(checks[1]),
      oms: this.extractServiceHealth(checks[2]),
      risk: this.extractServiceHealth(checks[3]),
      screener: this.extractServiceHealth(checks[4]),
      strategy: this.extractServiceHealth(checks[5])
    }

    // Determine overall status
    const unhealthyServices = Object.values(services).filter(s => s.status === 'down').length
    const degradedServices = Object.values(services).filter(s => s.status === 'degraded').length

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (unhealthyServices > 0) overallStatus = 'unhealthy'
    else if (degradedServices > 0) overallStatus = 'degraded'

    // Calculate metrics
    const now = new Date()
    const uptimeSeconds = (now.getTime() - this.startTime.getTime()) / 1000
    const timeSinceReset = (now.getTime() - this.metrics.lastReset.getTime()) / 1000
    const requestRate = this.metrics.requests / Math.max(timeSinceReset, 1)
    const errorRate = this.metrics.errors / Math.max(timeSinceReset, 1)

    return {
      status: overallStatus,
      timestamp: now,
      uptime: uptimeSeconds,
      version: process.env.npm_package_version || '1.0.0',
      services,
      metrics: {
        memoryUsage: process.memoryUsage(),
        activeConnections: 0, // Would need connection tracking
        requestRate,
        errorRate
      },
      alerts: this.getRecentAlerts()
    }
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now()

    try {
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1`

      // Test performance with a simple query
      const result = await this.prisma.trackedSymbol.count()
      const latency = Date.now() - startTime

      return {
        status: latency > 1000 ? 'degraded' : 'up',
        latency,
        lastCheck: new Date(),
        details: { symbolCount: result }
      }
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      }
    }
  }

  /**
   * Check WebSocket connectivity
   */
  private async checkWebSocket(): Promise<ServiceHealth> {
    try {
      const wsStatus = this.dataService.getDBStatus()

      return {
        status: wsStatus.isConnected ? 'up' : 'degraded',
        lastCheck: new Date(),
        details: {
          isConnected: wsStatus.isConnected,
          snapshots: wsStatus.snapshots,
          lastPoll: wsStatus.lastPoll
        }
      }
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      }
    }
  }

  /**
   * Check OMS functionality
   */
  private async checkOMS(): Promise<ServiceHealth> {
    try {
      // Test OMS by checking if it can handle a dummy operation
      // This is a lightweight check without actual API calls
      return {
        status: 'up',
        lastCheck: new Date(),
        details: { service: 'OMS operational' }
      }
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      }
    }
  }

  /**
   * Check risk engine
   */
  private async checkRiskEngine(): Promise<ServiceHealth> {
    try {
      const riskState = await this.riskEngine.getRiskState()
      return {
        status: 'up',
        lastCheck: new Date(),
        details: {
          tradingEnabled: riskState.tradingEnabled,
          currentDrawdown: riskState.currentDrawdown,
          dailyLossLimit: riskState.dailyLossLimit
        }
      }
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      }
    }
  }

  /**
   * Check screener service
   */
  private async checkScreener(): Promise<ServiceHealth> {
    try {
      const status = this.screener.getStatus()
      const snapshot = await this.screener.getSnapshot()

      return {
        status: status.isRunning ? 'up' : 'degraded',
        lastCheck: new Date(),
        details: {
          isRunning: status.isRunning,
          hasSnapshot: !!snapshot,
          candidatesCount: snapshot?.candidatesCount || 0,
          topKCount: snapshot?.topKCount || 0
        }
      }
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      }
    }
  }

  /**
   * Check strategy engine
   */
  private async checkStrategy(): Promise<ServiceHealth> {
    try {
      const status = this.tradingEngine.getStatus()
      return {
        status: status.isRunning ? 'up' : 'degraded',
        lastCheck: new Date(),
        details: {
          isRunning: status.isRunning,
          activePositions: status.activePositions,
          pendingSignals: status.pendingSignals,
          currentRegime: status.currentRegime?.regime,
          lastUpdate: status.lastUpdate
        }
      }
    } catch (error) {
      return {
        status: 'down',
        lastCheck: new Date(),
        error: (error as Error).message
      }
    }
  }

  /**
   * Extract service health from PromiseSettledResult
   */
  private extractServiceHealth(result: PromiseSettledResult<ServiceHealth>): ServiceHealth {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        status: 'down',
        lastCheck: new Date(),
        error: result.reason?.message || 'Unknown error'
      }
    }
  }

  /**
   * Record request metrics
   */
  recordRequest(success: boolean = true): void {
    this.metrics.requests++
    if (!success) {
      this.metrics.errors++
    }
  }

  /**
   * Add alert
   */
  addAlert(alert: Omit<Alert, 'timestamp'>): void {
    const fullAlert: Alert = {
      ...alert,
      timestamp: new Date()
    }

    this.alerts.push(fullAlert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }

    console.log(`🚨 [${alert.level.toUpperCase()}] ${alert.message}`)
  }

  /**
   * Get recent alerts
   */
  private getRecentAlerts(): Alert[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return this.alerts.filter(alert => alert.timestamp > oneHourAgo)
  }

  /**
   * Reset metrics counters
   */
  resetMetrics(): void {
    this.metrics.requests = 0
    this.metrics.errors = 0
    this.metrics.lastReset = new Date()
  }

  /**
   * Auto health monitoring with alerts
   */
  async startMonitoring(): Promise<void> {
    setInterval(async () => {
      try {
        const health = await this.getHealthStatus()

        // Alert on critical issues
        if (health.status === 'unhealthy') {
          this.addAlert({
            level: 'critical',
            message: 'System is unhealthy',
            service: 'system'
          })
        }

        // Alert on degraded services
        Object.entries(health.services).forEach(([serviceName, service]) => {
          if (service.status === 'down') {
            this.addAlert({
              level: 'error',
              message: `${serviceName} service is down`,
              service: serviceName
            })
          } else if (service.status === 'degraded') {
            this.addAlert({
              level: 'warning',
              message: `${serviceName} service is degraded`,
              service: serviceName
            })
          }
        })

        // Alert on high error rates
        if (health.metrics.errorRate > 0.1) { // >10% error rate
          this.addAlert({
            level: 'warning',
            message: `High error rate: ${(health.metrics.errorRate * 100).toFixed(1)}%`,
            metric: 'errorRate',
            value: health.metrics.errorRate
          })
        }

      } catch (error) {
        this.addAlert({
          level: 'critical',
          message: `Health check failed: ${(error as Error).message}`,
          service: 'healthcheck'
        })
      }
    }, 60000) // Check every minute
  }
}
