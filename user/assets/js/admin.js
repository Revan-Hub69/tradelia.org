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
    // Verifica che l'utente sia admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/dashboard.html';
      return;
    }
    
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!adminData) {
      window.location.href = '/dashboard.html';
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
            <button class="btn btn-outline btn-sm" onclick="managePayments('${user.user_id}')">Pagamenti</button>
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

// Gestione pagamenti manuali (Xolo)
window.managePayments = window.openManagePaymentsModal || function(userId) {
  const user = allUsers.find(u => u.user_id === userId);
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
