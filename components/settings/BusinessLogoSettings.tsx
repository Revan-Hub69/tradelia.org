'use client';

import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, X, Check } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsDesk } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/Toast';
import { authenticatedFetch } from '@/lib/api/fetch-client';

/**
 * Business Logo Settings
 * Permette a utenti Desk/Business di caricare logo personalizzato
 * Riferimento: Brand Guidelines, Custom Branding
 */
export function BusinessLogoSettings() {
  const { t } = useTranslations();
  const isDesk = useIsDesk();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Carica logo esistente
  const { data: logoData, loading } = useApi<{ logo_url: string | null }>(
    '/api/settings/business-logo',
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Se non è Desk, non mostrare
  if (!isDesk) {
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione file
    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.businessLogo.invalidFile') || 'File non valido. Carica un\'immagine.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max
      toast.error(t('settings.businessLogo.fileTooLarge') || 'File troppo grande. Massimo 2MB.');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error(t('settings.businessLogo.noFile') || 'Seleziona un file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await authenticatedFetch('/api/settings/business-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante il caricamento');
      }

      const data = await response.json();
      toast.success(t('settings.businessLogo.uploadSuccess') || 'Logo caricato con successo!');
      
      // Aggiorna preview
      if (data.logo_url) {
        setPreview(data.logo_url);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('settings.businessLogo.uploadError') || 'Errore durante il caricamento del logo'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const response = await authenticatedFetch('/api/settings/business-logo', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante la rimozione');
      }

      toast.success(t('settings.businessLogo.removeSuccess') || 'Logo rimosso con successo');
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('settings.businessLogo.removeError') || 'Errore durante la rimozione del logo'
      );
    }
  };

  const currentLogo = preview || logoData?.logo_url || null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('settings.businessLogo.title') || 'Logo Aziendale Personalizzato'}
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          {t('settings.businessLogo.description') || 'Carica il tuo logo aziendale per personalizzare i report PDF. Il logo verrà utilizzato al posto del logo Tradelia standard.'}
        </p>
      </div>

      {/* Preview */}
      {currentLogo && (
        <div className="border border-border-subtle rounded-lg p-4 bg-bg-soft">
          <div className="flex items-center gap-4">
            <div className="w-32 h-16 border border-border-subtle rounded bg-white p-2 flex items-center justify-center">
              <img
                src={currentLogo}
                alt="Logo aziendale"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-secondary">
                {t('settings.businessLogo.currentLogo') || 'Logo attuale'}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {t('settings.businessLogo.logoHint') || 'Il logo verrà utilizzato nei report PDF'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {t('settings.businessLogo.remove') || 'Rimuovi'}
            </Button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="logo-upload"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {t('settings.businessLogo.uploadLabel') || 'Carica nuovo logo'}
          </label>
          <input
            ref={fileInputRef}
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {t('settings.businessLogo.selectFile') || 'Seleziona File'}
            </Button>
            {preview && (
              <Button
                variant="default"
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('settings.businessLogo.uploading') || 'Caricamento...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t('settings.businessLogo.upload') || 'Carica'}
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            {t('settings.businessLogo.fileHint') || 'Formati supportati: PNG, JPEG, SVG. Dimensione massima: 2MB'}
          </p>
        </div>
      </div>
    </div>
  );
}

