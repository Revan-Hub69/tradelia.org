'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import Link from 'next/link';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

export function ReportsSection() {
  const { t, locale } = useTranslations();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('public', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setReports(data || []);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  if (loading) {
    return (
      <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.modules.items.reports.title') || 'Report Ufficiali'}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-soft rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg-surface border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          {t('dashboard.modules.items.reports.title') || 'Report Ufficiali'}
        </h2>
        <Link
          href={buildLocalePath(locale, '/dashboard/reports')}
          className="text-sm text-accent hover:text-accent-hover font-medium"
        >
          {t('common.viewAll') || 'Vedi tutti'} →
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="text-text-secondary text-sm">
          {t('dashboard.modules.items.reports.empty') || 'Nessun report disponibile'}
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={buildLocalePath(locale, `/dashboard/reports/${report.id}`)}
              className="block p-4 bg-bg-base border border-border-subtle rounded-lg hover:border-accent/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
                    {report.title}
                  </h3>
                  {report.description && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {report.description}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
