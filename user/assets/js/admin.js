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

let allUsers = [];
let currentUser = null;

// Import admin-complete functions
if (typeof window !== 'undefined') {
  window.allUsers = allUsers;
}

init();

async function init() {
  try {
    // Verifica che l'utente sia admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/user/index.html';
      return;
    }
    
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!adminData) {
      window.location.href = '/user/index.html';
      return;
    }
    
    currentUser = user;
    
    // Setup filters
    FILTER_SEARCH?.addEventListener('input', debounce(applyFilters, 300));
    FILTER_ROLE?.addEventListener('change', applyFilters);
    FILTER_STATUS?.addEventListener('change', applyFilters);
    
    // Load data
    await loadAllData();
  } catch (err) {
    Logger.error('Admin', 'init error', err);
    showError('Errore durante l\'inizializzazione della dashboard admin.');
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
    // Fetch users from auth.users (via RPC or service role)
    // Nota: Per accedere a auth.users serve service role o RPC function
    // Per ora usiamo user_profiles e user_roles come proxy
    
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name');
    
    if (profilesError) throw profilesError;
    
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role, valid_until');
    
    if (rolesError) throw rolesError;
    
    const { data: credits, error: creditsError } = await supabase
      .from('user_analysis_credits')
      .select('user_id, credits_balance');
    
    if (creditsError) throw creditsError;
    
    // Fetch emails via RPC function (solo admin)
    const { data: emails, error: emailsError } = await supabase
      .rpc('get_user_emails_for_admin');
    
    if (emailsError) {
      Logger.warn('Admin', 'RPC emails error, using fallback', emailsError);
    }
    
    // Crea mappe per lookup veloce
    const emailsMap = new Map((emails || []).map(e => [e.user_id, e.email]));
    const rolesMap = new Map(roles.map(r => [r.user_id, r]));
    const creditsMap = new Map(credits.map(c => [c.user_id, c]));
    const profilesMap = new Map(profiles.map(p => [p.user_id, p]));
    
    // Combina tutti i dati
    const userIds = new Set([
      ...(emails || []).map(e => e.user_id),
      ...profiles.map(p => p.user_id),
      ...roles.map(r => r.user_id)
    ]);
    
    allUsers = Array.from(userIds).map(userId => {
      const email = emailsMap.get(userId) || `${userId.slice(0, 8)}...`;
      const profile = profilesMap.get(userId);
      const role = rolesMap.get(userId);
      const credit = creditsMap.get(userId);
      
      return {
        user_id: userId,
        email: email,
        display_name: profile?.display_name || '—',
        role: role?.role || null,
        valid_until: role?.valid_until || null,
        credits: credit?.credits_balance || 0,
        isExpired: role?.valid_until ? new Date(role.valid_until) < new Date() : false
      };
    });
    
    Logger.info('Admin', `Loaded ${allUsers.length} users`);
    
    // Update global allUsers for admin-complete.js
    if (typeof window !== 'undefined') {
      window.allUsers = allUsers;
    }
  } catch (err) {
    Logger.error('Admin', 'load users error', err);
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
    
    return `
      <tr>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.display_name)}</td>
        <td>${roleBadge}</td>
        <td>${expiresText}</td>
        <td>${user.credits || 0}</td>
        <td>
          <div class="admin-actions">
            <button class="btn btn-outline btn-sm" onclick="editUser('${user.user_id}')">Modifica</button>
            <button class="btn btn-outline btn-sm" onclick="manageCredits('${user.user_id}')">Crediti</button>
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
  alert(message); // TODO: Sostituire con toast
}

// Global functions per onclick handlers (ora gestite da admin-complete.js)
window.editUser = window.openEditUserModal || function(userId) {
  alert(`Modifica utente ${userId} - Funzionalità in caricamento...`);
};

window.manageCredits = window.openManageCreditsModal || function(userId) {
  alert(`Gestisci crediti per ${userId} - Funzionalità in caricamento...`);
};

// Export loadAllData per admin-complete.js
window.loadAllData = loadAllData;
