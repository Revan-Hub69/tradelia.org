import { Suspense } from 'react';
import { ReviewFormPage } from '@/components/reviews/ReviewFormPage';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Scrivi una Recensione · Tradelia',
    description: 'Condividi la tua esperienza con Tradelia',
  };
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <ReviewFormPage />
    </Suspense>
  );
}
