'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb Component - Navigation breadcrumb trail
 * Best Practice 2024-2025: Clear navigation hierarchy
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();
  const { t, locale } = useTranslations();

  // Se non ci sono items, genera automaticamente dal pathname
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(pathname, locale, t);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <ol className="flex items-center gap-2 flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isHome = item.href === '/' || item.href === buildLocalePath(locale, '/');

          return (
            <li
              key={index}
              className="flex items-center gap-2"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isLast ? (
                <span
                  className="text-text-secondary font-medium"
                  itemProp="name"
                  aria-current="page"
                >
                  {isHome ? (
                    <span className="flex items-center gap-1.5">
                      <Home className="w-4 h-4" aria-hidden="true" />
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <>
                  {isHome ? (
                    <Link
                      href={item.href || '/'}
                      className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors"
                      itemProp="item"
                    >
                      <Home className="w-4 h-4" aria-hidden="true" />
                      <span itemProp="name">{item.label}</span>
                    </Link>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className="text-text-tertiary hover:text-text-primary transition-colors"
                      itemProp="item"
                    >
                      <span itemProp="name">{item.label}</span>
                    </Link>
                  )}
                  <ChevronRight
                    className="w-4 h-4 text-text-tertiary flex-shrink-0"
                    aria-hidden="true"
                  />
                </>
              )}
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Genera breadcrumb automaticamente dal pathname
 */
function generateBreadcrumbs(
  pathname: string,
  locale: string,
  t: (key: string, fallback?: string) => string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];

  // Home sempre presente
  items.push({
    label: t('breadcrumb.home') || 'Home',
    href: buildLocalePath(locale, '/'),
  });

  // Rimuovi locale prefix se presente
  let path = pathname;
  if (locale !== 'it' && pathname.startsWith(`/${locale}`)) {
    path = pathname.slice(locale.length + 1);
  }

  // Split path e genera breadcrumb
  const segments = path.split('/').filter(Boolean);

  // Mappa segmenti a label tradotte
  const segmentLabels: Record<string, string> = {
    dashboard: t('breadcrumb.dashboard') || 'Dashboard',
    reports: t('breadcrumb.reports') || 'Report',
    education: t('breadcrumb.education') || 'Formazione',
    settings: t('breadcrumb.settings') || 'Impostazioni',
    requests: t('breadcrumb.requests') || 'Richieste',
    voting: t('breadcrumb.voting') || 'Votazioni',
    utilities: t('breadcrumb.utilities') || 'Utilities',
    billing: t('breadcrumb.billing') || 'Billing',
    watchlist: t('breadcrumb.watchlist') || 'Watchlist',
    widgets: t('breadcrumb.widgets') || 'Widgets',
    notifications: t('breadcrumb.notifications') || 'Notifiche',
    favorites: t('breadcrumb.favorites') || 'Preferiti',
    activity: t('breadcrumb.activity') || 'Attività',
    print: t('breadcrumb.print') || 'Stampa',
    admin: t('breadcrumb.admin') || 'Admin',
    glossary: t('breadcrumb.glossary') || 'Glossario',
    pricing: t('breadcrumb.pricing') || 'Pricing',
    faq: t('breadcrumb.faq') || 'FAQ',
    support: t('breadcrumb.support') || 'Supporto',
    about: t('breadcrumb.about') || 'Chi Siamo',
    contact: t('breadcrumb.contact') || 'Contatti',
    privacy: t('breadcrumb.privacy') || 'Privacy',
    terms: t('breadcrumb.terms') || 'Termini',
    cookie: t('breadcrumb.cookie') || 'Cookie',
    checkout: t('breadcrumb.checkout') || 'Checkout',
    login: t('breadcrumb.login') || 'Login',
    courses: t('breadcrumb.courses') || 'Corsi',
    lessons: t('breadcrumb.lessons') || 'Lezioni',
    analysis: t('breadcrumb.analysis') || 'Analisi',
    pdf: t('breadcrumb.pdf') || 'PDF',
    customize: t('breadcrumb.customize') || 'Personalizza',
    'pdf-customize': t('breadcrumb.pdfCustomize') || 'Personalizza PDF',
  };

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const fullPath = locale !== 'it' ? `/${locale}${currentPath}` : currentPath;

    // Usa label tradotta se disponibile, altrimenti capitalizza il segmento
    // Gestisci anche percorsi composti come "pdf-customize"
    let label = segmentLabels[segment];
    if (!label) {
      // Prova a trovare label per percorsi composti (es: "pdf-customize" -> "pdfCustomize")
      const camelCase = segment.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      label = segmentLabels[camelCase] || segmentLabels[segment.split('-')[0]];
    }
    
    // Se ancora non trovato, capitalizza e sostituisci trattini
    if (!label) {
      label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    items.push({
      label,
      href: fullPath,
    });
  });

  return items;
}
