'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, Target, ArrowRight, BookOpen } from 'lucide-react';
import styles from './dashboard.module.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';

export function DashboardHero() {
  const { t, tArray, locale } = useTranslations();
  const chips = tArray('dashboard.hero.chips', []);

  return (
    <section className={styles.dashboardHero} aria-labelledby="dashboard-hero-title">
      <div className={styles.dashboardHeroContent}>
        <Badge variant="default" className={styles.dashboardHeroBadge}>
          <Sparkles className={styles.dashboardHeroBadgeIcon} aria-hidden="true" />
          <span>{t('dashboard.hero.badge')}</span>
        </Badge>
        <p className={styles.dashboardHeroSubtitle}>{t('dashboard.hero.subtitle')}</p>
        <h1 id="dashboard-hero-title" className={styles.dashboardHeroTitle}>
          {t('dashboard.hero.title')}
        </h1>
        <p className={styles.dashboardHeroDescription}>{t('dashboard.hero.description')}</p>
        <div className={styles.dashboardHeroActions}>
          <Button asChild size="lg">
            <Link href={buildLocalePath(locale, '/dashboard#education')}>
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
            {chips.map((chip) => (
              <li key={chip} className={styles.dashboardHeroChip}>
                <Target className={styles.dashboardHeroChipIcon} aria-hidden="true" />
                <span>{chip}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Card className={styles.dashboardHeroCard}>
        <div className={styles.dashboardHeroCardContent}>
          <ShieldCheck className={styles.dashboardHeroCardIcon} aria-hidden="true" />
          <div>
            <p className={styles.dashboardHeroCardTitle}>{t('dashboard.hero.calloutTitle')}</p>
            <p className={styles.dashboardHeroCardText}>{t('dashboard.hero.calloutText')}</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
