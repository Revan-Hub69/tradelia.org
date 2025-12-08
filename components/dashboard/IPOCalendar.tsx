'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Building2, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { Lock } from 'lucide-react';

interface IPOEvent {
  symbol: string;
  name: string;
  exchange: string;
  ipoDate: string;
  priceRange?: {
    low: number;
    high: number;
  };
  expectedPrice?: number;
  shares?: number;
  marketCap?: number;
  sentiment?: {
    score: number;
    sources: string[];
  };
  institutionalParticipation?: {
    percentage: number;
    majorInvestors: string[];
    totalRaised: number;
  };
  performanceTracking?: {
    currentPrice?: number;
    changeSinceIPO?: number;
    changePercent?: number;
    daysSinceIPO?: number;
  };
}

export function IPOCalendar() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [ipos, setIpos] = useState<IPOEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const days = isPro ? 90 : 30;
  const [countryFilter, setCountryFilter] = useState<string>('all');

  useEffect(() => {
    const fetchIPOs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          days: days.toString(),
          country: countryFilter,
        });
        const response = await fetch(`/api/market/ipo-calendar?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setIpos(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching IPO calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIPOs();
    const interval = setInterval(fetchIPOs, 24 * 60 * 60 * 1000); // Refresh daily
    return () => clearInterval(interval);
  }, [days]);

  const getSentimentIcon = (score: number) => {
    if (score >= 20) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (score <= -20) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (score: number) => {
    if (score >= 20) return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (score <= -20) return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffDays === 0) return locale === 'it' ? 'Oggi' : 'Today';
      if (diffDays === 1) return locale === 'it' ? 'Domani' : 'Tomorrow';
      if (diffDays < 7) return `${diffDays} ${locale === 'it' ? 'giorni' : 'days'}`;
      return date.toLocaleDateString(locale, { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="IPO Calendar"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent" />
            {t('dashboard.ipoCalendar.title') || 'IPO Calendar'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.ipoCalendar.description') || 'Upcoming IPOs with sentiment and institutional participation'}
            {!isPro && ` (${days} days - Pro: 90 days)`}
          </p>
        </div>
      </div>

      {!isPro && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-sm text-amber-400">
          <Lock className="w-4 h-4" />
          <span>
            {locale === 'it' 
              ? 'Versione Pro: 90 giorni vs 30 free. Aggiorna per vedere il calendario esteso.'
              : 'Pro Version: 90 days vs 30 free. Upgrade to see extended calendar.'}
          </span>
        </div>
      )}

      {/* Country Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { value: 'all', label: locale === 'it' ? 'Tutti' : 'All' },
          { value: 'US', label: 'USA' },
          { value: 'EU', label: 'EU' },
          { value: 'ASIA', label: 'Asia' },
        ].map((country) => (
          <Button
            key={country.value}
            variant={countryFilter === country.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCountryFilter(country.value)}
          >
            {country.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : ipos.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            {locale === 'it' ? 'Nessuna IPO programmata' : 'No IPOs scheduled'}
          </div>
        ) : (
          ipos.map((ipo, index) => (
            <div
              key={`${ipo.symbol}-${index}`}
              className="bg-bg-base border border-border-subtle rounded-lg p-4 transition-all hover:border-accent/40"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {ipo.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded font-semibold">
                      {ipo.symbol}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {ipo.exchange}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-tertiary mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(ipo.ipoDate)}</span>
                  </div>
                </div>
                {ipo.sentiment && (
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold',
                    getSentimentColor(ipo.sentiment.score)
                  )}>
                    {getSentimentIcon(ipo.sentiment.score)}
                    <span>{ipo.sentiment.score > 0 ? '+' : ''}{ipo.sentiment.score}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {ipo.priceRange && (
                  <div>
                    <div className="text-text-tertiary mb-1">Price Range</div>
                    <div className="font-semibold text-text-primary">
                      ${ipo.priceRange.low.toFixed(2)} - ${ipo.priceRange.high.toFixed(2)}
                    </div>
                  </div>
                )}
                {ipo.expectedPrice && (
                  <div>
                    <div className="text-text-tertiary mb-1">Expected Price</div>
                    <div className="font-semibold text-text-primary">
                      ${ipo.expectedPrice.toFixed(2)}
                    </div>
                  </div>
                )}
                {ipo.marketCap && (
                  <div>
                    <div className="text-text-tertiary mb-1">Market Cap</div>
                    <div className="font-semibold text-text-primary">
                      {formatCurrency(ipo.marketCap)}
                    </div>
                  </div>
                )}
                {ipo.institutionalParticipation && (
                  <div>
                    <div className="text-text-tertiary mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Institutional
                    </div>
                    <div className="font-semibold text-text-primary">
                      {ipo.institutionalParticipation.percentage}%
                    </div>
                    <div className="text-text-tertiary text-[10px] mt-0.5">
                      {formatCurrency(ipo.institutionalParticipation.totalRaised)}
                    </div>
                  </div>
                )}
              </div>

              {ipo.institutionalParticipation && ipo.institutionalParticipation.majorInvestors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <div className="text-xs text-text-tertiary mb-1">
                    {locale === 'it' ? 'Investitori Principali:' : 'Major Investors:'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ipo.institutionalParticipation.majorInvestors.map((investor, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-bg-soft border border-border-subtle rounded text-text-secondary"
                      >
                        {investor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {ipo.sentiment && ipo.sentiment.sources.length > 0 && (
                <div className="mt-2 text-[10px] text-text-tertiary">
                  {locale === 'it' ? 'Sentiment da: ' : 'Sentiment from: '}
                  {ipo.sentiment.sources.join(', ')}
                </div>
              )}

              {/* Performance Tracking */}
              {ipo.performanceTracking && ipo.performanceTracking.currentPrice && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <div className="text-xs font-medium text-text-secondary mb-1">
                    {locale === 'it' ? 'Performance Post-IPO' : 'Post-IPO Performance'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">
                        ${ipo.performanceTracking.currentPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {ipo.performanceTracking.daysSinceIPO} {locale === 'it' ? 'giorni' : 'days'} since IPO
                      </div>
                    </div>
                    <div className={cn(
                      'text-sm font-semibold',
                      ipo.performanceTracking.changePercent && ipo.performanceTracking.changePercent > 0
                        ? 'text-green-400'
                        : ipo.performanceTracking.changePercent && ipo.performanceTracking.changePercent < 0
                        ? 'text-red-400'
                        : 'text-text-primary'
                    )}>
                      {ipo.performanceTracking.changePercent && ipo.performanceTracking.changePercent > 0 ? '+' : ''}
                      {ipo.performanceTracking.changePercent?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
