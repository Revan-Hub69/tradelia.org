'use client'

import React from 'react'
import { useTrading } from '../lib/contexts/TradingContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MarketTab } from './tabs/MarketTab'
import { SignalsTab } from './tabs/SignalsTab'
import { PositionsTab } from './tabs/PositionsTab'

export const Dashboard: React.FC = () => {
  const { currentTab, sidebarOpen } = useTrading()

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'market':
        return <MarketTab />
      case 'signals':
        return <SignalsTab />
      case 'positions':
        return <PositionsTab />
      default:
        return <MarketTab />
    }
  }

  return (
    <div className="flex min-h-dvh bg-gray-50">
      {/* Sidebar - Hidden on mobile, drawer on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => {}} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        // On mobile, no margin. On desktop, adjust based on sidebar
        'md:ml-16 md:data-[sidebar-open=true]:ml-64'
      }`} data-sidebar-open={sidebarOpen}>
        {/* Header */}
        <Header />

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderCurrentTab()}
        </main>
      </div>
    </div>
  )
}
