'use client'

interface VolumeData {
  symbol: string
  priceChange: number
  volumeChange: number
}

interface VolumeHeatmapProps {
  data: VolumeData[]
}

export function VolumeHeatmap({ data }: VolumeHeatmapProps) {
  const getQuadrant = (priceChange: number, volumeChange: number) => {
    if (priceChange > 0 && volumeChange > 0) return 'up-vol-up'
    if (priceChange < 0 && volumeChange > 0) return 'down-vol-up'
    if (priceChange > 0 && volumeChange < 0) return 'up-vol-down'
    return 'down-vol-down'
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'up-vol-up': return 'bg-emerald-500/20 border-emerald-500/30'
      case 'down-vol-up': return 'bg-red-500/20 border-red-500/30'
      case 'up-vol-down': return 'bg-blue-500/20 border-blue-500/30'
      case 'down-vol-down': return 'bg-slate-500/20 border-slate-500/30'
    }
  }

  const maxPrice = Math.max(...data.map(d => Math.abs(d.priceChange)))
  const maxVolume = Math.max(...data.map(d => Math.abs(d.volumeChange)))

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-200">Volume Movers</h3>
        <div className="text-sm text-slate-500 font-mono">HEATMAP</div>
      </div>

      <div className="relative h-48 border border-slate-700/30 rounded-lg overflow-hidden">
        {/* Quadrant lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-700/50"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/50"></div>
        </div>

        {/* Data points */}
        {data.slice(0, 20).map((item, i) => {
          const x = 50 + (item.priceChange / maxPrice) * 40
          const y = 50 - (item.volumeChange / maxVolume) * 40
          const quadrant = getQuadrant(item.priceChange, item.volumeChange)
          
          return (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full ${getQuadrantColor(quadrant)} transform -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`${item.symbol}: ${item.priceChange.toFixed(1)}% / ${item.volumeChange.toFixed(1)}%`}
            ></div>
          )
        })}

        {/* Labels */}
        <div className="absolute top-2 left-2 text-xs text-slate-500">↑Vol ↓Price</div>
        <div className="absolute top-2 right-2 text-xs text-slate-500">↑Vol ↑Price</div>
        <div className="absolute bottom-2 left-2 text-xs text-slate-500">↓Vol ↓Price</div>
        <div className="absolute bottom-2 right-2 text-xs text-slate-500">↓Vol ↑Price</div>
      </div>

      <div className="flex justify-between text-xs text-slate-500 mt-3">
        <span>Price Change</span>
        <span>Volume Change</span>
      </div>
    </div>
  )
}