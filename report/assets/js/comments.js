import Logger from './utils/logger.js';
import { supabase } from './supabase-client.js';

const SECTION = document.getElementById('report-comments-section');
const PANEL = document.getElementById('report-comments-panel');
const AUTH_CARD = document.getElementById('report-comments-auth');
const FORM_WRAPPER = document.getElementById('report-comments-form-wrapper');
const LIST = document.getElementById('report-comments-list');
const EMPTY = document.getElementById('report-comments-empty');
const ERROR_BOX = document.getElementById('report-comments-error');
const TOAST = document.getElementById('comments-toast');

const state = {
  report: null,
  user: null,
  role: null,
  profile: null,
  comments: [],
  loading: false,
  authMode: 'login',
  isSubmitting: false,
  hasBootstraped: false,
};

if (SECTION) {
  initialize();
}

function initialize() {
  window.addEventListener('tradelia:reportLoaded', (event) => {
    Logger.debug('Comments', 'Report loaded event', event.detail);
    state.report = event.detail?.report || null;
    if (state.report && !state.hasBootstraped) {
      bootstrap();
    }
  });

  if (window.__tradeliaReportContext?.report && !state.hasBootstraped) {
    state.report = window.__tradeliaReportContext.report;
    bootstrap();
  }
}

async function bootstrap() {
  if (!state.report) {return;}
  state.hasBootstraped = true;
  renderSkeleton();
  await restoreSession();
  await loadComments();
  render();

  supabase.auth.onAuthStateChange((_event, session) => {
    state.user = session?.user || null;
    synchronizeUserContext()
      .then(() => {
        render();
        if (state.report) {loadComments();}
      })
      .catch((err) => Logger.warn('Comments', 'auth change sync error', err));
  });
}

function renderSkeleton() {
  if (!PANEL) {return;}
  PANEL.setAttribute('data-state', 'loading');
}

function render() {
  if (!PANEL) {return;}
  PANEL.removeAttribute('data-state');
  renderAuthCard();
  renderForm();
  renderComments();
}

function renderAuthCard() {
  if (!AUTH_CARD) {return;}

  if (state.user) {
    AUTH_CARD.hidden = true;
    AUTH_CARD.innerHTML = '';
    return;
  }

  AUTH_CARD.hidden = false;
  const isLogin = state.authMode === 'login';
  AUTH_CARD.innerHTML = `
    <h3>${isLogin ? 'Accedi per partecipare' : 'Richiedi le tue credenziali'}</h3>
    <p>${
      isLogin
        ? 'Inserisci le credenziali istituzionali per commentare e partecipare alla community Tradelia.'
        : 'Compila i campi per creare un account. Riceverai una mail di conferma per completare l’attivazione.'
    }</p>
    <form id="comments-auth-form">
      <label>
        Email istituzionale
        <input type="email" name="email" autocomplete="email" required placeholder="nome@azienda.com" />
      </label>
      <label>
        Password
        <input type="password" name="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required minlength="8" placeholder="Password" />
      </label>
      <button class="btn btn-primary" type="submit">${isLogin ? 'Accedi' : 'Registrati'}</button>
    </form>
    <div class="comments-login-switch">
      ${
        isLogin
          ? 'Non hai ancora un account? <button type="button" data-switch="signup">Richiedi accesso</button>'
          : 'Hai già le credenziali? <button type="button" data-switch="login">Accedi qui</button>'
      }
    </div>
  `;

  const form = AUTH_CARD.querySelector('#comments-auth-form');
  form.addEventListener('submit', handleAuthSubmit);
  AUTH_CARD.querySelector('[data-switch]')?.addEventListener('click', (e) => {
    state.authMode = e.currentTarget.getAttribute('data-switch');
    renderAuthCard();
  });
}

function renderForm() {
  if (!FORM_WRAPPER) {return;}

  if (!state.user) {
    FORM_WRAPPER.hidden = true;
    FORM_WRAPPER.innerHTML = '';
    return;
  }

  const canComment = state.role === 'pro' || state.role === 'institutional' || isAdmin();
  FORM_WRAPPER.hidden = false;
  const displayName = getDisplayName();
  const disabledMessage = canComment
    ? ''
    : 'Il tuo piano non consente ancora di pubblicare commenti. Contatta il team Tradelia per effettuare l’upgrade.';

  FORM_WRAPPER.innerHTML = `
    <form class="comments-form" id="report-comment-form">
      <div>
        <label for="report-comment-text">Commento</label>
        <textarea id="report-comment-text" name="comment" placeholder="Condividi insight operativi, livelli chiave o elementi di rischio…" ${canComment ? '' : 'disabled'}></textarea>
      </div>
      <div class="comments-actions">
        <div class="comments-guidelines">
          <strong>${escapeHtml(displayName)}</strong> · Tone of voice istituzionale, niente segnali finanziari personalizzati.
        </div>
        <button class="btn btn-primary" type="submit" ${canComment ? '' : 'disabled'}>
          ${state.isSubmitting ? 'Pubblicazione…' : 'Pubblica commento'}
        </button>
      </div>
    </form>
    ${disabledMessage ? `<div class="comments-locked">${disabledMessage}</div>` : ''}
  `;

  if (canComment) {
    const form = document.getElementById('report-comment-form');
    form.addEventListener('submit', handleCommentSubmit);
  }
}

function renderComments() {
  if (!LIST || !EMPTY || !ERROR_BOX) {return;}

  if (!state.comments.length) {
    EMPTY.hidden = false;
    LIST.innerHTML = '';
    return;
  }

  EMPTY.hidden = true;
  LIST.innerHTML = state.comments.map(renderCommentCard).join('');

  LIST.querySelectorAll('[data-comment-delete]').forEach((btn) => {
    btn.addEventListener('click', handleDeleteComment);
  });
}

function renderCommentCard(comment) {
  const name =
    comment.display_name || comment.author_display_name || `Utente ${comment.user_id.slice(0, 6)}`;
  const initials = deriveInitials(name);
  const roleLabel = comment.author_role ? roleLabelMap(comment.author_role) : null;
  const canModerate = comment.user_id === state.user?.id || isAdmin();
  const hasAvatar = !!comment.avatar_url;
  const avatarStyle = hasAvatar
    ? `background-image: url('${escapeHtml(comment.avatar_url)}'); background-size: cover; background-position: center;`
    : '';

  return `
    <li class="comment-card" data-comment-id="${comment.id}">
      <div class="comment-header">
        <div class="comment-author">
          <span class="comment-avatar ${hasAvatar ? 'has-image' : ''}" style="${avatarStyle}">${hasAvatar ? '' : escapeHtml(initials)}</span>
          <button type="button" class="comment-author-name" data-user-id="${comment.user_id}" data-user-name="${escapeHtml(name)}" aria-label="Visualizza profilo di ${escapeHtml(name)}">
            ${escapeHtml(name)}
          </button>
          ${roleLabel ? `<span class="comment-role">${escapeHtml(roleLabel)}</span>` : ''}
        </div>
        <div class="comment-meta">
          <span>${formatRelativeTime(comment.created_at)}</span>
        </div>
      </div>
      <div class="comment-body">${escapeHtml(comment.body)}</div>
      ${
        canModerate
          ? `
        <div class="comment-actions">
          <button type="button" class="btn btn-sm danger" data-comment-delete="${comment.id}">Elimina</button>
        </div>
      `
          : ''
      }
    </li>
  `;
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value;
  if (!email || !password) {
    showToast('Compila email e password.', 'error');
    return;
  }

  try {
    form.querySelector('button[type="submit"]').disabled = true;
    if (state.authMode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {throw error;}
      showToast('Accesso effettuato.', 'success');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {throw error;}
      showToast('Controlla la mail per confermare il tuo account.', 'success');
    }
  } catch (err) {
    Logger.error('Comments', 'Auth error', err);
    showToast(err.message || 'Errore durante l’autenticazione.', 'error');
  } finally {
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

async function handleCommentSubmit(event) {
  event.preventDefault();
  if (state.isSubmitting) {return;}

  const textarea = event.currentTarget.querySelector('#report-comment-text');
  const body = textarea.value.trim();
  if (!body || body.length < 3) {
    showToast('Il commento è troppo breve.', 'error');
    return;
  }
  if (body.length > 5000) {
    showToast('Il commento supera la lunghezza massima consentita.', 'error');
    return;
  }

  state.isSubmitting = true;
  event.currentTarget.querySelector('button[type="submit"]').disabled = true;

  try {
    const payload = {
      report_id: state.report.id,
      user_id: state.user.id,
      body,
      author_display_name: getDisplayName(),
      author_role: state.role || null,
    };
    const { data, error } = await supabase
      .from('report_comments')
      .insert(payload)
      .select()
      .single();
    if (error) {throw error;}
    textarea.value = '';
    state.comments.unshift(data);
    renderComments();
    showToast('Commento pubblicato.', 'success');
  } catch (err) {
    Logger.error('Comments', 'Insert error', err);
    showToast(err.message || 'Errore durante la pubblicazione.', 'error');
  } finally {
    state.isSubmitting = false;
    event.currentTarget.querySelector('button[type="submit"]').disabled = false;
  }
}

async function handleDeleteComment(event) {
  const commentId = event.currentTarget.getAttribute('data-comment-delete');
  if (!commentId) {return;}
  if (!confirm('Eliminare definitivamente il commento?')) {return;}

  try {
    const { error } = await supabase
      .from('report_comments')
      .update({ is_deleted: true })
      .eq('id', commentId);
    if (error) {throw error;}
    state.comments = state.comments.filter((comment) => comment.id !== commentId);
    renderComments();
    showToast('Commento eliminato.', 'success');
  } catch (err) {
    Logger.error('Comments', 'Delete error', err);
    showToast(err.message || 'Errore durante l’eliminazione.', 'error');
  }
}

async function restoreSession() {
  const { data } = await supabase.auth.getSession();
  state.user = data?.session?.user || null;
  await synchronizeUserContext();
}

async function synchronizeUserContext() {
  if (!state.user) {
    state.role = null;
    state.profile = null;
    return;
  }

  try {
    const [roleRes, profileRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', state.user.id).maybeSingle(),
      supabase
        .from('user_profiles')
        .select('display_name, avatar_url')
        .eq('user_id', state.user.id)
        .maybeSingle(),
    ]);
    state.role = roleRes.data?.role || null;
    state.profile = profileRes.data || null;
  } catch (err) {
    Logger.warn('Comments', 'Unable to load user context', err);
  }
}

async function loadComments() {
  if (!state.report) {return;}
  try {
    state.loading = true;
    const { data, error } = await supabase
      .from('report_comments')
      .select(
        `
        id, 
        user_id, 
        body, 
        author_display_name, 
        author_role, 
        created_at, 
        is_deleted,
        profile:user_profiles(
          display_name,
          avatar_url,
          bio
        )
      `
      )
      .eq('report_id', state.report.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (error) {throw error;}

    // Fetch desk links for Desk users
    const deskUserIds = (data || [])
      .filter((c) => c.author_role === 'institutional')
      .map((c) => c.user_id);

    let deskLinksMap = {};
    if (deskUserIds.length > 0) {
      const { data: linksData } = await supabase
        .from('desk_public_links')
        .select('user_id, link_url, link_label, display_order')
        .in('user_id', deskUserIds)
        .order('display_order', { ascending: true });

      if (linksData) {
        deskLinksMap = linksData.reduce((acc, link) => {
          if (!acc[link.user_id]) {acc[link.user_id] = [];}
          acc[link.user_id].push(link);
          return acc;
        }, {});
      }
    }

    // Merge profile data and desk links
    state.comments = (data || []).map((comment) => ({
      ...comment,
      avatar_url: comment.profile?.avatar_url || null,
      bio: comment.profile?.bio || null,
      display_name: comment.profile?.display_name || comment.author_display_name,
      desk_links: deskLinksMap[comment.user_id] || [],
    }));
  } catch (err) {
    Logger.error('Comments', 'Load error', err);
    showError(err.message || 'Impossibile caricare i commenti.');
  } finally {
    state.loading = false;
    renderComments();
  }
}

function showError(message) {
  if (!ERROR_BOX) {return;}
  ERROR_BOX.hidden = false;
  ERROR_BOX.textContent = message;
}

function showToast(message, variant = 'info') {
  if (!TOAST) {return;}
  TOAST.textContent = message;
  TOAST.setAttribute('data-variant', variant);
  TOAST.setAttribute('data-visible', 'true');
  setTimeout(() => {
    TOAST.removeAttribute('data-visible');
  }, 3200);
}

function getDisplayName() {
  if (state.profile?.display_name) {return state.profile.display_name;}
  const email = state.user?.email || '';
  return email ? email.split('@')[0] : 'Utente Tradelia';
}

function deriveInitials(name) {
  if (!name) {return 'T';}
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'T'
  );
}

function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    if (diffMinutes < 1) {return 'Adesso';}
    if (diffMinutes < 60) {return `${diffMinutes} min fa`;}
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {return `${diffHours} h fa`;}
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) {return `${diffDays} g fa`;}
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

function roleLabelMap(role) {
  switch (role) {
    case 'institutional':
      return 'Desk Professionale';
    case 'pro':
      return 'Pro';
    case 'trial':
      return 'Trial';
    default:
      return role || '';
  }
}

function escapeHtml(value) {
  if (value == null) {return '';}
  const div = document.createElement('div');
  div.textContent = String(value);
  return div.innerHTML;
}

function isAdmin() {
  // TODO: introdurre flag admin tramite JWT custom o tabella dedicata
  return false;
}

async function handleShowProfile(userId, userName) {
  if (!userId) {return;}

  try {
    // Fetch profile data
    const [profileRes, roleRes, linksRes] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('display_name, bio, avatar_url')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase
        .from('desk_public_links')
        .select('link_url, link_label, display_order')
        .eq('user_id', userId)
        .order('display_order', { ascending: true }),
    ]);

    const profile = profileRes.data || {};
    const role = roleRes.data?.role || null;
    const deskLinks = linksRes.data || [];

    const displayName = profile.display_name || userName;
    const bio = profile.bio || null;
    const avatarUrl = profile.avatar_url || null;
    const hasDeskLinks = deskLinks.length > 0 && role === 'institutional';

    showProfileModal({
      userId,
      displayName,
      bio,
      avatarUrl,
      role,
      deskLinks: hasDeskLinks ? deskLinks : [],
    });
  } catch (err) {
    Logger.error('Comments', 'Profile fetch error', err);
    showToast('Impossibile caricare il profilo.', 'error');
  }
}

function showProfileModal(profile) {
  // Remove existing modal if present
  const existing = document.getElementById('profile-modal');
  if (existing) {existing.remove();}

  const initials = deriveInitials(profile.displayName);
  const roleLabel = profile.role ? roleLabelMap(profile.role) : null;
  const hasAvatar = !!profile.avatarUrl;
  const avatarStyle = hasAvatar
    ? `background-image: url('${escapeHtml(profile.avatarUrl)}'); background-size: cover; background-position: center;`
    : '';

  const modal = document.createElement('div');
  modal.id = 'profile-modal';
  modal.className = 'profile-modal-overlay';
  modal.innerHTML = `
    <div class="profile-modal-content">
      <button type="button" class="profile-modal-close" aria-label="Chiudi">×</button>
      <div class="profile-modal-header">
        <div class="profile-modal-avatar ${hasAvatar ? 'has-image' : ''}" style="${avatarStyle}">${hasAvatar ? '' : escapeHtml(initials)}</div>
        <div class="profile-modal-info">
          <h3 class="profile-modal-name">${escapeHtml(profile.displayName)}</h3>
          ${roleLabel ? `<span class="profile-modal-role">${escapeHtml(roleLabel)}</span>` : ''}
        </div>
      </div>
      ${
        profile.bio
          ? `
        <div class="profile-modal-bio">
          <p>${escapeHtml(profile.bio)}</p>
        </div>
      `
          : ''
      }
      ${
        profile.deskLinks.length > 0
          ? `
        <div class="profile-modal-links">
          <h4>Link pubblici</h4>
          <ul>
            ${profile.deskLinks
              .map(
                (link) => `
              <li>
                <a href="${escapeHtml(link.link_url)}" target="_blank" rel="noopener noreferrer">
                  ${escapeHtml(link.link_label || link.link_url)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      `
          : ''
      }
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  modal.querySelector('.profile-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {modal.remove();}
  });

  // ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Focus trap
  const firstFocusable = modal.querySelector('button, a');
  if (firstFocusable) {firstFocusable.focus();}
}
