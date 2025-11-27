'use client';

import Link from 'next/link';
import styles from './HomeHero.module.css';

export function HomeHero() {
  return (
    <section className={styles.heroSection}>
      {/* Pattern geometrico raffinato */}
      <div className="geometric-pattern" />
      
      <div className={styles.heroContainer}>
        <div className={styles.heroBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Formazione Finanziaria</span>
        </div>
        <h1 className={styles.heroTitle}>
          Formazione finanziaria gratuita basata su <span className={styles.heroTitleHighlight}>framework verificabili</span>
        </h1>
        <p className={styles.heroDescription}>
          Percorsi formativi completi, metodologie documentate e materiale didattico conforme agli standard accademici internazionali.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <div className={styles.heroStatValue}>100%</div>
            <div className={styles.heroStatLabel}>Gratuito</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatValue}>3</div>
            <div className={styles.heroStatLabel}>Framework AI</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatValue}>∞</div>
            <div className={styles.heroStatLabel}>Accesso Ilimitato</div>
          </div>
        </div>
        <div className={styles.heroCta}>
          <Link href="/dashboard#education" className={styles.btnPrimary}>
            <span>Inizia la Formazione</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link href="/dashboard" className={styles.btnSecondary}>
            <span>Dashboard</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </Link>
        </div>
        <div className={styles.heroDisclaimer}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
            Materiale conforme alle regole MiFID II e agli standard accademici internazionali.
          </p>
        </div>
      </div>
    </section>
  );
}
