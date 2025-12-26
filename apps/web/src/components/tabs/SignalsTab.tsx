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
          <h2 className="text-xl font-semibold text-[var(--ink)]">Trading Signals</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Active trading signals and setup detection
          </p>
        </div>
        <button
          onClick={refreshSignals}
          className="btn-secondary"
        >
          <BoltIcon className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Active Signals */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-[var(--ink)] mb-4">
            Active Signals
          </h3>

          {activeSignals.length > 0 ? (
            <div className="space-y-4">
              {activeSignals.map((signal, index) => (
                <div key={`${signal.id}-${index}`} className="border border-[var(--br)] rounded-lg p-4 bg-[var(--surface-2)]">
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
                        <h4 className="text-sm font-medium text-[var(--ink)]">
                          {signal.symbol} - {signal.side}
                        </h4>
                        <p className="text-sm text-[var(--muted)]">
                          Entry: ${signal.entryPrice.toLocaleString()} |
                          SL: ${signal.slPrice.toLocaleString()} |
                          TP: ${signal.tpPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(signal.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BoltIcon className="mx-auto h-12 w-12 text-[var(--muted)]" />
              <h3 className="mt-2 text-sm font-medium text-[var(--ink)]">No active signals</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Trading signals will appear here when detected by the strategy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Signal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[var(--muted)] truncate">
                    Today's Signals
                  </dt>
                  <dd className="text-lg font-medium text-[var(--ink)]">
                    {activeSignals.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[var(--muted)] truncate">
                    High Confidence
                  </dt>
                  <dd className="text-lg font-medium text-[var(--ink)]">
                    {activeSignals.filter(s => s.confidence >= 0.8).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BoltIcon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[var(--muted)] truncate">
                    Average Confidence
                  </dt>
                  <dd className="text-lg font-medium text-[var(--ink)]">
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
