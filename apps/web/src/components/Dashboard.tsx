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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-16'
      }`}>
        {/* Header */}
        <Header />

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {renderCurrentTab()}
        </main>
      </div>
    </div>
  )
}
