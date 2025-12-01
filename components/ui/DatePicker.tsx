'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  locale?: string;
}

/**
 * Date Picker Component
 * Date input accessibile e localizzato
 * Riferimento: WCAG 2.1 AAA, W3C Date Input Best Practices
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helperText, required, className, id, locale, ...props }, ref) => {
    const { locale: currentLocale } = useTranslations();
    const datePickerId = id || `datepicker-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${datePickerId}-error` : undefined;
    const helperId = helperText ? `${datePickerId}-helper` : undefined;
    const finalLocale = locale || currentLocale || 'it-IT';

    // Formatta la data per il formato locale
    const formatDateForInput = (date: string | undefined) => {
      if (!date) return '';
      try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch {
        return '';
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={datePickerId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calendar className="w-4 h-4 text-text-tertiary" aria-hidden="true" />
          </div>
          <input
            ref={ref}
            id={datePickerId}
            type="date"
            className={cn(
              'w-full pl-10 pr-3 py-2 bg-bg-surface border rounded-lg text-text-primary',
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
            lang={finalLocale}
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

DatePicker.displayName = 'DatePicker';

