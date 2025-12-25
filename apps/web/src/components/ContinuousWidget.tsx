'use client'

import React, { useState, useEffect } from 'react'
import { useTrading } from '../lib/contexts/TradingContext'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { RiskBanner } from './RiskBanner'
import { AccessibleDrawer } from './AccessibleDrawer'

export const ContinuousWidget: React.FC = () => {
  const { currentTab } = useTrading()
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'degraded' | 'unknown'>('unknown')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/runtime`)
        if (response.ok) {
          const data = await response.json()
          setSystemStatus(data.status === 'running' ? 'healthy' : 'degraded')
        }
      } catch (error) {
        setSystemStatus('degraded')
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const statusColor = systemStatus === 'healthy' ? 'text-green-400' :
                     systemStatus === 'degraded' ? 'text-yellow-400' : 'text-gray-400'

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Risk Banners - Very Compact */}
      <RiskBanner />

      {/* Minimal Status Bar */}
      <div className="flex items-center justify-between py-2 px-4 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            systemStatus === 'healthy' ? 'bg-green-400' :
            systemStatus === 'degraded' ? 'bg-yellow-400' : 'bg-gray-400'
          }`} />
          <span className={`text-sm font-medium ${statusColor}`}>
            System {systemStatus}
          </span>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
          aria-label="View system details"
        >
          <InformationCircleIcon className="h-3 w-3" />
          <span>Details</span>
        </button>
      </div>

      {/* Compact Market Overview - Only if on market/signals tab */}
      {(currentTab === 'market' || currentTab === 'signals') && (
        <div className="py-2 px-4 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">BTC/USDT</span>
            <span className="text-white font-medium">$45,230</span>
            <span className="text-green-400">+2.3%</span>
            <span className="text-gray-500">Score: 8.5</span>
          </div>
        </div>
      )}

      {/* System Details Drawer */}
      <AccessibleDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="System Status"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Status</label>
              <p className={`capitalize font-medium ${
                systemStatus === 'healthy' ? 'text-green-400' :
                systemStatus === 'degraded' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                {systemStatus}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Environment</label>
              <p className="text-white">Production</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Version</label>
              <p className="text-white">1.0.0</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Uptime</label>
              <p className="text-white">24h 30m</p>
            </div>
          </div>
        </div>
      </AccessibleDrawer>
    </div>
  )
}
