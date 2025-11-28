import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gradient';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative overflow-hidden rounded-2xl',
          'backdrop-blur-sm transition-all duration-300',
          // Variant styles
          {
            'bg-gradient-surface border border-border': variant === 'default',
            'bg-bg-elevated border border-border': variant === 'elevated',
            'bg-gradient-surface border border-border': variant === 'gradient',
          },
          // Hover effects
          hover && {
            'hover:bg-bg-elevated hover:border-border-accent': variant === 'default',
            'hover:-translate-y-2 hover:shadow-xl hover:shadow-accent-glow/20':
              hover,
            'hover:before:opacity-100': hover,
          },
          // Gradient overlay on hover
          hover &&
            'before:absolute before:inset-0 before:bg-gradient-accent before:opacity-0 before:transition-opacity before:duration-300 before:z-0',
          // Top border accent on hover
          hover &&
            'after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-primary after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100',
          className
        )}
        {...props}
      >
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';
