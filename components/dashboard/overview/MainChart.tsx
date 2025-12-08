'use client';

import { memo } from 'react';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { MultiAssetCharts } from '../MultiAssetCharts';
import Link from 'next/link';
import { Link as LinkIcon } from 'lucide-react';

/**
 * Main Chart - Grafico Multi-Asset principale per Overview Tab
 * Wrapper per MultiAssetCharts con SectionBanner
 */
export const MainChart = memo(function MainChart() {
  const { t, locale } = useTranslations();

  return (
    <section className="mb-6" aria-label="Grafico multi-asset">
      <div className="mb-4">
        <SectionBanner
          title="Correlazioni Multi-Asset"
          description="Visualizza le correlazioni tra i principali asset: S&P 500, Bitcoin, Gold, EUR/USD. Analisi avanzate disponibili nella sezione Analysis."
        />
        <div className="mt-2 text-right">
          <Link
            href={buildLocalePath(locale, '/dashboard/analysis')}
            className="text-sm text-accent hover:underline inline-flex items-center gap-1"
          >
            Vedi analisi avanzate <LinkIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <MultiAssetCharts />
      </div>
    </section>
  );
});
