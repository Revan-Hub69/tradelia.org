'use client'

import React from 'react'
import { useTrading } from '../lib/contexts/TradingContext'
import { TradeliaLogo } from './icons/TradeliaLogo'
import {
  Bars3Icon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

export const Header: React.FC = () => {
  const {
    user,
    runtime,
    sidebarOpen,
    toggleSidebar
  } = useTrading()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50'
      case 'unhealthy':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--br)] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button, logo and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] transition-colors"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <TradeliaLogo size={32} className="text-[var(--ink)]" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--ink)]">
                Trading Dashboard
              </h1>
              {user && (
                <p className="text-sm text-[var(--muted)]">
                  Welcome back, {user.email?.split('@')[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side - System status */}
        <div className="flex items-center space-x-6">
          {/* Runtime status */}
          {runtime && (
            <div className="flex items-center space-x-4 text-sm">
              {/* Exchange Environment */}
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  runtime.exchangeEnv === 'live'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {runtime.exchangeEnv.toUpperCase()}
                </div>
              </div>

              {/* Trading Status */}
              <div className="flex items-center space-x-2">
                {runtime.tradingEnabled ? (
                  <CheckCircleIconSolid className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircleIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${
                  runtime.tradingEnabled ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Trading {runtime.tradingEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {/* Symbols count */}
              <div className="flex items-center space-x-2 text-[var(--muted)]">
                <ClockIcon className="w-4 h-4" />
                <span className="text-sm">
                  {runtime.trackedSymbols.length} symbols
                </span>
              </div>

              {/* System mode */}
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  runtime.mode === 'full'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {runtime.mode.toUpperCase()}
                </div>
              </div>
            </div>
          )}

          {/* User avatar */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center">
                <span className="text-[var(--bg)] text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
