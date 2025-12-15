'use client';

import { useState, useEffect, memo } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { SectionBanner } from '../SectionBanner';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { it as itLocale } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'economic' | 'ipo' | 'corporate';
  impact?: 'high' | 'medium' | 'low';
}

/**
 * Events Preview - Prossimi 3 eventi per tipo (Economic, IPO, Corporate)
 * Link "Vedi calendario completo" → Sezione calendario completa
 */
export const EventsPreview = memo(function EventsPreview() {
  const { t, locale } = useTranslations();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Fetch real events
        const [economicRes, ipoRes, corporateRes] = await Promise.all([
          fetch('/api/market/economic-calendar?limit=3'),
          fetch('/api/market/ipo-calendar?limit=3'),
          fetch('/api/market/corporate-events?limit=3'),
        ]);

        const allEvents: Event[] = [];

        if (economicRes.ok) {
          const economicData = await economicRes.json();
          if (economicData.data) {
            allEvents.push(...economicData.data.slice(0, 3).map((e: any) => ({
              id: `economic-${e.id}`,
              title: e.title || e.event,
              date: e.date || e.timestamp,
              type: 'economic' as const,
              impact: e.impact || 'medium',
            })));
          }
        }

        if (ipoRes.ok) {
          const ipoData = await ipoRes.json();
          if (ipoData.data) {
            allEvents.push(...ipoData.data.slice(0, 3).map((e: any) => ({
              id: `ipo-${e.id}`,
              title: e.company || e.name,
              date: e.date || e.ipoDate,
              type: 'ipo' as const,
            })));
          }
        }

        if (corporateRes.ok) {
          const corporateData = await corporateRes.json();
          if (corporateData.data) {
            allEvents.push(...corporateData.data.slice(0, 3).map((e: any) => ({
              id: `corporate-${e.id}`,
              title: e.title || e.event,
              date: e.date || e.eventDate,
              type: 'corporate' as const,
            })));
          }
        }

        // Ordina per data e prendi i prossimi 3
        const sorted = allEvents
          .filter(e => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);

        setEvents(sorted);
      } catch (error) {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'economic':
        return 'Economico';
      case 'ipo':
        return 'IPO';
      case 'corporate':
        return 'Corporate';
      default:
        return 'Evento';
    }
  };

  return (
    <section className="mb-6" aria-label="Anteprima eventi">
      <div className="mb-4">
        <SectionBanner
          title="Prossimi Eventi di Mercato"
          description="I 3 eventi più importanti in arrivo: economici, IPO, corporate. Vedi il calendario completo nella sezione Market Data."
        />
        <div className="mt-2 text-right">
          <Link
            href={buildLocalePath(locale, '/dashboard/market-data')}
            className="text-sm text-white hover:text-white inline-flex items-center gap-1 relative group"
          >
            Vedi calendario completo <ArrowRight className="w-3 h-3" />
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500/25 group-hover:w-full transition-all duration-300" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-bg-soft border border-border-subtle rounded-xl p-4">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="mt-4 text-center py-8 text-text-secondary">
          Nessun evento imminente.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const isToday = format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isTomorrow = format(eventDate, 'yyyy-MM-dd') === format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

            return (
              <div
                key={event.id}
                className={cn(
                  'bg-bg-soft border border-border-subtle rounded-xl p-4',
                  'hover:border-accent/60 hover:shadow-md transition-all duration-200'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-text-tertiary" />
                      <span className="text-xs font-medium text-text-secondary">
                        {getEventTypeLabel(event.type)}
                      </span>
                      {event.impact && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          event.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          event.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        )}>
                          {event.impact === 'high' ? 'Alto' : event.impact === 'medium' ? 'Medio' : 'Basso'}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1">
                      {event.title}
                    </h4>
                    <div className="text-xs text-text-secondary">
                      {isToday ? 'Oggi' : isTomorrow ? 'Domani' : format(eventDate, 'd MMM yyyy', { locale: locale === 'it' ? itLocale : undefined })}
                      {' • '}
                      {format(eventDate, 'HH:mm')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
});
