'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, BarChart3, Settings, GraduationCap, FileText, TrendingUp, Cog, Calculator } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils/cn';
import { prefetchOnHover } from '@/lib/utils/prefetch';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

type TabId = 'overview' | 'education' | 'utilities' | 'analysis' | 'settings';

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
 * - Education: Formazione e corsi
 * - Analysis: Report e analisi
 * - Settings: Impostazioni e configurazione
 */
export function DashboardTabs() {
  const { t, locale } = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: t('dashboard.tabs.overview') || 'Panoramica',
      icon: BarChart3,
      href: buildLocalePath(locale, '/dashboard'),
      description: t('dashboard.tabs.overviewDesc') || 'Vista generale e attività recenti',
    },
    {
      id: 'education',
      label: t('dashboard.tabs.education') || 'Formazione',
      icon: GraduationCap,
      href: buildLocalePath(locale, '/dashboard/education'),
      description: t('dashboard.tabs.educationDesc') || 'Corsi e percorsi formativi',
    },
    {
      id: 'utilities',
      label: t('dashboard.tabs.utilities') || 'Utilities',
      icon: Calculator,
      href: buildLocalePath(locale, '/dashboard/utilities'),
      description: t('dashboard.tabs.utilitiesDesc') || 'Strumenti finanziari e calcolatori',
    },
    {
      id: 'analysis',
      label: t('dashboard.tabs.analysis') || 'Analisi',
      icon: TrendingUp,
      href: buildLocalePath(locale, '/dashboard/analysis'),
      description: t('dashboard.tabs.analysisDesc') || 'Report e richieste analisi',
    },
    {
      id: 'settings',
      label: t('dashboard.tabs.settings') || 'Impostazioni',
      icon: Cog,
      href: buildLocalePath(locale, '/dashboard/settings'),
      description: t('dashboard.tabs.settingsDesc') || 'Profilo e configurazione',
    },
  ];

  // Determina tab attivo basato sul pathname
  // Best Practice: Mapping preciso per ogni route dashboard
  useEffect(() => {
    if (!pathname) return;
    
    // Normalizza pathname (rimuovi /en se presente)
    const normalizedPath = pathname.replace(/^\/en/, '');
    
    // Mapping preciso: ogni route dashboard mappa a una tab specifica
    if (normalizedPath === '/dashboard' || normalizedPath === '/it/dashboard' || normalizedPath === '/en/dashboard') {
      setActiveTab('overview');
    } else if (normalizedPath.includes('/dashboard/education')) {
      setActiveTab('education');
    } else if (normalizedPath.includes('/dashboard/utilities')) {
      setActiveTab('utilities');
    } else if (normalizedPath.includes('/dashboard/analysis') || normalizedPath.includes('/dashboard/reports')) {
      setActiveTab('analysis');
    } else if (normalizedPath.includes('/dashboard/settings')) {
      setActiveTab('settings');
    } else {
      // Per altre route dashboard (requests, voting, favorites, billing, etc.)
      // Mantieni tab overview come default
      setActiveTab('overview');
    }
  }, [pathname]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id);
    router.push(tab.href);
  };

  return (
    <div className="sticky top-0 z-40 bg-bg-base border-b border-border-subtle mb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative',
                  'border-b-2 border-transparent',
                  'hover:text-accent hover:border-accent/40',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base',
                  isActive
                    ? 'text-accent border-accent'
                    : 'text-text-secondary'
                )}
                title={tab.description}
              >
                <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
          </div>
        </nav>
      </div>
    </div>
  );
}
