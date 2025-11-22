/**
 * Dashboard Communication Preferences Modal
 * Gestisce consensi newsletter, SMS, WhatsApp
 * GDPR Compliance: consenso esplicito, non pre-selezionato
 */

import { keyboardNav } from "./keyboard-nav.js";

const MODAL_ID = "communication-preferences-modal";
let preferencesData = null;

/**
 * Initialize communication preferences modal
 */
export function initCommunicationPreferences() {
  createModal();
  setupModalTrigger();
  loadPreferences();
}

/**
 * Create modal structure
 */
function createModal() {
  // Check if already exists
  if (document.getElementById(MODAL_ID)) {
    return;
  }

  const modal = document.createElement("div");
  modal.id = MODAL_ID;
  modal.className = "communication-preferences-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Preferenze comunicazioni");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="communication-preferences-overlay" aria-hidden="true"></div>
    <div class="communication-preferences-content">
      <div class="communication-preferences-header">
        <h2 class="communication-preferences-title">Preferenze Comunicazioni</h2>
        <button
          type="button"
          class="communication-preferences-close"
          aria-label="Chiudi"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="communication-preferences-body">
        <p class="communication-preferences-intro">
          Scegli come vuoi ricevere aggiornamenti e comunicazioni da Tradelia AI.
          <small class="compliance-hint">
            (GDPR: consenso esplicito, revocabile in qualsiasi momento)
          </small>
        </p>

        <form id="communication-preferences-form" class="communication-preferences-form" novalidate>
          <!-- Newsletter -->
          <div class="communication-preference-item">
            <label class="communication-preference-label">
              <input
                type="checkbox"
                id="pref-newsletter"
                name="newsletter"
                class="communication-preference-checkbox"
              />
              <div class="communication-preference-content">
                <div class="communication-preference-title">
                  Newsletter Email
                  <svg class="communication-preference-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div class="communication-preference-description">
                  Ricevi aggiornamenti su nuovi report, analisi e contenuti educativi via email.
                </div>
              </div>
            </label>
          </div>

          <!-- SMS -->
          <div class="communication-preference-item">
            <label class="communication-preference-label">
              <input
                type="checkbox"
                id="pref-sms"
                name="sms"
                class="communication-preference-checkbox"
              />
              <div class="communication-preference-content">
                <div class="communication-preference-title">
                  Notifiche SMS
                  <svg class="communication-preference-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div class="communication-preference-description">
                  Ricevi notifiche importanti via SMS sul tuo numero di telefono.
                </div>
              </div>
            </label>
            <div id="sms-phone-container" class="communication-preference-phone" style="display: none;">
              <label for="pref-sms-phone" class="communication-preference-phone-label">
                Numero Telefono (formato internazionale)
              </label>
              <input
                type="tel"
                id="pref-sms-phone"
                name="sms_phone"
                class="communication-preference-phone-input"
                placeholder="+39 123 456 7890"
                pattern="^\\+[1-9]\\d{1,14}$"
              />
              <small class="compliance-hint">
                (Esempio: +39 123 456 7890)
              </small>
            </div>
          </div>

          <!-- WhatsApp -->
          <div class="communication-preference-item">
            <label class="communication-preference-label">
              <input
                type="checkbox"
                id="pref-whatsapp"
                name="whatsapp"
                class="communication-preference-checkbox"
              />
              <div class="communication-preference-content">
                <div class="communication-preference-title">
                  Notifiche WhatsApp
                  <svg class="communication-preference-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div class="communication-preference-description">
                  Ricevi notifiche e aggiornamenti via WhatsApp.
                </div>
              </div>
            </label>
            <div id="whatsapp-phone-container" class="communication-preference-phone" style="display: none;">
              <label for="pref-whatsapp-phone" class="communication-preference-phone-label">
                Numero WhatsApp (formato internazionale)
              </label>
              <input
                type="tel"
                id="pref-whatsapp-phone"
                name="whatsapp_phone"
                class="communication-preference-phone-input"
                placeholder="+39 123 456 7890"
                pattern="^\\+[1-9]\\d{1,14}$"
              />
              <small class="compliance-hint">
                (Esempio: +39 123 456 7890)
              </small>
            </div>
          </div>

          <!-- GDPR Notice -->
          <div class="communication-preferences-gdpr">
            <p class="communication-preferences-gdpr-text">
              <strong>Privacy e Consenso (GDPR)</strong><br />
              I tuoi dati sono utilizzati esclusivamente per inviare le comunicazioni selezionate.
              Puoi revocare il consenso in qualsiasi momento da questa pagina.
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Leggi la privacy policy</a>.
            </p>
          </div>
        </form>
      </div>

      <div class="communication-preferences-footer">
        <button
          type="button"
          class="btn btn-secondary"
          id="communication-preferences-cancel"
        >
          Annulla
        </button>
        <button
          type="button"
          class="btn btn-primary"
          id="communication-preferences-save"
        >
          Salva Preferenze
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setupModalEvents();
}

/**
 * Setup modal event listeners
 */
function setupModalEvents() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) {
    return;
  }

  const overlay = modal.querySelector(".communication-preferences-overlay");
  const closeBtn = modal.querySelector(".communication-preferences-close");
  const cancelBtn = document.getElementById("communication-preferences-cancel");
  const saveBtn = document.getElementById("communication-preferences-save");

  // Close handlers
  const closeModal = () => {
    hideModal();
  };

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("aria-hidden")) {
      closeModal();
    }
  });

  // SMS checkbox toggle phone input
  const smsCheckbox = document.getElementById("pref-sms");
  const smsPhoneContainer = document.getElementById("sms-phone-container");
  if (smsCheckbox && smsPhoneContainer) {
    smsCheckbox.addEventListener("change", (e) => {
      smsPhoneContainer.style.display = e.target.checked ? "block" : "none";
      if (e.target.checked) {
        document.getElementById("pref-sms-phone")?.focus();
      }
    });
  }

  // WhatsApp checkbox toggle phone input
  const whatsappCheckbox = document.getElementById("pref-whatsapp");
  const whatsappPhoneContainer = document.getElementById("whatsapp-phone-container");
  if (whatsappCheckbox && whatsappPhoneContainer) {
    whatsappCheckbox.addEventListener("change", (e) => {
      whatsappPhoneContainer.style.display = e.target.checked ? "block" : "none";
      if (e.target.checked) {
        document.getElementById("pref-whatsapp-phone")?.focus();
      }
    });
  }

  // Save button
  if (saveBtn) {
    saveBtn.addEventListener("click", handleSavePreferences);
  }
}

/**
 * Setup trigger button in settings
 */
function setupModalTrigger() {
  // Add button to settings panel
  const settingsContainer = document.getElementById("settings-container");
  if (!settingsContainer) {
    return;
  }

  // Check if button already exists
  if (document.getElementById("btn-open-communication-preferences")) {
    return;
  }

  const button = document.createElement("button");
  button.id = "btn-open-communication-preferences";
  button.className = "btn btn-primary";
  button.type = "button";
  button.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="margin-right: 0.5rem;">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
    Gestisci Comunicazioni
  `;

  button.addEventListener("click", () => {
    showModal();
  });

  // Insert at the beginning of settings container
  const firstSection = settingsContainer.querySelector(".settings-section");
  if (firstSection) {
    firstSection.insertBefore(button, firstSection.firstChild);
  } else {
    settingsContainer.insertBefore(button, settingsContainer.firstChild);
  }
}

/**
 * Show modal
 */
function showModal() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) {
    return;
  }

  modal.removeAttribute("aria-hidden");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  // WCAG 2.2: Screen reader announcement
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.textContent =
    "Modale preferenze comunicazioni aperto. Usa Tab per navigare, Escape per chiudere.";
  document.body.appendChild(announcement);
  setTimeout(() => {
    announcement.remove();
  }, 1000);

  // Activate focus trap
  const content = modal.querySelector(".communication-preferences-content");
  if (content) {
    keyboardNav.activateFocusTrap(content, {
      initialFocus: "#pref-newsletter",
      returnFocus: true,
    });
  }

  // Load current preferences
  loadPreferences();
}

/**
 * Hide modal
 */
function hideModal() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) {
    return;
  }

  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("active");
  document.body.style.overflow = "";

  // Deactivate focus trap
  keyboardNav.deactivateFocusTrap();
}

/**
 * Load preferences from API
 */
async function loadPreferences() {
  try {
    const token = localStorage.getItem("tradelia-access-token-v1");
    if (!token) {
      console.warn("[CommunicationPreferences] Token non disponibile");
      return;
    }

    const response = await fetch("/api/user?action=notification-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Errore caricamento preferenze");
    }

    const data = await response.json();
    preferencesData = data.preferences;

    // Update form
    if (preferencesData) {
      // Newsletter
      const newsletterCheckbox = document.getElementById("pref-newsletter");
      if (newsletterCheckbox) {
        newsletterCheckbox.checked = preferencesData.newsletter_consent || false;
      }

      // SMS
      const smsCheckbox = document.getElementById("pref-sms");
      const smsPhoneInput = document.getElementById("pref-sms-phone");
      const smsPhoneContainer = document.getElementById("sms-phone-container");
      if (smsCheckbox) {
        smsCheckbox.checked = preferencesData.notification_method === "sms";
        if (smsCheckbox.checked && smsPhoneContainer) {
          smsPhoneContainer.style.display = "block";
        }
        if (smsPhoneInput && preferencesData.phone_number) {
          smsPhoneInput.value = preferencesData.phone_number;
        }
      }

      // WhatsApp
      const whatsappCheckbox = document.getElementById("pref-whatsapp");
      const whatsappPhoneInput = document.getElementById("pref-whatsapp-phone");
      const whatsappPhoneContainer = document.getElementById("whatsapp-phone-container");
      if (whatsappCheckbox) {
        whatsappCheckbox.checked = preferencesData.notification_method === "whatsapp";
        if (whatsappCheckbox.checked && whatsappPhoneContainer) {
          whatsappPhoneContainer.style.display = "block";
        }
        if (whatsappPhoneInput && preferencesData.phone_number) {
          whatsappPhoneInput.value = preferencesData.phone_number;
        }
      }
    }
  } catch (error) {
    console.error("[CommunicationPreferences] Errore caricamento preferenze:", error);
    if (window.showToast) {
      window.showToast("Errore caricamento preferenze", "error");
    }
  }
}

/**
 * Handle save preferences
 */
async function handleSavePreferences() {
  // Verify form exists
  if (!document.getElementById("communication-preferences-form")) {
    return;
  }

  const newsletter = document.getElementById("pref-newsletter")?.checked || false;
  const sms = document.getElementById("pref-sms")?.checked || false;
  const whatsapp = document.getElementById("pref-whatsapp")?.checked || false;
  const smsPhone = document.getElementById("pref-sms-phone")?.value?.trim() || "";
  const whatsappPhone = document.getElementById("pref-whatsapp-phone")?.value?.trim() || "";

  // Validation
  if (sms && !smsPhone) {
    if (window.showToast) {
      window.showToast("Inserisci il numero di telefono per SMS", "error");
    }
    document.getElementById("pref-sms-phone")?.focus();
    return;
  }

  if (whatsapp && !whatsappPhone) {
    if (window.showToast) {
      window.showToast("Inserisci il numero WhatsApp", "error");
    }
    document.getElementById("pref-whatsapp-phone")?.focus();
    return;
  }

  // Validate phone format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (sms && smsPhone && !phoneRegex.test(smsPhone)) {
    if (window.showToast) {
      window.showToast(
        "Formato numero non valido. Usa formato internazionale (es: +39 123 456 7890)",
        "error"
      );
    }
    document.getElementById("pref-sms-phone")?.focus();
    return;
  }

  if (whatsapp && whatsappPhone && !phoneRegex.test(whatsappPhone)) {
    if (window.showToast) {
      window.showToast(
        "Formato numero non valido. Usa formato internazionale (es: +39 123 456 7890)",
        "error"
      );
    }
    document.getElementById("pref-whatsapp-phone")?.focus();
    return;
  }

  try {
    const token = localStorage.getItem("tradelia-access-token-v1");
    if (!token) {
      throw new Error("Token non disponibile");
    }

    // Determine notification method (priority: whatsapp > sms > email)
    let notificationMethod = "email";
    let phoneNumber = null;

    if (whatsapp) {
      notificationMethod = "whatsapp";
      phoneNumber = whatsappPhone;
    } else if (sms) {
      notificationMethod = "sms";
      phoneNumber = smsPhone;
    }

    // Save notification preferences
    const response = await fetch("/api/notifications?action=preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        notification_method: notificationMethod,
        phone_number: phoneNumber,
        newsletter_consent: newsletter, // TODO: Aggiungere campo in DB
        sms_consent: sms, // TODO: Aggiungere campo in DB
        whatsapp_consent: whatsapp, // TODO: Aggiungere campo in DB
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Errore salvataggio preferenze");
    }

    if (window.showToast) {
      window.showToast("Preferenze salvate con successo", "success");
    }

    // Close modal
    hideModal();
  } catch (error) {
    console.error("[CommunicationPreferences] Errore salvataggio:", error);
    if (window.showToast) {
      window.showToast(error.message || "Errore salvataggio preferenze", "error");
    }
  }
}
