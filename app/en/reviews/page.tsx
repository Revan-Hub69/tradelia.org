import { Suspense } from 'react';
import { ReviewsContent } from '@/components/reviews/ReviewsContent';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateReviewSchema, generateCollectionPageSchema } from '@/lib/seo/structured-data';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function generateMetadata() {
  return generatePageMetadata('reviews', 'en');
}

export default async function ReviewsPageEN() {
  const dict = await getDictionary('en');
  
  // Carica recensioni per structured data (solo pubbliche verificate)
  let reviewsData: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }> = [];
  let averageRating = 0;
  let reviewCount = 0;

  try {
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('user_name, rating, comment, created_at')
      .eq('verified', true)
      .eq('public', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (reviews && reviews.length > 0) {
      reviewsData = reviews.map((r) => ({
        author: r.user_name,
        rating: r.rating,
        reviewBody: r.comment,
        datePublished: r.created_at,
      }));
      
      averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      reviewCount = reviews.length;
    }
  } catch (error) {
    console.error('Error loading reviews for structured data:', error);
  }

  // Genera structured data
  const schemas = [];
  
  if (reviewCount > 0) {
    schemas.push(generateReviewSchema(reviewsData, averageRating, reviewCount, 'en'));
  }
  
  schemas.push(generateCollectionPageSchema(
    dict.reviews.title || 'What Our Users Say',
    dict.reviews.subtitle || 'Verified reviews from real users',
    reviewCount,
    'en'
  ));

  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData key={index} data={schema} id={`reviews-structured-data-${index}`} />
      ))}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-text-secondary">{dict.common.loading || 'Loading...'}</p></div></div>}>
        <ReviewsContent />
      </Suspense>
    </>
  );
}
