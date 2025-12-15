'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Settings, TrendingUp, Cog, Calculator, Star, LineChart } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';
import { prefetchOnHover } from '@/lib/utils/prefetch';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

type TabId = 'overview' | 'market-data' | 'analysis' | 'favorites' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

/**
 * Dashboard Tabs Navigation
 * Best Practice 2024-2025: Web App Design con tabs per organizzare contenuti
 * - Overview: Panoramica generale
 * - Utilities: Strumenti finanziari
 * - Analysis: Report e analisi
 * - Settings: Impostazioni e configurazione
 */
export const DashboardTabs = memo(function DashboardTabs() {
  const { t, locale } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Memoize tabs per evitare re-creazione
  const tabs: Tab[] = useMemo(() => [
    {
      id: 'overview',
      label: t('dashboard.tabs.overview') || 'Panoramica',
      icon: BarChart3,
      href: buildLocalePath(locale, '/dashboard'),
      description: t('dashboard.tabs.overviewDesc') || 'Vista generale e attività recenti',
    },
    {
      id: 'market-data',
      label: t('dashboard.tabs.marketData') || 'Market Data',
      icon: TrendingUp,
      href: buildLocalePath(locale, '/dashboard/market-data'),
      description: t('dashboard.tabs.marketDataDesc') || 'Indicatori di mercato e dati real-time',
    },
    {
      id: 'analysis',
      label: t('dashboard.tabs.analysis') || 'Analisi',
      icon: LineChart,
      href: buildLocalePath(locale, '/dashboard/analysis'),
      description: t('dashboard.tabs.analysisDesc') || 'Analisi avanzate e grafici',
    },
    {
      id: 'favorites',
      label: t('dashboard.tabs.favorites') || 'Preferiti',
      icon: Star,
      href: buildLocalePath(locale, '/dashboard/favorites'),
      description: t('dashboard.tabs.favoritesDesc') || 'Contenuti salvati',
    },
    {
      id: 'settings',
      label: t('dashboard.tabs.settings') || 'Impostazioni',
      icon: Cog,
      href: buildLocalePath(locale, '/dashboard/settings'),
      description: t('dashboard.tabs.settingsDesc') || 'Profilo e configurazione',
    },
  ], [t, locale]);

  // Determina tab attivo basato sul pathname
  // Best Practice: Mapping preciso per ogni route dashboard
  useEffect(() => {
    if (!pathname) return;
    
    // Normalizza pathname (rimuovi /en se presente)
    const normalizedPath = pathname.replace(/^\/en/, '');
    
    // Mapping preciso: ogni route dashboard mappa a una tab specifica
    if (normalizedPath === '/dashboard' || normalizedPath === '/it/dashboard' || normalizedPath === '/en/dashboard') {
      setActiveTab('overview');
    } else if (normalizedPath.includes('/dashboard/market-data')) {
      setActiveTab('market-data');
    } else if (normalizedPath.includes('/dashboard/analysis')) {
      setActiveTab('analysis');
    } else if (normalizedPath.includes('/dashboard/favorites')) {
      setActiveTab('favorites');
    } else if (normalizedPath.includes('/dashboard/settings')) {
      setActiveTab('settings');
    } else if (normalizedPath.includes('/dashboard/utilities')) {
      // Utilities rimane come route separata, non tab
      setActiveTab('overview');
    } else {
      // Per altre route dashboard (requests, voting, billing, etc.)
      // Mantieni tab overview come default
      setActiveTab('overview');
    }
  }, [pathname]);

  // Memoize tab click handler
  const handleTabClick = useCallback((tab: Tab) => {
    setActiveTab(tab.id);
    router.push(tab.href);
  }, [router]);

  return (
    <div className="sticky top-0 z-40 bg-bg-base border-b border-premium shadow-premium mb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl container-mobile">
        {/* Breadcrumb - Currency Switch è già in DashboardHeader */}
        <div className="py-3 border-b border-border-subtle">
          <Breadcrumb />
        </div>
        
        {/* Tabs */}
        <nav
          role="tablist"
          aria-label={t('dashboard.tabs.navigation') || 'Navigazione dashboard'}
        >
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => handleTabClick(tab)}
                onMouseEnter={() => prefetchOnHover(tab.href)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium interaction-smooth relative',
                  'border-b-2 transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base',
                  isActive
                    ? 'text-white border-blue-500/50 font-semibold'
                    : 'text-text-secondary border-transparent hover:text-white hover:border-blue-500/25'
                )}
                title={tab.description}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
          </div>
        </nav>
      </div>
    </div>
  );
});
