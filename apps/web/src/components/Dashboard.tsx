'use client'

import React from 'react'
import { useTrading } from '../lib/contexts/TradingContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ContinuousWidget } from './ContinuousWidget'

export const Dashboard: React.FC = () => {
  const { sidebarOpen } = useTrading()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, drawer on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/25" onClick={() => {}} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
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

        {/* Main Content Area - Widget Removed */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {/* Content will be added here */}
          </div>
        </main>
      </div>
    </div>
  )
}
