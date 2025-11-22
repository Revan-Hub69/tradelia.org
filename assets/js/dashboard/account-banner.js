/* eslint-env browser */
/**
 * Dashboard Account Status Banner
 * Mostra stato account, saldo, toggle PWA e notifiche
 */

import { getUserRole, logout, getPlanData } from "./auth.js";
import {
  enablePushNotifications,
  disablePushNotifications,
  areNotificationsEnabled,
} from "./pwa-notifications.js";
import { installPWA, isPWAInstalled } from "./pwa-notifications.js";

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

  currentRole = await getUserRole();
  currentPlanData = await getPlanData();
  renderBanner(bannerContainer, currentRole, currentPlanData);
  bindBannerEvents(bannerContainer, currentRole);
}

/**
 * Renderizza il banner in base al ruolo e plan data
 */
function renderBanner(container, role, planData) {
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
            <div class="toggle-switch-wrapper">
              <label class="toggle-switch toggle-switch-disabled" title="Passa a Pro per sbloccare">
                <input type="checkbox" id="toggle-notifications" disabled>
                <span class="toggle-slider"></span>
                <span class="toggle-label">Notifiche Push</span>
              </label>
              <div class="popover-tooltip">Passa a Pro per sbloccare</div>
            </div>
            <div class="toggle-switch-wrapper">
              <label class="toggle-switch toggle-switch-disabled" title="Passa a Pro per sbloccare">
                <input type="checkbox" id="toggle-pwa" disabled>
                <span class="toggle-slider"></span>
                <span class="toggle-label">PWA</span>
              </label>
              <div class="popover-tooltip">Passa a Pro per sbloccare</div>
            </div>
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
              <input type="checkbox" id="toggle-notifications" ${getNotificationPreference() ? "checked" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Notifiche Push</span>
            </label>
            <label class="toggle-switch" title="Installa PWA">
              <input type="checkbox" id="toggle-pwa" ${getPWAPreference() ? "checked" : ""}>
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
            <div class="toggle-switch-wrapper">
              <label class="toggle-switch" title="Notifiche Push">
                <input type="checkbox" id="toggle-notifications">
                <span class="toggle-slider"></span>
                <span class="toggle-label">Notifiche Push</span>
              </label>
            </div>
            <div class="toggle-switch-wrapper">
              <label class="toggle-switch" title="Installa PWA">
                <input type="checkbox" id="toggle-pwa">
                <span class="toggle-slider"></span>
                <span class="toggle-label">PWA</span>
              </label>
            </div>
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

  // Toggle notifiche (tutti gli utenti)
  const notificationsToggle = container.querySelector("#toggle-notifications");
  if (notificationsToggle) {
    if (notificationsToggle.disabled) {
      // Guest: mostra popover
      const wrapper = notificationsToggle.closest(".toggle-switch-wrapper");
      if (wrapper) {
        const toggleSwitch = wrapper.querySelector(".toggle-switch");
        if (toggleSwitch) {
          toggleSwitch.addEventListener("mouseenter", () => {
            const popover = wrapper.querySelector(".popover-tooltip");
            if (popover) {
              popover.style.opacity = "1";
              popover.style.visibility = "visible";
            }
          });
          toggleSwitch.addEventListener("mouseleave", () => {
            const popover = wrapper.querySelector(".popover-tooltip");
            if (popover) {
              popover.style.opacity = "0";
              popover.style.visibility = "hidden";
            }
          });
        }
      }
    } else {
      // Verifica stato iniziale notifiche
      checkNotificationState(notificationsToggle);

      notificationsToggle.addEventListener("change", async (e) => {
        const enabled = e.target.checked;
        setNotificationPreference(enabled);

        if (enabled) {
          const success = await enablePushNotifications();
          if (!success) {
            // Se fallisce, ripristina toggle
            e.target.checked = false;
            setNotificationPreference(false);
            if (window.showToast) {
              window.showToast(
                "Errore nell'abilitazione delle notifiche. Verifica le impostazioni del browser.",
                "error"
              );
            }
          } else {
            if (window.showToast) {
              window.showToast("Notifiche push abilitate", "success");
            }
          }
        } else {
          await disablePushNotifications();
          if (window.showToast) {
            window.showToast("Notifiche push disabilitate", "info");
          }
        }
      });
    }
  }

  // Toggle PWA (tutti gli utenti)
  const pwaToggle = container.querySelector("#toggle-pwa");
  if (pwaToggle) {
    if (pwaToggle.disabled) {
      // Guest: mostra popover
      const wrapper = pwaToggle.closest(".toggle-switch-wrapper");
      if (wrapper) {
        const toggleSwitch = wrapper.querySelector(".toggle-switch");
        if (toggleSwitch) {
          toggleSwitch.addEventListener("mouseenter", () => {
            const popover = wrapper.querySelector(".popover-tooltip");
            if (popover) {
              popover.style.opacity = "1";
              popover.style.visibility = "visible";
            }
          });
          toggleSwitch.addEventListener("mouseleave", () => {
            const popover = wrapper.querySelector(".popover-tooltip");
            if (popover) {
              popover.style.opacity = "0";
              popover.style.visibility = "hidden";
            }
          });
        }
      }
    } else {
      // Verifica stato iniziale PWA
      checkPWAState(pwaToggle);

      pwaToggle.addEventListener("change", async (e) => {
        const enabled = e.target.checked;
        setPWAPreference(enabled);

        if (enabled) {
          const installed = await installPWA();
          if (!installed) {
            // Se non installata, ripristina toggle
            e.target.checked = false;
            setPWAPreference(false);
            if (window.showToast) {
              window.showToast(
                "Installazione PWA non disponibile. Verifica che il browser supporti l'installazione.",
                "error"
              );
            }
          } else {
            if (window.showToast) {
              window.showToast("PWA installata con successo!", "success");
            }
            // Aggiorna stato toggle
            checkPWAState(pwaToggle);
          }
        } else {
          // PWA non può essere "disinstallata" via toggle
          // Il toggle serve solo per installare
          if (window.showToast) {
            window.showToast("Per disinstallare la PWA, usa le impostazioni del browser.", "info");
          }
          // Ripristina toggle se PWA è installata
          if (isPWAInstalled()) {
            e.target.checked = true;
            setPWAPreference(true);
          }
        }
      });
    }
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
 * Ottiene preferenza notifiche da localStorage
 */
function getNotificationPreference() {
  const pref = localStorage.getItem("tradelia-notifications-enabled");
  return pref === "true";
}

/**
 * Salva preferenza notifiche in localStorage
 */
function setNotificationPreference(enabled) {
  localStorage.setItem("tradelia-notifications-enabled", enabled ? "true" : "false");
}

/**
 * Ottiene preferenza PWA da localStorage
 */
function getPWAPreference() {
  const pref = localStorage.getItem("tradelia-pwa-enabled");
  return pref === "true";
}

/**
 * Salva preferenza PWA in localStorage
 */
function setPWAPreference(enabled) {
  localStorage.setItem("tradelia-pwa-enabled", enabled ? "true" : "false");
}

/**
 * Verifica stato iniziale notifiche e aggiorna toggle
 */
async function checkNotificationState(toggle) {
  try {
    const enabled = await areNotificationsEnabled();
    toggle.checked = enabled;
    setNotificationPreference(enabled);
  } catch (error) {
    console.error("[Account Banner] Errore verifica stato notifiche:", error);
  }
}

/**
 * Verifica stato iniziale PWA e aggiorna toggle
 */
function checkPWAState(toggle) {
  const installed = isPWAInstalled();
  toggle.checked = installed;
  setPWAPreference(installed);
}

/**
 * Aggiorna il banner (utile dopo azioni che cambiano lo stato)
 */
export async function refreshAccountBanner() {
  currentRole = await getUserRole();
  currentPlanData = await getPlanData();
  const bannerContainer = document.getElementById("account-banner-slot");
  if (bannerContainer) {
    renderBanner(bannerContainer, currentRole, currentPlanData);
    bindBannerEvents(bannerContainer, currentRole);
  }
}

/**
 * Ottiene il ruolo corrente (cached)
 */
export function getCurrentRole() {
  return currentRole;
}
