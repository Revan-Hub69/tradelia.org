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
            className="text-sm text-white hover:text-white inline-flex items-center gap-1 relative group"
          >
            Vedi analisi avanzate <LinkIcon className="w-3 h-3" />
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500/25 group-hover:w-full transition-all duration-300" />
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <MultiAssetCharts />
      </div>
    </section>
  );
});
