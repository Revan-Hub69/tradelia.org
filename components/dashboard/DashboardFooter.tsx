'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './DashboardFooter.module.css';

export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.dashboardFooterModern}>
      {/* Pattern chiaro per footer - WOW effect */}
      <div className={styles.footerPatternOverlay} />
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <Link href="/" className={styles.footerLogoLink}>
            <div className={styles.footerLogoWrapper}>
              <Image
                src="/logos/tradelia-logo.svg"
                alt="Tradelia AI"
                width={200}
                height={50}
                className={styles.footerLogoImg}
              />
              {/* Linea blu 15% anche nel footer - WOW effect */}
              <div className={styles.footerLogoBlueLine} />
            </div>
            <span className={styles.footerLogoFallback}>
              <span className={styles.footerBrandWord}>TRADELIA</span>
              <span className={styles.footerBrandDot} />
              <span className={styles.footerBrandSuffix}>AI</span>
            </span>
          </Link>
          <p className={styles.footerCopyright}>
            &copy; {year} Tradelia AI · Tutti i diritti riservati
          </p>
          <p className={styles.footerDisclaimer}>
            Le informazioni fornite sono a scopo educativo e non costituiscono consulenza finanziaria.
          </p>
        </div>

        <div className={styles.footerRight}>
          <nav className={styles.footerLinksInline} role="navigation" aria-label="Link legali e supporto">
            <FooterLinkButton id="btn-support-open" label="Supporto">
              Supporto
            </FooterLinkButton>
            <span className="footer-separator" aria-hidden="true">
              ·
            </span>
            <FooterLinkButton id="btn-status-open" label="Status">
              Status
            </FooterLinkButton>
            <span className="footer-separator" aria-hidden="true">
              ·
            </span>
            <FooterLinkButton id="btn-mifid-open" label="MiFID">
              MiFID
            </FooterLinkButton>
            <span className="footer-separator" aria-hidden="true">
              ·
            </span>
            <FooterLinkButton id="btn-privacy-open" label="Privacy">
              Privacy
            </FooterLinkButton>
            <span className="footer-separator" aria-hidden="true">
              ·
            </span>
            <FooterLinkButton id="btn-cookie-open" label="Cookie">
              Cookie
            </FooterLinkButton>
            <span className="footer-separator" aria-hidden="true">
              ·
            </span>
            <FooterLinkButton id="btn-terms-open" label="Termini">
              Termini
            </FooterLinkButton>
            <span className={styles.footerSeparator} aria-hidden="true">
              ·
            </span>
            <span className={styles.footerTech} aria-label="Versione e build">
              v2.0.1
              <span className={styles.footerSeparator} aria-hidden="true">
                ·
              </span>
              <span>{new Date().toISOString().split('T')[0]}</span>
            </span>
          </nav>
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
