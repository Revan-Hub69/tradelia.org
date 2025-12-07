import { redirect } from 'next/navigation';

// Sezione broker temporaneamente rimossa - troppo complessa
export default function BrokersPage() {
  redirect('/dashboard/utilities');
}
