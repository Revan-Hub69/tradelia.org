'use client';

import { useState } from 'react';
import { TrendingUp, Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

interface AnalysisRequest {
  id: string;
  asset_symbol: string;
  asset_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
  notes: string | null;
}

/**
 * Requests Page
 * Storico richieste analisi
 * BASE: Visualizzazione richieste
 * PRO: Richiedi nuova analisi, download risultati
 */
export default function RequestsPage() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');

  const { data: requestsData, loading, error, retry } = useApi<AnalysisRequest[]>(
    '/api/dashboard/analysis-requests',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const filteredRequests = requestsData?.filter((request) => {
    const matchesSearch = searchQuery === '' || 
      request.asset_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.asset_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || request.status === filter;

    return matchesSearch && matchesFilter;
  }) || [];

  const getStatusIcon = (status: AnalysisRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'processing':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusLabel = (status: AnalysisRequest['status']) => {
    switch (status) {
      case 'pending':
        return t('dashboard.requests.status.pending') || 'In Attesa';
      case 'processing':
        return t('dashboard.requests.status.processing') || 'In Elaborazione';
      case 'completed':
        return t('dashboard.requests.status.completed') || 'Completata';
      case 'failed':
        return t('dashboard.requests.status.failed') || 'Fallita';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: locale === 'it' ? itLocale : undefined,
      });
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('dashboard.requests.loading') || 'Caricamento richieste...'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('dashboard.requests.errorTitle') || 'Errore'}
          message={t('dashboard.requests.errorMessage') || 'Impossibile caricare le richieste'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-accent" />
            {t('dashboard.requests.title') || 'Richieste Analisi'}
          </h1>
          <p className="text-text-secondary">
            {t('dashboard.requests.description') || 'Visualizza lo stato delle tue richieste di analisi'}
          </p>
        </div>
        {isPro && (
          <Button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-pro-utilities'));
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('select-utility', { detail: 'request-analysis' }));
              }, 300);
            }}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {t('dashboard.requests.newRequest') || 'Nuova Richiesta'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.requests.search') || 'Cerca per simbolo o nome asset...'}
            className="w-full pl-10 pr-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-text-tertiary" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent"
          >
            <option value="all">{t('dashboard.requests.filterAll') || 'Tutte'}</option>
            <option value="pending">{t('dashboard.requests.filterPending') || 'In Attesa'}</option>
            <option value="processing">{t('dashboard.requests.filterProcessing') || 'In Elaborazione'}</option>
            <option value="completed">{t('dashboard.requests.filterCompleted') || 'Completate'}</option>
            <option value="failed">{t('dashboard.requests.filterFailed') || 'Fallite'}</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12" />}
          title={t('dashboard.requests.empty') || 'Nessuna richiesta trovata'}
          description={t('dashboard.requests.emptyDesc') || 'Non ci sono richieste di analisi al momento'}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-bg-soft border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary text-lg">
                      {request.asset_name || request.asset_symbol}
                    </h3>
                    <span className="px-2 py-1 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary font-mono">
                      {request.asset_symbol}
                    </span>
                  </div>
                  {request.notes && (
                    <p className="text-sm text-text-secondary mb-3">{request.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <span className="text-sm font-medium text-text-primary">
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-text-tertiary">
                <div className="flex items-center gap-4">
                  <span>
                    {t('dashboard.requests.created') || 'Creata'}: {formatTime(request.created_at)}
                  </span>
                  {request.completed_at && (
                    <span>
                      {t('dashboard.requests.completed') || 'Completata'}: {formatTime(request.completed_at)}
                    </span>
                  )}
                </div>
                {request.status === 'completed' && isPro && (
                  <button className="text-accent hover:text-accent-hover transition-colors">
                    {t('dashboard.requests.download') || 'Scarica Risultati'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

