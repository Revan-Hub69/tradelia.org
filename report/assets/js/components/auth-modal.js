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
          <p class="auth-subtitle">
            Credenziali verificate per commenti, richieste analisi e gestione profilo professionale.
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
          <span class="auth-tab-hint">Account gratuito</span>
        </button>
        <button type="button" role="tab" data-auth-switch="reset" aria-selected="false">
          <span class="auth-tab-label">Recupera password</span>
          <span class="auth-tab-hint">Invia link sicuro</span>
        </button>
      </nav>
      <div class="auth-body">
        <form id="auth-login-form" data-auth-form="login" class="auth-form" novalidate>
          <div class="auth-field">
            <label for="auth-email-login">Email</label>
            <input id="auth-email-login" type="email" name="email" autocomplete="email" required placeholder="nome@email.com">
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
        <form id="auth-register-form" data-auth-form="register" class="auth-form" hidden novalidate>
          <p class="auth-register-intro" style="font-size: 0.875rem; color: var(--ink-soft); margin-bottom: 1.5rem;">
            Crea un account gratuito. Riceverai un ruolo Guest con accesso limitato. Puoi attivare una prova gratuita di 14 giorni in qualsiasi momento.
          </p>
          <div class="auth-field">
            <label for="auth-email-register">Email</label>
            <input id="auth-email-register" type="email" name="email" autocomplete="email" required placeholder="nome@email.com">
          </div>
          <div class="auth-field">
            <label for="auth-password-register">Password</label>
            <input id="auth-password-register" type="password" name="password" autocomplete="new-password" required minlength="8" placeholder="Password (minimo 8 caratteri)">
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">Crea account</button>
            <p class="auth-trust-caption">Connessione crittografata · Account verificato</p>
          </div>
          <p class="auth-hint" style="font-size: 0.75rem; color: var(--ink-soft); margin-top: 1rem; text-align: center;">
            Registrandoti, accetti i <a href="/terms.html" style="color: var(--brand-600);">Termini di servizio</a> e la <a href="/privacy.html" style="color: var(--brand-600);">Privacy Policy</a>.
          </p>
        </form>
        <form id="auth-reset-form" data-auth-form="reset" class="auth-form" hidden novalidate>
          <div class="auth-field">
            <label for="auth-email-reset">Email</label>
            <input id="auth-email-reset" type="email" name="email" autocomplete="email" required placeholder="nome@email.com">
          </div>
          <div class="auth-actions">
            <button class="btn btn-primary" type="submit">Invia link di reset</button>
            <p class="auth-trust-caption">Riceverai un link valido 1 ora.</p>
          </div>
          <p class="auth-hint">Controlla anche la cartella spam se non ricevi l'email entro pochi minuti.</p>
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
  const tabsContainer = state.root.querySelector('.auth-tabs');
  const loginForm = state.root.querySelector('#auth-login-form');
  const registerForm = state.root.querySelector('#auth-register-form');
  const resetForm = state.root.querySelector('#auth-reset-form');

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
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
    // Chiudi il modal e reindirizza all’area utente
    closeAfterDelay();
    setTimeout(() => {
      window.location.href = '/user/';
    }, 300);
  } catch (err) {
    Logger.error('AuthModal', 'login error', err);
    const message = err?.message || 'Credenziali non valide.';
    if (/api key/i.test(message)) {
      showToast('Configurazione API non valida. Verifica la Supabase anon key sul deploy.', 'error');
    } else {
      showToast(message, 'error');
    }
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
    showToast('Inserisci email e password.', 'error');
    return;
  }
  
  if (password.length < 8) {
    showToast('La password deve essere di almeno 8 caratteri.', 'error');
    return;
  }
  
  state.busy = true;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrazione...';
  }
  
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
    
    showToast(errorMessage, 'error');
  } finally {
    state.busy = false;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crea account';
    }
  }
}

async function handleReset(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.currentTarget;
  const email = form.email.value.trim();
  if (!email) {
    showToast('Inserisci la mail associata all\'account.', 'error');
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
    
    // Gestione rate limit per email
    let errorMessage = err.message || 'Errore durante il reset.';
    if (err.message && (
      err.message.toLowerCase().includes('rate limit') ||
      err.message.toLowerCase().includes('too many requests') ||
      err.message.toLowerCase().includes('email rate limit')
    )) {
      errorMessage = 'Troppe richieste di reset password. Attendi qualche minuto prima di riprovare.';
    }
    
    showToast(errorMessage, 'error');
  } finally {
    state.busy = false;
    form.querySelector('button[type="submit"]').disabled = false;
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
  
  // NASCONDI TUTTI i form PRIMA di cambiare mode
  const allForms = state.root.querySelectorAll('[data-auth-form]');
  allForms.forEach(form => {
    form.hidden = true;
    form.style.display = 'none';
  });
  
  state.mode = mode;
  updateForms();
  state.root.dataset.open = 'true';
  
  setTimeout(() => {
    const focusTarget = state.root.querySelector(`[data-auth-form="${mode}"] input`);
    focusTarget?.focus();
  }, 10);
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

