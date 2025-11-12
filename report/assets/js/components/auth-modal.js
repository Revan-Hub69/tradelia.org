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
        <div class="auth-header-text">
          <span class="auth-pill">Accesso Istituzionale</span>
          <h2 class="auth-title" id="auth-modal-title">Area Riservata Tradelia</h2>
          <p class="auth-subtitle">
            Accedi con credenziali verificate per commentare i report, proporre analisi e gestire il tuo profilo professionale.
          </p>
        </div>
        <button type="button" class="auth-close" data-auth-close aria-label="Chiudi">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </header>
      <nav class="auth-tabs" role="tablist" aria-label="Modalità di accesso">
        <button type="button" role="tab" data-auth-switch="login" aria-selected="true">
          <span class="auth-tab-label">Accedi</span>
          <span class="auth-tab-hint">Utenti verificati</span>
        </button>
        <button type="button" role="tab" data-auth-switch="register" aria-selected="false">
          <span class="auth-tab-label">Registrati</span>
          <span class="auth-tab-hint">Piani Pro & Institutional</span>
        </button>
        <button type="button" role="tab" data-auth-switch="reset" aria-selected="false">
          <span class="auth-tab-label">Recupera password</span>
          <span class="auth-tab-hint">Invia link sicuro</span>
        </button>
      </nav>
      <div class="auth-body">
        <form id="auth-login-form" data-auth-form="login" class="auth-form" novalidate>
          <div class="auth-field">
            <label for="auth-email-login">Email aziendale</label>
            <input id="auth-email-login" type="email" name="email" autocomplete="email" required placeholder="nome@azienda.com">
          </div>
          <div class="auth-field">
            <label for="auth-password-login">Password</label>
            <input id="auth-password-login" type="password" name="password" autocomplete="current-password" required minlength="8" placeholder="Password">
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">Accedi</button>
            <p class="auth-trust-caption">Connessione crittografata · Sessione persistente per 7 giorni</p>
          </div>
        </form>
        <div id="auth-register-card" data-auth-form="register" class="auth-form auth-register" hidden>
          <div class="auth-register-copy">
            <h3>Attiva un piano professionale</h3>
            <p>
              Stiamo integrando checkout certificati (Lemon&nbsp;Squeezy / Paddle) per una gestione autonoma delle licenze.
              Nell’attesa puoi richiedere l’upgrade dalla pagina pricing ufficiale: il team accelera l’onboarding in 24h.
            </p>
          </div>
          <ul class="auth-register-list">
            <li>
              <strong>Commenti e richieste</strong>
              <span>Interagisci con l’ufficio studi sui report live.</span>
            </li>
            <li>
              <strong>Analisi dedicate</strong>
              <span>Prenota slot giornalieri per richieste su ticker specifici.</span>
            </li>
            <li>
              <strong>Profilo verificato</strong>
              <span>Badge istituzionale con dati certificati dal team Tradelia.</span>
            </li>
          </ul>
          <button type="button" class="btn btn-primary" data-auth-pricing>Vai alla pagina Pricing</button>
          <p class="auth-hint">Pro e Institutional sono soggetti a verifica KYC aziendale.</p>
        </div>
        <form id="auth-reset-form" data-auth-form="reset" class="auth-form" hidden novalidate>
          <div class="auth-field">
            <label for="auth-email-reset">Email registrata</label>
            <input id="auth-email-reset" type="email" name="email" autocomplete="email" required placeholder="nome@azienda.com">
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">Invia link di reset</button>
            <p class="auth-trust-caption">Riceverai un link valido 30 minuti.</p>
          </div>
          <p class="auth-hint">Controlla anche la cartella spam se non ricevi l’email entro pochi minuti.</p>
        </form>
      </div>
      <footer class="auth-footer">
        <div class="auth-footer-grid">
          <p class="auth-support">Assistenza dedicata: <a href="mailto:info@tradelia.org">info@tradelia.org</a></p>
          <div class="auth-meta">
            <span>Standard WCAG 2.2 AA</span>
            <span>Infrastruttura Supabase EU</span>
          </div>
        </div>
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
  const resetForm = state.root.querySelector('#auth-reset-form');
  const pricingBtn = state.root.querySelector('[data-auth-pricing]');

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
  resetForm.addEventListener('submit', handleReset);
  pricingBtn?.addEventListener('click', () => {
    window.location.href = '/pricing.html';
  });
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

