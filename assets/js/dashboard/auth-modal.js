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

// ===== DEBUG SYSTEM =====
const DEBUG = {
  enabled:
    window.location.search.includes("debug=auth") || localStorage.getItem("auth-debug") === "true",
  log: function (level, component, message, data = null) {
    if (!this.enabled) {
      return;
    }
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      component: `[AuthModal:${component}]`,
      message,
      data,
    };
    console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
      `${logEntry.component} ${message}`,
      data || ""
    );
    // Store in session for debugging
    if (typeof sessionStorage !== "undefined") {
      const logs = JSON.parse(sessionStorage.getItem("auth-debug-logs") || "[]");
      logs.push(logEntry);
      // Keep only last 50 logs
      if (logs.length > 50) {
        logs.shift();
      }
      sessionStorage.setItem("auth-debug-logs", JSON.stringify(logs));
    }
  },
  error: function (component, message, data) {
    this.log("error", component, message, data);
  },
  warn: function (component, message, data) {
    this.log("warn", component, message, data);
  },
  info: function (component, message, data) {
    this.log("info", component, message, data);
  },
  getLogs: function () {
    if (typeof sessionStorage !== "undefined") {
      return JSON.parse(sessionStorage.getItem("auth-debug-logs") || "[]");
    }
    return [];
  },
  clearLogs: function () {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("auth-debug-logs");
    }
  },
};

// Expose debug globally for console access
if (typeof window !== "undefined") {
  window.authModalDebug = DEBUG;
}

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
  DEBUG.info("showAuthModal", `Opening modal with tab: ${tab}`);

  const modal = document.getElementById(MODAL_ID);
  if (!modal) {
    DEBUG.warn("showAuthModal", "Modal not found, creating...");
    // Se modale non esiste, crealo
    createModal();
    // Riprova dopo un breve delay
    setTimeout(() => {
      showAuthModal(tab);
    }, 100);
    return;
  }

  // Check if already open
  if (!modal.hasAttribute("aria-hidden") || modal.classList.contains("active")) {
    DEBUG.warn("showAuthModal", "Modal already open, switching tab");
  }

  updateModalTab(tab);
  resetStatusMessages();

  modal.removeAttribute("aria-hidden");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  DEBUG.info("showAuthModal", "Modal opened successfully");

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

  resetStatusMessages();
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
          <div class="auth-context-top">
            <p class="auth-modal-intro">
              Tradelia usa AI con metodo accademico per spiegarti i mercati con linguaggio semplice e verificabile.
            </p>
            <div class="auth-context-tags" aria-label="Pilastri metodologici">
              <span class="auth-context-tag">Spaced Repetition</span>
              <span class="auth-context-tag">Retrieval Practice</span>
              <span class="auth-context-tag">Metacognition</span>
              <span class="auth-context-tag">Learning Analytics</span>
            </div>
          </div>
          <ul class="auth-value-list">
            <li>Esami automatizzati con rubriche Bloom + feedback immediato.</li>
            <li>Dashboard MiFID-ready con analytics personali e check di appropriatezza.</li>
            <li>Supporto umano certificato con SLA medio 12 minuti.</li>
          </ul>
          <details class="auth-plan-details">
            <summary>Vedi cosa include Base / Pro / Desk</summary>
            <div class="auth-plan-overview" aria-label="Panoramica servizi">
              <div class="auth-plan-pill">
                <strong>Base</strong>
                <span>Accesso gratuito, percorsi introduttivi, alert educativi quotidiani.</span>
              </div>
              <div class="auth-plan-pill">
                <strong>Pro</strong>
                <span>Analisi avanzate, community moderata, tutor AI, report certificabili.</span>
              </div>
              <div class="auth-plan-pill">
                <strong>Desk</strong>
                <span>Servizi istituzionali, checklist MiFID, audit completo, onboarding team.</span>
              </div>
            </div>
          </details>
          <p class="auth-compliance-note">
            Allineato a NIST 800-63B, MiFID II / ESMA, WCAG 2.2 AA e letteratura 2015-2025 su formazione finanziaria.
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
              <div class="auth-status-message" id="login-status-message" aria-live="assertive"></div>
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
              <div class="auth-status-message" id="signup-status-message" aria-live="assertive"></div>
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
    DEBUG.error("setupModalEvents", "Modal not found");
    return;
  }

  DEBUG.info("setupModalEvents", "Setting up event listeners");

  const overlay = modal.querySelector(".auth-modal-overlay");
  const closeBtn = modal.querySelector(".auth-modal-close");
  const tabs = modal.querySelectorAll(".auth-modal-tab");
  const loginForm = document.getElementById("auth-login-form");
  const signupForm = document.getElementById("auth-signup-form");
  const quickAssistBtn = document.getElementById("auth-quick-assist");

  // Debug: Check if all elements exist
  const missingElements = [];
  if (!overlay) {
    missingElements.push("overlay");
  }
  if (!closeBtn) {
    missingElements.push("closeBtn");
  }
  if (tabs.length === 0) {
    missingElements.push("tabs");
  }
  if (!loginForm) {
    missingElements.push("loginForm");
  }
  if (!signupForm) {
    missingElements.push("signupForm");
  }

  if (missingElements.length > 0) {
    DEBUG.warn("setupModalEvents", `Missing elements: ${missingElements.join(", ")}`);
  }

  // Close handlers
  const closeModal = () => {
    hideAuthModal();
  };

  // BEST PRACTICE: Su mobile, disabilita chiusura con click overlay per evitare chiusure accidentali
  // Solo il pulsante di chiusura e Escape possono chiudere la modale su mobile
  const isMobile = window.innerWidth <= 640 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (overlay) {
    if (!isMobile) {
      // Desktop: click overlay chiude la modale
      overlay.addEventListener("click", closeModal);
    } else {
      // Mobile: click overlay NON chiude (previene chiusure accidentali)
      // Solo swipe down intenzionale o pulsante close
      let touchStartY = 0;
      let touchStartTime = 0;
      
      overlay.addEventListener("touchstart", (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }, { passive: true });
      
      overlay.addEventListener("touchend", (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        const deltaY = touchEndY - touchStartY;
        const deltaTime = touchEndTime - touchStartTime;
        
        // Swipe down veloce e significativo (> 100px in < 300ms) = chiusura intenzionale
        if (deltaY > 100 && deltaTime < 300 && touchStartY < 100) {
          // Swipe dall'alto verso il basso = chiusura intenzionale
          closeModal();
        }
      }, { passive: true });
    }
  }
  
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Escape key - use named function to allow removal
  const escapeHandler = (e) => {
    if (e.key === "Escape" && !modal.hasAttribute("aria-hidden")) {
      DEBUG.info("setupModalEvents", "Escape key pressed, closing modal");
      closeModal();
    }
  };
  document.addEventListener("keydown", escapeHandler);
  // Store handler for potential cleanup
  modal._escapeHandler = escapeHandler;

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

function setStatusMessage(targetId, message = "", state = "info") {
  const el = document.getElementById(targetId);
  if (!el) {
    return;
  }

  if (!message) {
    el.textContent = "";
    el.classList.remove("is-visible", "is-success", "is-error", "is-info");
    return;
  }

  el.textContent = message;
  el.classList.add("is-visible");
  el.classList.remove("is-success", "is-error", "is-info");
  el.classList.add(`is-${state}`);
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
  resetStatusMessages();
}

function resetStatusMessages() {
  ["login-status-message", "signup-status-message"].forEach((id) => {
    setStatusMessage(id, "");
  });
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
  const statusId = "login-status-message";

  const email = emailInput?.value?.trim() || "";
  const password = passwordInput?.value || "";

  // Validation
  if (!email) {
    if (window.showToast) {
      window.showToast("Inserisci un'email", "error");
    }
    setStatusMessage(statusId, "Inserisci il tuo indirizzo email.", "error");
    emailInput?.focus();
    return;
  }

  if (!password) {
    if (window.showToast) {
      window.showToast("Inserisci la password", "error");
    }
    setStatusMessage(statusId, "Inserisci la tua password.", "error");
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

  setStatusMessage(statusId, "Stiamo verificando le credenziali…", "info");

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
        setStatusMessage(statusId, "Verifica la tua email prima di accedere.", "info");
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
        setStatusMessage(statusId, "Credenziali non valide. Controlla email e password.", "error");
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
      setStatusMessage(statusId, "Accesso eseguito con successo. Reindirizzamento…", "success");
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
    setStatusMessage(statusId, "Errore di rete, controlla la connessione e riprova.", "error");
    // Re-enable form
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Accedi";
    }
  }
}

// Prevent double submission
let signupInProgress = false;

/**
 * Handle signup form submit
 */
async function handleSignupSubmit(e) {
  e.preventDefault();

  // Prevent double submission
  if (signupInProgress) {
    DEBUG.warn("handleSignupSubmit", "Signup already in progress, ignoring duplicate submit");
    return;
  }

  DEBUG.info("handleSignupSubmit", "Signup form submitted");

  const form = e.target;
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const passwordConfirmInput = document.getElementById("signup-password-confirm");
  const privacyCheckbox = document.getElementById("signup-privacy");
  const statusId = "signup-status-message";

  // Debug: Check if all inputs exist
  const missingInputs = [];
  if (!emailInput) {
    missingInputs.push("emailInput");
  }
  if (!passwordInput) {
    missingInputs.push("passwordInput");
  }
  if (!passwordConfirmInput) {
    missingInputs.push("passwordConfirmInput");
  }
  if (!privacyCheckbox) {
    missingInputs.push("privacyCheckbox");
  }

  if (missingInputs.length > 0) {
    DEBUG.error("handleSignupSubmit", `Missing inputs: ${missingInputs.join(", ")}`);
    setStatusMessage(
      statusId,
      "Errore: elementi del form non trovati. Ricarica la pagina.",
      "error"
    );
    return;
  }

  const email = emailInput?.value?.trim() || "";
  const password = passwordInput?.value || "";
  const passwordConfirm = passwordConfirmInput?.value || "";
  const privacyAccepted = privacyCheckbox?.checked || false;

  DEBUG.info("handleSignupSubmit", "Form data collected", {
    emailLength: email.length,
    passwordLength: password.length,
    passwordConfirmLength: passwordConfirm.length,
    privacyAccepted,
  });

  // Validation
  if (!email) {
    DEBUG.warn("handleSignupSubmit", "Validation failed: email empty");
    if (window.showToast) {
      window.showToast("Inserisci un'email", "error");
    }
    setStatusMessage(statusId, "Inserisci un indirizzo email valido.", "error");
    emailInput?.focus();
    return;
  }

  // Email format validation - use existing validateEmail function
  if (!validateEmail(email)) {
    DEBUG.warn("handleSignupSubmit", "Validation failed: invalid email format");
    setStatusMessage(statusId, "Formato email non valido.", "error");
    emailInput?.focus();
    return;
  }

  if (!password || password.length < 12) {
    DEBUG.warn(
      "handleSignupSubmit",
      `Validation failed: password too short (${password.length} chars)`
    );
    if (window.showToast) {
      window.showToast("Password deve essere di almeno 12 caratteri", "error");
    }
    setStatusMessage(statusId, "La password deve contenere almeno 12 caratteri.", "error");
    passwordInput?.focus();
    return;
  }

  if (password !== passwordConfirm) {
    DEBUG.warn("handleSignupSubmit", "Validation failed: passwords don't match");
    if (window.showToast) {
      window.showToast("Le password non corrispondono", "error");
    }
    setStatusMessage(statusId, "Le password non coincidono.", "error");
    passwordConfirmInput?.focus();
    return;
  }

  if (!privacyAccepted) {
    DEBUG.warn("handleSignupSubmit", "Validation failed: privacy not accepted");
    if (window.showToast) {
      window.showToast("Devi accettare la privacy policy", "error");
    }
    setStatusMessage(statusId, "Accetta la privacy policy per procedere.", "error");
    privacyCheckbox?.focus();
    return;
  }

  DEBUG.info("handleSignupSubmit", "Validation passed, proceeding with signup");

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

  signupInProgress = true;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrazione in corso...";
    submitBtn.setAttribute("aria-busy", "true");
  }

  setStatusMessage(statusId, "Creazione dell'account in corso…", "info");

  try {
    DEBUG.info("handleSignupSubmit", "Sending signup request to API");

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

    DEBUG.info("handleSignupSubmit", `API response status: ${response.status}`);

    const data = await response.json();

    DEBUG.info("handleSignupSubmit", "API response data", {
      ok: data.ok,
      hasError: !!data.error,
      hasToken: !!data.token,
      emailSent: data.emailSent,
    });

    if (!response.ok || !data.ok) {
      const errorMsg = data.error || "Errore durante la registrazione";
      DEBUG.error("handleSignupSubmit", `API error: ${errorMsg}`, {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      throw new Error(errorMsg);
    }

    // BEST PRACTICE: Email verification required
    if (data.emailSent && !data.token) {
      DEBUG.info("handleSignupSubmit", "Signup successful, email verification required");
      signupInProgress = false;
      if (window.showToast) {
        window.showToast(
          "Registrazione completata! Verifica la tua email per attivare l'account.",
          "success"
        );
      }
      setStatusMessage(
        statusId,
        "Registrazione completata! Controlla la tua email per attivare l'account.",
        "success"
      );
      hideAuthModal();
      // Mostra messaggio informativo
      setTimeout(() => {
        if (window.showToast) {
          window.showToast("Controlla la tua casella email per il link di verifica", "info");
        }
      }, 2000);
    } else if (data.token) {
      DEBUG.info("handleSignupSubmit", "Signup successful, token received, auto-login");
      signupInProgress = false;
      // Token restituito direttamente (fallback) - BEST PRACTICE: Use secure token storage
      const { saveToken } = await import("./token-storage.js");
      await saveToken(data.token, data.refreshToken || null);
      if (window.showToast) {
        window.showToast("Registrazione completata! Accesso in corso...", "success");
      }
      setStatusMessage(statusId, "Account creato. Ti reindirizziamo alla dashboard…", "success");
      hideAuthModal();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      DEBUG.info("handleSignupSubmit", "Signup successful, no token (email verification flow)");
      signupInProgress = false;
      if (window.showToast) {
        window.showToast(
          data.message || "Registrazione completata. Controlla la tua email.",
          "success"
        );
      }
      setStatusMessage(statusId, data.message || "Registrazione completata!", "success");
      hideAuthModal();
    }
  } catch (error) {
    signupInProgress = false;
    safeLog("error", "[AuthModal] Errore registrazione:", error);
    DEBUG.error("handleSignupSubmit", "Signup failed", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (window.showToast) {
      window.showToast(error.message || "Errore durante la registrazione", "error");
    }
    setStatusMessage(
      statusId,
      error.message || "Impossibile completare la registrazione.",
      "error"
    );
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
  const emailRegex =
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  // Validazioni aggiuntive
  if (trimmed.length > 254) {
    return false;
  } // RFC 5321 limit
  if (trimmed.length < 5) {
    return false;
  } // Min: a@b.c
  if (trimmed.includes("..")) {
    return false;
  } // No consecutive dots
  if (trimmed.startsWith(".") || trimmed.endsWith(".")) {
    return false;
  } // No leading/trailing dot
  if (trimmed.startsWith("@") || trimmed.endsWith("@")) {
    return false;
  } // No leading/trailing @

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

  if (commonPatterns.some((pattern) => pattern.test(password))) {
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
  const statusId = "login-status-message";

  if (!email) {
    if (window.showToast) {
      window.showToast("Inserisci la tua email per reimpostare la password", "error");
    }
    setStatusMessage(statusId, "Inserisci la tua email per ricevere il link di reset.", "error");
    emailInput?.focus();
    return;
  }

  if (!validateEmail(email)) {
    if (window.showToast) {
      window.showToast("Formato email non valido", "error");
    }
    setStatusMessage(statusId, "Email non valida. Controlla e riprova.", "error");
    emailInput?.focus();
    return;
  }

  // Disable button during request
  const forgotPasswordBtn = document.getElementById("auth-forgot-password");
  if (forgotPasswordBtn) {
    forgotPasswordBtn.disabled = true;
    forgotPasswordBtn.textContent = "Invio in corso...";
  }

  setStatusMessage(statusId, "Stiamo inviando il link di ripristino…", "info");

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
          data.message ||
            "Se l'email esiste, ti abbiamo inviato le istruzioni per reimpostare la password. Controlla la tua casella email.",
          "success"
        );
      }
      setStatusMessage(
        statusId,
        data.message || "Se l'email esiste, riceverai un link entro pochi minuti.",
        "success"
      );
      // Clear email field for security
      if (emailInput) {
        emailInput.value = "";
      }
    } else {
      if (window.showToast) {
        window.showToast(data.error || "Errore durante la richiesta", "error");
      }
      setStatusMessage(
        statusId,
        data.error || "Non siamo riusciti a inviare l'email di reset.",
        "error"
      );
    }
  } catch (error) {
    safeLog("error", "[AuthModal] Errore reset password:", error);
    if (window.showToast) {
      window.showToast("Errore di connessione. Riprova.", "error");
    }
    setStatusMessage(statusId, "Errore di rete, riprova più tardi.", "error");
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

  const bodyLines = [`Email utente: ${email}`, `Preferenza contatto: ${channel}`, "", summary];

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
