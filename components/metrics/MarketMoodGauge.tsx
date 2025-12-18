'use client'

interface MarketMoodProps {
  state: 'Risk-Off' | 'Neutral' | 'Risk-On'
  direction: 'up' | 'down' | 'stable'
  confidence: number
}

export function MarketMoodGauge({ state, direction, confidence }: MarketMoodProps) {
  const getAngle = () => {
    switch (state) {
      case 'Risk-Off': return -60
      case 'Neutral': return 0
      case 'Risk-On': return 60
      default: return 0
    }
  }

  const getZoneColor = () => {
    switch (state) {
      case 'Risk-Off': return 'from-red-500/20 to-red-600/10'
      case 'Neutral': return 'from-slate-500/20 to-slate-600/10'
      case 'Risk-On': return 'from-green-500/20 to-green-600/10'
    }
  }

  const getDirectionSymbol = () => {
    switch (direction) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'stable': return '→'
    }
  }

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-200">Market Mood</h3>
        <div className="text-sm text-slate-500 font-mono">REGIME</div>
      </div>

      <div className="relative w-48 h-24 mx-auto mb-6">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="rgb(51 65 85)"
            strokeWidth="8"
            className="opacity-30"
          />
          
          <path
            d="M 20 80 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="rgb(239 68 68)"
            strokeWidth="8"
            className="opacity-20"
          />
          <path
            d="M 100 20 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="rgb(34 197 94)"
            strokeWidth="8"
            className="opacity-20"
          />

          <g transform={`rotate(${getAngle()} 100 80)`}>
            <line
              x1="100" y1="80"
              x2="100" y2="35"
              stroke="rgb(148 163 184)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="100" cy="80" r="4" fill="rgb(148 163 184)" />
          </g>
        </svg>
      </div>

      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getZoneColor()} border border-slate-700/50`}>
          <span className="text-slate-200 font-medium">{state}</span>
          <span className="text-slate-400">{getDirectionSymbol()}</span>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Confidence: {Math.round(confidence * 100)}%
        </div>
      </div>
    </div>
  )
}