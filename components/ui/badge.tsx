import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all duration-300 relative overflow-hidden backdrop-blur-sm',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-accent border border-border-accent text-accent shadow-md shadow-accent-glow/10 hover:-translate-y-0.5 hover:shadow-lg',
        accent:
          'bg-gradient-primary text-white border-transparent shadow-glow hover:-translate-y-0.5',
        outline:
          'bg-transparent border border-border text-text-secondary hover:border-border-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 transition-opacity duration-300 hover:opacity-10 -z-0" />
      <span className="relative z-10">{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
