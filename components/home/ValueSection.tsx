'use client';

import styles from './ValueSection.module.css';

export function ValueSection() {
  const values = [
    {
      title: 'Gratuito',
      description: 'Nessun costo nascosto, completamente gratuito e accessibile a tutti.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      title: 'Verificabile',
      description: 'Metodologie documentate con fonti, ipotesi e limiti completamente trasparenti.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4" />
          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
          <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" />
          <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3" />
        </svg>
      ),
    },
    {
      title: 'PWA Installabile',
      description: 'Dashboard installabile, funziona offline, accesso immediato da qualsiasi dispositivo.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
    {
      title: 'MiFID-Safe',
      description: 'Materiale educativo conforme alle regole MiFID II per formazione professionale.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ];

  return (
    <section className={styles.valueSection}>
      <div className={styles.valueContainer}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Valori</span>
          </div>
          <h2 className={styles.sectionTitle}>Perché Tradelia AI</h2>
          <p className={styles.sectionDescription}>
            La piattaforma di formazione finanziaria più <strong>avanzata, accessibile e trasparente</strong> al mondo.
          </p>
        </div>
        <div className={styles.valueGrid}>
          {values.map((value, idx) => (
            <div key={idx} className={styles.valueCard}>
              <div className={styles.valueIcon}>{value.icon}</div>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueDescription}>{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
