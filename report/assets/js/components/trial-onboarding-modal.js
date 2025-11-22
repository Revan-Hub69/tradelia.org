// /report/assets/js/components/trial-onboarding-modal.js
// Componente modale multi-step per onboarding trial (best practice 2024-25)
// Gestisce: Individuale/Business → Raccolta dati Business → Creazione account automatica → Attivazione trial

import { supabase } from '../supabase-client.js';
import Logger from '../utils/logger.js';

const state = {
  root: null,
  modal: null,
  currentStep: 1,
  totalSteps: 3,
  userType: null, // 'individual' | 'business'
  businessData: {},
  planType: null, // 'trial' | 'pro'
  provider: null, // 'xolo' | 'paddle'
  initialized: false,
  previousActiveElement: null,
};

const STEPS = {
  TYPE_SELECTION: 1, // Individuale/Business
  BUSINESS_DATA: 2, // Raccolta dati business (solo se business)
  ACCOUNT_CREATION: 3, // Creazione account / Login
};

function init() {
  if (state.initialized) return;
  state.root = document.createElement('div');
  state.root.id = 'trial-onboarding-overlay';
  state.root.className = 'auth-overlay';
  state.root.setAttribute('aria-hidden', 'true');
  state.root.innerHTML = template();
  document.body.appendChild(state.root);
  state.modal = state.root.querySelector('.auth-modal');
  registerEvents();
  setupKeyboardNavigation();
  state.initialized = true;
}

function template() {
  return `
    <div class="auth-backdrop" data-trial-dismiss></div>
    <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="trial-modal-title">
      <header class="auth-header">
        <div class="auth-header-text">
          <h2 class="auth-title" id="trial-modal-title">Attiva Prova Gratuita</h2>
          <div class="trial-progress" id="trial-progress">
            <div class="trial-progress-bar" id="trial-progress-bar">
              <div class="trial-progress-fill"></div>
            </div>
            <span class="trial-progress-text" id="trial-progress-text">Passo 1 di 3</span>
          </div>
        </div>
        <button type="button" class="auth-close" data-trial-close aria-label="Chiudi">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </header>
      
      <div class="auth-body">
        <!-- STEP 1: Tipo utente (Individuale/Business) -->
        <div class="trial-step" id="step-1" data-step="1">
          <h3 style="font-size: var(--fs-18); font-weight: 700; color: var(--ink); margin-bottom: var(--sp-4);">
            Sei un utente individuale o un'azienda?
          </h3>
          <p style="color: var(--muted); font-size: var(--fs-14); margin-bottom: var(--sp-6); line-height: var(--lh-17);">
            Scegli il tipo di account per personalizzare la tua esperienza e la fatturazione.
          </p>
          
          <div class="trial-type-selector" style="display: grid; gap: var(--sp-4); margin-bottom: var(--sp-6);">
            <button type="button" class="trial-type-card" data-user-type="individual" style="
              padding: var(--sp-6);
              background: var(--surface-card);
              border: 2px solid var(--br-card);
              border-radius: var(--radius-lg);
              text-align: left;
              cursor: pointer;
              transition: all var(--transition-base);
            ">
              <div style="display: flex; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-2);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <strong style="font-size: var(--fs-16); color: var(--ink);">Utente Individuale</strong>
              </div>
              <p style="font-size: var(--fs-13); color: var(--muted); margin: 0; line-height: var(--lh-16);">
                Per uso personale. Fatturazione semplificata senza P.IVA.
              </p>
            </button>
            
            <button type="button" class="trial-type-card" data-user-type="business" style="
              padding: var(--sp-6);
              background: var(--surface-card);
              border: 2px solid var(--br-card);
              border-radius: var(--radius-lg);
              text-align: left;
              cursor: pointer;
              transition: all var(--transition-base);
            ">
              <div style="display: flex; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-2);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <strong style="font-size: var(--fs-16); color: var(--ink);">Azienda / Business</strong>
              </div>
              <p style="font-size: var(--fs-13); color: var(--muted); margin: 0; line-height: var(--lh-16);">
                Per team e professionisti. Fatturazione con P.IVA e dati aziendali.
              </p>
            </button>
          </div>
        </div>
        
        <!-- STEP 2: Raccolta dati business (solo se business) -->
        <div class="trial-step" id="step-2" data-step="2" hidden>
          <h3 style="font-size: var(--fs-18); font-weight: 700; color: var(--ink); margin-bottom: var(--sp-4);">
            Dati Aziendali
          </h3>
          <p style="color: var(--muted); font-size: var(--fs-14); margin-bottom: var(--sp-6); line-height: var(--lh-17);">
            Compila i dati per la fatturazione aziendale. Questi dati verranno utilizzati per generare le fatture conformi.
          </p>
          
          <form id="trial-business-form" class="auth-form" novalidate>
            <!-- Dati Cliente Xolo -->
            <h4 style="font-size: var(--fs-15); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-4); margin-top: 0;">Dati Cliente</h4>
            
            <div class="auth-field">
              <label for="business-name">Nome / Ragione Sociale *</label>
              <input id="business-name" type="text" name="businessName" required placeholder="Es. Acme S.r.l. o Mario Rossi">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="business-country">Paese *</label>
              <select id="business-country" name="businessCountry" required>
                <option value="">Seleziona...</option>
                <option value="IT" selected>Italia</option>
                <option value="AT">Austria</option>
                <option value="BE">Belgio</option>
                <option value="BG">Bulgaria</option>
                <option value="HR">Croazia</option>
                <option value="CY">Cipro</option>
                <option value="CZ">Repubblica Ceca</option>
                <option value="DK">Danimarca</option>
                <option value="EE">Estonia</option>
                <option value="FI">Finlandia</option>
                <option value="FR">Francia</option>
                <option value="DE">Germania</option>
                <option value="GR">Grecia</option>
                <option value="HU">Ungheria</option>
                <option value="IE">Irlanda</option>
                <option value="LV">Lettonia</option>
                <option value="LT">Lituania</option>
                <option value="LU">Lussemburgo</option>
                <option value="MT">Malta</option>
                <option value="NL">Paesi Bassi</option>
                <option value="PL">Polonia</option>
                <option value="PT">Portogallo</option>
                <option value="RO">Romania</option>
                <option value="SK">Slovacchia</option>
                <option value="SI">Slovenia</option>
                <option value="ES">Spagna</option>
                <option value="SE">Svezia</option>
                <option value="GB">Regno Unito</option>
                <option value="OTHER">Altro</option>
              </select>
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="business-language">Lingua di fatturazione preferita</label>
              <select id="business-language" name="businessLanguage">
                <option value="it" selected>Italiano</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
              <span class="auth-field-hint">Lingua utilizzata per le fatture</span>
            </div>
            
            <!-- Indirizzo e dettagli di fatturazione -->
            <h4 style="font-size: var(--fs-15); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-4); margin-top: var(--sp-6);">Indirizzo e Dettagli di Fatturazione</h4>
            
            <div class="auth-field">
              <label for="business-address">Via *</label>
              <input id="business-address" type="text" name="businessAddress" required placeholder="Es. Via Roma 123">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="business-city">Città *</label>
              <input id="business-city" type="text" name="businessCity" required placeholder="Es. Milano">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="business-zip">CAP *</label>
              <input id="business-zip" type="text" name="businessZip" required placeholder="Es. 20100" pattern="[0-9]{5}">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="business-vat">Partita IVA (con prefisso del paese)</label>
              <input id="business-vat" type="text" name="businessVat" placeholder="Es. IT12345678901">
              <span class="auth-field-hint">Se non hai P.IVA, lascia vuoto</span>
            </div>
            
            <div class="auth-field">
              <label for="business-tax-id">Codice Fiscale</label>
              <input id="business-tax-id" type="text" name="businessTaxId" placeholder="Es. RSSMRA80A01H501U">
              <span class="auth-field-hint">Solo se diverso da P.IVA</span>
            </div>
            
            <div class="auth-field">
              <label for="business-invoice-days">Giorni di scadenza della fattura</label>
              <select id="business-invoice-days" name="businessInvoiceDays">
                <option value="0" selected>Immediata</option>
                <option value="7">7 giorni</option>
                <option value="15">15 giorni</option>
                <option value="30">30 giorni</option>
                <option value="60">60 giorni</option>
                <option value="90">90 giorni</option>
              </select>
              <span class="auth-field-hint">Termine di pagamento standard</span>
            </div>
            
            <!-- Recapiti -->
            <h4 style="font-size: var(--fs-15); font-weight: 600; color: var(--ink); margin-bottom: var(--sp-4); margin-top: var(--sp-6);">Recapiti</h4>
            
            <div class="auth-field">
              <label for="business-contact-firstname">Nome referente *</label>
              <input id="business-contact-firstname" type="text" name="businessContactFirstname" required placeholder="Es. Mario">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="business-contact-lastname">Cognome referente *</label>
              <input id="business-contact-lastname" type="text" name="businessContactLastname" required placeholder="Es. Rossi">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="business-contact-email">Email referente *</label>
              <input id="business-contact-email" type="email" name="businessContactEmail" required placeholder="referente@azienda.com">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
              <span class="auth-field-hint">Email per comunicazioni e fatture</span>
            </div>
            
            <div class="auth-field">
              <label for="business-comments">Commenti aggiuntivi</label>
              <textarea id="business-comments" name="businessComments" rows="3" placeholder="Note aggiuntive per la fatturazione (opzionale)"></textarea>
            </div>
            
            <div class="auth-actions" style="margin-top: var(--sp-6);">
              <button type="button" class="btn btn-outline btn-sm" data-trial-back>Indietro</button>
              <button type="submit" class="btn btn-primary btn-sm">Continua</button>
            </div>
          </form>
        </div>
        
        <!-- STEP 3: Account creation / Login -->
        <div class="trial-step" id="step-3" data-step="3" hidden>
          <h3 style="font-size: var(--fs-18); font-weight: 700; color: var(--ink); margin-bottom: var(--sp-4);">
            ${state.userType === 'business' ? 'Crea Account Aziendale' : 'Crea il Tuo Account'}
          </h3>
          <p style="color: var(--muted); font-size: var(--fs-14); margin-bottom: var(--sp-6); line-height: var(--lh-17);">
            ${getAccountCreationMessage()}
          </p>
          
          <div id="trial-account-info" style="
            padding: var(--sp-4);
            background: var(--surface-elev);
            border-radius: var(--radius-md);
            border: 1px solid var(--br-card);
            margin-bottom: var(--sp-6);
          ">
            <p style="font-size: var(--fs-13); color: var(--ink-soft); margin: 0; line-height: var(--lh-16);">
              <strong style="color: var(--ink);">Cosa succede dopo:</strong><br>
              • Creeremo automaticamente il tuo account Tradelia<br>
              • Attiveremo la prova gratuita di 14 giorni<br>
              • Ti invieremo le credenziali via email<br>
              • Potrai accedere immediatamente alla dashboard
            </p>
          </div>
          
          <form id="trial-account-form" class="auth-form" novalidate>
            <div class="auth-field">
              <label for="trial-email">Email *</label>
              <input id="trial-email" type="email" name="email" autocomplete="email" required placeholder="nome@email.com">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-field">
              <label for="trial-password">Password *</label>
              <div class="auth-password-wrapper">
                <input id="trial-password" type="password" name="password" autocomplete="new-password" required minlength="8" placeholder="Minimo 8 caratteri">
                <button type="button" class="auth-password-toggle" aria-label="Mostra password" data-password-toggle="trial-password">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
              <span class="auth-field-hint">La password verrà inviata anche via email per sicurezza</span>
            </div>
            
            <div class="auth-field">
              <label for="trial-name">Nome Completo *</label>
              <input id="trial-name" type="text" name="fullName" required placeholder="Es. Mario Rossi">
              <span class="auth-field-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div class="auth-actions" style="margin-top: var(--sp-6);">
              <button type="button" class="btn btn-outline btn-sm" data-trial-back>Indietro</button>
              <button type="submit" class="btn btn-primary btn-sm" id="trial-submit-btn">
                <span id="trial-submit-text">Crea Account e Attiva Trial</span>
                <span id="trial-submit-spinner" hidden style="display: inline-block; width: 16px; height: 16px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function getAccountCreationMessage() {
  if (state.userType === 'business') {
    return 'Creeremo automaticamente il tuo account aziendale Tradelia e attiveremo la prova gratuita. I dati aziendali verranno utilizzati per la fatturazione tramite Xolo Go.';
  }
  return 'Creeremo automaticamente il tuo account Tradelia e attiveremo la prova gratuita di 14 giorni. Riceverai le credenziali via email.';
}

function registerEvents() {
  const root = state.root;
  if (!root) return;

  // Close buttons
  root.querySelectorAll('[data-trial-close], [data-trial-dismiss]').forEach((btn) => {
    btn.addEventListener('click', close);
  });

  // User type selection (Step 1)
  root.querySelectorAll('[data-user-type]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const userType = e.currentTarget.dataset.userType;
      selectUserType(userType);
    });
  });

  // Business form (Step 2)
  const businessForm = root.querySelector('#trial-business-form');
  if (businessForm) {
    businessForm.addEventListener('submit', handleBusinessFormSubmit);
  }

  // Account form (Step 3)
  const accountForm = root.querySelector('#trial-account-form');
  if (accountForm) {
    accountForm.addEventListener('submit', handleAccountFormSubmit);
  }

  // Back buttons
  root.querySelectorAll('[data-trial-back]').forEach((btn) => {
    btn.addEventListener('click', goToPreviousStep);
  });

  // Password toggle
  root.querySelectorAll('[data-password-toggle]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetId = e.currentTarget.dataset.passwordToggle;
      const input = document.getElementById(targetId);
      if (input) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        e.currentTarget.setAttribute(
          'aria-label',
          type === 'password' ? 'Mostra password' : 'Nascondi password'
        );
      }
    });
  });
}

function selectUserType(userType) {
  state.userType = userType;

  // Update visual selection
  state.root.querySelectorAll('[data-user-type]').forEach((btn) => {
    const isSelected = btn.dataset.userType === userType;
    btn.style.borderColor = isSelected ? 'var(--brand-500)' : 'var(--br-card)';
    btn.style.background = isSelected ? 'var(--surface-hover)' : 'var(--surface-card)';
  });

  // Move to next step
  setTimeout(() => {
    if (userType === 'business') {
      goToStep(STEPS.BUSINESS_DATA);
    } else {
      // Individuale: salta step business data
      goToStep(STEPS.ACCOUNT_CREATION);
    }
  }, 300);
}

function handleBusinessFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  // Collect all Xolo required fields (best practice: sanitize inputs)
  const sanitize = (str) => (str ? str.trim() : null);

  state.businessData = {
    // Dati Cliente
    businessName: sanitize(formData.get('businessName')),
    businessCountry: sanitize(formData.get('businessCountry')),
    businessLanguage: sanitize(formData.get('businessLanguage')) || 'it',

    // Indirizzo
    businessAddress: sanitize(formData.get('businessAddress')),
    businessCity: sanitize(formData.get('businessCity')),
    businessZip: sanitize(formData.get('businessZip')),
    businessVat: sanitize(formData.get('businessVat')) || null,
    businessTaxId: sanitize(formData.get('businessTaxId')) || null,
    businessInvoiceDays: parseInt(formData.get('businessInvoiceDays') || '0', 10),

    // Recapiti
    businessContactFirstname: sanitize(formData.get('businessContactFirstname')),
    businessContactLastname: sanitize(formData.get('businessContactLastname')),
    businessContactEmail: sanitize(formData.get('businessContactEmail'))?.toLowerCase() || null,
    businessComments: sanitize(formData.get('businessComments')) || null,
  };

  // Validate required fields
  const requiredFields = [
    { field: 'businessName', el: form.querySelector('#business-name') },
    { field: 'businessCountry', el: form.querySelector('#business-country') },
    { field: 'businessAddress', el: form.querySelector('#business-address') },
    { field: 'businessCity', el: form.querySelector('#business-city') },
    { field: 'businessZip', el: form.querySelector('#business-zip') },
    { field: 'businessContactFirstname', el: form.querySelector('#business-contact-firstname') },
    { field: 'businessContactLastname', el: form.querySelector('#business-contact-lastname') },
    { field: 'businessContactEmail', el: form.querySelector('#business-contact-email') },
  ];

  let hasError = false;
  requiredFields.forEach(({ field, el }) => {
    if (!state.businessData[field]) {
      showFieldError(el, 'Campo obbligatorio');
      hasError = true;
    } else {
      clearFieldError(el);
    }
  });

  // Validate email format (best practice: RFC 5322 compliant)
  if (
    state.businessData.businessContactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.businessData.businessContactEmail)
  ) {
    showFieldError(form.querySelector('#business-contact-email'), 'Email non valida');
    hasError = true;
  }

  // Validate CAP format for Italy (best practice: country-specific validation)
  if (
    state.businessData.businessCountry === 'IT' &&
    state.businessData.businessZip &&
    !/^\d{5}$/.test(state.businessData.businessZip)
  ) {
    showFieldError(form.querySelector('#business-zip'), 'CAP italiano deve essere di 5 cifre');
    hasError = true;
  }

  if (hasError) return;

  goToStep(STEPS.ACCOUNT_CREATION);
}

function clearFieldError(field) {
  if (!field) return;
  const errorEl = field.parentElement?.querySelector('.auth-field-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }
  field.removeAttribute('aria-invalid');
}

async function handleAccountFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('#trial-submit-btn');
  const submitText = form.querySelector('#trial-submit-text');
  const submitSpinner = form.querySelector('#trial-submit-spinner');

  // Sanitize and validate inputs (best practice: trim, validate format)
  const email = form.querySelector('#trial-email').value.trim().toLowerCase();
  const password = form.querySelector('#trial-password').value;
  const fullName = form.querySelector('#trial-name').value.trim();

  // Validate (best practice: specific error messages)
  if (!email || !password || !fullName) {
    showFieldError(form.querySelector('#trial-email'), 'Compila tutti i campi');
    return;
  }

  // Email format validation (best practice: RFC 5322 compliant)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFieldError(form.querySelector('#trial-email'), 'Inserisci un indirizzo email valido');
    return;
  }

  // Password validation (best practice: length + complexity)
  if (password.length < 8) {
    showFieldError(form.querySelector('#trial-password'), 'Password minimo 8 caratteri');
    return;
  }

  // Name validation (best practice: prevent empty or only spaces)
  if (fullName.length < 2) {
    showFieldError(
      form.querySelector('#trial-name'),
      'Inserisci un nome valido (minimo 2 caratteri)'
    );
    return;
  }

  // Disable form
  submitBtn.disabled = true;
  submitText.hidden = true;
  submitSpinner.hidden = false;

  try {
    // 1. Check if user is already logged in
    const {
      data: { session },
    } = await supabase.auth.getSession();

    let user;
    let signUpData = null; // Per verificare se email confirmation è richiesta

    if (session?.user) {
      // User already logged in
      user = session.user;
    } else {
      // Try to sign up (will fail if email exists)
      // Create new user (auto-confirm enabled in Supabase settings)
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: state.userType,
            business_data: state.userType === 'business' ? state.businessData : null,
          },
          emailRedirectTo: `${window.location.origin}/user/index.html`,
          // Auto-confirm: se disabilitato in Supabase, l'utente riceverà email di conferma
          // ma possiamo comunque procedere con l'attivazione trial
        },
      });

      const signUpError = signUpResult.error;
      signUpData = signUpResult.data;

      if (signUpError) {
        // If email exists, try to sign in
        if (
          signUpError.message.includes('already registered') ||
          signUpError.message.includes('already exists')
        ) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginError) {
            throw new Error(
              'Email già registrata. Usa la password corretta o recupera la password.'
            );
          }

          user = loginData.user;
        } else {
          throw signUpError;
        }
      } else {
        if (!signUpData.user) {
          throw new Error('Errore nella creazione account. Riprova.');
        }
        user = signUpData.user;

        // IMPORTANT: Anche se l'email non è confermata, procediamo comunque
        // L'utente riceverà l'email di conferma ma il trial sarà già attivo
        // Potrà fare login dopo aver confermato l'email
        if (!signUpData.session) {
          Logger.info('TrialOnboarding', 'Email confirmation required - proceeding anyway');
          // Il messaggio verrà mostrato dopo l'attivazione del trial
        }
      }
    }

    // 2. Update user profile with all business data
    // IMPORTANT: Non bloccare il flusso se il profilo fallisce - il trial deve essere attivato comunque
    const profileData = {
      user_id: user.id,
      display_name: fullName,
      user_type: state.userType || 'individual',
    };

    if (state.userType === 'business' && state.businessData) {
      // Add all Xolo business fields (solo se presenti)
      if (state.businessData.businessName)
        profileData.business_name = state.businessData.businessName;
      if (state.businessData.businessCountry)
        profileData.business_country = state.businessData.businessCountry;
      if (state.businessData.businessLanguage)
        profileData.business_language = state.businessData.businessLanguage;
      if (state.businessData.businessAddress)
        profileData.business_address = state.businessData.businessAddress;
      if (state.businessData.businessCity)
        profileData.business_city = state.businessData.businessCity;
      if (state.businessData.businessZip) profileData.business_zip = state.businessData.businessZip;
      if (state.businessData.businessVat) profileData.business_vat = state.businessData.businessVat;
      if (state.businessData.businessTaxId)
        profileData.business_tax_id = state.businessData.businessTaxId;
      if (state.businessData.businessInvoiceDays !== undefined)
        profileData.business_invoice_days = state.businessData.businessInvoiceDays;
      if (state.businessData.businessContactFirstname)
        profileData.business_contact_firstname = state.businessData.businessContactFirstname;
      if (state.businessData.businessContactLastname)
        profileData.business_contact_lastname = state.businessData.businessContactLastname;
      if (state.businessData.businessContactEmail)
        profileData.business_contact_email = state.businessData.businessContactEmail;
      if (state.businessData.businessComments)
        profileData.business_comments = state.businessData.businessComments;
    }

    // Try to save profile, but don't block on error
    try {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (profileError) {
        Logger.warn('TrialOnboarding', 'Profile update error (non-blocking)', profileError);
        // Log but continue - profile can be updated later
      }
    } catch (profileErr) {
      Logger.warn('TrialOnboarding', 'Profile update exception (non-blocking)', profileErr);
      // Continue anyway
    }

    // 3. Activate trial - CRITICAL: questo deve sempre funzionare
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 14);

    const targetRole = state.planType === 'pro' ? 'pro' : 'trial';

    const { error: roleError } = await supabase.from('user_roles').upsert(
      {
        user_id: user.id,
        role: targetRole,
        valid_until: trialExpiry.toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (roleError) {
      Logger.error('TrialOnboarding', 'Trial activation error', roleError);
      // Questo è un errore critico - blocca il flusso
      throw new Error("Errore nell'attivazione del trial. Riprova o contatta il supporto.");
    }

    // 4. If institutional role, create credits record if needed
    if (targetRole === 'institutional' || state.planType === 'desk') {
      try {
        await supabase.from('user_analysis_credits').upsert(
          {
            user_id: user.id,
            credits_balance: 0,
            total_purchased: 0,
            total_used: 0,
          },
          { onConflict: 'user_id' }
        );
      } catch (creditsErr) {
        Logger.warn('TrialOnboarding', 'Credits creation error (non-blocking)', creditsErr);
        // Non bloccare - può essere creato dopo
      }
    }

    // 5. Send notification email to amministrazione@tradelia.org (non-blocking)
    // Invia sempre per avere un record completo, con dettagli business se disponibili
    try {
      const emailResponse = await fetch('/api/email?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'business-data',
          userEmail: email,
          userName: fullName,
          userType: state.userType || 'individual',
          planType: state.planType,
          businessData: state.userType === 'business' ? state.businessData : null,
        }),
      });

      if (emailResponse.ok) {
        Logger.info('TrialOnboarding', 'Notification email sent successfully');
      } else {
        Logger.warn(
          'TrialOnboarding',
          'Notification email failed (non-blocking)',
          await emailResponse.text()
        );
      }
    } catch (emailErr) {
      Logger.warn('TrialOnboarding', 'Notification email error (non-blocking)', emailErr);
      // Non bloccare - l'email può essere inviata manualmente se necessario
    }

    // 6. Success - redirect (sempre, anche se email non confermata)
    // Verifica se abbiamo signUpData per controllare la sessione
    const needsEmailConfirmation = !session?.user && signUpData?.user && !signUpData?.session;

    const successMessage = needsEmailConfirmation
      ? 'Account creato! Controlla la tua email per confermare. Il trial è già attivo.'
      : 'Account creato e prova gratuita attivata!';

    showToast(successMessage, 'success');

    // Redirect dopo breve delay per mostrare il messaggio
    setTimeout(() => {
      // Se l'utente non ha sessione (email non confermata), reindirizza alla home
      // L'utente potrà fare login dopo aver confermato l'email
      if (needsEmailConfirmation) {
        // Mostra messaggio più dettagliato prima di redirect
        showToast(
          "Il trial è attivo. Dopo aver confermato l'email, potrai accedere con le tue credenziali.",
          'info'
        );
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        // Utente ha sessione attiva
        // Se siamo già nell'area utente, refresh invece di redirect
        if (window.location.pathname.includes('/user')) {
          // Siamo già nell'area utente - refresh la pagina per aggiornare lo stato
          window.location.reload();
        } else {
          // Non siamo nell'area utente - redirect normale
          window.location.href = '/user/index.html';
        }
      }
    }, 2000);
  } catch (err) {
    Logger.error('TrialOnboarding', 'Account creation error', err);

    // Mostra errore specifico
    let errorMessage = err.message || 'Errore nella creazione account';

    // Messaggi di errore più user-friendly
    if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
      errorMessage = 'Email già registrata. Usa la password corretta o recupera la password.';
    } else if (err.message?.includes('password')) {
      errorMessage = 'Password non valida. Usa almeno 8 caratteri.';
    } else if (err.message?.includes('email')) {
      errorMessage = 'Email non valida. Verifica il formato.';
    } else if (err.message?.includes('rate limit') || err.message?.includes('too many')) {
      errorMessage = 'Troppi tentativi. Attendi qualche minuto e riprova.';
    }

    showFieldError(form.querySelector('#trial-email'), errorMessage);

    // Re-enable form
    submitBtn.disabled = false;
    submitText.hidden = false;
    submitSpinner.hidden = true;

    // Scroll to error
    form.querySelector('#trial-email')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function goToStep(step) {
  state.currentStep = step;

  // Hide all steps
  state.root.querySelectorAll('.trial-step').forEach((stepEl) => {
    stepEl.hidden = true;
  });

  // Show current step
  const currentStepEl = state.root.querySelector(`#step-${step}`);
  if (currentStepEl) {
    currentStepEl.hidden = false;
  }

  // Update progress
  updateProgress();

  // Update account creation message
  if (step === STEPS.ACCOUNT_CREATION) {
    const messageEl = state.root.querySelector('#step-3 p');
    if (messageEl) {
      messageEl.textContent = getAccountCreationMessage();
    }
  }
}

function goToPreviousStep() {
  if (state.currentStep === STEPS.BUSINESS_DATA) {
    goToStep(STEPS.TYPE_SELECTION);
  } else if (state.currentStep === STEPS.ACCOUNT_CREATION) {
    if (state.userType === 'business') {
      goToStep(STEPS.BUSINESS_DATA);
    } else {
      goToStep(STEPS.TYPE_SELECTION);
    }
  }
}

function updateProgress() {
  const progressBar = state.root.querySelector('#trial-progress-bar');
  const progressText = state.root.querySelector('#trial-progress-text');

  const totalSteps = state.userType === 'business' ? 3 : 2;
  const progress = (state.currentStep / totalSteps) * 100;

  if (progressBar) {
    // Use CSS variable for progress
    progressBar.style.setProperty('--progress', `${progress}%`);
    // Also set inline style as fallback
    const barFill = progressBar.querySelector('.trial-progress-fill');
    if (barFill) {
      barFill.style.width = `${progress}%`;
    }
  }

  if (progressText) {
    progressText.textContent = `Passo ${state.currentStep} di ${totalSteps}`;
  }
}

function showFieldError(field, message) {
  if (!field) return;
  const errorEl = field.parentElement?.querySelector('.auth-field-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
  field.setAttribute('aria-invalid', 'true');
}

function showToast(message, type = 'info') {
  // Use existing toast system if available
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  } else {
    console.log(`[Toast ${type}]:`, message);
  }
}

function setupKeyboardNavigation() {
  state.root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
    }
  });
}

async function open(planType = 'trial', provider = 'xolo') {
  if (!state.initialized) init();

  // Close auth modal if open to avoid conflicts
  if (typeof window.authModal !== 'undefined' && window.authModal) {
    try {
      window.authModal.close();
    } catch (e) {
      // Ignore if authModal not available
    }
  }

  state.planType = planType;
  state.provider = provider;
  state.currentStep = STEPS.TYPE_SELECTION;
  state.userType = null;
  state.businessData = {};

  // Reset form
  state.root.querySelectorAll('form').forEach((form) => form.reset());
  state.root.querySelectorAll('.trial-step').forEach((step) => (step.hidden = true));

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    // User already logged in - check if they already have a role
    try {
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role, valid_until')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleCheckError && roleCheckError.code !== 'PGRST116') {
        Logger.error('TrialOnboarding', 'Error checking existing role', roleCheckError);
      }

      // If user already has a role, show message instead of activating again
      if (existingRole?.role) {
        const roleLabel =
          existingRole.role === 'institutional'
            ? 'Desk Professionale'
            : existingRole.role === 'pro'
              ? 'Pro'
              : existingRole.role === 'trial'
                ? 'Trial'
                : existingRole.role;

        showToast(
          `Hai già un piano attivo: ${roleLabel}. Vai all'area utente per gestire il tuo abbonamento.`,
          'info'
        );

        // Se siamo già nell'area utente, non fare nulla (refresh se necessario)
        if (window.location.pathname.includes('/user')) {
          // Siamo già nell'area utente - non fare nulla, l'utente può gestire il piano qui
          return;
        } else {
          // Non siamo nell'area utente - redirect all'area utente
          setTimeout(() => {
            window.location.href = '/user/index.html';
          }, 2000);
        }
        return;
      }

      // User logged in but no role - activate trial directly
      const trialExpiry = new Date();
      trialExpiry.setDate(trialExpiry.getDate() + 14);
      const targetRole = planType === 'pro' ? 'pro' : 'trial';

      const { error: roleError } = await supabase.from('user_roles').upsert(
        {
          user_id: session.user.id,
          role: targetRole,
          valid_until: trialExpiry.toISOString(),
        },
        { onConflict: 'user_id' }
      );

      if (roleError) throw roleError;

      showToast(`Prova gratuita ${targetRole === 'pro' ? 'Pro' : 'Trial'} attivata!`, 'success');

      // Se siamo già nell'area utente, refresh invece di redirect
      if (window.location.pathname.includes('/user')) {
        // Siamo già nell'area utente - refresh la pagina per aggiornare lo stato
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Non siamo nell'area utente - redirect normale
        setTimeout(() => {
          window.location.href = '/user/index.html';
        }, 1500);
      }
      return;
    } catch (err) {
      Logger.error('TrialOnboarding', 'Trial activation error', err);
      showToast("Errore nell'attivazione. Riprova.", 'error');
      // Don't show modal if activation fails - user is already logged in
      return;
    }
  }

  // Show first step
  goToStep(STEPS.TYPE_SELECTION);

  // Show modal
  state.root.hidden = false;
  state.root.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Save previous active element
  state.previousActiveElement = document.activeElement;

  // Focus first interactive element
  setTimeout(() => {
    const firstButton = state.root.querySelector('[data-user-type]');
    if (firstButton) firstButton.focus();
  }, 100);
}

function close() {
  if (!state.root) return;

  state.root.hidden = true;
  state.root.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  // Restore focus
  if (state.previousActiveElement) {
    state.previousActiveElement.focus();
    state.previousActiveElement = null;
  }
}

// Add CSS for progress bar
const style = document.createElement('style');
style.textContent = `
  .trial-progress {
    margin-top: var(--sp-3);
    display: flex;
    align-items: center;
    gap: var(--sp-3);
  }
  .trial-progress-bar {
    flex: 1;
    height: 4px;
    background: var(--br-card);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }
  .trial-progress-fill {
    height: 100%;
    width: var(--progress, 0%);
    background: var(--brand-500);
    transition: width 0.3s ease;
    border-radius: var(--radius-pill);
  }
  .trial-type-card:hover {
    border-color: var(--brand-500) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
  }
  .trial-step {
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export const trialOnboardingModal = {
  open,
  close,
  init,
};

// Expose globally for conflict prevention
if (typeof window !== 'undefined') {
  window.trialOnboardingModal = trialOnboardingModal;
}
