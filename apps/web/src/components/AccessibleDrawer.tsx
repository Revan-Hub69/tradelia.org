'use client'

import React, { useEffect, useRef, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from './ui/Button'

interface AccessibleDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  position?: 'right' | 'left' | 'bottom' | 'full'
}

export const AccessibleDrawer: React.FC<AccessibleDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'right'
}) => {
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Focus trap and accessibility management
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'Tab') {
        // Focus trap implementation
        const drawer = drawerRef.current
        if (!drawer) return

        const focusableElements = drawer.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden'

    // Focus management
    const previousFocus = document.activeElement as HTMLElement
    setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 100) // Small delay to ensure drawer is rendered

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      // Cleanup
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)

      // Return focus to previous element
      if (previousFocus && previousFocus.focus) {
        setTimeout(() => previousFocus.focus(), 100)
      }
    }
  }, [isOpen, onClose])

  // Animation handling
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl'
    }
    return sizes[size]
  }

  const getPositionClasses = () => {
    if (position === 'full') {
      return 'inset-0'
    }

    const positions = {
      right: 'inset-y-0 right-0',
      left: 'inset-y-0 left-0',
      bottom: 'inset-x-0 bottom-0'
    }

    return positions[position]
  }

  const getTransformClasses = () => {
    if (!isOpen && !isAnimating) return ''

    const transforms = {
      right: isOpen ? 'translate-x-0' : 'translate-x-full',
      left: isOpen ? 'translate-x-0' : '-translate-x-full',
      bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
      full: ''
    }

    return transforms[position]
  }

  if (!isOpen && !isAnimating) return null

  return (
    <div
      className={`
        fixed inset-0 z-50 flex
        ${position === 'full' ? 'items-center justify-center' : ''}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      aria-describedby="drawer-content"
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          relative bg-gray-900 border border-gray-700 shadow-2xl
          transition-transform duration-300 ease-out
          ${position === 'full' ? 'w-full h-full max-w-none' : ''}
          ${position === 'bottom' ? 'w-full h-auto max-h-[90vh]' : 'w-full h-full'}
          ${getSizeClasses()} ${getPositionClasses()} ${getTransformClasses()}
        `}
        style={{
          transform: position === 'full' ? undefined : getTransformClasses()
        }}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2
            id="drawer-title"
            className="text-xl font-semibold text-white pr-4"
          >
            {title}
          </h2>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-800"
            aria-label="Chiudi pannello"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </header>

        {/* Content */}
        <div
          id="drawer-content"
          className="flex-1 overflow-y-auto p-6"
          style={{ maxHeight: position === 'full' ? 'calc(100vh - 140px)' : 'calc(100vh - 140px)' }}
        >
          {children}
        </div>

        {/* Footer with close button for mobile */}
        <footer className="border-t border-gray-700 p-4 md:hidden">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full"
          >
            Chiudi
          </Button>
        </footer>
      </div>
    </div>
  )
}
