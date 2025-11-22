/**
 * Dashboard Module: Notifications
 * FASE 5: Contenuti e Funzionalità
 * Notifiche sistema, avvisi, comunicazioni con integrazione Supabase
 */

import { initSupabase } from "./supabase-client.js";
// showToast usato tramite window.showToast

export async function loadNotifications() {
  const notificationsList = document.getElementById("notifications-list");
  if (!notificationsList) {
    return;
  }

  await loadNotificationsData();
  setupNotificationsFilters();
  setupNotificationActions();
}

async function loadNotificationsData() {
  const notificationsList = document.getElementById("notifications-list");
  if (!notificationsList) {
    return;
  }

  // Mostra loading
  notificationsList.innerHTML = `
    <div class="reports-loading">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span>Caricamento notifiche...</span>
    </div>
  `;

  try {
    // Prova Supabase
    const supabase = await initSupabase();
    if (supabase) {
      const token = localStorage.getItem("tradelia-access-token-v1");
      if (token) {
        // Query notifiche
        // Prima prova con user_id (se autenticato)
        let query = supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        // Se abbiamo user_id dal token, usa quello, altrimenti usa user_token
        try {
          const tokenData = JSON.parse(atob(token.split(".")[1])); // Decodifica JWT se possibile
          if (tokenData?.user_id) {
            query = query.eq("user_id", tokenData.user_id);
          } else {
            query = query.eq("user_token", token);
          }
        } catch {
          // Fallback: usa user_token
          query = query.eq("user_token", token);
        }

        const { data, error } = await query;

        if (error) {
          // BEST PRACTICE: Gestione errori 401 (Unauthorized) - fallback silenzioso
          if (error.code === "PGRST301" || error.status === 401 || error.message?.includes("401")) {
            // Errore di autorizzazione - fallback silenzioso
            // BEST PRACTICE: Fallback silenzioso per 401 - non loggare come errore
            // console.debug("[Notifications] Accesso non autorizzato (401) - fallback silenzioso");
            return [];
          }
          throw error;
        }

        renderNotifications(data || []);
        return;
      }
    }

    // Fallback: API endpoint
    const response = await fetch("/api/user?action=notifications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("tradelia-access-token-v1") || ""}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      renderNotifications(data.notifications || []);
    } else {
      throw new Error("Errore caricamento notifiche");
    }
  } catch (err) {
    console.error("[Notifications] Errore:", err);
    // Mostra empty state (già presente in HTML)
    notificationsList.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <div class="reports-empty-title">Nessuna notifica</div>
        <div class="reports-empty-text">Non ci sono notifiche al momento.</div>
      </div>
    `;
  }
}

function renderNotifications(notifications) {
  const notificationsList = document.getElementById("notifications-list");
  if (!notificationsList) {
    return;
  }

  if (notifications.length === 0) {
    notificationsList.innerHTML = `
      <div class="reports-empty">
        <svg class="reports-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <div class="reports-empty-title">Nessuna notifica</div>
        <div class="reports-empty-text">Non ci sono notifiche al momento.</div>
      </div>
    `;
    return;
  }

  notificationsList.innerHTML = notifications
    .map((notification) => {
      const type = notification.type || "info";
      const date = notification.created_at
        ? new Date(notification.created_at).toLocaleDateString("it-IT", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Data non disponibile";

      const icons = {
        success:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        warning:
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      };

      return `
      <div class="report-card" data-notification-id="${notification.id || ""}">
        <div class="report-card-header">
          <div class="report-card-main">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <div style="color: var(--${type}); width: 20px; height: 20px;">
                ${icons[type] || icons.info}
              </div>
              <h3 class="report-ticker" style="margin: 0;">${notification.title || "Notifica"}</h3>
            </div>
            <p class="report-company">${notification.message || notification.body || ""}</p>
            <div class="report-meta">
              <div class="report-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                ${date}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  // Add mark as read functionality
  document.querySelectorAll("[data-notification-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const notificationId = card.dataset.notificationId;
      if (notificationId) {
        markAsRead(notificationId);
      }
    });
  });
}

/**
 * Setup notifications filters
 */
function setupNotificationsFilters() {
  const toolbar = document
    .querySelector(".panel-content #notifications-list")
    ?.closest(".panel-content");
  if (!toolbar || document.getElementById("notifications-filters")) {
    return;
  }

  const filtersContainer = document.createElement("div");
  filtersContainer.id = "notifications-filters";
  filtersContainer.className = "notifications-filters";
  filtersContainer.innerHTML = `
    <div class="notifications-filter-group">
      <label class="notifications-filter-label">Tipo</label>
      <select id="notifications-filter-type" class="notifications-filter-select">
        <option value="">Tutti</option>
        <option value="success">Successo</option>
        <option value="error">Errore</option>
        <option value="info">Info</option>
        <option value="warning">Avviso</option>
      </select>
    </div>
    <div class="notifications-filter-group">
      <label class="notifications-filter-label">Data</label>
      <select id="notifications-filter-date" class="notifications-filter-select">
        <option value="all">Tutte</option>
        <option value="today">Oggi</option>
        <option value="week">Ultima settimana</option>
        <option value="month">Ultimo mese</option>
      </select>
    </div>
    <button class="btn btn-secondary" id="notifications-mark-all-read">Segna tutte come lette</button>
  `;

  const panelContent = document.querySelector("#panel-notifications .panel-content");
  if (panelContent) {
    panelContent.insertBefore(filtersContainer, panelContent.firstChild);
  }

  // Filter listeners
  document.getElementById("notifications-filter-type")?.addEventListener("change", () => {
    applyNotificationsFilters();
  });
  document.getElementById("notifications-filter-date")?.addEventListener("change", () => {
    applyNotificationsFilters();
  });
  document.getElementById("notifications-mark-all-read")?.addEventListener("click", () => {
    markAllAsRead();
  });
}

/**
 * Apply notifications filters
 */
function applyNotificationsFilters() {
  // BEST PRACTICE: Filtri da implementare in futuro
  // const typeFilter = document.getElementById('notifications-filter-type')?.value || '';
  // const dateFilter = document.getElementById('notifications-filter-date')?.value || 'all';

  // Reload notifications with filters
  loadNotificationsData();
}

/**
 * Setup notification actions
 */
function setupNotificationActions() {
  // Actions already handled in renderNotifications
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  try {
    const supabase = await initSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      // BEST PRACTICE: Gestione errori 401 (Unauthorized) - fallback silenzioso
      if (error) {
        if (error.code === "PGRST301" || error.status === 401 || error.message?.includes("401")) {
          // BEST PRACTICE: Fallback silenzioso per 401 - non loggare come errore
          return;
        }
        throw error;
      }
    }
  } catch (e) {
    // BEST PRACTICE: Non loggare errori 401 come errori critici
    if (e.status !== 401 && e.code !== "PGRST301") {
      console.error("[Notifications] Errore marcatura letta:", e);
    }
  }
}

/**
 * Mark all as read
 */
async function markAllAsRead() {
  try {
    const supabase = await initSupabase();
    if (supabase) {
      const token = localStorage.getItem("tradelia-access-token-v1");
      if (token) {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("user_token", token)
          .eq("is_read", false);

        if (error) {
          // BEST PRACTICE: Gestione errori 401 (Unauthorized) - fallback silenzioso
          if (error.code === "PGRST301" || error.status === 401 || error.message?.includes("401")) {
            // BEST PRACTICE: Fallback silenzioso per 401 - non loggare come errore
            return;
          }
          console.warn("[Notifications] Errore marcatura tutte:", error);
          return;
        }

        loadNotificationsData();
        if (window.showToast) {
          window.showToast("Tutte le notifiche segnate come lette", "success");
        }
      }
    }
  } catch (e) {
    console.error("[Notifications] Errore marcatura tutte lette:", e);
  }
}
