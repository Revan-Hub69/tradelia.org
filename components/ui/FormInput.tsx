'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle } from 'lucide-react';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Form Input Component
 * Input con validazione, error states, accessibilità
 * Riferimento: WCAG 2.1 AAA, React Hook Form Best Practices
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, required, className, id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3 py-2 bg-bg-surface border rounded-lg text-text-primary',
              'placeholder:text-text-tertiary',
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
          />
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-4 h-4 text-red-400" aria-hidden="true" />
            </div>
          )}
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
          <p id={helperId} className="text-xs text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

