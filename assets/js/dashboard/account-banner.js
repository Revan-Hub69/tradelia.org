/* eslint-env browser */
/**
 * Dashboard Account Status Banner
 * Mostra stato account, saldo
 */

import { getUserRole, logout, getPlanData } from "./auth.js";

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
  await renderBanner(bannerContainer, currentRole, currentPlanData);
  bindBannerEvents(bannerContainer, currentRole);
}

/**
 * Renderizza il banner in base al ruolo e plan data
 */
async function renderBanner(container, role, planData) {
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
            ${await generateNotificationPreferencesButton(role, planData)}
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
            ${await generateNotificationPreferencesButton(role, planData)}
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
            ${await generateNotificationPreferencesButton(role, planData)}
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
  // Pulsante Preferenze Notifiche
  const notificationPrefsBtn = container.querySelector("#btn-notification-preferences");
  if (notificationPrefsBtn) {
    // Solo Pro/Desk possono cliccare
    if (role.role === "pro" || role.role === "desk") {
      notificationPrefsBtn.addEventListener("click", () => {
        showNotificationPreferencesModal(role);
      });
    } else {
      // Per utenti non Pro, mostra tooltip al hover
      notificationPrefsBtn.addEventListener("mouseenter", () => {
        if (window.showToast) {
          // Non mostriamo toast, il tooltip HTML è sufficiente
        }
      });
    }
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
 * Genera pulsante preferenze notifiche
 * - Pro/Desk: pulsante attivo con preferenze
 * - Altri: pulsante inattivo con tooltip "Presto disponibile per Pro"
 */
async function generateNotificationPreferencesButton(role, _planData) {
  const isProOrDesk = role.role === "pro" || role.role === "desk";

  if (isProOrDesk) {
    // Recupera preferenze attuali
    const preferences = await getNotificationPreferences();
    const currentMethod = preferences?.notification_method || "email";
    const methodLabel =
      currentMethod === "email" ? "Email" : currentMethod === "sms" ? "SMS" : "WhatsApp";

    return `
      <button class="btn btn-secondary btn-sm" id="btn-notification-preferences" title="Configura notifiche (SMS/WhatsApp)">
        ${getNotificationIcon()}Notifiche: ${methodLabel}
      </button>
    `;
  }

  // Utenti non Pro: mostra pulsante inattivo
  return `
    <button 
      class="btn btn-secondary btn-sm btn-inactive" 
      id="btn-notification-preferences" 
      disabled
      title="Presto disponibile per Pro"
      data-tooltip="Presto disponibile per Pro"
    >
      ${getNotificationIcon()}Notifiche: SMS/WhatsApp
    </button>
  `;
}

/**
 * Recupera preferenze notifiche utente
 */
async function getNotificationPreferences() {
  const token = localStorage.getItem("tradelia-access-token-v1");
  if (!token) {
    return null;
  }

  try {
    const response = await fetch("/api/user.js?action=notification-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.preferences || null;
  } catch (error) {
    console.error("[Account Banner] Errore recupero preferenze:", error);
    return null;
  }
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
 * Mostra modale preferenze notifiche
 */
async function showNotificationPreferencesModal(_role) {
  const preferences = await getNotificationPreferences();
  const currentMethod = preferences?.notification_method || "email";
  const currentPhone = preferences?.phone_number || "";

  const modal = document.createElement("div");
  modal.className = "modal show";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <h2 style="margin-top: 0; margin-bottom: 1.5rem;">Preferenze Notifiche</h2>
      <p style="margin-bottom: 1.5rem; color: var(--ink-secondary);">
        Scegli come ricevere le notifiche per report pronti, ordini attivati e aggiornamenti.
      </p>
      
      <form id="notification-preferences-form">
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Metodo di notifica:</label>
          <select id="notification-method" style="width: 100%; padding: 0.5rem; border-radius: 8px; border: 1px solid var(--br-card); background: var(--surface-card); color: var(--ink);">
            <option value="email" ${currentMethod === "email" ? "selected" : ""}>Email</option>
            <option value="sms" ${currentMethod === "sms" ? "selected" : ""}>SMS</option>
            <option value="whatsapp" ${currentMethod === "whatsapp" ? "selected" : ""}>WhatsApp</option>
          </select>
        </div>

        <div id="phone-number-container" style="margin-bottom: 1.5rem; ${currentMethod === "email" ? "display: none;" : ""}">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Numero telefono:</label>
          <input 
            type="tel" 
            id="phone-number" 
            placeholder="+393491234567" 
            value="${currentPhone}"
            style="width: 100%; padding: 0.5rem; border-radius: 8px; border: 1px solid var(--br-card); background: var(--surface-card); color: var(--ink);"
          />
          <small style="display: block; margin-top: 0.25rem; color: var(--ink-secondary);">
            Formato internazionale (es: +393491234567)
          </small>
        </div>

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-preferences">Annulla</button>
          <button type="submit" class="btn btn-elegant btn-sm">Salva</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Mostra/nascondi campo telefono in base al metodo
  const methodSelect = modal.querySelector("#notification-method");
  const phoneContainer = modal.querySelector("#phone-number-container");

  methodSelect.addEventListener("change", () => {
    phoneContainer.style.display = methodSelect.value === "email" ? "none" : "block";
  });

  // Salva preferenze
  const form = modal.querySelector("#notification-preferences-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveNotificationPreferences(
      methodSelect.value,
      phoneContainer.style.display !== "none" ? modal.querySelector("#phone-number").value : null
    );
    modal.remove();
  });

  // Chiudi modale
  modal.querySelector("#btn-cancel-preferences").addEventListener("click", () => {
    modal.remove();
  });

  // Chiudi cliccando fuori
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Salva preferenze notifiche
 */
async function saveNotificationPreferences(method, phoneNumber) {
  const token = localStorage.getItem("tradelia-access-token-v1");
  if (!token) {
    if (window.showToast) {
      window.showToast("Token non trovato", "error");
    }
    return;
  }

  try {
    const response = await fetch("/api/save-notification-preferences.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        notification_method: method,
        phone_number: phoneNumber || null,
      }),
    });

    const data = await response.json();

    if (data.success) {
      if (window.showToast) {
        window.showToast("Preferenze salvate con successo!", "success");
      }
      await refreshAccountBanner();
    } else {
      if (window.showToast) {
        window.showToast(data.error || "Errore nel salvataggio", "error");
      }
    }
  } catch (error) {
    console.error("[Account Banner] Errore salvataggio preferenze:", error);
    if (window.showToast) {
      window.showToast("Errore nel salvataggio delle preferenze", "error");
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
