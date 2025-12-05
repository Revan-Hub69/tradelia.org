'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import Link from 'next/link';

/**
 * MIFID II Disclaimer Component
 * 
 * Best Practice 2025:
 * - Visibile su tutti i widget finanziari
 * - Link a policy completa
 * - Conforme MIFID II
 */
export default function MIFIDDisclaimer() {
  const { t } = useTranslations();

  return (
    <div 
      className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 text-xs text-text-secondary">
          <p className="font-semibold text-text-primary mb-1">
            {t('widgets.mifid.disclaimer.title') || 'Disclaimer MIFID II'}
          </p>
          <p className="mb-2">
            {t('widgets.mifid.disclaimer.text') || 
              'I dati mostrati sono a scopo informativo e non costituiscono consulenza finanziaria. Le performance passate non sono indicative di risultati futuri. Investi solo quello che puoi permetterti di perdere.'}
          </p>
          <Link
            href="/legal/mifid-disclaimer"
            className="text-accent hover:text-accent-hover underline text-xs"
            aria-label={t('widgets.mifid.disclaimer.linkLabel') || 'Leggi disclaimer completo MIFID II'}
          >
            {t('widgets.mifid.disclaimer.link') || 'Leggi disclaimer completo →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
