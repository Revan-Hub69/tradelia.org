'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import Link from 'next/link';
import { BarChart3, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';

export function VotingSection() {
  const { t, locale } = useTranslations();
  
  const { data: proposals, loading, error, retry } = useApi<any[]>(
    '/api/dashboard/voting',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
      requireAuth: false, // Permetti accesso guest (restituisce array vuoto)
      onError: (err) => {
        // Non mostrare errore - l'API restituisce array vuoto se non ci sono dati
        console.error('Error loading proposals:', err);
      },
    }
  );

  const proposalsList = (proposals || []).slice(0, 5); // Limita a 5 per la preview

  if (loading) {
    return (
      <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.voting.title') || 'Votazione Asset'}
        </h2>
        <LoadingState message={t('dashboard.voting.loading') || 'Caricamento proposte...'} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.voting.title') || 'Votazione Asset'}
        </h2>
        <ErrorState
          title={t('dashboard.voting.errorTitle') || 'Errore'}
          message={t('dashboard.voting.errorMessage') || 'Impossibile caricare le proposte'}
          onRetry={retry}
        />
      </section>
    );
  }

  return (
    <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          {t('dashboard.voting.title') || 'Votazione Asset'}
        </h2>
        {proposalsList.length > 0 && (
          <Link
            href={buildLocalePath(locale, '/dashboard/voting')}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            {t('common.viewAll') || 'Vedi tutte'} →
          </Link>
        )}
      </div>

      {proposalsList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm mb-4">
            {t('dashboard.voting.empty') || 'Nessuna proposta trovata'}
          </p>
          <Link
            href={buildLocalePath(locale, '/dashboard/voting')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            {t('dashboard.voting.propose') || 'Proponi Asset'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proposalsList.map((proposal) => (
            <Link
              key={proposal.id}
              href={buildLocalePath(locale, `/dashboard/voting/${proposal.id}`)}
              className="block p-4 bg-bg-base border border-border-subtle rounded-lg hover:border-accent/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary mb-1 group-hover:text-blue-400 transition-colors">
                    {proposal.asset_symbol || proposal.symbol} - {proposal.asset_name}
                  </h3>
                  {proposal.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {proposal.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {proposal.votes_up || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" />
                      {proposal.votes_down || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
