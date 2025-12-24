'use client'

import React from 'react'
import { useTrading } from '../../lib/contexts/TradingContext'
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

export const PositionsTab: React.FC = () => {
  const { exchangeConnections } = useTrading()

  // Mock positions data for demo
  const mockPositions = [
    {
      symbol: 'BTCUSDT',
      side: 'LONG',
      size: 0.002,
      entryPrice: 45000,
      currentPrice: 45200,
      pnl: 40,
      pnlPercent: 0.44
    },
    {
      symbol: 'ETHUSDT',
      side: 'SHORT',
      size: 0.05,
      entryPrice: 2800,
      currentPrice: 2750,
      pnl: 25,
      pnlPercent: 0.89
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Positions & Risk</h2>
          <p className="text-sm text-gray-500 mt-1">
            Current positions and risk management overview
          </p>
        </div>
      </div>

      {/* Exchange Connections Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Exchange Connections
          </h3>

          {exchangeConnections.length > 0 ? (
            <div className="space-y-3">
              {exchangeConnections.map((conn) => (
                <div key={conn.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      conn.status === 'connected' ? 'bg-green-500' :
                      conn.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {conn.exchange}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last checked: {new Date(conn.lastCheck).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      conn.status === 'connected'
                        ? 'bg-green-100 text-green-800'
                        : conn.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {conn.status}
                    </span>
                    {conn.error && (
                      <p className="text-xs text-red-600 mt-1">{conn.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No exchange connections</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure your exchange API credentials to enable trading.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Positions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Current Positions
          </h3>

          {mockPositions.length > 0 ? (
            <div className="space-y-4">
              {mockPositions.map((position) => (
                <div key={position.symbol} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        position.side === 'LONG' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {position.side === 'LONG' ? (
                          <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {position.symbol}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {position.size} units at ${position.entryPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm font-medium ${
                          position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          position.side === 'LONG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {position.side}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Current: ${position.currentPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No open positions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Active positions will appear here when trades are executed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Positions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {mockPositions.length}
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
                    Total P&L
                  </dt>
                  <dd className="text-lg font-medium text-green-900">
                    ${mockPositions.reduce((sum, p) => sum + p.pnl, 0).toFixed(2)}
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
                <BanknotesIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Risk Level
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Low
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
