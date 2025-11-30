'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

/**
 * Tooltip Component
 * Best Practice: Fornisce help contestuale senza sovraccaricare UI (Nielsen, 1994)
 * 
 * WCAG 2.1 SC 1.3.1 - Info and Relationships
 * Fornisce informazioni aggiuntive accessibili
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isVisible, placement]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className="inline-block"
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'fixed z-50 px-3 py-2 text-sm bg-bg-elevated border border-border-subtle rounded-lg shadow-lg pointer-events-none',
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            role="tooltip"
          >
            <div className="text-text-primary">{content}</div>
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-bg-elevated border border-border-subtle rotate-45',
                placement === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-0 border-r-0',
                placement === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2 border-b-0 border-l-0',
                placement === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2 border-l-0 border-b-0',
                placement === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2 border-r-0 border-t-0'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

