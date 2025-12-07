'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertCircle } from 'lucide-react';

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Form Textarea Component
 * Textarea con validazione, error states, accessibilità
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, required, className, id, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helperId = helperText ? `${textareaId}-helper` : undefined;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={cn(
              'w-full px-3 py-2 bg-bg-surface border rounded-lg text-text-primary',
              'placeholder:text-text-secondary',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors resize-y',
              'min-h-[100px]',
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
            <div className="absolute right-3 top-3">
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
          <p id={helperId} className="text-xs text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

