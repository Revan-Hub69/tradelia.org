// ============================================
// SISTEMA NOTIFICHE - Livello Accademico
// ============================================
// Gestione notifiche real-time per utenti
// ============================================

import { supabase } from '/report/assets/js/supabase-client.js';
import Logger from '/report/assets/js/utils/logger.js';

let notifications = [];
let unreadCount = 0;
let notificationSubscription = null;

/**
 * Carica notifiche dall'utente
 */
export async function loadNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    notifications = data || [];
    unreadCount = notifications.filter((n) => !n.is_read).length;

    return { notifications, unreadCount };
  } catch (err) {
    Logger.error('Notifications', 'load error', err);
    return { notifications: [], unreadCount: 0 };
  }
}

/**
 * Segna notifica come letta
 */
export async function markNotificationAsRead(notificationId, userId) {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;

    // Update local state
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.is_read = true;
      unreadCount = Math.max(0, unreadCount - 1);
    }

    return true;
  } catch (err) {
    Logger.error('Notifications', 'mark read error', err);
    return false;
  }
}

/**
 * Segna tutte le notifiche come lette
 */
export async function markAllNotificationsAsRead(userId) {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    // Update local state
    notifications.forEach((n) => {
      n.is_read = true;
    });
    unreadCount = 0;

    return true;
  } catch (err) {
    Logger.error('Notifications', 'mark all read error', err);
    return false;
  }
}

/**
 * Sottoscrivi a nuove notifiche (real-time)
 */
export function subscribeToNotifications(userId, callback) {
  if (notificationSubscription) {
    notificationSubscription.unsubscribe();
  }

  notificationSubscription = supabase
    .channel('user_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const newNotification = payload.new;
        notifications.unshift(newNotification);
        unreadCount++;
        if (callback) callback(newNotification);
      }
    )
    .subscribe();

  return notificationSubscription;
}

/**
 * Disconnetti sottoscrizione
 */
export function unsubscribeFromNotifications() {
  if (notificationSubscription) {
    notificationSubscription.unsubscribe();
    notificationSubscription = null;
  }
}

/**
 * Renderizza notifiche nell'UI
 */
export function renderNotifications(container, userId) {
  if (!container) return;

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  container.innerHTML = `
    <div class="notifications-header">
      <h4>Notifiche ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ''}</h4>
      ${unreadCount > 0 ? `<button class="btn btn-sm btn-outline" id="mark-all-read-btn">Segna tutte come lette</button>` : ''}
    </div>
    <div class="notifications-list">
      ${
        unreadNotifications.length > 0
          ? `
        <div class="notifications-section">
          <h5>Non lette</h5>
          ${unreadNotifications.map((n) => renderNotificationItem(n, userId)).join('')}
        </div>
      `
          : ''
      }
      ${
        readNotifications.length > 0
          ? `
        <div class="notifications-section">
          <h5>Lette</h5>
          ${readNotifications.map((n) => renderNotificationItem(n, userId)).join('')}
        </div>
      `
          : ''
      }
      ${notifications.length === 0 ? '<p style="color: var(--ink-soft); text-align: center; padding: 2rem;">Nessuna notifica.</p>' : ''}
    </div>
  `;

  // Setup event listeners
  container.querySelectorAll('.notification-item').forEach((item) => {
    const notificationId = item.dataset.notificationId;
    item.addEventListener('click', () => {
      markNotificationAsRead(notificationId, userId);
      if (item.dataset.link) {
        window.location.href = item.dataset.link;
      }
    });
  });

  const markAllReadBtn = container.querySelector('#mark-all-read-btn');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', () => {
      markAllNotificationsAsRead(userId);
      renderNotifications(container, userId);
    });
  }
}

function renderNotificationItem(notification, userId) {
  const isUnread = !notification.is_read;
  const linkAttr = notification.link ? `data-link="${notification.link}"` : '';

  return `
    <div class="notification-item ${isUnread ? 'unread' : ''}" data-notification-id="${notification.id}" ${linkAttr}>
      <div class="notification-content">
        <strong>${escapeHtml(notification.title)}</strong>
        <p>${escapeHtml(notification.message)}</p>
        <span class="notification-time">${formatDateTime(notification.created_at)}</span>
      </div>
      ${isUnread ? '<span class="notification-dot"></span>' : ''}
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Adesso';
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays < 7) return `${diffDays} giorni fa`;

  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

// Export per uso globale
export { notifications, unreadCount };
