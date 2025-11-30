'use client';

import { useState } from 'react';
import { Layout, BarChart3, TrendingUp, PieChart, Calendar, Settings } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';

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

export function WidgetsContent() {
  const { t } = useTranslations();
  const [widgets, setWidgets] = useState<Widget[]>(availableWidgets);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'analytics', 'portfolio', 'calendar', 'custom'];

  const filteredWidgets = selectedCategory === 'all'
    ? widgets
    : widgets.filter(w => w.category === selectedCategory);

  const toggleWidget = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
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

