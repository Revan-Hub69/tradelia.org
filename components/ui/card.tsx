import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const cardVariants = cva(
  'relative overflow-hidden rounded-xl micro-interaction gpu-accelerated',
  {
    variants: {
      variant: {
        default: 'glass border border-border shadow-md',
        elevated: 'glass-strong border border-border-strong shadow-lg',
        gradient: 'glass border border-border shadow-md',
        academic: 'card-academic',
      },
      hover: {
        true: 'hover:border-border-accent transition-colors duration-200',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hover: true,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover }), className)}
        {...props}
      >
        {/* Subtle gradient overlay on hover */}
        {hover && (
          <div className="absolute inset-0 bg-gradient-accent opacity-0 transition-opacity duration-500 hover:opacity-10 -z-0" />
        )}
        {/* Top border accent on hover - Academic */}
        {hover && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-primary scale-x-0 origin-left transition-transform duration-500 hover:scale-x-100 rounded-full" />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-text-primary',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-text-secondary', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
