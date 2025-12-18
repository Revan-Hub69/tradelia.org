'use client'

interface BTCDominanceProps {
  btcShare: number
  altShare: number
  weeklyChange: number
}

export function BTCDominance({ btcShare, altShare, weeklyChange }: BTCDominanceProps) {
  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-200">BTC Dominance</h3>
        <div className="text-sm text-slate-500 font-mono">SHARE</div>
      </div>

      <div className="mb-6">
        <div className="flex h-8 rounded-lg overflow-hidden bg-slate-800/50">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${btcShare}%` }}
          >
            BTC {btcShare.toFixed(1)}%
          </div>
          <div 
            className="bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center text-xs font-medium text-slate-200"
            style={{ width: `${altShare}%` }}
          >
            ALT {altShare.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">1W Change</div>
        <div className={`text-sm font-medium ${weeklyChange >= 0 ? 'text-slate-300' : 'text-slate-400'}`}>
          {weeklyChange >= 0 ? '+' : ''}{weeklyChange.toFixed(2)}%
        </div>
      </div>
    </div>
  )
}