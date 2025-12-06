'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, Target, ArrowRight, BookOpen } from 'lucide-react';
import styles from './dashboard.module.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n/use-translations';
// buildLocalePath removed - system always uses Italian
import { TooltipGlossary } from '@/components/glossary/TooltipGlossary';
import { useState, useEffect } from 'react';
import { getGlossaryTerm } from '@/lib/glossary/terms';
import { useIsClient } from '@/lib/hooks/useIsClient';

export function DashboardHero() {
  const { t, tArray, locale } = useTranslations();
  const isClient = useIsClient();
  const chips = tArray('dashboard.hero.chips', []);
  const [mifidTerm, setMifidTerm] = useState<any>(null);
  const [frameworkTerm, setFrameworkTerm] = useState<any>(null);

  // Carica termini per tooltip SOLO sul client per evitare hydration mismatch
  useEffect(() => {
    if (!isClient) return;
    
    Promise.all([
      getGlossaryTerm('HeroDisclaimer').then(term => {
        if (term) setMifidTerm(term);
      }),
      getGlossaryTerm('Framework').then(term => {
        if (term) setFrameworkTerm(term);
      }),
    ]);
  }, [isClient]);

  return (
    <section className={styles.dashboardHero} aria-labelledby="dashboard-hero-title" role="region">
      <div className={styles.dashboardHeroContent}>
        <Badge variant="default" className={styles.dashboardHeroBadge} role="status" aria-label="Badge">
          <Sparkles className={styles.dashboardHeroBadgeIcon} aria-hidden="true" />
          <span>{t('dashboard.hero.badge')}</span>
        </Badge>
        <p className={styles.dashboardHeroSubtitle} role="text">
          {frameworkTerm ? (
            <TooltipGlossary term={frameworkTerm} icon={true}>
              <span className="text-accent hover:text-accent-hover underline decoration-dotted">
                {t('dashboard.hero.subtitle')}
              </span>
            </TooltipGlossary>
          ) : (
            t('dashboard.hero.subtitle')
          )}
        </p>
        <h1 id="dashboard-hero-title" className={styles.dashboardHeroTitle}>
          {t('dashboard.hero.title')}
        </h1>
        <p className={styles.dashboardHeroDescription}>
          {t('dashboard.hero.description')}
          {mifidTerm && (
            <>
              {' '}
              <TooltipGlossary term={mifidTerm} icon={true}>
                <span className="text-accent hover:text-accent-hover underline decoration-dotted">
                  {t('dashboard.hero.mifidLink') || 'conforme MiFID II'}
                </span>
              </TooltipGlossary>
            </>
          )}
        </p>
        <div className={styles.dashboardHeroActions}>
          <Button asChild size="lg">
            <Link href="/dashboard/education">
              <span>{t('dashboard.hero.ctaPrimary')}</span>
              <ArrowRight className={styles.dashboardHeroActionIcon} aria-hidden="true" />
            </Link>
          </Button>
          <div className={styles.dashboardHeroSupportText}>
            <BookOpen className={styles.dashboardHeroSupportIcon} aria-hidden="true" />
            <span>{t('dashboard.hero.supportingText')}</span>
          </div>
        </div>
        {chips.length > 0 && (
          <ul className={styles.dashboardHeroChips}>
            {chips.map((chip) => {
              // Evidenzia "Framework AI verificabili" e "Compliance MiFID II"
              const isFramework = chip.includes('Framework');
              const isMifid = chip.includes('MiFID');
              
              return (
                <li key={chip} className={styles.dashboardHeroChip}>
                  <Target className={styles.dashboardHeroChipIcon} aria-hidden="true" />
                  {isFramework && frameworkTerm ? (
                    <TooltipGlossary term={frameworkTerm} icon={false}>
                      <span>{chip}</span>
                    </TooltipGlossary>
                  ) : isMifid && mifidTerm ? (
                    <TooltipGlossary term={mifidTerm} icon={false}>
                      <span>{chip}</span>
                    </TooltipGlossary>
                  ) : (
                    <span>{chip}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Card className={styles.dashboardHeroCard}>
        <div className={styles.dashboardHeroCardContent}>
          <ShieldCheck className={styles.dashboardHeroCardIcon} aria-hidden="true" />
          <div>
            <p className={styles.dashboardHeroCardTitle}>
              {t('dashboard.hero.calloutTitle').split('MiFID II')[0]}
              {mifidTerm && (
                <>
                  {' '}
                  <TooltipGlossary term={mifidTerm} icon={true}>
                    <span className="text-accent hover:text-accent-hover underline decoration-dotted">
                      MiFID II
                    </span>
                  </TooltipGlossary>
                </>
              )}
            </p>
            <p className={styles.dashboardHeroCardText}>{t('dashboard.hero.calloutText')}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
