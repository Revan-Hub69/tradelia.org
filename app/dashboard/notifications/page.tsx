import { NotificationSettings } from '@/components/notifications/NotificationSettings';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dash-text mb-2">Impostazioni Notifiche</h1>
        <p className="text-dash-text-muted">
          Configura come ricevere aggiornamenti e comunicazioni importanti
        </p>
      </div>
      <NotificationSettings />
    </div>
  );
}

