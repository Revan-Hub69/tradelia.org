'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectAdvancedOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectAdvancedProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: SelectAdvancedOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  multiSelect?: boolean;
  className?: string;
  id?: string;
}

/**
 * Select Advanced Component
 * Select con search, multi-select, accessibilità
 * Riferimento: WAI-ARIA Combobox Pattern, Material Design Select
 */
export function SelectAdvanced({
  label,
  error,
  helperText,
  required,
  options,
  value,
  onChange,
  placeholder = 'Seleziona...',
  searchable = true,
  multiSelect = false,
  className,
  id,
}: SelectAdvancedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectId = id || `select-advanced-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  // Filter options by search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group options
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectAdvancedOption[]>);

  // Check if value is selected
  const isSelected = (optionValue: string) => {
    if (multiSelect && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Handle selection
  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Handle remove (multi-select)
  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect && Array.isArray(value)) {
      onChange?.(value.filter((v) => v !== optionValue));
    }
  };

  // Get selected labels
  const getSelectedLabels = () => {
    if (multiSelect && Array.isArray(value)) {
      return value
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean) as string[];
    }
    return options.find((o) => o.value === value)?.label;
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

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
      <div ref={containerRef} className="relative">
        <button
          type="button"
          id={selectId}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-3 py-2 bg-bg-surface border rounded-lg text-text-primary',
            'flex items-center justify-between gap-2',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-border-subtle hover:border-accent/40',
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
          aria-required={required}
        >
          <span className="flex-1 text-left truncate">
            {multiSelect && Array.isArray(value) ? (
              value.length > 0 ? (
                <span className="flex items-center gap-1 flex-wrap">
                  {(() => {
                    const labels = getSelectedLabels();
                    return Array.isArray(labels) ? labels.slice(0, 2).map((label, idx) => {
                      const val = Array.isArray(value) ? value[idx] : '';
                      return (
                        <span
                          key={val}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 border border-accent/40 rounded text-xs"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={(e) => handleRemove(val, e)}
                            className="hover:text-red-400"
                            aria-label={`Rimuovi ${label}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    }) : [];
                  })()}
                  {value.length > 2 && (
                    <span className="text-text-tertiary text-xs">+{value.length - 2}</span>
                  )}
                </span>
              ) : (
                <span className="text-text-tertiary">{placeholder}</span>
              )
            ) : (
              getSelectedLabels() || <span className="text-text-tertiary">{placeholder}</span>
            )}
          </span>
          <ChevronDown
            className={cn('w-4 h-4 text-text-tertiary transition-transform', isOpen && 'rotate-180')}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-bg-soft border border-border-subtle rounded-lg shadow-lg max-h-60 overflow-hidden"
            role="listbox"
          >
            {searchable && (
              <div className="p-2 border-b border-border-subtle">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca..."
                    className="w-full pl-8 pr-3 py-1.5 bg-bg-surface border border-border-subtle rounded text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            )}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-text-tertiary text-center">
                  Nessun risultato
                </div>
              ) : (
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <div key={group}>
                    {group !== 'Other' && (
                      <div className="px-3 py-1.5 text-xs font-semibold text-text-tertiary bg-bg-surface">
                        {group}
                      </div>
                    )}
                    {groupOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm text-text-primary',
                          'hover:bg-accent/10 transition-colors',
                          'flex items-center justify-between gap-2',
                          isSelected(option.value) && 'bg-accent/20',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        role="option"
                        aria-selected={isSelected(option.value)}
                      >
                        <span>{option.label}</span>
                        {isSelected(option.value) && (
                          <Check className="w-4 h-4 text-accent" aria-hidden="true" />
                        )}
                      </button>
                    ))}
                  </div>
                ))
              </div>
            )}
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

