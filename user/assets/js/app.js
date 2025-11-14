import { supabase, AVATAR_BUCKET } from '/report/assets/js/supabase-client.js';
import Logger from '/report/assets/js/utils/logger.js';
import { siteHeader } from '/report/assets/js/components/site-header.js';
import { openLemonSqueezyUpgrade, openLemonSqueezyCreditsCheckout } from './lemonsqueezy-checkout.js';

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
  community: document.getElementById('panel-community'),
  plan: document.getElementById('panel-plan'),
  inbox: document.getElementById('panel-inbox'),
  auth: document.getElementById('panel-auth')
};

const PROFILE_FORM = document.getElementById('profile-form');
const PROFILE_NAME_FIELD = document.getElementById('profile-display-name');
const PREF_EMAIL_NOTIFICATIONS = document.getElementById('pref-email-notifications');
const PREF_DASHBOARD_ALERTS = document.getElementById('pref-dashboard-alerts');
const PROFILE_RESET = document.getElementById('profile-reset-btn');


const DASHBOARD_STATS = {
  requests: document.getElementById('stat-requests'),
  lastLogin: document.getElementById('stat-last-login'),
  plan: document.getElementById('stat-plan')
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

async function init() {
  siteHeader.mount(document.getElementById('site-header-slot'), { showExport: false });
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  setupTabs();
  await restoreSession();
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

function renderDashboard() {
  if (DASHBOARD_STATS.requests) {
    DASHBOARD_STATS.requests.textContent = state.stats.requests ?? 0;
  }
  if (DASHBOARD_STATS.lastLogin) {
    DASHBOARD_STATS.lastLogin.textContent = state.lastSession
      ? formatDate(new Date(state.lastSession.created_at * 1000 || Date.now()))
      : '—';
  }
  if (DASHBOARD_STATS.plan) {
    DASHBOARD_STATS.plan.textContent = roleLabel(state.role) || '—';
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
        if (state.role === 'guest' || !state.role) {
          // Guest può scegliere tra Pro e Desk con prova gratuita
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
          upgradeBtn.addEventListener('click', () => {
            showToast('Apertura checkout...', 'info');
            openLemonSqueezyUpgrade('pro', state.user?.email || '', getDisplayName());
          });
          actionsContainer.appendChild(upgradeBtn);
        } else if (state.role === 'pro') {
          const upgradeBtn = document.createElement('button');
          upgradeBtn.className = 'btn btn-sm btn-primary';
          upgradeBtn.textContent = 'Passa a Desk Professionale';
          upgradeBtn.addEventListener('click', () => {
            showToast('Apertura checkout...', 'info');
            openLemonSqueezyUpgrade('institutional', state.user?.email || '', getDisplayName());
          });
          actionsContainer.appendChild(upgradeBtn);
        }
  
  // Cancellazione (solo se piano attivo e non admin)
  if (state.role && !state.isAdmin && state.planExpiresAt && state.role !== 'guest') {
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
    showToast('Errore durante l\'attivazione della prova gratuita. Riprova.', 'error');
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
    showToast('Errore durante la cancellazione. Contatta il supporto.', 'error');
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
  const display_name = PROFILE_NAME_FIELD.value.trim();
  const preferences = {
    email_notifications: PREF_EMAIL_NOTIFICATIONS?.checked ?? true,
    dashboard_alerts: PREF_DASHBOARD_ALERTS?.checked ?? true
  };
  
  try {
    PROFILE_FORM.querySelector('button[type="submit"]').disabled = true;
    const payload = {
      user_id: state.user.id,
      display_name: display_name || null,
      preferences: preferences
    };
    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) throw error;
    state.profile = { ...(state.profile || {}), display_name, preferences };
    
    renderHero();
    showToast('Profilo aggiornato.', 'success');
  } catch (err) {
    Logger.error('UserArea', 'profile save error', err);
    showToast(err.message || 'Errore durante il salvataggio.', 'error');
  } finally {
    PROFILE_FORM.querySelector('button[type="submit"]').disabled = false;
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
  
  const email = emailInput?.value?.trim() || '';
  const password = passwordInput?.value || '';
  
  if (!email || !password) {
    showToast('Inserisci email e password.', 'error');
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
  
  const email = emailInput?.value?.trim() || '';
  const password = passwordInput?.value || '';
  
  if (!email || !password) {
    showToast('Inserisci email e password.', 'error');
    return;
  }
  
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
    
    // 3. Crea ruolo guest di default (senza scadenza, accesso limitato)
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'guest',
        valid_until: null // Guest non ha scadenza, ma ha accesso limitato
      });
    
    if (roleError) {
      Logger.warn('UserArea', 'role creation error (may already exist)', roleError);
    }
    
    showToast('Registrazione completata! Account creato con ruolo Guest.', 'success');
    
    // Auto-login dopo registrazione
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) {
      await bootstrapUserArea();
      setTimeout(() => { 
        setActiveTab('profile');
        showToast('Benvenuto! Puoi attivare una prova gratuita di 14 giorni nella sezione Abbonamento.', 'info');
      }, 100);
    } else {
      // Se auto-login fallisce, mostra messaggio
      showToast('Account creato. Effettua il login per continuare.', 'info');
    }
  } catch (err) {
    Logger.error('UserArea', 'signup error', err);
    showToast(err.message || 'Errore durante la registrazione. Riprova.', 'error');
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
      .select('display_name, avatar_url, preferences')
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
    // Conta richieste analisi on-demand
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
    case 'guest':
    default:
      return 'Guest';
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
    case 'guest':
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
  // Guest
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
    showToast('Errore durante il caricamento della foto.', 'error');
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
    
    // Apri checkout Lemon Squeezy
    openLemonSqueezyCreditsCheckout(credits, price, state.user?.email || '');
    
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
  const ticker = PROPOSAL_INPUT.value.trim().toUpperCase();
  
  if (!ticker || ticker.length < 1) {
    showToast('Inserisci un ticker valido (es. AAPL, BTC-USD).', 'error');
    return;
  }
  
  // Validazione ticker avanzata
  if (!isValidTicker(ticker)) {
    showToast('Ticker non valido. Usa formato standard (es. AAPL, BTC-USD, EURUSD).', 'error');
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
      showToast('Errore durante l\'invio della richiesta. ' + (err.message || ''), 'error');
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
      if (err.code === '23505') {
        showToast(`La proposta per ${ticker} esiste già. Puoi votarla nella lista.`, 'error');
      } else {
        showToast('Errore durante l\'invio della proposta.', 'error');
      }
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
    if (err.code === '23505') {
      showToast('Hai già votato questa proposta.', 'error');
    } else {
      showToast('Errore durante il voto.', 'error');
    }
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
    showToast('Errore durante la rimozione.', 'error');
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
