/* eslint-env browser */
/**
 * Dashboard Account Status Banner
 * Mostra stato account, saldo, toggle Progressive App e notifiche
 */

import { getUserRole, logout, getPlanData } from "./auth.js";
import { installPWA, isPWAInstalled } from "./pwa-notifications.js";
import { requestNotificationPermissionExplicit } from "./simple-notifications.js";
import { showAuthModal } from "./auth-modal.js";
import { getCurrentTheme, setTheme, saveTheme } from "./theme-toggle.js";

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
  // BEST PRACTICE: Calcola tema una volta all'inizio per evitare problemi con Rollup
  const currentTheme = getCurrentTheme();
  const isDark = currentTheme === "dark";
  const sunIcon = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
  const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  const themeIcon = isDark ? sunIcon : moonIcon;

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
            <button type="button" class="btn-icon btn-icon-theme" id="btn-theme-toggle" title="Cambia tema (chiaro/scuro)" aria-label="Cambia tema">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                ${themeIcon}
              </svg>
            </button>
            <label class="banner-toggle-compact" title="Ricevi notifiche push sul browser quando ci sono nuovi contenuti" id="toggle-notifications-label">
              <input type="checkbox" id="toggle-notifications" ${getNotificationPermissionState() ? "checked" : ""}>
              <span class="banner-toggle-slider"></span>
              <span class="banner-toggle-label">Notifiche</span>
            </label>
            <label class="banner-toggle-compact" title="Installa l'app sul dispositivo per accesso rapido e funzionalità offline">
              <input type="checkbox" id="toggle-pwa">
              <span class="banner-toggle-slider"></span>
              <span class="banner-toggle-label">App</span>
            </label>
            <button type="button" class="btn btn-elegant btn-sm" id="btn-open-auth-modal">Accedi</button>
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
            <button type="button" class="btn-icon btn-icon-theme" id="btn-theme-toggle" title="Cambia tema (chiaro/scuro)" aria-label="Cambia tema">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                ${themeIcon}
              </svg>
            </button>
            <label class="toggle-switch" title="Notifiche Browser" id="toggle-notifications-label">
              <input type="checkbox" id="toggle-notifications" ${getNotificationPermissionState() ? "checked" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Notifiche</span>
            </label>
            <label class="toggle-switch" title="Installa Progressive App (app installabile)">
              <input type="checkbox" id="toggle-pwa" ${getPWAPreference() ? "checked" : ""}>
              <span class="toggle-slider"></span>
              <span class="toggle-label">App</span>
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
            <button type="button" class="btn-icon btn-icon-theme" id="btn-theme-toggle" title="Cambia tema (chiaro/scuro)" aria-label="Cambia tema">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                ${themeIcon}
              </svg>
            </button>
            <label class="banner-toggle-compact" title="Ricevi notifiche push sul browser quando ci sono nuovi contenuti" id="toggle-notifications-label">
              <input type="checkbox" id="toggle-notifications" ${getNotificationPermissionState() ? "checked" : ""}>
              <span class="banner-toggle-slider"></span>
              <span class="banner-toggle-label">Notifiche</span>
            </label>
            <label class="banner-toggle-compact" title="Installa l'app sul dispositivo per accesso rapido e funzionalità offline">
              <input type="checkbox" id="toggle-pwa">
              <span class="banner-toggle-slider"></span>
              <span class="banner-toggle-label">App</span>
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
  // FORZA STILI INLINE PER TOGGLE SU MOBILE
  if (window.innerWidth <= 768) {
    const toggles = container.querySelectorAll(".banner-toggle-compact");
    toggles.forEach((toggle) => {
      toggle.style.display = "flex";
      toggle.style.flexDirection = "row";
      toggle.style.alignItems = "center";
      toggle.style.gap = "6px";
      toggle.style.flexShrink = "0";
      toggle.style.whiteSpace = "nowrap";

      const slider = toggle.querySelector(".banner-toggle-slider");
      if (slider) {
        slider.style.order = "1";
        slider.style.flexShrink = "0";
      }

      const label = toggle.querySelector(".banner-toggle-label");
      if (label) {
        label.style.order = "2";
        label.style.marginLeft = "6px";
        label.style.marginTop = "0";
      }
    });

    // Forza anche account-banner-actions in riga
    const actions = container.querySelector(".account-banner-actions");
    if (actions) {
      actions.style.display = "flex";
      actions.style.flexDirection = "row";
      actions.style.alignItems = "center";
      actions.style.gap = "4px";
      actions.style.flexWrap = "nowrap";
    }
  }

  // Auth modal button (guest users)
  const authModalBtn = container.querySelector("#btn-open-auth-modal");
  if (authModalBtn) {
    authModalBtn.addEventListener("click", () => {
      showAuthModal("code");
    });
  }

  // Logout button
  const logoutBtn = container.querySelector("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (confirm("Sei sicuro di voler uscire?")) {
        await logout();
      }
    });
  }

  // Toggle notifiche browser native
  const notificationsToggle = container.querySelector("#toggle-notifications");
  if (notificationsToggle) {
    // Verifica stato iniziale
    updateNotificationToggleState(notificationsToggle);

    notificationsToggle.addEventListener("change", async (e) => {
      const enabled = e.target.checked;

      if (enabled) {
        // Richiedi permesso esplicitamente (best practice accademica)
        const granted = await requestNotificationPermissionExplicit();
        if (!granted) {
          // Se permesso negato, ripristina toggle
          e.target.checked = false;
          updateNotificationToggleState(notificationsToggle);
        } else {
          // Aggiorna stato dopo permesso concesso
          updateNotificationToggleState(notificationsToggle);
        }
      } else {
        // Non possiamo "disabilitare" il permesso, ma possiamo informare l'utente
        if (window.showToast) {
          window.showToast(
            "Per disabilitare le notifiche, usa le impostazioni del browser.",
            "info"
          );
        }
        // Ripristina toggle se permesso ancora concesso
        updateNotificationToggleState(notificationsToggle);
      }
    });
  }

  // Toggle Progressive App (tutti gli utenti, anche guest)
  const pwaToggle = container.querySelector("#toggle-pwa");
  if (pwaToggle) {
    // Verifica stato iniziale Progressive App
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
              "Installazione app non disponibile. Verifica che il browser supporti l'installazione di Progressive App.",
              "error"
            );
          }
        } else {
          if (window.showToast) {
            window.showToast("Progressive App installata con successo!", "success");
          }
          // Aggiorna stato toggle dopo installazione
          setTimeout(() => {
            checkPWAState(pwaToggle);
          }, 1000);
        }
      } else {
        // Progressive App non può essere "disinstallata" via toggle
        // Il toggle serve solo per installare
        if (window.showToast) {
          window.showToast("Per disinstallare l'app, usa le impostazioni del browser.", "info");
        }
        // Ripristina toggle se Progressive App è installata
        if (isPWAInstalled()) {
          e.target.checked = true;
          setPWAPreference(true);
        }
      }
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

  // Theme toggle button
  const themeToggleBtn = container.querySelector("#btn-theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = getCurrentTheme();
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
      saveTheme(newTheme);

      // Update icon
      const svg = themeToggleBtn.querySelector("svg");
      if (svg) {
        if (newTheme === "dark") {
          svg.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
          themeToggleBtn.setAttribute("aria-label", "Passa a tema chiaro");
        } else {
          svg.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
          themeToggleBtn.setAttribute("aria-label", "Passa a tema scuro");
        }
      }

      // Haptic feedback
      if (window.triggerHapticFeedback) {
        window.triggerHapticFeedback("light");
      }

      // Screen reader announcement
      if (window.announceToScreenReader) {
        window.announceToScreenReader(
          `Tema cambiato a ${newTheme === "dark" ? "scuro" : "chiaro"}`
        );
      }
    });
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
 * Verifica stato permesso notifiche browser
 */
function getNotificationPermissionState() {
  if (!("Notification" in window)) {
    return false;
  }
  return Notification.permission === "granted";
}

/**
 * Aggiorna stato toggle notifiche
 */
function updateNotificationToggleState(toggle) {
  if (!toggle) {
    return;
  }

  if (!("Notification" in window)) {
    toggle.disabled = true;
    toggle.checked = false;
    const label = toggle.closest("label");
    if (label) {
      label.title = "Notifiche non supportate dal browser";
    }
    return;
  }

  const permission = Notification.permission;
  toggle.checked = permission === "granted";

  if (permission === "denied") {
    toggle.disabled = true;
    const label = toggle.closest("label");
    if (label) {
      label.title = "Notifiche bloccate. Abilita nelle impostazioni del browser.";
    }
  } else {
    toggle.disabled = false;
    const label = toggle.closest("label");
    if (label) {
      label.title = permission === "granted" ? "Notifiche abilitate" : "Abilita notifiche browser";
    }
  }
}

/**
 * Ottiene preferenza Progressive App da localStorage
 */
function getPWAPreference() {
  const pref = localStorage.getItem("tradelia-pwa-enabled");
  return pref === "true";
}

/**
 * Salva preferenza Progressive App in localStorage
 */
function setPWAPreference(enabled) {
  localStorage.setItem("tradelia-pwa-enabled", enabled ? "true" : "false");
}

// Funzione checkNotificationState - DISABILITATA

/**
 * Verifica stato iniziale Progressive App e aggiorna toggle
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

    // Forza stili anche dopo resize
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        const toggles = bannerContainer.querySelectorAll(".banner-toggle-compact");
        toggles.forEach((toggle) => {
          toggle.style.display = "flex";
          toggle.style.flexDirection = "row";
          toggle.style.alignItems = "center";
          toggle.style.gap = "6px";

          const slider = toggle.querySelector(".banner-toggle-slider");
          if (slider) {
            slider.style.order = "1";
          }

          const label = toggle.querySelector(".banner-toggle-label");
          if (label) {
            label.style.order = "2";
            label.style.marginLeft = "6px";
            label.style.marginTop = "0";
          }
        });

        const actions = bannerContainer.querySelector(".account-banner-actions");
        if (actions) {
          actions.style.display = "flex";
          actions.style.flexDirection = "row";
          actions.style.flexWrap = "nowrap";
        }
      }
    });
  }
}

/**
 * Ottiene il ruolo corrente (cached)
 */
export function getCurrentRole() {
  return currentRole;
}
