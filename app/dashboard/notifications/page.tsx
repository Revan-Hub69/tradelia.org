import { NotificationSettings } from '@/components/notifications/NotificationSettings';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dash-text mb-2">Notifiche</h1>
        <p className="text-dash-text-muted">
          Gestisci le tue notifiche e preferenze di comunicazione
        </p>
      </div>

      {/* Centro Notifiche */}
      <section>
        <h2 className="text-xl font-semibold text-dash-text mb-4">Notifiche Recenti</h2>
        <NotificationCenter />
      </section>

      {/* Impostazioni */}
      <section>
        <h2 className="text-xl font-semibold text-dash-text mb-4">Impostazioni</h2>
        <NotificationSettings />
      </section>
      </div>
    </div>
  );
}

