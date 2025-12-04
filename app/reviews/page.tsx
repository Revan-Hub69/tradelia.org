import { ReviewsContent } from '@/components/reviews/ReviewsContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('reviews', 'it');
}

export default function ReviewsPage() {
  return <ReviewsContent />;
}
