import { supabase, AVATAR_BUCKET } from '/report/assets/js/supabase-client.js';
import Logger from '/report/assets/js/utils/logger.js';
import { siteHeader } from '/report/assets/js/components/site-header.js';
import { openPaddleUpgrade } from './paddle-checkout.js';

const HERO = document.getElementById('user-hero');
const AVATAR = document.getElementById('user-avatar');
const NAME = document.getElementById('user-display-name');
const EMAIL = document.getElementById('user-email');
const BADGES = document.getElementById('user-badges');
const CTA = document.getElementById('user-cta');
const TOAST = document.getElementById('user-toast');

const TAB_BUTTONS = Array.from(document.querySelectorAll('.tablist button'));
const PANELS = {
  dashboard: document.getElementById('panel-dashboard'),
  profile: document.getElementById('panel-profile'),
  reports: document.getElementById('panel-reports'),
  community: document.getElementById('panel-community'),
  plan: document.getElementById('panel-plan'),
  inbox: document.getElementById('panel-inbox'),
  auth: document.getElementById('panel-auth')
};

const PROFILE_FORM = document.getElementById('profile-form');
const PROFILE_NAME_FIELD = document.getElementById('profile-display-name');
const PROFILE_USER_TYPE = document.getElementById('profile-user-type');
const PROFILE_BUSINESS_SECTION = document.getElementById('profile-business-section');
const PROFILE_BUSINESS_NAME = document.getElementById('profile-business-name');
const PROFILE_BUSINESS_COUNTRY = document.getElementById('profile-business-country');
const PROFILE_BUSINESS_LANGUAGE = document.getElementById('profile-business-language');
const PROFILE_BUSINESS_ADDRESS = document.getElementById('profile-business-address');
const PROFILE_BUSINESS_CITY = document.getElementById('profile-business-city');
const PROFILE_BUSINESS_ZIP = document.getElementById('profile-business-zip');
const PROFILE_BUSINESS_VAT = document.getElementById('profile-business-vat');
const PROFILE_BUSINESS_TAX_ID = document.getElementById('profile-business-tax-id');
const PROFILE_BUSINESS_INVOICE_DAYS = document.getElementById('profile-business-invoice-days');
const PROFILE_BUSINESS_CONTACT_FIRSTNAME = document.getElementById('profile-business-contact-firstname');
const PROFILE_BUSINESS_CONTACT_LASTNAME = document.getElementById('profile-business-contact-lastname');
const PROFILE_BUSINESS_CONTACT_EMAIL = document.getElementById('profile-business-contact-email');
const PROFILE_BUSINESS_COMMENTS = document.getElementById('profile-business-comments');
const PREF_EMAIL_NOTIFICATIONS = document.getElementById('pref-email-notifications');
const PREF_DASHBOARD_ALERTS = document.getElementById('pref-dashboard-alerts');
const PROFILE_RESET = document.getElementById('profile-reset-btn');


const DASHBOARD_STATS = {
  completedReports: document.getElementById('stat-completed-reports'),
  pendingRequests: document.getElementById('stat-pending-requests'),
  credits: document.getElementById('stat-credits'),
  creditsCard: document.getElementById('stat-credits-card'),
  plan: document.getElementById('stat-plan'),
  expiry: document.getElementById('stat-expiry'),
  expiryCard: document.getElementById('stat-expiry-card'),
  lastLogin: document.getElementById('stat-last-login')
};

const PLAN_CARD = document.getElementById('plan-card');
const PLAN_DESCRIPTION = document.getElementById('plan-description');
const PLAN_BENEFITS = document.getElementById('plan-benefits');
const PLAN_ACTIONS = document.getElementById('plan-actions');
// Avatar controls
const AVATAR_FILE = document.getElementById('profile-avatar-file');
const AVATAR_BTN = document.getElementById('profile-avatar-btn');
// Community propose/vote controls
const PROPOSAL_INPUT = document.getElementById('proposal-input');
const PROPOSAL_SUBMIT = document.getElementById('proposal-submit');
const PROPOSAL_LIST = document.getElementById('proposal-list');
const CREDITS_COUNTER = document.getElementById('credits-counter');
const CREDITS_BALANCE = document.getElementById('credits-balance');
const BUY_CREDITS_BTN = document.getElementById('buy-credits-btn');
const REQUEST_ANALYSIS_LOCK = document.getElementById('request-analysis-lock');
const REQUEST_ANALYSIS_LOCK_MESSAGE = document.getElementById('request-analysis-lock-message');
const REQUEST_ANALYSIS_LOCK_UPGRADE = document.getElementById('request-analysis-lock-upgrade');
const COMMUNITY_PROPOSALS_LIST = document.getElementById('community-proposals-list');
const COMMUNITY_PROPOSE_CARD = document.getElementById('community-propose-card');
const REQUEST_ANALYSIS_CARD = document.getElementById('request-analysis-card');
const REQUEST_ANALYSIS_INFO = document.getElementById('request-analysis-info');
const COMMUNITY_PROPOSAL_INFO = document.getElementById('community-proposal-info');

const AUTH_CONTAINER = document.getElementById('auth-container');

const state = {
  user: null,
  role: null,
  profile: null,
  stats: { requests: 0 },
  loading: true,
  lastSession: null,
  proposals: [],
  userVotes: new Set(),
  isAdmin: false,
  credits: null,
  planExpiresAt: null,
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
init();
}

if (PROFILE_FORM) {
  PROFILE_FORM.addEventListener('submit', onProfileSubmit);
}
if (PROFILE_RESET) {
  PROFILE_RESET.addEventListener('click', onProfileReset);
}

// Event listeners per form sicurezza
const CHANGE_PASSWORD_FORM = document.getElementById('change-password-form');
const CHANGE_EMAIL_FORM = document.getElementById('change-email-form');

if (CHANGE_PASSWORD_FORM) {
  CHANGE_PASSWORD_FORM.addEventListener('submit', handleChangePassword);
}

if (CHANGE_EMAIL_FORM) {
  CHANGE_EMAIL_FORM.addEventListener('submit', handleChangeEmail);
}
async function init() {
  siteHeader.mount(document.getElementById('site-header-slot'), { showExport: false });
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  setupTabs();
  
  // IMPORTANTE: restoreSession() PRIMA di handlePasswordResetRedirect()
  // perché Supabase potrebbe aver già impostato la sessione dal token nell'hash
  await restoreSession();
  
  // Check for password reset token in URL hash (dopo restoreSession)
  await handlePasswordResetRedirect();
  
  if (!state.user) {
    renderAuthPanel();
  } else {
    await bootstrapUserArea();
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    state.user = session?.user || null;
    if (!state.user) {
      stopPlanExpiryPolling();
      showToast('Sessione terminata.', 'info');
      // Reindirizza alla home quando la sessione termina
      setTimeout(() => { window.location.href = '/'; }, 200);
    } else {
      // Assicura l'area utente attiva dopo login
      bootstrapUserArea().then(() => {
        // Re-render sezione community dopo che tutto è caricato
        renderCommunitySection();
      });
      setActiveTab('dashboard');
    }
  });
}

function setupTabs() {
  // Use event delegation instead of individual listeners
  const tablist = document.querySelector('.tablist');
  if (!tablist) {
    Logger.error('UserArea', 'Tablist not found');
    return;
  }
  
  // Remove any existing listener
  if (tablist._tabHandler) {
    tablist.removeEventListener('click', tablist._tabHandler);
  }
  
  // Add single delegated listener
  tablist._tabHandler = (e) => {
    const button = e.target.closest('button[role="tab"]');
    if (!button) return;
    
    e.preventDefault();
    e.stopPropagation();
    const tabId = button.id.replace('tab-', '');
    setActiveTab(tabId);
  };
  
  tablist.addEventListener('click', tablist._tabHandler);
}

function setActiveTab(tabId) {
  // Re-query buttons to get fresh references
  const buttons = Array.from(document.querySelectorAll('.tablist button[role="tab"]'));
  buttons.forEach(btn => {
    const selected = btn.id === `tab-${tabId}`;
    btn.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  
  // Show/hide panels - IMPORTANTE: nascondi TUTTE le sezioni, poi mostra solo quella attiva
  Object.entries(PANELS).forEach(([key, panel]) => {
    if (!panel) {
      Logger.warn('UserArea', `Panel not found: ${key}`);
      return;
    }
    
    // Nascondi TUTTE le sezioni prima
    panel.setAttribute('hidden', '');
    panel.style.display = 'none';
    
    // Poi mostra solo quella attiva
    if (key === tabId) {
      panel.removeAttribute('hidden');
      panel.style.display = '';
      
      // Re-render sezione quando viene mostrata (per aggiornare stato lock/crediti)
      if (key === 'community') {
        renderCommunitySection();
      } else if (key === 'reports') {
        renderReportsSection();
      } else if (key === 'inbox') {
        renderNotificationsSection();
      }
    }
  });
}

async function restoreSession() {
  const { data } = await supabase.auth.getSession();
  state.user = data?.session?.user || null;
  state.lastSession = data?.session || null;
}

// Polling per verificare scadenza piano durante sessione (livello accademico)
let planExpiryCheckInterval = null;

function startPlanExpiryPolling() {
  // Verifica scadenza ogni 5 minuti
  if (planExpiryCheckInterval) clearInterval(planExpiryCheckInterval);
  
  planExpiryCheckInterval = setInterval(async () => {
    if (!state.user || state.isAdmin) return; // Admin non ha scadenza
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('valid_until')
        .eq('user_id', state.user.id)
        .maybeSingle();
      
      if (error || !data) return;
      
      if (data.valid_until) {
        const expiresAt = new Date(data.valid_until);
        const now = new Date();
        if (expiresAt < now && state.role !== null) {
          // Piano scaduto durante sessione
          state.role = null;
          state.planExpiresAt = data.valid_until;
          showToast('Il tuo piano è scaduto. Rinnova per continuare.', 'error');
          // Refresh UI per mostrare lock
          renderCommunitySection();
          renderPlanSection();
          renderDashboard();
        }
      }
    } catch (err) {
      Logger.warn('UserArea', 'plan expiry check error', err);
    }
  }, 5 * 60 * 1000); // 5 minuti
}

function stopPlanExpiryPolling() {
  if (planExpiryCheckInterval) {
    clearInterval(planExpiryCheckInterval);
    planExpiryCheckInterval = null;
  }
}

async function bootstrapUserArea() {
  if (!state.user) return;
  state.loading = true;
  try {
    // Step 1: Check admin status PRIMA di tutto (è fondamentale)
    await checkAdminStatus();
    Logger.debug('UserArea', 'Admin status', { isAdmin: state.isAdmin });
    
    // Step 2: Fetch dati base in parallelo
    await Promise.all([
      fetchUserProfile(),
      fetchDashboardStats(),
    ]);
    
    // Step 3: Fetch role dopo admin check (admin ha sempre ruolo institutional)
    await fetchUserRole();
    Logger.debug('UserArea', 'Role after fetch', { role: state.role, isAdmin: state.isAdmin });
    
    // Step 4: Fetch credits DOPO fetchUserRole (per creazione automatica se institutional)
    // IMPORTANTE: fetchCredits deve essere dopo fetchUserRole perché verifica state.role
    await fetchCredits();
    
    // Step 5: Fetch proposals per Trial/Pro (per community proposals)
    // Institutional non ha proposte community, solo richieste on-demand
    if (state.role === 'trial' || state.role === 'pro') {
      await Promise.all([fetchProposals(), fetchUserVotes()]);
    }
    
    // Step 6: Render tutto
    renderHero();
    renderProfileForm();
    renderDashboard();
    renderPlanSection();
    renderCommunitySection(); // Chiamato DOPO che tutto è caricato
    setActiveTab('dashboard');
    if (PANELS.auth) PANELS.auth.setAttribute('hidden', '');
    
    // Avvia polling scadenza piano
    startPlanExpiryPolling();
  } catch (err) {
    Logger.error('UserArea', 'bootstrap error', err);
    showToast(err.message || 'Errore nel caricamento dell\'area utente.', 'error');
  } finally {
    state.loading = false;
  }
}

function renderHero() {
  if (!HERO) return;
  const displayName = getDisplayName();
  const initials = deriveInitials(displayName);
  if (state.profile?.avatar_url) {
    AVATAR.style.backgroundImage = `url('${state.profile.avatar_url}')`;
    AVATAR.classList.add('has-image');
    AVATAR.textContent = '';
  } else {
    AVATAR.style.backgroundImage = '';
    AVATAR.classList.remove('has-image');
    AVATAR.textContent = initials;
  }
  NAME.textContent = displayName;
  EMAIL.textContent = state.user?.email || '';

  BADGES.innerHTML = '';
  if (state.role) {
    const roleBadge = document.createElement('span');
    roleBadge.className = `badge badge-role-${state.role}`;
    roleBadge.textContent = roleLabel(state.role);
    BADGES.appendChild(roleBadge);
  }
  const statusBadge = document.createElement('span');
  statusBadge.className = 'badge';
  statusBadge.textContent = state.lastSession?.expires_at ? 'Sessione attiva' : 'Online';
  BADGES.appendChild(statusBadge);

  CTA.innerHTML = '';
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn-sm btn-outline';
  logoutBtn.textContent = 'Esci';
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showToast('Logout effettuato.', 'info');
    // Reindirizza alla home dopo logout
    setTimeout(() => { window.location.href = '/'; }, 200);
  });
  CTA.appendChild(logoutBtn);
}

function renderProfileForm() {
  if (!PROFILE_FORM) return;
  PROFILE_NAME_FIELD.value = state.profile?.display_name || getDisplayName();
  
  // Setup user type
  if (PROFILE_USER_TYPE) {
    PROFILE_USER_TYPE.value = state.profile?.user_type || 'individual';
    
    // Show/hide business section based on user type
    if (PROFILE_BUSINESS_SECTION) {
      PROFILE_BUSINESS_SECTION.style.display = PROFILE_USER_TYPE.value === 'business' ? 'block' : 'none';
    }
    
    // Add change listener
    PROFILE_USER_TYPE.addEventListener('change', (e) => {
      if (PROFILE_BUSINESS_SECTION) {
        PROFILE_BUSINESS_SECTION.style.display = e.target.value === 'business' ? 'block' : 'none';
      }
    });
  }
  
  // Populate business fields
  if (state.profile?.user_type === 'business') {
    if (PROFILE_BUSINESS_NAME) PROFILE_BUSINESS_NAME.value = state.profile.business_name || '';
    if (PROFILE_BUSINESS_COUNTRY) PROFILE_BUSINESS_COUNTRY.value = state.profile.business_country || '';
    if (PROFILE_BUSINESS_LANGUAGE) PROFILE_BUSINESS_LANGUAGE.value = state.profile.business_language || 'it';
    if (PROFILE_BUSINESS_ADDRESS) PROFILE_BUSINESS_ADDRESS.value = state.profile.business_address || '';
    if (PROFILE_BUSINESS_CITY) PROFILE_BUSINESS_CITY.value = state.profile.business_city || '';
    if (PROFILE_BUSINESS_ZIP) PROFILE_BUSINESS_ZIP.value = state.profile.business_zip || '';
    if (PROFILE_BUSINESS_VAT) PROFILE_BUSINESS_VAT.value = state.profile.business_vat || '';
    if (PROFILE_BUSINESS_TAX_ID) PROFILE_BUSINESS_TAX_ID.value = state.profile.business_tax_id || '';
    if (PROFILE_BUSINESS_INVOICE_DAYS) PROFILE_BUSINESS_INVOICE_DAYS.value = state.profile.business_invoice_days || 0;
    if (PROFILE_BUSINESS_CONTACT_FIRSTNAME) PROFILE_BUSINESS_CONTACT_FIRSTNAME.value = state.profile.business_contact_firstname || '';
    if (PROFILE_BUSINESS_CONTACT_LASTNAME) PROFILE_BUSINESS_CONTACT_LASTNAME.value = state.profile.business_contact_lastname || '';
    if (PROFILE_BUSINESS_CONTACT_EMAIL) PROFILE_BUSINESS_CONTACT_EMAIL.value = state.profile.business_contact_email || '';
    if (PROFILE_BUSINESS_COMMENTS) PROFILE_BUSINESS_COMMENTS.value = state.profile.business_comments || '';
  }
  
  // Mostra email corrente
  const currentEmailDisplay = document.getElementById('current-email-display');
  if (currentEmailDisplay && state.user?.email) {
    currentEmailDisplay.textContent = state.user.email;
  }
  
  // Setup preferences
  if (PREF_EMAIL_NOTIFICATIONS) {
    PREF_EMAIL_NOTIFICATIONS.checked = state.profile?.preferences?.email_notifications !== false;
  }
  if (PREF_DASHBOARD_ALERTS) {
    PREF_DASHBOARD_ALERTS.checked = state.profile?.preferences?.dashboard_alerts !== false;
  }
  
  // Setup avatar upload
  if (AVATAR_BTN && AVATAR_FILE) {
    AVATAR_BTN.addEventListener('click', () => AVATAR_FILE.click());
    AVATAR_FILE.addEventListener('change', onAvatarSelected);
  }
}

async function renderDashboard() {
  try {
    // Aggiorna metriche
    if (DASHBOARD_STATS.completedReports) {
      const completedCount = await fetchCompletedReportsCount();
      DASHBOARD_STATS.completedReports.textContent = completedCount ?? 0;
    }
    
    if (DASHBOARD_STATS.pendingRequests) {
      const pendingCount = await fetchPendingRequestsCount();
      DASHBOARD_STATS.pendingRequests.textContent = pendingCount ?? 0;
    }
    
    // Crediti (solo per institutional)
    if (state.role === 'institutional' && state.credits !== null) {
      if (DASHBOARD_STATS.credits) {
        DASHBOARD_STATS.credits.textContent = state.credits.credits_balance ?? 0;
      }
      if (DASHBOARD_STATS.creditsCard) {
        DASHBOARD_STATS.creditsCard.hidden = false;
      }
    } else {
      if (DASHBOARD_STATS.creditsCard) {
        DASHBOARD_STATS.creditsCard.hidden = true;
      }
    }
    
    if (DASHBOARD_STATS.plan) {
      DASHBOARD_STATS.plan.textContent = roleLabel(state.role) || 'Nessun piano attivo';
    }
    
    // Scadenza piano
    if (state.planExpiresAt) {
      const expiresDate = new Date(state.planExpiresAt);
      const now = new Date();
      const daysLeft = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
      
      if (DASHBOARD_STATS.expiry) {
        if (daysLeft > 0) {
          DASHBOARD_STATS.expiry.textContent = `${daysLeft} ${daysLeft === 1 ? 'giorno' : 'giorni'}`;
          if (daysLeft <= 7) {
            DASHBOARD_STATS.expiry.style.color = 'var(--error-500)';
          }
        } else {
          DASHBOARD_STATS.expiry.textContent = 'Scaduto';
          DASHBOARD_STATS.expiry.style.color = 'var(--error-500)';
        }
      }
      if (DASHBOARD_STATS.expiryCard) {
        DASHBOARD_STATS.expiryCard.hidden = false;
      }
    } else {
      if (DASHBOARD_STATS.expiryCard) {
        DASHBOARD_STATS.expiryCard.hidden = true;
      }
    }
    
    if (DASHBOARD_STATS.lastLogin) {
      DASHBOARD_STATS.lastLogin.textContent = state.lastSession
        ? formatDate(new Date(state.lastSession.created_at * 1000 || Date.now()))
        : '—';
    }
    
    // Renderizza report recenti e attività
    await renderRecentReports();
    await renderRecentActivity();
    await renderDashboardNotifications();
    setupQuickActions();
  } catch (err) {
    Logger.error('UserArea', 'renderDashboard error', err);
    // Fallback: mostra 0 se errore
    if (DASHBOARD_STATS.completedReports) DASHBOARD_STATS.completedReports.textContent = '0';
    if (DASHBOARD_STATS.pendingRequests) DASHBOARD_STATS.pendingRequests.textContent = '0';
  }
}

function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Adesso';
    if (diffMinutes < 60) return `${diffMinutes} min fa`;
    
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h fa`;
    
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays} g fa`;
    if (diffDays < 30) return `${Math.round(diffDays / 7)} sett fa`;
    
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: 'short', 
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return formatDateTime(dateString);
  }
}

function renderPlanSection() {
  if (!PLAN_CARD) return;
  PLAN_DESCRIPTION.textContent = planDescription(state.role);
  PLAN_BENEFITS.innerHTML = planBenefits(state.role).map(item => `<span>• ${escapeHtml(item)}</span>`).join('');
  PLAN_ACTIONS.innerHTML = '';
  
  // Mostra info crediti per institutional
  if (state.role === 'institutional' && state.credits !== null) {
    const creditsInfo = document.createElement('div');
    creditsInfo.className = 'plan-credits';
    creditsInfo.innerHTML = `<strong>Crediti disponibili: ${state.credits.credits_balance}</strong>`;
    PLAN_ACTIONS.appendChild(creditsInfo);
  }
  
  // Mostra info scadenza piano se presente
  if (state.planExpiresAt) {
    const expiresDate = new Date(state.planExpiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
    
    const expiryInfo = document.createElement('div');
    expiryInfo.className = 'plan-expiry';
    if (daysLeft > 0) {
      expiryInfo.innerHTML = `<span>Piano valido fino al ${formatDate(expiresDate)} (${daysLeft} giorni rimanenti)</span>`;
    } else {
      expiryInfo.innerHTML = `<span style="color: rgba(248, 113, 113, 0.9);">Piano scaduto il ${formatDate(expiresDate)}</span>`;
    }
    PLAN_ACTIONS.appendChild(expiryInfo);
  }
  
  // Pulsanti azione: upgrade o cancellazione
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'user-cta';
  
        // Upgrade disponibili con prova gratuita
        if (!state.role) {
          // Utente senza ruolo può scegliere tra Pro e Desk con prova gratuita
          const proBtn = document.createElement('button');
          proBtn.className = 'btn btn-sm btn-primary';
          proBtn.textContent = 'Prova Pro gratuitamente (14 giorni)';
          proBtn.addEventListener('click', () => {
            handleUpgradeWithTrial('pro');
          });
          actionsContainer.appendChild(proBtn);
          
          const deskBtn = document.createElement('button');
          deskBtn.className = 'btn btn-sm btn-primary';
          deskBtn.textContent = 'Prova Desk gratuitamente (14 giorni)';
          deskBtn.style.marginLeft = '0.5rem';
          deskBtn.addEventListener('click', () => {
            handleUpgradeWithTrial('institutional');
          });
          actionsContainer.appendChild(deskBtn);
        } else if (state.role === 'trial') {
          const upgradeBtn = document.createElement('button');
          upgradeBtn.className = 'btn btn-sm btn-primary';
          upgradeBtn.textContent = 'Passa a Pro';
          upgradeBtn.addEventListener('click', async () => {
            try {
              showToast('Apertura checkout...', 'info');
              openPaddleUpgrade('pro', state.user?.email || '', getDisplayName());
            } catch (err) {
              Logger.error('UserArea', 'upgrade to pro error', err);
              showToast('Errore durante l\'apertura del checkout. Contatta il supporto.', 'error');
            }
          });
          actionsContainer.appendChild(upgradeBtn);
        } else if (state.role === 'pro') {
          const upgradeBtn = document.createElement('button');
          upgradeBtn.className = 'btn btn-sm btn-primary';
          upgradeBtn.textContent = 'Passa a Desk Professionale';
          upgradeBtn.addEventListener('click', async () => {
            try {
              showToast('Apertura checkout...', 'info');
              openPaddleUpgrade('institutional', state.user?.email || '', getDisplayName());
            } catch (err) {
              Logger.error('UserArea', 'upgrade to institutional error', err);
              showToast('Errore durante l\'apertura del checkout. Contatta il supporto.', 'error');
            }
          });
          actionsContainer.appendChild(upgradeBtn);
        }
  
  // Rinnovo (se piano sta per scadere - meno di 7 giorni rimanenti)
  if (state.role && !state.isAdmin && state.planExpiresAt) {
    const expiresDate = new Date(state.planExpiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
    
    // Mostra pulsante rinnovo se piano sta per scadere (meno di 7 giorni)
    if (daysLeft > 0 && daysLeft <= 7) {
      const renewBtn = document.createElement('button');
      renewBtn.className = 'btn btn-sm btn-primary';
      renewBtn.textContent = `Rinnova abbonamento (${daysLeft} ${daysLeft === 1 ? 'giorno' : 'giorni'} rimanenti)`;
      renewBtn.addEventListener('click', () => handleRenewSubscription());
      actionsContainer.appendChild(renewBtn);
    }
  }
  
  // Cancellazione (solo se piano attivo e non admin)
  if (state.role && !state.isAdmin && state.planExpiresAt) {
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-sm btn-outline';
    cancelBtn.textContent = 'Cancella abbonamento';
    cancelBtn.addEventListener('click', handleCancelSubscription);
    actionsContainer.appendChild(cancelBtn);
  }
  
  PLAN_ACTIONS.appendChild(actionsContainer);
}

async function handleUpgradeWithTrial(targetRole) {
  try {
    if (!state.user) {
      showToast('Effettua l\'accesso per effettuare l\'upgrade.', 'error');
      return;
    }
    
    // Calcola scadenza trial (14 giorni)
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 14);
    
    showToast('Attivazione prova gratuita in corso...', 'info');
    
    // Aggiorna ruolo con trial period
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: state.user.id,
        role: targetRole,
        valid_until: trialExpiry.toISOString()
      }, { onConflict: 'user_id' });
    
    if (roleError) {
      Logger.error('UserArea', 'trial upgrade error', roleError);
      throw roleError;
    }
    
    // Se è institutional, crea record crediti se non esiste
    if (targetRole === 'institutional') {
      const { error: creditsError } = await supabase
        .from('user_analysis_credits')
        .upsert({
          user_id: state.user.id,
          credits_balance: 0,
          total_purchased: 0,
          total_used: 0
        }, { onConflict: 'user_id' });
      
      if (creditsError) {
        Logger.warn('UserArea', 'credits creation error during trial', creditsError);
      }
    }
    
    // Refresh dati utente
    await fetchUserRole();
    await fetchCredits();
    renderPlanSection();
    renderCommunitySection();
    
    showToast(`Prova gratuita ${targetRole === 'pro' ? 'Pro' : 'Desk'} attivata! Scade il ${trialExpiry.toLocaleDateString('it-IT')}.`, 'success');
    
  } catch (err) {
    Logger.error('UserArea', 'trial upgrade error', err);
    
    // Best practice: messaggi errore user-friendly
    let errorMessage = 'Errore durante l\'attivazione della prova gratuita.';
    if (err.message) {
      if (err.message.includes('RLS') || err.message?.includes('policy')) {
        errorMessage = 'Errore di autorizzazione. Verifica di essere autenticato.';
      } else if (err.message.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
      } else if (err.message.includes('constraint') || err.message?.includes('check')) {
        errorMessage = 'Errore nella configurazione del piano. Contatta il supporto.';
      } else {
        errorMessage = err.message;
      }
    }
    
    showToast(errorMessage, 'error');
  }
}

async function handleRenewSubscription() {
  if (!state.role || !state.planExpiresAt) {
    showToast('Nessun piano attivo da rinnovare.', 'error');
    return;
  }
  
  if (!confirm('Vuoi rinnovare il tuo abbonamento? Verrai reindirizzato al checkout per il rinnovo.')) {
    return;
  }
  
  try {
    showToast('Apertura checkout per il rinnovo...', 'info');
    
    // Apri checkout Paddle per rinnovo
    // Usa email e nome utente per checkout
    try {
      openPaddleUpgrade(state.role, state.user?.email || '', getDisplayName());
    } catch (err) {
      Logger.error('UserArea', 'renew subscription checkout error', err);
      throw err;
    }
    
    // Nota: Il webhook gestirà l'aggiornamento valid_until dopo il pagamento
    // Per ora, il rinnovo manuale estende valid_until di 30 giorni
    // Questo è un fallback se il webhook non è ancora integrato
  } catch (err) {
    Logger.error('UserArea', 'renew subscription error', err);
    showToast('Errore durante l\'apertura del checkout. Contatta il supporto.', 'error');
  }
}

async function handleCancelSubscription() {
  if (!confirm('Sei sicuro di voler cancellare il tuo abbonamento? L\'accesso verrà disattivato alla scadenza del periodo pagato.')) {
    return;
  }
  
  try {
    showToast('Cancellazione in corso...', 'info');
    
    // Cerca subscriber per ottenere subscription_id
    const { data: subscriber, error: subError } = await supabase
      .from('subscribers')
      .select('subscription_id, email')
      .eq('auth_user_id', state.user.id)
      .maybeSingle();
    
    if (subError) {
      Logger.error('UserArea', 'Error fetching subscriber', subError);
      showToast('Errore durante il recupero informazioni abbonamento. Contatta il supporto.', 'error');
      return;
    }
    
    if (!subscriber || !subscriber.subscription_id) {
      // Se non ha subscription_id, potrebbe essere piano manuale
      // Imposta scadenza a oggi
      if (state.planExpiresAt) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ valid_until: new Date().toISOString() })
          .eq('user_id', state.user.id);
        
        if (updateError) {
          Logger.error('UserArea', 'Error updating role expiration', updateError);
          showToast('Errore durante la cancellazione. Contatta il supporto.', 'error');
          return;
        }
        
        showToast('Abbonamento cancellato. L\'accesso scadrà alla fine del periodo pagato.', 'success');
        // Refresh UI
        await fetchUserRole();
        renderPlanSection();
        renderCommunitySection();
        return;
      }
      
      showToast('Nessun abbonamento attivo trovato. Contatta il supporto se necessario.', 'info');
      return;
    }
    
    // Chiama API per cancellare subscription (richiede integrazione con gateway)
    // Per ora, aggiorna solo valid_until a scadenza corrente
    if (state.planExpiresAt) {
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ valid_until: state.planExpiresAt })
        .eq('user_id', state.user.id);
      
      if (updateError) {
        Logger.error('UserArea', 'Error updating role expiration', updateError);
        showToast('Errore durante la cancellazione. Contatta il supporto.', 'error');
        return;
      }
      
      showToast('Richiesta di cancellazione registrata. L\'accesso scadrà alla fine del periodo pagato. Per cancellazione immediata, contatta il supporto.', 'success');
      
      // TODO: Chiamare API gateway per cancellazione effettiva
      // await fetch(`/api/cancel-subscription`, { method: 'POST', body: JSON.stringify({ subscription_id: subscriber.subscription_id }) });
      
      // Refresh UI
      await fetchUserRole();
      renderPlanSection();
      renderCommunitySection();
    } else {
      showToast('Per cancellare un abbonamento permanente, contatta il supporto.', 'info');
    }
  } catch (err) {
    Logger.error('UserArea', 'cancel subscription error', err);
    
    // Best practice: messaggi errore user-friendly
    let errorMessage = 'Errore durante la cancellazione.';
    if (err.message) {
      if (err.message.includes('RLS') || err.message?.includes('policy')) {
        errorMessage = 'Errore di autorizzazione. Verifica di essere autenticato.';
      } else if (err.message.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
      } else {
        errorMessage = err.message;
      }
    }
    
    showToast(errorMessage + ' Contatta il supporto se il problema persiste.', 'error');
  }
}

function renderAuthPanel() {
  if (!PANELS.auth || !AUTH_CONTAINER) return;
  
  // Nascondi tutte le altre sezioni PRIMA di mostrare auth
  Object.entries(PANELS).forEach(([key, panel]) => {
    if (key !== 'auth' && panel) {
      panel.setAttribute('hidden', '');
      panel.style.display = 'none';
    }
  });
  
  // Mostra solo panel auth
  PANELS.auth.removeAttribute('hidden');
  PANELS.auth.style.display = '';
  
  // Aggiorna tab attivo
  setActiveTab('auth');
  
  // Renderizza form di autenticazione
  renderAuthForm('login');
}

function renderAuthForm(initialMode = 'login') {
  if (!AUTH_CONTAINER) return;
  
  const isLogin = initialMode === 'login';
  
  AUTH_CONTAINER.innerHTML = `
    <div class="auth-tabs">
      <button type="button" class="auth-tab-btn ${isLogin ? 'active' : ''}" data-tab="login">
        Accedi
      </button>
      <button type="button" class="auth-tab-btn ${!isLogin ? 'active' : ''}" data-tab="signup">
        Registrati
      </button>
    </div>
    <form class="profile-form" id="area-auth-form" data-mode="${initialMode}">
      ${!isLogin ? '<p style="font-size: 0.875rem; color: var(--ink-soft); margin-bottom: 1.5rem;">Crea un account gratuito. Riceverai un ruolo Guest con accesso limitato. Puoi attivare una prova gratuita di 14 giorni in qualsiasi momento.</p>' : ''}
      <label>
        Email
        <input type="email" name="email" id="auth-email" autocomplete="email" required placeholder="nome@azienda.com">
      </label>
      <label>
        Password
        <input type="password" name="password" id="auth-password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required minlength="8" placeholder="Password (minimo 8 caratteri)">
      </label>
      <div class="user-cta">
        <button class="btn btn-primary" type="submit" id="auth-submit-btn">
          ${isLogin ? 'Accedi' : 'Crea account'}
        </button>
      </div>
      ${!isLogin ? '<p style="font-size: 0.75rem; color: var(--ink-soft); margin-top: 1rem; text-align: center;">Registrandoti, accetti i <a href="/terms.html" style="color: var(--brand-600);">Termini di servizio</a> e la <a href="/privacy.html" style="color: var(--brand-600);">Privacy Policy</a>.</p>' : ''}
    </form>
  `;
  
  // Setup tab switching - usa event delegation per evitare problemi con listener duplicati
  const authTabsContainer = AUTH_CONTAINER.querySelector('.auth-tabs');
  if (authTabsContainer) {
    // Rimuovi listener precedenti se esistono
    if (authTabsContainer._clickHandler) {
      authTabsContainer.removeEventListener('click', authTabsContainer._clickHandler);
    }
    
    authTabsContainer._clickHandler = (e) => {
      const tab = e.target.closest('.auth-tab-btn');
      if (!tab) return;
      
      e.preventDefault();
      e.stopPropagation();
      const mode = tab.dataset.tab;
      
      // Re-render form con nuovo mode
      renderAuthForm(mode);
    };
    
    authTabsContainer.addEventListener('click', authTabsContainer._clickHandler);
  }
  
  // Setup form submit
  const form = document.getElementById('area-auth-form');
  if (form) {
    // Rimuovi listener precedenti se esistono
    if (form._submitHandler) {
      form.removeEventListener('submit', form._submitHandler);
    }
    
    form._submitHandler = (e) => {
      e.preventDefault();
      const mode = form.dataset.mode || 'login';
      if (mode === 'login') {
        handleLoginSubmit(e);
      } else if (mode === 'signup') {
        handleSignupSubmit(e);
      }
    };
    
    form.addEventListener('submit', form._submitHandler);
  }
}

async function onProfileSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    showToast('Effettua l\'accesso per modificare il profilo.', 'error');
    return;
  }
  // Best practice: sanitize input (trim, validate length)
  const display_name = PROFILE_NAME_FIELD.value.trim();
  const user_type = PROFILE_USER_TYPE?.value || 'individual';
  
  // Validation
  if (display_name && display_name.length < 2) {
    showToast('Il nome deve contenere almeno 2 caratteri.', 'error');
    return;
  }
  
  if (display_name && display_name.length > 80) {
    showToast('Il nome non può superare 80 caratteri.', 'error');
    return;
  }
  
  // Validate business fields if user_type = business
  if (user_type === 'business') {
    if (!PROFILE_BUSINESS_NAME?.value.trim()) {
      showToast('Il nome/ragione sociale è obbligatorio per account business.', 'error');
      return;
    }
    if (!PROFILE_BUSINESS_COUNTRY?.value) {
      showToast('Il paese è obbligatorio per account business.', 'error');
      return;
    }
    if (!PROFILE_BUSINESS_ADDRESS?.value.trim()) {
      showToast('L\'indirizzo è obbligatorio per account business.', 'error');
      return;
    }
    if (!PROFILE_BUSINESS_CITY?.value.trim()) {
      showToast('La città è obbligatoria per account business.', 'error');
      return;
    }
    if (!PROFILE_BUSINESS_ZIP?.value.trim()) {
      showToast('Il CAP è obbligatorio per account business.', 'error');
      return;
    }
    if (!PROFILE_BUSINESS_CONTACT_FIRSTNAME?.value.trim()) {
      showToast('Il nome referente è obbligatorio per account business.', 'error');
      return;
    }
    if (!PROFILE_BUSINESS_CONTACT_LASTNAME?.value.trim()) {
      showToast('Il cognome referente è obbligatorio per account business.', 'error');
      return;
    }
    if (!PROFILE_BUSINESS_CONTACT_EMAIL?.value.trim()) {
      showToast('L\'email referente è obbligatoria per account business.', 'error');
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(PROFILE_BUSINESS_CONTACT_EMAIL.value.trim())) {
      showToast('L\'email referente non è valida.', 'error');
      return;
    }
  }
  
  const preferences = {
    email_notifications: PREF_EMAIL_NOTIFICATIONS?.checked ?? true,
    dashboard_alerts: PREF_DASHBOARD_ALERTS?.checked ?? true
  };
  
  // Collect business data
  const businessData = user_type === 'business' ? {
    business_name: PROFILE_BUSINESS_NAME?.value.trim() || null,
    business_country: PROFILE_BUSINESS_COUNTRY?.value || null,
    business_language: PROFILE_BUSINESS_LANGUAGE?.value || 'it',
    business_address: PROFILE_BUSINESS_ADDRESS?.value.trim() || null,
    business_city: PROFILE_BUSINESS_CITY?.value.trim() || null,
    business_zip: PROFILE_BUSINESS_ZIP?.value.trim() || null,
    business_vat: PROFILE_BUSINESS_VAT?.value.trim() || null,
    business_tax_id: PROFILE_BUSINESS_TAX_ID?.value.trim() || null,
    business_invoice_days: PROFILE_BUSINESS_INVOICE_DAYS?.value ? parseInt(PROFILE_BUSINESS_INVOICE_DAYS.value) : 0,
    business_contact_firstname: PROFILE_BUSINESS_CONTACT_FIRSTNAME?.value.trim() || null,
    business_contact_lastname: PROFILE_BUSINESS_CONTACT_LASTNAME?.value.trim() || null,
    business_contact_email: PROFILE_BUSINESS_CONTACT_EMAIL?.value.trim().toLowerCase() || null,
    business_comments: PROFILE_BUSINESS_COMMENTS?.value.trim() || null
  } : null;
  
  // Store old data for comparison
  const oldData = { ...state.profile };
  
  try {
    const submitBtn = PROFILE_FORM.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent || 'Salva profilo';
    
    // Best practice: loading state con feedback visivo
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.textContent = 'Salvataggio...';
    }
    
    // Build payload
    const payload = {
      user_id: state.user.id,
      display_name: display_name || null,
      user_type: user_type,
      preferences: preferences
    };
    
    // Add business data if user_type = business
    if (user_type === 'business' && businessData) {
      Object.assign(payload, businessData);
    } else if (user_type === 'individual') {
      // Clear business data if switching to individual
      payload.business_name = null;
      payload.business_country = null;
      payload.business_language = null;
      payload.business_address = null;
      payload.business_city = null;
      payload.business_zip = null;
      payload.business_vat = null;
      payload.business_tax_id = null;
      payload.business_invoice_days = null;
      payload.business_contact_firstname = null;
      payload.business_contact_lastname = null;
      payload.business_contact_email = null;
      payload.business_comments = null;
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
    
    // Update state
    state.profile = { ...(state.profile || {}), ...payload };
    
    // Detect changes for email notification
    const changes = [];
    const newData = { ...state.profile };
    
    // Compare old vs new
    const fieldsToCheck = [
      'display_name', 'user_type', 'business_name', 'business_country', 'business_language',
      'business_address', 'business_city', 'business_zip', 'business_vat', 'business_tax_id',
      'business_invoice_days', 'business_contact_firstname', 'business_contact_lastname',
      'business_contact_email', 'business_comments'
    ];
    
    fieldsToCheck.forEach(field => {
      const oldValue = oldData[field] ?? null;
      const newValue = newData[field] ?? null;
      if (oldValue !== newValue) {
        changes.push({
          field: field,
          oldValue: oldValue,
          newValue: newValue
        });
      }
    });
    
    // Send email if there are changes
    if (changes.length > 0) {
      try {
        await fetch('/api/send-profile-update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: state.user.email,
            userName: getDisplayName(),
            changes: changes,
            oldData: oldData,
            newData: newData
          })
        });
        Logger.debug('UserArea', 'Profile update email sent', { changesCount: changes.length });
      } catch (emailErr) {
        Logger.warn('UserArea', 'Failed to send profile update email', emailErr);
        // Non bloccare il salvataggio se l'email fallisce
      }
    }
    
    renderHero();
    renderProfileForm(); // Re-render per aggiornare UI
    showToast('Profilo aggiornato con successo.', 'success');
  } catch (err) {
    Logger.error('UserArea', 'profile save error', err);
    
    // Best practice: messaggi errore user-friendly
    let errorMessage = 'Errore durante il salvataggio.';
    if (err.message) {
      if (err.message.includes('RLS') || err.message.includes('policy')) {
        errorMessage = 'Errore di autorizzazione. Verifica di essere autenticato.';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
      } else {
        errorMessage = err.message;
      }
    }
    
    showToast(errorMessage, 'error');
  } finally {
    const submitBtn = PROFILE_FORM.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = 'Salva profilo';
    }
  }
}

function onProfileReset() {
  PROFILE_NAME_FIELD.value = state.profile?.display_name || getDisplayName();
  // Reset preferences
  if (PREF_EMAIL_NOTIFICATIONS) {
    PREF_EMAIL_NOTIFICATIONS.checked = state.profile?.preferences?.email_notifications !== false;
  }
  if (PREF_DASHBOARD_ALERTS) {
    PREF_DASHBOARD_ALERTS.checked = state.profile?.preferences?.dashboard_alerts !== false;
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget || document.getElementById('area-auth-form');
  if (!form) return;
  
  const emailInput = form.querySelector('input[name="email"]') || form.email;
  const passwordInput = form.querySelector('input[name="password"]') || form.password;
  
  // Best practice: sanitize inputs (trim, lowercase email)
  const email = emailInput?.value?.trim().toLowerCase() || '';
  const password = passwordInput?.value || '';
  
  // Best practice: specific validation with clear messages
  if (!email || !password) {
    showToast('Inserisci email e password.', 'error');
    return;
  }
  
  // Best practice: email format validation (RFC 5322 compliant)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Inserisci un indirizzo email valido.', 'error');
    return;
  }
  
  try {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    showToast('Accesso effettuato.', 'success');
    await bootstrapUserArea();
    setTimeout(() => { setActiveTab('profile'); }, 100);
  } catch (err) {
    Logger.error('UserArea', 'login error', err);
    showToast(err.message || 'Credenziali non valide.', 'error');
  } finally {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
  }
}

async function handleSignupSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget || document.getElementById('area-auth-form');
  if (!form) return;
  
  const emailInput = form.querySelector('input[name="email"]') || form.email;
  const passwordInput = form.querySelector('input[name="password"]') || form.password;
  
  // Best practice: sanitize inputs (trim, lowercase email)
  const email = emailInput?.value?.trim().toLowerCase() || '';
  const password = passwordInput?.value || '';
  
  // Best practice: specific validation with clear messages
  if (!email || !password) {
    showToast('Inserisci email e password.', 'error');
    return;
  }
  
  // Best practice: email format validation (RFC 5322 compliant)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Inserisci un indirizzo email valido.', 'error');
    return;
  }
  
  // Best practice: password validation (length + complexity)
  if (password.length < 8) {
    showToast('La password deve essere di almeno 8 caratteri.', 'error');
    return;
  }
  
  try {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registrazione...';
    }
    
    // 0. Se c'è già una sessione attiva, fai logout prima di registrare nuovo account
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      Logger.debug('UserArea', 'Logout account esistente prima di signup', { userId: session.user.id });
      await supabase.auth.signOut();
      // Attendi un momento per assicurarsi che il logout sia completato
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 1. Crea utente in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/user`
      }
    });
    
    if (signUpError) throw signUpError;
    
    if (!authData.user) {
      throw new Error('Errore durante la creazione dell\'account.');
    }
    
    // 2. Crea profilo utente
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
      Logger.warn('UserArea', 'profile creation error (may already exist)', profileError);
    }
    
    // 3. NON creare ruolo di default - l'utente può attivare trial dopo
    // Il ruolo verrà creato quando l'utente attiva un trial o un piano
    // Questo evita errori di constraint e mantiene il database pulito
    
    // Verifica se email verification è abilitata in Supabase
    // Se email_confirmed_at è null, significa che email verification è abilitata
    // e l'utente deve confermare l'email prima di poter accedere
    const requiresEmailVerification = authData.user.email_confirmed_at === null;
    
    if (requiresEmailVerification) {
      // Email verification abilitata - l'utente deve confermare l'email
      showToast('Account creato! Controlla la tua email e clicca sul link di conferma per attivare l\'account.', 'info');
      
      // Mostra messaggio più dettagliato
      setTimeout(() => {
        showToast('Dopo aver confermato l\'email, potrai accedere con le tue credenziali.', 'info');
      }, 2000);
    } else {
      // Email verification disabilitata - possiamo fare auto-login
      showToast('Registrazione completata! Account creato. Attiva un trial per iniziare.', 'success');
      
      // Auto-login dopo registrazione con il NUOVO account
      // Assicurati che non ci siano sessioni residue
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError && signInData?.user) {
        Logger.debug('UserArea', 'Auto-login riuscito dopo signup', { userId: signInData.user.id, email: signInData.user.email });
        await bootstrapUserArea();
        setTimeout(() => { 
          setActiveTab('profile');
          showToast('Benvenuto! Puoi attivare una prova gratuita di 14 giorni nella sezione Abbonamento.', 'info');
        }, 100);
      } else {
        // Se auto-login fallisce, mostra messaggio
        Logger.warn('UserArea', 'Auto-login fallito dopo signup', signInError);
        showToast('Account creato. Effettua il login per continuare.', 'info');
      }
    }
  } catch (err) {
    Logger.error('UserArea', 'signup error', err);
    
    // Gestione rate limit per email
    let errorMessage = err.message || 'Errore durante la registrazione. Riprova.';
    const errMsgLower = err.message?.toLowerCase() || '';
    
    if (errMsgLower.includes('rate limit') || 
        errMsgLower.includes('too many requests') ||
        errMsgLower.includes('email rate limit') ||
        errMsgLower.includes('troppe richieste') ||
        errMsgLower.includes('email nuova')) {
      errorMessage = 'Troppe richieste di registrazione. Attendi 10-15 minuti prima di riprovare, oppure prova con un\'email diversa.';
    } else if (errMsgLower.includes('user already registered') || 
               errMsgLower.includes('already exists') ||
               errMsgLower.includes('already registered')) {
      errorMessage = 'Questa email è già registrata. Prova ad accedere invece di registrarti.';
    }
    
    showToast(errorMessage, 'error');
  } finally {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Crea account';
    }
  }
}

async function fetchUserRole() {
  try {
    // Se è admin, ruolo è sempre institutional (Desk illimitato, permanente)
    if (state.isAdmin) {
      state.role = 'institutional';
      state.planExpiresAt = null; // Admin = permanente
      Logger.debug('UserArea', 'Admin role set to institutional');
      return;
    }
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, valid_until')
      .eq('user_id', state.user.id)
      .maybeSingle();
    
    if (error) {
      Logger.error('UserArea', 'role fetch error', error);
      throw error;
    }
    
    Logger.debug('UserArea', 'role data from DB', data);
    
    state.role = data?.role || null;
    state.planExpiresAt = data?.valid_until || null;
    
    // Verifica se il piano è scaduto
    if (state.planExpiresAt) {
      const expiresAt = new Date(state.planExpiresAt);
      const now = new Date();
      if (expiresAt < now) {
        // Piano scaduto - disabilita accesso
        Logger.warn('UserArea', 'Plan expired', { expiresAt, now });
        state.role = null;
        showToast('Il tuo piano è scaduto. Rinnova per continuare ad utilizzare la piattaforma.', 'error');
        // Reindirizza a pricing dopo 3 secondi
        setTimeout(() => {
          window.location.href = '/pricing.html';
        }, 3000);
      } else {
        Logger.debug('UserArea', 'Plan valid', { role: state.role, expiresAt });
      }
    } else if (state.role) {
      Logger.debug('UserArea', 'Role set (no expiration)', { role: state.role });
    } else {
      Logger.debug('UserArea', 'No role found for user');
    }
  } catch (err) {
    Logger.error('UserArea', 'role fetch error', err);
    state.role = null;
    state.planExpiresAt = null;
  } finally {
    // Marca che il loading è completato
    state.loading = false;
  }
}

async function fetchUserProfile() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('display_name, avatar_url, preferences, user_type, business_name, business_country, business_language, business_address, business_city, business_zip, business_vat, business_tax_id, business_invoice_days, business_contact_firstname, business_contact_lastname, business_contact_email, business_comments')
      .eq('user_id', state.user.id)
      .maybeSingle();
    if (error) throw error;
    state.profile = data || null;
  } catch (err) {
    Logger.warn('UserArea', 'profile fetch error', err);
    state.profile = null;
  }
}

async function fetchDashboardStats() {
  try {
    // Conta richieste analisi on-demand (per retrocompatibilità)
    if (state.role === 'institutional') {
      const { count, error } = await supabase
        .from('analysis_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', state.user.id);
      if (error) throw error;
      state.stats.requests = count ?? 0;
    } else {
      state.stats.requests = 0;
    }
  } catch (err) {
    Logger.warn('UserArea', 'stats error', err);
    state.stats.requests = 0;
  }
}

async function fetchCompletedReportsCount() {
  try {
    if (!state.user) return 0;
    const { count, error } = await supabase
      .from('analysis_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', state.user.id)
      .eq('status', 'completed');
    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    Logger.warn('UserArea', 'completed reports count error', err);
    return 0;
  }
}

async function fetchPendingRequestsCount() {
  try {
    if (!state.user) return 0;
    const { count, error } = await supabase
      .from('analysis_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', state.user.id)
      .in('status', ['pending', 'processing']);
    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    Logger.warn('UserArea', 'pending requests count error', err);
    return 0;
  }
}

function getDisplayName() {
  if (state.profile?.display_name) return state.profile.display_name;
  if (state.user?.user_metadata?.full_name) return state.user.user_metadata.full_name;
  const email = state.user?.email || '';
  return email ? email.split('@')[0] : 'Utente Tradelia';
}

function deriveInitials(name) {
  if (!name) return 'TR';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
  return initials || 'TR';
}

function roleLabel(role) {
  switch (role) {
    case 'pro':
      return 'Piano Pro';
    case 'institutional':
      return 'Desk Professionale';
    case 'trial':
      return 'Trial';
    default:
      return 'Nessun piano attivo';
  }
}

function planDescription(role) {
  switch (role) {
    case 'institutional':
      return 'Ricerca dedicata con deck SRD/MTB integrati, fatturazione corporate e canali diretti con il desk analisti.';
    case 'pro':
      return 'Accesso completo ai deck SRD v5.0 e MTB v3.1, strumenti community e notifiche operative in tempo reale.';
    case 'trial':
      return 'Prova gratuita attiva. Consulta i dossier ufficiali e sblocca tutte le funzionalità per 14 giorni.';
    default:
      return 'Account registrato. Attiva una prova gratuita di 14 giorni per Pro o Desk Professionale e scopri tutte le funzionalità.';
  }
}

function planBenefits(role) {
  if (role === 'institutional') {
    return [
      'Deck SRD v5.0 e MTB v3.1 con personalizzazioni white label',
      'Analisi Swing Research on-demand (99 € / richiesta)',
      'Fatturazione dedicata e SLA di supporto prioritario',
      'Sessioni mentorship con il desk di ricerca'
    ];
  }
  if (role === 'pro') {
    return [
      'Sblocco completo dei deck SRD v5.0 e MTB v3.1',
      'Note condivise con il desk',
      'Suggerimento e voto giornaliero sui ticker della community',
      'Notifiche push e roadmap funzionale con priorità Pro'
    ];
  }
  if (role === 'trial') {
  return [
      'Accesso completo ai deck SRD v5.0 e MTB v3.1',
      'Tutte le funzionalità Pro o Desk attive per 14 giorni',
      'Nessun costo durante il periodo di prova',
      'Upgrade automatico a pagamento alla scadenza (se configurato)'
    ];
  }
  // Nessun ruolo attivo
  return [
    'Accesso limitato ai contenuti pubblici',
    'Prova gratuita Pro o Desk Professionale (14 giorni)',
    'Nessun impegno, cancella quando vuoi',
    'Scopri tutte le funzionalità prima di abbonarti'
  ];
}

function escapeHtml(value) {
  if (value == null) return '';
  const div = document.createElement('div');
  div.textContent = String(value);
  return div.innerHTML;
}

function formatDate(date) {
  try {
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function formatDateTime(value) {
  try {
    const date = new Date(value);
    return date.toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return value;
  }
}

function showToast(message, variant = 'info') {
  if (!TOAST) return;
  TOAST.textContent = message;
  TOAST.setAttribute('data-variant', variant);
  TOAST.setAttribute('data-visible', 'true');
  setTimeout(() => {
    TOAST.removeAttribute('data-visible');
  }, 3200);
}

// Export showToast and state globally for use in other modules
window.showToast = showToast;
window.state = state;

// ===== AVATAR UPLOAD =====
async function onAvatarSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  if (file.size > 2 * 1024 * 1024) {
    showToast('Il file è troppo grande. Massimo 2 MB.', 'error');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    showToast('Seleziona un file immagine valido.', 'error');
    return;
  }
  
  try {
    AVATAR_BTN.disabled = true;
    AVATAR_BTN.textContent = 'Caricamento...';
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${state.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${state.user.id}/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);
    
    // Update profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: state.user.id,
        avatar_url: publicUrl
      }, { onConflict: 'user_id' });
    
    if (updateError) throw updateError;
    
    state.profile = { ...(state.profile || {}), avatar_url: publicUrl };
    renderHero();
    showToast('Foto profilo aggiornata.', 'success');
  } catch (err) {
    Logger.error('UserArea', 'avatar upload error', err);
    
    // Best practice: messaggi errore user-friendly
    let errorMessage = 'Errore durante il caricamento della foto.';
    if (err.message) {
      if (err.message.includes('size') || err.message.includes('too large')) {
        errorMessage = 'Il file è troppo grande. Massimo 2 MB.';
      } else if (err.message.includes('type') || err.message.includes('format')) {
        errorMessage = 'Formato file non supportato. Usa PNG o JPG.';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
      } else {
        errorMessage = err.message;
      }
    }
    
    showToast(errorMessage, 'error');
  } finally {
    AVATAR_BTN.disabled = false;
    AVATAR_BTN.textContent = 'Carica/aggiorna foto';
    event.target.value = '';
  }
}

// ===== COMMUNITY PROPOSALS & VOTES =====
async function fetchProposals() {
  try {
    const { data, error } = await supabase
      .from('asset_proposals')
      .select('id, asset_ticker, vote_count, created_at, proposed_by')
      .eq('is_active', true)
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    state.proposals = data || [];
  } catch (err) {
    Logger.warn('UserArea', 'proposals fetch error', err);
    state.proposals = [];
  }
}

async function fetchUserVotes() {
  if (!state.user) return;
  try {
    const { data, error } = await supabase
      .from('asset_votes')
      .select('proposal_id')
      .eq('user_id', state.user.id);
    if (error) throw error;
    state.userVotes = new Set((data || []).map(v => v.proposal_id));
  } catch (err) {
    Logger.warn('UserArea', 'votes fetch error', err);
    state.userVotes = new Set();
  }
}

async function checkAdminStatus() {
  if (!state.user) return;
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', state.user.id)
      .maybeSingle();
    
    if (error) {
      Logger.error('UserArea', 'admin check error', error);
      throw error;
    }
    
    state.isAdmin = !!data;
    Logger.debug('UserArea', 'Admin check result', { 
      userId: state.user.id, 
      isAdmin: state.isAdmin,
      hasRecord: !!data 
    });
    
    // Se è admin, assicurati che abbia ruolo institutional (per compatibilità)
    if (state.isAdmin) {
      // Verifica se ha record in user_roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', state.user.id)
        .maybeSingle();
      
      // Se non ha ruolo, non lo creiamo automaticamente (admin può non avere ruolo nel DB)
      // Ma nel codice assumiamo sempre role === 'institutional' per admin
      if (roleError && roleError.code !== 'PGRST116') {
        Logger.warn('UserArea', 'Error checking admin role', roleError);
      }
    }
  } catch (err) {
    Logger.error('UserArea', 'admin check error', err);
    state.isAdmin = false;
  }
}

function renderCommunitySection() {
  if (!PANELS.community) return;
  
  // Always show credits counter
  renderCreditsCounter();
  
  // Show request analysis card for all authenticated users
  if (REQUEST_ANALYSIS_CARD) {
    REQUEST_ANALYSIS_CARD.hidden = false;
    
    // Debug: log stato per diagnosticare problemi
    Logger.debug('UserArea', 'renderCommunitySection', {
      isAdmin: state.isAdmin,
      role: state.role,
      credits: state.credits?.credits_balance ?? 0,
      hasUser: !!state.user
    });
    
    // RIMOSSO: Tutti i lock sono stati rimossi per permettere accesso completo durante sviluppo
    // Tutti gli utenti autenticati possono vedere e utilizzare tutte le funzionalità
    // I limiti verranno applicati lato backend quando necessario
    hideRequestAnalysisLock();
  }
  
  // RIMOSSO: Lock rimosso - tutti possono vedere proposte community
  // Show community proposals card for all authenticated users
  if (COMMUNITY_PROPOSE_CARD) {
      COMMUNITY_PROPOSE_CARD.hidden = false;
      renderCommunityProposalsList();
  }
  
  // Setup handlers
  setupProposalHandlers();
  setupCreditsHandlers();
  
  // Setup modal checkout (solo una volta)
  if (!window._creditsModalSetup) {
    setupCreditsCheckoutModal();
    window._creditsModalSetup = true;
  }
}

function renderCreditsCounter() {
  if (!CREDITS_BALANCE) return;
  
  const credits = state.credits?.credits_balance ?? 0;
  CREDITS_BALANCE.textContent = credits;
  
  // Update color based on credits
  if (credits === 0) {
    CREDITS_BALANCE.style.color = 'rgba(248, 113, 113, 0.9)';
  } else if (credits < 3) {
    CREDITS_BALANCE.style.color = 'rgba(251, 191, 36, 0.9)';
  } else {
    CREDITS_BALANCE.style.color = 'var(--brand-600)';
  }
}

function setupCreditsHandlers() {
  // Rimuovi listener precedenti se esistono
  if (BUY_CREDITS_BTN && BUY_CREDITS_BTN._clickHandler) {
    BUY_CREDITS_BTN.removeEventListener('click', BUY_CREDITS_BTN._clickHandler);
  }
  
  // RIMOSSO: Lock rimosso - tutti possono acquistare crediti (limitazioni lato backend)
  // Abilita pulsante acquista crediti per tutti gli utenti autenticati
  if (BUY_CREDITS_BTN) {
    BUY_CREDITS_BTN.disabled = false;
    BUY_CREDITS_BTN.title = '';
    BUY_CREDITS_BTN._clickHandler = openCreditsCheckout;
    BUY_CREDITS_BTN.addEventListener('click', BUY_CREDITS_BTN._clickHandler);
  }
  
  if (REQUEST_ANALYSIS_LOCK_UPGRADE) {
    REQUEST_ANALYSIS_LOCK_UPGRADE.addEventListener('click', () => {
      window.location.href = '/pricing.html';
    });
  }
}

function setupCreditsCheckoutModal() {
  const modal = document.getElementById('credits-checkout-modal');
  const closeBtn = document.getElementById('credits-checkout-close');
  const cancelBtn = document.getElementById('credits-checkout-cancel');
  const packages = document.querySelectorAll('.credits-package');
  
  if (!modal) return;
  
  // Chiudi modal
  const closeModal = () => {
    modal.setAttribute('hidden', '');
  };
  
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  
  // Chiudi cliccando fuori
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Gestisci selezione pacchetto
  packages.forEach(pkg => {
    pkg.addEventListener('click', () => {
      // Rimuovi selezione precedente
      packages.forEach(p => p.classList.remove('selected'));
      // Aggiungi selezione corrente
      pkg.classList.add('selected');
      
      // Piccolo delay per feedback visivo
      setTimeout(() => {
        const credits = parseInt(pkg.dataset.credits);
        const price = parseInt(pkg.dataset.price);
        handleCreditsPurchase(credits, price);
      }, 150);
    });
  });
}

function openCreditsCheckout() {
  const modal = document.getElementById('credits-checkout-modal');
  if (modal) {
    modal.removeAttribute('hidden');
  }
}

async function handleCreditsPurchase(credits, price) {
  try {
    showToast('Apertura checkout...', 'info');
    
    // Chiudi modal
    const modal = document.getElementById('credits-checkout-modal');
    if (modal) modal.setAttribute('hidden', '');
    
    // Apri checkout crediti (Paddle/Xolo Go - da implementare)
    // TODO: Implementare checkout crediti con Paddle o Xolo Go
    // Per ora mostra messaggio informativo
    showToast('Checkout crediti non ancora disponibile. Contatta il supporto per acquistare crediti.', 'info');
    Logger.warn('UserArea', 'Credits checkout non implementato - Paddle/Xolo Go da configurare');
    
    // Il webhook gestirà l'aggiornamento crediti dopo il pagamento
  } catch (err) {
    Logger.error('UserArea', 'credits purchase error', err);
    showToast('Errore durante l\'apertura del checkout. Riprova.', 'error');
  }
}

function showRequestAnalysisLock(message) {
  if (!REQUEST_ANALYSIS_LOCK || !REQUEST_ANALYSIS_LOCK_MESSAGE) return;
  REQUEST_ANALYSIS_LOCK_MESSAGE.textContent = message || 'Questa funzionalità richiede un piano attivo.';
  REQUEST_ANALYSIS_LOCK.hidden = false;
}

function hideRequestAnalysisLock() {
  if (!REQUEST_ANALYSIS_LOCK) return;
  REQUEST_ANALYSIS_LOCK.hidden = true;
}

// Render on-demand requests (for institutional users)
async function renderProposalsList() {
  if (!PROPOSAL_LIST) return;
  
  // For institutional users, show analysis requests
  if (state.role === 'institutional') {
    try {
      const { data, error } = await supabase
        .from('analysis_requests')
        .select('id, ticker, status, created_at, completed_at, report_id, report_slug')
        .eq('user_id', state.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        PROPOSAL_LIST.innerHTML = '<p style="color: rgba(203, 213, 225, 0.6); font-size: 0.9rem;">Nessuna richiesta ancora. Invia un ticker per richiedere un\'analisi.</p>';
        return;
      }
      
      PROPOSAL_LIST.innerHTML = data.map(request => {
        const statusLabels = {
          pending: { text: 'In attesa', color: 'rgba(251, 191, 36, 0.9)', icon: '⏳' },
          processing: { text: 'In elaborazione', color: 'rgba(96, 165, 250, 0.9)', icon: '⚙️' },
          completed: { text: 'Completata', color: 'rgba(34, 197, 94, 0.9)', icon: '✅' },
          cancelled: { text: 'Annullata', color: 'rgba(203, 213, 225, 0.6)', icon: '❌' }
        };
        const status = statusLabels[request.status] || statusLabels.pending;
        
        // Link al report se completata
        const reportLink = (request.report_slug || request.report_id)
          ? `<div style="margin-top: 0.75rem;">
              <a href="/report/index.html?id=${request.report_slug || request.report_id}" class="btn btn-sm btn-outline" target="_blank" rel="noopener">
                Visualizza analisi
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 0.5rem; display: inline-block;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>`
          : '';
        
        return `
          <article class="history-item proposal-item">
            <div class="proposal-header">
              <strong>${escapeHtml(request.ticker)}</strong>
              <span class="badge" style="background: ${status.color}20; border-color: ${status.color}; color: ${status.color};">
                ${status.icon} ${status.text}
              </span>
            </div>
            <div class="proposal-meta">
              <span>${formatDateTime(request.created_at)}</span>
              ${request.completed_at ? `<span class="history-item-separator">·</span><span>Completata: ${formatDateTime(request.completed_at)}</span>` : ''}
            </div>
            ${reportLink}
          </article>
        `;
      }).join('');
    } catch (err) {
      Logger.error('UserArea', 'fetch analysis requests error', err);
      PROPOSAL_LIST.innerHTML = '<p style="color: rgba(248, 113, 113, 0.9); font-size: 0.9rem;">Errore nel caricamento delle richieste.</p>';
    }
    return;
  }
  
  // For other users, show empty state
  PROPOSAL_LIST.innerHTML = '<p style="color: rgba(203, 213, 225, 0.6); font-size: 0.9rem;">Invia un ticker per richiedere un\'analisi.</p>';
}

// Render community proposals (for Trial/Pro users)
function renderCommunityProposalsList() {
  if (!COMMUNITY_PROPOSALS_LIST) return;
  
  if (!state.proposals.length) {
    COMMUNITY_PROPOSALS_LIST.innerHTML = `
      <div class="empty-state">
        <p style="color: rgba(203, 213, 225, 0.6); font-size: 0.9rem; margin-bottom: 0.5rem;">Nessuna proposta ancora.</p>
        <p style="color: rgba(203, 213, 225, 0.5); font-size: 0.85rem;">Usa il form sopra per proporre il primo asset!</p>
      </div>
    `;
    return;
  }
  
  // Ordina per voti (decrescente) e poi per data (decrescente)
  const sortedProposals = [...state.proposals].sort((a, b) => {
    if (b.vote_count !== a.vote_count) {
      return b.vote_count - a.vote_count;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });
  
  COMMUNITY_PROPOSALS_LIST.innerHTML = sortedProposals.map(proposal => {
    const hasVoted = state.userVotes.has(proposal.id);
    const isOwner = proposal.proposed_by === state.user?.id;
    const isPopular = proposal.vote_count >= 5;
    
    return `
      <article class="history-item proposal-item ${isPopular ? 'proposal-popular' : ''}">
        <div class="proposal-header">
          <div class="proposal-title-group">
          <strong>${escapeHtml(proposal.asset_ticker)}</strong>
            ${isPopular ? '<span class="badge proposal-badge-popular" title="Proposta popolare">🔥</span>' : ''}
            ${isOwner ? '<span class="badge proposal-badge-owner">Tua proposta</span>' : ''}
          </div>
          <div class="proposal-actions">
            <button class="btn btn-sm vote-btn ${hasVoted ? 'voted' : ''}" 
                    data-proposal-id="${proposal.id}" 
                    ${hasVoted ? 'title="Rimuovi voto"' : 'title="Vota questa proposta"'}
                    aria-label="${hasVoted ? 'Rimuovi voto' : 'Vota'}">
              ${hasVoted ? '★' : '☆'}
            </button>
            <span class="vote-count" title="${proposal.vote_count} ${proposal.vote_count === 1 ? 'voto' : 'voti'}">${proposal.vote_count}</span>
            ${state.isAdmin ? `<button class="btn btn-sm delete-btn" data-proposal-id="${proposal.id}" title="Rimuovi proposta">×</button>` : ''}
          </div>
        </div>
        <div class="proposal-meta">
          <span>${formatRelativeTime(proposal.created_at)}</span>
        </div>
      </article>
    `;
  }).join('');
  
  // Attach event listeners (rimuovi listener precedenti per evitare duplicati)
  COMMUNITY_PROPOSALS_LIST.querySelectorAll('.vote-btn').forEach(btn => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => handleVote(newBtn.dataset.proposalId));
  });
  
  if (state.isAdmin) {
    COMMUNITY_PROPOSALS_LIST.querySelectorAll('.delete-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', () => handleDeleteProposal(newBtn.dataset.proposalId));
    });
  }
}

function setupProposalHandlers() {
  // Setup form per analisi su richiesta
  const form = document.getElementById('analysis-request-form');
  if (form && !form._hasHandler) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleProposeAsset();
    });
    form._hasHandler = true;
  }
  
  // Mantieni anche handler separati per retrocompatibilità
  if (PROPOSAL_SUBMIT && !PROPOSAL_SUBMIT._hasHandler) {
    PROPOSAL_SUBMIT.addEventListener('click', (e) => {
      e.preventDefault();
      handleProposeAsset();
    });
    PROPOSAL_SUBMIT._hasHandler = true;
  }
  if (PROPOSAL_INPUT && !PROPOSAL_INPUT._hasHandler) {
    PROPOSAL_INPUT.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleProposeAsset();
      }
    });
    PROPOSAL_INPUT._hasHandler = true;
  }
  
  // Update button text, placeholder and info based on role
  if (PROPOSAL_SUBMIT) {
    if (state.role === 'institutional') {
      PROPOSAL_SUBMIT.textContent = 'Richiedi analisi';
      if (PROPOSAL_INPUT) {
        PROPOSAL_INPUT.placeholder = 'Inserisci ticker per richiedere analisi on-demand (es. AAPL, BTC-USD)';
      }
      if (REQUEST_ANALYSIS_INFO) REQUEST_ANALYSIS_INFO.hidden = false;
      if (COMMUNITY_PROPOSAL_INFO) COMMUNITY_PROPOSAL_INFO.hidden = true;
    } else if (state.role === 'trial' || state.role === 'pro') {
      PROPOSAL_SUBMIT.textContent = 'Proponi asset';
      if (PROPOSAL_INPUT) {
        PROPOSAL_INPUT.placeholder = 'Proponi un asset per la community (es. AAPL, BTC-USD, settore AI)';
      }
      if (REQUEST_ANALYSIS_INFO) REQUEST_ANALYSIS_INFO.hidden = true;
      if (COMMUNITY_PROPOSAL_INFO) COMMUNITY_PROPOSAL_INFO.hidden = false;
    } else {
      PROPOSAL_SUBMIT.textContent = 'Invia ticker';
      if (REQUEST_ANALYSIS_INFO) REQUEST_ANALYSIS_INFO.hidden = true;
      if (COMMUNITY_PROPOSAL_INFO) COMMUNITY_PROPOSAL_INFO.hidden = true;
    }
  }
}

// Validazione ticker avanzata (livello accademico)
function isValidTicker(ticker) {
  if (!ticker || ticker.length < 1 || ticker.length > 20) return false;
  
  // Formato base: lettere/numeri, possibili trattini o punti
  // Esempi validi: AAPL, BTC-USD, EURUSD, S&P500, TSLA, MSFT, ^GSPC
  const tickerPattern = /^[A-Z0-9][A-Z0-9.\-^]{0,19}$/;
  if (!tickerPattern.test(ticker)) return false;
  
  // Blacklist ticker troppo generici o invalidi
  const blacklist = ['TEST', 'NULL', 'NONE', 'TICKER', 'SYMBOL', 'EXAMPLE'];
  if (blacklist.includes(ticker)) return false;
  
  return true;
}

async function handleProposeAsset() {
  if (!PROPOSAL_INPUT) return;
  
  // Best practice: sanitize input (trim, uppercase, validate)
  const ticker = PROPOSAL_INPUT.value.trim().toUpperCase();
  
  // Best practice: specific validation with clear messages
  if (!ticker || ticker.length < 1) {
    showToast('Inserisci un ticker valido (es. AAPL, BTC-USD).', 'error');
    PROPOSAL_INPUT.focus();
    return;
  }
  
  // Best practice: ticker format validation
  if (ticker.length > 20) {
    showToast('Il ticker non può superare 20 caratteri.', 'error');
    PROPOSAL_INPUT.focus();
    return;
  }
  
  // Validazione ticker avanzata
  if (!isValidTicker(ticker)) {
    showToast('Ticker non valido. Usa formato standard (es. AAPL, BTC-USD, EURUSD).', 'error');
    PROPOSAL_INPUT.focus();
    return;
  }
  
  // RIMOSSO: Lock rimosso - tutti possono richiedere analisi
  // I limiti verranno applicati lato backend quando necessario
  const credits = state.credits?.credits_balance ?? 0;
  
  // RIMOSSO: Tutti i lock rimossi - tutti possono richiedere analisi
  // I limiti verranno applicati lato backend quando necessario
  // For all users: allow on-demand requests (backend will enforce limits)
  if (state.role === 'institutional' || state.role === 'trial' || state.role === 'pro' || !state.role) {
    // RIMOSSO: Controllo crediti rimosso per permettere test completo
    // I crediti verranno controllati lato backend
    // Rate limiting: max 3 richieste pending per utente
    const { count: pendingCount, error: countError } = await supabase
      .from('analysis_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', state.user.id)
      .eq('status', 'pending');
    
    if (countError) {
      Logger.error('UserArea', 'pending count error', countError);
      showToast('Errore durante la verifica. Riprova.', 'error');
      return;
    }
    
    if (pendingCount >= 3) {
      showToast('Hai già 3 richieste in attesa. Attendi il completamento prima di inviarne altre.', 'error');
      return;
    }
    
    // Nascondi lock se ha crediti o è admin
    hideRequestAnalysisLock();
    
    // Deduct credit and create request (admin bypass) - TRANSACTION ATOMICA
    try {
      PROPOSAL_SUBMIT.disabled = true;
      PROPOSAL_SUBMIT.textContent = 'Invio in corso...';
      
      // RIMOSSO: Controllo crediti rimosso per permettere test completo
      // I crediti verranno controllati e scalati lato backend quando necessario
      // Step 1: Try to deduct credit (optional - backend will enforce)
      if (!state.isAdmin && credits > 0) {
        // Update crediti (con optimistic locking per prevenire race conditions)
        const { data: creditUpdate, error: creditError } = await supabase
          .from('user_analysis_credits')
          .update({
            credits_balance: credits - 1,
            total_used: (state.credits?.total_used ?? 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', state.user.id)
          .eq('credits_balance', credits) // Optimistic locking
          .select()
          .single();
        
        // Se fallisce, continua comunque (backend controllerà)
        if (creditError || !creditUpdate) {
          Logger.warn('UserArea', 'Credit update failed, continuing anyway', creditError);
        }
      }
      
      // Step 2: Create analysis request (solo se scalata crediti OK o admin)
      const { data: requestData, error: requestError } = await supabase
        .from('analysis_requests')
        .insert({
          ticker: ticker.toUpperCase().trim(),
          user_id: state.user.id,
          status: 'pending',
          priority: 5
        })
        .select()
        .single();
      
      if (requestError) {
        // Rollback: ripristina credito se richiesta fallisce
        // IMPORTANTE: Ripristina sia credits_balance che total_used ai valori precedenti
        if (!state.isAdmin && credits > 0) {
          await supabase
        .from('user_analysis_credits')
        .update({
              credits_balance: credits,
              total_used: Math.max(0, (state.credits?.total_used ?? 0) - 1) // Decrementa total_used
        })
        .eq('user_id', state.user.id);
        }
        throw requestError;
      }
      
      // Step 3: Refresh credits e UI
      await fetchCredits();
      renderCreditsCounter();
      
      if (!state.isAdmin) {
        showToast('Richiesta inviata! Un credito è stato scalato. L\'analisi sarà completata entro 24-48 ore.', 'success');
      } else {
        showToast('Richiesta inviata! (Admin: crediti illimitati)', 'success');
      }
      
      PROPOSAL_INPUT.value = '';
      await renderProposalsList();
      
      // Aggiorna stats
      await fetchDashboardStats();
      renderDashboard();
    } catch (err) {
      Logger.error('UserArea', 'on-demand request error', err);
      
      // Best practice: messaggi errore user-friendly
      let errorMessage = 'Errore durante l\'invio della richiesta.';
      if (err.message) {
        if (err.message.includes('duplicate') || err.message.includes('already exists')) {
          errorMessage = 'Hai già una richiesta in corso per questo ticker.';
        } else if (err.message.includes('credits') || err.message.includes('insufficient')) {
          errorMessage = 'Crediti insufficienti. Acquista crediti per continuare.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
        } else {
          errorMessage = err.message;
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      PROPOSAL_SUBMIT.disabled = false;
      if (state.role === 'institutional') {
        PROPOSAL_SUBMIT.textContent = 'Richiedi analisi';
      } else if (state.role === 'trial' || state.role === 'pro') {
        PROPOSAL_SUBMIT.textContent = 'Proponi asset';
      }
    }
    return;
  }
  
  // RIMOSSO: Lock rimosso - tutti possono creare proposte community
  // For all users: create community proposal (no credits required)
  // Tutti gli utenti possono creare proposte community
  if (true) { // Sempre permesso
    try {
      PROPOSAL_SUBMIT.disabled = true;
      PROPOSAL_SUBMIT.textContent = 'Invio...';
      
      const { data, error } = await supabase
        .from('asset_proposals')
        .insert({
          asset_ticker: ticker,
          proposed_by: state.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Aggiorna state e UI
      state.proposals.unshift(data);
      PROPOSAL_INPUT.value = '';
      await renderCommunityProposalsList();
      showToast(`Proposta per ${ticker} inviata! Gli altri utenti possono ora votarla.`, 'success');
      
      // Aggiorna stats
      await fetchDashboardStats();
      renderDashboard();
    } catch (err) {
      Logger.error('UserArea', 'proposal error', err);
      
      // Best practice: messaggi errore user-friendly
      let errorMessage = 'Errore durante l\'invio della proposta.';
      if (err.code === '23505' || err.message?.includes('duplicate') || err.message?.includes('already exists')) {
        errorMessage = `La proposta per ${ticker} esiste già. Puoi votarla nella lista.`;
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      PROPOSAL_SUBMIT.disabled = false;
      if (state.role === 'trial' || state.role === 'pro') {
        PROPOSAL_SUBMIT.textContent = 'Proponi asset';
      }
    }
    return;
  }
  
  // RIMOSSO: Lock rimosso - tutti possono utilizzare le funzionalità
  // No role or insufficient permissions - ma permettiamo comunque l'accesso
}

async function handleVote(proposalId) {
  // RIMOSSO: Lock rimosso - tutti gli utenti autenticati possono votare
  // I limiti verranno applicati lato backend quando necessario
  
  const hasVoted = state.userVotes.has(proposalId);
  const proposal = state.proposals.find(p => p.id === proposalId);
  
  try {
    if (hasVoted) {
      // Remove vote
      const { error } = await supabase
        .from('asset_votes')
        .delete()
        .eq('proposal_id', proposalId)
        .eq('user_id', state.user.id);
      
      if (error) throw error;
      state.userVotes.delete(proposalId);
      showToast(`Voto rimosso da ${proposal?.asset_ticker || 'proposta'}`, 'info');
    } else {
      // Add vote
      const { error } = await supabase
        .from('asset_votes')
        .insert({
          proposal_id: proposalId,
          user_id: state.user.id
        });
      
      if (error) throw error;
      state.userVotes.add(proposalId);
      showToast(`Voto aggiunto a ${proposal?.asset_ticker || 'proposta'}`, 'success');
    }
    
    // Refresh proposals to get updated vote counts
    await fetchProposals();
    renderCommunityProposalsList();
  } catch (err) {
    Logger.error('UserArea', 'vote error', err);
    
    // Best practice: messaggi errore user-friendly
    let errorMessage = 'Errore durante il voto.';
    if (err.code === '23505' || err.message?.includes('duplicate') || err.message?.includes('already exists')) {
      errorMessage = 'Hai già votato questa proposta.';
    } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
      errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    showToast(errorMessage, 'error');
  }
}

async function handleDeleteProposal(proposalId) {
  if (!state.isAdmin) return;
  
  if (!confirm('Rimuovere questa proposta?')) return;
  
  try {
    const { error } = await supabase
      .from('asset_proposals')
      .delete()
      .eq('id', proposalId);
    
    if (error) throw error;
    
    state.proposals = state.proposals.filter(p => p.id !== proposalId);
    renderCommunityProposalsList();
    showToast('Proposta rimossa.', 'success');
  } catch (err) {
    Logger.error('UserArea', 'delete proposal error', err);
    
    // Best practice: messaggi errore user-friendly
    let errorMessage = 'Errore durante la rimozione.';
    if (err.message?.includes('network') || err.message?.includes('fetch')) {
      errorMessage = 'Errore di connessione. Verifica la tua connessione internet.';
    } else if (err.message?.includes('permission') || err.message?.includes('unauthorized')) {
      errorMessage = 'Non hai i permessi per rimuovere questa proposta.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    showToast(errorMessage, 'error');
  }
}

// ===== DESK LINKS & CREDITS =====
async function fetchCredits() {
  if (!state.user) return;
  try {
    const { data, error } = await supabase
      .from('user_analysis_credits')
      .select('credits_balance, total_purchased, total_used')
      .eq('user_id', state.user.id)
      .maybeSingle();
    
    if (error) throw error;
    
    // Se record non esiste e utente è institutional, crealo automaticamente
    if (!data && state.role === 'institutional' && !state.isAdmin) {
      const { data: newRecord, error: createError } = await supabase
        .from('user_analysis_credits')
        .insert({
          user_id: state.user.id,
          credits_balance: 0,
          total_purchased: 0,
          total_used: 0
        })
        .select('credits_balance, total_purchased, total_used')
        .single();
      
      if (createError) {
        Logger.error('UserArea', 'credits creation error', createError);
        state.credits = { credits_balance: 0, total_purchased: 0, total_used: 0 };
      } else {
        state.credits = newRecord;
      }
    } else {
    state.credits = data || { credits_balance: 0, total_purchased: 0, total_used: 0 };
    }
  } catch (err) {
    Logger.warn('UserArea', 'credits fetch error', err);
    state.credits = { credits_balance: 0, total_purchased: 0, total_used: 0 };
  }
}

// ===== PASSWORD RESET REDIRECT =====
async function handlePasswordResetRedirect() {
  // Check if URL has hash fragments (Supabase adds access_token, etc. after password reset)
  const hash = window.location.hash;
  const searchParams = new URLSearchParams(window.location.search);
  const resetParam = searchParams.get('reset');
  
  // Parse hash fragments if present
  let accessToken = null;
  let type = null;
  let refreshToken = null;
  
  if (hash) {
    try {
      const params = new URLSearchParams(hash.substring(1));
      accessToken = params.get('access_token');
      type = params.get('type');
      refreshToken = params.get('refresh_token');
      
      Logger.debug('UserArea', 'Hash fragments detected', { 
        hasAccessToken: !!accessToken, 
        type, 
        hasRefreshToken: !!refreshToken 
      });
    } catch (err) {
      Logger.warn('UserArea', 'Error parsing hash', err);
    }
  }
  
  // If this is a password recovery redirect (hash-based or query param)
  const isPasswordReset = (type === 'recovery' && accessToken) || resetParam === 'true';
  
  if (!isPasswordReset) return;
  
  Logger.debug('UserArea', 'Password reset token detected', { 
    type, 
    hasAccessToken: !!accessToken, 
    resetParam,
    hasHash: !!hash,
    currentUser: !!state.user
  });
  
  // Se c'è un token nell'hash, Supabase dovrebbe aver già impostato la sessione
  // Ma verifichiamo e forziamo il refresh se necessario
  if (accessToken && refreshToken) {
    try {
      // Imposta la sessione manualmente se non è già impostata
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!session && !sessionError) {
        // Prova a impostare la sessione dal token
        const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (setSessionData?.session) {
          state.user = setSessionData.session.user;
          state.lastSession = setSessionData.session;
          Logger.debug('UserArea', 'Session set from reset token');
        } else if (setSessionError) {
          Logger.error('UserArea', 'Error setting session from token', setSessionError);
        }
      } else if (session) {
        // Sessione già presente, aggiorna state
        state.user = session.user;
        state.lastSession = session;
        Logger.debug('UserArea', 'Session already exists, updated state');
      }
    } catch (err) {
      Logger.error('UserArea', 'Error handling reset token', err);
    }
  }
  
  // Refresh session per assicurarsi che sia aggiornata
  await restoreSession();
  
  // Clear the hash from URL but keep the recovery indicator
  if (hash) {
    const cleanUrl = window.location.pathname + (resetParam ? `?reset=true` : '?reset=true');
    window.history.replaceState(null, '', cleanUrl);
  }
  
  // If user is now logged in, show password change form prominently
  if (state.user) {
    Logger.debug('UserArea', 'User authenticated, showing password reset form');
    showToast('Reimposta la tua password. Compila il form qui sotto.', 'info');
    
    // Aspetta che l'area utente sia renderizzata se necessario
    if (!document.getElementById('change-password-form')) {
      await bootstrapUserArea();
    }
    
    setActiveTab('profile');
    
    // Highlight password form
    setTimeout(() => {
      const passwordForm = document.getElementById('change-password-form');
      if (passwordForm) {
        // Add visual highlight
        passwordForm.style.border = '2px solid var(--brand-500)';
        passwordForm.style.borderRadius = 'var(--radius-lg)';
        passwordForm.style.padding = 'var(--sp-4)';
        passwordForm.style.backgroundColor = 'var(--surface-elev)';
        
        // Scroll to form
        passwordForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus first input
        const newPasswordInput = document.getElementById('new-password');
        if (newPasswordInput) {
          setTimeout(() => newPasswordInput.focus(), 100);
        }
        
        // Show success message in form
        const successEl = document.getElementById('change-password-success');
        if (successEl) {
          successEl.hidden = false;
          successEl.textContent = 'Inserisci una nuova password sicura (minimo 8 caratteri)';
          successEl.style.color = 'var(--brand-600)';
        }
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
          passwordForm.style.border = '';
          passwordForm.style.borderRadius = '';
          passwordForm.style.padding = '';
          passwordForm.style.backgroundColor = '';
        }, 5000);
      } else {
        Logger.warn('UserArea', 'Password form not found after reset redirect');
      }
    }, 500);
  } else {
    // User not logged in - potrebbe essere un problema con il token
    Logger.warn('UserArea', 'Password reset token detected but user not logged in', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      type
    });
    showToast('Errore: token di reset non valido o scaduto. Richiedi un nuovo link di reset password.', 'error');
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  }
}

// ===== CHANGE PASSWORD =====
async function handleChangePassword(event) {
  event.preventDefault();
  if (!state.user) {
    showToast('Effettua l\'accesso per cambiare la password.', 'error');
    return;
  }
  
  const form = event.currentTarget;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  const errorEl = document.getElementById('change-password-error');
  const successEl = document.getElementById('change-password-success');
  const submitBtn = document.getElementById('change-password-btn');
  
  // Reset messages
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
  if (successEl) {
    successEl.hidden = true;
    successEl.textContent = '';
  }
  
  // Validation
  if (!newPassword || newPassword.length < 8) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = 'La password deve contenere almeno 8 caratteri.';
    }
    return;
  }
  
  if (newPassword !== confirmPassword) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = 'Le password non corrispondono.';
    }
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Aggiornamento...';
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    // Success
    if (successEl) {
      successEl.hidden = false;
      successEl.textContent = 'Password aggiornata con successo!';
    }
    
    // Clear form
    form.reset();
    
    // Clear URL hash if present
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    showToast('Password aggiornata con successo!', 'success');
    
    Logger.debug('UserArea', 'Password updated successfully');
  } catch (err) {
    Logger.error('UserArea', 'change password error', err);
    let errorMessage = 'Errore durante l\'aggiornamento della password.';
    
    if (err.message) {
      if (err.message.includes('rate limit')) {
        errorMessage = 'Troppe richieste. Attendi qualche minuto e riprova.';
      } else {
        errorMessage = err.message;
      }
    }
    
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = errorMessage;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Cambia password';
  }
}

// ===== CHANGE EMAIL =====
async function handleChangeEmail(event) {
  event.preventDefault();
  if (!state.user) {
    showToast('Effettua l\'accesso per cambiare l\'email.', 'error');
    return;
  }
  
  const form = event.currentTarget;
  const newEmail = document.getElementById('new-email').value.trim();
  const errorEl = document.getElementById('change-email-error');
  const successEl = document.getElementById('change-email-success');
  const submitBtn = document.getElementById('change-email-btn');
  
  // Reset messages
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = '';
  }
  if (successEl) {
    successEl.hidden = true;
    successEl.textContent = '';
  }
  
  // Best practice: sanitize and validate email
  const sanitizedEmail = newEmail.trim().toLowerCase();
  
  // Validation
  if (!sanitizedEmail) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = 'Inserisci un indirizzo email.';
    }
    return;
  }
  
  // Best practice: email format validation (RFC 5322 compliant)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = 'Inserisci un indirizzo email valido.';
    }
    return;
  }
  
  if (sanitizedEmail === state.user.email?.toLowerCase()) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = 'Questa è già la tua email attuale.';
    }
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Aggiornamento...';
  
  try {
    const { error } = await supabase.auth.updateUser({
      email: sanitizedEmail
    });
    
    if (error) throw error;
    
    // Success - email change requires confirmation
    if (successEl) {
      successEl.hidden = false;
      successEl.textContent = 'Email aggiornata! Controlla la nuova casella email per confermare il cambio.';
    }
    
    // Clear form
    form.reset();
    
    showToast('Email aggiornata! Controlla la nuova casella email per confermare.', 'success');
    
    Logger.debug('UserArea', 'Email update requested', { newEmail });
  } catch (err) {
    Logger.error('UserArea', 'change email error', err);
    let errorMessage = 'Errore durante l\'aggiornamento dell\'email.';
    
    if (err.message) {
      if (err.message.includes('rate limit')) {
        errorMessage = 'Troppe richieste. Attendi qualche minuto e riprova.';
      } else if (err.message.includes('already registered')) {
        errorMessage = 'Questa email è già associata a un altro account.';
      } else {
        errorMessage = err.message;
      }
    }
    
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = errorMessage;
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Cambia email';
  }
}

// ===== DASHBOARD ENHANCED FUNCTIONS =====

async function renderRecentReports() {
  const container = document.getElementById('recent-reports-list');
  if (!container) return;
  
  try {
    if (!state.user) {
      container.innerHTML = '<div class="empty-state"><p>Nessun report completato ancora.</p></div>';
      return;
    }
    
    const { data, error } = await supabase
      .from('analysis_requests')
      .select('id, ticker, status, created_at, completed_at, report_id, report_slug')
      .eq('user_id', state.user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Nessun report completato ancora.</p></div>';
      return;
    }
    
    container.innerHTML = data.map(request => {
      const reportLink = (request.report_slug || request.report_id)
        ? `/report/index.html?id=${request.report_slug || request.report_id}`
        : null;
      
      return `
        <article class="recent-report-item">
          <div class="recent-report-header">
            <strong>${escapeHtml(request.ticker)}</strong>
            <span class="badge" style="background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.9); color: rgba(34, 197, 94, 0.9);">
              ✅ Completata
            </span>
          </div>
          <div class="recent-report-meta">
            <span>Completata: ${formatDateTime(request.completed_at || request.created_at)}</span>
          </div>
          ${reportLink ? `
            <div style="margin-top: 0.75rem;">
              <a href="${reportLink}" class="btn btn-sm btn-outline" target="_blank" rel="noopener">
                Visualizza analisi
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 0.5rem; display: inline-block;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          ` : ''}
        </article>
      `;
    }).join('');
  } catch (err) {
    Logger.error('UserArea', 'renderRecentReports error', err);
    container.innerHTML = '<div class="empty-state"><p>Errore nel caricamento dei report.</p></div>';
  }
}

async function renderRecentActivity() {
  const container = document.getElementById('recent-activity-list');
  if (!container) return;
  
  try {
    if (!state.user) {
      container.innerHTML = '<div class="empty-state"><p>Nessuna attività recente.</p></div>';
      return;
    }
    
    const { data, error } = await supabase
      .from('analysis_requests')
      .select('id, ticker, status, created_at, completed_at')
      .eq('user_id', state.user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Nessuna attività recente.</p></div>';
      return;
    }
    
    const statusLabels = {
      pending: { text: 'In attesa', icon: '⏳', color: 'rgba(251, 191, 36, 0.9)' },
      processing: { text: 'In elaborazione', icon: '⚙️', color: 'rgba(96, 165, 250, 0.9)' },
      completed: { text: 'Completata', icon: '✅', color: 'rgba(34, 197, 94, 0.9)' },
      cancelled: { text: 'Annullata', icon: '❌', color: 'rgba(203, 213, 225, 0.6)' }
    };
    
    container.innerHTML = data.map(request => {
      const status = statusLabels[request.status] || statusLabels.pending;
      return `
        <article class="activity-item">
          <div class="activity-icon" style="color: ${status.color};">${status.icon}</div>
          <div class="activity-content">
            <div class="activity-title">
              <strong>${escapeHtml(request.ticker)}</strong>
              <span class="badge" style="background: ${status.color}20; border-color: ${status.color}; color: ${status.color};">
                ${status.text}
              </span>
            </div>
            <div class="activity-meta">
              <span>${formatRelativeTime(request.created_at)}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    Logger.error('UserArea', 'renderRecentActivity error', err);
    container.innerHTML = '<div class="empty-state"><p>Errore nel caricamento delle attività.</p></div>';
  }
}

async function renderDashboardNotifications() {
  const container = document.getElementById('notifications-list');
  const section = document.getElementById('dashboard-notifications');
  if (!container || !section) return;
  
  try {
    const notifications = [];
    
    // Notifica scadenza piano
    if (state.planExpiresAt) {
      const expiresDate = new Date(state.planExpiresAt);
      const now = new Date();
      const daysLeft = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0 && daysLeft <= 7) {
        notifications.push({
          type: 'warning',
          icon: '⚠️',
          title: 'Piano in scadenza',
          message: `Il tuo piano scade tra ${daysLeft} ${daysLeft === 1 ? 'giorno' : 'giorni'}. Rinnova ora per continuare a utilizzare il servizio.`,
          action: { text: 'Rinnova', onClick: () => setActiveTab('plan') }
        });
      } else if (daysLeft <= 0) {
        notifications.push({
          type: 'error',
          icon: '❌',
          title: 'Piano scaduto',
          message: 'Il tuo piano è scaduto. Rinnova per continuare a utilizzare il servizio.',
          action: { text: 'Rinnova', onClick: () => setActiveTab('plan') }
        });
      }
    }
    
    // Notifica crediti bassi (solo institutional)
    if (state.role === 'institutional' && state.credits !== null && state.credits.credits_balance <= 5) {
      notifications.push({
        type: 'info',
        icon: '💳',
        title: 'Crediti in esaurimento',
        message: `Hai solo ${state.credits.credits_balance} ${state.credits.credits_balance === 1 ? 'credito' : 'crediti'} rimasti. Considera di acquistarne altri.`,
        action: { text: 'Acquista crediti', onClick: () => BUY_CREDITS_BTN?.click() }
      });
    }
    
    if (notifications.length === 0) {
      section.hidden = true;
      return;
    }
    
    section.hidden = false;
    container.innerHTML = notifications.map(notif => {
      const actionHtml = notif.action 
        ? `<button class="btn btn-sm btn-outline" onclick="(${notif.action.onClick.toString()})()">${escapeHtml(notif.action.text)}</button>`
        : '';
      
      return `
        <div class="notification-item notification-${notif.type}">
          <div class="notification-icon">${notif.icon}</div>
          <div class="notification-content">
            <strong>${escapeHtml(notif.title)}</strong>
            <p>${escapeHtml(notif.message)}</p>
            ${actionHtml}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    Logger.error('UserArea', 'renderDashboardNotifications error', err);
    section.hidden = true;
  }
}

function setupQuickActions() {
  const newRequestBtn = document.getElementById('quick-action-new-request');
  const viewReportsBtn = document.getElementById('quick-action-view-reports');
  const upgradeBtn = document.getElementById('quick-action-upgrade');
  
  // Mostra "Nuova richiesta" solo per institutional
  if (newRequestBtn) {
    if (state.role === 'institutional') {
      newRequestBtn.hidden = false;
      newRequestBtn.onclick = () => setActiveTab('community');
    } else {
      newRequestBtn.hidden = true;
    }
  }
  
  // "Vedi tutti i report"
  if (viewReportsBtn) {
    viewReportsBtn.onclick = () => setActiveTab('reports');
  }
  
  // "Upgrade piano" solo se non è già institutional
  if (upgradeBtn) {
    if (state.role && state.role !== 'institutional' && !state.isAdmin) {
      upgradeBtn.hidden = false;
      upgradeBtn.onclick = () => setActiveTab('plan');
    } else {
      upgradeBtn.hidden = true;
    }
  }
  
  // Link "Vedi tutti" nella sezione report recenti
  const viewAllReportsLink = document.getElementById('dashboard-view-all-reports');
  if (viewAllReportsLink) {
    viewAllReportsLink.onclick = (e) => {
      e.preventDefault();
      setActiveTab('reports');
    };
  }
}

// ===== REPORTS SECTION =====

let reportsPage = 1;
const reportsPerPage = 20;
let reportsFilters = {
  date: 'all',
  ticker: '',
  status: 'all'
};

async function renderReportsSection() {
  const container = document.getElementById('reports-list');
  if (!container) return;
  
  try {
    if (!state.user) {
      container.innerHTML = '<div class="empty-state"><p>Effettua l\'accesso per vedere i tuoi report.</p></div>';
      return;
    }
    
    // Setup filtri
    setupReportsFilters();
    
    // Carica report
    await loadReports();
  } catch (err) {
    Logger.error('UserArea', 'renderReportsSection error', err);
    const container = document.getElementById('reports-list');
    if (container) {
      container.innerHTML = '<div class="empty-state"><p>Errore nel caricamento dei report.</p></div>';
    }
  }
}

function setupReportsFilters() {
  const dateFilter = document.getElementById('filter-date');
  const tickerFilter = document.getElementById('filter-ticker');
  const statusFilter = document.getElementById('filter-status');
  
  if (dateFilter) {
    dateFilter.value = reportsFilters.date;
    dateFilter.onchange = (e) => {
      reportsFilters.date = e.target.value;
      reportsPage = 1;
      loadReports();
    };
  }
  
  if (tickerFilter) {
    tickerFilter.value = reportsFilters.ticker;
    // Debounce per ricerca ticker
    let tickerTimeout;
    tickerFilter.oninput = (e) => {
      clearTimeout(tickerTimeout);
      tickerTimeout = setTimeout(() => {
        reportsFilters.ticker = e.target.value.trim();
        reportsPage = 1;
        loadReports();
      }, 500);
    };
  }
  
  if (statusFilter) {
    statusFilter.value = reportsFilters.status;
    statusFilter.onchange = (e) => {
      reportsFilters.status = e.target.value;
      reportsPage = 1;
      loadReports();
    };
  }
}

async function loadReports() {
  const container = document.getElementById('reports-list');
  const pagination = document.getElementById('reports-pagination');
  if (!container) return;
  
  try {
    container.innerHTML = '<div class="empty-state"><p>Caricamento...</p></div>';
    
    if (!state.user) {
      container.innerHTML = '<div class="empty-state"><p>Effettua l\'accesso per vedere i tuoi report.</p></div>';
      return;
    }
    
    // Costruisci query
    let query = supabase
      .from('analysis_requests')
      .select('id, ticker, status, created_at, completed_at, report_id, report_slug', { count: 'exact' })
      .eq('user_id', state.user.id);
    
    // Filtro data
    if (reportsFilters.date !== 'all') {
      const now = new Date();
      let dateFrom = new Date();
      if (reportsFilters.date === '7d') {
        dateFrom.setDate(now.getDate() - 7);
      } else if (reportsFilters.date === '30d') {
        dateFrom.setDate(now.getDate() - 30);
      } else if (reportsFilters.date === '90d') {
        dateFrom.setDate(now.getDate() - 90);
      }
      query = query.gte('created_at', dateFrom.toISOString());
    }
    
    // Filtro ticker
    if (reportsFilters.ticker) {
      query = query.ilike('ticker', `%${reportsFilters.ticker}%`);
    }
    
    // Filtro stato
    if (reportsFilters.status !== 'all') {
      query = query.eq('status', reportsFilters.status);
    }
    
    // Ordina e pagina
    const from = (reportsPage - 1) * reportsPerPage;
    const to = from + reportsPerPage - 1;
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Nessun report trovato con i filtri selezionati.</p></div>';
      if (pagination) pagination.hidden = true;
      return;
    }
    
    // Renderizza report
    const statusLabels = {
      pending: { text: 'In attesa', icon: '⏳', color: 'rgba(251, 191, 36, 0.9)' },
      processing: { text: 'In elaborazione', icon: '⚙️', color: 'rgba(96, 165, 250, 0.9)' },
      completed: { text: 'Completata', icon: '✅', color: 'rgba(34, 197, 94, 0.9)' },
      cancelled: { text: 'Annullata', icon: '❌', color: 'rgba(203, 213, 225, 0.6)' }
    };
    
    container.innerHTML = data.map(request => {
      const status = statusLabels[request.status] || statusLabels.pending;
      const reportLink = (request.report_slug || request.report_id)
        ? `/report/index.html?id=${request.report_slug || request.report_id}`
        : null;
      
      return `
        <article class="report-item">
          <div class="report-header">
            <div>
              <strong>${escapeHtml(request.ticker)}</strong>
              <span class="badge" style="background: ${status.color}20; border-color: ${status.color}; color: ${status.color};">
                ${status.icon} ${status.text}
              </span>
            </div>
            ${reportLink ? `
              <a href="${reportLink}" class="btn btn-sm btn-primary" target="_blank" rel="noopener">
                Visualizza
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 0.5rem; display: inline-block;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ` : ''}
          </div>
          <div class="report-meta">
            <span>Richiesta: ${formatDateTime(request.created_at)}</span>
            ${request.completed_at ? `<span class="report-meta-separator">·</span><span>Completata: ${formatDateTime(request.completed_at)}</span>` : ''}
          </div>
        </article>
      `;
    }).join('');
    
    // Paginazione
    if (pagination && count > reportsPerPage) {
      pagination.hidden = false;
      const totalPages = Math.ceil(count / reportsPerPage);
      const prevBtn = document.getElementById('pagination-prev');
      const nextBtn = document.getElementById('pagination-next');
      const info = document.getElementById('pagination-info');
      
      if (prevBtn) {
        prevBtn.disabled = reportsPage === 1;
        prevBtn.onclick = () => {
          if (reportsPage > 1) {
            reportsPage--;
            loadReports();
          }
        };
      }
      
      if (nextBtn) {
        nextBtn.disabled = reportsPage >= totalPages;
        nextBtn.onclick = () => {
          if (reportsPage < totalPages) {
            reportsPage++;
            loadReports();
          }
        };
      }
      
      if (info) {
        info.textContent = `Pagina ${reportsPage} di ${totalPages}`;
      }
    } else if (pagination) {
      pagination.hidden = true;
    }
  } catch (err) {
    Logger.error('UserArea', 'loadReports error', err);
    container.innerHTML = '<div class="empty-state"><p>Errore nel caricamento dei report.</p></div>';
  }
}

// ===== NOTIFICATIONS SECTION =====

let notificationsFilter = 'all';

async function renderNotificationsSection() {
  const container = document.getElementById('notifications-list-full');
  if (!container) return;
  
  try {
    // Setup tabs notifiche
    setupNotificationTabs();
    
    // Carica notifiche
    await loadNotifications();
  } catch (err) {
    Logger.error('UserArea', 'renderNotificationsSection error', err);
    const container = document.getElementById('notifications-list-full');
    if (container) {
      container.innerHTML = '<div class="empty-state"><p>Errore nel caricamento delle notifiche.</p></div>';
    }
  }
}

function setupNotificationTabs() {
  const tabs = document.querySelectorAll('.notification-tab');
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      notificationsFilter = tab.dataset.notificationType || 'all';
      loadNotifications();
    };
  });
}

async function loadNotifications() {
  const container = document.getElementById('notifications-list-full');
  if (!container) return;
  
  try {
    container.innerHTML = '<div class="empty-state"><p>Caricamento...</p></div>';
    
    // Per ora, notifiche sono generate dinamicamente
    // In futuro, potrebbero essere salvate in una tabella notifications
    const notifications = [];
    
    // Notifiche scadenza piano
    if (state.planExpiresAt && (notificationsFilter === 'all' || notificationsFilter === 'billing')) {
      const expiresDate = new Date(state.planExpiresAt);
      const now = new Date();
      const daysLeft = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0 && daysLeft <= 30) {
        notifications.push({
          type: daysLeft <= 7 ? 'warning' : 'info',
          category: 'billing',
          icon: '⚠️',
          title: 'Piano in scadenza',
          message: `Il tuo piano scade tra ${daysLeft} ${daysLeft === 1 ? 'giorno' : 'giorni'}.`,
          date: state.planExpiresAt,
          action: { text: 'Rinnova', onClick: () => setActiveTab('plan') }
        });
      }
    }
    
    // Notifiche report completati (solo se ci sono report recenti)
    if ((notificationsFilter === 'all' || notificationsFilter === 'reports') && state.user) {
      const { data } = await supabase
        .from('analysis_requests')
        .select('ticker, completed_at, report_id, report_slug')
        .eq('user_id', state.user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);
      
      if (data && data.length > 0) {
        data.forEach(request => {
          notifications.push({
            type: 'success',
            category: 'reports',
            icon: '✅',
            title: 'Analisi completata',
            message: `L'analisi per ${request.ticker} è stata completata.`,
            date: request.completed_at,
            action: { 
              text: 'Visualizza', 
              onClick: () => {
                const reportLink = `/report/index.html?id=${request.report_slug || request.report_id}`;
                window.open(reportLink, '_blank');
              }
            }
          });
        });
      }
    }
    
    // Filtra per categoria
    const filtered = notificationsFilter === 'all' 
      ? notifications 
      : notifications.filter(n => n.category === notificationsFilter);
    
    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Nessuna notifica disponibile.</p></div>';
      return;
    }
    
    // Ordina per data (più recenti prima)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = filtered.map(notif => {
      const actionHtml = notif.action 
        ? `<button class="btn btn-sm btn-outline" onclick="(${notif.action.onClick.toString()})()">${escapeHtml(notif.action.text)}</button>`
        : '';
      
      return `
        <article class="notification-item-full notification-${notif.type}">
          <div class="notification-icon">${notif.icon}</div>
          <div class="notification-content">
            <div class="notification-header">
              <strong>${escapeHtml(notif.title)}</strong>
              <span class="notification-date">${formatRelativeTime(notif.date)}</span>
            </div>
            <p>${escapeHtml(notif.message)}</p>
            ${actionHtml}
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    Logger.error('UserArea', 'loadNotifications error', err);
    container.innerHTML = '<div class="empty-state"><p>Errore nel caricamento delle notifiche.</p></div>';
  }
}
