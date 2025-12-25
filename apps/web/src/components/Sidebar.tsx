'use client'

import React from 'react'
import Link from 'next/link'
import { useTrading } from '../lib/contexts/TradingContext'
import {
  ChartBarIcon,
  BoltIcon,
  BanknotesIcon,
  PlayIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export const Sidebar: React.FC = () => {
  const { sidebarOpen, currentTab, setCurrentTab, signOut } = useTrading()

  const menuItems = [
    {
      id: 'market' as const,
      label: 'Market',
      icon: ChartBarIcon,
    },
    {
      id: 'signals' as const,
      label: 'Signals',
      icon: BoltIcon,
    },
    {
      id: 'positions' as const,
      label: 'Positions',
      icon: BanknotesIcon,
    },
    {
      id: 'jobs' as const,
      label: 'Jobs',
      icon: PlayIcon,
    },
  ]

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-white border-r border-gray-200 ${
      sidebarOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className={`font-bold text-xl text-blue-600 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        }`}>
          Tradelia
        </div>
        {!sidebarOpen && (
          <div className="text-blue-600 font-bold text-xl">T</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-blue-600' : 'text-gray-400'
              }`} />
              {sidebarOpen && (
                <span className="ml-3 truncate">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
        <div className="space-y-2">
          {/* Settings */}
          <Link
            href="/settings"
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900"
          >
            <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
            {sidebarOpen && <span className="ml-3">Settings</span>}
          </Link>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400" />
            {sidebarOpen && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
