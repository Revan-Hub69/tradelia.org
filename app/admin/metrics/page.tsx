'use client';

import { useState } from 'react';
import { useApi } from '@/lib/hooks/useApi';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Card } from '@/components/ui/card';
import { LineChart, BarChart, PieChart } from '@/components/charts';
import { TrendingUp, Users, DollarSign, BookOpen, FileText, Activity } from 'lucide-react';

/**
 * Business Metrics Dashboard
 * Dashboard completo per metriche business
 * 
 * Riferimento: Business Intelligence Best Practices
 */
export default function BusinessMetricsPage() {
  const { t } = useTranslations();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Fetch metrics
  const { data: metrics, loading } = useApi<{
    users: { total: number; active: number; new: number };
    reports: { total: number; published: number; views: number };
    courses: { total: number; enrollments: number; completions: number };
    revenue?: { mrr: number; arr: number; churn: number };
  }>('/api/metrics', {
    cacheTime: 60 * 1000, // 1 minuto
  });

  // Fetch time series data
  const { data: timeSeriesData } = useApi<{
    users: Array<{ date: string; count: number }>;
    revenue?: Array<{ date: string; amount: number }>;
    engagement: Array<{ date: string; value: number }>;
  }>(`/api/metrics/time-series?range=${timeRange}`, {
    cacheTime: 60 * 1000,
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-soft rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-bg-soft rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <p className="text-text-secondary">Nessun dato disponibile</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">
          {t('admin.metrics.title') || 'Business Metrics'}
        </h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 rounded-lg bg-bg-soft border border-border-subtle text-text-primary"
        >
          <option value="7d">Ultimi 7 giorni</option>
          <option value="30d">Ultimi 30 giorni</option>
          <option value="90d">Ultimi 90 giorni</option>
          <option value="1y">Ultimo anno</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">
              {t('admin.metrics.users') || 'Utenti'}
            </h3>
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-text-primary">{metrics.users.total.toLocaleString()}</p>
            <p className="text-sm text-text-tertiary">
              {metrics.users.active} attivi • {metrics.users.new} nuovi
            </p>
          </div>
        </Card>

        {/* Revenue (if available) */}
        {metrics.revenue && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-secondary">
                {t('admin.metrics.revenue') || 'Revenue'}
              </h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-text-primary">
                €{metrics.revenue.mrr.toLocaleString()}/mo
              </p>
              <p className="text-sm text-text-tertiary">
                ARR: €{metrics.revenue.arr.toLocaleString()} • Churn: {metrics.revenue.churn}%
              </p>
            </div>
          </Card>
        )}

        {/* Courses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">
              {t('admin.metrics.courses') || 'Corsi'}
            </h3>
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-text-primary">{metrics.courses.enrollments.toLocaleString()}</p>
            <p className="text-sm text-text-tertiary">
              {metrics.courses.completions} completati • {metrics.courses.total} corsi
            </p>
          </div>
        </Card>

        {/* Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-secondary">
              {t('admin.metrics.reports') || 'Report'}
            </h3>
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-text-primary">{metrics.reports.published.toLocaleString()}</p>
            <p className="text-sm text-text-tertiary">
              {metrics.reports.views.toLocaleString()} visualizzazioni • {metrics.reports.total} totali
            </p>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        {timeSeriesData?.users && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('admin.metrics.userGrowth') || 'Crescita Utenti'}
            </h3>
            <LineChart
              data={timeSeriesData.users.map((d) => ({ name: d.date, value: d.count }))}
              lines={[{ key: 'value', label: 'Utenti' }]}
              xAxisKey="name"
              height={300}
            />
          </Card>
        )}

        {/* Engagement */}
        {timeSeriesData?.engagement && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('admin.metrics.engagement') || 'Engagement'}
            </h3>
            <BarChart
              data={timeSeriesData.engagement.map((d) => ({ name: d.date, value: d.value }))}
              bars={[{ key: 'value', label: 'Engagement' }]}
              xAxisKey="name"
              height={300}
            />
          </Card>
        )}

        {/* Revenue (if available) */}
        {timeSeriesData?.revenue && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('admin.metrics.revenueChart') || 'Revenue Trend'}
            </h3>
            <LineChart
              data={timeSeriesData.revenue.map((d) => ({ name: d.date, value: d.amount }))}
              lines={[{ key: 'value', label: 'Revenue' }]}
              xAxisKey="name"
              height={300}
            />
          </Card>
        )}

        {/* Course Completion Rate */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {t('admin.metrics.completionRate') || 'Tasso di Completamento Corsi'}
          </h3>
          <PieChart
            data={[
              { name: 'Completati', value: metrics.courses.completions },
              { name: 'In Corso', value: metrics.courses.enrollments - metrics.courses.completions },
            ]}
            height={300}
          />
        </Card>
      </div>
    </div>
  );
}

