'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import Link from 'next/link';
import { FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { Skeleton } from '@/components/ui/Skeleton';

// Lazy load components
const ReportsSection = dynamic(() => 
  import('./sections/ReportsSection').then(m => ({ default: m.ReportsSection }))
);
const RequestsSection = dynamic(() => 
  import('./sections/RequestsSection').then(m => ({ default: m.RequestsSection }))
);
const VotingSection = dynamic(() => 
  import('./sections/VotingSection').then(m => ({ default: m.VotingSection }))
);

/**
 * Analysis Content - Tab Analisi
 * Best Practice 2024-2025: Web App Design
 * Organizza report, richieste analisi e votazioni in una vista dedicata
 */
export function AnalysisContent() {
  const { t, locale } = useTranslations();

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            {t('dashboard.analysis.title') || 'Analisi'}
          </h1>
          <p className="text-text-secondary text-lg">
            {t('dashboard.analysis.description') || 'Report, richieste analisi e strumenti di analisi finanziaria'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href={buildLocalePath(locale, '/dashboard/reports')}
            className="p-4 bg-bg-surface border border-border-subtle rounded-xl hover:border-accent/40 hover:shadow-lg transition-all group"
          >
            <FileText className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-text-primary mb-1">
              {t('dashboard.modules.items.reports.title') || 'Report Ufficiali'}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('dashboard.modules.items.reports.description') || 'Consulta i report pubblici e le analisi disponibili'}
            </p>
          </Link>

          <Link
            href={buildLocalePath(locale, '/dashboard/requests')}
            className="p-4 bg-bg-surface border border-border-subtle rounded-xl hover:border-accent/40 hover:shadow-lg transition-all group"
          >
            <TrendingUp className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-text-primary mb-1">
              {t('dashboard.requests.title') || 'Richieste Analisi'}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('dashboard.requests.description') || 'Visualizza lo stato delle tue richieste di analisi'}
            </p>
          </Link>

          <Link
            href={buildLocalePath(locale, '/dashboard/voting')}
            className="p-4 bg-bg-surface border border-border-subtle rounded-xl hover:border-accent/40 hover:shadow-lg transition-all group"
          >
            <BarChart3 className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-text-primary mb-1">
              {t('dashboard.voting.title') || 'Votazione Asset'}
            </h3>
            <p className="text-sm text-text-secondary">
              {t('dashboard.voting.description') || 'Vota gli asset che vorresti vedere analizzati'}
            </p>
          </Link>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <ReportsSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <RequestsSection />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <VotingSection />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
