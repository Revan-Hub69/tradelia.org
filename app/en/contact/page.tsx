import { ContactContent } from '@/components/contact/ContactContent';
import { generatePageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata() {
  return generatePageMetadata('contact', 'en');
}

export default function ContactPage() {
  return <ContactContent />;
}
