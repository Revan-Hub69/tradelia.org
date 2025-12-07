'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  icon?: boolean;
  className?: string;
  delay?: number;
}

/**
 * Tooltip Component
 * Tooltip contestuale per aiutare gli utenti
 * Riferimento: WCAG 2.1 - Tooltips, Norman (2013) - Help Systems
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  icon = false,
  className,
  delay = 300,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Aggiusta se esce dallo schermo
    if (left < 0) left = 8;
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 8;
    }
    if (top < 0) top = 8;
    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - 8;
    }

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 10000,
    });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, position]);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div
      ref={triggerRef}
      className={cn('inline-flex items-center', className)}
      onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
      onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
      onFocus={trigger === 'focus' ? showTooltip : undefined}
      onBlur={trigger === 'focus' ? hideTooltip : undefined}
      onClick={handleClick}
    >
      {children}
      {icon && (
        <Info className="w-4 h-4 text-text-secondary ml-1" />
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-bg-soft border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary shadow-lg max-w-xs"
            style={tooltipStyle}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 bg-bg-soft border border-border-subtle',
                position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45 border-t-0 border-l-0',
                position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2 rotate-45 border-b-0 border-r-0',
                position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2 rotate-45 border-l-0 border-b-0',
                position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2 rotate-45 border-r-0 border-t-0'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

