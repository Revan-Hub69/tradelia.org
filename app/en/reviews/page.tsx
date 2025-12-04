import { ReviewsContent } from '@/components/reviews/ReviewsContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('reviews', 'en');
}

export default function ReviewsPageEN() {
  return <ReviewsContent />;
}
