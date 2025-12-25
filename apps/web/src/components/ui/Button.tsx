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

  // Minimal, premium design - no shadows, no transforms, clean lines
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    transition-colors duration-150 ease-out cursor-pointer
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500
    disabled:opacity-40 disabled:cursor-not-allowed
    select-none
  `

  const variantClasses = {
    primary: `
      bg-blue-600 text-white border border-blue-600
      hover:bg-blue-700 hover:border-blue-700
      active:bg-blue-800
      ${isDisabled ? 'bg-gray-600 border-gray-600' : ''}
    `,
    secondary: `
      bg-white text-gray-900 border border-gray-300
      hover:bg-gray-50 hover:border-gray-400
      active:bg-gray-100
      ${isDisabled ? 'bg-gray-100 border-gray-200 text-gray-500' : ''}
    `,
    ghost: `
      bg-transparent text-gray-700 border border-transparent
      hover:bg-gray-100 hover:text-gray-900
      active:bg-gray-200
      ${isDisabled ? 'text-gray-400' : ''}
    `,
    outline: `
      bg-transparent text-blue-600 border border-blue-600
      hover:bg-blue-50
      active:bg-blue-100
      ${isDisabled ? 'border-gray-300 text-gray-400' : ''}
    `,
    danger: `
      bg-red-600 text-white border border-red-600
      hover:bg-red-700 hover:border-red-700
      active:bg-red-800
      ${isDisabled ? 'bg-gray-400 border-gray-400' : ''}
    `
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-md'
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
