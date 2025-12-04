import { Suspense } from 'react';
import { ReviewFormPage } from '@/components/reviews/ReviewFormPage';
import { Loading } from '@/components/ui';
import { getDictionary } from '@/lib/i18n/dictionaries';

export async function generateMetadata() {
  const dict = await getDictionary('en');
  return {
    title: dict.reviews.writeReview || 'Write a Review · Tradelia',
    description: dict.reviews.subtitle || 'Share your experience with Tradelia',
  };
}

export default function NewReviewPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <ReviewFormPage />
    </Suspense>
  );
}
