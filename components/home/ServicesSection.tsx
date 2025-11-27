'use client';

import Link from 'next/link';
import styles from './ServicesSection.module.css';

export function ServicesSection() {
  const services = [
    {
      icon: '📊',
      title: 'Dashboard PWA',
      description:
        'Dashboard installabile con accesso a report, analisi e percorsi formativi. Funziona offline.',
      badge: 'PWA',
      link: '/dashboard',
    },
    {
      icon: '📚',
      title: 'Percorsi Formativi',
      description:
        'Tutorial gamificati con assessment, quiz e badge. Framework AI proprietari (FDM, MLT, PAC).',
      badge: 'Gratuito',
      link: '/dashboard#education',
    },
    {
      icon: '📄',
      title: 'Report Ufficiali',
      description:
        'Report pubblici conformi MiFID II con analisi dettagliate su mercati, macro e intermarket.',
      badge: 'MiFID-Safe',
      link: '/dashboard#reports',
    },
  ];

  return (
    <section className={styles.servicesSection}>
      <div className={styles.servicesContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Servizi</h2>
          <p className={styles.sectionDescription}>
            Tutto ciò di cui hai bisogno per approfondire i mercati finanziari in modo{' '}
            <strong>trasparente e verificabile</strong>.
          </p>
        </div>
        <div className={styles.servicesGrid}>
          {services.map((service, idx) => (
            <div key={idx} className={styles.serviceCard}>
              <div className={styles.serviceCardHeader}>
                <div className={styles.serviceCardIcon}>{service.icon}</div>
                <h3 className={styles.serviceCardTitle}>{service.title}</h3>
                <p className={styles.serviceCardDescription}>{service.description}</p>
                <span className={styles.serviceCardBadge}>{service.badge}</span>
              </div>
              <Link href={service.link} className={styles.serviceCardLink}>
                Scopri di più →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
