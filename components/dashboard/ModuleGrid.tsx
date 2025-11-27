'use client';

import Link from 'next/link';
import styles from '../../app/dashboard/dashboard.module.css';

const modules = [
  {
    id: 'overview',
    title: 'Panoramica',
    description: 'Statistiche, attività recente e accesso rapido',
    icon: 'dashboard',
    href: '/dashboard#overview',
  },
  {
    id: 'reports',
    title: 'Report Ufficiali',
    description: 'Consulta i report pubblici e le analisi disponibili',
    icon: 'file',
    href: '/dashboard#reports',
  },
  {
    id: 'education',
    title: 'Percorsi Formativi',
    description: 'Tutorial e corsi educativi',
    icon: 'book',
    href: '/dashboard#education',
  },
  {
    id: 'frameworks',
    title: 'Framework Documentation',
    description: 'Metodologie e framework di analisi',
    icon: 'book-open',
    href: '/dashboard#frameworks',
  },
  {
    id: 'requests-history',
    title: 'Storico Richieste',
    description: 'Le tue richieste di analisi on-demand',
    icon: 'history',
    href: '/dashboard#requests-history',
  },
  {
    id: 'notifications',
    title: 'Notifiche',
    description: 'Notifiche di sistema e aggiornamenti',
    icon: 'bell',
    href: '/dashboard#notifications',
  },
  {
    id: 'settings',
    title: 'Impostazioni',
    description: 'Preferenze utente e configurazioni',
    icon: 'settings',
    href: '/dashboard#settings',
  },
  {
    id: 'resources',
    title: 'Risorse & Supporto',
    description: 'FAQ, guide e contatti',
    icon: 'help-circle',
    href: '/dashboard#resources',
  },
];

export function ModuleGrid() {
  return (
    <section className={styles.moduleCategory}>
      <h2 className={styles.categoryTitle}>Moduli Principali</h2>
      <div className={styles.modulesGrid}>
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
}

function ModuleCard({ module }: { module: typeof modules[0] }) {
  return (
    <Link href={module.href} className={styles.moduleCard}>
      <div className={styles.moduleCardHeader}>
        <div className={styles.moduleIcon}>
          <ModuleIcon name={module.icon} />
        </div>
        <div className={styles.moduleInfo}>
          <h3 className={styles.moduleTitle}>{module.title}</h3>
          <p className={styles.moduleDescription}>{module.description}</p>
        </div>
        <div className={styles.moduleArrow}>
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
  };

  return icons[name] || icons.dashboard;
}
