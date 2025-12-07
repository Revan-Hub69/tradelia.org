'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: FormSelectOption[];
  placeholder?: string;
}

/**
 * Form Select Component
 * Select con validazione, error states, accessibilità
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, required, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-3 py-2 bg-bg-surface border rounded-lg text-text-primary',
              'appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-border-subtle hover:border-accent/40',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperId}
            aria-required={required}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-400" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-secondary" aria-hidden="true" />
            )}
          </div>
        </div>
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-400 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

