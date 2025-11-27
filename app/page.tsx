import { redirect } from 'next/navigation';

export default function HomePage() {
  // Reindirizza alla dashboard o mostra homepage
  // Per ora reindirizziamo alla dashboard
  redirect('/dashboard');
}
