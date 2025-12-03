import { Suspense } from 'react';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { Loading } from '@/components/ui';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('checkout', 'it');
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loading /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

