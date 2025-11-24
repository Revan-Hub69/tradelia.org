/**
 * Dashboard Authentication Modal
 * Modale login/accesso direttamente nella dashboard
 * Evita redirect a accesso.html
 */

import { keyboardNav } from "./keyboard-nav.js";
import { safeLog } from "./security-utils.js";

const MODAL_ID = "auth-modal";
const SUPPORT_EMAIL = "support@tradelia.org";
const QUICK_ASSIST_SLA_MINUTES = 15;

/**
 * Initialize auth modal
 */
export function initAuthModal() {
  createModal();
}

/**
 * Show auth modal
 * @param {string} tab - 'login' | 'signup'
 */
export function showAuthModal(tab = "login") {
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
      initialFocus: tab === "signup" ? "#signup-email" : "#auth-email",
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
        <div class="auth-modal-context">
          <p class="auth-modal-intro">
            Tradelia usa AI con metodo accademico, applicando Spaced Repetition (Ebbinghaus, 1885),
            Retrieval Practice (Roediger & Karpicke, 2006) e Metacognition (Zimmerman, 2002) per percorsi chiari, verificabili e adatti al retail. Non gestiamo capitali: guidiamo studio autonomo, analisi automatizzate e verifiche digitali.
          </p>
          <div class="auth-context-tags" aria-label="Pilastri metodologici">
            <span class="auth-context-tag">Spaced Repetition</span>
            <span class="auth-context-tag">Retrieval Practice</span>
            <span class="auth-context-tag">Metacognition</span>
            <span class="auth-context-tag">Learning Analytics</span>
          </div>
          <ul class="auth-value-list">
            <li>Esami automatizzati con feedback formativo e rubriche Bloom.</li>
            <li>Dashboard MiFID-ready con analytics e check di appropriatezza.</li>
            <li>Linguaggio semplice, metodo rigoroso e audit continuo.</li>
          </ul>
          <div class="auth-plan-overview" aria-label="Panoramica servizi">
            <div class="auth-plan-pill">
              <strong>Base</strong>
              <span>Accesso gratuito, percorsi introduttivi e alert educativi giornalieri.</span>
            </div>
            <div class="auth-plan-pill">
              <strong>Pro</strong>
              <span>Analisi avanzate, community moderata, tutor AI e report certificabili.</span>
            </div>
            <div class="auth-plan-pill">
              <strong>Desk</strong>
              <span>Servizi istituzionali, checklist MiFID, audit completo e onboarding team.</span>
            </div>
          </div>
          <p class="auth-compliance-note">
            Allineato a NIST 800-63B, MiFID II / ESMA, WCAG 2.2 AA e paper accademici 2015-2025.
          </p>
        </div>

        <!-- Tab Switcher -->
        <div class="auth-modal-tabs" role="tablist">
          <button
            type="button"
            class="auth-modal-tab active"
            data-tab="login"
            role="tab"
            aria-selected="true"
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
            Crea account
          </button>
        </div>

        <!-- Tab Panels -->
        <div class="auth-modal-panels">
          <!-- Login Tab -->
          <div
            id="auth-tab-login"
            class="auth-modal-panel active"
            role="tabpanel"
            aria-labelledby="auth-tab-login-btn"
          >
            <p class="auth-modal-intro">
              Accedi con email e password per proseguire i tuoi percorsi.
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
                  aria-invalid="false"
                  aria-describedby="auth-email-error"
                  autocomplete="email"
                  required
                />
              </div>
              <div class="auth-form-group">
                <label for="auth-password" class="auth-form-label">
                  Password
                </label>
                <div class="auth-password-wrapper">
                  <input
                    type="password"
                    id="auth-password"
                    name="password"
                    class="auth-form-input"
                    placeholder="Inserisci la password"
                    autocomplete="current-password"
                    required
                    aria-invalid="false"
                    aria-describedby="auth-password-error"
                  />
                  <button
                    type="button"
                    class="auth-password-toggle"
                    aria-label="Mostra password"
                    data-target="auth-password"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                <div id="auth-rate-limit" class="auth-rate-limit" aria-live="polite"></div>
              </div>
              <div class="auth-form-actions">
                <button type="submit" class="btn btn-primary">
                  Accedi
                </button>
                <button type="button" class="btn btn-link" id="auth-forgot-password">
                  Password dimenticata?
                </button>
              </div>
              <div class="auth-support-actions" aria-live="polite">
                <p class="auth-support-text">
                  Supporto umano certificato: risposta media 12 minuti, 7 giorni su 7. Se il reset non arriva,
                  possiamo verificare manualmente e riattivare l’accesso.
                </p>
                <button type="button" class="btn btn-ghost" id="auth-quick-assist">
                  Richiedi assistenza rapida
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
              Crea un account gratuito. Potrai attivare in seguito i servizi Pro o Desk.
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
                <div id="signup-email-validation" class="auth-email-validation" aria-live="polite"></div>
              </div>
              <div class="auth-form-group">
                <label for="signup-password" class="auth-form-label">
                  Password
                </label>
                <div class="auth-password-wrapper">
                  <input
                    type="password"
                    id="signup-password"
                    name="password"
                    class="auth-form-input"
                    placeholder="Minimo 12 caratteri"
                    autocomplete="new-password"
                    required
                    minlength="12"
                    aria-invalid="false"
                    aria-describedby="signup-password-error signup-password-strength"
                  />
                  <button
                    type="button"
                    class="auth-password-toggle"
                    aria-label="Mostra password"
                    data-target="signup-password"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                <div id="signup-password-strength" class="auth-password-strength" aria-live="polite">
                  <div class="auth-password-strength-bar">
                    <div class="auth-password-strength-fill" style="width: 0%"></div>
                  </div>
                  <div class="auth-password-strength-text">Inserisci almeno 12 caratteri</div>
                </div>
              </div>
              <div class="auth-form-group">
                <label for="signup-password-confirm" class="auth-form-label">
                  Conferma Password
                </label>
                <div class="auth-password-wrapper">
                  <input
                    type="password"
                    id="signup-password-confirm"
                    name="password-confirm"
                    class="auth-form-input"
                    placeholder="Ripeti la password"
                    autocomplete="new-password"
                    required
                    aria-invalid="false"
                    aria-describedby="signup-password-confirm-error signup-password-match"
                  />
                  <button
                    type="button"
                    class="auth-password-toggle"
                    aria-label="Mostra password"
                    data-target="signup-password-confirm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                <span class="auth-form-error" id="signup-password-confirm-error" role="alert" hidden></span>
                <div id="signup-password-match" class="auth-password-match" aria-live="polite"></div>
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
                    Accetto la <button type="button" class="link-button" onclick="if(window.openLegalOverlay){window.openLegalOverlay('privacy',false);}else{setTimeout(()=>{if(window.openLegalOverlay)window.openLegalOverlay('privacy',false);},400);}" style="background:none;border:none;padding:0;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;">privacy policy</button>
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
  const loginForm = document.getElementById("auth-login-form");
  const signupForm = document.getElementById("auth-signup-form");
  const quickAssistBtn = document.getElementById("auth-quick-assist");

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
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignupSubmit);
  }
  if (quickAssistBtn) {
    quickAssistBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showAssistModal();
    });
  }

  // Real-time validation (deferred to ensure DOM is ready)
  setTimeout(() => {
    setupRealTimeValidation();
    setupPasswordToggles();
    setupKeyboardAdjustment(); // BEST PRACTICE: Keyboard viewport adjustment
  }, 100);
}

/**
 * Setup keyboard viewport adjustment for mobile
 */
function setupKeyboardAdjustment() {
  if (window.innerWidth > 768) {
    return;
  } // Solo su mobile

  const inputs = document.querySelectorAll(".auth-modal input");
  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    });
  });
}

/**
 * Show field error
 */
function showFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);

  if (input) {
    input.setAttribute("aria-invalid", "true");
    input.classList.add("error");
  }

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
}

/**
 * Clear field error
 */
function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);

  if (input) {
    input.removeAttribute("aria-invalid");
    input.classList.remove("error");
  }

  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
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
 * Handle login form submit
 */
async function handleLoginSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const rateLimitDiv = document.getElementById("auth-rate-limit");

  const email = emailInput?.value?.trim() || "";
  const password = passwordInput?.value || "";

  // Validation
  if (!email) {
    if (window.showToast) {
      window.showToast("Inserisci un'email", "error");
    }
    emailInput?.focus();
    return;
  }

  if (!password) {
    if (window.showToast) {
      window.showToast("Inserisci la password", "error");
    }
    passwordInput?.focus();
    return;
  }

  // Disable form and show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  const emailErrorEl = document.getElementById("auth-email-error");
  const passwordErrorEl = document.getElementById("auth-password-error");
  
  // Clear previous errors
  if (emailErrorEl) {
    emailErrorEl.textContent = "";
    emailErrorEl.hidden = true;
  }
  if (passwordErrorEl) {
    passwordErrorEl.textContent = "";
    passwordErrorEl.hidden = true;
  }
  emailInput?.setAttribute("aria-invalid", "false");
  passwordInput?.setAttribute("aria-invalid", "false");
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Accesso in corso...";
    submitBtn.setAttribute("aria-busy", "true");
  }

  try {
    const response = await fetch("/api/auth?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      // Update rate limit display
      if (data.remaining !== undefined && rateLimitDiv) {
        if (data.locked) {
          rateLimitDiv.className = "auth-rate-limit error";
          rateLimitDiv.textContent = `Account bloccato. Riprova tra ${data.minutesRemaining || 15} minuti.`;
        } else {
          rateLimitDiv.className = "auth-rate-limit warning";
          rateLimitDiv.textContent = `Tentativi rimanenti: ${data.remaining || 0}/5`;
        }
      }

      // SECURITY: Messaggi di errore generici (non rivelare se email esiste)
      if (data.emailNotVerified) {
        if (window.showToast) {
          window.showToast(
            "Verifica la tua email prima di accedere. Controlla la casella email.",
            "error"
          );
        }
      } else {
        // Messaggio generico per non rivelare informazioni
        if (window.showToast) {
          window.showToast("Credenziali non valide. Riprova.", "error");
        }
      }
      passwordInput?.focus();
      // Re-enable form
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Accedi";
        submitBtn.removeAttribute("aria-busy");
      }
      return;
    }

    // Save token - BEST PRACTICE: Use secure token storage
    if (data.token) {
      const { saveToken } = await import("./token-storage.js");
      await saveToken(data.token, data.refreshToken || null);
      if (window.showToast) {
        window.showToast("Accesso riuscito!", "success");
      }
      hideAuthModal();
      // Reload page to update banner
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    safeLog("error", "[AuthModal] Errore login:", error);
    if (window.showToast) {
      window.showToast("Errore di connessione. Riprova.", "error");
    }
    // Re-enable form
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Accedi";
    }
  }
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

  // Disable form and show loading
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Clear previous errors
  const emailErrorEl = document.getElementById("signup-email-validation");
  const passwordErrorEl = document.getElementById("signup-password-confirm-error");
  if (emailErrorEl) {
    emailErrorEl.className = "auth-email-validation";
    emailErrorEl.textContent = "";
  }
  if (passwordErrorEl) {
    passwordErrorEl.textContent = "";
    passwordErrorEl.hidden = true;
  }
  emailInput?.setAttribute("aria-invalid", "false");
  passwordInput?.setAttribute("aria-invalid", "false");
  passwordConfirmInput?.setAttribute("aria-invalid", "false");
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrazione in corso...";
    submitBtn.setAttribute("aria-busy", "true");
  }

  try {
    const response = await fetch("/api/auth?action=signup", {
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

    // BEST PRACTICE: Email verification required
    if (data.emailSent && !data.token) {
      if (window.showToast) {
        window.showToast(
          "Registrazione completata! Verifica la tua email per attivare l'account.",
          "success"
        );
      }
      hideAuthModal();
      // Mostra messaggio informativo
      setTimeout(() => {
        if (window.showToast) {
          window.showToast("Controlla la tua casella email per il link di verifica", "info");
        }
      }, 2000);
    } else if (data.token) {
      // Token restituito direttamente (fallback) - BEST PRACTICE: Use secure token storage
      const { saveToken } = await import("./token-storage.js");
      await saveToken(data.token, data.refreshToken || null);
      if (window.showToast) {
        window.showToast("Registrazione completata! Accesso in corso...", "success");
      }
      hideAuthModal();
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
    safeLog("error", "[AuthModal] Errore registrazione:", error);
    if (window.showToast) {
      window.showToast(error.message || "Errore durante la registrazione", "error");
    }
    // Re-enable form
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Registrati";
      submitBtn.removeAttribute("aria-busy");
    }
  }
}

// ===== REAL-TIME VALIDATION =====
function setupRealTimeValidation() {
  // Email validation (signup)
  const signupEmailInput = document.getElementById("signup-email");
  const signupEmailValidation = document.getElementById("signup-email-validation");
  if (signupEmailInput && signupEmailValidation) {
    let emailCheckTimeout;
    signupEmailInput.addEventListener("input", () => {
      clearTimeout(emailCheckTimeout);
      const email = signupEmailInput.value.trim();

      if (!email) {
        signupEmailValidation.textContent = "";
        signupEmailValidation.className = "auth-email-validation";
        return;
      }

      // Basic email format validation
      if (!validateEmail(email)) {
        signupEmailValidation.textContent = "Formato email non valido";
        signupEmailValidation.className = "auth-email-validation error";
        return;
      }

      // Debounce email availability check
      emailCheckTimeout = setTimeout(async () => {
        const available = await checkEmailAvailability(email);
        if (available === true) {
          signupEmailValidation.textContent = "✓ Email disponibile";
          signupEmailValidation.className = "auth-email-validation success";
        } else if (available === false) {
          signupEmailValidation.textContent = "Email già registrata";
          signupEmailValidation.className = "auth-email-validation error";
        }
      }, 500);
    });
  }

  // Password strength (signup)
  const signupPasswordInput = document.getElementById("signup-password");
  const passwordStrengthDiv = document.getElementById("signup-password-strength");
  if (signupPasswordInput && passwordStrengthDiv) {
    signupPasswordInput.addEventListener("input", () => {
      updatePasswordStrength(signupPasswordInput.value, passwordStrengthDiv);
    });
  }

  // Password match (signup)
  const signupPasswordConfirmInput = document.getElementById("signup-password-confirm");
  const passwordMatchDiv = document.getElementById("signup-password-match");
  if (signupPasswordInput && signupPasswordConfirmInput && passwordMatchDiv) {
    signupPasswordConfirmInput.addEventListener("input", () => {
      updatePasswordMatch(
        signupPasswordInput.value,
        signupPasswordConfirmInput.value,
        passwordMatchDiv
      );
    });
    signupPasswordInput.addEventListener("input", () => {
      updatePasswordMatch(
        signupPasswordInput.value,
        signupPasswordConfirmInput.value,
        passwordMatchDiv
      );
    });
  }

  // Forgot password handler
  const forgotPasswordBtn = document.getElementById("auth-forgot-password");
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", handleResetPasswordRequest);
  }
}

// ===== PASSWORD TOGGLES =====
function setupPasswordToggles() {
  const toggles = document.querySelectorAll(".auth-password-toggle");
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        togglePasswordVisibility(targetInput, toggle);
      }
    });
  });
}

// ===== VALIDATION HELPERS =====
/**
 * Valida formato email (RFC 5322 compliant - semplificato)
 * BEST PRACTICE: Validazione robusta ma non eccessivamente restrittiva
 */
function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  // Trim e lowercase
  const trimmed = email.trim().toLowerCase();
  
  // Regex migliorata (RFC 5322 compliant semplificato)
  // Permette caratteri validi ma evita pattern pericolosi
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
  
  // Validazioni aggiuntive
  if (trimmed.length > 254) return false; // RFC 5321 limit
  if (trimmed.length < 5) return false; // Min: a@b.c
  if (trimmed.includes("..")) return false; // No consecutive dots
  if (trimmed.startsWith(".") || trimmed.endsWith(".")) return false; // No leading/trailing dot
  if (trimmed.startsWith("@") || trimmed.endsWith("@")) return false; // No leading/trailing @
  
  return emailRegex.test(trimmed);
}

async function checkEmailAvailability(email) {
  try {
    const response = await fetch("/api/auth?action=check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.ok) {
      return data.available;
    }
    return null;
  } catch (error) {
    safeLog("error", "[AuthModal] Errore check email:", error);
    return null;
  }
}

/**
 * Aggiorna indicatore password strength con feedback dettagliato
 * BEST PRACTICE: Feedback informativo per migliorare UX (NIST 800-63B)
 */
function updatePasswordStrength(password, container) {
  const fill = container.querySelector(".auth-password-strength-fill");
  const text = container.querySelector(".auth-password-strength-text");

  if (!password) {
    fill.style.width = "0%";
    text.textContent = "Inserisci almeno 12 caratteri";
    container.className = "auth-password-strength";
    return;
  }

  let strength = 0;
  let strengthText = "";
  let strengthClass = "";
  const suggestions = [];

  // Length checks
  if (password.length >= 12) {
    strength += 25;
  } else {
    suggestions.push(`Aggiungi ${12 - password.length} caratteri`);
  }
  
  if (password.length >= 16) {
    strength += 10;
  }
  
  if (password.length >= 20) {
    strength += 5;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    strength += 15;
  } else {
    suggestions.push("Aggiungi lettere minuscole");
  }
  
  if (/[A-Z]/.test(password)) {
    strength += 15;
  } else {
    suggestions.push("Aggiungi lettere maiuscole");
  }
  
  if (/[0-9]/.test(password)) {
    strength += 15;
  } else {
    suggestions.push("Aggiungi numeri");
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength += 20;
  } else {
    suggestions.push("Aggiungi simboli (!@#$%...)");
  }

  // Common patterns check (reduce strength)
  const commonPatterns = [
    /12345/,
    /password/i,
    /qwerty/i,
    /abcde/i,
    /(.)\1{3,}/, // Repeated characters
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    strength = Math.max(0, strength - 20);
    suggestions.push("Evita pattern comuni");
  }

  // Determine strength level
  if (strength < 40) {
    strengthText = "Debole";
    strengthClass = "weak";
  } else if (strength < 70) {
    strengthText = "Media";
    strengthClass = "medium";
  } else {
    strengthText = "Forte";
    strengthClass = "strong";
  }

  // Add suggestions to text if weak/medium
  if (strength < 70 && suggestions.length > 0) {
    strengthText += ` • ${suggestions[0]}`;
  }

  fill.style.width = `${Math.min(strength, 100)}%`;
  text.textContent = strengthText;
  container.className = `auth-password-strength ${strengthClass}`;
}

function updatePasswordMatch(password, passwordConfirm, container) {
  if (!passwordConfirm) {
    container.textContent = "";
    container.className = "auth-password-match";
    return;
  }

  if (password === passwordConfirm) {
    container.textContent = "✓ Le password corrispondono";
    container.className = "auth-password-match success";
  } else {
    container.textContent = "Le password non corrispondono";
    container.className = "auth-password-match error";
  }
}

function togglePasswordVisibility(input, toggle) {
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  toggle.setAttribute("aria-label", isPassword ? "Nascondi password" : "Mostra password");

  // Update icon (simple toggle - you might want to use different icons)
  const svg = toggle.querySelector("svg");
  if (svg) {
    if (isPassword) {
      // Show eye-off icon (simplified - you might want to use a proper icon)
      svg.innerHTML = `
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      `;
    } else {
      // Show eye icon
      svg.innerHTML = `
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      `;
    }
  }
}

// ===== RESET PASSWORD REQUEST =====
async function handleResetPasswordRequest() {
  const emailInput = document.getElementById("auth-email");
  const email = emailInput?.value?.trim() || "";

  if (!email) {
    if (window.showToast) {
      window.showToast("Inserisci la tua email per reimpostare la password", "error");
    }
    emailInput?.focus();
    return;
  }

  if (!validateEmail(email)) {
    if (window.showToast) {
      window.showToast("Formato email non valido", "error");
    }
    emailInput?.focus();
    return;
  }

  // Disable button during request
  const forgotPasswordBtn = document.getElementById("auth-forgot-password");
  if (forgotPasswordBtn) {
    forgotPasswordBtn.disabled = true;
    forgotPasswordBtn.textContent = "Invio in corso...";
  }

  try {
    const response = await fetch("/api/auth?action=reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (data.ok) {
      if (window.showToast) {
        window.showToast(
          data.message || "Se l'email esiste, ti abbiamo inviato le istruzioni per reimpostare la password. Controlla la tua casella email.",
          "success"
        );
      }
      // Clear email field for security
      if (emailInput) {
        emailInput.value = "";
      }
    } else {
      if (window.showToast) {
        window.showToast(data.error || "Errore durante la richiesta", "error");
      }
    }
  } catch (error) {
    safeLog("error", "[AuthModal] Errore reset password:", error);
    if (window.showToast) {
      window.showToast("Errore di connessione. Riprova.", "error");
    }
  } finally {
    if (forgotPasswordBtn) {
      forgotPasswordBtn.disabled = false;
      forgotPasswordBtn.textContent = "Password dimenticata?";
    }
  }
}

const handleAssistEsc = (event) => {
  if (event.key === "Escape") {
    const modal = document.getElementById("auth-assist-modal");
    if (modal && !modal.hasAttribute("aria-hidden")) {
      closeAssistModal();
    }
  }
};

function getDefaultAssistEmail() {
  const loginEmail = document.getElementById("auth-email")?.value?.trim() || "";
  const signupEmail = document.getElementById("signup-email")?.value?.trim() || "";
  return loginEmail || signupEmail;
}

function showAssistModal() {
  let modal = document.getElementById("auth-assist-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "auth-assist-modal";
    modal.className = "auth-modal auth-modal-secondary";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-label", "Assistenza rapida");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="auth-modal-overlay" aria-hidden="true"></div>
      <div class="auth-modal-content">
        <div class="auth-modal-header">
          <h2 class="auth-modal-title">Assistenza rapida</h2>
          <button type="button" class="auth-modal-close" aria-label="Chiudi">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="auth-modal-body">
          <p class="auth-modal-intro">
            Ti rispondiamo entro ${QUICK_ASSIST_SLA_MINUTES} minuti nelle fasce operative.
            Descrivi il problema: possiamo verificare reset password, blocchi MFA o esigenze MiFID.
          </p>
          <form id="auth-assist-form" class="auth-modal-form" novalidate>
            <div class="auth-form-group">
              <label for="assist-email" class="auth-form-label">Email</label>
              <input
                type="email"
                id="assist-email"
                name="assist-email"
                class="auth-form-input"
                placeholder="nome@esempio.com"
                autocomplete="email"
              />
            </div>
            <div class="auth-form-group">
              <label for="assist-channel" class="auth-form-label">Preferenza di ricontatto</label>
              <select id="assist-channel" class="auth-form-input" name="assist-channel">
                <option value="email" selected>Email</option>
                <option value="phone">Chiamata breve</option>
                <option value="telegram">Telegram / WhatsApp</option>
              </select>
            </div>
            <div class="auth-form-group">
              <label for="assist-summary" class="auth-form-label">
                Come possiamo aiutarti?
              </label>
              <textarea
                id="assist-summary"
                name="assist-summary"
                class="auth-form-input"
                rows="4"
                placeholder="Es. Non ricevo l'email di reset, cambio dispositivo, codice scaduto..."
                required
              ></textarea>
            </div>
            <p class="assist-hint">
              Suggerimento: indica se hai già provato “Password dimenticata?” o se hai cambiato dispositivo, così riduciamo passaggi inutili.
            </p>
            <div class="auth-form-actions">
              <button type="submit" class="btn btn-primary">
                Invia richiesta veloce
              </button>
              <button type="button" class="btn btn-secondary" id="auth-assist-mail">
                Apri email a ${SUPPORT_EMAIL}
              </button>
              <button type="button" class="btn btn-link" data-close-assist>
                Chiudi
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  if (!modal.dataset.eventsBound) {
    const overlay = modal.querySelector(".auth-modal-overlay");
    const closeBtn = modal.querySelector(".auth-modal-close");
    const form = modal.querySelector("#auth-assist-form");
    const mailBtn = modal.querySelector("#auth-assist-mail");
    const inlineClose = modal.querySelector("[data-close-assist]");

    overlay?.addEventListener("click", closeAssistModal);
    closeBtn?.addEventListener("click", closeAssistModal);
    inlineClose?.addEventListener("click", closeAssistModal);
    form?.addEventListener("submit", handleAssistSubmit);
    mailBtn?.addEventListener("click", () => {
      triggerAssistEmail(form);
      closeAssistModal();
    });
    document.addEventListener("keydown", handleAssistEsc);
    modal.dataset.eventsBound = "true";
  }

  const emailInput = modal.querySelector("#assist-email");
  if (emailInput && !emailInput.value) {
    emailInput.value = getDefaultAssistEmail();
  }
  const summaryInput = modal.querySelector("#assist-summary");
  if (summaryInput && !summaryInput.value) {
    summaryInput.value =
      "Descrivi qui il problema (es. reset password non ricevuto, codice accesso scaduto, cambio dispositivo).";
  }

  modal.removeAttribute("aria-hidden");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  const focusTarget = emailInput || summaryInput;
  setTimeout(() => focusTarget?.focus(), 120);
}

function closeAssistModal() {
  const modal = document.getElementById("auth-assist-modal");
  if (!modal) {
    return;
  }
  modal.setAttribute("aria-hidden", "true");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function triggerAssistEmail(form) {
  const email =
    form?.querySelector("#assist-email")?.value?.trim() || getDefaultAssistEmail() || "non fornita";
  const channel = form?.querySelector("#assist-channel")?.value || "email";
  const summary =
    form?.querySelector("#assist-summary")?.value?.trim() ||
    "Scrivi qui il problema per accelerare il supporto.";

  const bodyLines = [
    `Email utente: ${email}`,
    `Preferenza contatto: ${channel}`,
    "",
    summary,
  ];

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    "Assistenza rapida dashboard"
  )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

  window.open(mailto, "_blank", "noopener");

  if (window.showToast) {
    window.showToast(
      `Abbiamo preparato un'email verso ${SUPPORT_EMAIL}. Inviacela per completare la richiesta.`,
      "info"
    );
  }
}

function handleAssistSubmit(event) {
  event.preventDefault();
  const form = event.target;
  triggerAssistEmail(form);
  closeAssistModal();
}

window.closeAssistModal = closeAssistModal;

