'use client';

import Link from 'next/link';
import styles from './MethodSection.module.css';

export function MethodSection() {
  const methods = [
    {
      id: 'fdm',
      title: 'FDM',
      subtitle: 'Framework Dinamico dei Mercati',
      description: 'Analisi contesto macro con controlli incrociati multiformato e aggiornamenti dinamici in tempo reale.',
      features: [
        'Analisi contesto macro',
        'Controlli incrociati multiformato',
        'Aggiornamenti dinamici',
      ],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18" />
          <path d="M7 12l4-4 4 4 6-6" />
        </svg>
      ),
    },
    {
      id: 'mlt',
      title: 'MLT',
      subtitle: 'Matrice delle Letture Tattiche',
      description: 'Analisi intermarket con correlazioni cross-asset e segnali tattici per decisioni informate.',
      features: [
        'Analisi intermarket',
        'Correlazioni cross-asset',
        'Segnali tattici',
      ],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'pac',
      title: 'PAC',
      subtitle: 'Protocollo di Allerta Criptovalute',
      description: 'Monitoraggio cripto con alert automatizzati e analisi rischio per gestione consapevole.',
      features: [
        'Monitoraggio cripto',
        'Alert automatizzati',
        'Analisi rischio',
      ],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
  ];

  return (
    <section id="method" className={styles.methodSection}>
      <div className={styles.methodContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Framework AI Proprietari</span>
          </div>
          <h2 className={styles.sectionTitle}>Metodologie Verificabili</h2>
          <p className={styles.sectionDescription}>
            Framework AI proprietari per approfondimenti multiformato su contesto macro, intermarket e tecnico con{' '}
            <strong>controlli incrociati verificabili</strong>.
          </p>
        </div>
        <div className={styles.methodGrid}>
          {methods.map((method) => (
            <div key={method.id} className={styles.methodCard}>
              <div className={styles.methodCardHeader}>
                <div className={styles.methodCardIcon}>{method.icon}</div>
                <div>
                  <div className={styles.methodCardAcronym}>{method.title}</div>
                  <h3 className={styles.methodCardTitle}>{method.subtitle}</h3>
                </div>
              </div>
              <p className={styles.methodCardDescription}>{method.description}</p>
              <ul className={styles.methodCardList}>
                {method.features.map((feature, idx) => (
                  <li key={idx}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard#education" className={styles.methodCardLink}>
                <span>Esplora Framework</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
