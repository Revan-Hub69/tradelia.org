/**
 * Advanced Tooltip Component
 * 
 * Tooltip avanzato con supporto per contenuto ricco, posizionamento intelligente, delay
 * 
 * Riferimenti:
 * - W3C ARIA Tooltip Pattern
 * - Material Design Tooltips
 * - Radix UI Tooltip Pattern
 */

'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  showArrow?: boolean;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  maxWidth?: number;
}

/**
 * Advanced Tooltip Component
 * 
 * Features:
 * - Intelligent positioning (auto-adjusts to viewport)
 * - Rich content support (HTML, React components)
 * - Delay before showing
 * - Arrow indicator
 * - Accessible (ARIA attributes)
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  showArrow = true,
  className = '',
  contentClassName = '',
  disabled = false,
  maxWidth = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [finalPosition, setFinalPosition] = useState(position);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Calcola posizione intelligente
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;
    let finalPos = position;

    // Calcola posizione iniziale
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        if (top < 0) finalPos = 'bottom';
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        if (top + tooltipRect.height > viewportHeight) finalPos = 'top';
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        if (left < 0) finalPos = 'right';
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        if (left + tooltipRect.width > viewportWidth) finalPos = 'left';
        break;
    }

    // Aggiusta se fuori viewport
    if (left < 0) left = 8;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 0) top = 8;
    if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setFinalPosition(finalPos);
    setCoords({ top, left });
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </div>

      {isVisible &&
        !disabled &&
        createPortal(
          <div
            ref={tooltipRef}
            id="tooltip"
            role="tooltip"
            className={`fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg pointer-events-none ${contentClassName}`}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              maxWidth: `${maxWidth}px`,
            }}
          >
            {showArrow && (
              <div
                className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45`}
                style={{
                  ...(finalPosition === 'top' && {
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                  }),
                  ...(finalPosition === 'bottom' && {
                    top: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg)',
                  }),
                  ...(finalPosition === 'left' && {
                    right: '-4px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                  }),
                  ...(finalPosition === 'right' && {
                    left: '-4px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                  }),
                }}
              />
            )}
            <div className="relative z-10">{content}</div>
          </div>,
          document.body
        )}
    </>
  );
}
