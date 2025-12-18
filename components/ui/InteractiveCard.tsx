'use client'

import { useState } from 'react'

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
}

export function InteractiveCard({ children, className = '', hoverEffect = true }: InteractiveCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`
        relative overflow-hidden transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-900/20' : ''}
        ${isHovered ? 'z-10' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover glow effect */}
      {hoverEffect && (
        <div 
          className={`
            absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 
            transition-opacity duration-300 pointer-events-none
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `} 
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle border animation */}
      {hoverEffect && (
        <div 
          className={`
            absolute inset-0 border border-slate-700/50 rounded-inherit
            transition-all duration-300
            ${isHovered ? 'border-slate-600/80 shadow-inner' : ''}
          `} 
        />
      )}
    </div>
  )
}