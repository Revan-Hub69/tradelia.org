'use client'

import React, { forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const getButtonClasses = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  disabled?: boolean,
  loading?: boolean
) => {
  const isDisabled = disabled || loading

  // Clean, professional design with subtle shadows and smooth transitions
  const baseClasses = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-200 ease-out cursor-pointer
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-blue-500 focus-visible:ring-offset-white
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
    select-none relative overflow-hidden
  `

  const variantClasses = {
    primary: `
      bg-blue-600 text-white border border-blue-600
      hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/25
      active:bg-blue-800 active:scale-[0.98]
      ${isDisabled ? 'bg-gray-400 border-gray-400' : ''}
    `,
    secondary: `
      bg-gray-100 text-gray-900 border border-gray-300
      hover:bg-gray-200 hover:border-gray-400 hover:shadow-md
      active:bg-gray-300 active:scale-[0.98]
      ${isDisabled ? 'bg-gray-50 border-gray-200 text-gray-400' : ''}
    `,
    ghost: `
      bg-transparent text-gray-700 border border-transparent
      hover:bg-gray-100 hover:shadow-sm
      active:bg-gray-200 active:scale-[0.98]
      ${isDisabled ? 'text-gray-400' : ''}
    `,
    outline: `
      bg-transparent text-blue-600 border-2 border-blue-600
      hover:bg-blue-50 hover:shadow-md hover:shadow-blue-500/10
      active:bg-blue-100 active:scale-[0.98]
      ${isDisabled ? 'border-gray-300 text-gray-400' : ''}
    `,
    danger: `
      bg-red-600 text-white border border-red-600
      hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:shadow-red-500/25
      active:bg-red-800 active:scale-[0.98]
      ${isDisabled ? 'bg-gray-400 border-gray-400' : ''}
    `
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md min-h-[36px]',
    md: 'px-4 py-2 text-sm rounded-lg min-h-[44px]',
    lg: 'px-6 py-3 text-base rounded-lg min-h-[52px]'
  }

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={`${getButtonClasses(variant, size, disabled, loading)} ${className || ''}`}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2" aria-hidden="true">{leftIcon}</span>}
        <span className="flex-1 text-center">{children}</span>
        {!loading && rightIcon && <span className="ml-2" aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
