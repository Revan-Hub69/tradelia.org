'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Download, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale, enUS as enLocale } from 'date-fns/locale';

interface AnalysisRequest {
  id: string;
  asset_symbol: string;
  asset_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId?: string;
}

/**
 * Request Detail Modal
 * Mostra dettaglio completo della richiesta di analisi con timeline e risultati
 */
export function RequestDetailModal({
  isOpen,
  onClose,
  requestId,
}: RequestDetailModalProps) {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [downloading, setDownloading] = useState(false);

  const { data: request, loading, error, retry } = useApi<AnalysisRequest>(
    requestId ? `/api/dashboard/analysis-requests/${requestId}` : null,
    {
      cacheTime: 5 * 60 * 1000,
      enabled: isOpen && !!requestId,
    }
  );

  const dateLocale = locale === 'it' ? itLocale : enLocale;

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

  const getPriorityLabel = (priority: AnalysisRequest['priority']) => {
    switch (priority) {
      case 'low':
        return t('dashboard.requests.priorityLow') || 'Bassa';
      case 'normal':
        return t('dashboard.requests.priorityNormal') || 'Normale';
      case 'high':
        return t('dashboard.requests.priorityHigh') || 'Alta';
    }
  };

  const handleDownload = async () => {
    if (!request || !isPro) {
      toast.error(t('dashboard.requests.proRequired') || 'Account Pro richiesto per il download');
      return;
    }

    if (request.status !== 'completed') {
      toast.error(t('dashboard.requests.notCompleted') || 'La richiesta non è ancora completata');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(`/api/dashboard/analysis-requests/${request.id}/results`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error(t('dashboard.requests.noResults') || 'Risultati non ancora disponibili');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Errore durante il download');
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-results-${request.asset_symbol}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('dashboard.requests.downloadSuccess') || 'Download completato con successo!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : t('dashboard.requests.downloadError') || 'Errore durante il download');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dashboard.requests.detailTitle') || 'Dettaglio Richiesta'}
      size="lg"
    >
      {loading && (
        <div className="py-8">
          <LoadingState message={t('dashboard.requests.loading') || 'Caricamento richiesta...'} />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState
            title={t('dashboard.requests.errorTitle') || 'Errore'}
            message={t('dashboard.requests.errorMessage') || 'Impossibile caricare la richiesta'}
            onRetry={retry}
          />
        </div>
      )}

      {request && !loading && !error && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-border-subtle pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-text-primary">
                    {request.asset_name || request.asset_symbol}
                  </h2>
                  <span className="px-3 py-1 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-secondary font-mono">
                    {request.asset_symbol}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(request.status)}
                <span className="text-sm font-medium text-text-primary">
                  {getStatusLabel(request.status)}
                </span>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {t('dashboard.requests.created') || 'Creata'}: {formatDistanceToNow(new Date(request.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>
              {request.completed_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {t('dashboard.requests.completed') || 'Completata'}: {formatDistanceToNow(new Date(request.completed_at), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>
                  {t('dashboard.requests.priority') || 'Priorità'}: {getPriorityLabel(request.priority)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {request.notes && (
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                {t('dashboard.requests.notes') || 'Note'}
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {request.notes}
              </p>
            </div>
          )}

          {/* Error Message */}
          {request.status === 'failed' && request.error_message && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-400 mb-1">
                    {t('dashboard.requests.errorOccurred') || 'Errore durante l\'elaborazione'}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {request.error_message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {t('dashboard.requests.timeline') || 'Timeline'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {t('dashboard.requests.timelineCreated') || 'Richiesta creata'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(request.created_at).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')}
                  </p>
                </div>
              </div>
              {request.status !== 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {t('dashboard.requests.timelineProcessing') || 'Elaborazione iniziata'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(request.updated_at).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')}
                    </p>
                  </div>
                </div>
              )}
              {request.completed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {t('dashboard.requests.timelineCompleted') || 'Elaborazione completata'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(request.completed_at).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            {request.status === 'completed' && isPro && (
              <Button
                variant="default"
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('dashboard.requests.downloading') || 'Download...'}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t('dashboard.requests.download') || 'Scarica Risultati'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

