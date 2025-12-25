'use client'

import React, { useState, useEffect } from 'react'
import { useTrading } from '../lib/contexts/TradingContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MarketTab } from './tabs/MarketTab'
import { SignalsTab } from './tabs/SignalsTab'
import { PositionsTab } from './tabs/PositionsTab'
import { JobsTab } from './tabs/JobsTab'
import {
  CpuChipIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  environment: string
  database: string
  circuitBreakers: {
    restApi: string
    futuresApi: string
    websocket: string
  }
  uptime: number
  memory: any
}

interface JobStatus {
  queued: number
  processing: number
  completed: number
  failed: number
  recentJobs: Array<{
    id: string
    type: string
    status: string
    createdAt: string
    planId?: string
  }>
}

interface QualityGates {
  gate0: { pass: boolean; reasons: string[] }
  gate1: { pass: boolean; regime: string }
  gate2: { pass: boolean; setup: string }
  gate3: { pass: boolean }
  quality: {
    lob_ok: boolean
    spread_bps: number
    depth_ok: boolean
    freshness_ms: number
  }
}

export const Dashboard: React.FC = () => {
  const { currentTab, sidebarOpen } = useTrading()
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [qualityGates, setQualityGates] = useState<QualityGates | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch system health data
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

        // Fetch runtime status
        const runtimeResponse = await fetch(`${apiUrl}/runtime`)
        if (runtimeResponse.ok) {
          const runtimeData = await runtimeResponse.json()
          setSystemHealth(runtimeData)
        }

        // Fetch job status (placeholder - would need backend endpoint)
        setJobStatus({
          queued: 2,
          processing: 1,
          completed: 15,
          failed: 0,
          recentJobs: [
            { id: '1', type: 'EXECUTE_PLAN', status: 'PROCESSING', createdAt: new Date().toISOString(), planId: 'plan-123' },
            { id: '2', type: 'MONITOR_POSITION', status: 'QUEUED', createdAt: new Date(Date.now() - 300000).toISOString() },
            { id: '3', type: 'EXECUTE_PLAN', status: 'COMPLETED', createdAt: new Date(Date.now() - 600000).toISOString(), planId: 'plan-456' }
          ]
        })

        // Mock quality gates data
        setQualityGates({
          gate0: { pass: true, reasons: [] },
          gate1: { pass: true, regime: 'BULLISH' },
          gate2: { pass: true, setup: 'BREAKOUT' },
          gate3: { pass: true },
          quality: {
            lob_ok: true,
            spread_bps: 2.5,
            depth_ok: true,
            freshness_ms: 150
          }
        })

        setLastUpdate(new Date())
      } catch (error) {
        console.error('Failed to fetch system data:', error)
      }
    }

    fetchSystemData()
    const interval = setInterval(fetchSystemData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'market':
        return <MarketTab />
      case 'signals':
        return <SignalsTab />
      case 'positions':
        return <PositionsTab />
      case 'jobs':
        return <JobsTab />
      default:
        return <MarketTab />
    }
  }

  const getCircuitBreakerColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'closed': return 'text-green-600'
      case 'open': return 'text-red-600'
      case 'half-open': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getJobStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600'
      case 'processing': return 'text-blue-600'
      case 'queued': return 'text-yellow-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex min-h-dvh bg-gray-50">
      {/* Sidebar - Hidden on mobile, drawer on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {}} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        // On mobile, no margin. On desktop, adjust based on sidebar
        'md:ml-16 md:data-[sidebar-open=true]:ml-64'
      }`} data-sidebar-open={sidebarOpen}>
        {/* Header */}
        <Header />

        {/* System Health Dashboard */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* System Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  systemHealth?.status === 'healthy' ? 'bg-green-500' :
                  systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium text-gray-900">System Status</span>
                <span className="text-sm text-gray-500 capitalize">{systemHealth?.status || 'unknown'}</span>
              </div>

              {/* Environment */}
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{systemHealth?.environment || 'unknown'}</span>
              </div>

              {/* Last Update */}
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Quality Gates & Circuit Breakers */}
            <div className="flex items-center space-x-6">
              {/* Quality Gates */}
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Gates</span>
                <div className="flex space-x-1">
                  {[0, 1, 2, 3].map(gate => {
                    const gateData = qualityGates?.[`gate${gate}` as keyof QualityGates]
                    const isPass = gateData && 'pass' in gateData ? gateData.pass : true
                    return (
                      <div key={gate} className={`w-2 h-2 rounded-full ${
                        isPass ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    )
                  })}
                </div>
              </div>

              {/* Circuit Breakers */}
              <div className="flex items-center space-x-2">
                <BoltIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Circuit Breakers</span>
                <div className="flex space-x-2 text-xs">
                  <span className={getCircuitBreakerColor(systemHealth?.circuitBreakers.restApi || 'unknown')}>
                    REST
                  </span>
                  <span className={getCircuitBreakerColor(systemHealth?.circuitBreakers.futuresApi || 'unknown')}>
                    FUTURES
                  </span>
                  <span className={getCircuitBreakerColor(systemHealth?.circuitBreakers.websocket || 'unknown')}>
                    WS
                  </span>
                </div>
              </div>

              {/* Job Queue */}
              <div className="flex items-center space-x-2">
                <PlayIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Jobs</span>
                <div className="flex space-x-3 text-xs">
                  <span className="text-yellow-600">{jobStatus?.queued || 0} queued</span>
                  <span className="text-blue-600">{jobStatus?.processing || 0} running</span>
                  <span className="text-green-600">{jobStatus?.completed || 0} done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderCurrentTab()}
        </main>
      </div>
    </div>
  )
}
