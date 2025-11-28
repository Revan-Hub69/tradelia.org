import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

export interface IconProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'accent' | 'gradient';
}

export const Icon = forwardRef<HTMLDivElement, IconProps>(
  ({ className, size = 'md', variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'flex items-center justify-center',
          'rounded-xl transition-all duration-300',
          // Size variants
          {
            'w-10 h-10': size === 'sm',
            'w-16 h-16': size === 'md',
            'w-20 h-20': size === 'lg',
            'w-24 h-24': size === 'xl',
          },
          // Variant styles
          {
            'bg-gradient-accent border border-border-accent text-accent shadow-md shadow-accent-glow/20':
              variant === 'default',
            'bg-gradient-primary border border-accent text-white shadow-glow':
              variant === 'accent',
            'bg-gradient-primary text-white border-transparent shadow-glow':
              variant === 'gradient',
          },
          // Hover effects
          'group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-glow-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Icon.displayName = 'Icon';
