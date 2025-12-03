'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AccordionContextValue {
  value: string | null;
  onValueChange: (value: string | null) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ type = 'single', collapsible = true, children, className }: AccordionProps) {
  const [value, setValue] = React.useState<string | null>(null);

  const onValueChange = React.useCallback((newValue: string | null) => {
    if (type === 'single') {
      setValue((prev) => collapsible && prev === newValue ? null : newValue);
    }
  }, [type, collapsible]);

  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div className={cn('space-y-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const AccordionItemContext = React.createContext<{ value: string } | undefined>(undefined);

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn('border border-border-subtle rounded-lg overflow-hidden', className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context) throw new Error('AccordionTrigger must be used within Accordion');
  if (!itemContext) throw new Error('AccordionTrigger must be used within AccordionItem');

  const isOpen = context.value === itemContext.value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(itemContext.value)}
      className={cn(
        'w-full flex items-center justify-between p-4 text-left hover:bg-bg-surface transition-colors',
        className
      )}
    >
      <span className="font-medium text-text-primary">{children}</span>
      <ChevronDown
        className={cn(
          'w-5 h-5 text-text-secondary transition-transform flex-shrink-0 ml-4',
          isOpen && 'transform rotate-180'
        )}
      />
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const context = React.useContext(AccordionContext);
  const itemContext = React.useContext(AccordionItemContext);
  
  if (!context) throw new Error('AccordionContent must be used within Accordion');
  if (!itemContext) throw new Error('AccordionContent must be used within AccordionItem');

  const isOpen = context.value === itemContext.value;

  if (!isOpen) return null;

  return (
    <div className={cn('p-4 pt-0 text-text-secondary', className)}>
      {children}
    </div>
  );
}
