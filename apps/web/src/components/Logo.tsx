'use client'

import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'full' | 'icon'
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10'
  }

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-blue-600 rounded flex items-center justify-center`}>
        <span className="text-white font-bold text-xs leading-none">T</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Simple icon */}
      <div className={`${sizeClasses[size]} bg-blue-600 rounded flex items-center justify-center`}>
        <span className="text-white font-bold text-xs leading-none">T</span>
      </div>

      {/* Clean text */}
      <span className={`font-semibold text-gray-900 ${textSizeClasses[size]}`}>
        Tradelia
      </span>
    </div>
  )
}
