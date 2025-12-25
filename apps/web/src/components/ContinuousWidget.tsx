'use client'

import React from 'react'

export const ContinuousWidget: React.FC = () => {
  return (
    <div className="p-4 space-y-3">
      {/* Compact status indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-600">System online</span>
      </div>

      {/* Simple market info - only when needed */}
      <div className="text-xs text-gray-500">
        BTC: $45,230 (+2.3%)
      </div>
    </div>
  )
}
