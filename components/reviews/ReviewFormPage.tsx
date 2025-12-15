'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n/use-translations';
import { supabase } from '@/lib/supabase/client';
import { ReviewForm } from './ReviewForm';
// buildLocalePath removed - system always uses Italian
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ReviewFormPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);

      if (!user) {
        // Redirect to login if not logged in
        router.push('/login?redirect=/reviews/new');
      }
    }

    checkAuth();
  }, [router]);

  const localePrefix = '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">{t('common.loading') || 'Caricamento...'}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{t('reviews.backToReviews') || 'Torna alle recensioni'}</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            {t('reviews.writeReview') || 'Scrivi una Recensione'}
          </h1>
          <p className="text-text-secondary mb-8 text-lg">
            {t('reviews.writeReviewDesc') || 'Condividi la tua esperienza con Tradelia. La tua recensione sarà pubblicata dopo la verifica.'}
          </p>

          <ReviewForm
            onSuccess={() => {
              setTimeout(() => {
                router.push('/reviews');
              }, 2000);
            }}
          />
        </div>
      </div>
    </div>
  );
}
