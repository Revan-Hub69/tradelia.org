import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          'flex h-11 w-full rounded-md border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return <Select ref={ref} className={className} {...props} />;
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = ({ children, ...props }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const SelectItem = ({ children, value, ...props }: { children: React.ReactNode; value: string }) => {
  return <option value={value} {...props}>{children}</option>;
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return null; // Placeholder per compatibilità, il valore viene gestito dal select
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };

