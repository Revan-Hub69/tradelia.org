'use client';

import { useState } from 'react';
import { Download, FileText, Video, Image, File, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Button } from '@/components/ui/button';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { toast } from '@/components/ui/Toast';

interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'image' | 'document' | 'other';
  url: string;
  size?: number;
  downloaded_at?: string;
}

interface MaterialsDownloadProps {
  courseId: string;
  courseSlug: string;
  materials: Material[];
}

/**
 * Materials Download Component
 * Materiali scaricabili organizzati per corso
 * Riferimento: Educational Resources Best Practices
 */
export function MaterialsDownload({ courseId, courseSlug, materials }: MaterialsDownloadProps) {
  const { t } = useTranslations();
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (material: Material) => {
    setDownloading((prev) => ({ ...prev, [material.id]: true }));

    try {
      // Download material
      const response = await authenticatedFetch(
        `/api/courses/${courseSlug}/materials/${material.id}/download`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('Errore durante il download');
      }

      // Get blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Track download
      await authenticatedFetch(`/api/courses/${courseSlug}/materials/${material.id}/track`, {
        method: 'POST',
      });

      toast.success(t('materials.downloadSuccess') || 'Materiale scaricato con successo!');
    } catch (error) {
      console.error('Error downloading material:', error);
      toast.error(t('materials.downloadError') || 'Errore durante il download del materiale');
    } finally {
      setDownloading((prev) => ({ ...prev, [material.id]: false }));
    }
  };

  if (materials.length === 0) {
    return (
      <div className="bg-bg-soft border border-border-subtle rounded-xl p-6 text-center">
        <FileText className="w-12 h-12 text-text-secondary mx-auto mb-3" />
        <p className="text-text-secondary">
          {t('materials.empty') || 'Nessun materiale disponibile per questo corso'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-blue-400" />
        {t('materials.title') || 'Materiali Scaricabili'}
      </h3>
      <div className="space-y-3">
        {materials.map((material) => (
          <div
            key={material.id}
            className="flex items-center justify-between p-4 bg-bg-surface border border-border-subtle rounded-lg hover:border-accent/40 transition-all"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 text-blue-400">
                {getIcon(material.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{material.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                  <span className="px-2 py-0.5 bg-bg-soft rounded uppercase">
                    {material.type}
                  </span>
                  {material.size && (
                    <span>{formatSize(material.size)}</span>
                  )}
                  {material.downloaded_at && (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('materials.downloaded') || 'Scaricato'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(material)}
              disabled={downloading[material.id]}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {downloading[material.id] ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t('materials.downloading') || 'Download...'}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t('materials.download') || 'Scarica'}
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

