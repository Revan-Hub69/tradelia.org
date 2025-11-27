'use client';

import Link from 'next/link';
import styles from './EducationSection.module.css';

export function EducationSection() {
  const features = [
    {
      title: 'Percorsi Gamificati',
      description: 'Assessment, tutorial, quiz e badge per un apprendimento coinvolgente e strutturato.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      title: 'Materiale Didattico Completo',
      description: 'Documentazione completa di fonti, ipotesi e limiti per un apprendimento trasparente.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      title: 'Conforme MiFID-Safe',
      description: 'Materiale educativo conforme alle regole MiFID II per formazione professionale.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
    {
      title: 'Nessun Login Richiesto',
      description: 'Accesso immediato, nessuna registrazione. Inizia subito la tua formazione.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Formazione</span>
          </div>
          <h2 className={styles.sectionTitle}>La Formazione Finanziaria più Avanzata</h2>
          <p className={styles.sectionDescription}>
            Percorsi formativi completi basati su <strong>framework AI proprietari verificabili</strong>.
            <br />
            Gratuito, accessibile, accademico.
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
