'use client';

import { useState, useEffect } from 'react';
import { Settings, Palette, FileText, Image as ImageIcon, Save } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';
import { useIsDesk } from '@/lib/hooks/useUserRole';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import Link from 'next/link';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';

/**
 * PDF Customization Page (Desk Only)
 * Permette agli utenti Desk di personalizzare:
 * - Template PDF
 * - Branding (logo, colori)
 * - Layout e stili
 * - Header/Footer personalizzati
 */
export default function PDFCustomizePage() {
  const { t } = useTranslations();
  const router = useSafeRouter();
  const isDesk = useIsDesk();
  const { hasAccess, isLoading: accessLoading } = useFeatureAccess('reports.pdf.customize');
  
  const [customizations, setCustomizations] = useState({
    logo: '',
    primaryColor: '#2563eb',
    secondaryColor: '#3b82f6',
    fontFamily: 'Helvetica',
    headerText: 'Tradelia Report',
    footerText: 'Confidential - Tradelia AI',
    watermark: false,
    watermarkText: '',
    template: 'default',
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Verifica accesso
  useEffect(() => {
    if (!accessLoading && !hasAccess) {
      router.push('/dashboard/reports');
    }
  }, [hasAccess, accessLoading, router]);

  if (accessLoading) {
    return <LoadingState message="Verifica accesso..." />;
  }

  if (!hasAccess || !isDesk) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Accesso Negato</h2>
          <p className="text-text-secondary mb-6">
            La personalizzazione PDF è disponibile solo per account Desk.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
          >
            Aggiorna a Desk
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Salva personalizzazioni su Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulazione
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving customizations:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Personalizzazione PDF
          </h1>
          <p className="text-text-secondary">
            Personalizza template, branding e layout dei tuoi report PDF (solo Desk)
          </p>
        </div>

        {/* Template Selection */}
        <section className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">Template</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['default', 'minimal', 'detailed'].map((template) => (
              <button
                key={template}
                onClick={() => setCustomizations({ ...customizations, template })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  customizations.template === template
                    ? 'border-accent bg-accent/10'
                    : 'border-border-subtle hover:border-accent/40'
                }`}
              >
                <div className="text-sm font-medium text-text-primary capitalize mb-2">
                  {template}
                </div>
                <div className="text-xs text-text-tertiary">
                  {template === 'default' && 'Template standard Tradelia'}
                  {template === 'minimal' && 'Design minimale e pulito'}
                  {template === 'detailed' && 'Template dettagliato completo'}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Branding */}
        <section className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">Branding</h2>
          </div>
          
          <div className="space-y-4">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Logo Aziendale
              </label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 border-2 border-dashed border-border-subtle rounded-lg flex items-center justify-center">
                  {customizations.logo ? (
                    <img src={customizations.logo} alt="Logo" className="max-w-full max-h-full" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-text-tertiary" />
                  )}
                </div>
                <button className="px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-secondary hover:bg-bg-hover transition-colors">
                  Carica Logo
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Colore Primario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customizations.primaryColor}
                    onChange={(e) => setCustomizations({ ...customizations, primaryColor: e.target.value })}
                    className="w-16 h-10 rounded border border-border-subtle cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customizations.primaryColor}
                    onChange={(e) => setCustomizations({ ...customizations, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-primary"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Colore Secondario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customizations.secondaryColor}
                    onChange={(e) => setCustomizations({ ...customizations, secondaryColor: e.target.value })}
                    className="w-16 h-10 rounded border border-border-subtle cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customizations.secondaryColor}
                    onChange={(e) => setCustomizations({ ...customizations, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-primary"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Header & Footer */}
        <section className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">Header & Footer</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Testo Header
              </label>
              <input
                type="text"
                value={customizations.headerText}
                onChange={(e) => setCustomizations({ ...customizations, headerText: e.target.value })}
                className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-primary"
                placeholder="Tradelia Report"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Testo Footer
              </label>
              <input
                type="text"
                value={customizations.footerText}
                onChange={(e) => setCustomizations({ ...customizations, footerText: e.target.value })}
                className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-primary"
                placeholder="Confidential - Tradelia AI"
              />
            </div>
          </div>
        </section>

        {/* Watermark */}
        <section className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Watermark</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customizations.watermark}
                onChange={(e) => setCustomizations({ ...customizations, watermark: e.target.checked })}
                className="w-4 h-4 rounded border-border-subtle text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-secondary">Abilita watermark</span>
            </label>
          </div>
          
          {customizations.watermark && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Testo Watermark
              </label>
              <input
                type="text"
                value={customizations.watermarkText}
                onChange={(e) => setCustomizations({ ...customizations, watermarkText: e.target.value })}
                className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-primary"
                placeholder="CONFIDENTIAL"
              />
            </div>
          )}
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-sm text-green-400">Salvato con successo!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvataggio...' : 'Salva Personalizzazioni'}
          </button>
        </div>
      </div>
    </div>
  );
}

