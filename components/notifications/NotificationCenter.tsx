'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'analysis_completed' | 'plan_expiring' | 'credits_low' | 'system';
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  onClose?: () => void;
}

/**
 * Centro notifiche con feed e gestione lettura
 */
export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const loadNotifications = useCallback(async (offset = 0) => {
    try {
      setError(null);
      const res = await fetch(`/api/notifications/list?limit=20&offset=${offset}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore caricamento notifiche');
      }

      if (offset === 0) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications((prev) => [...prev, ...(data.notifications || [])]);
      }

      setUnreadCount(data.unreadCount || 0);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('Errore caricamento notifiche:', err);
      setError(err instanceof Error ? err.message : 'Errore caricamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Polling ogni 30 secondi per nuove notifiche
    const interval = setInterval(() => {
      loadNotifications(0);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (!res.ok) {
        throw new Error('Errore aggiornamento notifiche');
      }

      // Aggiorna stato locale
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      console.error('Errore marcatura letta:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });

      if (!res.ok) {
        throw new Error('Errore aggiornamento notifiche');
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Errore marcatura tutte lette:', err);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
      case 'analysis_completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
      case 'plan_expiring':
      case 'credits_low':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
      case 'analysis_completed':
        return 'border-green-500/20 bg-green-500/5';
      case 'warning':
      case 'plan_expiring':
      case 'credits_low':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-dash-surface rounded-lg border border-dash-border shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dash-border">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-dash-text" />
          <h2 className="text-lg font-semibold text-dash-text">Notifiche</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-dash-accent rounded-full text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 text-sm text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-elev rounded transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-elev rounded transition-colors"
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-dash-surface-elev rounded w-3/4 mx-auto" />
              <div className="h-4 bg-dash-surface-elev rounded w-1/2 mx-auto" />
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-dash-text-muted">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nessuna notifica</p>
          </div>
        ) : (
          <div className="divide-y divide-dash-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-dash-surface-elev transition-colors ${
                  !notification.is_read ? getNotificationColor(notification.type) : ''
                } ${!notification.is_read ? 'border-l-4' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-dash-text mb-1">{notification.title}</h3>
                        <p className="text-sm text-dash-text-muted mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3 text-xs text-dash-text-muted">
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: it,
                            })}
                          </span>
                          {!notification.is_read && (
                            <span className="px-1.5 py-0.5 bg-dash-accent/20 text-dash-accent rounded">
                              Nuova
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead([notification.id])}
                            className="p-1.5 text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-elev rounded transition-colors"
                            aria-label="Segna come letta"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        onClick={() => markAsRead([notification.id])}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-dash-accent hover:text-dash-accent-hover transition-colors"
                      >
                        Vai al dettaglio →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="p-4 text-center border-t border-dash-border">
            <button
              onClick={() => loadNotifications(notifications.length)}
              className="px-4 py-2 text-sm text-dash-accent hover:text-dash-accent-hover hover:bg-dash-surface-elev rounded transition-colors"
            >
              Carica altre notifiche
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

