import { supabase } from '../../report/assets/js/supabase-client.js';
import Logger from '../../report/assets/js/utils/logger.js';

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
  comments: document.getElementById('panel-comments'),
  community: document.getElementById('panel-community'),
  plan: document.getElementById('panel-plan'),
  inbox: document.getElementById('panel-inbox'),
  auth: document.getElementById('panel-auth')
};

const PROFILE_FORM = document.getElementById('profile-form');
const PROFILE_NAME_FIELD = document.getElementById('profile-display-name');
const PROFILE_BIO_FIELD = document.getElementById('profile-bio');
const PROFILE_RESET = document.getElementById('profile-reset-btn');

const COMMENTS_HISTORY_LIST = document.getElementById('comments-history-list');
const COMMENTS_HISTORY_PLACEHOLDER = document.getElementById('comments-history-placeholder');

const DASHBOARD_STATS = {
  comments: document.getElementById('stat-comments'),
  requests: document.getElementById('stat-requests'),
  lastLogin: document.getElementById('stat-last-login'),
  plan: document.getElementById('stat-plan')
};

const PLAN_CARD = document.getElementById('plan-card');
const PLAN_DESCRIPTION = document.getElementById('plan-description');
const PLAN_BENEFITS = document.getElementById('plan-benefits');
const PLAN_ACTIONS = document.getElementById('plan-actions');

const AUTH_CONTAINER = document.getElementById('auth-container');

const state = {
  user: null,
  role: null,
  profile: null,
  stats: { comments: 0, requests: 0 },
  comments: [],
  loading: true,
  lastSession: null
};

init();

async function init() {
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
      renderAuthPanel();
    } else {
      bootstrapUserArea();
    }
  });
}

function setupTabs() {
  TAB_BUTTONS.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.id.replace('tab-', '');
      setActiveTab(tabId);
    });
  });
}

function setActiveTab(tabId) {
  TAB_BUTTONS.forEach(btn => {
    const selected = btn.id === `tab-${tabId}`;
    btn.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  Object.entries(PANELS).forEach(([key, panel]) => {
    if (!panel) return;
    if (key === tabId) {
      panel.hidden = false;
    } else if (key !== 'auth') {
      panel.hidden = true;
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
      fetchUserRole(),
      fetchUserProfile(),
      fetchDashboardStats(),
      fetchCommentsHistory()
    ]);
    renderHero();
    renderProfileForm();
    renderDashboard();
    renderCommentsHistory();
    renderPlanSection();
    setActiveTab('dashboard');
    if (PANELS.auth) PANELS.auth.hidden = true;
  } catch (err) {
    Logger.error('UserArea', 'bootstrap error', err);
    showToast(err.message || 'Errore nel caricamento dell’area utente.', 'error');
  }
}

function renderHero() {
  if (!HERO) return;
  const displayName = getDisplayName();
  const initials = deriveInitials(displayName);
  AVATAR.textContent = initials;
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
  logoutBtn.className = 'btn btn-outline';
  logoutBtn.textContent = 'Esci';
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showToast('Logout effettuato.', 'info');
  });
  CTA.appendChild(logoutBtn);
}

function renderProfileForm() {
  if (!PROFILE_FORM) return;
  PROFILE_NAME_FIELD.value = state.profile?.display_name || getDisplayName();
  PROFILE_BIO_FIELD.value = state.profile?.bio || '';

  PROFILE_FORM.addEventListener('submit', async (event) => {
    event.preventDefault();
    const display_name = PROFILE_NAME_FIELD.value.trim();
    const bio = PROFILE_BIO_FIELD.value.trim();
    try {
      PROFILE_FORM.querySelector('button[type="submit"]').disabled = true;
      const payload = {
        user_id: state.user.id,
        display_name: display_name || null,
        bio: bio || null
      };
      const { error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      state.profile = { ...(state.profile || {}), display_name, bio };
      renderHero();
      showToast('Profilo aggiornato.', 'success');
    } catch (err) {
      Logger.error('UserArea', 'profile save error', err);
      showToast(err.message || 'Errore durante il salvataggio.', 'error');
    } finally {
      PROFILE_FORM.querySelector('button[type="submit"]').disabled = false;
    }
  }, { once: true });

  PROFILE_RESET.addEventListener('click', () => {
    PROFILE_NAME_FIELD.value = state.profile?.display_name || getDisplayName();
    PROFILE_BIO_FIELD.value = state.profile?.bio || '';
  });
}

function renderDashboard() {
  if (DASHBOARD_STATS.comments) {
    DASHBOARD_STATS.comments.textContent = state.stats.comments ?? 0;
  }
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

function renderCommentsHistory() {
  if (!COMMENTS_HISTORY_LIST || !COMMENTS_HISTORY_PLACEHOLDER) return;
  if (!state.comments.length) {
    COMMENTS_HISTORY_PLACEHOLDER.hidden = false;
    COMMENTS_HISTORY_LIST.innerHTML = '';
    return;
  }
  COMMENTS_HISTORY_PLACEHOLDER.hidden = true;
  COMMENTS_HISTORY_LIST.innerHTML = state.comments.map(comment => `
    <article class="history-item">
      <div class="history-item-header">
        <span>${formatDateTime(comment.created_at)} · ${escapeHtml(comment.report_slug || '')}</span>
      </div>
      <div class="history-item-body">${escapeHtml(comment.body)}</div>
    </article>
  `).join('');
}

function renderPlanSection() {
  if (!PLAN_CARD) return;
  PLAN_DESCRIPTION.textContent = planDescription(state.role);
  PLAN_BENEFITS.innerHTML = planBenefits(state.role).map(item => `<span>• ${escapeHtml(item)}</span>`).join('');
  PLAN_ACTIONS.innerHTML = '';
  const upgradeBtn = document.createElement('button');
  upgradeBtn.className = 'btn btn-primary';
  upgradeBtn.textContent = state.role === 'institutional' ? 'Contatta il desk' : 'Richiedi upgrade';
  upgradeBtn.addEventListener('click', () => {
    showToast('Il team commerciale ti contatterà a breve.', 'info');
  });
  PLAN_ACTIONS.appendChild(upgradeBtn);
}

function renderAuthPanel() {
  if (!PANELS.auth || !AUTH_CONTAINER) return;
  setActiveTab('auth');
  PANELS.auth.hidden = false;
  Object.entries(PANELS).forEach(([key, panel]) => {
    if (key !== 'auth' && panel) panel.hidden = true;
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
  } catch (err) {
    Logger.error('UserArea', 'login error', err);
    showToast(err.message || 'Credenziali non valide.', 'error');
  } finally {
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

async function fetchUserRole() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', state.user.id)
      .maybeSingle();
    if (error) throw error;
    state.role = data?.role || 'trial';
  } catch (err) {
    Logger.warn('UserArea', 'role fetch error', err);
    state.role = null;
  }
}

async function fetchUserProfile() {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('display_name, bio')
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
    const { count, error } = await supabase
      .from('report_comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', state.user.id)
      .eq('is_deleted', false);
    if (error) throw error;
    state.stats.comments = count ?? 0;
    state.stats.requests = 0; // placeholder per future analysis_requests
  } catch (err) {
    Logger.warn('UserArea', 'stats error', err);
  }
}

async function fetchCommentsHistory() {
  try {
    const { data, error } = await supabase
      .from('report_comments')
      .select('id, body, created_at, report_id, is_deleted, report:reports!inner(slug)')
      .eq('user_id', state.user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    state.comments = (data || []).map(item => ({
      id: item.id,
      body: item.body,
      created_at: item.created_at,
      report_slug: item.report?.slug || 'Report'
    }));
  } catch (err) {
    Logger.warn('UserArea', 'comment history error', err);
    state.comments = [];
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
      return 'Institutional';
    case 'trial':
    default:
      return 'Trial';
  }
}

function planDescription(role) {
  switch (role) {
    case 'institutional':
      return 'Accesso completo ai report Swing Master, desk dedicato, supporto prioritario e roadmap condivisa.';
    case 'pro':
      return 'Report completi, commenti illimitati e accesso alle richieste community. Upgrade Institutional su richiesta.';
    case 'trial':
    default:
      return 'Accesso in sola lettura ai report pubblici. Per commentare e votare le analisi richiedi l’upgrade Pro.';
  }
}

function planBenefits(role) {
  if (role === 'institutional') {
    return [
      'Report completi e note desk in anteprima',
      'Supporto 1:1 con analisti Tradelia',
      'Canale dedicato per richieste ticker e macro view',
      'Accesso anticipato a strumenti AI proprietari'
    ];
  }
  if (role === 'pro') {
    return [
      'Commenti illimitati sui report',
      'Votazione giornaliera richieste community',
      'Accesso ai template Swing Master 5.0',
      'Inviti priority agli eventi Tradelia Live'
    ];
  }
  return [
    'Accesso report pubblici e newsletter settimanale',
    'Aggiornamenti principali della community',
    'Possibilità di richiedere upgrade Pro/Institutional'
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

