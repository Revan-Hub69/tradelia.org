'use client';

import { useState, useMemo, memo } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, FileText, TrendingUp, BookOpen, PieChart, Sparkles } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  href?: string;
  onClick?: () => void;
  proOnly?: boolean;
}

export const QuickActions = memo(function QuickActions() {
  const [loading, setLoading] = useState(true);

  // Simulate loading for future API integration
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="mb-8" aria-label="Azioni rapide">
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 min-w-[120px]">
              <Skeleton variant="rectangular" height={48} />
            </div>
          ))}
        </div>
      </section>
    );
  }
  const { t } = useTranslations();
  const router = useRouter();
  const isPro = useIsPro();
  const [isExpanded, setIsExpanded] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'request-analysis',
      label: t('dashboard.quickActions.requestAnalysis') || 'Richiedi Analisi',
      description: t('dashboard.quickActions.requestAnalysisDesc') || 'Richiedi un analisi personalizzata',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      borderColor: 'border-blue-400/30',
      onClick: () => {
        // Apri ProUtilities e seleziona request-analysis
        window.dispatchEvent(new CustomEvent('open-pro-utilities'));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('select-utility', { detail: 'request-analysis' }));
        }, 300);
      },
    },
    {
      id: 'add-position',
      label: t('dashboard.quickActions.addPosition') || 'Aggiungi Posizione',
      description: t('dashboard.quickActions.addPositionDesc') || 'Aggiungi una posizione al portafoglio',
      icon: <PieChart className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      borderColor: 'border-green-400/30',
      proOnly: true,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('open-pro-utilities'));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('select-utility', { detail: 'portfolio' }));
        }, 300);
      },
    },
    {
      id: 'start-course',
      label: t('dashboard.quickActions.startCourse') || 'Inizia Corso',
      description: t('dashboard.quickActions.startCourseDesc') || 'Inizia un nuovo percorso formativo',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20',
      borderColor: 'border-purple-400/30',
      href: '/dashboard#education',
    },
  ];

  // Filtra azioni in base al ruolo (memoizzato)
  const availableActions = useMemo(
    () => actions.filter(action => !action.proOnly || isPro),
    [actions, isPro]
  );
  const visibleActions = useMemo(
    () => isExpanded ? availableActions : availableActions.slice(0, 3),
    [isExpanded, availableActions]
  );

  return (
    <section className="mb-8" aria-label={t('dashboard.quickActions.title') || 'Azioni rapide'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('dashboard.quickActions.title') || 'Azioni Rapide'}
        </h2>
        {availableActions.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
            aria-label={isExpanded 
              ? t('dashboard.quickActions.showLess') || 'Mostra meno azioni'
              : t('dashboard.quickActions.showMore') || `Mostra altre ${availableActions.length - 3} azioni`}
            aria-expanded={isExpanded}
          >
            {isExpanded
              ? t('dashboard.quickActions.showLess') || 'Mostra meno'
              : t('dashboard.quickActions.showMore') || `Mostra altre (${availableActions.length - 3})`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleActions.map((action, index) => {
          const content = (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group',
                action.bgColor,
                action.borderColor,
                'hover:shadow-md hover:scale-[1.02]'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  action.bgColor,
                  action.color
                )}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary text-sm mb-1">{action.label}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{action.description}</p>
                </div>
                <Plus className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform',
                  action.color,
                  'group-hover:rotate-90'
                )} />
              </div>
            </motion.div>
          );

          if (action.onClick) {
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="text-left w-full"
                aria-label={`${action.label}: ${action.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    action.onClick?.();
                  }
                }}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href || '#'}
              className="block"
              aria-label={`${action.label}: ${action.description}`}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

