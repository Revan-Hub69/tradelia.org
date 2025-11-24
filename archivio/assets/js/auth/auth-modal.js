/**
 * Auth Modal - Modale Unificata Login/Registrazione
 */

import { login, register, onAuthStateChange, getSupabaseClient } from './auth-manager.js';
import Logger from '/report/assets/js/utils/logger.js';

let currentModal = null;
let authStateUnsubscribe = null;

export function createAuthModal() {
  removeAuthModal();

  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.className = 'auth-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'auth-modal-title');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <div class="auth-modal-backdrop" data-close-modal></div>
    <div class="auth-modal-content">
      <button class="auth-modal-close" aria-label="Chiudi modale" data-close-modal>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="auth-modal-header">
        <h2 id="auth-modal-title" class="auth-modal-title">Accedi</h2>
        <p class="auth-modal-subtitle">Accedi al tuo account Tradelia AI</p>
      </div>
      <div class="auth-modal-tabs">
        <button class="auth-tab active" data-tab="login" aria-selected="true">Accedi</button>
        <button class="auth-tab" data-tab="register" aria-selected="false">Registrati</button>
      </div>
      <form id="auth-login-form" class="auth-form active" data-form="login">
        <div class="form-group">
          <label for="auth-email">Email</label>
          <input type="email" id="auth-email" name="email" required autocomplete="email" aria-required="true" />
        </div>
        <div class="form-group">
          <label for="auth-password">Password</label>
          <input type="password" id="auth-password" name="password" required autocomplete="current-password" aria-required="true" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Accedi</button>
        </div>
        <div class="form-footer">
          <button type="button" class="btn-link" data-show-forgot-password>Password dimenticata?</button>
        </div>
      </form>
      <form id="auth-register-form" class="auth-form" data-form="register" hidden>
        <div class="form-group">
          <label for="auth-register-email">Email</label>
          <input type="email" id="auth-register-email" name="email" required autocomplete="email" aria-required="true" />
        </div>
        <div class="form-group">
          <label for="auth-register-password">Password</label>
          <input type="password" id="auth-register-password" name="password" required autocomplete="new-password" aria-required="true" minlength="8" />
          <small class="form-hint">Minimo 8 caratteri</small>
        </div>
        <div class="form-group">
          <label for="auth-register-password-confirm">Conferma Password</label>
          <input type="password" id="auth-register-password-confirm" name="passwordConfirm" required autocomplete="new-password" aria-required="true" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Registrati</button>
        </div>
      </form>
      <form id="auth-forgot-password-form" class="auth-form" data-form="forgot-password" hidden>
        <div class="form-group">
          <label for="auth-reset-email">Email</label>
          <input type="email" id="auth-reset-email" name="email" required autocomplete="email" aria-required="true" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-block">Invia link reset</button>
        </div>
        <div class="form-footer">
          <button type="button" class="btn-link" data-back-to-login>Torna al login</button>
        </div>
      </form>
      <div id="auth-message" class="auth-message" role="alert" hidden></div>
    </div>
  `;

  document.body.appendChild(modal);
  currentModal = modal;
  setupModalListeners();

  authStateUnsubscribe = onAuthStateChange((event) => {
    if (event.newState !== 'guest') {
      setTimeout(() => removeAuthModal(), 500);
    }
  });

  const firstInput = modal.querySelector('input[type="email"]');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 100);
  }

  return modal;
}

function setupModalListeners() {
  if (!currentModal) return;

  const closeButtons = currentModal.querySelectorAll('[data-close-modal]');
  closeButtons.forEach(btn => btn.addEventListener('click', removeAuthModal));

  const tabs = currentModal.querySelectorAll('.auth-tab');
  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

  const loginForm = currentModal.querySelector('#auth-login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const registerForm = currentModal.querySelector('#auth-register-form');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);

  const forgotPasswordForm = currentModal.querySelector('#auth-forgot-password-form');
  if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);

  const forgotPasswordLink = currentModal.querySelector('[data-show-forgot-password]');
  if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', () => switchTab('forgot-password'));

  const backToLogin = currentModal.querySelector('[data-back-to-login]');
  if (backToLogin) backToLogin.addEventListener('click', () => switchTab('login'));

  document.addEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(event) {
  if (event.key === 'Escape' && currentModal) {
    removeAuthModal();
  }
}

function switchTab(tabName) {
  if (!currentModal) return;

  const tabs = currentModal.querySelectorAll('.auth-tab');
  tabs.forEach(tab => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive);
  });

  const forms = currentModal.querySelectorAll('.auth-form');
  forms.forEach(form => {
    const isActive = form.dataset.form === tabName;
    form.hidden = !isActive;
    form.classList.toggle('active', isActive);
  });

  const title = currentModal.querySelector('#auth-modal-title');
  if (title) {
    const titles = { login: 'Accedi', register: 'Registrati', 'forgot-password': 'Password dimenticata' };
    title.textContent = titles[tabName] || 'Accedi';
  }

  clearMessage();

  const activeForm = currentModal.querySelector(`[data-form="${tabName}"]`);
  if (activeForm) {
    const firstInput = activeForm.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  clearMessage();

  const form = event.target;
  const email = form.querySelector('#auth-email').value;
  const password = form.querySelector('#auth-password').value;
  const submitBtn = form.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Accesso in corso...';

  try {
    const result = await login(email, password);
    if (result.success) {
      showMessage('Login riuscito! Reindirizzamento...', 'success');
    } else {
      showMessage(result.error || 'Errore durante il login', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Accedi';
    }
  } catch (error) {
    Logger.error('AuthModal', 'Errore login', error);
    showMessage('Errore durante il login. Riprova.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Accedi';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  clearMessage();

  const form = event.target;
  const email = form.querySelector('#auth-register-email').value;
  const password = form.querySelector('#auth-register-password').value;
  const passwordConfirm = form.querySelector('#auth-register-password-confirm').value;
  const submitBtn = form.querySelector('button[type="submit"]');

  if (password !== passwordConfirm) {
    showMessage('Le password non corrispondono', 'error');
    return;
  }

  if (password.length < 8) {
    showMessage('La password deve essere di almeno 8 caratteri', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Registrazione in corso...';

  try {
    const result = await register(email, password);
    if (result.success) {
      if (result.requiresConfirmation) {
        showMessage(result.message || 'Email di conferma inviata. Controlla la tua casella email.', 'success');
        setTimeout(() => {
          switchTab('login');
          showMessage('Ora puoi accedere dopo aver confermato l\'email', 'info');
        }, 3000);
      } else {
        showMessage('Registrazione completata!', 'success');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Registrati';
    } else {
      showMessage(result.error || 'Errore durante la registrazione', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Registrati';
    }
  } catch (error) {
    Logger.error('AuthModal', 'Errore registrazione', error);
    showMessage('Errore durante la registrazione. Riprova.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Registrati';
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  clearMessage();

  const form = event.target;
  const email = form.querySelector('#auth-reset-email').value;
  const submitBtn = form.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Invio in corso...';

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/archivio/dashboard.html?reset=true`,
    });

    if (error) throw error;

    showMessage('Email di ripristino inviata! Controlla la tua casella email.', 'success');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Invia link reset';
  } catch (error) {
    Logger.error('AuthModal', 'Errore forgot password', error);
    showMessage(error.message || 'Errore durante l\'invio. Riprova.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Invia link reset';
  }
}

function showMessage(message, type = 'info') {
  if (!currentModal) return;
  const messageEl = currentModal.querySelector('#auth-message');
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.className = `auth-message auth-message-${type}`;
  messageEl.hidden = false;
  messageEl.setAttribute('role', 'alert');

  if (type === 'success' || type === 'info') {
    setTimeout(() => clearMessage(), 5000);
  }
}

function clearMessage() {
  if (!currentModal) return;
  const messageEl = currentModal.querySelector('#auth-message');
  if (messageEl) {
    messageEl.hidden = true;
    messageEl.textContent = '';
  }
}

export function removeAuthModal() {
  if (currentModal) {
    document.removeEventListener('keydown', handleEscapeKey);
    if (authStateUnsubscribe) {
      authStateUnsubscribe();
      authStateUnsubscribe = null;
    }
    currentModal.remove();
    currentModal = null;
  }
}

export function showAuthModal(initialTab = 'login') {
  const modal = createAuthModal();
  if (initialTab !== 'login') {
    switchTab(initialTab);
  }
  return modal;
}

