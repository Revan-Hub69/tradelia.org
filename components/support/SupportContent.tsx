'use client';

import { useTranslations } from '@/lib/i18n/use-translations';
import Link from 'next/link';
import { Mail, MessageCircle, BookOpen, HelpCircle } from 'lucide-react';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { InternalLinks } from '@/components/seo/InternalLinks';

export function SupportContent() {
  const { t } = useTranslations();

  const supportOptions = [
    {
      icon: HelpCircle,
      title: t('support.options.faq.title') || 'FAQ',
      description: t('support.options.faq.description') || 'Consulta le domande frequenti per risposte rapide.',
      href: '/faq',
    },
    {
      icon: Mail,
      title: t('support.options.email.title') || 'Email',
      description: t('support.options.email.description') || 'Scrivici a support@tradelia.org per assistenza diretta.',
      href: 'mailto:support@tradelia.org',
    },
    {
      icon: MessageCircle,
      title: t('support.options.contact.title') || 'Contatti',
      description: t('support.options.contact.description') || 'Compila il form di contatto per richieste specifiche.',
      href: '/contact',
    },
    {
      icon: BookOpen,
      title: t('support.options.documentation.title') || 'Documentazione',
      description: t('support.options.documentation.description') || 'Esplora la documentazione completa della piattaforma.',
      href: '/dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('support.title') || 'Supporto'}
          </h1>
          <p className="text-text-secondary mb-12 text-lg">
            {t('support.subtitle') || 'Siamo qui per aiutarti. Scegli il metodo di contatto più adatto alle tue esigenze.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <Link
                  key={index}
                  href={option.href}
                  className="p-6 bg-bg-surface rounded-lg border border-border-subtle hover:border-accent hover:shadow-md transition-all group"
                >
                  <Icon className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-text-primary mb-2">
                    {option.title}
                  </h3>
                  <p className="text-text-secondary">
                    {option.description}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="bg-bg-surface rounded-lg border border-border-subtle p-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              {t('support.responseTime.title') || 'Tempi di Risposta'}
            </h2>
            <ul className="space-y-3 text-text-secondary mb-6">
              <li>
                <strong className="text-text-primary">Email:</strong>{' '}
                {t('support.responseTime.email') || 'Rispondiamo entro 24-48 ore'}
              </li>
              <li>
                <strong className="text-text-primary">Supporto Pro:</strong>{' '}
                {t('support.responseTime.pro') || 'Risposta prioritaria entro 12-24 ore'}
              </li>
              <li>
                <strong className="text-text-primary">Urgenze:</strong>{' '}
                {t('support.responseTime.urgent') || 'Per problemi urgenti, contattaci direttamente via email'}
              </li>
            </ul>
            <ShareButtons 
              variant="compact"
              title={t('support.title')}
              description={t('support.subtitle')}
            />
          </div>
          
          {/* Internal Links per SEO */}
          <InternalLinks />
        </div>
      </div>
    </div>
  );
}
