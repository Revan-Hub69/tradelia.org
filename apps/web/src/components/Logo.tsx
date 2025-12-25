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
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  if (variant === 'icon') {
    return (
      <svg
        className={`${sizeClasses[size]} ${className}`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Tradelia Logo"
      >
        {/* Outer circle representing market cycle */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />

        {/* Inner geometric pattern representing analysis */}
        <path
          d="M8 16L12 12L16 14L20 10L24 16L20 20L16 18L12 20Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Central dot representing precision */}
        <circle
          cx="16"
          cy="16"
          r="2"
          fill="currentColor"
        />

        {/* Risk assessment indicators */}
        <rect
          x="6"
          y="6"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
        <rect
          x="24"
          y="6"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
        <rect
          x="6"
          y="24"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
        <rect
          x="24"
          y="24"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Tradelia Logo"
      >
        {/* Outer circle representing market cycle */}
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />

        {/* Inner geometric pattern representing analysis */}
        <path
          d="M8 16L12 12L16 14L20 10L24 16L20 20L16 18L12 20Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Central dot representing precision */}
        <circle
          cx="16"
          cy="16"
          r="2"
          fill="currentColor"
        />

        {/* Risk assessment indicators */}
        <rect
          x="6"
          y="6"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
        <rect
          x="24"
          y="6"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
        <rect
          x="6"
          y="24"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
        <rect
          x="24"
          y="24"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>

      {/* Text */}
      <span className={`font-bold text-white tracking-tight ${textSizeClasses[size]}`}>
        Tradelia
      </span>
    </div>
  )
}
