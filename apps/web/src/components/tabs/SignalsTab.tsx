'use client'

import React from 'react'
import { useTrading } from '../../lib/contexts/TradingContext'
import {
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export const SignalsTab: React.FC = () => {
  const { activeSignals, refreshSignals } = useTrading()

  const getSignalColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Trading Signals</h2>
          <p className="text-sm text-gray-500 mt-1">
            Active trading signals and setup detection
          </p>
        </div>
        <button
          onClick={refreshSignals}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <BoltIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Active Signals */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Active Signals
          </h3>

          {activeSignals.length > 0 ? (
            <div className="space-y-4">
              {activeSignals.map((signal, index) => (
                <div key={`${signal.id}-${index}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSignalColor(signal.confidence)}`}>
                        {signal.confidence >= 0.8 ? (
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                        ) : signal.confidence >= 0.6 ? (
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        )}
                        {Math.round(signal.confidence * 100)}%
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {signal.symbol} - {signal.side}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Entry: ${signal.entryPrice.toLocaleString()} |
                          SL: ${signal.slPrice.toLocaleString()} |
                          TP: ${signal.tpPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(signal.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BoltIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active signals</h3>
              <p className="mt-1 text-sm text-gray-500">
                Trading signals will appear here when detected by the strategy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Signal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Today's Signals
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeSignals.length}
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
                    High Confidence
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeSignals.filter(s => s.confidence >= 0.8).length}
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
                <BoltIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Confidence
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activeSignals.length > 0
                      ? Math.round((activeSignals.reduce((sum, s) => sum + s.confidence, 0) / activeSignals.length) * 100)
                      : 0
                    }%
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
