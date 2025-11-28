import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, asChild, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    
    return (
      <Comp
        ref={ref as any}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-semibold transition-all duration-300 rounded-lg',
          'relative overflow-hidden',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Size variants
          {
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          // Variant styles
          {
            // Primary
            'bg-gradient-primary text-white shadow-glow':
              variant === 'primary',
            'hover:shadow-glow-lg hover:-translate-y-0.5 active:translate-y-0':
              variant === 'primary',
            // Secondary
            'bg-transparent text-text-primary border border-border':
              variant === 'secondary',
            'hover:bg-bg-surface hover:border-border-accent hover:-translate-y-0.5':
              variant === 'secondary',
            // Ghost
            'bg-transparent text-text-secondary border-transparent':
              variant === 'ghost',
            'hover:text-text-primary hover:bg-bg-surface':
              variant === 'ghost',
          },
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
