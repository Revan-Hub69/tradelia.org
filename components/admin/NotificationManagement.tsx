'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, Mail, Smartphone, Send, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'push' | 'email' | 'sms' | 'whatsapp';
  target: 'all' | 'pro' | 'trial' | 'custom';
  scheduled: boolean;
  scheduledAt?: string;
  autoOnReport: boolean;
  createdAt: string;
}

export function NotificationManagement() {
  const { t } = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'push' as Notification['type'],
    target: 'all' as Notification['target'],
    scheduled: false,
    scheduledAt: '',
    autoOnReport: false,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/list?limit=100');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newNotification.title || !newNotification.message) return;

    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotification),
      });

      if (response.ok) {
        await fetchNotifications();
        setIsCreating(false);
        setNewNotification({
          title: '',
          message: '',
          type: 'push',
          target: 'all',
          scheduled: false,
          scheduledAt: '',
          autoOnReport: false,
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.notifications.confirmDelete') || 'Eliminare questa notifica?')) return;

    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'push':
        return <Smartphone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
      case 'whatsapp':
        return <Send className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <Bell className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {t('admin.notifications.title') || 'Gestione Notifiche'}
            </h2>
            <p className="text-sm text-text-tertiary">
              {t('admin.notifications.subtitle') || 'Crea e gestisci notifiche per gli utenti'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('admin.notifications.create') || 'Crea Notifica'}
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-soft border border-border-subtle rounded-xl p-6 space-y-4"
          >
            <h3 className="font-semibold text-text-primary">
              {t('admin.notifications.newNotification') || 'Nuova Notifica'}
            </h3>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('admin.notifications.title') || 'Titolo'}
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                placeholder={t('admin.notifications.titlePlaceholder') || 'Es: Nuovo report disponibile'}
              />
            </div>

            <div>
              <label className="text-xs text-text-tertiary mb-1 block">
                {t('admin.notifications.message') || 'Messaggio'}
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent min-h-[100px]"
                placeholder={t('admin.notifications.messagePlaceholder') || 'Contenuto della notifica...'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">
                  {t('admin.notifications.type') || 'Tipo'}
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as Notification['type'] })}
                  className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="push">{t('admin.notifications.typePush') || 'Push'}</option>
                  <option value="email">{t('admin.notifications.typeEmail') || 'Email'}</option>
                  <option value="sms">{t('admin.notifications.typeSMS') || 'SMS'}</option>
                  <option value="whatsapp">{t('admin.notifications.typeWhatsApp') || 'WhatsApp'}</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-text-tertiary mb-1 block">
                  {t('admin.notifications.target') || 'Destinatari'}
                </label>
                <select
                  value={newNotification.target}
                  onChange={(e) => setNewNotification({ ...newNotification, target: e.target.value as Notification['target'] })}
                  className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="all">{t('admin.notifications.targetAll') || 'Tutti'}</option>
                  <option value="pro">{t('admin.notifications.targetPro') || 'Solo Pro'}</option>
                  <option value="trial">{t('admin.notifications.targetTrial') || 'Solo Trial'}</option>
                  <option value="custom">{t('admin.notifications.targetCustom') || 'Personalizzato'}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNotification.autoOnReport}
                  onChange={(e) => setNewNotification({ ...newNotification, autoOnReport: e.target.checked })}
                  className="w-4 h-4 rounded border-border-subtle text-accent focus:ring-accent"
                />
                <span className="text-sm text-text-secondary">
                  {t('admin.notifications.autoOnReport') || 'Invia automaticamente ad ogni nuovo report'}
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 rounded-lg bg-accent hover:bg-accent-hover text-white py-2 px-4 font-medium transition-colors disabled:opacity-50"
              >
                {t('admin.notifications.create') || 'Crea'}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewNotification({
                    title: '',
                    message: '',
                    type: 'push',
                    target: 'all',
                    scheduled: false,
                    scheduledAt: '',
                    autoOnReport: false,
                  });
                }}
                className="px-4 py-2 rounded-lg bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('admin.notifications.cancel') || 'Annulla'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('admin.notifications.empty') || 'Nessuna notifica creata'}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-bg-soft border border-border-subtle rounded-xl p-4 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(notification.type)}
                    <h3 className="font-semibold text-text-primary">{notification.title}</h3>
                    {notification.autoOnReport && (
                      <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 rounded text-xs text-green-400">
                        {t('admin.notifications.auto') || 'Auto'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span>{t('admin.notifications.type')}: {notification.type}</span>
                    <span>{t('admin.notifications.target')}: {notification.target}</span>
                    <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

