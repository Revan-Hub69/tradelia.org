'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useTranslations } from '@/lib/i18n/use-translations';
import { toast } from '@/components/ui/Toast';
import { Download, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { useApi } from '@/lib/hooks/useApi';
import { cn } from '@/lib/utils/cn';

interface Report {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  report_type: string;
}

interface DownloadPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string; // Se fornito, pre-seleziona questo report
  onSuccess?: () => void;
}

type PDFFormat = 'pdf' | 'excel' | 'csv';
type PDFQuality = 'standard' | 'high';

/**
 * Download PDF Modal
 * Form per scaricare report in vari formati
 * Riferimento: Norman (2013) - Feedback, Nielsen (1994) - Error Prevention
 */
export function DownloadPDFModal({
  isOpen,
  onClose,
  reportId,
  onSuccess,
}: DownloadPDFModalProps) {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedReport, setSelectedReport] = useState<string>(reportId || '');
  const [format, setFormat] = useState<PDFFormat>('pdf');
  const [quality, setQuality] = useState<PDFQuality>('standard');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [downloadStarted, setDownloadStarted] = useState(false);

  // Carica lista report disponibili
  const { data: reportsData } = useApi<Report[]>(
    '/api/dashboard/reports',
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
      enabled: isOpen && !reportId, // Solo se modal aperto e non c'è reportId pre-selezionato
    }
  );

  const reports = reportsData || [];

  // Reset quando modal si apre/chiude
  useEffect(() => {
    if (isOpen) {
      if (reportId) {
        setSelectedReport(reportId);
      }
      setDownloadProgress(0);
      setDownloadStarted(false);
    } else {
      // Reset quando chiude
      setSelectedReport(reportId || '');
      setFormat('pdf');
      setQuality('standard');
      setIncludeCharts(true);
      setDownloadProgress(0);
      setDownloadStarted(false);
    }
  }, [isOpen, reportId]);

  const handleDownload = async () => {
    // Riferimento: Norman (2013) - Error Prevention, Nielsen (1994) - Error Prevention
    if (!selectedReport) {
      toast.error(t('dashboard.reports.errors.reportRequired') || 'Seleziona un report da scaricare.');
      const reportSelect = document.getElementById('report-select');
      if (reportSelect) {
        reportSelect.focus();
      }
      return;
    }

    setLoading(true);
    setDownloadStarted(true);
    setDownloadProgress(10);

    try {
      // Simula progress (in produzione, usare streaming o WebSocket)
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        `/api/reports/${selectedReport}/export?format=${format}&quality=${quality}&charts=${includeCharts}`,
        {
          method: 'GET',
        }
      );

      clearInterval(progressInterval);
      setDownloadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante il download');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `report-${selectedReport}.${format === 'pdf' ? 'pdf' : format === 'excel' ? 'xlsx' : 'csv'}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Norman - Feedback: Success message
      toast.success(t('dashboard.reports.downloadSuccess') || 'Download completato con successo!');
      
      setDownloadProgress(0);
      setDownloadStarted(false);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('dashboard.reports.downloadError') || 'Errore durante il download'
      );
      setDownloadProgress(0);
      setDownloadStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedReportData = reports.find((r) => r.id === selectedReport);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dashboard.reports.download') || 'Scarica Report'}
      description={t('dashboard.reports.downloadDescription') || 'Scegli il formato e le opzioni per il download'}
      size="md"
    >
      {/* Riferimento: WCAG 2.1 - Forms, Norman (2013) - Affordance */}
      <div className="space-y-4" role="form" aria-label={t('dashboard.reports.downloadForm') || 'Form download report'}>
        {/* Report Selection */}
        {!reportId && (
          <div>
            <Label htmlFor="report-select">
              {t('dashboard.reports.selectReport') || 'Seleziona Report'} *
              <span className="sr-only"> (obbligatorio)</span>
            </Label>
            <Select
              id="report-select"
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="mt-1"
              required
              aria-required="true"
              aria-describedby="report-hint"
            >
              <option value="">{t('dashboard.reports.selectPlaceholder') || 'Seleziona un report...'}</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.title} ({report.report_type})
                </option>
              ))}
            </Select>
            <p id="report-hint" className="text-xs text-text-secondary mt-1" role="note">
              {t('dashboard.reports.selectHint') || 'Scegli il report che vuoi scaricare'}
            </p>
          </div>
        )}

        {/* Selected Report Info */}
        {selectedReportData && (
          <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-1">
                  {selectedReportData.title}
                </h4>
                {selectedReportData.description && (
                  <p className="text-sm text-text-secondary">
                    {selectedReportData.description}
                  </p>
                )}
                <span className="inline-block mt-2 px-2 py-1 bg-accent/20 border border-accent/40 rounded text-xs text-blue-400 font-medium">
                  {selectedReportData.report_type}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div>
          <Label htmlFor="format-select">
            {t('dashboard.reports.format') || 'Formato'} *
          </Label>
          <Select
            id="format-select"
            value={format}
            onChange={(e) => setFormat(e.target.value as PDFFormat)}
            className="mt-1"
            required
            aria-required="true"
            aria-describedby="format-hint"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel (XLSX)</option>
            <option value="csv">CSV</option>
          </Select>
          <p id="format-hint" className="text-xs text-text-secondary mt-1" role="note">
            {t('dashboard.reports.formatHint') || 'Scegli il formato del file da scaricare'}
          </p>
        </div>

        {/* Quality Selection (solo per PDF) */}
        {format === 'pdf' && (
          <div>
            <Label htmlFor="quality-select">
              {t('dashboard.reports.quality') || 'Qualità'} *
            </Label>
            <Select
              id="quality-select"
              value={quality}
              onChange={(e) => setQuality(e.target.value as PDFQuality)}
              className="mt-1"
              required
              aria-required="true"
              aria-describedby="quality-hint"
            >
              <option value="standard">{t('dashboard.reports.qualityStandard') || 'Standard'}</option>
              <option value="high">{t('dashboard.reports.qualityHigh') || 'Alta'}</option>
            </Select>
            <p id="quality-hint" className="text-xs text-text-secondary mt-1" role="note">
              {t('dashboard.reports.qualityHint') || 'Qualità standard per file più piccoli, alta per migliore qualità'}
            </p>
          </div>
        )}

        {/* Include Charts (solo per PDF) */}
        {format === 'pdf' && (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="include-charts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="w-4 h-4 rounded border-border-subtle text-blue-400 focus:ring-2 focus:ring-accent"
              aria-describedby="charts-hint"
            />
            <Label htmlFor="include-charts" className="cursor-pointer">
              {t('dashboard.reports.includeCharts') || 'Includi grafici'}
            </Label>
            <p id="charts-hint" className="sr-only">
              {t('dashboard.reports.includeChartsHint') || 'Includi i grafici nel PDF'}
            </p>
          </div>
        )}

        {/* Progress Indicator */}
        {downloadStarted && (
          <div className="space-y-2" role="status" aria-live="polite" aria-busy={loading}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {t('dashboard.reports.downloading') || 'Download in corso...'}
              </span>
              <span className="text-text-secondary">{downloadProgress}%</span>
            </div>
            <div className="w-full bg-bg-soft rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
                role="progressbar"
                aria-valuenow={downloadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('dashboard.reports.downloadProgress') || `Download: ${downloadProgress}%`}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {downloadProgress === 100 && !loading && (
          <div className="flex items-center gap-2 text-green-400" role="status" aria-live="polite">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">
              {t('dashboard.reports.downloadComplete') || 'Download completato!'}
            </span>
          </div>
        )}

        {/* Actions */}
        {/* Riferimento: Nielsen (1994) - Consistency, Material Design Dialog Actions */}
        <div className="flex items-center justify-end gap-3 pt-4" role="group" aria-label="Form actions">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            aria-label={t('common.cancel') || 'Annulla e chiudi'}
          >
            {t('common.cancel') || 'Annulla'}
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={loading || !selectedReport || downloadProgress === 100}
            className="flex items-center gap-2"
            aria-busy={loading}
            aria-disabled={loading || !selectedReport}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t('common.downloading') || 'Download...'}</span>
                <span className="sr-only">Download in corso</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" aria-hidden="true" />
                {t('dashboard.reports.download') || 'Scarica'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

