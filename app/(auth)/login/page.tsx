import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Login · Tradelia Dashboard',
  description: 'Accedi alla console istituzionale Tradelia per gestire report, richieste e formazione.',
};

// Forza rendering dinamico per evitare errori durante build statico
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 bg-bg-surface/80 border border-border-subtle rounded-[32px] shadow-[0_35px_120px_rgba(8,10,18,0.65)] overflow-hidden">
      <div className="p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-bg-base via-bg-soft to-bg-base">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.45em] text-text-tertiary">Secure Area</p>
          <h2 className="text-4xl font-semibold text-white tracking-tight">
            Accesso protetto
          </h2>
          <p className="text-base text-text-secondary/90 leading-relaxed max-w-xl">
            La dashboard istituzionale Tradelia integra controlli accademici, audit log e connessione diretta
            con Supabase per consentire la gestione completa di report, richieste di analisi, percorsi educativi
            e notifiche regolamentate MiFID II.
          </p>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 mt-10">
          <div className="rounded-2xl border border-border-subtle/60 bg-bg-base/60 p-4">
            <dt className="text-xs uppercase tracking-[0.4em] text-text-tertiary mb-2">Audit continuo</dt>
            <dd className="text-text-primary text-lg font-semibold">Log amministrativi e verifiche RLS automatiche</dd>
          </div>
          <div className="rounded-2xl border border-border-subtle/60 bg-bg-base/60 p-4">
            <dt className="text-xs uppercase tracking-[0.4em] text-text-tertiary mb-2">PWA + Push</dt>
            <dd className="text-text-primary text-lg font-semibold">Installabile, notifiche cifrate e caching avanzato</dd>
          </div>
        </dl>
      </div>
      <div className="p-6 lg:p-10">
        <AuthForm />
      </div>
    </div>
  );
}
