'use client'

import React from 'react'
import { useTrading } from '../lib/contexts/TradingContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ContinuousWidget } from './ContinuousWidget'

export const Dashboard: React.FC = () => {
  const { sidebarOpen } = useTrading()

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar - Hidden on mobile, drawer on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {}} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-800 shadow-2xl border-r border-gray-700">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={`
          flex-1 flex flex-col transition-all duration-300 ease-out
          md:ml-16 md:data-[sidebar-open=true]:ml-64
        `}
        data-sidebar-open={sidebarOpen}
      >
        {/* Header */}
        <Header />

        {/* Continuous Widget - Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <ContinuousWidget />
          </div>
        </main>
      </div>
    </div>
  )
}
