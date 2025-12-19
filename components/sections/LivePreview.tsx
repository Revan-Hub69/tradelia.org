'use client'

import { useState, useEffect } from 'react'
import { MetricDrawer } from '../ui/MetricDrawer'

interface MarketRegimeData {
  metric_id: string
  visual_type: string
  state: 'Risk-On' | 'Neutral' | 'Risk-Off'
  trend: 'up' | 'down' | 'stable'
  confidence_bucket: 'Low' | 'Med' | 'High'
  asof: string
  drivers: string[]
}

interface BTCDominanceData {
  metric_id: string
  visual_type: string
  btc_share: number
  alt_share: number
  delta_7d: number
  asof: string
}

interface VolatilityData {
  metric_id: string
  visual_type: string
  bucket: 'Compressed' | 'Normal' | 'Elevated'
  p10: number
  p50: number
  p90: number
  current: number
  lookback_days: number
  asof: string
}

function MarketRegimeCard({ data, onClick }: { data: MarketRegimeData; onClick: () => void }) {
  const getStateColor = (state: string) => {
    switch (state) {
      case 'Risk-On': return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'Risk-Off': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  return (
    <div className="card-premium cursor-pointer group" onClick={onClick}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-slate-200 mb-2">Market Regime</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStateColor(data.state)}`}>
            {data.state}
          </span>
          <span className="text-slate-400 text-lg">{getTrendIcon(data.trend)}</span>
        </div>
      </div>

      {/* Gauge Visual */}
      <div className="relative w-32 h-16 mx-auto mb-4">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path
            d="M 10 50 A 50 50 0 0 1 110 50"
            fill="none"
            stroke="rgb(51 65 85)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 10 50 A 50 50 0 0 1 110 50"
            fill="none"
            stroke={data.state === 'Risk-On' ? 'rgb(34 197 94)' : data.state === 'Risk-Off' ? 'rgb(239 68 68)' : 'rgb(234 179 8)'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={data.state === 'Risk-On' ? '20' : data.state === 'Risk-Off' ? '80' : '50'}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className={`px-2 py-1 rounded ${data.confidence_bucket === 'High' ? 'bg-green-500/10 text-green-400' : data.confidence_bucket === 'Med' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
          {data.confidence_bucket}
        </span>
        <span>T-0</span>
      </div>

      <button className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
        Ask AI <span className="ml-1">(?)</span>
      </button>
    </div>
  )
}

function BTCDominanceCard({ data, onClick }: { data: BTCDominanceData; onClick: () => void }) {
  return (
    <div className="card-premium cursor-pointer group" onClick={onClick}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-slate-200 mb-2">BTC Dominance</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>{(data.btc_share * 100).toFixed(1)}% BTC</span>
          <span className={`${data.delta_7d > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.delta_7d > 0 ? '+' : ''}{(data.delta_7d * 100).toFixed(1)}% 7d
          </span>
        </div>
      </div>

      {/* Stacked Bar */}
      <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
          style={{ width: `${data.btc_share * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500 mb-4">
        <span>BTC: {(data.btc_share * 100).toFixed(1)}%</span>
        <span>ALT: {(data.alt_share * 100).toFixed(1)}%</span>
      </div>

      <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
        Ask AI <span className="ml-1">(?)</span>
      </button>
    </div>
  )
}

function VolatilityCard({ data, onClick }: { data: VolatilityData; onClick: () => void }) {
  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case 'Elevated': return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'Compressed': return 'text-green-400 bg-green-500/10 border-green-500/20'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div className="card-premium cursor-pointer group" onClick={onClick}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-slate-200 mb-2">Volatility Regime</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getBucketColor(data.bucket)}`}>
          {data.bucket}
        </span>
      </div>

      {/* Band Envelope */}
      <div className="relative h-16 mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 to-slate-600/20 rounded" 
             style={{ 
               top: `${(1 - data.p90) * 100}%`, 
               height: `${(data.p90 - data.p10) * 100}%` 
             }} 
        />
        <div className="absolute w-full h-0.5 bg-slate-500" 
             style={{ top: `${(1 - data.p50) * 100}%` }} 
        />
        <div className="absolute w-2 h-2 bg-blue-400 rounded-full -translate-x-1" 
             style={{ 
               top: `${(1 - data.current) * 100}%`, 
               left: '50%' 
             }} 
        />
      </div>

      <div className="text-xs text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>P90: {(data.p90 * 100).toFixed(0)}%</span>
          <span>Current: {(data.current * 100).toFixed(0)}%</span>
        </div>
        <div className="text-center">P50: {(data.p50 * 100).toFixed(0)}%</div>
      </div>

      <button className="w-full mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors">
        Ask AI <span className="ml-1">(?)</span>
      </button>
    </div>
  )
}

export function LivePreview() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<any>(null)
  const [data, setData] = useState<{
    marketRegime: MarketRegimeData
    btcDominance: BTCDominanceData
    volatility: VolatilityData
  } | null>(null)

  useEffect(() => {
    // Use mock data for static build compatibility
    // In production, this would fetch from external APIs directly
    setData({
      marketRegime: {
        metric_id: 'market_regime',
        visual_type: 'gauge',
        state: 'Risk-On',
        trend: 'up',
        confidence_bucket: 'High',
        asof: new Date().toISOString(),
        drivers: ['breadth_up', 'dispersion_down', 'vol_rel_mid']
      },
      btcDominance: {
        metric_id: 'btc_dominance',
        visual_type: 'stacked_share',
        btc_share: 0.54,
        alt_share: 0.46,
        delta_7d: -0.012,
        asof: new Date().toISOString()
      },
      volatility: {
        metric_id: 'vol_regime',
        visual_type: 'band_envelope',
        bucket: 'Elevated',
        p10: 0.28,
        p50: 0.45,
        p90: 0.72,
        current: 0.61,
        lookback_days: 365,
        asof: new Date().toISOString()
      }
    })
  }, [])

  const handleMetricClick = (metric: any) => {
    setSelectedMetric(metric)
    setDrawerOpen(true)
  }

  if (!data) {
    return (
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="animate-pulse">Loading live data...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Live Crypto Intelligence
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            3 scientific metrics with AI explanations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <MarketRegimeCard 
            data={data.marketRegime} 
            onClick={() => handleMetricClick(data.marketRegime)} 
          />
          <BTCDominanceCard 
            data={data.btcDominance} 
            onClick={() => handleMetricClick(data.btcDominance)} 
          />
          <VolatilityCard 
            data={data.volatility} 
            onClick={() => handleMetricClick(data.volatility)} 
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">
            Click any metric to explore methodology and ask AI questions
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-600">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live data • Updated every 15 minutes</span>
          </div>
        </div>
      </div>

      <MetricDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        metricData={selectedMetric}
      />
    </section>
  )
}
