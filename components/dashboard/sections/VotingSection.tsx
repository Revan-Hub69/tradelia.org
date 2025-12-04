'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import Link from 'next/link';
import { BarChart3, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export function VotingSection() {
  const { t, locale } = useTranslations();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProposals() {
      try {
        const { data, error } = await supabase
          .from('asset_proposals')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setProposals(data || []);
      } catch (error) {
        console.error('Error loading proposals:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProposals();
  }, []);

  if (loading) {
    return (
      <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.voting.title') || 'Votazione Asset'}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-soft rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          {t('dashboard.voting.title') || 'Votazione Asset'}
        </h2>
        <Link
          href={buildLocalePath(locale, '/dashboard/voting')}
          className="text-sm text-accent hover:text-accent-hover font-medium"
        >
          {t('common.viewAll') || 'Vedi tutte'} →
        </Link>
      </div>

      {proposals.length === 0 ? (
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
          {proposals.map((proposal) => (
            <Link
              key={proposal.id}
              href={buildLocalePath(locale, `/dashboard/voting/${proposal.id}`)}
              className="block p-4 bg-bg-base border border-border-subtle rounded-lg hover:border-accent/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
                    {proposal.symbol} - {proposal.asset_name}
                  </h3>
                  {proposal.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {proposal.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
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
