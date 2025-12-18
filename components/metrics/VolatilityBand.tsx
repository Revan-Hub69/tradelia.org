'use client'

interface VolatilityBandProps {
  current: number
  min: number
  median: number
  max: number
  state: 'compressed' | 'normal' | 'elevated'
}

export function VolatilityBand({ current, min, median, max, state }: VolatilityBandProps) {
  const getStateColor = () => {
    switch (state) {
      case 'compressed': return 'from-blue-500/20 to-blue-600/10'
      case 'normal': return 'from-slate-500/20 to-slate-600/10'
      case 'elevated': return 'from-red-500/20 to-red-600/10'
    }
  }

  const currentPosition = ((current - min) / (max - min)) * 100

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-200">Volatility</h3>
        <div className="text-sm text-slate-500 font-mono">RANGE</div>
      </div>

      <div className="mb-6">
        <div className="relative h-12 bg-slate-800/30 rounded-lg overflow-hidden">
          {/* Background band */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 via-slate-600/30 to-slate-700/20"></div>
          
          {/* Median line */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
            style={{ left: `${((median - min) / (max - min)) * 100}%` }}
          ></div>
          
          {/* Current position */}
          <div 
            className="absolute top-1 bottom-1 w-1 bg-white rounded-full"
            style={{ left: `${currentPosition}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{min.toFixed(1)}%</span>
          <span>median: {median.toFixed(1)}%</span>
          <span>{max.toFixed(1)}%</span>
        </div>
      </div>

      <div className="text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getStateColor()} border border-slate-700/50`}>
          <span className="text-slate-200 font-medium capitalize">{state}</span>
          <span className="text-slate-400">{current.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}