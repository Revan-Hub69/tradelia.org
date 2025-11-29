'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

/**
 * Badge notifiche con indicatore di stato push
 * Da integrare nell'header o nella dashboard
 */
export function NotificationBell() {
  const pathname = usePathname();
  const { subscription, isSupported } = useServiceWorker();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Mostra solo nella dashboard
  const isDashboard = pathname?.includes('/dashboard');

  // Carica conteggio notifiche non lette
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await fetch('/api/notifications/list?limit=1&unreadOnly=true');
        const data = await res.json();
        if (res.ok) {
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Errore caricamento conteggio notifiche:', err);
      }
    };

    loadUnreadCount();
    // Polling ogni 30 secondi
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasActiveSubscription = !!subscription;
  const showBadge = unreadCount > 0;

  if (!isDashboard) {
    return null;
  }

  return (
    <Link
      href="/dashboard/notifications"
      className="relative inline-flex items-center justify-center p-2 rounded-lg hover:bg-dash-surface-elev transition-colors"
      aria-label={`Notifiche${showBadge ? ` (${unreadCount} non lette)` : ''}`}
    >
      {hasActiveSubscription ? (
        <Bell className="w-5 h-5 text-dash-text" />
      ) : (
        <BellOff className="w-5 h-5 text-dash-text-muted" />
      )}
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      {!isSupported && (
        <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-yellow-500" />
      )}
    </Link>
  );
}

