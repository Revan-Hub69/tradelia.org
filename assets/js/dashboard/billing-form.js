/* eslint-env browser */
/**
 * Billing Data Form Component
 * Raccoglie dati fatturazione (individual o business) prima del checkout
 */

/**
 * Mostra modale raccolta dati fatturazione
 * @param {string} _orderType - Tipo ordine
 * @param {number} _amount - Importo
 * @returns {Promise<object>} Dati fatturazione raccolti
 */
export async function showBillingForm(_orderType, _amount) {
  return new Promise((resolve, reject) => {
    // Crea modale se non esiste
    let modal = document.getElementById("billing-modal");
    if (!modal) {
      modal = createBillingModal();
      document.body.appendChild(modal);
    }

    // Reset form
    const form = modal.querySelector("#billing-form");
    if (form) {
      form.reset();
      // Reset user type
      const individualRadio = form.querySelector("#billing-type-individual");
      const businessRadio = form.querySelector("#billing-type-business");
      if (individualRadio) {
        individualRadio.checked = true;
      }
      if (businessRadio) {
        businessRadio.checked = false;
      }
      toggleBusinessFields(form, false);
    }

    // Mostra modale
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Bind event listeners
    bindBillingFormEvents(modal, resolve, reject);
  });
}

/**
 * Crea modale billing form
 */
function createBillingModal() {
  const modal = document.createElement("div");
  modal.id = "billing-modal";
  modal.className = "billing-modal";
  modal.innerHTML = `
    <div class="billing-modal-overlay"></div>
    <div class="billing-modal-content">
      <button type="button" class="billing-modal-close" aria-label="Chiudi">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <h2 class="billing-modal-title">Dati Fatturazione</h2>
      <p class="billing-modal-subtitle">Inserisci i dati per la fatturazione</p>
      
      <form id="billing-form" class="billing-form" novalidate>
        <!-- Tipo Utente -->
        <div class="billing-field-group">
          <label class="billing-label">Tipo Fatturazione</label>
          <div class="billing-radio-group">
            <label class="billing-radio-label">
              <input type="radio" name="user_type" id="billing-type-individual" value="individual" checked>
              <span>Privato</span>
            </label>
            <label class="billing-radio-label">
              <input type="radio" name="user_type" id="billing-type-business" value="business">
              <span>Azienda</span>
            </label>
          </div>
        </div>

        <!-- Email (sempre richiesta) -->
        <div class="billing-field-group">
          <label for="billing-email" class="billing-label">Email *</label>
          <input
            type="email"
            id="billing-email"
            name="email"
            class="billing-input"
            required
            autocomplete="email"
            placeholder="email@esempio.com"
          />
        </div>

        <!-- Campi Individual -->
        <div id="billing-individual-fields" class="billing-field-group">
          <div class="billing-field-row">
            <div class="billing-field-col">
              <label for="billing-firstname" class="billing-label">Nome</label>
              <input
                type="text"
                id="billing-firstname"
                name="firstname"
                class="billing-input"
                autocomplete="given-name"
              />
            </div>
            <div class="billing-field-col">
              <label for="billing-lastname" class="billing-label">Cognome</label>
              <input
                type="text"
                id="billing-lastname"
                name="lastname"
                class="billing-input"
                autocomplete="family-name"
              />
            </div>
          </div>
        </div>

        <!-- Campi Business -->
        <div id="billing-business-fields" class="billing-field-group" style="display: none;">
          <div class="billing-field-group">
            <label for="billing-business-name" class="billing-label">Ragione Sociale *</label>
            <input
              type="text"
              id="billing-business-name"
              name="business_name"
              class="billing-input"
              placeholder="Nome Azienda S.r.l."
            />
          </div>

          <div class="billing-field-row">
            <div class="billing-field-col">
              <label for="billing-business-country" class="billing-label">Paese *</label>
              <select
                id="billing-business-country"
                name="business_country"
                class="billing-input"
              >
                <option value="IT">Italia</option>
                <option value="FR">Francia</option>
                <option value="DE">Germania</option>
                <option value="ES">Spagna</option>
                <option value="GB">Regno Unito</option>
                <option value="US">Stati Uniti</option>
                <option value="OTHER">Altro</option>
              </select>
            </div>
            <div class="billing-field-col">
              <label for="billing-business-vat" class="billing-label">Partita IVA</label>
              <input
                type="text"
                id="billing-business-vat"
                name="business_vat"
                class="billing-input"
                placeholder="IT12345678901"
              />
            </div>
          </div>

          <div class="billing-field-group">
            <label for="billing-business-address" class="billing-label">Indirizzo</label>
            <input
              type="text"
              id="billing-business-address"
              name="business_address"
              class="billing-input"
              autocomplete="street-address"
              placeholder="Via, numero civico"
            />
          </div>

          <div class="billing-field-row">
            <div class="billing-field-col">
              <label for="billing-business-city" class="billing-label">Città</label>
              <input
                type="text"
                id="billing-business-city"
                name="business_city"
                class="billing-input"
                autocomplete="address-level2"
              />
            </div>
            <div class="billing-field-col">
              <label for="billing-business-zip" class="billing-label">CAP</label>
              <input
                type="text"
                id="billing-business-zip"
                name="business_zip"
                class="billing-input"
                autocomplete="postal-code"
              />
            </div>
          </div>

          <div class="billing-field-group">
            <label class="billing-label">Referente Aziendale</label>
            <div class="billing-field-row">
              <div class="billing-field-col">
                <input
                  type="text"
                  id="billing-contact-firstname"
                  name="business_contact_firstname"
                  class="billing-input"
                  placeholder="Nome"
                />
              </div>
              <div class="billing-field-col">
                <input
                  type="text"
                  id="billing-contact-lastname"
                  name="business_contact_lastname"
                  class="billing-input"
                  placeholder="Cognome"
                />
              </div>
            </div>
            <input
              type="email"
              id="billing-contact-email"
              name="business_contact_email"
              class="billing-input"
              style="margin-top: 0.5rem;"
              placeholder="Email referente (opzionale)"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div id="billing-error" class="billing-error" style="display: none;"></div>

        <!-- Actions -->
        <div class="billing-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="billing-cancel">Annulla</button>
          <button type="submit" class="btn btn-primary btn-sm" id="billing-submit">Continua</button>
        </div>
      </form>
    </div>
  `;

  return modal;
}

/**
 * Bind event listeners per form
 */
function bindBillingFormEvents(modal, resolve, reject) {
  const form = modal.querySelector("#billing-form");
  const closeBtn = modal.querySelector(".billing-modal-close");
  const overlay = modal.querySelector(".billing-modal-overlay");
  const cancelBtn = modal.querySelector("#billing-cancel");
  const individualRadio = form.querySelector("#billing-type-individual");
  const businessRadio = form.querySelector("#billing-type-business");

  // Toggle business fields
  if (individualRadio) {
    individualRadio.addEventListener("change", () => {
      toggleBusinessFields(form, false);
    });
  }
  if (businessRadio) {
    businessRadio.addEventListener("change", () => {
      toggleBusinessFields(form, true);
    });
  }

  // Close handlers
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    reject(new Error("Form annullato"));
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeModal);
  }

  // Escape key
  const escapeHandler = (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  };
  document.addEventListener("keydown", escapeHandler);

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorEl = modal.querySelector("#billing-error");
    const submitBtn = modal.querySelector("#billing-submit");

    // Validazione
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Validazione business
    const userType = form.querySelector('input[name="user_type"]:checked')?.value;
    if (userType === "business") {
      const businessName = form.querySelector("#billing-business-name").value;
      const businessCountry = form.querySelector("#billing-business-country").value;
      if (!businessName || !businessCountry) {
        if (errorEl) {
          errorEl.textContent =
            "Ragione sociale e paese sono obbligatori per fatturazione business";
          errorEl.style.display = "block";
        }
        return;
      }
    }

    // Prepara dati
    const formData = new FormData(form);
    const billingData = {
      user_type: userType,
      email: formData.get("email"),
    };

    if (userType === "individual") {
      billingData.business_contact_firstname = formData.get("firstname") || null;
      billingData.business_contact_lastname = formData.get("lastname") || null;
    } else {
      billingData.business_name = formData.get("business_name");
      billingData.business_country = formData.get("business_country");
      billingData.business_vat = formData.get("business_vat") || null;
      billingData.business_address = formData.get("business_address") || null;
      billingData.business_city = formData.get("business_city") || null;
      billingData.business_zip = formData.get("business_zip") || null;
      billingData.business_contact_firstname = formData.get("business_contact_firstname") || null;
      billingData.business_contact_lastname = formData.get("business_contact_lastname") || null;
      billingData.business_contact_email =
        formData.get("business_contact_email") || billingData.email;
    }

    // Salva dati (se utente autenticato)
    const token = localStorage.getItem("tradelia-access-token-v1");
    if (token) {
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Salvataggio...";

        await fetch("/api/orders.js?action=save-billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, billing_data: billingData }),
        });

        submitBtn.textContent = "Continua";
      } catch (error) {
        console.error("[Billing Form] Errore salvataggio dati:", error);
        // Non blocchiamo, continua comunque
      } finally {
        submitBtn.disabled = false;
      }
    }

    // Chiudi modale e risolvi promise
    modal.classList.remove("active");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", escapeHandler);
    resolve(billingData);
  });
}

/**
 * Toggle visibilità campi business
 */
function toggleBusinessFields(form, show) {
  const businessFields = form.querySelector("#billing-business-fields");
  const individualFields = form.querySelector("#billing-individual-fields");

  if (businessFields) {
    businessFields.style.display = show ? "block" : "none";
    // Required fields
    const businessName = businessFields.querySelector("#billing-business-name");
    const businessCountry = businessFields.querySelector("#billing-business-country");
    if (businessName) {
      businessName.required = show;
    }
    if (businessCountry) {
      businessCountry.required = show;
    }
  }

  if (individualFields) {
    individualFields.style.display = show ? "none" : "block";
  }
}
