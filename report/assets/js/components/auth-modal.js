import { supabase } from '../supabase-client.js';
import Logger from '../utils/logger.js';

const state = {
  root: null,
  mode: 'login',
  busy: false,
  initialized: false
};

function init() {
  if (state.initialized) return;
  state.root = document.createElement('div');
  state.root.id = 'auth-overlay';
  state.root.className = 'auth-overlay';
  state.root.innerHTML = template();
  document.body.appendChild(state.root);
  registerEvents();
  state.initialized = true;
}

function template() {
  return `
    <div class="auth-backdrop" data-auth-dismiss></div>
    <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <header class="auth-header">
        <div>
          <h2 class="auth-title" id="auth-modal-title">Accesso Tradelia</h2>
          <p class="auth-subtitle">Credenziali istituzionali per commenti, richieste e area riservata.</p>
        </div>
        <button type="button" class="auth-close" data-auth-close aria-label="Chiudi">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </header>
      <nav class="auth-tabs" role="tablist">
        <button type="button" role="tab" data-auth-switch="login" aria-selected="true">Accedi</button>
        <button type="button" role="tab" data-auth-switch="signup" aria-selected="false">Richiedi accesso</button>
        <button type="button" role="tab" data-auth-switch="reset" aria-selected="false">Recupera password</button>
      </nav>
      <div class="auth-body">
        <form id="auth-login-form" data-auth-form="login">
          <label>Email aziendale<input type="email" name="email" autocomplete="email" required placeholder="nome@azienda.com"></label>
          <label>Password<input type="password" name="password" autocomplete="current-password" required minlength="8" placeholder="Password"></label>
          <button class="btn btn-primary" type="submit">Accedi</button>
        </form>
        <form id="auth-signup-form" data-auth-form="signup" hidden>
          <label>Email istituzionale<input type="email" name="email" autocomplete="email" required placeholder="nome@company.com"></label>
          <label>Password<input type="password" name="password" autocomplete="new-password" required minlength="8" placeholder="Password (min 8 caratteri)"></label>
          <button class="btn btn-primary" type="submit">Richiedi credenziali</button>
          <p class="auth-hint">Riceverai una mail per confermare l’account. Il team Tradelia abiliterà il ruolo corretto.</p>
        </form>
        <form id="auth-reset-form" data-auth-form="reset" hidden>
          <label>Email registrata<input type="email" name="email" autocomplete="email" required placeholder="nome@azienda.com"></label>
          <button class="btn btn-primary" type="submit">Invia link di reset</button>
          <p class="auth-hint">Ti invieremo un link per impostare una nuova password.</p>
        </form>
      </div>
      <footer class="auth-footer">
        <p>Problemi con l’accesso? Scrivi a <a href="mailto:info@tradelia.org">info@tradelia.org</a>.</p>
      </footer>
      <div class="auth-toast" id="auth-toast" role="status" aria-live="polite"></div>
    </div>
  `;
}

function registerEvents() {
  const closeBtn = state.root.querySelector('[data-auth-close]');
  const backdrop = state.root.querySelector('[data-auth-dismiss]');
  const switchers = state.root.querySelectorAll('[data-auth-switch]');
  const loginForm = state.root.querySelector('#auth-login-form');
  const signupForm = state.root.querySelector('#auth-signup-form');
  const resetForm = state.root.querySelector('#auth-reset-form');

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', handleEscape);

  switchers.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-auth-switch');
      open(mode);
    });
  });

  loginForm.addEventListener('submit', handleLogin);
  signupForm.addEventListener('submit', handleSignup);
  resetForm.addEventListener('submit', handleReset);
}

function handleEscape(event) {
  if (event.key === 'Escape' && state.root?.dataset.open === 'true') {
    close();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) {
    showToast('Inserisci email e password.', 'error');
    return;
  }
  state.busy = true;
  form.querySelector('button[type="submit"]').disabled = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast('Accesso effettuato.', 'success');
    closeAfterDelay();
  } catch (err) {
    Logger.error('AuthModal', 'login error', err);
    showToast(err.message || 'Credenziali non valide.', 'error');
  } finally {
    state.busy = false;
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

async function handleSignup(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) {
    showToast('Compila tutti i campi.', 'error');
    return;
  }
  state.busy = true;
  form.querySelector('button[type="submit"]').disabled = true;
  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    showToast('Controlla la mail per confermare l’account.', 'success');
    state.mode = 'login';
    updateForms();
  } catch (err) {
    Logger.error('AuthModal', 'signup error', err);
    showToast(err.message || 'Registrazione non riuscita.', 'error');
  } finally {
    state.busy = false;
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

async function handleReset(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  if (!email) {
    showToast('Inserisci la mail associata all’account.', 'error');
    return;
  }
  state.busy = true;
  form.querySelector('button[type="submit"]').disabled = true;
  try {
    const redirectTo = `${window.location.origin}/user/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    showToast('Email inviata. Segui il link per impostare una nuova password.', 'success');
    state.mode = 'login';
    updateForms();
  } catch (err) {
    Logger.error('AuthModal', 'reset error', err);
    showToast(err.message || 'Errore durante il reset.', 'error');
  } finally {
    state.busy = false;
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

function updateForms() {
  if (!state.root) return;
  const forms = state.root.querySelectorAll('[data-auth-form]');
  forms.forEach(form => {
    const mode = form.getAttribute('data-auth-form');
    form.hidden = mode !== state.mode;
  });
  const tabs = state.root.querySelectorAll('[data-auth-switch]');
  tabs.forEach(btn => {
    const selected = btn.getAttribute('data-auth-switch') === state.mode;
    btn.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
}

function open(mode = 'login') {
  if (!state.initialized) init();
  state.mode = mode;
  updateForms();
  state.root.dataset.open = 'true';
  setTimeout(() => {
    const focusTarget = state.root.querySelector(`[data-auth-form="${mode}"] input`);
    focusTarget?.focus();
  }, 10);
}

function close() {
  if (state.root) {
    delete state.root.dataset.open;
  }
}

function closeAfterDelay() {
  setTimeout(() => close(), 600);
}

function showToast(message, variant = 'info') {
  if (!state.initialized) init();
  const toast = state.root.querySelector('#auth-toast');
  toast.textContent = message;
  toast.setAttribute('data-variant', variant);
  toast.dataset.visible = 'true';
  setTimeout(() => {
    toast.removeAttribute('data-visible');
  }, 3200);
}

export const authModal = {
  init,
  open,
  close,
  showToast
};

