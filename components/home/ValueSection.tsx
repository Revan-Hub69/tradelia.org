'use client';

import styles from './ValueSection.module.css';

export function ValueSection() {
  const values = [
    { title: 'Gratuito', description: 'Nessun costo nascosto, completamente gratuito' },
    { title: 'Open Source', description: 'Metodologie verificabili e documentate' },
    { title: 'PWA', description: 'Installabile, funziona offline' },
    { title: 'MiFID-Safe', description: 'Materiale educativo conforme alle regole' },
  ];

  return (
    <section className={styles.valueSection}>
      <div className={styles.valueContainer}>
        <div className={styles.valueGrid}>
          {values.map((value, idx) => (
            <div key={idx} className={styles.valueCard}>
              <span className={styles.badge}>{value.title}</span>
              <strong>{value.description}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
