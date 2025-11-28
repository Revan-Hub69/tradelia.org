import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'outline';
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-2',
          'px-4 py-2 rounded-full',
          'text-xs font-semibold uppercase tracking-widest',
          'transition-all duration-300',
          'relative overflow-hidden backdrop-blur-sm',
          // Variant styles
          {
            'bg-gradient-accent border border-border-accent text-accent shadow-md shadow-accent-glow/10':
              variant === 'default',
            'bg-gradient-primary text-white border-transparent shadow-glow':
              variant === 'accent',
            'bg-transparent border border-border text-text-secondary':
              variant === 'outline',
          },
          // Hover effects
          'hover:-translate-y-0.5 hover:shadow-lg',
          'before:absolute before:inset-0 before:bg-gradient-primary before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-10',
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </div>
    );
  }
);

Badge.displayName = 'Badge';
