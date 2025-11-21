/* eslint-env browser */
/**
 * Dashboard Account Status Banner
 * Mostra stato account, saldo, toggle PWA e notifiche
 */

import { getUserRole, logout, getPlanData } from "./auth.js";
import {
  initPWANotifications,
  installPWA,
  isPWAInstalled,
  isPWAInstallable,
  requestPushPermission,
  disablePushNotifications,
  areNotificationsEnabled,
  getNotificationPermission,
} from "./pwa-notifications.js";

let currentRole = null;
let currentPlanData = null;

/**
 * Inizializza e renderizza il banner account
 */
export async function initAccountBanner() {
  const bannerContainer = document.getElementById("account-banner-slot");
  if (!bannerContainer) {
    console.warn("[Account Banner] Container non trovato");
    return;
  }

  // Inizializza PWA e notifiche
  await initPWANotifications();

  currentRole = await getUserRole();
  currentPlanData = await getPlanData();
  await renderBanner(bannerContainer, currentRole, currentPlanData);
  bindBannerEvents(bannerContainer, currentRole);
}

/**
 * Renderizza il banner in base al ruolo e plan data
 */
async function renderBanner(container, role, planData) {
  // Verifica stato reale PWA e notifiche
  const pwaInstalled = isPWAInstalled();
  const notificationsEnabled = await areNotificationsEnabled();
  const notificationPermission = getNotificationPermission();

  if (role.role === "guest") {
    container.innerHTML = `
      <div class="account-banner account-banner-guest">
        <div class="account-banner-content">
          <div class="account-banner-icon">👤</div>
          <div class="account-banner-info">
            <div class="account-banner-title">Accesso Libero</div>
            <div class="account-banner-subtitle">Accedi per sbloccare PDF e analisi</div>
          </div>
          <div class="account-banner-actions">
            <label class="toggle-switch" title="Notifiche Push">
              <input type="checkbox" id="toggle-notifications" ${notificationsEnabled ? "checked" : ""} ${notificationPermission === "denied" ? "disabled" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Notifiche Push</span>
            </label>
            <label class="toggle-switch" title="Installa PWA">
              <input type="checkbox" id="toggle-pwa" ${pwaInstalled ? "checked" : ""} ${!isPWAInstallable() && !pwaInstalled ? "disabled" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">PWA</span>
            </label>
            <a href="/accesso.html?reason=login_required&modal=account" class="btn btn-elegant btn-sm">Accedi</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  const plan = planData?.plan || {};
  const usage = planData?.usage || {};
  const email = role.user?.email || "Utente";

  if (role.role === "pro" || plan.type === "pro") {
    // Pro: 19€/mese, 1 analisi inclusa, max 3 extra a 29€
    const proIncludedRemaining = usage.proIncludedRemaining || 0;
    const proExtraRemaining = usage.proExtraRemaining || 0;
    const paymentDueDate = plan.xoloPaymentDueDate;

    let statusBadge = "";
    if (plan.status === "pending_manual" || plan.status === "pending_payment") {
      const dueDate = paymentDueDate ? new Date(paymentDueDate) : null;
      const daysLeft = dueDate
        ? Math.max(0, Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;
      statusBadge = `<span class="account-banner-badge badge-pending">Pagamento in attesa (${daysLeft} giorni)</span>`;
    }

    container.innerHTML = `
      <div class="account-banner account-banner-authenticated">
        <div class="account-banner-content">
          <div class="account-banner-icon">👤</div>
          <div class="account-banner-info">
            <div class="account-banner-title">
              ${escapeHtml(email)} • Pro
              ${statusBadge}
            </div>
            <div class="account-banner-subtitle">
              Analisi inclusa: <strong>${proIncludedRemaining}/1</strong> • 
              Analisi extra: <strong>${proExtraRemaining}/3</strong> a 29€ • 
              PDF: <strong>10€</strong>
            </div>
          </div>
          <div class="account-banner-actions">
            <label class="toggle-switch" title="Notifiche Push">
              <input type="checkbox" id="toggle-notifications" ${notificationsEnabled ? "checked" : ""} ${notificationPermission === "denied" ? "disabled" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Notifiche Push</span>
            </label>
            <label class="toggle-switch" title="Installa PWA">
              <input type="checkbox" id="toggle-pwa" ${pwaInstalled ? "checked" : ""} ${!isPWAInstallable() && !pwaInstalled ? "disabled" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">PWA</span>
            </label>
            ${
              plan.status === "pending_manual" || plan.status === "pending_payment"
                ? `<a href="/accesso.html?reason=payment_required&modal=payment" class="btn btn-elegant btn-sm">Gestisci Pagamento</a>`
                : `<a href="/accesso.html?modal=account&action=upgrade-desk" class="btn btn-elegant btn-sm">Attiva Desk</a>`
            }
            <button class="btn btn-secondary btn-sm" id="btn-logout">Esci</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (role.role === "desk" || plan.type === "desk") {
    const desk = plan.desk || {};
    const expiresAt = plan.expiresAt ? new Date(plan.expiresAt) : null;
    const daysLeft = expiresAt
      ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)))
      : 0;
    const analysesRemaining = desk.analysesRemaining || usage.deskIncludedRemaining || 0;
    const credits = plan.credits || 0;

    const expiresText = expiresAt
      ? `Scade: ${expiresAt.toLocaleDateString("it-IT")} (${daysLeft} giorni)`
      : "Scade: —";

    container.innerHTML = `
      <div class="account-banner account-banner-desk">
        <div class="account-banner-content">
          <div class="account-banner-icon">💼</div>
          <div class="account-banner-info">
            <div class="account-banner-title">${escapeHtml(email)} • Desk Attivo</div>
            <div class="account-banner-subtitle">
              ${expiresText} • Analisi incluse: <strong>${analysesRemaining}/2</strong>
              ${credits > 0 ? ` • Saldo: <strong>${credits.toFixed(2)}€</strong>` : ""}
            </div>
          </div>
          <div class="account-banner-actions">
            <label class="toggle-switch" title="Notifiche Push">
              <input type="checkbox" id="toggle-notifications" ${notificationsEnabled ? "checked" : ""} ${notificationPermission === "denied" ? "disabled" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Notifiche Push</span>
            </label>
            <label class="toggle-switch" title="Installa PWA">
              <input type="checkbox" id="toggle-pwa" ${pwaInstalled ? "checked" : ""} ${!isPWAInstallable() && !pwaInstalled ? "disabled" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">PWA</span>
            </label>
            <button class="btn btn-secondary btn-sm" id="btn-logout">Esci</button>
          </div>
        </div>
      </div>
    `;
    return;
  }
}

/**
 * Bind event listeners al banner
 */
function bindBannerEvents(container, role) {
  // Logout button
  const logoutBtn = container.querySelector("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (confirm("Sei sicuro di voler uscire?")) {
        await logout();
      }
    });
  }

  // Toggle notifiche (tutti gli utenti - abilitato per tutti)
  const notificationsToggle = container.querySelector("#toggle-notifications");
  if (notificationsToggle) {
    notificationsToggle.addEventListener("change", async (e) => {
      const enabled = e.target.checked;
      setNotificationPreference(enabled);

      if (enabled) {
        const granted = await requestPushPermission();
        if (!granted) {
          // Se permesso negato, disabilita toggle
          e.target.checked = false;
          setNotificationPreference(false);
        }
      } else {
        await disablePushNotifications();
        setNotificationPreference(false);
      }

      // Aggiorna banner per riflettere stato reale
      await refreshAccountBanner();
    });
  }

  // Toggle PWA (tutti gli utenti - abilitato per tutti)
  const pwaToggle = container.querySelector("#toggle-pwa");
  if (pwaToggle) {
    pwaToggle.addEventListener("change", async (e) => {
      const enabled = e.target.checked;

      if (enabled) {
        const installed = await installPWA();
        if (!installed) {
          // Se installazione fallita, disabilita toggle
          e.target.checked = false;
          setPWAPreference(false);
        } else {
          setPWAPreference(true);
        }
      } else {
        // PWA non può essere "disinstallata" via toggle
        // Il toggle riflette solo lo stato
        setPWAPreference(false);
      }

      // Aggiorna banner per riflettere stato reale
      await refreshAccountBanner();
    });
  }

  // Activate Desk button (solo Pro)
  if (role.role === "pro") {
    const activateDeskBtn = container.querySelector('[data-action="activate-desk"]');
    if (activateDeskBtn) {
      activateDeskBtn.addEventListener("click", (e) => {
        e.preventDefault();
        // BEST PRACTICE: Reindirizza a accesso.html con modale per gestione account
        // L'utente può gestire upgrade/attivazione Desk da lì
        window.location.href = "/accesso.html?modal=account&action=upgrade-desk";
      });
    }
  }
}

/**
 * Utility: escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Salva preferenza notifiche in localStorage
 */
function setNotificationPreference(enabled) {
  localStorage.setItem("tradelia-notifications-enabled", enabled ? "true" : "false");
}

/**
 * Salva preferenza PWA in localStorage
 */
function setPWAPreference(enabled) {
  localStorage.setItem("tradelia-pwa-enabled", enabled ? "true" : "false");
}

/**
 * Aggiorna il banner (utile dopo azioni che cambiano lo stato)
 */
export async function refreshAccountBanner() {
  currentRole = await getUserRole();
  currentPlanData = await getPlanData();
  const bannerContainer = document.getElementById("account-banner-slot");
  if (bannerContainer) {
    await renderBanner(bannerContainer, currentRole, currentPlanData);
    bindBannerEvents(bannerContainer, currentRole);
  }
}

/**
 * Ottiene il ruolo corrente (cached)
 */
export function getCurrentRole() {
  return currentRole;
}
