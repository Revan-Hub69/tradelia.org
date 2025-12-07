'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { t, locale } = useTranslations();
  const dashboardHref = buildLocalePath(locale, '/dashboard');

  const allItems = [
    { label: t('dashboard.breadcrumbs.home') || 'Dashboard', href: dashboardHref },
    ...items,
  ];

  if (allItems.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t('dashboard.breadcrumbs.ariaLabel') || 'Breadcrumb'}
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isFirst ? (
                <Link
                  href={item.href || '#'}
                  className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
                  itemProp="item"
                >
                  <Home className="w-4 h-4" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              ) : isLast ? (
                <span
                  className="text-text-primary font-medium"
                  itemProp="name"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(index + 1)} />
              {!isLast && (
                <ChevronRight className="w-4 h-4 text-text-secondary" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

