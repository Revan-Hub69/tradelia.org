'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  className,
  delay = 300 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        // First render tooltip to get its dimensions
        setIsVisible(true);
        
        // Use requestAnimationFrame to ensure tooltip is rendered
        requestAnimationFrame(() => {
          if (triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            let top = 0;
            let left = 0;

            switch (position) {
              case 'top':
                top = triggerRect.top - tooltipRect.height - 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
              case 'bottom':
                top = triggerRect.bottom + 8;
                left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                break;
              case 'left':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.left - tooltipRect.width - 8;
                break;
              case 'right':
                top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                left = triggerRect.right + 8;
                break;
            }

            // Adjust for viewport boundaries
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left < 8) left = 8;
            if (left + tooltipRect.width > viewportWidth - 8) {
              left = viewportWidth - tooltipRect.width - 8;
            }
            if (top < 8) top = 8;
            if (top + tooltipRect.height > viewportHeight - 8) {
              top = viewportHeight - tooltipRect.height - 8;
            }

            setTooltipPosition({ top, left });
          }
        });
      }
    }, delay);
  };

  const hideTooltip = () => {
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
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-[100] px-3 py-2 text-xs font-medium bg-bg-elevated border border-border-subtle rounded-lg shadow-2xl pointer-events-none',
            'max-w-xs text-text-primary',
            'backdrop-blur-sm',
            className
          )}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            backgroundColor: 'rgba(20, 25, 40, 0.95)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-bg-elevated border-r border-b border-border-subtle transform rotate-45',
              position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
              position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
              position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
              position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
            )}
            style={{
              backgroundColor: 'rgba(20, 25, 40, 0.95)',
            }}
          />
        </div>
      )}
    </div>
  );
}
