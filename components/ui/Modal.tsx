'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

/**
 * Modal Component
 * Reusable modal with focus trap, keyboard navigation, and accessibility
 * Riferimento: WAI-ARIA Dialog Pattern, Material Design Modal
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and keyboard navigation
  // Riferimento: WAI-ARIA Dialog Pattern, Norman (2013) - Feedback, Nielsen (1994) - Error Prevention
  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus (Norman - State Visibility)
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus modal on open (WCAG 2.1 - Focus Management)
    const modal = modalRef.current;
    if (!modal) return;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.from(modal.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute('disabled') && !el.hasAttribute('aria-hidden')
      );
    };

    const focusableElements = getFocusableElements();
    
    // Focus first element or modal itself (WCAG 2.4.3 - Focus Order)
    if (focusableElements.length > 0) {
      // Small delay to ensure modal is fully rendered (Norman - Feedback)
      requestAnimationFrame(() => {
        focusableElements[0].focus();
      });
    } else {
      // If no focusable elements, focus modal container
      modal.setAttribute('tabindex', '-1');
      modal.focus();
    }

    // Focus trap: Tab and Shift+Tab (WCAG 2.1.1 - Keyboard, WAI-ARIA Dialog Pattern)
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      // If Shift+Tab on first element, focus last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        return;
      }

      // If Tab on last element, focus first
      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
        return;
      }
    };

    // Handle Escape key (Nielsen - Error Prevention, Norman - Affordance)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        onClose();
      }
    };

    // Prevent body scroll (Norman - System State)
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Event listeners
    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    // Prevent focus from escaping modal (WCAG 2.1.1 - Keyboard)
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (modal && !modal.contains(target)) {
        e.preventDefault();
        const elements = getFocusableElements();
        if (elements.length > 0) {
          elements[0].focus();
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('focusin', handleFocusIn);
      
      // Restore body styles
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      
      // Restore previous focus (WCAG 2.4.3 - Focus Order, Norman - State Visibility)
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        requestAnimationFrame(() => {
          previousFocusRef.current?.focus();
        });
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : title ? 'modal-description' : undefined}
          // WCAG 2.4.2 - Page Titled: Modal should have accessible name
          aria-label={!title ? 'Dialog' : undefined}
        >
          {/* Backdrop */}
          {/* Riferimento: Material Design Modal, Norman (2013) - Affordance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            onKeyDown={(e) => {
              // Allow closing with Enter/Space on backdrop (WCAG 2.1.1 - Keyboard)
              if (closeOnBackdrop && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClose();
              }
            }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            role="presentation"
          />

          {/* Modal Content */}
          {/* Riferimento: WCAG 2.1 - Animations, prefers-reduced-motion */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              // Respect prefers-reduced-motion (WCAG 2.3.3 - Animation from Interactions)
              ...(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? { duration: 0 }
                : {}),
            }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative z-50 w-full bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl',
              'max-h-[90vh] overflow-hidden flex flex-col',
              'focus:outline-none', // Remove default outline, we handle focus with ring
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-border-subtle">
                <div className="flex-1 pr-4">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-xl font-semibold text-text-primary mb-1"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="text-sm text-text-secondary mt-1"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors flex-shrink-0"
                    aria-label="Chiudi"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

