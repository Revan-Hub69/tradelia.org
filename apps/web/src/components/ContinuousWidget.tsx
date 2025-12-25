'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTrading } from '../lib/contexts/TradingContext'
import {
  CpuChipIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  ChartBarIcon,
  BoltIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import { Button } from './ui/Button'
import { RiskBanner } from './RiskBanner'
import { AccessibleDrawer } from './AccessibleDrawer'

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

interface MarketItem {
  symbol: string
  score: number
  price: number
  volume24h: number
  change24h: number
  liquidity: number
  volatility: number
}

const MicroHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 py-1 px-3 mb-2">
    {icon && <span className="text-gray-500" aria-hidden="true">{icon}</span>}
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
      {title}
    </span>
  </div>
)

const SystemStatusItem: React.FC<{
  icon: React.ReactNode
  label: string
  value: string | number
  status?: 'success' | 'warning' | 'error' | 'info'
  onClick?: () => void
}> = ({ icon, label, value, status = 'info', onClick }) => (
  <div
    className={`
      flex items-center gap-3 p-3 rounded-lg transition-all duration-200
      ${onClick ? 'cursor-pointer hover:bg-gray-800/50' : 'bg-gray-900/30'}
      border border-gray-800
    `}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
  >
    <div className={`flex-shrink-0 ${
      status === 'success' ? 'text-green-400' :
      status === 'warning' ? 'text-yellow-400' :
      status === 'error' ? 'text-red-400' : 'text-blue-400'
    }`} aria-hidden="true">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium text-white truncate">{value}</div>
    </div>
    {onClick && (
      <div className="flex-shrink-0 text-gray-400" aria-hidden="true">
        <EyeIcon className="h-4 w-4" />
      </div>
    )}
  </div>
)

const QualityGatesItem: React.FC<{ gates: QualityGates }> = ({ gates }) => (
  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-900/30 border border-gray-800">
    <div className="flex-shrink-0 text-blue-400" aria-hidden="true">
      <ChartBarIcon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <div className="text-xs text-gray-500 uppercase tracking-wider">Quality Gates</div>
      <div className="flex gap-1 mt-1">
        {[0, 1, 2, 3].map(gate => {
          const gateData = gates[`gate${gate}` as keyof QualityGates]
          const isPass = gateData && 'pass' in gateData ? gateData.pass : true
          return (
            <div
              key={gate}
              className={`w-2 h-2 rounded-full ${
                isPass ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={`Gate ${gate}: ${isPass ? 'Pass' : 'Fail'}`}
            />
          )
        })}
      </div>
    </div>
  </div>
)

const JobItem: React.FC<{
  job: JobStatus['recentJobs'][0]
  onClick?: () => void
}> = ({ job, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-blue-400'
      case 'queued': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircleSolidIcon className="h-3 w-3" />
      case 'processing': return <PlayIcon className="h-3 w-3" />
      case 'queued': return <ClockIcon className="h-3 w-3" />
      case 'failed': return <XCircleIcon className="h-3 w-3" />
      default: return <ClockIcon className="h-3 w-3" />
    }
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-gray-800/50' : 'bg-gray-900/30'}
        border border-gray-800
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={`flex-shrink-0 ${getStatusColor(job.status)}`} aria-hidden="true">
        {getStatusIcon(job.status)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wider">{job.type.replace('_', ' ')}</div>
        <div className="text-sm font-medium text-white truncate">
          {new Date(job.createdAt).toLocaleTimeString()}
        </div>
      </div>
      {onClick && (
        <div className="flex-shrink-0 text-gray-400" aria-hidden="true">
          <EyeIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}

const MarketItem: React.FC<{ item: MarketItem; onClick?: () => void }> = ({ item, onClick }) => (
  <div
    className={`
      flex items-center gap-3 p-3 rounded-lg transition-all duration-200
      ${onClick ? 'cursor-pointer hover:bg-gray-800/50' : 'bg-gray-900/30'}
      border border-gray-800
    `}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
  >
    <div className="flex-shrink-0">
      <div className={`w-2 h-2 rounded-full ${
        item.change24h > 0 ? 'bg-green-500' : item.change24h < 0 ? 'bg-red-500' : 'bg-gray-500'
      }`} aria-hidden="true" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-white">{item.symbol}</div>
      <div className="text-xs text-gray-500">${item.price.toFixed(2)}</div>
    </div>
    <div className="flex-shrink-0 text-right">
      <div className={`text-xs font-medium ${
        item.change24h > 0 ? 'text-green-400' : item.change24h < 0 ? 'text-red-400' : 'text-gray-400'
      }`}>
        {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(2)}%
      </div>
      <div className="text-xs text-gray-500">
        Score: {item.score.toFixed(1)}
      </div>
    </div>
    {onClick && (
      <div className="flex-shrink-0 text-gray-400" aria-hidden="true">
        <EyeIcon className="h-4 w-4" />
      </div>
    )}
  </div>
)

export const ContinuousWidget: React.FC = () => {
  const { currentTab } = useTrading()
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [qualityGates, setQualityGates] = useState<QualityGates | null>(null)
  const [marketData, setMarketData] = useState<MarketItem[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

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

        // Mock market data
        setMarketData([
          { symbol: 'BTCUSDT', score: 8.5, price: 45000, volume24h: 1250000, change24h: 2.34, liquidity: 85, volatility: 12 },
          { symbol: 'ETHUSDT', score: 7.9, price: 2800, volume24h: 890000, change24h: -0.8, liquidity: 78, volatility: 15 },
          { symbol: 'ADAUSDT', score: 6.2, price: 0.45, volume24h: 234000, change24h: 5.67, liquidity: 65, volatility: 22 }
        ])

        setLastUpdate(new Date())
      } catch (error) {
        console.error('Failed to fetch system data:', error)
      }
    }

    fetchSystemData()
    const interval = setInterval(fetchSystemData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getCircuitBreakerColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'closed': return 'success'
      case 'open': return 'error'
      case 'half-open': return 'warning'
      default: return 'info'
    }
  }

  const getJobStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success'
      case 'processing': return 'info'
      case 'queued': return 'warning'
      case 'failed': return 'error'
      default: return 'info'
    }
  }

  // Filter data based on current tab
  const filteredData = useMemo(() => {
    switch (currentTab) {
      case 'market':
        return marketData.slice(0, 6)
      case 'signals':
        return marketData.filter(item => item.score > 7).slice(0, 4)
      case 'positions':
        return marketData.filter(item => Math.abs(item.change24h) > 3).slice(0, 3)
      case 'jobs':
        return jobStatus?.recentJobs.slice(0, 4) || []
      default:
        return marketData.slice(0, 6)
    }
  }, [currentTab, marketData, jobStatus])

  const handleItemClick = (item: any, type: string) => {
    setSelectedItem({ ...item, type })
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Risk Banners */}
      <RiskBanner />

      {/* System Health Section */}
      <section>
        <MicroHeader title="System Status" icon={<CpuChipIcon className="h-3 w-3" />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SystemStatusItem
            icon={<div className={`w-2 h-2 rounded-full ${
              systemHealth?.status === 'healthy' ? 'bg-green-500' :
              systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />}
            label="System"
            value={systemHealth?.status || 'unknown'}
            status={systemHealth?.status === 'healthy' ? 'success' : 'error'}
          />
          <SystemStatusItem
            icon={<CpuChipIcon className="h-4 w-4" />}
            label="Environment"
            value={systemHealth?.environment || 'unknown'}
          />
          <SystemStatusItem
            icon={<ClockIcon className="h-4 w-4" />}
            label="Last Update"
            value={lastUpdate.toLocaleTimeString()}
          />
          <QualityGatesItem gates={qualityGates!} />
        </div>
      </section>

      {/* Circuit Breakers Section */}
      <section>
        <MicroHeader title="Circuit Breakers" icon={<BoltIcon className="h-3 w-3" />} />
        <div className="grid grid-cols-3 gap-3">
          <SystemStatusItem
            icon={<div className="w-2 h-2 rounded-full bg-green-500" />}
            label="REST API"
            value={systemHealth?.circuitBreakers.restApi || 'closed'}
            status={getCircuitBreakerColor(systemHealth?.circuitBreakers.restApi || 'closed')}
          />
          <SystemStatusItem
            icon={<div className="w-2 h-2 rounded-full bg-green-500" />}
            label="Futures API"
            value={systemHealth?.circuitBreakers.futuresApi || 'closed'}
            status={getCircuitBreakerColor(systemHealth?.circuitBreakers.futuresApi || 'closed')}
          />
          <SystemStatusItem
            icon={<div className="w-2 h-2 rounded-full bg-green-500" />}
            label="WebSocket"
            value={systemHealth?.circuitBreakers.websocket || 'closed'}
            status={getCircuitBreakerColor(systemHealth?.circuitBreakers.websocket || 'closed')}
          />
        </div>
      </section>

      {/* Job Queue Section */}
      <section>
        <MicroHeader title="Job Queue" icon={<PlayIcon className="h-3 w-3" />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <SystemStatusItem
            icon={<ClockIcon className="h-4 w-4" />}
            label="Queued"
            value={jobStatus?.queued || 0}
            status="warning"
          />
          <SystemStatusItem
            icon={<PlayIcon className="h-4 w-4" />}
            label="Processing"
            value={jobStatus?.processing || 0}
            status="info"
          />
          <SystemStatusItem
            icon={<CheckCircleSolidIcon className="h-4 w-4" />}
            label="Completed"
            value={jobStatus?.completed || 0}
            status="success"
          />
        </div>
        <div className="space-y-2">
          {jobStatus?.recentJobs.slice(0, 3).map(job => (
            <JobItem
              key={job.id}
              job={job}
              onClick={() => handleItemClick(job, 'job')}
            />
          ))}
        </div>
      </section>

      {/* Market Data Section */}
      {(currentTab === 'market' || currentTab === 'signals') && (
        <section>
          <MicroHeader
            title={currentTab === 'signals' ? 'High-Score Signals' : 'Market Overview'}
            icon={<ChartBarIcon className="h-3 w-3" />}
          />
          <div className="space-y-2">
            {filteredData.map((item: any) => (
              <MarketItem
                key={item.symbol}
                item={item}
                onClick={() => handleItemClick(item, 'market')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Accessible Drawer for details */}
      <AccessibleDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedItem?.type === 'job' ? 'Job Details' : 'Market Details'}
      >
        {selectedItem && (
          <div className="space-y-4">
            {selectedItem.type === 'job' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Type</label>
                    <p className="text-white">{selectedItem.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Status</label>
                    <p className={`capitalize ${
                      selectedItem.status === 'completed' ? 'text-green-400' :
                      selectedItem.status === 'processing' ? 'text-blue-400' :
                      selectedItem.status === 'queued' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedItem.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Created</label>
                    <p className="text-white">{new Date(selectedItem.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedItem.planId && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Plan ID</label>
                      <p className="text-white font-mono text-sm">{selectedItem.planId}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Symbol</label>
                    <p className="text-white font-medium">{selectedItem.symbol}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Score</label>
                    <p className="text-white">{selectedItem.score?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Price</label>
                    <p className="text-white">${selectedItem.price?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">24h Change</label>
                    <p className={`${
                      selectedItem.change24h > 0 ? 'text-green-400' :
                      selectedItem.change24h < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {selectedItem.change24h > 0 ? '+' : ''}{selectedItem.change24h?.toFixed(2) || 0}%
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Analysis
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </AccessibleDrawer>
    </div>
  )
}
