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
// Avatar controls
const AVATAR_FILE = document.getElementById('profile-avatar-file');
const AVATAR_BTN = document.getElementById('profile-avatar-btn');
// Community propose/vote controls
const PROPOSAL_INPUT = document.getElementById('proposal-input');
const PROPOSAL_SUBMIT = document.getElementById('proposal-submit');
const PROPOSAL_LIST = document.getElementById('proposal-list');

const AUTH_CONTAINER = document.getElementById('auth-container');

const state = {
  user: null,
  role: null,
  profile: null,
  stats: { comments: 0, requests: 0 },
  comments: [],
  loading: true,
  lastSession: null,
  proposals: [],
  userVotes: new Set(),
  isAdmin: false,
  credits: null,
  deskLinks: []
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
  if (!tablist) return;
  
  // Remove any existing listener
  if (tablist._tabHandler) {
    tablist.removeEventListener('click', tablist._tabHandler);
  }
  
  // Add single delegated listener
  tablist._tabHandler = (e) => {
    const button = e.target.closest('button[role="tab"]');
    if (!button) return;
    
    e.preventDefault();
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
  
  // Show/hide panels
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
      fetchCommentsHistory(),
      checkAdminStatus()
    ]);
    if (state.role === 'trial' || state.role === 'pro') {
      await Promise.all([fetchProposals(), fetchUserVotes()]);
    }
    if (state.role === 'institutional') {
      await Promise.all([fetchCredits(), fetchDeskLinks()]);
    }
    renderHero();
    renderProfileForm();
    renderDashboard();
    renderCommentsHistory();
    renderPlanSection();
    renderCommunitySection();
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
  logoutBtn.className = 'btn btn-outline';
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
  PROFILE_BIO_FIELD.value = state.profile?.bio || '';
  
  // Setup avatar upload
  if (AVATAR_BTN && AVATAR_FILE) {
    AVATAR_BTN.addEventListener('click', () => AVATAR_FILE.click());
    AVATAR_FILE.addEventListener('change', onAvatarSelected);
  }
  
  // Setup desk links if institutional
  if (state.role === 'institutional') {
    renderDeskLinksSection();
  }
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
  
  if (state.role === 'institutional' && state.credits !== null) {
    const creditsInfo = document.createElement('div');
    creditsInfo.className = 'plan-credits';
    creditsInfo.innerHTML = `<strong>Crediti disponibili: ${state.credits.credits_balance}</strong>`;
    PLAN_ACTIONS.appendChild(creditsInfo);
  }
  
  const actionBtn = document.createElement('a');
  actionBtn.className = 'btn btn-primary';
  actionBtn.href = '/pricing.html';
  actionBtn.textContent = state.role === 'institutional' ? 'Contatta il desk' : 'Consulta prezzi';
  PLAN_ACTIONS.appendChild(actionBtn);
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

async function onProfileSubmit(event) {
  event.preventDefault();
  if (!state.user) {
    showToast('Effettua l'accesso per modificare il profilo.', 'error');
    return;
  }
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
    
    // Save desk links if institutional
    if (state.role === 'institutional') {
      await saveDeskLinks();
    }
    
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
      .select('display_name, bio, avatar_url')
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
      report_slug: item.report?.slug || item.report_id
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
      'Commenti illimitati e note condivise con il desk',
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
  
  const proposeSection = document.getElementById('community-propose');
  const deskSection = document.getElementById('on-demand-desk');
  
  if (!proposeSection || !deskSection) return;
  
  // Show/hide based on role
  if (state.role === 'trial' || state.role === 'pro') {
    proposeSection.hidden = false;
    deskSection.hidden = true;
    renderProposalsList();
    setupProposalHandlers();
  } else if (state.role === 'institutional') {
    proposeSection.hidden = true;
    deskSection.hidden = false;
  } else {
    proposeSection.hidden = true;
    deskSection.hidden = true;
  }
}

function renderProposalsList() {
  if (!PROPOSAL_LIST) return;
  
  if (!state.proposals.length) {
    PROPOSAL_LIST.innerHTML = '<p style="color: rgba(203, 213, 225, 0.6); font-size: 0.9rem;">Nessuna proposta ancora. Sii il primo a proporre un asset!</p>';
    return;
  }
  
  PROPOSAL_LIST.innerHTML = state.proposals.map(proposal => {
    const hasVoted = state.userVotes.has(proposal.id);
    const isOwner = proposal.proposed_by === state.user?.id;
    return `
      <article class="history-item proposal-item">
        <div class="proposal-header">
          <strong>${escapeHtml(proposal.asset_ticker)}</strong>
          <div class="proposal-actions">
            <button class="vote-btn ${hasVoted ? 'voted' : ''}" 
                    data-proposal-id="${proposal.id}" 
                    ${hasVoted ? 'title="Rimuovi voto"' : 'title="Vota"'}
                    aria-label="${hasVoted ? 'Rimuovi voto' : 'Vota'}">
              ${hasVoted ? '★' : '☆'}
            </button>
            <span class="vote-count">${proposal.vote_count}</span>
            ${state.isAdmin ? `<button class="delete-btn" data-proposal-id="${proposal.id}" title="Rimuovi proposta">×</button>` : ''}
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
  PROPOSAL_LIST.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => handleVote(btn.dataset.proposalId));
  });
  
  if (state.isAdmin) {
    PROPOSAL_LIST.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDeleteProposal(btn.dataset.proposalId));
    });
  }
}

function setupProposalHandlers() {
  if (PROPOSAL_SUBMIT) {
    PROPOSAL_SUBMIT.addEventListener('click', handleProposeAsset);
  }
  if (PROPOSAL_INPUT) {
    PROPOSAL_INPUT.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleProposeAsset();
    });
  }
}

async function handleProposeAsset() {
  if (!PROPOSAL_INPUT) return;
  const ticker = PROPOSAL_INPUT.value.trim().toUpperCase();
  
  if (!ticker || ticker.length < 2) {
    showToast('Inserisci un ticker valido (es. AAPL, BTC-USD).', 'error');
    return;
  }
  
  if (state.role !== 'trial' && state.role !== 'pro') {
    showToast('Solo i piani Trial e Pro possono proporre asset.', 'error');
    return;
  }
  
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
    renderProposalsList();
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
}

async function handleVote(proposalId) {
  if (state.role !== 'trial' && state.role !== 'pro') {
    showToast('Solo i piani Trial e Pro possono votare.', 'error');
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
    renderProposalsList();
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
    renderProposalsList();
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

async function fetchDeskLinks() {
  if (!state.user) return;
  try {
    const { data, error } = await supabase
      .from('desk_public_links')
      .select('id, link_url, link_label, display_order')
      .eq('user_id', state.user.id)
      .order('display_order', { ascending: true });
    if (error) throw error;
    state.deskLinks = data || [];
  } catch (err) {
    Logger.warn('UserArea', 'desk links fetch error', err);
    state.deskLinks = [];
  }
}

function renderDeskLinksSection() {
  const section = document.getElementById('desk-links-section');
  const list = document.getElementById('desk-links-list');
  const addBtn = document.getElementById('add-desk-link-btn');
  
  if (!section || !list || !addBtn) return;
  
  section.hidden = false;
  
  // Render existing links
  list.innerHTML = state.deskLinks.map((link, idx) => `
    <div class="desk-link-item">
      <div style="display: grid; gap: 0.5rem; flex: 1;">
        <input type="url" 
               id="link-url-${link.id}" 
               value="${escapeHtml(link.link_url)}" 
               placeholder="https://..." 
               required>
        <input type="text" 
               id="link-label-${link.id}" 
               value="${escapeHtml(link.link_label || '')}" 
               placeholder="Etichetta (opzionale)">
      </div>
      <button type="button" 
              class="delete-btn" 
              data-link-id="${link.id}" 
              title="Rimuovi link">×</button>
    </div>
  `).join('');
  
  // Add remove handlers
  list.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleRemoveDeskLink(btn.dataset.linkId));
  });
  
  // Add button handler
  addBtn.addEventListener('click', handleAddDeskLink);
}

async function handleAddDeskLink() {
  if (state.deskLinks.length >= 3) {
    showToast('Massimo 3 link consentiti.', 'error');
    return;
  }
  
  try {
    const nextOrder = state.deskLinks.length;
    const { data, error } = await supabase
      .from('desk_public_links')
      .insert({
        user_id: state.user.id,
        link_url: 'https://',
        link_label: '',
        display_order: nextOrder
      })
      .select()
      .single();
    
    if (error) throw error;
    
    state.deskLinks.push(data);
    renderDeskLinksSection();
  } catch (err) {
    Logger.error('UserArea', 'add desk link error', err);
    showToast('Errore durante l\'aggiunta del link.', 'error');
  }
}

async function handleRemoveDeskLink(linkId) {
  try {
    const { error } = await supabase
      .from('desk_public_links')
      .delete()
      .eq('id', linkId);
    
    if (error) throw error;
    
    state.deskLinks = state.deskLinks.filter(l => l.id !== linkId);
    renderDeskLinksSection();
    showToast('Link rimosso.', 'success');
  } catch (err) {
    Logger.error('UserArea', 'remove desk link error', err);
    showToast('Errore durante la rimozione.', 'error');
  }
}

async function saveDeskLinks() {
  if (state.role !== 'institutional') return;
  
  const list = document.getElementById('desk-links-list');
  if (!list) return;
  
  const updates = [];
  list.querySelectorAll('.desk-link-item').forEach(item => {
    const urlInput = item.querySelector('input[type="url"]');
    const labelInput = item.querySelector('input[type="text"]');
    const linkId = item.querySelector('.delete-btn')?.dataset.linkId;
    
    if (urlInput && linkId) {
      updates.push({
        id: linkId,
        link_url: urlInput.value.trim(),
        link_label: labelInput?.value.trim() || null
      });
    }
  });
  
  if (!updates.length) return;
  
  try {
    await Promise.all(updates.map(update => 
      supabase
        .from('desk_public_links')
        .update({
          link_url: update.link_url,
          link_label: update.link_label
        })
        .eq('id', update.id)
    ));
    
    await fetchDeskLinks();
    renderDeskLinksSection();
  } catch (err) {
    Logger.error('UserArea', 'save desk links error', err);
    showToast('Errore durante il salvataggio dei link.', 'error');
  }
}

