'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { useSafeRouter } from '@/lib/hooks/useSafeRouter';
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
  const router = useSafeRouter();
  const isPro = useIsPro();
  const [isExpanded, setIsExpanded] = useState(false);

  // Azioni rapide alleggerite - solo le più importanti
  const actions: QuickAction[] = [
    {
      id: 'utilities',
      label: t('dashboard.quickActions.utilities') || 'Utilities',
      description: t('dashboard.quickActions.utilitiesDesc') || 'Strumenti finanziari professionali',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-accent/20',
      borderColor: 'border-accent/30',
      href: '/dashboard/utilities',
    },
  ];

  // Filtra azioni in base al ruolo (memoizzato)
  const availableActions = useMemo(
    () => Array.isArray(actions) ? actions.filter(action => !action.proOnly || isPro) : [],
    [actions, isPro]
  );
  // Mostra tutte le azioni (solo 1 ora)
  const visibleActions = useMemo(
    () => availableActions,
    [availableActions]
  );

  return (
    <section className="mb-8" aria-label={t('dashboard.quickActions.title') || 'Azioni rapide'}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('dashboard.quickActions.title') || 'Azioni Rapide'}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
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
});

