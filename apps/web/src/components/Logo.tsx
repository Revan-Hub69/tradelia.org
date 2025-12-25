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
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-blue-600 rounded-md flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">T</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-md flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">T</span>
      </div>
      <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
        Tradelia
      </span>
    </div>
  )
}
