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
  enablePushNotifications,
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
  const pwaInstallable = isPWAInstallable();
  const notificationsEnabled = await areNotificationsEnabled();
  const notificationPermission = getNotificationPermission();

  // Genera pulsanti PWA e Notifiche
  const pwaButton = generatePWAButton(pwaInstalled, pwaInstallable);
  const notificationsButton = generateNotificationsButton(
    notificationsEnabled,
    notificationPermission
  );

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
            ${pwaButton}
            ${notificationsButton}
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
            ${pwaButton}
            ${notificationsButton}
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
            ${pwaButton}
            ${notificationsButton}
            <button class="btn btn-secondary btn-sm" id="btn-logout">Esci</button>
          </div>
        </div>
      </div>
    `;
    return;
  }
}

/**
 * SVG Icon: App installata
 */
function getAppInstalledIcon() {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
    <path d="M13.5 2.5L6 10L2.5 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/**
 * SVG Icon: Installa app
 */
function getInstallAppIcon() {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
    <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

/**
 * SVG Icon: Notifiche
 */
function getNotificationIcon() {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
    <path d="M8 2C6.34 2 5 3.34 5 5V9C5 9.55 4.78 10.05 4.41 10.41L3.5 11.32C3.22 11.6 3 12.05 3 12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5C13 12.05 12.78 11.6 12.5 11.32L11.59 10.41C11.22 10.05 11 9.55 11 9V5C11 3.34 9.66 2 8 2Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <path d="M6 14C6 15.1 6.9 16 8 16C9.1 16 10 15.1 10 14" stroke="currentColor" stroke-width="1.2" fill="none"/>
  </svg>`;
}

/**
 * SVG Icon: Notifiche negate
 */
function getNotificationDeniedIcon() {
  return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 4px;">
    <path d="M8 2C6.34 2 5 3.34 5 5V9C5 9.55 4.78 10.05 4.41 10.41L3.5 11.32C3.22 11.6 3 12.05 3 12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5C13 12.05 12.78 11.6 12.5 11.32L11.59 10.41C11.22 10.05 11 9.55 11 9V5C11 3.34 9.66 2 8 2Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <path d="M6 14C6 15.1 6.9 16 8 16C9.1 16 10 15.1 10 14" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <path d="M2 2L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

/**
 * Genera pulsante PWA in base allo stato
 */
function generatePWAButton(pwaInstalled, pwaInstallable) {
  if (pwaInstalled) {
    // PWA installata: mostra badge indicatore
    return `<span class="account-banner-badge badge-success" title="App installata">${getAppInstalledIcon()}App Installata</span>`;
  }

  if (pwaInstallable) {
    // PWA installabile: mostra pulsante "Installa App"
    return `<button class="btn btn-secondary btn-sm" id="btn-install-pwa" title="Installa l'app sul dispositivo">${getInstallAppIcon()}Installa App</button>`;
  }

  // PWA non installabile: non mostrare nulla
  return "";
}

/**
 * Genera pulsante/toggle notifiche in base allo stato
 */
function generateNotificationsButton(notificationsEnabled, notificationPermission) {
  if (notificationPermission === "denied") {
    // Permesso negato: mostra pulsante con istruzioni
    return `<button class="btn btn-secondary btn-sm" id="btn-fix-notifications" title="Come abilitare le notifiche">${getNotificationDeniedIcon()}Abilita Notifiche</button>`;
  }

  if (notificationsEnabled) {
    // Notifiche abilitate: mostra toggle per disabilitare
    return `
      <label class="toggle-switch" title="Disabilita notifiche push">
        <input type="checkbox" id="toggle-notifications" checked>
        <span class="toggle-slider"></span>
        <span class="toggle-label">${getNotificationIcon()}Notifiche</span>
      </label>
    `;
  }

  // Notifiche non abilitate: mostra pulsante "Abilita Notifiche"
  return `<button class="btn btn-secondary btn-sm" id="btn-enable-notifications" title="Abilita notifiche push">${getNotificationIcon()}Abilita Notifiche</button>`;
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

  // Pulsante Installa PWA
  const installPWABtn = container.querySelector("#btn-install-pwa");
  if (installPWABtn) {
    installPWABtn.addEventListener("click", async () => {
      const installed = await installPWA();
      if (installed) {
        // Aggiorna banner per mostrare badge "App Installata"
        await refreshAccountBanner();
      }
    });
  }

  // Pulsante Abilita Notifiche
  const enableNotificationsBtn = container.querySelector("#btn-enable-notifications");
  if (enableNotificationsBtn) {
    enableNotificationsBtn.addEventListener("click", async () => {
      const success = await enablePushNotifications();
      if (success) {
        // Aggiorna banner per mostrare toggle
        await refreshAccountBanner();
      }
    });
  }

  // Pulsante Fix Notifiche (quando permesso negato)
  const fixNotificationsBtn = container.querySelector("#btn-fix-notifications");
  if (fixNotificationsBtn) {
    fixNotificationsBtn.addEventListener("click", async () => {
      // Prova comunque a richiedere il permesso (potrebbe essere stato cambiato nelle impostazioni)
      const success = await enablePushNotifications();
      if (!success) {
        // Se fallisce, mostra istruzioni
        showNotificationInstructions();
      } else {
        // Se funziona, aggiorna banner
        await refreshAccountBanner();
      }
    });
  }

  // Toggle notifiche (solo se già abilitate, per disabilitare)
  const notificationsToggle = container.querySelector("#toggle-notifications");
  if (notificationsToggle) {
    notificationsToggle.addEventListener("change", async (e) => {
      if (!e.target.checked) {
        // Disabilita notifiche
        await disablePushNotifications();
        setNotificationPreference(false);
        // Aggiorna banner per mostrare pulsante "Abilita Notifiche"
        await refreshAccountBanner();
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
 * Mostra istruzioni per abilitare notifiche quando negate
 */
function showNotificationInstructions() {
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isEdge = /Edg/.test(navigator.userAgent);

  let instructions = "";

  if (isChrome || isEdge) {
    instructions = `
Per abilitare le notifiche in Chrome/Edge:

1. Clicca sull'icona del lucchetto o "i" nella barra degli indirizzi
2. Trova "Notifiche" nel menu
3. Seleziona "Consenti" o "Chiedi"
4. Ricarica la pagina

Oppure:
1. Vai su Impostazioni > Privacy e sicurezza > Impostazioni sito
2. Trova questo sito nella lista
3. Imposta "Notifiche" su "Consenti"
    `;
  } else if (isFirefox) {
    instructions = `
Per abilitare le notifiche in Firefox:

1. Clicca sull'icona del lucchetto nella barra degli indirizzi
2. Clicca su "Più informazioni"
3. Nella sezione "Permessi", trova "Notifiche"
4. Seleziona "Consenti" e ricarica la pagina
    `;
  } else if (isSafari) {
    instructions = `
Per abilitare le notifiche in Safari:

1. Vai su Safari > Impostazioni > Siti web
2. Seleziona "Notifiche" nel menu laterale
3. Trova questo sito e imposta su "Consenti"
4. Ricarica la pagina
    `;
  } else {
    instructions = `
Per abilitare le notifiche:

1. Apri le impostazioni del browser
2. Cerca "Notifiche" o "Permessi sito"
3. Trova questo sito e consenti le notifiche
4. Ricarica la pagina
    `;
  }

  alert(instructions);
}

/**
 * Salva preferenza notifiche in localStorage (per riferimento futuro)
 */
function setNotificationPreference(enabled) {
  localStorage.setItem("tradelia-notifications-enabled", enabled ? "true" : "false");
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
