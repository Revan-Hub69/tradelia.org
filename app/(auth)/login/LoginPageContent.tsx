'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import { useTranslations } from '@/lib/i18n/use-translations';

export function LoginPageContent() {
  const { t } = useTranslations();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 bg-bg-surface/80 border border-border-subtle rounded-[32px] shadow-[0_35px_120px_rgba(8,10,18,0.65)] overflow-hidden">
      <div className="p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-bg-base via-bg-soft to-bg-base">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.45em] text-text-tertiary">
            {t('auth.page.badge')}
          </p>
          <h2 className="text-4xl font-semibold text-white tracking-tight">
            {t('auth.page.title')}
          </h2>
          <p className="text-base text-text-secondary/90 leading-relaxed max-w-xl">
            {t('auth.page.description')}
          </p>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 mt-10">
          <div className="rounded-2xl border border-border-subtle/60 bg-bg-base/60 p-4">
            <dt className="text-xs uppercase tracking-[0.4em] text-text-tertiary mb-2">
              {t('auth.page.methodTitle')}
            </dt>
            <dd className="text-text-primary text-lg font-semibold">
              {t('auth.page.methodDescription')}
            </dd>
          </div>
          <div className="rounded-2xl border border-border-subtle/60 bg-bg-base/60 p-4">
            <dt className="text-xs uppercase tracking-[0.4em] text-text-tertiary mb-2">
              {t('auth.page.accessTitle')}
            </dt>
            <dd className="text-text-primary text-lg font-semibold">
              {t('auth.page.accessDescription')}
            </dd>
          </div>
        </dl>
      </div>
      <div className="p-6 lg:p-10">
        <AuthForm />
      </div>
    </div>
  );
}

