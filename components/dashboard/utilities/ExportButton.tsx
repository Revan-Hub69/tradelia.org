'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  type: 'portfolio' | 'trading-journal' | 'alerts';
  format?: 'csv' | 'pdf';
  filters?: Record<string, string>;
  className?: string;
}

/**
 * Export Button Component
 * Bottone per esportare dati in CSV o PDF
 */
export function ExportButton({ type, format = 'csv', filters = {}, className }: ExportButtonProps) {
  const { t } = useTranslations();
  const [exporting, setExporting] = useState(false);

  const getEndpoint = () => {
    switch (type) {
      case 'portfolio':
        return '/api/portfolio/export';
      case 'trading-journal':
        return '/api/trading-journal/export';
      case 'alerts':
        return '/api/watchlist/alerts/export';
      default:
        return '';
    }
  };

  const getIcon = () => {
    if (exporting) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return format === 'csv' ? <FileSpreadsheet className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (exporting) {
      return t('export.exporting') || 'Esportazione...';
    }
    const typeLabel = t(`export.${type}`) || type;
    const formatLabel = format.toUpperCase();
    return `${t('export.export') || 'Esporta'} ${typeLabel} (${formatLabel})`;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const endpoint = getEndpoint();
      const params = new URLSearchParams({
        format,
        ...filters,
      });

      const response = await authenticatedFetch(`${endpoint}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Errore durante l\'esportazione');
      }

      // Se è CSV, scarica direttamente
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(t('export.success') || 'Esportazione completata!');
      } else {
        // PDF: per ora mostra dati JSON (può essere esteso per generare PDF lato client)
        const data = await response.json();
        toast.info(t('export.pdfInfo') || 'Dati pronti per generazione PDF. Funzionalità in sviluppo.');
        console.log('PDF Data:', data);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(t('export.error') || 'Errore durante l\'esportazione');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className={className}
    >
      {getIcon()}
      <span className="ml-2">{getLabel()}</span>
    </Button>
  );
}

