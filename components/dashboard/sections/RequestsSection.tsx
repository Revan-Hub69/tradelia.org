'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import Link from 'next/link';
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export function RequestsSection() {
  const { t, locale } = useTranslations();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('analysis_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error('Error loading requests:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.requests.title') || 'Richieste Analisi'}
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
          <TrendingUp className="w-5 h-5 text-accent" />
          {t('dashboard.requests.title') || 'Richieste Analisi'}
        </h2>
        <Link
          href={buildLocalePath(locale, '/dashboard/requests')}
          className="text-sm text-accent hover:text-accent-hover font-medium"
        >
          {t('common.viewAll') || 'Vedi tutte'} →
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm mb-4">
            {t('dashboard.requests.empty') || 'Nessuna richiesta trovata'}
          </p>
          <Link
            href={buildLocalePath(locale, '/dashboard/requests')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
          >
            <TrendingUp className="w-4 h-4" />
            {t('dashboard.requests.newRequest') || 'Nuova Richiesta'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={buildLocalePath(locale, `/dashboard/requests/${request.id}`)}
              className="block p-4 bg-bg-base border border-border-subtle rounded-lg hover:border-accent/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(request.status)}
                    <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                      {request.symbol || request.asset_name || 'Richiesta Analisi'}
                    </h3>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    {t('dashboard.requests.created') || 'Creata'}: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-bg-soft rounded text-text-secondary">
                  {t(`dashboard.requests.status.${request.status}`) || request.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
