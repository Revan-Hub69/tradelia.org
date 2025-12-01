'use client';

import { useState, useEffect } from 'react';
import { Layout, BarChart3, TrendingUp, PieChart, Calendar, Settings, Smartphone, Monitor, Download, ExternalLink } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/Toast';

interface Widget {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'analytics' | 'portfolio' | 'calendar' | 'custom';
  enabled: boolean;
}

const availableWidgets: Widget[] = [
  {
    id: 'portfolio-overview',
    name: 'Portfolio Overview',
    description: 'Vista d\'insieme del tuo portafoglio con grafici e metriche',
    icon: <PieChart className="w-5 h-5" />,
    category: 'portfolio',
    enabled: true,
  },
  {
    id: 'performance-chart',
    name: 'Performance Chart',
    description: 'Grafico delle performance nel tempo',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'analytics',
    enabled: false,
  },
  {
    id: 'market-summary',
    name: 'Market Summary',
    description: 'Riepilogo dei mercati in tempo reale',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'analytics',
    enabled: false,
  },
  {
    id: 'calendar-events',
    name: 'Calendar Events',
    description: 'Eventi e scadenze importanti',
    icon: <Calendar className="w-5 h-5" />,
    category: 'calendar',
    enabled: false,
  },
];

interface MobileWidget {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  platforms: ('android' | 'ios' | 'desktop')[];
}

const mobileWidgets: MobileWidget[] = [
  {
    id: 'portfolio',
    name: 'Portfolio Widget',
    description: 'Visualizza il tuo portafoglio direttamente sulla home screen',
    url: '/widgets/portfolio',
    icon: <PieChart className="w-5 h-5" />,
    platforms: ['android', 'ios', 'desktop'],
  },
  {
    id: 'watchlist',
    name: 'Watchlist Widget',
    description: 'Monitora i tuoi asset preferiti in tempo reale',
    url: '/widgets/watchlist',
    icon: <TrendingUp className="w-5 h-5" />,
    platforms: ['android', 'ios', 'desktop'],
  },
  {
    id: 'alerts',
    name: 'Alert Widget',
    description: 'Vedi i tuoi alert attivi e quelli triggerati',
    url: '/widgets/alerts',
    icon: <BarChart3 className="w-5 h-5" />,
    platforms: ['android', 'ios', 'desktop'],
  },
];

export function WidgetsContent() {
  const { t } = useTranslations();
  const isPro = useIsPro();
  const [widgets, setWidgets] = useState<Widget[]>(availableWidgets);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isDesktopDevice = !isMobileDevice && (window.innerWidth >= 1024);
      
      setIsMobile(isMobileDevice);
      setIsDesktop(isDesktopDevice);
    }
  }, []);

  const categories = ['all', 'analytics', 'portfolio', 'calendar', 'custom'];

  const filteredWidgets = selectedCategory === 'all'
    ? widgets
    : widgets.filter(w => w.category === selectedCategory);

  const toggleWidget = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const openWidgetStandalone = (widgetUrl: string, widgetName: string) => {
    // Apri widget in finestra standalone (desktop)
    const width = 400;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'resizable=yes',
      'scrollbars=yes',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'status=no',
    ].join(',');

    const widgetWindow = window.open(
      widgetUrl,
      `widget-${widgetName}`,
      features
    );

    if (widgetWindow) {
      toast.success(t('widgets.openedStandalone') || 'Widget aperto in finestra separata');
    } else {
      toast.error(t('widgets.popupBlocked') || 'Popup bloccato. Abilita i popup per questo sito.');
    }
  };

  const installWidgetInstructions = (platform: 'android' | 'ios' | 'desktop') => {
    if (platform === 'android') {
      toast.info(
        t('widgets.installAndroid') || 
        '1. Apri il widget in Chrome\n2. Menu (3 punti) → Aggiungi alla schermata home\n3. Seleziona "Aggiungi widget"',
        { duration: 8000 }
      );
    } else if (platform === 'ios') {
      toast.info(
        t('widgets.installIOS') || 
        '1. Apri il widget in Safari\n2. Condividi → Aggiungi alla schermata Home\n3. Configura e aggiungi',
        { duration: 8000 }
      );
    } else if (platform === 'desktop') {
      toast.info(
        t('widgets.installDesktop') || 
        'Il widget si aprirà in una finestra standalone. Puoi anche creare un collegamento sul desktop.',
        { duration: 5000 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-bg-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {t('widgets.title') || 'Widget'}
              </h1>
              <p className="text-text-secondary mt-1">
                {t('widgets.subtitle') || 'Personalizza la tua dashboard con widget interattivi'}
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                selectedCategory === category
                  ? 'bg-accent text-white'
                  : 'bg-bg-soft text-text-secondary hover:bg-bg-surface border border-border-subtle'
              )}
            >
              {category === 'all' ? (t('widgets.all') || 'Tutti') : category}
            </button>
          ))}
        </div>

        {/* Mobile/Desktop Widgets Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">
              {t('widgets.mobileWidgets') || 'Widget Installabili (Mobile & Desktop)'}
            </h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            {t('widgets.mobileWidgetsDesc') || 'Aggiungi questi widget alla home screen del tuo telefono o apri come finestra standalone su desktop'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {mobileWidgets.map((widget, index) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-bg-surface border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                      {widget.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{widget.name}</h3>
                      <p className="text-xs text-text-tertiary">
                        {widget.platforms.map(p => {
                          if (p === 'android') return 'Android';
                          if (p === 'ios') return 'iOS';
                          if (p === 'desktop') return 'Desktop';
                          return p;
                        }).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-text-secondary mb-4">{widget.description}</p>
                <div className="flex flex-col gap-2">
                  {isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(widget.url, '_blank');
                        installWidgetInstructions(isMobile ? (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? 'ios' : 'android') : 'desktop');
                      }}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      {t('widgets.openForInstall') || 'Apri per Installare'}
                    </Button>
                  )}
                  {isDesktop && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openWidgetStandalone(widget.url, widget.id)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Monitor className="w-4 h-4" />
                      {t('widgets.openStandalone') || 'Apri in Finestra Standalone'}
                    </Button>
                  )}
                  <a
                    href={widget.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t('widgets.openInNewTab') || 'Apri in Nuova Scheda'}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dashboard Widgets Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-text-primary">
              {t('widgets.dashboardWidgets') || 'Widget Dashboard'}
            </h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            {t('widgets.dashboardWidgetsDesc') || 'Personalizza i widget nella tua dashboard web'}
          </p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWidgets.map((widget, index) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'bg-bg-surface border rounded-xl p-6 transition-all',
                widget.enabled
                  ? 'border-accent/40 shadow-md'
                  : 'border-border-subtle hover:border-accent/20'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    widget.enabled ? 'bg-accent/20 text-accent' : 'bg-bg-soft text-text-tertiary'
                  )}>
                    {widget.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{widget.name}</h3>
                    <p className="text-xs text-text-tertiary capitalize">{widget.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleWidget(widget.id)}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors relative',
                    widget.enabled ? 'bg-accent' : 'bg-bg-soft border border-border-subtle'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    widget.enabled ? 'translate-x-4' : 'translate-x-0'
                  )} />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-4">{widget.description}</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  widget.enabled
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                    : 'bg-bg-soft text-text-tertiary border border-border-subtle'
                )}>
                  {widget.enabled ? (t('widgets.enabled') || 'Abilitato') : (t('widgets.disabled') || 'Disabilitato')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredWidgets.length === 0 && (
          <div className="text-center py-12 text-text-tertiary">
            <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('widgets.noWidgets') || 'Nessun widget disponibile in questa categoria'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

