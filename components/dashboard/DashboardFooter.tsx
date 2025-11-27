'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardFooter.module.css';

export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.dashboardFooter}>
      {/* Pattern geometrico raffinato */}
      <div className="geometric-pattern" />
      
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <Link href="/" className={styles.footerLogoLink}>
            <Image
              src="/logos/tradelia-logo.svg"
              alt="Tradelia AI"
              width={200}
              height={50}
              className={styles.footerLogoImg}
            />
            <span className={styles.footerLogoFallback}>
              <span className={styles.footerBrandWord}>TRADELIA</span>
              <span className={styles.footerBrandDot} />
              <span className={styles.footerBrandSuffix}>AI</span>
            </span>
          </Link>
          <p className={styles.footerCopyright}>
            &copy; {year} Tradelia AI · Tutti i diritti riservati
          </p>
          <p className={styles.footerDescription}>
            Formazione finanziaria gratuita basata su framework AI proprietari verificabili.
            Materiale conforme agli standard accademici internazionali e alle normative MiFID II.
          </p>
          <p className={styles.footerDisclaimer}>
            Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
          </p>
        </div>

        <div className={styles.footerRight}>
          <nav className={styles.footerNav} role="navigation" aria-label="Link legali e supporto">
            <div className={styles.footerNavSection}>
              <h3 className={styles.footerNavTitle}>Supporto</h3>
              <FooterLinkButton id="btn-support-open" label="Supporto">
                Supporto
              </FooterLinkButton>
              <FooterLinkButton id="btn-status-open" label="Status">
                Status
              </FooterLinkButton>
            </div>
            <div className={styles.footerNavSection}>
              <h3 className={styles.footerNavTitle}>Legale</h3>
              <FooterLinkButton id="btn-mifid-open" label="MiFID">
                MiFID
              </FooterLinkButton>
              <FooterLinkButton id="btn-privacy-open" label="Privacy">
                Privacy
              </FooterLinkButton>
              <FooterLinkButton id="btn-cookie-open" label="Cookie">
                Cookie
              </FooterLinkButton>
              <FooterLinkButton id="btn-terms-open" label="Termini">
                Termini
              </FooterLinkButton>
            </div>
          </nav>
          <div className={styles.footerTech}>
            <span>v2.0.1</span>
            <span className={styles.footerSeparator}>·</span>
            <span>{new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkButton({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={styles.footerLink}
      id={id}
      aria-label={`Apri ${label}`}
    >
      {children}
    </button>
  );
}
