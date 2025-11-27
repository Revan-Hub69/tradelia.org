'use client';

import styles from './AudienceSection.module.css';

export function AudienceSection() {
  const audiences = [
    { badge: 'Studenti', text: 'Approfondimenti accademici sui mercati finanziari' },
    { badge: 'Traders', text: 'Framework pratici per analisi tattiche' },
    { badge: 'Ricercatori', text: 'Metodologie verificabili e documentate' },
    { badge: 'Educatori', text: 'Materiale didattico conforme MiFID-safe' },
  ];

  return (
    <section className={styles.audienceSection}>
      <div className={styles.audienceContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Per Chi</h2>
          <p className={styles.sectionDescription}>
            Campus formativo gratuito pensato per diverse <strong>tipologie di utenti</strong>.
          </p>
        </div>
        <div className={styles.audienceGrid}>
          {audiences.map((audience, idx) => (
            <div key={idx} className={styles.audienceCard}>
              <span className={styles.audienceBadge}>{audience.badge}</span>
              <strong>{audience.text}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
