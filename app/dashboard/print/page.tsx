'use client';

import { useState } from 'react';
import { Printer, FileText, Download, Settings, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { DownloadPDFModal } from '@/components/dashboard/modals/DownloadPDFModal';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { toast } from '@/components/ui/Toast';

interface Report {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  report_type: string;
  status: string;
  created_at: string;
}

/**
 * Print Section Page
 * Sezione dedicata per stampa e download report
 * PRO/DESK: Accesso completo
 * BASE: Limitato
 */
export default function PrintPage() {
  const { t } = useTranslations();
  const isPro = useIsPro();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const { data: reportsData, loading, error, retry } = useApi<Report[]>(
    '/api/dashboard/reports',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const reports = reportsData || [];

  const handlePrint = (reportId: string) => {
    if (!isPro) {
      toast.error(t('dashboard.print.proRequired') || 'Account Pro richiesto per la stampa');
      return;
    }

    // Apri report in nuova finestra con print styles
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      window.open(`/reports/${report.slug}?print=true`, '_blank');
    }
  };

  const handleDownload = (reportId: string) => {
    if (!isPro) {
      toast.error(t('dashboard.print.proRequired') || 'Account Pro richiesto per il download');
      return;
    }

    setSelectedReport(reportId);
    setDownloadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('dashboard.print.loading') || 'Caricamento report...'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('dashboard.print.errorTitle') || 'Errore'}
          message={t('dashboard.print.errorMessage') || 'Impossibile caricare i report'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <Printer className="w-8 h-8 text-accent" />
          {t('dashboard.print.title') || 'Stampa e Download'}
        </h1>
        <p className="text-text-secondary">
          {t('dashboard.print.description') || 'Stampa e scarica i tuoi report in formato PDF, Excel o CSV'}
        </p>
        {!isPro && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-sm text-text-secondary">
              {t('dashboard.print.proRequiredDesc') || 'Account Pro richiesto per stampa e download. Aggiorna il tuo account per sbloccare questa funzionalità.'}
            </p>
          </div>
        )}
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title={t('dashboard.print.empty') || 'Nessun report disponibile'}
          description={t('dashboard.print.emptyDesc') || 'Non ci sono report disponibili per la stampa'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-bg-soft border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-2">{report.title}</h3>
                  {report.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                      {report.description}
                    </p>
                  )}
                </div>
                <span className="px-2 py-1 bg-accent/20 border border-accent/40 rounded text-xs text-accent font-medium">
                  {report.report_type}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(report.id)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Printer className="w-4 h-4" />
                      {t('dashboard.print.print') || 'Stampa'}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(report.id)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Download className="w-4 h-4" />
                      {t('dashboard.print.download') || 'Download'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info(t('dashboard.print.upgrade') || 'Aggiorna a Pro per stampare e scaricare');
                    }}
                    className="flex items-center gap-2 w-full"
                  >
                    <Settings className="w-4 h-4" />
                    {t('dashboard.print.upgrade') || 'Aggiorna a Pro'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download Modal */}
      {selectedReport && (
        <DownloadPDFModal
          isOpen={downloadModalOpen}
          onClose={() => {
            setDownloadModalOpen(false);
            setSelectedReport(null);
          }}
          reportId={selectedReport}
        />
      )}
      </div>
    </div>
  );
}

