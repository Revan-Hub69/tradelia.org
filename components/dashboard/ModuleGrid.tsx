'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';
import { useApi } from '@/lib/hooks/useApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { ContextualHelp } from './ContextualHelp';

interface Module {
  id: string;
  title: string;
  description: string | null;
  href: string;
  icon: string | null;
  priority: 'primary' | 'secondary';
  badge_count: number;
}

interface ModuleGridProps {
  priority?: 'primary' | 'secondary';
}

export const ModuleGrid = memo(function ModuleGrid({ priority }: ModuleGridProps) {
  const { data: modulesData, loading, error, retry } = useApi<Module[]>(
    `/api/dashboard/modules${priority ? `?priority=${priority}` : ''}`,
    {
      cacheTime: 5 * 60 * 1000, // 5 minutes (modules don't change often)
      requireAuth: false, // Permetti accesso guest
      onError: (err) => {
        // Non mostrare errore per 401/500 - è normale se le tabelle non esistono ancora
        if (err instanceof Error && ((err as any).status === 401 || (err as any).status === 500)) {
          return;
        }
        toast.error('Errore nel caricamento dei moduli', {
          action: {
            label: 'Riprova',
            onClick: retry,
          },
        });
      },
    }
  );

  const filteredModules = useMemo(() => {
    if (!modulesData) return [];
    return priority 
      ? modulesData.filter(m => m.priority === priority)
      : modulesData;
  }, [modulesData, priority]);

  const title = priority === 'primary' 
    ? 'Moduli Principali' 
    : priority === 'secondary'
    ? 'Moduli Secondari'
    : 'Moduli';

  if (loading) {
    return (
      <div className={styles.moduleCategory}>
        <h2 className={styles.categoryTitle}>{title}</h2>
        <div className={styles.modulesGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.moduleCard}>
              <Skeleton variant="rectangular" height={80} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Non mostrare errore per 401/500 - è normale se le tabelle non esistono ancora
  // Mostra semplicemente una griglia vuota
  if (error && !(error instanceof Error && ((error as any).status === 401 || (error as any).status === 500))) {
    return (
      <div className={styles.moduleCategory}>
        <h2 className={styles.categoryTitle}>{title}</h2>
        <div className="p-6 bg-error/10 border border-error/30 rounded-xl">
          <p className="text-sm text-error mb-3">
            Errore nel caricamento dei moduli
          </p>
          <button
            onClick={retry}
            className="px-4 py-2 rounded-lg bg-error/20 hover:bg-error/30 border border-error/40 text-error text-sm font-medium transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (filteredModules.length === 0) {
    return null;
  }

  return (
    <div className={styles.moduleCategory}>
      <div className="flex items-center gap-2 mb-4">
        <h2 className={styles.categoryTitle}>{title}</h2>
        <ContextualHelp
          content={priority === 'primary' 
            ? 'I moduli principali contengono le funzionalità più utilizzate. Clicca su un modulo per accedere.'
            : 'I moduli secondari contengono funzionalità aggiuntive e avanzate.'}
          aria-label="Informazioni sui moduli"
        />
      </div>
      <div 
        className={styles.modulesGrid}
        role="list"
        aria-label={priority === 'primary' ? 'Moduli principali della dashboard' : 'Moduli secondari della dashboard'}
      >
        {filteredModules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
});

function ModuleCard({ module }: { module: Module }) {
  return (
    <Link 
      href={module.href} 
      className={styles.moduleCard}
      role="listitem"
      aria-label={`Accedi a ${module.title}: ${module.description || ''}`}
    >
      <div className={styles.moduleCardHeader}>
        <div className={styles.moduleIcon} aria-hidden="true">
          <ModuleIcon name={module.icon || 'dashboard'} />
        </div>
        <div className={styles.moduleInfo}>
          <h3 className={styles.moduleTitle}>{module.title}</h3>
          {module.description && (
            <p className={styles.moduleDescription}>{module.description}</p>
          )}
        </div>
        {module.badge_count > 0 && (
          <span className={styles.moduleBadge} aria-label={`${module.badge_count} nuove notifiche`}>
            {module.badge_count}
          </span>
        )}
        <div className={styles.moduleArrow} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16"
            height="16"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function ModuleIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    file: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    book: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    'book-open': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    history: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
      </svg>
    ),
    'help-circle': (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    building: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <line x1="9" y1="9" x2="9" y2="9.01" />
        <line x1="9" y1="12" x2="9" y2="12.01" />
        <line x1="9" y1="15" x2="9" y2="15.01" />
        <line x1="9" y1="18" x2="9" y2="18.01" />
      </svg>
    ),
  };

  return icons[name] || icons.dashboard;
}
