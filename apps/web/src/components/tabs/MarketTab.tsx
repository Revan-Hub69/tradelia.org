'use client'

import React, { useEffect } from 'react'
import { useTrading } from '../../lib/contexts/TradingContext'
import { useWebSocket } from '../../lib/contexts/WebSocketContext'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export const MarketTab: React.FC = () => {
  const { user } = useTrading()
  const {
    screenerData,
    isConnected,
    connectionStatus,
    refreshScreener
  } = useWebSocket()

  // Auto-subscribe to screener on mount
  useEffect(() => {
    if (user && isConnected) {
      // The screener data is automatically broadcasted by the server
      // We just need to be connected to receive it
    }
  }, [user, isConnected])

  const getMtfGateColor = (gate: string) => {
    switch (gate) {
      case 'PASS': return 'bg-green-100 text-green-800'
      case 'REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'FAIL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Advanced Screener</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time market analysis with L2 orderbook imbalance & MTF gating
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <WifiIcon className={`w-4 h-4 ${getConnectionStatusColor(connectionStatus)}`} />
            <span className="text-sm text-gray-600 capitalize">
              {connectionStatus}
            </span>
          </div>
          <button
            onClick={refreshScreener}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Screener Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Screener Results ({screenerData.length})
            </h3>
            <div className="text-sm text-gray-500">
              Last update: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {screenerData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="hidden lg:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LQS
                    </th>
                    <th className="hidden lg:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VOS
                    </th>
                    <th className="hidden xl:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DFS
                    </th>
                    <th className="hidden xl:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MES
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gate
                    </th>
                    <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imbal.
                    </th>
                    <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OI
                    </th>
                    <th className="hidden lg:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Press.
                    </th>
                    <th className="hidden xl:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Support
                    </th>
                    <th className="hidden xl:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resist.
                    </th>
                    <th className="hidden lg:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slip.
                    </th>
                    <th className="hidden md:table-cell px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      24h Δ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {screenerData.slice(0, 20).map((item, index) => (
                    <tr key={item.symbol} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{item.rank}
                      </td>
                      <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.symbol}
                      </td>
                      <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.score >= 80 ? 'bg-green-100 text-green-800' :
                          item.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.lqs.toFixed(1)}
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.vos.toFixed(1)}
                      </td>
                      <td className="hidden xl:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.dfs.toFixed(1)}
                      </td>
                      <td className="hidden xl:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.mes.toFixed(1)}
                      </td>
                      <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMtfGateColor(item.mtfGate)}`}>
                          {item.mtfGate}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`${
                          Math.abs(item.imbalance) > 0.05 ? 'text-red-600 font-medium' :
                          Math.abs(item.imbalance) > 0.02 ? 'text-yellow-600' :
                          'text-gray-900'
                        }`}>
                          {(item.imbalance * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(item.oi / 1000).toFixed(0)}K
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`${
                          item.pressure > 0.5 ? 'text-green-600' :
                          item.pressure < -0.5 ? 'text-red-600' :
                          'text-gray-900'
                        }`}>
                          {item.pressure > 0 ? '+' : ''}{(item.pressure * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="hidden xl:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-green-600">
                        ${item.support.toLocaleString()}
                      </td>
                      <td className="hidden xl:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-red-600">
                        ${item.resistance.toLocaleString()}
                      </td>
                      <td className="hidden lg:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.slippage.toFixed(2)}%
                      </td>
                      <td className="hidden md:table-cell px-2 sm:px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.accumulationZone === 'ACCUMULATION' ? 'bg-green-100 text-green-800' :
                          item.accumulationZone === 'DISTRIBUTION' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.accumulationZone}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price.toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`${
                          item.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              {!isConnected ? (
                <div>
                  <WifiIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Connecting to market data...</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Establishing WebSocket connection for real-time screener data.
                  </p>
                </div>
              ) : (
                <div>
                  <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No screener data</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Screener results will appear here when market analysis is complete.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Screener Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    PASS Gate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {screenerData.filter(s => s.mtfGate === 'PASS').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    REVIEW Gate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {screenerData.filter(s => s.mtfGate === 'REVIEW').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    FAIL Gate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {screenerData.filter(s => s.mtfGate === 'FAIL').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    High Imbalance
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {screenerData.filter(s => Math.abs(s.imbalance) > 0.05).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Accumulation
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {screenerData.filter(s => s.accumulationZone === 'ACCUMULATION').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Distribution
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {screenerData.filter(s => s.accumulationZone === 'DISTRIBUTION').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
