/**
 * Modal Dialog Component
 * 
 * Modal avanzato con overlay, animazioni, focus trap, escape key
 * 
 * Riferimenti:
 * - W3C ARIA Dialog Pattern
 * - Material Design Dialogs
 * - Radix UI Dialog Pattern
 */

'use client';

import { useEffect, useRef, ReactNode, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
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
 * 
 * Features:
 * - Focus trap (accessibility)
 * - Escape key to close
 * - Overlay click to close
 * - Animations
 * - Scrollable content
 * - Responsive sizing
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Salva elemento focusato prima
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus sul modal
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    firstElement?.focus();

    // Trap focus
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || []
      ) as HTMLElement[];

      if (focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab as any);

    return () => {
      document.removeEventListener('keydown', handleTab as any);
      // Ripristina focus
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape as any);
    return () => {
      document.removeEventListener('keydown', handleEscape as any);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
