'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Search, Filter, Download, Eye, Settings, TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro, useIsDesk } from '@/lib/hooks/useUserRole';
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DownloadPDFModal } from '@/components/dashboard/modals/DownloadPDFModal';
import { ReportDetailModal } from '@/components/dashboard/modals/ReportDetailModal';
import { RequestDetailModal } from '@/components/dashboard/modals/RequestDetailModal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/Toast';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale, enUS as enLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

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

interface AnalysisRequest {
  id: string;
  asset_symbol: string;
  asset_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
  notes: string | null;
}

type TabType = 'reports' | 'requests';

/**
 * Reports Page (Unified)
 * Unifica Report e Richieste Analisi in un'unica pagina con tabs
 * BASE: Visualizzazione report base
 * PRO: Download PDF, analisi avanzate, richieste analisi
 */
export default function ReportsPage() {
  const { t, locale } = useTranslations();
  const searchParams = useSearchParams();
  const isPro = useIsPro();
  const isDesk = useIsDesk();
  const { hasAccess: canCustomizePDF } = useFeatureAccess('reports.pdf.customize');
  
  // Initialize tab from URL query parameter
  const initialTab = (searchParams?.get('tab') as TabType) || 'reports';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // Reports state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [previewReportId, setPreviewReportId] = useState<string | null>(null);
  
  // Requests state
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [requestDetailModalOpen, setRequestDetailModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: reportsData, loading: reportsLoading, error: reportsError, retry: retryReports } = useApi<Report[]>(
    '/api/dashboard/reports',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );
  
  const { data: requestsData, loading: requestsLoading, error: requestsError, retry: retryRequests, refetch: refetchRequests } = useApi<AnalysisRequest[]>(
    '/api/dashboard/analysis-requests',
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

  const filteredRequests = requestsData?.filter((request) => {
    const matchesSearch = requestSearchQuery === '' || 
      request.asset_symbol.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
      request.asset_name?.toLowerCase().includes(requestSearchQuery.toLowerCase());
    
    const matchesFilter = requestFilter === 'all' || request.status === requestFilter;

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
  
  // Listen for refresh requests event
  useEffect(() => {
    const handleRefresh = () => {
      refetchRequests();
    };

    window.addEventListener('refresh-requests', handleRefresh);
    return () => {
      window.removeEventListener('refresh-requests', handleRefresh);
    };
  }, [refetchRequests]);
  
  // Update tab from URL query parameter
  useEffect(() => {
    const tab = searchParams?.get('tab') as TabType;
    if (tab && (tab === 'reports' || tab === 'requests')) {
      setActiveTab(tab);
    }
    
    // Open request detail modal if requestId is in URL
    const requestId = searchParams?.get('requestId');
    if (requestId && tab === 'requests') {
      setSelectedRequestId(requestId);
      setRequestDetailModalOpen(true);
    }
  }, [searchParams]);

  const getRequestStatusIcon = (status: AnalysisRequest['status']) => {
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

  const getRequestStatusLabel = (status: AnalysisRequest['status']) => {
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
      const dateLocale = locale === 'it' ? itLocale : enLocale;
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: dateLocale,
      });
    } catch {
      return timestamp;
    }
  };

  const handleDownloadResults = async (requestId: string) => {
    if (!isPro) {
      toast.error(t('dashboard.requests.proRequired') || 'Account Pro richiesto per il download');
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/analysis-requests/${requestId}/results`);
      
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
      a.download = `analysis-results-${requestId}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(t('dashboard.requests.downloadSuccess') || 'Download completato con successo!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : t('dashboard.requests.downloadError') || 'Errore durante il download');
    }
  };

  const isLoading = activeTab === 'reports' ? reportsLoading : requestsLoading;
  const error = activeTab === 'reports' ? reportsError : requestsError;
  const retry = activeTab === 'reports' ? retryReports : retryRequests;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={activeTab === 'reports' 
          ? (t('dashboard.reports.loading') || 'Caricamento report...')
          : (t('dashboard.requests.loading') || 'Caricamento richieste...')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={activeTab === 'reports' 
            ? (t('dashboard.reports.errorTitle') || 'Errore')
            : (t('dashboard.requests.errorTitle') || 'Errore')}
          message={activeTab === 'reports'
            ? (t('dashboard.reports.errorMessage') || 'Impossibile caricare i report')
            : (t('dashboard.requests.errorMessage') || 'Impossibile caricare le richieste')}
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
              {t('dashboard.reports.title') || 'Report & Richieste'}
            </h1>
            {canCustomizePDF && isDesk && activeTab === 'reports' && (
              <Link
                href="/dashboard/reports/pdf-customize"
                className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-sm font-medium text-accent transition-colors"
              >
                <Settings className="w-4 h-4" />
                Personalizza PDF
              </Link>
            )}
            {isPro && activeTab === 'requests' && (
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-request-analysis-modal'));
                }}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {t('dashboard.requests.newRequest') || 'Nuova Richiesta'}
              </Button>
            )}
          </div>
          <p className="text-text-secondary">
            {activeTab === 'reports'
              ? (t('dashboard.reports.description') || 'Visualizza e gestisci tutti i report disponibili')
              : (t('dashboard.requests.description') || 'Visualizza lo stato delle tue richieste di analisi')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'reports'
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            {t('dashboard.reports.tab') || 'Report'}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'requests'
                ? 'border-accent text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            {t('dashboard.requests.tab') || 'Richieste'}
          </button>
        </div>

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <>
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
          </>
        )}

        {/* Requests Tab Content */}
        {activeTab === 'requests' && (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  value={requestSearchQuery}
                  onChange={(e) => setRequestSearchQuery(e.target.value)}
                  placeholder={t('dashboard.requests.search') || 'Cerca per simbolo o nome asset...'}
                  className="w-full pl-10 pr-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-text-tertiary" />
                <select
                  value={requestFilter}
                  onChange={(e) => setRequestFilter(e.target.value as any)}
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
                        {getRequestStatusIcon(request.status)}
                        <span className="text-sm font-medium text-text-primary">
                          {getRequestStatusLabel(request.status)}
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequestId(request.id);
                            setRequestDetailModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-text-primary hover:text-text-primary transition-colors underline-selection"
                          aria-label={t('dashboard.requests.viewDetail') || 'Visualizza dettaglio'}
                        >
                          <Eye className="w-4 h-4" />
                          {t('dashboard.requests.viewDetail') || 'Dettaglio'}
                        </button>
                        {request.status === 'completed' && isPro && (
                          <button
                            onClick={() => handleDownloadResults(request.id)}
                            className="flex items-center gap-1 text-text-primary hover:text-text-primary transition-colors underline-selection"
                            aria-label={t('dashboard.requests.download') || 'Scarica Risultati'}
                          >
                            <Download className="w-4 h-4" />
                            {t('dashboard.requests.download') || 'Scarica'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modals */}
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

        <ReportDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedReportId(null);
          }}
          reportId={selectedReportId || undefined}
        />

        <RequestDetailModal
          isOpen={requestDetailModalOpen}
          onClose={() => {
            setRequestDetailModalOpen(false);
            setSelectedRequestId(null);
          }}
          requestId={selectedRequestId || undefined}
        />
      </div>
    </div>
  );
}
