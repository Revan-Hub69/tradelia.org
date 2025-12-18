'use client'

interface Asset {
  symbol: string
  change: number
}

interface TopMoversProps {
  gainers: Asset[]
  losers: Asset[]
}

export function TopMovers({ gainers, losers }: TopMoversProps) {
  const maxChange = Math.max(
    Math.max(...gainers.map(a => Math.abs(a.change))),
    Math.max(...losers.map(a => Math.abs(a.change)))
  )

  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-200">Top Movers</h3>
        <div className="text-sm text-slate-500 font-mono">24H</div>
      </div>

      <div className="space-y-6">
        {/* Gainers */}
        <div>
          <div className="text-sm text-slate-400 mb-3">Gainers</div>
          <div className="space-y-2">
            {gainers.slice(0, 5).map((asset, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 text-xs text-slate-400 font-mono">{asset.symbol}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-slate-800/30 rounded">
                    <div 
                      className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded"
                      style={{ width: `${(asset.change / maxChange) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-xs text-slate-300 text-right font-mono">
                  +{asset.change.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Losers */}
        <div>
          <div className="text-sm text-slate-400 mb-3">Losers</div>
          <div className="space-y-2">
            {losers.slice(0, 5).map((asset, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 text-xs text-slate-400 font-mono">{asset.symbol}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-slate-800/30 rounded flex justify-end">
                    <div 
                      className="h-full bg-gradient-to-l from-slate-600 to-slate-500 rounded"
                      style={{ width: `${(Math.abs(asset.change) / maxChange) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-xs text-slate-300 text-right font-mono">
                  {asset.change.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}