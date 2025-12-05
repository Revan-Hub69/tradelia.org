'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { Bell, X, Check, Settings } from 'lucide-react';
import Link from 'next/link';

interface WidgetNotification {
  id: string;
  widget_type: string;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

interface WidgetNotificationsProps {
  widgetId: string;
  widgetType: string;
}

/**
 * Widget Notifications Component
 * 
 * Best Practice 2025:
 * - Real-time updates
 * - Accessibility compliant
 * - Mobile-optimized
 */
export default function WidgetNotifications({ widgetId, widgetType }: WidgetNotificationsProps) {
  const { t } = useTranslations();
  const [notifications, setNotifications] = useState<WidgetNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [widgetId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}/notifications?unread=false&limit=10`);
      if (!response.ok) return;
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/widgets/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      if (!response.ok) return;
      
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.is_read)
          .map(n => markAsRead(n.id))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-500/10';
      case 'high':
        return 'border-orange-500 bg-orange-500/10';
      case 'normal':
        return 'border-blue-500 bg-blue-500/10';
      case 'low':
        return 'border-gray-500 bg-gray-500/10';
      default:
        return 'border-border-subtle bg-bg-soft';
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-bg-soft transition-colors"
        aria-label={t('widgets.notifications.bellLabel') || 'Notifiche widget'}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center"
            aria-label={`${unreadCount} notifiche non lette`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Panel */}
          <div
            className="absolute right-0 top-12 w-80 max-h-96 bg-bg-surface border border-border-subtle rounded-lg shadow-lg z-50 overflow-hidden"
            role="dialog"
            aria-label={t('widgets.notifications.panelLabel') || 'Pannello notifiche'}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h3 className="font-semibold text-text-primary">
                {t('widgets.notifications.title') || 'Notifiche'}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-accent hover:text-accent-hover"
                    aria-label={t('widgets.notifications.markAllRead') || 'Segna tutte come lette'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <Link
                  href={`/dashboard/widgets/settings?widget=${widgetType}`}
                  className="text-xs text-text-tertiary hover:text-text-primary"
                  aria-label={t('widgets.notifications.settings') || 'Impostazioni notifiche'}
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-tertiary hover:text-text-primary"
                  aria-label={t('widgets.notifications.close') || 'Chiudi'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80" role="list">
              {isLoading ? (
                <div className="p-4 text-center text-text-tertiary">
                  {t('widgets.notifications.loading') || 'Caricamento...'}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-text-tertiary">
                  {t('widgets.notifications.empty') || 'Nessuna notifica'}
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border-subtle last:border-b-0 ${
                      !notification.is_read ? 'bg-accent/5' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    role="listitem"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-text-secondary mb-2">
                          {notification.message}
                        </p>
                        <time
                          dateTime={notification.created_at}
                          className="text-xs text-text-tertiary"
                        >
                          {new Date(notification.created_at).toLocaleString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 rounded hover:bg-bg-soft transition-colors"
                          aria-label={t('widgets.notifications.markRead') || 'Segna come letta'}
                        >
                          <Check className="w-4 h-4 text-text-tertiary" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border-subtle text-center">
                <Link
                  href={`/dashboard/widgets/notifications?widget=${widgetType}`}
                  className="text-xs text-accent hover:text-accent-hover"
                >
                  {t('widgets.notifications.viewAll') || 'Vedi tutte →'}
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
