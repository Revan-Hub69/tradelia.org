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

  // Base classes - premium, accessible, with proper focus states
  const baseClasses = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-200 ease-out cursor-pointer
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-brand-500 focus-visible:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
    select-none
  `

  // Premium shadows and transforms
  const interactiveClasses = isDisabled ? '' : `
    hover:shadow-lg hover:shadow-brand-500/25
    hover:transform hover:-translate-y-0.5
  `

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-brand-600 to-brand-700
      text-white border border-brand-600
      hover:from-brand-700 hover:to-brand-800
      hover:border-brand-700
      active:from-brand-800 active:to-brand-900
      ${isDisabled ? 'bg-gray-600 border-gray-600' : ''}
    `,
    secondary: `
      bg-gray-800 text-gray-100 border border-gray-700
      hover:bg-gray-700 hover:border-gray-600
      active:bg-gray-600
      ${isDisabled ? 'bg-gray-800 border-gray-700' : ''}
    `,
    ghost: `
      bg-transparent text-gray-300 border border-transparent
      hover:bg-gray-800 hover:text-white hover:border-gray-700
      active:bg-gray-700
      ${isDisabled ? 'text-gray-500' : ''}
    `,
    outline: `
      bg-transparent text-brand-400 border-2 border-brand-500
      hover:bg-brand-500 hover:text-white
      active:bg-brand-600
      ${isDisabled ? 'border-gray-600 text-gray-500' : ''}
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      text-white border border-red-600
      hover:from-red-700 hover:to-red-800
      hover:border-red-700
      active:from-red-800 active:to-red-900
      ${isDisabled ? 'bg-red-800 border-red-800' : ''}
    `
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-md min-h-[32px]',
    md: 'px-4 py-2 text-sm rounded-lg min-h-[40px]',
    lg: 'px-6 py-3 text-base rounded-lg min-h-[48px]'
  }

  return `${baseClasses} ${interactiveClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
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
