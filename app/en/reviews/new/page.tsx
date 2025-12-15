import { Suspense } from 'react';
import { ReviewFormPage } from '@/components/reviews/ReviewFormPage';
import { Loading } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Write a Review · Tradelia',
    description: 'Share your experience with Tradelia',
  };
}

export default function NewReviewPageEN() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <ReviewFormPage />
    </Suspense>
  );
}
