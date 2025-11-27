'use client';

import Link from 'next/link';
import styles from './EducationSection.module.css';

export function EducationSection() {
  const features = [
    {
      title: 'Percorsi Gamificati',
      description: 'Assessment strutturati, tutorial interattivi, quiz di verifica e sistema di badge per un apprendimento coinvolgente e progressivo.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      title: 'Materiale Didattico Completo',
      description: 'Documentazione accademica completa con fonti verificabili, ipotesi esplicitate e limiti metodologici documentati per trasparenza totale.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      title: 'Conforme MiFID II',
      description: 'Materiale educativo conforme alle regole MiFID II e agli standard accademici internazionali per formazione professionale certificata.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      title: 'Accesso Immediato',
      description: 'Nessuna registrazione richiesta, accesso immediato a tutti i contenuti formativi. Inizia la tua formazione in pochi secondi.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.educationSection}>
      <div className={styles.educationContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Formazione</span>
          </div>
          <h2 className={styles.sectionTitle}>Formazione Finanziaria di Livello Accademico</h2>
          <p className={styles.sectionDescription}>
            Percorsi formativi completi basati su <strong>framework AI proprietari verificabili</strong> e metodologie documentate.
            <br />
            Conforme agli standard accademici internazionali e alle normative MiFID II.
          </p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
        <div className={styles.educationCta}>
          <Link href="/dashboard#education" className={styles.btnPrimary}>
            <span>Esplora i Percorsi Formativi</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
