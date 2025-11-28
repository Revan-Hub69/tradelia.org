import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium btn-hover gpu-accelerated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white shadow-md hover:bg-accent-hover hover:shadow-lg border border-accent/30 hover:border-accent/50 transition-all duration-200 font-medium',
        secondary:
          'bg-bg-surface text-text-primary border border-border-subtle hover:bg-bg-elevated hover:border-border-default transition-all duration-200 shadow-sm',
        ghost:
          'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface/40 transition-colors duration-200 border border-transparent',
        outline:
          'border border-border-subtle bg-transparent text-text-primary hover:bg-bg-surface hover:border-border-default transition-all duration-200',
      },
      size: {
        default: 'h-11 px-4 py-2 min-h-[44px]', // WCAG 2.5.5: minimum 44x44px touch target
        sm: 'h-11 px-3 text-xs min-h-[44px]', // WCAG compliant
        lg: 'h-12 px-8 text-base min-h-[48px]', // WCAG compliant
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]', // WCAG compliant
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
