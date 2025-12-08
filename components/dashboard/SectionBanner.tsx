'use client';

import { ReactNode } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

interface SectionBannerProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Mini banner introduttivo per ogni sezione
 * Sostituisce il banner iniziale del progetto vecchio
 */
export function SectionBanner({ title, description, icon, className }: SectionBannerProps) {
  const { locale } = useTranslations();

  return (
    <div className={cn(
      'bg-bg-soft border border-border-subtle rounded-lg p-4 mb-4',
      'border-l-4 border-l-accent/30',
      className
    )}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="text-accent flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {title}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
