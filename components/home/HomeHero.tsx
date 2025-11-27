'use client';

import Link from 'next/link';
import styles from './HomeHero.module.css';

export function HomeHero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Formazione Finanziaria Gratuita</span>
        </div>
        <h1 className={styles.heroTitle}>
          La piattaforma di <span className={styles.heroTitleHighlight}>formazione finanziaria</span> più avanzata al mondo
        </h1>
        <p className={styles.heroDescription}>
          Framework AI proprietari, metodologie verificabili e percorsi formativi completi.
          <br />
          <strong>Gratuito, accessibile, accademico.</strong>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link href="/dashboard" className={styles.btnSecondary}>
            <span>Accedi alla Dashboard</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
