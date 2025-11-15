import { supabase } from '../supabase-client.js';
import Logger from '../utils/logger.js';

const state = {
  root: null,
  modal: null,
  mode: 'login',
  busy: false,
  initialized: false,
  previousActiveElement: null, // Per ripristinare focus alla chiusura
  focusableElements: [] // Per focus trap
};

function init() {
  if (state.initialized) return;
  state.root = document.createElement('div');
  state.root.id = 'auth-overlay';
  state.root.className = 'auth-overlay';
  state.root.setAttribute('aria-hidden', 'true');
  state.root.innerHTML = template();
  document.body.appendChild(state.root);
  state.modal = state.root.querySelector('.auth-modal');
  registerEvents();
  setupFocusTrap();
  setupKeyboardNavigation();
  setupFormValidation();
  // Assicura che solo il form login sia visibile all'inizio
  updateForms();
  state.initialized = true;
}

function template() {
  return `
    <div class="auth-backdrop" data-auth-dismiss></div>
    <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <header class="auth-header">
        <div class="auth-header-text">
          <h2 class="auth-title" id="auth-modal-title">Area Riservata Tradelia</h2>
        </div>
        <button type="button" class="auth-close" data-auth-close aria-label="Chiudi">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </header>
      <nav class="auth-tabs" role="tablist" aria-label="Modalità di accesso">
        <button type="button" role="tab" data-auth-switch="login" aria-selected="true" title="Accedi">
          <span class="auth-tab-label">Accedi</span>
        </button>
        <button type="button" role="tab" data-auth-switch="register" aria-selected="false" title="Registrati">
          <span class="auth-tab-label">Registrati</span>
        </button>
        <button type="button" role="tab" data-auth-switch="reset" aria-selected="false" title="Recupera password">
          <span class="auth-tab-label">Recupera password</span>
        </button>
      </nav>
      <div class="auth-body">
        <form id="auth-login-form" data-auth-form="login" class="auth-form" novalidate>
          <div class="auth-field">
            <label for="auth-email-login">Email</label>
            <input id="auth-email-login" type="email" name="email" autocomplete="email" required placeholder="nome@email.com" aria-describedby="auth-email-login-error">
            <span id="auth-email-login-error" class="auth-field-error" role="alert" aria-live="polite"></span>
          </div>
          <div class="auth-field">
            <label for="auth-password-login">Password</label>
            <div class="auth-password-wrapper">
              <input id="auth-password-login" type="password" name="password" autocomplete="current-password" required minlength="8" placeholder="Password" aria-describedby="auth-password-login-error">
              <button type="button" class="auth-password-toggle" aria-label="Mostra password" data-password-toggle="auth-password-login" tabindex="0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <span id="auth-password-login-error" class="auth-field-error" role="alert" aria-live="polite"></span>
          </div>
          <div class="auth-remember">
            <input type="checkbox" id="auth-remember-login" name="remember" value="true">
            <label for="auth-remember-login">Ricordami per 7 giorni</label>
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">Accedi</button>
          </div>
        </form>
        <form id="auth-register-form" data-auth-form="register" class="auth-form" hidden novalidate>
          <p class="auth-register-intro" style="font-size: 0.75rem; color: var(--ink-soft); margin-bottom: 1rem; line-height: 1.5;">
            Account gratuito con ruolo Guest. Prova gratuita 14 giorni disponibile.
          </p>
          <div class="auth-field">
            <label for="auth-email-register">Email</label>
            <input id="auth-email-register" type="email" name="email" autocomplete="email" required placeholder="nome@email.com" aria-describedby="auth-email-register-error">
            <span id="auth-email-register-error" class="auth-field-error" role="alert" aria-live="polite"></span>
          </div>
          <div class="auth-field">
            <label for="auth-password-register">Password</label>
            <div class="auth-password-wrapper">
              <input id="auth-password-register" type="password" name="password" autocomplete="new-password" required minlength="8" placeholder="Password (minimo 8 caratteri)" aria-describedby="auth-password-register-error auth-password-register-hint">
              <button type="button" class="auth-password-toggle" aria-label="Mostra password" data-password-toggle="auth-password-register" tabindex="0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <span id="auth-password-register-hint" class="auth-field-hint">Minimo 8 caratteri</span>
            <span id="auth-password-register-error" class="auth-field-error" role="alert" aria-live="polite"></span>
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">Crea account</button>
          </div>
          <p class="auth-hint" style="font-size: 0.75rem; color: var(--ink-soft); margin-top: 1rem; text-align: center;">
            Registrandoti, accetti i <a href="/terms.html" style="color: var(--brand-600);">Termini di servizio</a> e la <a href="/privacy.html" style="color: var(--brand-600);">Privacy Policy</a>.
          </p>
        </form>
        <form id="auth-reset-form" data-auth-form="reset" class="auth-form" hidden novalidate>
          <div class="auth-field">
            <label for="auth-email-reset">Email</label>
            <input id="auth-email-reset" type="email" name="email" autocomplete="email" required placeholder="nome@email.com" aria-describedby="auth-email-reset-error">
            <span id="auth-email-reset-error" class="auth-field-error" role="alert" aria-live="polite"></span>
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">Invia link di reset</button>
          </div>
          <p class="auth-hint" style="font-size: 0.7rem;">Controlla anche la cartella spam.</p>
        </form>
      </div>
      <footer class="auth-footer">
        <p style="margin: 0;"><a href="mailto:info@tradelia.org">Assistenza</a></p>
      </footer>
      <div class="auth-toast" id="auth-toast" role="status" aria-live="polite"></div>
    </div>
  `;
}

function registerEvents() {
  const closeBtn = state.root.querySelector('[data-auth-close]');
  const backdrop = state.root.querySelector('[data-auth-dismiss]');
  const tabsContainer = state.root.querySelector('.auth-tabs');
  const loginForm = state.root.querySelector('#auth-login-form');
  const registerForm = state.root.querySelector('#auth-register-form');
  const resetForm = state.root.querySelector('#auth-reset-form');
  const assistanceLink = state.root.querySelector('footer a[href^="mailto:"]');

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  
  // Assicura che il link mailto funzioni correttamente
  if (assistanceLink) {
    assistanceLink.addEventListener('click', (e) => {
      e.stopPropagation(); // Previene chiusura modale
      // Il mailto: funzionerà automaticamente tramite href
    });
  }
  
  // Password visibility toggles
  const passwordToggles = state.root.querySelectorAll('[data-password-toggle]');
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', handlePasswordToggle);
  });
  
  document.addEventListener('keydown', handleEscape);

  // Event delegation per tab switching (evita listener duplicati)
  if (tabsContainer) {
    // Rimuovi listener precedenti se esistono
    if (tabsContainer._clickHandler) {
      tabsContainer.removeEventListener('click', tabsContainer._clickHandler);
    }
    
    tabsContainer._clickHandler = (e) => {
      const btn = e.target.closest('[data-auth-switch]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const mode = btn.getAttribute('data-auth-switch');
      open(mode);
    };
    
    tabsContainer.addEventListener('click', tabsContainer._clickHandler);
  }

  // Form submit handlers
  if (loginForm) {
    // Rimuovi listener precedenti se esistono
    if (loginForm._submitHandler) {
      loginForm.removeEventListener('submit', loginForm._submitHandler);
    }
    loginForm._submitHandler = handleLogin;
    loginForm.addEventListener('submit', loginForm._submitHandler);
  }
  
  if (registerForm) {
    // Rimuovi listener precedenti se esistono
    if (registerForm._submitHandler) {
      registerForm.removeEventListener('submit', registerForm._submitHandler);
    }
    registerForm._submitHandler = handleSignup;
    registerForm.addEventListener('submit', registerForm._submitHandler);
  }
  
  if (resetForm) {
    // Rimuovi listener precedenti se esistono
    if (resetForm._submitHandler) {
      resetForm.removeEventListener('submit', resetForm._submitHandler);
    }
    resetForm._submitHandler = handleReset;
    resetForm.addEventListener('submit', resetForm._submitHandler);
  }
}

function handleEscape(event) {
  if (event.key === 'Escape' && state.root?.dataset.open === 'true') {
    close();
  }
}

// Focus trap: mantiene il focus dentro il modale
function setupFocusTrap() {
  if (!state.modal) return;
  
  state.modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

function getFocusableElements() {
  if (!state.modal) return [];
  return Array.from(state.modal.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter(el => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

// Keyboard navigation per tab (frecce sinistra/destra)
function setupKeyboardNavigation() {
  const tabsContainer = state.root.querySelector('.auth-tabs');
  if (!tabsContainer) return;
  
  const tabs = Array.from(tabsContainer.querySelectorAll('[role="tab"]'));
  
  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (e) => {
      let targetIndex = index;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = tabs.length - 1;
      } else {
        return; // Non gestire altri tasti
      }
      
      tabs[targetIndex].focus();
      tabs[targetIndex].click();
    });
  });
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Validazione in tempo reale con debounce
function setupFormValidation() {
  const forms = state.root.querySelectorAll('.auth-form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
      // Validazione on blur (immediata)
      input.addEventListener('blur', () => validateField(input));
      
      // Validazione on input con debounce (300ms)
      const debouncedValidation = debounce(() => {
        if (input.validity.valid) {
          clearFieldError(input);
        }
        // Password strength per campo password
        if (input.type === 'password' && input.id.includes('register')) {
          updatePasswordStrength(input);
        }
      }, 300);
      
      input.addEventListener('input', debouncedValidation);
      
      // Enter key per submit
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn && !submitBtn.disabled && !state.busy) {
            form.requestSubmit();
          }
        }
      });
    });
  });
}

function validateField(input) {
  const errorEl = input.getAttribute('aria-describedby')?.split(' ').find(id => id.includes('error'));
  if (!errorEl) return;
  
  const errorElement = document.getElementById(errorEl);
  if (!errorElement) return;
  
  if (!input.validity.valid) {
    let message = '';
    if (input.validity.valueMissing) {
      message = 'Campo obbligatorio';
    } else if (input.validity.typeMismatch && input.type === 'email') {
      message = 'Inserisci un indirizzo email valido';
    } else if (input.validity.tooShort) {
      message = `Minimo ${input.minLength} caratteri`;
    } else {
      message = 'Valore non valido';
    }
    
    showFieldError(input, message);
  } else {
    clearFieldError(input);
  }
}

function showFieldError(input, message) {
  const errorId = input.getAttribute('aria-describedby')?.split(' ').find(id => id.includes('error'));
  if (!errorId) return;
  
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('auth-input-error');
  }
}

function clearFieldError(input) {
  const errorId = input.getAttribute('aria-describedby')?.split(' ').find(id => id.includes('error'));
  if (!errorId) return;
  
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }
  input.removeAttribute('aria-invalid');
  input.classList.remove('auth-input-error');
}

// Password strength calculator
function calculatePasswordStrength(password) {
  if (!password) return { strength: 'none', score: 0 };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password)
  };
  
  Object.values(checks).forEach(check => {
    if (check) score++;
  });
  
  // Bonus per lunghezza
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;
  
  let strength = 'weak';
  if (score >= 4.5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return { strength, score, checks };
}

// Update password strength indicator
function updatePasswordStrength(input) {
  const password = input.value;
  const strengthContainer = input.closest('.auth-field')?.querySelector('.auth-password-strength');
  
  if (!strengthContainer) {
    // Crea container se non esiste
    const field = input.closest('.auth-field');
    if (!field || !input.id.includes('register')) return;
    
    const container = document.createElement('div');
    container.className = 'auth-password-strength';
    container.innerHTML = `
      <div class="auth-password-strength-label">Sicurezza password</div>
      <div class="auth-password-strength-bar">
        <div class="auth-password-strength-fill" data-strength="weak"></div>
      </div>
      <div class="auth-password-requirements">
        <div class="auth-password-requirement" data-requirement="length">Almeno 8 caratteri</div>
        <div class="auth-password-requirement" data-requirement="lowercase">Una lettera minuscola</div>
        <div class="auth-password-requirement" data-requirement="uppercase">Una lettera maiuscola</div>
        <div class="auth-password-requirement" data-requirement="numbers">Un numero</div>
        <div class="auth-password-requirement" data-requirement="special">Un carattere speciale</div>
      </div>
    `;
    field.appendChild(container);
  }
  
  if (!password) {
    strengthContainer.style.display = 'none';
    return;
  }
  
  strengthContainer.style.display = 'grid';
  const { strength, checks } = calculatePasswordStrength(password);
  const fill = strengthContainer.querySelector('.auth-password-strength-fill');
  const requirements = strengthContainer.querySelectorAll('.auth-password-requirement');
  
  // Aggiorna barra
  fill.setAttribute('data-strength', strength);
  
  // Aggiorna requisiti
  requirements.forEach(req => {
    const reqType = req.getAttribute('data-requirement');
    const met = checks[reqType] || false;
    req.setAttribute('data-met', met);
  });
}

// Toggle password visibility
function handlePasswordToggle(e) {
  const toggle = e.currentTarget;
  const inputId = toggle.getAttribute('data-password-toggle');
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  toggle.setAttribute('aria-label', isPassword ? 'Nascondi password' : 'Mostra password');
  
  // Aggiorna icona SVG
  const svg = toggle.querySelector('svg');
  if (svg) {
    if (isPassword) {
      // Icona occhio barrato
      svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
      // Icona occhio normale
      svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  const remember = form.remember?.checked || false;
  
  if (!email || !password) {
    showToast('Inserisci email e password.', 'error');
    return;
  }
  state.busy = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.setAttribute('aria-busy', 'true');
  submitBtn.textContent = 'Accesso in corso...';
  
  // Pulisci errori precedenti
  clearFieldError(form.querySelector('#auth-email-login'));
  clearFieldError(form.querySelector('#auth-password-login'));
  
  try {
    // Supabase gestisce automaticamente persistSession (default: true)
    // Il checkbox "remember" è principalmente per UX
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast('Accesso effettuato.', 'success');
    // Chiudi il modal e reindirizza all'area utente
    closeAfterDelay();
    setTimeout(() => {
      window.location.href = '/user/';
    }, 300);
  } catch (err) {
    Logger.error('AuthModal', 'login error', err);
    const message = err?.message || 'Credenziali non valide.';
    
    // Mostra errore inline
    if (err.message?.toLowerCase().includes('email') || err.message?.toLowerCase().includes('user')) {
      showFieldError(form.querySelector('#auth-email-login'), 'Email non valida o non registrata');
    } else if (err.message?.toLowerCase().includes('password') || err.message?.toLowerCase().includes('invalid')) {
      showFieldError(form.querySelector('#auth-password-login'), 'Password non corretta');
    } else {
      showToast(message, 'error');
    }
    
    if (/api key/i.test(message)) {
      showToast('Configurazione API non valida. Verifica la Supabase anon key sul deploy.', 'error');
    }
  } finally {
    state.busy = false;
    submitBtn.disabled = false;
    submitBtn.removeAttribute('aria-busy');
    submitBtn.textContent = originalText;
  }
}

async function handleSignup(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  
  if (!email || !password) {
    if (!email) showFieldError(form.querySelector('#auth-email-register'), 'Campo obbligatorio');
    if (!password) showFieldError(form.querySelector('#auth-password-register'), 'Campo obbligatorio');
    return;
  }
  
  if (password.length < 8) {
    showFieldError(form.querySelector('#auth-password-register'), 'La password deve essere di almeno 8 caratteri.');
    return;
  }
  
  state.busy = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn?.textContent || 'Crea account';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = 'Registrazione...';
  }
  
  // Pulisci errori precedenti
  clearFieldError(form.querySelector('#auth-email-register'));
  clearFieldError(form.querySelector('#auth-password-register'));
  
  try {
    // 0. Se c'è già una sessione attiva, fai logout prima di registrare nuovo account
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      Logger.debug('AuthModal', 'Logout account esistente prima di signup', { userId: session.user.id });
      await supabase.auth.signOut();
      // Attendi un momento per assicurarsi che il logout sia completato
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 1. Crea utente in Supabase Auth
    // DISABILITA email di verifica per evitare rate limit (auto-login dopo signup)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/user`,
        // Disabilita email di verifica se possibile (dipende da configurazione Supabase)
        // Se email verification è obbligatoria in Supabase, questa opzione non ha effetto
        // Ma riduce comunque il carico se l'utente fa auto-login
      }
    });
    
    if (signUpError) {
      // Log dettagliato dell'errore Supabase
      console.error('[AuthModal] Supabase signup error:', {
        message: signUpError.message,
        status: signUpError.status,
        code: signUpError.code,
        name: signUpError.name,
        error: signUpError
      });
      throw signUpError;
    }
    
    if (!authData.user) {
      throw new Error('Errore durante la creazione dell\'account.');
    }
    
    // 2. Crea profilo utente (con gestione errori migliorata)
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          display_name: email.split('@')[0],
          preferences: {
            email_notifications: true,
            dashboard_alerts: true
          }
        });
      
      if (profileError) {
        // Se errore 23505 = unique violation (già esiste), ignora
        // Se errore 42501 = insufficient privilege (RLS), logga ma continua
        // Se errore 42P01 = table does not exist, errore critico
        if (profileError.code === '23505') {
          Logger.debug('AuthModal', 'profile already exists', profileError);
        } else if (profileError.code === '42501') {
          Logger.warn('AuthModal', 'RLS policy blocked profile creation', profileError);
          console.error('[AuthModal] RLS Policy Error - Verifica che le policy per user_profiles permettano INSERT durante signup');
        } else if (profileError.code === '42P01' || profileError.message?.includes('does not exist')) {
          Logger.error('AuthModal', 'Table user_profiles does not exist', profileError);
          console.error('[AuthModal] ERRORE CRITICO: Tabella user_profiles non esiste. Esegui supabase/setup-complete-schema.sql');
        } else {
          Logger.warn('AuthModal', 'profile creation error', profileError);
          console.error('[AuthModal] Profile Error:', profileError);
        }
      }
    } catch (profileErr) {
      Logger.warn('AuthModal', 'profile creation exception', profileErr);
      // Continua anche se fallisce (l'utente può creare il profilo dopo)
    }
    
    // 3. Crea ruolo guest di default (con gestione errori migliorata)
    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'guest',
          valid_until: null // Guest non ha scadenza, ma ha accesso limitato
        });
      
      if (roleError) {
        // Se errore 23505 = unique violation (già esiste), ignora
        // Se errore 42501 = insufficient privilege (RLS), logga ma continua
        // Se errore 42P01 = table does not exist, errore critico
        // Se errore 23514 = check constraint violation (ruolo non valido)
        if (roleError.code === '23505') {
          Logger.debug('AuthModal', 'role already exists', roleError);
        } else if (roleError.code === '42501') {
          Logger.warn('AuthModal', 'RLS policy blocked role creation', roleError);
          console.error('[AuthModal] RLS Policy Error - Verifica che le policy per user_roles permettano INSERT durante signup');
        } else if (roleError.code === '42P01' || roleError.message?.includes('does not exist')) {
          Logger.error('AuthModal', 'Table user_roles does not exist', roleError);
          console.error('[AuthModal] ERRORE CRITICO: Tabella user_roles non esiste. Esegui supabase/setup-complete-schema.sql');
        } else if (roleError.code === '23514' || roleError.message?.includes('check constraint')) {
          Logger.error('AuthModal', 'Role constraint violation - guest role not allowed', roleError);
          console.error('[AuthModal] ERRORE: Ruolo "guest" non è nel constraint. Esegui supabase/migration-add-guest-role.sql');
        } else {
          Logger.warn('AuthModal', 'role creation error', roleError);
          console.error('[AuthModal] Role Error:', roleError);
        }
      }
    } catch (roleErr) {
      Logger.warn('AuthModal', 'role creation exception', roleErr);
      // Continua anche se fallisce (l'utente può creare il ruolo dopo)
    }
    
    // Verifica se email verification è abilitata in Supabase
    // Se email_confirmed_at è null, significa che email verification è abilitata
    // e l'utente deve confermare l'email prima di poter accedere
    const requiresEmailVerification = authData.user.email_confirmed_at === null;
    
    if (requiresEmailVerification) {
      // Email verification abilitata - l'utente deve confermare l'email
      showToast('Account creato! Controlla la tua email e clicca sul link di conferma per attivare l\'account.', 'info');
      state.mode = 'login';
      updateForms();
      
      // Mostra messaggio più dettagliato
      setTimeout(() => {
        showToast('Dopo aver confermato l\'email, potrai accedere con le tue credenziali.', 'info');
      }, 2000);
    } else {
      // Email verification disabilitata - possiamo fare auto-login
      showToast('Registrazione completata! Account creato con ruolo Guest.', 'success');
      
      // Auto-login dopo registrazione con il NUOVO account
      // Assicurati che non ci siano sessioni residue
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError && signInData?.user) {
        Logger.debug('AuthModal', 'Auto-login riuscito dopo signup', { userId: signInData.user.id, email: signInData.user.email });
        closeAfterDelay();
        // Forza reload completo per assicurarsi che la nuova sessione sia caricata
        setTimeout(() => {
          window.location.href = '/user/';
        }, 300);
      } else {
        // Se auto-login fallisce, mostra messaggio
        Logger.warn('AuthModal', 'Auto-login fallito dopo signup', signInError);
        showToast('Account creato. Effettua il login per continuare.', 'info');
        state.mode = 'login';
        updateForms();
      }
    }
  } catch (err) {
    Logger.error('AuthModal', 'signup error', err);
    
    // Log dettagliato per debug
    console.error('[AuthModal] Signup error details:', {
      message: err.message,
      code: err.code,
      status: err.status,
      statusCode: err.statusCode,
      name: err.name,
      error: err,
      fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
    });
    
    // Se c'è un errore più dettagliato, loggalo
    if (err.details) {
      console.error('[AuthModal] Error details:', err.details);
    }
    if (err.hint) {
      console.error('[AuthModal] Error hint:', err.hint);
    }
    
    // Gestione rate limit per email
    let errorMessage = err.message || 'Errore durante la registrazione. Riprova.';
    const errMsgLower = err.message?.toLowerCase() || '';
    const errCode = err.code || '';
    
    if (errMsgLower.includes('rate limit') || 
        errMsgLower.includes('too many requests') ||
        errMsgLower.includes('email rate limit') ||
        errMsgLower.includes('troppe richieste') ||
        errMsgLower.includes('email nuova')) {
      errorMessage = 'Troppe richieste di registrazione. Attendi 10-15 minuti prima di riprovare, oppure prova con un\'email diversa.';
    } else if (errMsgLower.includes('user already registered') || 
               errMsgLower.includes('already exists') ||
               errMsgLower.includes('already registered') ||
               errCode === '23505') {
      errorMessage = 'Questa email è già registrata. Prova ad accedere invece di registrarti.';
      // Cambia automaticamente al tab login
      setTimeout(() => {
        state.mode = 'login';
        updateForms();
        // Pre-compila email nel form login
        const loginEmailInput = state.root.querySelector('#auth-email-login');
        if (loginEmailInput) {
          loginEmailInput.value = email;
        }
      }, 500);
    } else if (errMsgLower.includes('error sending email') ||
               errMsgLower.includes('email confirmation')) {
      errorMessage = 'Account creato ma email di verifica non inviata. Controlla la configurazione SMTP in Supabase. Puoi comunque accedere.';
      // Prova auto-login comunque
      setTimeout(async () => {
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError) {
            showToast('Accesso effettuato. Account creato con successo.', 'success');
            closeAfterDelay();
            setTimeout(() => {
              window.location.href = '/user/';
            }, 300);
          }
        } catch (loginErr) {
          Logger.warn('AuthModal', 'auto-login after email error failed', loginErr);
        }
      }, 1000);
    } else if (errCode === '42501' || errMsgLower.includes('permission denied') || errMsgLower.includes('insufficient privilege')) {
      errorMessage = 'Errore di permessi. Esegui lo script supabase/setup-complete-schema.sql in Supabase per configurare le RLS policies.';
    } else if (errCode === '42P01' || errMsgLower.includes('does not exist') || errMsgLower.includes('non esiste')) {
      errorMessage = 'Tabelle mancanti. Esegui lo script supabase/setup-complete-schema.sql in Supabase SQL Editor.';
    } else if (errCode === '23514' || errMsgLower.includes('check constraint') || errMsgLower.includes('violates check constraint')) {
      errorMessage = 'Errore constraint. Esegui supabase/migration-add-guest-role.sql per aggiungere il ruolo "guest".';
    } else if (err.status === 500 || errCode === 'PGRST' || errMsgLower.includes('unexpected_failure')) {
      // Errore 500 da Supabase Auth - probabilmente SMTP o configurazione
      if (errMsgLower.includes('email') || errMsgLower.includes('smtp') || errMsgLower.includes('mail')) {
        errorMessage = 'Errore invio email. Disabilita email verification in Supabase (Auth → Settings) oppure configura SMTP correttamente.';
      } else {
        errorMessage = 'Errore server Supabase. Verifica: 1) Email verification disabilitata O 2) SMTP configurato correttamente. Vedi SUPABASE-500-SIGNUP-FIX.md';
      }
    }
    
    // Mostra errore inline se possibile
    if (errMsgLower.includes('email') || errMsgLower.includes('already registered') || errCode === '23505') {
      showFieldError(form.querySelector('#auth-email-register'), errorMessage);
    } else if (errMsgLower.includes('password')) {
      showFieldError(form.querySelector('#auth-password-register'), errorMessage);
    } else {
      showToast(errorMessage, 'error');
    }
  } finally {
    state.busy = false;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = originalText;
    }
  }
}

async function handleReset(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  if (!email) {
    showFieldError(form.querySelector('#auth-email-reset'), 'Inserisci la mail associata all\'account.');
    return;
  }
  
  state.busy = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn?.textContent || 'Invia link di reset';
  submitBtn.disabled = true;
  submitBtn.setAttribute('aria-busy', 'true');
  submitBtn.textContent = 'Invio in corso...';
  
  // Pulisci errori precedenti
  clearFieldError(form.querySelector('#auth-email-reset'));
  
  try {
    const redirectTo = `${window.location.origin}/user/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    showToast('Email inviata. Segui il link per impostare una nuova password.', 'success');
    state.mode = 'login';
    updateForms();
  } catch (err) {
    Logger.error('AuthModal', 'reset error', err);
    
    // Gestione rate limit per email
    let errorMessage = err.message || 'Errore durante il reset.';
    if (err.message && (
      err.message.toLowerCase().includes('rate limit') ||
      err.message.toLowerCase().includes('too many requests') ||
      err.message.toLowerCase().includes('email rate limit')
    )) {
      errorMessage = 'Troppe richieste di reset password. Attendi qualche minuto prima di riprovare.';
    } else if (err.message?.toLowerCase().includes('email') || err.message?.toLowerCase().includes('user')) {
      errorMessage = 'Email non trovata o non valida.';
    }
    
    showFieldError(form.querySelector('#auth-email-reset'), errorMessage);
  } finally {
    state.busy = false;
    submitBtn.disabled = false;
    submitBtn.removeAttribute('aria-busy');
    submitBtn.textContent = originalText;
  }
}

function updateForms() {
  if (!state.root) return;
  
  // NASCONDI TUTTI i form PRIMA di mostrare quello attivo
  const forms = state.root.querySelectorAll('[data-auth-form]');
  forms.forEach(form => {
    const mode = form.getAttribute('data-auth-form');
    const isActive = mode === state.mode;
    form.hidden = !isActive;
    // Forza display: none per sicurezza
    if (!isActive) {
      form.style.display = 'none';
    } else {
      form.style.display = '';
    }
  });
  
  // Aggiorna tab attivi
  const tabs = state.root.querySelectorAll('[data-auth-switch]');
  tabs.forEach(btn => {
    const selected = btn.getAttribute('data-auth-switch') === state.mode;
    btn.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
}

function open(mode = 'login') {
  if (!state.initialized) init();
  
  // Salva elemento attivo prima di aprire
  state.previousActiveElement = document.activeElement;
  
  // NASCONDI TUTTI i form PRIMA di cambiare mode
  const allForms = state.root.querySelectorAll('[data-auth-form]');
  allForms.forEach(form => {
    form.hidden = true;
    form.style.display = 'none';
  });
  
  state.mode = mode;
  updateForms();
  state.root.dataset.open = 'true';
  state.root.setAttribute('aria-hidden', 'false');
  
  // Annuncia ai screen reader
  const modal = state.root.querySelector('.auth-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'false');
  }
  
  // Focus management: focus sul primo elemento interattivo
  setTimeout(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Focus sul primo input del form attivo, o sul primo elemento focusable
      const activeForm = state.root.querySelector(`[data-auth-form="${mode}"]`);
      const firstInput = activeForm?.querySelector('input');
      (firstInput || focusableElements[0])?.focus();
    }
  }, 50);
}

function close() {
  if (!state.root) return;
  
  // NASCONDI TUTTI i form prima di chiudere
  const allForms = state.root.querySelectorAll('[data-auth-form]');
  allForms.forEach(form => {
    form.hidden = true;
    form.style.display = 'none';
  });
  
  // Reset to a safe default view to avoid multiple sections visible on next open
  state.mode = 'login';
  updateForms();
  delete state.root.dataset.open;
  state.root.setAttribute('aria-hidden', 'true');
  
  const modal = state.root.querySelector('.auth-modal');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
  }
  
  // Ripristina focus all'elemento precedente
  if (state.previousActiveElement && document.contains(state.previousActiveElement)) {
    state.previousActiveElement.focus();
  }
  state.previousActiveElement = null;
  
  // Pulisci errori
  state.root.querySelectorAll('.auth-field-error').forEach(el => {
    el.textContent = '';
    el.hidden = true;
  });
  state.root.querySelectorAll('.auth-input-error').forEach(el => {
    el.classList.remove('auth-input-error');
    el.removeAttribute('aria-invalid');
  });
  
  // Nascondi password strength indicator
  state.root.querySelectorAll('.auth-password-strength').forEach(el => {
    el.style.display = 'none';
  });
}

function closeAfterDelay() {
  setTimeout(() => close(), 600);
}

function showToast(message, variant = 'info') {
  if (!state.initialized) init();
  const toast = state.root.querySelector('#auth-toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.setAttribute('data-variant', variant);
  
  // Forza reflow per animazione
  toast.offsetHeight;
  
  toast.dataset.visible = 'true';
  
  // Auto-hide dopo 3.5 secondi
  setTimeout(() => {
    toast.removeAttribute('data-visible');
  }, 3500);
}

export const authModal = {
  init,
  open,
  close,
  showToast
};

