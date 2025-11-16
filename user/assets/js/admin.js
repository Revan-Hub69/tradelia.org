import { supabase } from '/report/assets/js/supabase-client.js';
import Logger from '/report/assets/js/utils/logger.js';
import './admin-complete.js';

const ADMIN_STATS = {
  totalUsers: document.getElementById('stat-total-users'),
  activePlans: document.getElementById('stat-active-plans'),
  expiredPlans: document.getElementById('stat-expired-plans'),
  totalCredits: document.getElementById('stat-total-credits')
};

const FILTER_SEARCH = document.getElementById('filter-search');
const FILTER_ROLE = document.getElementById('filter-role');
const FILTER_STATUS = document.getElementById('filter-status');
const USERS_TABLE_BODY = document.getElementById('users-table-body');

// Modale pagamenti manuali (Xolo / altri)
const PAYMENTS_MODAL = document.getElementById('manage-payments-modal');
const PAYMENTS_USER_ID = document.getElementById('payments-user-id');
const PAYMENTS_USER_EMAIL = document.getElementById('payments-user-email');
const PAYMENTS_AMOUNT = document.getElementById('payments-amount');
const PAYMENTS_STATUS = document.getElementById('payments-status');
const PAYMENTS_INVOICE_NUMBER = document.getElementById('payments-invoice-number');
const PAYMENTS_PDF_URL = document.getElementById('payments-pdf-url');
const PAYMENTS_DESCRIPTION = document.getElementById('payments-description');
const PAYMENTS_CANCEL_BTN = document.getElementById('cancel-payments-btn');
const PAYMENTS_SAVE_BTN = document.getElementById('save-payments-btn');

let allUsers = [];
let currentUser = null;

// Import admin-complete functions
if (typeof window !== 'undefined') {
    window.allUsers = allUsers;
}

init();

async function init() {
  try {
    // Verifica token di accesso (come dashboard.html)
    const ACCESS_TOKEN_KEY = 'tradelia-access-token-v1';
    let token = null;
    try {
      token = localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      token = null;
    }

    if (!token || !token.trim()) {
      window.location.href = '/accesso.html?reason=missing_token';
      return;
    }

    // Valida token e verifica se è admin
    const res = await fetch('/api/validate-dashboard-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim() })
    });
    
    const data = await res.json();
    
    if (!data.ok) {
      window.location.href = '/accesso.html?reason=invalid_token';
      return;
    }

    // Verifica se l'email è admin (usa admin_emails table)
    const { data: adminEmailData, error: adminError } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', data.email?.toLowerCase() || '')
      .maybeSingle();
    
    // Fallback: verifica anche in admin_users se abbiamo user_id (per retrocompatibilità)
    let isAdmin = !!adminEmailData;
    
    if (!isAdmin && data.userId) {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.userId)
        .maybeSingle();
      isAdmin = !!adminData;
    }
    
    if (!isAdmin) {
      // Non è admin: redirect
      window.location.href = '/dashboard.html';
      return;
    }
    
    currentUser = {
      id: data.userId || null,
      email: data.email
    };
    
    // Setup filters
    FILTER_SEARCH?.addEventListener('input', debounce(applyFilters, 300));
    FILTER_ROLE?.addEventListener('change', applyFilters);
    FILTER_STATUS?.addEventListener('change', applyFilters);
    
    // FORZA CHIUSURA MODALI - CRITICO: devono essere SEMPRE chiusi all'inizio
    const modals = ['edit-user-modal', 'manage-credits-modal', 'manage-payments-modal', 'add-user-modal'];
    const forceCloseModals = () => {
      modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.hidden = true;
          modal.setAttribute('hidden', 'true');
          modal.style.display = 'none';
          modal.style.visibility = 'hidden';
          modal.classList.remove('active', 'open', 'show');
          modal.setAttribute('aria-hidden', 'true');
        }
      });
    };
    
    // Chiudi immediatamente
    forceCloseModals();
    
    // Chiudi anche dopo delay multipli (per sicurezza)
    [50, 100, 200, 500, 1000].forEach(delay => {
      setTimeout(forceCloseModals, delay);
    });
    
    // Observer per chiudere automaticamente i modali se si aprono senza click esplicito
    const modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
          const modal = mutation.target;
          // Se un modale viene aperto (hidden diventa false) senza un flag di "user action"
          if (!modal.hidden && !modal.dataset.userOpened) {
            console.log('[Admin] Modale aperto automaticamente, chiudo:', modal.id);
            forceCloseModals();
          }
        }
      });
    });
    
    // Osserva tutti i modali
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modalObserver.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
      }
    });
    
    // Wrapper per le funzioni di apertura modali - imposta flag "user action"
    const originalManagePayments = window.managePayments;
    window.managePayments = function(...args) {
      const modal = document.getElementById('manage-payments-modal');
      if (modal) {
        modal.dataset.userOpened = 'true';
        setTimeout(() => delete modal.dataset.userOpened, 100);
      }
      if (originalManagePayments) {
        return originalManagePayments.apply(this, args);
      }
    };
    
    // Setup pulsante aggiungi utente
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserModal = document.getElementById('add-user-modal');
    const cancelAddUserBtn = document.getElementById('cancel-add-user-btn');
    const saveAddUserBtn = document.getElementById('save-add-user-btn');
    
    if (addUserBtn && addUserModal) {
      addUserBtn.addEventListener('click', () => {
        // Chiudi altri modali
        forceCloseModals();
        // Apri modale aggiungi utente
        addUserModal.dataset.userOpened = 'true';
        addUserModal.hidden = false;
        addUserModal.style.display = 'flex';
        setTimeout(() => delete addUserModal.dataset.userOpened, 100);
        // Reset form
        document.getElementById('add-user-email').value = '';
        document.getElementById('add-user-name').value = '';
        document.getElementById('add-user-role').value = 'trial';
        document.getElementById('add-user-expiry').value = '';
        document.getElementById('add-user-credits').value = '0';
      });
    }
    
    if (cancelAddUserBtn && addUserModal) {
      cancelAddUserBtn.addEventListener('click', () => {
        addUserModal.hidden = true;
        addUserModal.style.display = 'none';
      });
    }
    
    if (saveAddUserBtn) {
      saveAddUserBtn.addEventListener('click', async () => {
        const email = document.getElementById('add-user-email')?.value?.trim();
        const name = document.getElementById('add-user-name')?.value?.trim();
        const role = document.getElementById('add-user-role')?.value;
        const expiry = document.getElementById('add-user-expiry')?.value;
        const credits = parseInt(document.getElementById('add-user-credits')?.value || '0');
        
        if (!email || !role || !expiry) {
          alert('Compila tutti i campi obbligatori (Email, Ruolo, Scadenza).');
          return;
        }
        
        try {
          saveAddUserBtn.disabled = true;
          saveAddUserBtn.textContent = 'Creazione...';
          
          // Chiama API per creare utente e generare token
          const res = await fetch('/api/create-user-and-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.toLowerCase(),
              displayName: name || null,
              role,
              validUntil: expiry,
              credits: role === 'institutional' ? credits : 0,
              sendEmail: true
            })
          });
          
          const data = await res.json();
          
          if (!data.ok) {
            throw new Error(data.error || 'Errore nella creazione utente');
          }
          
          alert(`Utente creato con successo!\nEmail: ${email}\nToken: ${data.token}\n\nIl token è stato inviato via email.`);
          
          // Chiudi modale e ricarica dati
          addUserModal.hidden = true;
          addUserModal.style.display = 'none';
          await loadAllData();
          
        } catch (err) {
          console.error('[Admin] Error creating user:', err);
          alert('Errore nella creazione utente: ' + (err.message || 'Errore sconosciuto'));
        } finally {
          saveAddUserBtn.disabled = false;
          saveAddUserBtn.textContent = 'Crea Utente';
        }
      });
    }
    
    // Load data
    await loadAllData();
  } catch (err) {
    Logger.error('Admin', 'init error', err);
    showError('Errore durante l\'inizializzazione della dashboard admin: ' + (err.message || 'Errore sconosciuto'));
  }
}

async function loadAllData() {
  try {
    await Promise.all([
      loadUsers(),
      loadStats()
    ]);
    applyFilters();
  } catch (err) {
    Logger.error('Admin', 'load data error', err);
    showError('Errore durante il caricamento dei dati.');
  }
}

async function loadUsers() {
  try {
    // Mostra stato di caricamento
    if (USERS_TABLE_BODY) {
      USERS_TABLE_BODY.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
            Caricamento utenti...
          </td>
        </tr>
      `;
    }
    
    Logger.info('Admin', 'Inizio caricamento utenti...');
    
    // Carica utenti da tutte le fonti: user_profiles, user_roles, subscribers, dashboard_access_tokens
    
    // 1. User profiles e roles (utenti con user_id)
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name');
    
    if (profilesError) {
      Logger.error('Admin', 'Error loading profiles', profilesError);
      console.error('[Admin] Profiles error:', profilesError);
    } else {
      Logger.info('Admin', `Loaded ${profiles?.length || 0} profiles`);
    }
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, email, role, valid_until');
    
    if (rolesError) {
      Logger.error('Admin', 'Error loading roles', rolesError);
      console.error('[Admin] Roles error:', rolesError);
    } else {
      Logger.info('Admin', `Loaded ${roles?.length || 0} roles`);
    }
    
    const { data: credits, error: creditsError } = await supabase
      .from('user_analysis_credits')
      .select('user_id, credits_balance');
    
    if (creditsError) {
      Logger.error('Admin', 'Error loading credits', creditsError);
      console.error('[Admin] Credits error:', creditsError);
    } else {
      Logger.info('Admin', `Loaded ${credits?.length || 0} credits`);
    }
    
    // 2. Subscribers (utenti attivi da gateway pagamenti)
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('id, email, status, auth_user_id');
    
    if (subscribersError) {
      Logger.error('Admin', 'Error loading subscribers', subscribersError);
      console.error('[Admin] Subscribers error:', subscribersError);
    } else {
      Logger.info('Admin', `Loaded ${subscribers?.length || 0} subscribers`);
    }
    
    // 3. Dashboard access tokens (utenti con token attivo)
    const { data: tokens, error: tokensError } = await supabase
      .from('dashboard_access_tokens')
      .select('email, user_id, plan_role, valid_until, revoked')
      .eq('revoked', false);
    
    if (tokensError) {
      Logger.error('Admin', 'Error loading tokens', tokensError);
      console.error('[Admin] Tokens error:', tokensError);
    } else {
      Logger.info('Admin', `Loaded ${tokens?.length || 0} tokens`);
    }
    
    // 4. Fetch emails - NON usiamo più RPC function perché usa auth.uid() che non funziona con token
    // Usiamo invece i dati già disponibili da subscribers e dashboard_access_tokens
    let emails = null;
    // Costruiamo emails da subscribers e tokens (già caricati sopra)
    const emailsFromSubscribers = (subscribers || []).map(s => ({
      user_id: s.auth_user_id || null,
      email: s.email,
      created_at: null
    }));
    const emailsFromTokens = (tokens || []).map(t => ({
      user_id: t.user_id || null,
      email: t.email,
      created_at: null
    }));
    // Unisci e rimuovi duplicati
    const allEmails = [...emailsFromSubscribers, ...emailsFromTokens];
    const uniqueEmails = new Map();
    allEmails.forEach(e => {
      if (e.email) {
        const key = e.email.toLowerCase();
        if (!uniqueEmails.has(key) || (e.user_id && !uniqueEmails.get(key).user_id)) {
          uniqueEmails.set(key, e);
        }
      }
    });
    emails = Array.from(uniqueEmails.values());
    
    // Crea mappe per lookup veloce
    // Se emails è null (RPC fallita), creiamo una mappa vuota
    const emailsMap = new Map((emails || []).map(e => [e.user_id, e.email]));
    // Crea mappa roles: per user_id E per email
    const rolesMap = new Map();
    const rolesByEmailMap = new Map();
    (roles || []).forEach(r => {
      if (r.user_id) {
        rolesMap.set(r.user_id, r);
      }
      if (r.email) {
        rolesByEmailMap.set(r.email.toLowerCase(), r);
      }
    });
    const creditsMap = new Map((credits || []).map(c => [c.user_id, c]));
    const profilesMap = new Map((profiles || []).map(p => [p.user_id, p]));
    const subscribersMap = new Map((subscribers || []).map(s => [s.email?.toLowerCase(), s]));
    const tokensMap = new Map(); // email -> token data
    
    // Raggruppa tokens per email
    (tokens || []).forEach(token => {
      if (token.email) {
        const emailKey = token.email.toLowerCase();
        if (!tokensMap.has(emailKey) || new Date(token.valid_until) > new Date(tokensMap.get(emailKey).valid_until || 0)) {
          tokensMap.set(emailKey, token);
        }
      }
    });
    
    // Combina tutti gli user_id
    const userIds = new Set([
      ...(emails || []).map(e => e.user_id),
      ...(profiles || []).map(p => p.user_id),
      ...(roles || []).map(r => r.user_id),
      ...(subscribers || []).filter(s => s.auth_user_id).map(s => s.auth_user_id)
    ]);
    
    // Crea array di utenti da user_id
    // Se non abbiamo email dalla RPC, proviamo a recuperarle da subscribers o tokens
    const usersFromIds = Array.from(userIds).map(userId => {
      let email = emailsMap.get(userId) || null;
      
      // Fallback: cerca email in subscribers o tokens se RPC fallita
      if (!email) {
        const subscriber = Array.from(subscribersMap.values()).find(s => s.auth_user_id === userId);
        if (subscriber?.email) {
          email = subscriber.email;
        } else {
          // Cerca in tokens
          const token = Array.from(tokensMap.values()).find(t => t.user_id === userId);
          if (token?.email) {
            email = token.email;
          }
        }
      }
      
      const profile = profilesMap.get(userId);
      const role = rolesMap.get(userId);
      const credit = creditsMap.get(userId);
      
      return {
        user_id: userId,
        email: email || `${userId.slice(0, 8)}...`,
        display_name: profile?.display_name || '—',
        role: role?.role || null,
        valid_until: role?.valid_until || null,
        credits: credit?.credits_balance || 0,
        isExpired: role?.valid_until ? new Date(role.valid_until) < new Date() : false,
        source: 'user_profiles'
      };
    });
    
    // Aggiungi utenti da subscribers (senza user_id o con email diversa)
    const usersFromSubscribers = (subscribers || [])
      .filter(s => {
        // Includi solo se non è già presente in usersFromIds
        if (s.auth_user_id && userIds.has(s.auth_user_id)) return false;
        if (!s.email) return false;
        return true;
      })
      .map(sub => {
        const emailKey = sub.email.toLowerCase();
        const token = tokensMap.get(emailKey);
        // Cerca ruolo anche in user_roles per email
        const roleFromRoles = rolesByEmailMap.get(emailKey);
        const role = roleFromRoles?.role || (token ? token.plan_role : (sub.status === 'active' ? 'pro' : null));
        const validUntil = roleFromRoles?.valid_until || token?.valid_until || null;
        
        return {
          user_id: sub.auth_user_id || null,
          email: sub.email,
          display_name: '—',
          role: role,
          valid_until: validUntil,
          credits: 0,
          isExpired: validUntil ? new Date(validUntil) < new Date() : (sub.status !== 'active'),
          source: 'subscribers'
        };
      });
    
    // Aggiungi utenti da tokens (senza subscriber o user_id)
    const usersFromTokens = Array.from(tokensMap.entries())
      .filter(([emailKey, token]) => {
        // Includi solo se non è già presente
        if (token.user_id && userIds.has(token.user_id)) return false;
        if (subscribersMap.has(emailKey)) return false; // Già incluso da subscribers
        return true;
      })
      .map(([emailKey, token]) => {
        // Cerca ruolo anche in user_roles per email
        const roleFromRoles = rolesByEmailMap.get(emailKey);
        const role = roleFromRoles?.role || token.plan_role;
        const validUntil = roleFromRoles?.valid_until || token.valid_until;
        
        return {
          user_id: token.user_id || null,
          email: token.email,
          display_name: '—',
          role: role || null,
          valid_until: validUntil || null,
          credits: 0,
          isExpired: validUntil ? new Date(validUntil) < new Date() : false,
          source: 'dashboard_access_tokens'
        };
      });
    
    // Combina tutti gli utenti, rimuovendo duplicati per email
    const allUsersMap = new Map();
    
    [...usersFromIds, ...usersFromSubscribers, ...usersFromTokens].forEach(user => {
      if (!user.email) return;
      const emailKey = user.email.toLowerCase();
      const existing = allUsersMap.get(emailKey);
      
      if (!existing) {
        allUsersMap.set(emailKey, user);
      } else {
        // Merge: preferisci dati più completi
        allUsersMap.set(emailKey, {
          user_id: existing.user_id || user.user_id,
          email: existing.email || user.email,
          display_name: existing.display_name !== '—' ? existing.display_name : user.display_name,
          role: existing.role || user.role,
          valid_until: existing.valid_until || user.valid_until,
          credits: existing.credits || user.credits,
          isExpired: existing.isExpired || user.isExpired,
          source: existing.source || user.source
        });
      }
    });
    
    allUsers = Array.from(allUsersMap.values());
    
    Logger.info('Admin', `Loaded ${allUsers.length} users (${usersFromIds.length} from profiles, ${usersFromSubscribers.length} from subscribers, ${usersFromTokens.length} from tokens)`);
    
    // Update global allUsers for admin-complete.js
    if (typeof window !== 'undefined') {
      window.allUsers = allUsers;
    }
    
    // Se non ci sono utenti, mostra messaggio
    if (allUsers.length === 0) {
      if (USERS_TABLE_BODY) {
        USERS_TABLE_BODY.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
              Nessun utente trovato nel database.
            </td>
          </tr>
        `;
      }
    }
  } catch (err) {
    Logger.error('Admin', 'load users error', err);
    if (USERS_TABLE_BODY) {
      USERS_TABLE_BODY.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
            <div style="color: var(--danger, #f87171); margin-bottom: 0.5rem;">⚠️ Errore caricamento utenti</div>
            <div>${escapeHtml(err.message || 'Errore sconosciuto')}</div>
            <button class="btn btn-sm" onclick="location.reload()" style="margin-top: 1rem;">Ricarica pagina</button>
          </td>
        </tr>
      `;
    }
    throw err;
  }
}

async function loadStats() {
  try {
    const totalUsers = allUsers.length;
    const activePlans = allUsers.filter(u => u.role && !u.isExpired).length;
    const expiredPlans = allUsers.filter(u => u.isExpired).length;
    const totalCredits = allUsers.reduce((sum, u) => sum + (u.credits || 0), 0);
    
    if (ADMIN_STATS.totalUsers) ADMIN_STATS.totalUsers.textContent = totalUsers;
    if (ADMIN_STATS.activePlans) ADMIN_STATS.activePlans.textContent = activePlans;
    if (ADMIN_STATS.expiredPlans) ADMIN_STATS.expiredPlans.textContent = expiredPlans;
    if (ADMIN_STATS.totalCredits) ADMIN_STATS.totalCredits.textContent = totalCredits;
  } catch (err) {
    Logger.error('Admin', 'load stats error', err);
  }
}

function applyFilters() {
  const searchTerm = FILTER_SEARCH?.value.toLowerCase() || '';
  const roleFilter = FILTER_ROLE?.value || '';
  const statusFilter = FILTER_STATUS?.value || '';
  
  let filtered = allUsers;
  
  if (searchTerm) {
    filtered = filtered.filter(u => 
      (u.email && u.email.toLowerCase().includes(searchTerm)) ||
      (u.display_name && u.display_name.toLowerCase().includes(searchTerm))
    );
  }
  
  if (roleFilter) {
    filtered = filtered.filter(u => u.role === roleFilter);
  }
  
  if (statusFilter === 'active') {
    filtered = filtered.filter(u => u.role && !u.isExpired);
  } else if (statusFilter === 'expired') {
    filtered = filtered.filter(u => u.isExpired);
  }
  
  renderUsersTable(filtered);
}

function renderUsersTable(users) {
  if (!USERS_TABLE_BODY) return;
  
  if (users.length === 0) {
    USERS_TABLE_BODY.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
          Nessun utente trovato
        </td>
      </tr>
    `;
    return;
  }
  
  USERS_TABLE_BODY.innerHTML = users.map(user => {
    const roleBadge = user.role 
      ? `<span class="role-badge ${user.isExpired ? 'expired' : user.role}">${user.isExpired ? 'Scaduto' : user.role}</span>`
      : '<span style="color: var(--ink-soft);">—</span>';
    
    const expiresText = user.valid_until
      ? new Date(user.valid_until).toLocaleDateString('it-IT')
      : 'Permanente';
    
    // Usa user_id se disponibile, altrimenti email come identificatore
    const identifier = user.user_id || user.email;
    const identifierType = user.user_id ? 'user_id' : 'email';
    
    return `
      <tr>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.display_name)}</td>
        <td>${roleBadge}</td>
        <td>${expiresText}</td>
        <td>${user.credits || 0}</td>
        <td>
          <div class="admin-actions">
            <button class="btn btn-outline btn-sm" onclick="editUser('${identifier}', '${identifierType}')">Modifica</button>
            ${user.user_id ? `<button class="btn btn-outline btn-sm" onclick="manageCredits('${identifier}', '${identifierType}')">Crediti</button>` : ''}
            ${user.user_id ? `<button class="btn btn-outline btn-sm" onclick="managePayments('${identifier}', '${identifierType}')">Pagamenti</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showError(message) {
  console.error('[Admin]', message);
  // Mostra errore nella tabella se disponibile
  if (USERS_TABLE_BODY) {
    USERS_TABLE_BODY.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem; color: var(--ink-soft);">
          <div style="color: var(--danger, #f87171); margin-bottom: 0.5rem;">⚠️ Errore</div>
          <div>${escapeHtml(message)}</div>
          <button class="btn btn-sm" onclick="location.reload()" style="margin-top: 1rem;">Ricarica pagina</button>
        </td>
      </tr>
    `;
  } else {
    alert(message);
  }
}

// Global functions per onclick handlers (ora gestite da admin-complete.js)
window.editUser = window.openEditUserModal || function(identifier, type = 'user_id') {
  if (type === 'email') {
    const user = allUsers.find(u => u.email === identifier);
    if (user && window.openEditUserModal) {
      window.openEditUserModal(user.user_id || user.email, type);
    } else {
      alert(`Modifica utente ${identifier} - Funzionalità in caricamento...`);
    }
  } else {
    if (window.openEditUserModal) {
      window.openEditUserModal(identifier, type);
    } else {
      alert(`Modifica utente ${identifier} - Funzionalità in caricamento...`);
    }
  }
};

window.manageCredits = window.openManageCreditsModal || function(identifier, type = 'user_id') {
  if (type === 'email') {
    alert('Gestione crediti disponibile solo per utenti con user_id.');
    return;
  }
  if (window.openManageCreditsModal) {
    window.openManageCreditsModal(identifier, type);
  } else {
    alert(`Gestisci crediti per ${identifier} - Funzionalità in caricamento...`);
  }
};

// Gestione pagamenti manuali (Xolo)
window.managePayments = window.openManagePaymentsModal || function(identifier, type = 'user_id') {
  if (type === 'email') {
    alert('Gestione pagamenti disponibile solo per utenti con user_id.');
    return;
  }
  
  const user = allUsers.find(u => u.user_id === identifier);
  if (!user || !PAYMENTS_MODAL) {
    alert('Utente non trovato o modale non disponibile.');
    return;
  }
  
  PAYMENTS_USER_ID.value = user.user_id;
  PAYMENTS_USER_EMAIL.value = user.email || '';
  PAYMENTS_AMOUNT.value = '';
  PAYMENTS_STATUS.value = 'succeeded';
  PAYMENTS_INVOICE_NUMBER.value = '';
  PAYMENTS_PDF_URL.value = '';
  PAYMENTS_DESCRIPTION.value = '';
  
  PAYMENTS_MODAL.hidden = false;
};

if (PAYMENTS_CANCEL_BTN && PAYMENTS_MODAL) {
  PAYMENTS_CANCEL_BTN.addEventListener('click', () => {
    PAYMENTS_MODAL.hidden = true;
  });
}

if (PAYMENTS_SAVE_BTN && PAYMENTS_MODAL) {
  PAYMENTS_SAVE_BTN.addEventListener('click', async () => {
    const userId = PAYMENTS_USER_ID.value;
    const amountStr = PAYMENTS_AMOUNT.value;
    const status = PAYMENTS_STATUS.value || 'succeeded';
    const invoiceNumber = PAYMENTS_INVOICE_NUMBER.value.trim() || null;
    const pdfUrl = PAYMENTS_PDF_URL.value.trim() || null;
    const description = PAYMENTS_DESCRIPTION.value.trim() || null;
    
    const amount = parseFloat(amountStr);
    if (!userId || isNaN(amount) || amount <= 0) {
      alert('Inserisci un importo valido (maggiore di zero).');
      return;
    }
    
    try {
      PAYMENTS_SAVE_BTN.disabled = true;
      PAYMENTS_SAVE_BTN.textContent = 'Salvataggio...';
      
      const amountCents = Math.round(amount * 100);
      
      // Inserisci pagamento Xolo
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          gateway: 'xolo',
          amount_cents: amountCents,
          currency: 'EUR',
          status,
          description: description || 'Pagamento Xolo registrato manualmente',
          external_id: invoiceNumber,
          metadata: {
            source: 'admin_manual_xolo',
            pdf_url: pdfUrl
          }
        })
        .select('id')
        .single();
      
      if (paymentError) {
        console.error('Admin', 'Errore inserimento pagamento Xolo', paymentError);
        alert('Errore durante il salvataggio del pagamento. Controlla la console per i dettagli.');
        return;
      }
      
      // Se il pagamento è riuscito, aggiorna user_roles e genera token
      if (status === 'succeeded') {
        const user = allUsers.find(u => u.user_id === userId);
        if (user) {
          // Aggiorna user_roles a 'institutional' (Desk) - Xolo è sempre per Desk
          const newRole = 'institutional';
          
          // Calcola valid_until (default: 1 mese da oggi, o estendi se già ha un ruolo)
          const now = new Date();
          const currentValidUntil = user.valid_until ? new Date(user.valid_until) : null;
          const newValidUntil = new Date(now);
          
          // Se ha già un abbonamento attivo, estendi di 1 mese dalla scadenza corrente
          if (currentValidUntil && currentValidUntil > now) {
            newValidUntil.setTime(currentValidUntil.getTime());
            newValidUntil.setMonth(newValidUntil.getMonth() + 1);
          } else {
            // Altrimenti, 1 mese da oggi
            newValidUntil.setMonth(newValidUntil.getMonth() + 1);
          }
          
          // Aggiorna user_roles
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({
              user_id: userId,
              role: newRole,
              valid_until: newValidUntil.toISOString()
            }, { onConflict: 'user_id' });
          
          if (roleError) {
            console.error('Admin', 'Errore aggiornamento user_roles', roleError);
          } else {
            // Genera token dashboard automaticamente
            try {
              const response = await fetch('/api/request-dashboard-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: user.email,
                  // Forza generazione anche se esiste già un token
                  force: true 
                })
              });
              
              if (response.ok) {
                console.log('Admin', 'Token dashboard generato automaticamente per', user.email);
              }
            } catch (tokenError) {
              console.warn('Admin', 'Errore generazione token (non bloccante)', tokenError);
            }
          }
        }
      }
      
      // Se abbiamo un riferimento fattura o PDF, crea anche invoice
      if (invoiceNumber || pdfUrl) {
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            user_id: userId,
            payment_id: payment.id,
            gateway: 'xolo',
            external_id: invoiceNumber,
            number: invoiceNumber,
            amount_cents: amountCents,
            currency: 'EUR',
            status: status === 'succeeded' ? 'paid' : 'issued',
            issued_at: new Date().toISOString(),
            pdf_url: pdfUrl,
            metadata: {
              source: 'admin_manual_xolo'
            }
          });
        
        if (invoiceError) {
          console.warn('Admin', 'Errore inserimento invoice Xolo (non bloccante)', invoiceError);
        }
      }
      
      alert('Pagamento registrato correttamente.');
      PAYMENTS_MODAL.hidden = true;
    } catch (err) {
      console.error('Admin', 'Errore salvataggio pagamento Xolo', err);
      alert('Errore imprevisto durante il salvataggio del pagamento.');
    } finally {
      PAYMENTS_SAVE_BTN.disabled = false;
      PAYMENTS_SAVE_BTN.textContent = 'Salva pagamento';
    }
  });
}

// Export loadAllData per admin-complete.js
window.loadAllData = loadAllData;
