'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, GitBranch, Building2, Filter } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { SectionBanner } from './SectionBanner';

interface CorporateEvent {
  symbol: string;
  name: string;
  type: 'earnings' | 'dividend' | 'split' | 'merger' | 'acquisition';
  date: string;
  description?: string;
  value?: number | string;
  currency?: string;
  exchange?: string;
  country?: string;
  earningsSurprise?: {
    actual?: number;
    estimate?: number;
    surprise?: number;
    surprisePercent?: number;
  };
}

export function CorporateEvents() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(isPro ? 30 : 7);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('US');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          days: days.toString(),
          country: countryFilter,
          ...(typeFilter !== 'all' && { type: typeFilter }),
        });
        const response = await fetch(`/api/market/corporate-events?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching corporate events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 60 * 60 * 1000); // Refresh every hour
    return () => clearInterval(interval);
  }, [days, typeFilter, countryFilter]);

  const getEventIcon = (type: CorporateEvent['type']) => {
    switch (type) {
      case 'earnings':
        return <TrendingUp className="w-4 h-4 text-blue-400" />;
      case 'dividend':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'split':
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case 'merger':
      case 'acquisition':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return dateString;
    }
  };

  const eventTypes: Array<{ value: string; label: string }> = [
    { value: 'all', label: locale === 'it' ? 'Tutti' : 'All' },
    { value: 'earnings', label: locale === 'it' ? 'Utili' : 'Earnings' },
    { value: 'dividend', label: locale === 'it' ? 'Dividendi' : 'Dividends' },
    { value: 'split', label: locale === 'it' ? 'Split' : 'Splits' },
  ];

  const countries = [
    { value: 'US', label: 'USA' },
    { value: 'EU', label: 'EU' },
    { value: 'ASIA', label: 'Asia' },
  ];

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Corporate Events"
    >
      {!isPro && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-sm text-amber-400">
          <Lock className="w-4 h-4" />
          <span>
            Versione Pro: 30 giorni vs 7 giorni free. Aggiorna per sbloccare tutti gli eventi.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          Eventi Corporate
        </h2>
      </div>

      <SectionBanner
        title="Utili, Dividendi, Split e Fusioni"
        description={`Monitora gli eventi corporate più importanti: pubblicazione degli utili (con analisi della sorpresa), pagamento dividendi, split azionari e operazioni di M&A. Ogni evento mostra l'impatto previsto sul prezzo dell'azione. ${!isPro ? 'Versione free: 7 giorni. Pro: 30 giorni.' : ''}`}
        icon={<Building2 className="w-4 h-4" />}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          {eventTypes.map((type) => (
            <Button
              key={type.value}
              variant={typeFilter === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {countries.map((country) => (
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
      </div>

      {/* Events List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            {locale === 'it' ? 'Nessun evento trovato' : 'No events found'}
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.symbol}-${event.date}-${index}`}
              className="bg-bg-base border border-border-subtle rounded-lg p-4 transition-all hover:border-accent/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getEventIcon(event.type)}
                    <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded font-semibold uppercase">
                      {event.type}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {event.exchange || event.country}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    {event.name} ({event.symbol})
                  </h3>
                  {event.description && (
                    <p className="text-xs text-text-secondary mb-2">
                      {event.description}
                    </p>
                  )}
                  {event.value && (
                    <p className="text-xs text-text-tertiary">
                      {typeof event.value === 'number' 
                        ? `${event.currency || 'USD'} ${event.value.toFixed(2)}`
                        : event.value}
                    </p>
                  )}

                  {/* Earnings Surprise */}
                  {event.earningsSurprise && event.earningsSurprise.surprise !== undefined && (
                    <div className="mt-2 pt-2 border-t border-border-subtle">
                      <div className="text-xs font-medium text-text-secondary mb-1">
                        {locale === 'it' ? 'Sorpresa Earnings' : 'Earnings Surprise'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-tertiary">
                          Est: {event.earningsSurprise.estimate?.toFixed(2)}
                        </span>
                        <span className="text-xs text-text-tertiary">→</span>
                        <span className="text-xs text-text-primary font-semibold">
                          Act: {event.earningsSurprise.actual?.toFixed(2)}
                        </span>
                        <span className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded',
                          event.earningsSurprise.surprisePercent && event.earningsSurprise.surprisePercent > 0
                            ? 'bg-green-500/20 text-green-400'
                            : event.earningsSurprise.surprisePercent && event.earningsSurprise.surprisePercent < 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        )}>
                          {event.earningsSurprise.surprisePercent && event.earningsSurprise.surprisePercent > 0 ? '+' : ''}
                          {event.earningsSurprise.surprisePercent?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-text-primary">
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
