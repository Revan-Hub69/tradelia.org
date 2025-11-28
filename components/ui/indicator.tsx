/**
 * Non-chromatic indicators for colorblind accessibility
 * Based on WCAG 2.1 1.4.1 (Use of Color)
 */

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type IndicatorShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'line';

export interface IndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  shape?: IndicatorShape;
  variant?: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const shapeClasses: Record<IndicatorShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-sm',
  diamond: 'rotate-45 rounded-sm',
  triangle: 'border-l-transparent border-r-transparent border-b-transparent border-l-[4px] border-r-[4px] border-b-[8px]',
  line: 'rounded-full',
};

const variantClasses = {
  success: 'bg-success border-success',
  warning: 'bg-warning border-warning',
  error: 'bg-error border-error',
  info: 'bg-accent border-accent',
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function Indicator({
  className,
  shape = 'circle',
  variant = 'info',
  size = 'md',
  ...props
}: IndicatorProps) {
  if (shape === 'triangle') {
    return (
      <span
        className={cn(
          'inline-block border-solid',
          variantClasses[variant],
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }

  if (shape === 'line') {
    return (
      <span
        className={cn(
          'inline-block',
          sizeClasses[size],
          'h-0.5',
          variantClasses[variant],
          className
        )}
        aria-hidden="true"
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-block border',
        shapeClasses[shape],
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
