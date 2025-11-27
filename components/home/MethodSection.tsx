'use client';

import styles from './MethodSection.module.css';

export function MethodSection() {
  const methods = [
    {
      id: 'fdm',
      title: 'FDM',
      subtitle: 'Framework Dinamico dei Mercati',
      items: [
        'Analisi contesto macro',
        'Controlli incrociati multiformato',
        'Aggiornamenti dinamici',
      ],
    },
    {
      id: 'mlt',
      title: 'MLT',
      subtitle: 'Matrice delle Letture Tattiche',
      items: [
        'Analisi intermarket',
        'Correlazioni cross-asset',
        'Segnali tattici',
      ],
    },
    {
      id: 'pac',
      title: 'PAC',
      subtitle: 'Protocollo di Allerta Criptovalute',
      items: [
        'Monitoraggio cripto',
        'Alert automatizzati',
        'Analisi rischio',
      ],
    },
  ];

  return (
    <section id="method" className={styles.methodSection}>
      <div className={styles.methodContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Framework AI Proprietari</h2>
          <p className={styles.sectionDescription}>
            Metodologie verificate basate su <strong>framework AI proprietari</strong> per
            approfondimenti multiformato su contesto macro, intermarket e tecnico.
          </p>
        </div>
        <div className={styles.methodGrid}>
          {methods.map((method) => (
            <div key={method.id} className={styles.methodCard}>
              <div className={styles.methodCardIcon}>
                <span>{method.title}</span>
              </div>
              <h3 className={styles.methodCardTitle}>{method.subtitle}</h3>
              <ul className={styles.methodCardList}>
                {method.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
