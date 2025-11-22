/**
 * Dashboard Authentication Modal
 * Modale login/accesso direttamente nella dashboard
 * Evita redirect a accesso.html
 */

import { keyboardNav } from "./keyboard-nav.js";

const MODAL_ID = "auth-modal";

/**
 * Initialize auth modal
 */
export function initAuthModal() {
  createModal();
}

/**
 * Show auth modal
 * @param {string} tab - 'code' | 'login' | 'signup'
 */
export function showAuthModal(tab = "code") {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) {
    // Se modale non esiste, crealo
    createModal();
    // Riprova dopo un breve delay
    setTimeout(() => {
      showAuthModal(tab);
    }, 100);
    return;
  }

  updateModalTab(tab);

  modal.removeAttribute("aria-hidden");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  // WCAG 2.2: Screen reader announcement
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.textContent = "Modale accesso aperto. Usa Tab per navigare, Escape per chiudere.";
  document.body.appendChild(announcement);
  setTimeout(() => {
    announcement.remove();
  }, 1000);

  // Activate focus trap
  const content = modal.querySelector(".auth-modal-content");
  if (content) {
    keyboardNav.activateFocusTrap(content, {
      initialFocus:
        tab === "code" ? "#auth-code-input" : tab === "login" ? "#auth-email" : "#signup-email",
      returnFocus: true,
    });
  }
}

/**
 * Hide auth modal
 */
export function hideAuthModal() {
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
 * Create modal structure
 */
function createModal() {
  // Check if already exists
  if (document.getElementById(MODAL_ID)) {
    return;
  }

  const modal = document.createElement("div");
  modal.id = MODAL_ID;
  modal.className = "auth-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-label", "Accesso alla dashboard");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="auth-modal-overlay" aria-hidden="true"></div>
    <div class="auth-modal-content">
      <div class="auth-modal-header">
        <h2 class="auth-modal-title">Accesso alla dashboard Tradelia</h2>
        <button
          type="button"
          class="auth-modal-close"
          aria-label="Chiudi"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="auth-modal-body">
        <!-- Tab Switcher -->
        <div class="auth-modal-tabs" role="tablist">
          <button
            type="button"
            class="auth-modal-tab active"
            data-tab="code"
            role="tab"
            aria-selected="true"
            aria-controls="auth-tab-code"
            id="auth-tab-code-btn"
          >
            Codice Accesso
          </button>
          <button
            type="button"
            class="auth-modal-tab"
            data-tab="login"
            role="tab"
            aria-selected="false"
            aria-controls="auth-tab-login"
            id="auth-tab-login-btn"
          >
            Login
          </button>
          <button
            type="button"
            class="auth-modal-tab"
            data-tab="signup"
            role="tab"
            aria-selected="false"
            aria-controls="auth-tab-signup"
            id="auth-tab-signup-btn"
          >
            Registrati
          </button>
        </div>

        <!-- Tab Panels -->
        <div class="auth-modal-panels">
          <!-- Code Tab -->
          <div
            id="auth-tab-code"
            class="auth-modal-panel active"
            role="tabpanel"
            aria-labelledby="auth-tab-code-btn"
          >
            <p class="auth-modal-intro">
              Inserisci il codice di accesso ricevuto via email. Puoi richiederlo gratuitamente dal modulo Richiedilo direttamente nella dashboard PWA installabile.
            </p>
            <form id="auth-code-form" class="auth-modal-form" novalidate>
              <div class="auth-form-group">
                <label for="auth-code-input" class="auth-form-label">
                  Codice di accesso
                </label>
                <input
                  type="password"
                  id="auth-code-input"
                  name="code"
                  class="auth-form-input"
                  placeholder="Incolla qui il codice Tradelia"
                  autocomplete="off"
                  required
                />
              </div>
              <div class="auth-form-actions">
                <button type="submit" class="btn btn-primary">
                  Accedi
                </button>
                <button type="button" class="btn btn-secondary" id="auth-code-request">
                  Richiedi codice
                </button>
              </div>
            </form>
          </div>

          <!-- Login Tab -->
          <div
            id="auth-tab-login"
            class="auth-modal-panel"
            role="tabpanel"
            aria-labelledby="auth-tab-login-btn"
          >
            <p class="auth-modal-intro">
              Accedi con email e password.
            </p>
            <form id="auth-login-form" class="auth-modal-form" novalidate>
              <div class="auth-form-group">
                <label for="auth-email" class="auth-form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="auth-email"
                  name="email"
                  class="auth-form-input"
                  placeholder="nome@esempio.com"
                  autocomplete="email"
                  required
                />
              </div>
              <div class="auth-form-group">
                <label for="auth-password" class="auth-form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="auth-password"
                  name="password"
                  class="auth-form-input"
                  placeholder="Inserisci la password"
                  autocomplete="current-password"
                  required
                />
              </div>
              <div class="auth-form-actions">
                <button type="submit" class="btn btn-primary">
                  Accedi
                </button>
                <button type="button" class="btn btn-link" id="auth-forgot-password">
                  Password dimenticata?
                </button>
              </div>
            </form>
          </div>

          <!-- Signup Tab -->
          <div
            id="auth-tab-signup"
            class="auth-modal-panel"
            role="tabpanel"
            aria-labelledby="auth-tab-signup-btn"
          >
            <p class="auth-modal-intro">
              Crea un account per accedere a tutte le funzionalità.
            </p>
            <form id="auth-signup-form" class="auth-modal-form" novalidate>
              <div class="auth-form-group">
                <label for="signup-email" class="auth-form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="signup-email"
                  name="email"
                  class="auth-form-input"
                  placeholder="nome@esempio.com"
                  autocomplete="email"
                  required
                />
              </div>
              <div class="auth-form-group">
                <label for="signup-password" class="auth-form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="signup-password"
                  name="password"
                  class="auth-form-input"
                  placeholder="Minimo 12 caratteri"
                  autocomplete="new-password"
                  required
                  minlength="12"
                />
              </div>
              <div class="auth-form-group">
                <label for="signup-password-confirm" class="auth-form-label">
                  Conferma Password
                </label>
                <input
                  type="password"
                  id="signup-password-confirm"
                  name="password-confirm"
                  class="auth-form-input"
                  placeholder="Ripeti la password"
                  autocomplete="new-password"
                  required
                />
              </div>
              <div class="auth-form-group">
                <label class="auth-form-checkbox">
                  <input
                    type="checkbox"
                    id="signup-privacy"
                    name="privacy"
                    required
                  />
                  <span>
                    Accetto la <a href="/privacy.html" target="_blank" rel="noopener noreferrer">privacy policy</a>
                  </span>
                </label>
              </div>
              <div class="auth-form-actions">
                <button type="submit" class="btn btn-primary">
                  Registrati
                </button>
              </div>
            </form>
          </div>
        </div>
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

  const overlay = modal.querySelector(".auth-modal-overlay");
  const closeBtn = modal.querySelector(".auth-modal-close");
  const tabs = modal.querySelectorAll(".auth-modal-tab");
  const codeForm = document.getElementById("auth-code-form");
  const loginForm = document.getElementById("auth-login-form");
  const signupForm = document.getElementById("auth-signup-form");

  // Close handlers
  const closeModal = () => {
    hideAuthModal();
  };

  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("aria-hidden")) {
      closeModal();
    }
  });

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // Form submissions
  if (codeForm) {
    codeForm.addEventListener("submit", handleCodeSubmit);
  }
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignupSubmit);
  }

  // Request code button
  const requestCodeBtn = document.getElementById("auth-code-request");
  if (requestCodeBtn) {
    requestCodeBtn.addEventListener("click", () => {
      // TODO: Aprire modale richiesta codice o reindirizzare
      if (window.showToast) {
        window.showToast("Funzionalità in arrivo", "info");
      }
    });
  }
}

/**
 * Switch tab
 */
function switchTab(tabName) {
  // Update tabs
  const tabs = document.querySelectorAll(".auth-modal-tab");
  const panels = document.querySelectorAll(".auth-modal-panel");

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  panels.forEach((panel) => {
    const isActive = panel.id === `auth-tab-${tabName}`;
    panel.classList.toggle("active", isActive);
  });

  // Focus first input in active panel
  const activePanel = document.getElementById(`auth-tab-${tabName}`);
  if (activePanel) {
    const firstInput = activePanel.querySelector("input");
    if (firstInput) {
      setTimeout(() => {
        firstInput.focus();
      }, 100);
    }
  }
}

/**
 * Update modal tab (called from outside)
 */
function updateModalTab(tabName) {
  switchTab(tabName);
}

/**
 * Handle code form submit
 */
async function handleCodeSubmit(e) {
  e.preventDefault();
  const codeInput = document.getElementById("auth-code-input");
  const code = codeInput?.value?.trim();

  if (!code) {
    if (window.showToast) {
      window.showToast("Inserisci un codice di accesso", "error");
    }
    codeInput?.focus();
    return;
  }

  try {
    const response = await fetch("/api/auth?action=validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: code }),
    });

    const data = await response.json();

    if (data.ok) {
      // Save token
      localStorage.setItem("tradelia-access-token-v1", code);
      if (window.showToast) {
        window.showToast("Accesso riuscito!", "success");
      }
      hideAuthModal();
      // Reload page to update banner
      window.location.reload();
    } else {
      if (window.showToast) {
        window.showToast(data.error || "Codice non valido", "error");
      }
      codeInput?.focus();
    }
  } catch (error) {
    console.error("[AuthModal] Errore validazione codice:", error);
    if (window.showToast) {
      window.showToast("Errore di connessione. Riprova.", "error");
    }
  }
}

/**
 * Handle login form submit
 */
async function handleLoginSubmit(e) {
  e.preventDefault();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const form = e.target;
  if (window.showToast) {
    window.showToast("Funzionalità login in arrivo", "info");
  }
  // TODO: Implementare login email/password
}

/**
 * Handle signup form submit
 */
async function handleSignupSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const passwordConfirmInput = document.getElementById("signup-password-confirm");
  const privacyCheckbox = document.getElementById("signup-privacy");

  const email = emailInput?.value?.trim() || "";
  const password = passwordInput?.value || "";
  const passwordConfirm = passwordConfirmInput?.value || "";
  const privacyAccepted = privacyCheckbox?.checked || false;

  // Validation
  if (!email) {
    if (window.showToast) {
      window.showToast("Inserisci un'email", "error");
    }
    emailInput?.focus();
    return;
  }

  if (!password || password.length < 12) {
    if (window.showToast) {
      window.showToast("Password deve essere di almeno 12 caratteri", "error");
    }
    passwordInput?.focus();
    return;
  }

  if (password !== passwordConfirm) {
    if (window.showToast) {
      window.showToast("Le password non corrispondono", "error");
    }
    passwordConfirmInput?.focus();
    return;
  }

  if (!privacyAccepted) {
    if (window.showToast) {
      window.showToast("Devi accettare la privacy policy", "error");
    }
    privacyCheckbox?.focus();
    return;
  }

  // Disable form
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrazione in corso...";
  }

  try {
    const response = await fetch("/api/auth-signup-login?action=signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        passwordConfirm,
        privacyAccepted,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Errore durante la registrazione");
    }

    // Save token
    if (data.token) {
      localStorage.setItem("tradelia-access-token-v1", data.token);
      if (window.showToast) {
        window.showToast("Registrazione completata! Accesso in corso...", "success");
      }
      hideAuthModal();
      // Reload page to update banner
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      if (window.showToast) {
        window.showToast(
          data.message || "Registrazione completata. Controlla la tua email.",
          "success"
        );
      }
      hideAuthModal();
    }
  } catch (error) {
    console.error("[AuthModal] Errore registrazione:", error);
    if (window.showToast) {
      window.showToast(error.message || "Errore durante la registrazione", "error");
    }
    // Re-enable form
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Registrati";
    }
  }
}
