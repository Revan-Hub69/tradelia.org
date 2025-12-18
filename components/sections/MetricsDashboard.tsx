import { MarketMoodGauge } from '@/components/metrics/MarketMoodGauge'
import { BTCDominance } from '@/components/metrics/BTCDominance'
import { VolatilityBand } from '@/components/metrics/VolatilityBand'
import { TopMovers } from '@/components/metrics/TopMovers'
import { VolumeHeatmap } from '@/components/metrics/VolumeHeatmap'

// Mock data - replace with real API calls
const mockData = {
  marketMood: {
    state: 'Risk-On' as const,
    direction: 'up' as const,
    confidence: 0.78
  },
  btcDominance: {
    btcShare: 56.8,
    altShare: 43.2,
    weeklyChange: 2.3
  },
  volatility: {
    current: 45.2,
    min: 15.0,
    median: 35.0,
    max: 85.0,
    state: 'normal' as const
  },
  topMovers: {
    gainers: [
      { symbol: 'SOL', change: 12.4 },
      { symbol: 'ADA', change: 8.7 },
      { symbol: 'DOT', change: 6.2 },
      { symbol: 'AVAX', change: 5.1 },
      { symbol: 'MATIC', change: 4.8 }
    ],
    losers: [
      { symbol: 'LUNA', change: -15.2 },
      { symbol: 'ATOM', change: -9.8 },
      { symbol: 'FTM', change: -7.3 },
      { symbol: 'NEAR', change: -6.1 },
      { symbol: 'ALGO', change: -4.9 }
    ]
  },
  volumeData: [
    { symbol: 'BTC', priceChange: 3.2, volumeChange: 45.0 },
    { symbol: 'ETH', priceChange: -1.8, volumeChange: 32.0 },
    { symbol: 'SOL', priceChange: 12.4, volumeChange: 180.0 },
    { symbol: 'ADA', priceChange: 8.7, volumeChange: 95.0 },
    { symbol: 'DOT', priceChange: 6.2, volumeChange: -12.0 },
    { symbol: 'AVAX', priceChange: 5.1, volumeChange: 67.0 },
    { symbol: 'MATIC', priceChange: 4.8, volumeChange: -8.0 },
    { symbol: 'LUNA', priceChange: -15.2, volumeChange: 250.0 },
    { symbol: 'ATOM', priceChange: -9.8, volumeChange: 78.0 },
    { symbol: 'FTM', priceChange: -7.3, volumeChange: -15.0 }
  ]
}

export function MetricsDashboard() {
  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Market Intelligence
          </h2>
          <p className="text-xl text-slate-400 font-light">
            Visualizzazioni scientifiche basate sulla natura matematica delle metriche
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <MarketMoodGauge {...mockData.marketMood} />
          <BTCDominance {...mockData.btcDominance} />
          <VolatilityBand {...mockData.volatility} />
          <TopMovers {...mockData.topMovers} />
          <VolumeHeatmap data={mockData.volumeData} />
          
          {/* Sixth slot - placeholder */}
          <div className="card-premium flex items-center justify-center">
            <div className="text-center">
              <div className="text-slate-500 mb-2">Coming Soon</div>
              <div className="text-sm text-slate-600">Additional Metric</div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
            <span className="text-sm text-slate-400 font-light">
              Aggiornamento continuo • Metodologie trasparenti • Nessun consiglio di investimento
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}