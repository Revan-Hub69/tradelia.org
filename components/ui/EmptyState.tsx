'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-text-secondary opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

