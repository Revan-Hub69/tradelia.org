'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Download, Eye, Share2, X, FileText, Calendar, User } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale, enUS as enLocale } from 'date-fns/locale';

interface Report {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  report_type: string;
  content: any;
  content_json: any;
  status: string;
  created_at: string;
  updated_at: string;
  author?: string;
}

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
}

/**
 * Report Detail Modal
 * Mostra dettaglio completo del report con opzioni download/condivisione
 */
export function ReportDetailModal({
  isOpen,
  onClose,
  reportId,
}: ReportDetailModalProps) {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [downloading, setDownloading] = useState(false);

  // Fetch report by ID - need to get slug first or use a different endpoint
  const { data: report, loading, error, retry } = useApi<Report>(
    reportId ? `/api/dashboard/reports?id=${reportId}` : null,
    {
      cacheTime: 5 * 60 * 1000,
      enabled: isOpen && !!reportId,
    }
  );

  const handleDownload = async () => {
    if (!report || !isPro) {
      toast.error(t('dashboard.reports.proRequired') || 'Account Pro richiesto per il download');
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(`/api/reports/${report.id}/export?format=${downloadFormat}&quality=standard&charts=true`);
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error(t('dashboard.reports.proRequired') || 'Account Pro richiesto');
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
      a.download = `${report.slug || report.title}-${new Date().toISOString().split('T')[0]}.${downloadFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('dashboard.reports.downloadSuccess') || 'Download completato con successo!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : t('dashboard.reports.downloadError') || 'Errore durante il download');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;

    const shareUrl = `${window.location.origin}/reports/${report.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.description || '',
          url: shareUrl,
        });
        toast.success(t('dashboard.reports.shareSuccess') || 'Condivisione completata!');
      } catch (error) {
        // User cancelled or error
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('dashboard.reports.linkCopied') || 'Link copiato negli appunti!');
    }
  };

  const dateLocale = locale === 'it' ? itLocale : enLocale;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dashboard.reports.detailTitle') || 'Dettaglio Report'}
      size="xl"
    >
      {loading && (
        <div className="py-8">
          <LoadingState message={t('dashboard.reports.loading') || 'Caricamento report...'} />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState
            title={t('dashboard.reports.errorTitle') || 'Errore'}
            message={t('dashboard.reports.errorMessage') || 'Impossibile caricare il report'}
            onRetry={retry}
          />
        </div>
      )}

      {report && !loading && !error && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-border-subtle pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-text-primary mb-2">{report.title}</h2>
                {report.description && (
                  <p className="text-text-secondary">{report.description}</p>
                )}
              </div>
              <span className="px-3 py-1 bg-accent/20 border border-accent/40 rounded-lg text-sm text-accent font-medium">
                {report.report_type}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(report.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>
              {report.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{report.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="capitalize">{report.status}</span>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="max-h-96 overflow-y-auto">
            {report.content_json ? (
              <div className="prose prose-invert max-w-none">
                {typeof report.content_json === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: report.content_json }} />
                ) : (
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap">
                    {JSON.stringify(report.content_json, null, 2)}
                  </pre>
                )}
              </div>
            ) : report.content ? (
              <div className="prose prose-invert max-w-none">
                {typeof report.content === 'string' ? (
                  <p className="text-text-secondary whitespace-pre-wrap">{report.content}</p>
                ) : (
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap">
                    {JSON.stringify(report.content, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-text-tertiary">
                {t('dashboard.reports.noContent') || 'Nessun contenuto disponibile'}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-subtle">
            <Link
              href={`/reports/${report.slug}`}
              className="flex-1"
            >
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {t('dashboard.reports.viewFull') || 'Visualizza Completo'}
              </Button>
            </Link>

            {isPro && (
              <>
                <div className="flex gap-2">
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as any)}
                    className="px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent"
                    disabled={downloading}
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {t('dashboard.reports.downloading') || 'Download...'}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        {t('dashboard.reports.download') || 'Scarica'}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {t('dashboard.reports.share') || 'Condividi'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

