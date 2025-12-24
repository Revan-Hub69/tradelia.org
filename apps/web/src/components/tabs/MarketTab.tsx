'use client'

import React from 'react'
import { useTrading } from '../../lib/contexts/TradingContext'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export const MarketTab: React.FC = () => {
  const {
    runtime,
    marketSnapshot,
    refreshRuntime,
    refreshMarketSnapshot
  } = useTrading()

  const handleRefresh = async () => {
    await Promise.all([refreshRuntime(), refreshMarketSnapshot()])
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Market Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time market data and trading signals
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Runtime Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Exchange Environment */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className={`w-6 h-6 ${
                  runtime?.exchangeEnv === 'live' ? 'text-red-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Exchange Environment
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {runtime?.exchangeEnv?.toUpperCase() || 'LOADING...'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className={`w-6 h-6 ${
                  runtime?.tradingEnabled ? 'text-green-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Trading Status
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {runtime?.tradingEnabled ? 'ENABLED' : 'DISABLED'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tracked Symbols */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tracked Symbols
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {runtime?.trackedSymbols?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* System Mode */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className={`w-6 h-6 ${
                  runtime?.mode === 'full' ? 'text-green-600' : 'text-yellow-600'
                }`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    System Mode
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {runtime?.mode?.toUpperCase() || 'DEMO'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Snapshot */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Market Snapshot
          </h3>

          {marketSnapshot ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Statistics */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Candidates</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {marketSnapshot.candidatesCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Top K Selected</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {marketSnapshot.topKCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Last Update</span>
                  <span className="text-sm text-gray-900">
                    {new Date(marketSnapshot.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Top Symbols */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Top Performing Symbols</h4>
                <div className="space-y-2">
                  {marketSnapshot.symbols.slice(0, 5).map((symbol, index) => (
                    <div key={symbol.symbol} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {symbol.symbol}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-right">
                          <div className="text-gray-500">Score</div>
                          <div className="font-medium">{symbol.score.toFixed(1)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-500">Liquidity</div>
                          <div className="font-medium">${(symbol.liquidity / 1000000).toFixed(1)}M</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-500">Volatility</div>
                          <div className="font-medium">{(symbol.volatility * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No market data</h3>
              <p className="mt-1 text-sm text-gray-500">
                Market snapshot will appear here when data is available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
