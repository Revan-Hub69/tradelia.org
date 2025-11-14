import { supabase, AVATAR_BUCKET } from '/report/assets/js/supabase-client.js';
import Logger from '/report/assets/js/utils/logger.js';
import { siteHeader } from '/report/assets/js/components/site-header.js';

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

init();

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
      showToast('Sessione terminata.', 'info');
      // Reindirizza alla home quando la sessione termina
      setTimeout(() => { window.location.href = '/'; }, 200);
    } else {
      // Assicura l'area utente attiva dopo login
      bootstrapUserArea();
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
  
  // Show/hide panels - use removeAttribute/setAttribute instead of hidden property
  Object.entries(PANELS).forEach(([key, panel]) => {
    if (!panel) {
      Logger.warn('UserArea', `Panel not found: ${key}`);
      return;
    }
    if (key === tabId) {
      panel.removeAttribute('hidden');
      panel.style.display = '';
    } else if (key !== 'auth') {
      panel.setAttribute('hidden', '');
    }
  });
}

async function restoreSession() {
  const { data } = await supabase.auth.getSession();
  state.user = data?.session?.user || null;
  state.lastSession = data?.session || null;
}

async function bootstrapUserArea() {
  if (!state.user) return;
  try {
    await Promise.all([
      checkAdminStatus(),
      fetchUserProfile(),
      fetchDashboardStats(),
    ]);
    // Fetch role dopo admin check (admin ha sempre ruolo institutional)
    await fetchUserRole();
    // Fetch proposals per Trial/Pro/Desk (Desk ha accesso a tutte le funzioni)
    if (state.role === 'trial' || state.role === 'pro' || state.role === 'institutional') {
      await Promise.all([fetchProposals(), fetchUserVotes()]);
    }
    // Fetch credits for all users (to show counter)
    await fetchCredits();
    renderHero();
    renderProfileForm();
    renderDashboard();
    renderPlanSection();
    renderCommunitySection();
    setActiveTab('dashboard');
    if (PANELS.auth) PANELS.auth.setAttribute('hidden', '');
  } catch (err) {
    Logger.error('UserArea', 'bootstrap error', err);
    showToast(err.message || 'Errore nel caricamento dell’area utente.', 'error');
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
  
  if (state.role === 'institutional' && state.credits !== null) {
    const creditsInfo = document.createElement('div');
    creditsInfo.className = 'plan-credits';
    creditsInfo.innerHTML = `<strong>Crediti disponibili: ${state.credits.credits_balance}</strong>`;
    PLAN_ACTIONS.appendChild(creditsInfo);
  }
  
  const actionBtn = document.createElement('a');
  actionBtn.className = 'btn btn-sm btn-primary';
  actionBtn.href = '/pricing.html';
  actionBtn.textContent = state.role === 'institutional' ? 'Contatta il desk' : 'Consulta prezzi';
  PLAN_ACTIONS.appendChild(actionBtn);
}

function renderAuthPanel() {
  if (!PANELS.auth || !AUTH_CONTAINER) return;
  setActiveTab('auth');
  PANELS.auth.removeAttribute('hidden');
  Object.entries(PANELS).forEach(([key, panel]) => {
    if (key !== 'auth' && panel) panel.setAttribute('hidden', '');
  });
  AUTH_CONTAINER.innerHTML = `
    <form class="profile-form" id="area-auth-form">
      <label>
        Email
        <input type="email" name="email" autocomplete="email" required placeholder="nome@azienda.com">
      </label>
      <label>
        Password
        <input type="password" name="password" autocomplete="current-password" required minlength="8" placeholder="Password">
      </label>
      <div class="user-cta">
        <button class="btn btn-primary" type="submit">Accedi</button>
        <button class="btn btn-outline" type="button" id="btn-signup">Richiedi accesso</button>
      </div>
    </form>
  `;
  const form = document.getElementById('area-auth-form');
  const btnSignup = document.getElementById('btn-signup');
  form.addEventListener('submit', handleLoginSubmit);
  btnSignup.addEventListener('click', () => showToast('Scrivi a info@tradelia.org per ottenere credenziali.', 'info'));
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
  PROFILE_BIO_FIELD.value = state.profile?.bio || '';
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) {
    showToast('Inserisci email e password.', 'error');
    return;
  }
  try {
    form.querySelector('button[type="submit"]').disabled = true;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showToast('Accesso effettuato.', 'success');
    await bootstrapUserArea();
    setTimeout(() => { setActiveTab('profile'); }, 100);
  } catch (err) {
    Logger.error('UserArea', 'login error', err);
    showToast(err.message || 'Credenziali non valide.', 'error');
  } finally {
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

async function fetchUserRole() {
  try {
    // Se è admin, ruolo è sempre institutional (Desk illimitato, permanente)
    if (state.isAdmin) {
      state.role = 'institutional';
      state.planExpiresAt = null; // Admin = permanente
      return;
    }
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, valid_until')
      .eq('user_id', state.user.id)
      .maybeSingle();
    if (error) throw error;
    
    state.role = data?.role || null;
    state.planExpiresAt = data?.valid_until || null;
    
    // Verifica se il piano è scaduto
    if (state.planExpiresAt) {
      const expiresAt = new Date(state.planExpiresAt);
      const now = new Date();
      if (expiresAt < now) {
        // Piano scaduto - disabilita accesso
        state.role = null;
        showToast('Il tuo piano è scaduto. Rinnova per continuare ad utilizzare la piattaforma.', 'error');
      }
    }
  } catch (err) {
    Logger.warn('UserArea', 'role fetch error', err);
    state.role = null;
    state.planExpiresAt = null;
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
    default:
      return 'Trial';
  }
}

function planDescription(role) {
  switch (role) {
    case 'institutional':
      return 'Ricerca dedicata con deck SRD/MTB integrati, fatturazione corporate e canali diretti con il desk analisti.';
    case 'pro':
      return 'Accesso completo ai deck SRD v5.0 e MTB v3.1, strumenti community e notifiche operative in tempo reale.';
    case 'trial':
    default:
      return 'Consulta i dossier ufficiali e attiva 14 giorni di accesso completo. Le sezioni ad alto contenuto restano oscurate senza abbonamento.';
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
  return [
    'Accesso ai documenti istituzionali con sezioni sensibili oscurate',
    'Attivazione prova Pro di 14 giorni con un click',
    'Aggiornamenti sulle analisi pubbliche e distanza dalle release complete'
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
    if (error) throw error;
    state.isAdmin = !!data;
  } catch (err) {
    Logger.warn('UserArea', 'admin check error', err);
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
    
    // Mostra/nascondi lock in base a ruolo e crediti
    if (state.role === 'institutional') {
      const credits = state.credits?.credits_balance ?? 0;
      if (!state.isAdmin && credits <= 0) {
        showRequestAnalysisLock('Non hai crediti disponibili. Acquista crediti per richiedere analisi on demand.');
      } else {
        hideRequestAnalysisLock();
      }
    } else if (state.role !== 'trial' && state.role !== 'pro') {
      showRequestAnalysisLock('Questa funzionalità richiede un piano attivo.');
    } else {
      hideRequestAnalysisLock();
    }
  }
  
  // Show community proposals card for Trial/Pro/Desk (Desk ha accesso a tutte le funzioni)
  if (COMMUNITY_PROPOSE_CARD) {
    if (state.role === 'trial' || state.role === 'pro' || state.role === 'institutional') {
      COMMUNITY_PROPOSE_CARD.hidden = false;
      renderCommunityProposalsList();
    } else {
      COMMUNITY_PROPOSE_CARD.hidden = true;
    }
  }
  
  // Setup handlers
  setupProposalHandlers();
  setupCreditsHandlers();
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
  if (BUY_CREDITS_BTN) {
    BUY_CREDITS_BTN.addEventListener('click', () => {
      window.location.href = '/pricing.html';
    });
  }
  
  if (REQUEST_ANALYSIS_LOCK_UPGRADE) {
    REQUEST_ANALYSIS_LOCK_UPGRADE.addEventListener('click', () => {
      window.location.href = '/pricing.html';
    });
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
        .select('id, ticker, status, created_at, completed_at')
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
          pending: { text: 'In attesa', color: 'rgba(251, 191, 36, 0.9)' },
          processing: { text: 'In elaborazione', color: 'rgba(96, 165, 250, 0.9)' },
          completed: { text: 'Completata', color: 'rgba(34, 197, 94, 0.9)' },
          cancelled: { text: 'Annullata', color: 'rgba(203, 213, 225, 0.6)' }
        };
        const status = statusLabels[request.status] || statusLabels.pending;
        
        return `
          <article class="history-item proposal-item">
            <div class="proposal-header">
              <strong>${escapeHtml(request.ticker)}</strong>
              <span class="badge" style="background: ${status.color}20; border-color: ${status.color}; color: ${status.color};">
                ${status.text}
              </span>
            </div>
            <div class="proposal-meta">
              <span>${formatDateTime(request.created_at)}</span>
              ${request.completed_at ? `<span class="history-item-separator">·</span><span>Completata: ${formatDateTime(request.completed_at)}</span>` : ''}
            </div>
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
    COMMUNITY_PROPOSALS_LIST.innerHTML = '<p style="color: rgba(203, 213, 225, 0.6); font-size: 0.9rem;">Nessuna proposta ancora. Sii il primo a proporre un asset!</p>';
    return;
  }
  
  COMMUNITY_PROPOSALS_LIST.innerHTML = state.proposals.map(proposal => {
    const hasVoted = state.userVotes.has(proposal.id);
    const isOwner = proposal.proposed_by === state.user?.id;
    return `
      <article class="history-item proposal-item">
        <div class="proposal-header">
          <strong>${escapeHtml(proposal.asset_ticker)}</strong>
          <div class="proposal-actions">
            <button class="btn btn-sm vote-btn ${hasVoted ? 'voted' : ''}" 
                    data-proposal-id="${proposal.id}" 
                    ${hasVoted ? 'title="Rimuovi voto"' : 'title="Vota"'}
                    aria-label="${hasVoted ? 'Rimuovi voto' : 'Vota'}">
              ${hasVoted ? '★' : '☆'}
            </button>
            <span class="vote-count">${proposal.vote_count}</span>
            ${state.isAdmin ? `<button class="btn btn-sm delete-btn" data-proposal-id="${proposal.id}" title="Rimuovi proposta">×</button>` : ''}
          </div>
        </div>
        <div class="proposal-meta">
          ${isOwner ? '<span class="badge">Tua proposta</span>' : ''}
          <span>${formatDateTime(proposal.created_at)}</span>
        </div>
      </article>
    `;
  }).join('');
  
  // Attach event listeners
  COMMUNITY_PROPOSALS_LIST.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => handleVote(btn.dataset.proposalId));
  });
  
  if (state.isAdmin) {
    COMMUNITY_PROPOSALS_LIST.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDeleteProposal(btn.dataset.proposalId));
    });
  }
}

function setupProposalHandlers() {
  if (PROPOSAL_SUBMIT && !PROPOSAL_SUBMIT._hasHandler) {
    PROPOSAL_SUBMIT.addEventListener('click', handleProposeAsset);
    PROPOSAL_SUBMIT._hasHandler = true;
  }
  if (PROPOSAL_INPUT && !PROPOSAL_INPUT._hasHandler) {
    PROPOSAL_INPUT.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleProposeAsset();
    });
    PROPOSAL_INPUT._hasHandler = true;
  }
  
  // Update button text based on role
  if (PROPOSAL_SUBMIT) {
    if (state.role === 'institutional') {
      PROPOSAL_SUBMIT.textContent = 'Invia ticker';
    } else if (state.role === 'trial' || state.role === 'pro') {
      PROPOSAL_SUBMIT.textContent = 'Proponi';
    } else {
      PROPOSAL_SUBMIT.textContent = 'Invia ticker';
    }
  }
}

async function handleProposeAsset() {
  if (!PROPOSAL_INPUT) return;
  const ticker = PROPOSAL_INPUT.value.trim().toUpperCase();
  
  if (!ticker || ticker.length < 2) {
    showToast('Inserisci un ticker valido (es. AAPL, BTC-USD).', 'error');
    return;
  }
  
  // Check if user has credits (for on-demand requests)
  const credits = state.credits?.credits_balance ?? 0;
  
  // For institutional users: require credits for on-demand requests (admin bypass)
  if (state.role === 'institutional') {
    // Admin ha sempre accesso illimitato, bypass controllo crediti
    if (!state.isAdmin && credits <= 0) {
      showRequestAnalysisLock('Non hai crediti disponibili. Acquista crediti per richiedere analisi on demand.');
      return;
    }
    // Nascondi lock se ha crediti o è admin
    hideRequestAnalysisLock();
    
    // Deduct credit and create request (admin bypass)
    try {
      PROPOSAL_SUBMIT.disabled = true;
      
      // Create analysis request
      const { data: requestData, error: requestError } = await supabase
        .from('analysis_requests')
        .insert({
          ticker: ticker,
          user_id: state.user.id,
          status: 'pending'
        })
        .select()
        .single();
      
      if (requestError) throw requestError;
      
      // Deduct credit solo se non è admin (admin ha crediti illimitati)
      if (!state.isAdmin) {
        const { error: creditError } = await supabase
          .from('user_analysis_credits')
          .update({
            credits_balance: credits - 1,
            total_used: (state.credits?.total_used ?? 0) + 1
          })
          .eq('user_id', state.user.id);
        
        if (creditError) throw creditError;
        
        // Refresh credits
        await fetchCredits();
        renderCreditsCounter();
        showToast('Richiesta inviata! Un credito è stato scalato.', 'success');
      } else {
        showToast('Richiesta inviata! (Admin: crediti illimitati)', 'success');
      }
      
      PROPOSAL_INPUT.value = '';
      await renderProposalsList();
    } catch (err) {
      Logger.error('UserArea', 'on-demand request error', err);
      showToast('Errore durante l\'invio della richiesta.', 'error');
    } finally {
      PROPOSAL_SUBMIT.disabled = false;
    }
    return;
  }
  
  // For Trial/Pro/Desk users: create community proposal (no credits required)
  // Desk ha accesso a tutte le funzioni dei piani inferiori
  if (state.role === 'trial' || state.role === 'pro' || state.role === 'institutional') {
    try {
      PROPOSAL_SUBMIT.disabled = true;
      const { data, error } = await supabase
        .from('asset_proposals')
        .insert({
          asset_ticker: ticker,
          proposed_by: state.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      state.proposals.unshift(data);
      PROPOSAL_INPUT.value = '';
      renderCommunityProposalsList();
      showToast('Proposta inviata!', 'success');
    } catch (err) {
      Logger.error('UserArea', 'proposal error', err);
      if (err.code === '23505') {
        showToast('Questa proposta esiste già.', 'error');
      } else {
        showToast('Errore durante l\'invio della proposta.', 'error');
      }
    } finally {
      PROPOSAL_SUBMIT.disabled = false;
    }
    return;
  }
  
  // No role or insufficient permissions
  showRequestAnalysisLock('Questa funzionalità richiede un piano attivo.');
}

async function handleVote(proposalId) {
  // Desk ha accesso a tutte le funzioni dei piani inferiori
  if (state.role !== 'trial' && state.role !== 'pro' && state.role !== 'institutional') {
    showToast('Questa funzionalità richiede un piano attivo.', 'error');
    return;
  }
  
  const hasVoted = state.userVotes.has(proposalId);
  
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
    }
    
    // Refresh proposals to get updated vote counts
    await fetchProposals();
    renderCommunityProposalsList();
  } catch (err) {
    Logger.error('UserArea', 'vote error', err);
    showToast('Errore durante il voto.', 'error');
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
    state.credits = data || { credits_balance: 0, total_purchased: 0, total_used: 0 };
  } catch (err) {
    Logger.warn('UserArea', 'credits fetch error', err);
    state.credits = { credits_balance: 0, total_purchased: 0, total_used: 0 };
  }
}

