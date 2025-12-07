'use client';

import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Eye, Settings } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro, useIsDesk } from '@/lib/hooks/useUserRole';
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DownloadPDFModal } from '@/components/dashboard/modals/DownloadPDFModal';
import { ReportDetailModal } from '@/components/dashboard/modals/ReportDetailModal';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';

interface Report {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  report_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Reports Page
 * Lista tutti i report disponibili
 * BASE: Visualizzazione report base
 * PRO: Download PDF, analisi avanzate
 */
export default function ReportsPage() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const isDesk = useIsDesk();
  const { hasAccess: canCustomizePDF } = useFeatureAccess('reports.pdf.customize');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [previewReportId, setPreviewReportId] = useState<string | null>(null);

  const { data: reportsData, loading, error, retry } = useApi<Report[]>(
    '/api/dashboard/reports',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  const filteredReports = reportsData?.filter((report) => {
    const matchesSearch = searchQuery === '' || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || report.status === filter;

    return matchesSearch && matchesFilter;
  }) || [];

  // Listen for download PDF modal event
  useEffect(() => {
    const handleOpenDownloadModal = (event: Event) => {
      const customEvent = event as CustomEvent;
      const reportId = customEvent.detail?.reportId;
      if (reportId) {
        setSelectedReportId(reportId);
        setDownloadModalOpen(true);
      }
    };

    window.addEventListener('open-download-pdf-modal', handleOpenDownloadModal);
    return () => {
      window.removeEventListener('open-download-pdf-modal', handleOpenDownloadModal);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('dashboard.reports.loading') || 'Caricamento report...'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('dashboard.reports.errorTitle') || 'Errore'}
          message={t('dashboard.reports.errorMessage') || 'Impossibile caricare i report'}
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            {t('dashboard.reports.title') || 'Report'}
          </h1>
          {canCustomizePDF && isDesk && (
            <Link
              href="/dashboard/reports/pdf-customize"
              className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-sm font-medium text-accent transition-colors"
            >
              <Settings className="w-4 h-4" />
              Personalizza PDF
            </Link>
          )}
        </div>
        <p className="text-text-secondary">
          {t('dashboard.reports.description') || 'Visualizza e gestisci tutti i report disponibili'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.reports.search') || 'Cerca report...'}
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
            <option value="all">{t('dashboard.reports.filterAll') || 'Tutti'}</option>
            <option value="active">{t('dashboard.reports.filterActive') || 'Attivi'}</option>
            <option value="archived">{t('dashboard.reports.filterArchived') || 'Archiviati'}</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title={t('dashboard.reports.empty') || 'Nessun report trovato'}
          description={t('dashboard.reports.emptyDesc') || 'Non ci sono report disponibili al momento'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-bg-soft border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all duration-200 group"
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

              {/* Preview Toggle */}
              {previewReportId === report.id && (
                <div className="mb-4 p-4 bg-bg-base border border-border-subtle rounded-lg max-h-48 overflow-y-auto">
                  <p className="text-xs text-text-tertiary mb-2">
                    {t('dashboard.reports.preview') || 'Anteprima'}
                  </p>
                  <p className="text-sm text-text-secondary line-clamp-4">
                    {report.description || t('dashboard.reports.noPreview') || 'Nessuna anteprima disponibile'}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setDetailModalOpen(true);
                    }}
                    className="flex items-center gap-2 text-sm text-text-primary hover:text-text-primary transition-colors underline-selection"
                    aria-label={t('dashboard.reports.view') || 'Visualizza dettaglio'}
                  >
                    <Eye className="w-4 h-4" />
                    {t('dashboard.reports.view') || 'Dettaglio'}
                  </button>
                  <button
                    onClick={() => {
                      setPreviewReportId(previewReportId === report.id ? null : report.id);
                    }}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    aria-label={t('dashboard.reports.togglePreview') || 'Mostra/Nascondi anteprima'}
                  >
                    {previewReportId === report.id ? '▲' : '▼'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/reports/${report.slug}`}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    aria-label={t('dashboard.reports.openFull') || 'Apri report completo'}
                  >
                    {t('dashboard.reports.openFull') || 'Apri'}
                  </Link>
                  {isPro && (
                    <button
                      onClick={() => {
                        setSelectedReportId(report.id);
                        setDownloadModalOpen(true);
                      }}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                      aria-label={t('dashboard.reports.download') || 'Scarica PDF'}
                    >
                      <Download className="w-4 h-4" />
                      {t('dashboard.reports.download') || 'PDF'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download PDF Modal */}
      <DownloadPDFModal
        isOpen={downloadModalOpen}
        onClose={() => {
          setDownloadModalOpen(false);
          setSelectedReportId(null);
        }}
        reportId={selectedReportId || undefined}
        onSuccess={() => {
          setDownloadModalOpen(false);
          setSelectedReportId(null);
        }}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedReportId(null);
        }}
        reportId={selectedReportId || undefined}
      />
      </div>
    </div>
  );
}

