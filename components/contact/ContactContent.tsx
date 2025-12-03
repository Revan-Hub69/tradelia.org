'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/ui/ShareButtons';

export function ContactContent() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // TODO: Implementare invio email via API
    try {
      // Simulazione invio
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('contact.title') || 'Contatti'}
          </h1>
          <p className="text-text-secondary mb-8 text-lg">
            {t('contact.subtitle') || 'Compila il form qui sotto o scrivici direttamente a support@tradelia.org'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('contact.email.title') || 'Email Diretta'}
              </h2>
              <a
                href="mailto:support@tradelia.org"
                className="flex items-center gap-3 text-accent hover:text-accent-hover transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>support@tradelia.org</span>
              </a>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                {t('contact.response.title') || 'Tempi di Risposta'}
              </h2>
              <p className="text-text-secondary">
                {t('contact.response.content') || 'Rispondiamo entro 24-48 ore. Per utenti Pro, risposta prioritaria entro 12-24 ore.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-bg-surface rounded-lg border border-border-subtle p-8">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
                  {t('contact.form.name') || 'Nome'}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  {t('contact.form.email') || 'Email'}
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-2">
                  {t('contact.form.subject') || 'Oggetto'}
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">
                  {t('contact.form.message') || 'Messaggio'}
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                  {t('contact.form.success') || 'Messaggio inviato con successo! Ti risponderemo presto.'}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                  {t('contact.form.error') || 'Errore durante l\'invio. Riprova o scrivici direttamente a support@tradelia.org'}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  t('contact.form.sending') || 'Invio in corso...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t('contact.form.send') || 'Invia Messaggio'}
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 flex justify-center">
            <ShareButtons 
              variant="compact"
              title={t('contact.title')}
              description={t('contact.subtitle')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
