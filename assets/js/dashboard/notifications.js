/**
 * Dashboard Module: Notifications
 * Notifiche sistema, avvisi, comunicazioni
 */

export async function loadNotifications() {
  const notificationsList = document.getElementById('notifications-list');
  if (!notificationsList) return;
  
  // TODO: Caricare notifiche da API/Supabase
  // Per ora mostra empty state
  loadNotificationsData();
}

async function loadNotificationsData() {
  // TODO: Fetch da API
  // const response = await fetch('/api/user/notifications');
  // const notifications = await response.json();
  // renderNotifications(notifications);
}

function renderNotifications(notifications) {
  const notificationsList = document.getElementById('notifications-list');
  if (!notificationsList) return;
  
  if (notifications.length === 0) {
    // Mostra empty state (già presente in HTML)
    return;
  }
  
  // TODO: Render lista notifiche
}

