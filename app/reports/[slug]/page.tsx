'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FileText, Printer, Download, Share2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Button } from '@/components/ui/button';
import { PrintWatermark } from '@/components/reports/PrintWatermark';
import { DownloadPDFModal } from '@/components/dashboard/modals/DownloadPDFModal';
import { toast } from '@/components/ui/Toast';

interface Report {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  report_type: string;
  content: any;
  content_json: any;
  created_at: string;
  updated_at: string;
}

/**
 * Report Detail Page
 * Visualizza report completo con opzioni stampa/download
 * PRO/DESK: Stampa e download disponibili
 * BASE: Solo visualizzazione
 */
export default function ReportDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useTranslations();
  const isPro = useIsPro();
  const slug = params.slug as string;
  const isPrintMode = searchParams.get('print') === 'true';
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const { data: report, loading, error, retry } = useApi<Report>(
    `/api/reports/${slug}`,
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Auto-print se in print mode
  useEffect(() => {
    if (isPrintMode && report && isPro) {
      // Delay per permettere rendering completo
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [isPrintMode, report, isPro]);

  const handlePrint = () => {
    if (!isPro) {
      toast.error(t('dashboard.print.proRequired') || 'Account Pro richiesto per la stampa');
      return;
    }

    // Apri in print mode
    window.open(`/reports/${slug}?print=true`, '_blank');
  };

  const handleDownload = () => {
    if (!isPro) {
      toast.error(t('dashboard.print.proRequired') || 'Account Pro richiesto per il download');
      return;
    }

    if (report) {
      setDownloadModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('dashboard.reports.loading') || 'Caricamento report...'} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('dashboard.reports.errorTitle') || 'Errore'}
          message={t('dashboard.reports.errorMessage') || 'Report non trovato'}
          onRetry={retry}
        />
      </div>
    );
  }

  // Parse content
  let contentData: any = {};
  if (report.content || report.content_json) {
    try {
      contentData = typeof (report.content || report.content_json) === 'string'
        ? JSON.parse(report.content || report.content_json)
        : (report.content || report.content_json);
    } catch {
      contentData = {};
    }
  }

  return (
    <>
      {/* Watermark solo in print mode */}
      {isPrintMode && <PrintWatermark />}

      <div className={`min-h-screen p-6 max-w-7xl mx-auto ${isPrintMode ? 'print-mode' : ''}`}>
        {/* Header con actions */}
        {!isPrintMode && (
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-accent" />
                {report.title}
              </h1>
              {report.description && (
                <p className="text-text-secondary">{report.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isPro ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    {t('dashboard.print.print') || 'Stampa'}
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t('dashboard.print.download') || 'Download'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info(t('dashboard.print.upgrade') || 'Aggiorna a Pro per stampare e scaricare');
                  }}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {t('dashboard.print.upgrade') || 'Aggiorna a Pro'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Report Content */}
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-8">
          {/* Render content sections */}
          {contentData.executiveSummary && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Executive Summary
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {contentData.executiveSummary}
              </p>
            </section>
          )}

          {contentData.sections && Array.isArray(contentData.sections) && (
            contentData.sections.map((section: any, index: number) => (
              <section key={section.id || index} className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  {section.title || `Sezione ${index + 1}`}
                </h2>
                {section.subtitle && (
                  <h3 className="text-xl font-semibold text-text-secondary mb-3">
                    {section.subtitle}
                  </h3>
                )}
                {section.content && (
                  <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                )}
              </section>
            ))
          )}

          {/* Se non ci sono sezioni, mostra description */}
          {(!contentData.sections || contentData.sections.length === 0) && (
            <div className="text-text-secondary leading-relaxed">
              {report.description || 'Nessun contenuto disponibile.'}
            </div>
          )}
        </div>
      </div>

      {/* Download Modal */}
      {report && (
        <DownloadPDFModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          reportId={report.id}
        />
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print-mode {
            padding: 0;
          }
          
          /* Nascondi header actions in print */
          button, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

