'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';

export function ReportsSection() {
  const { t, locale } = useTranslations();
  
  const { data: reports, loading, error, retry } = useApi<any[]>(
    '/api/dashboard/reports?status=active',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
      requireAuth: false, // Permetti accesso guest
      onError: (err) => {
        // Non mostrare errore - l'API restituisce array vuoto se non ci sono dati
        console.error('Error loading reports:', err);
      },
    }
  );

  const reportsList = (reports || []).slice(0, 6); // Limita a 6 per la preview

  if (loading) {
    return (
      <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.modules.items.reports.title') || 'Report Ufficiali'}
        </h2>
        <LoadingState message={t('dashboard.modules.items.reports.loading') || 'Caricamento report...'} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.modules.items.reports.title') || 'Report Ufficiali'}
        </h2>
        <ErrorState
          title={t('dashboard.modules.items.reports.errorTitle') || 'Errore'}
          message={t('dashboard.modules.items.reports.errorMessage') || 'Impossibile caricare i report'}
          onRetry={retry}
        />
      </section>
    );
  }

  return (
    <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          {t('dashboard.modules.items.reports.title') || 'Report Ufficiali'}
        </h2>
        {reportsList.length > 0 && (
          <Link
            href={buildLocalePath(locale, '/dashboard/reports')}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            {t('common.viewAll') || 'Vedi tutti'} →
          </Link>
        )}
      </div>

      {reportsList.length === 0 ? (
        <p className="text-text-secondary text-sm">
          {t('dashboard.modules.items.reports.empty') || 'Nessun report disponibile'}
        </p>
      ) : (
        <div className="space-y-3">
          {reportsList.map((report) => (
            <Link
              key={report.id}
              href={buildLocalePath(locale, `/reports/${report.slug || report.id}`)}
              className="block p-4 bg-bg-base border border-border-subtle rounded-lg hover:border-accent/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary mb-1 group-hover:text-blue-400 transition-colors">
                    {report.title}
                  </h3>
                  {report.description && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {report.description}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
