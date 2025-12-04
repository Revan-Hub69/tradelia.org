import { Suspense } from 'react';
import { ReviewFormPage } from '@/components/reviews/ReviewFormPage';
import { Loading } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  const dict = await getDictionary('it');
  return {
    title: dict.reviews.writeReview || 'Scrivi una Recensione · Tradelia',
    description: dict.reviews.subtitle || 'Condividi la tua esperienza con Tradelia',
  };
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <ReviewFormPage />
    </Suspense>
  );
}
