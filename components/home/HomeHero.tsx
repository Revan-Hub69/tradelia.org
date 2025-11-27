'use client';

import Link from 'next/link';
import styles from './HomeHero.module.css';

export function HomeHero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroContainer}>
        <div className={styles.heroBadge}>Campus Formativo Gratuito</div>
        <h1 className={styles.heroTitle}>
          Framework AI proprietari per{' '}
          <span className={styles.heroTitleHighlight}>analisi sui mercati</span>
        </h1>
        <p className={styles.heroDescription}>
          Percorsi formativi gamificati basati su framework AI proprietari (FDM, MLT, PAC).
          Dashboard PWA installabile, nessun login richiesto.
        </p>
        <div className={styles.heroFeatures}>
          <div className={styles.heroFeature}>
            <span className={styles.heroFeatureIcon}>✓</span>
            <div>
              <strong>Gratuito</strong>
              <span>Nessun costo nascosto</span>
            </div>
          </div>
          <div className={styles.heroFeature}>
            <span className={styles.heroFeatureIcon}>✓</span>
            <div>
              <strong>PWA Installabile</strong>
              <span>Funziona offline</span>
            </div>
          </div>
          <div className={styles.heroFeature}>
            <span className={styles.heroFeatureIcon}>✓</span>
            <div>
              <strong>Nessun Login</strong>
              <span>Inizia subito</span>
            </div>
          </div>
        </div>
        <div className={styles.heroCta}>
          <Link href="/dashboard" className={styles.btnPrimary}>
            Accedi alla Dashboard
          </Link>
          <Link href="#method" className={styles.btnSecondary}>
            Scopri i Framework
          </Link>
        </div>
        <div className={styles.heroDisclaimer}>
          <p>
            Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
          </p>
        </div>
      </div>
    </section>
  );
}
