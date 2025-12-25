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

const getButtonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md') => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-120 ease-out cursor-pointer focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'

  const variantClasses = {
    primary: 'bg-[var(--brand-500)] text-white border border-transparent hover:bg-[var(--brand-600)] hover:shadow-[var(--shadow-sm)] hover:transform hover:-translate-y-0.5 active:bg-[var(--brand-700)] active:transform active:translate-y-0',
    secondary: 'bg-[var(--card)] text-[var(--ink)] border border-[var(--br)] hover:bg-[var(--card-2)] hover:border-[var(--br-2)] hover:shadow-[var(--shadow-sm)] hover:transform hover:-translate-y-0.5 active:transform active:translate-y-0',
    ghost: 'bg-transparent text-[var(--ink)] border border-transparent hover:bg-[var(--card)] hover:transform hover:-translate-y-0.5 active:transform active:translate-y-0',
    outline: 'bg-transparent text-[var(--ink)] border border-[var(--br)] hover:bg-[var(--card)] hover:border-[var(--br-2)] hover:transform hover:-translate-y-0.5 active:transform active:translate-y-0',
    danger: 'bg-red-600 text-white border border-transparent hover:bg-red-700 hover:shadow-[var(--shadow-sm)] hover:transform hover:-translate-y-0.5 active:bg-red-800 active:transform active:translate-y-0'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading
    const buttonClasses = getButtonClasses(variant, size)

    return (
      <button
        className={`${buttonClasses} ${className || ''}`}
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
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
