'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, AlertCircle, Clock, Lock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';

interface EconomicEvent {
  CalendarId: number;
  Country: string;
  Category: string;
  Event: string;
  Reference: string;
  Source: string;
  Actual: number | string | null;
  Forecast: number | string | null;
  Previous: number | string | null;
  Date: string;
  Importance: number;
  LastUpdate: string;
}

export function EconomicCalendar() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const days = isPro ? 30 : 7;
  const [countryFilter, setCountryFilter] = useState<string>('all');

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          days: days.toString(),
          country: countryFilter,
        });
        const response = await fetch(`/api/economic/calendar?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching economic calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
    const interval = setInterval(fetchCalendar, 60 * 60 * 1000); // Refresh every hour
    return () => clearInterval(interval);
  }, [days, countryFilter]);

  const getImportanceColor = (importance: number) => {
    if (importance === 3) return 'text-red-400 bg-red-400/10 border-red-400/30';
    if (importance === 2) return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
  };

  const getImportanceLabel = (importance: number) => {
    if (importance === 3) return 'High';
    if (importance === 2) return 'Medium';
    return 'Low';
  };

  const formatValue = (value: number | string | null): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'number') {
      return value.toLocaleString(locale, { maximumFractionDigits: 2 });
    }
    return String(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

      if (isToday) return 'Today';
      if (isTomorrow) return 'Tomorrow';
      return date.toLocaleDateString(locale, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getActualVsForecast = (actual: number | string | null, forecast: number | string | null) => {
    if (actual === null || forecast === null) return null;
    const actualNum = typeof actual === 'number' ? actual : parseFloat(String(actual));
    const forecastNum = typeof forecast === 'number' ? forecast : parseFloat(String(forecast));
    if (isNaN(actualNum) || isNaN(forecastNum)) return null;
    return actualNum - forecastNum;
  };

  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.Date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Economic Calendar"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            {t('dashboard.economicCalendar.title') || 'Economic Calendar'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.economicCalendar.description') || 'Upcoming economic events and indicators'}
            {!isPro && ` (${days} days - Pro: 30 days)`}
          </p>
        </div>
      </div>

      {!isPro && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-sm text-amber-400">
          <Lock className="w-4 h-4" />
          <span>
            {locale === 'it' 
              ? 'Versione Pro: 30 giorni vs 7 free. Aggiorna per vedere il calendario esteso.'
              : 'Pro Version: 30 days vs 7 free. Upgrade to see extended calendar.'}
          </span>
        </div>
      )}

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-bg-base border border-border-subtle rounded-lg p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            No economic events scheduled
          </div>
        ) : (
          Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date} className="space-y-2">
              <div className="text-sm font-semibold text-text-secondary mb-2">
                {new Date(date).toLocaleDateString(locale, { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              {dateEvents.map((event) => {
                const diff = getActualVsForecast(event.Actual, event.Forecast);
                const hasActual = event.Actual !== null;

                return (
                  <div
                    key={event.CalendarId}
                    className={cn(
                      'bg-bg-base border rounded-lg p-4 transition-all',
                      getImportanceColor(event.Importance)
                    )}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded">
                            {getImportanceLabel(event.Importance)}
                          </span>
                          <span className="text-xs text-text-tertiary">
                            {event.Category}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-text-primary mb-1">
                          {event.Event}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(event.Date)}</span>
                          <span>•</span>
                          <span>{event.Country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      <div>
                        <div className="text-text-tertiary mb-1">Previous</div>
                        <div className="font-semibold text-text-primary">
                          {formatValue(event.Previous)}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-tertiary mb-1">Forecast</div>
                        <div className="font-semibold text-text-primary">
                          {formatValue(event.Forecast)}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-tertiary mb-1">Actual</div>
                        <div className={cn(
                          'font-semibold flex items-center gap-1',
                          hasActual && diff !== null && (
                            diff > 0 
                              ? 'text-green-400' 
                              : diff < 0 
                                ? 'text-red-400' 
                                : 'text-text-primary'
                          )
                        )}>
                          {formatValue(event.Actual)}
                          {hasActual && diff !== null && diff !== 0 && (
                            diff > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {event.Source && (
                      <div className="text-xs text-text-tertiary mt-2">
                        Source: {event.Source}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
