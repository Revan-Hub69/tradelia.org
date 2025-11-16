// ============================================
// ADMIN DASHBOARD - Funzionalità Complete
// ============================================
// Gestione completa utenti, ruoli, scadenze e crediti
// ============================================

import { supabase } from '/report/assets/js/supabase-client.js';
import Logger from '/report/assets/js/utils/logger.js';

// DOM Elements
const EDIT_MODAL = document.getElementById('edit-user-modal');
const CREDITS_MODAL = document.getElementById('manage-credits-modal');
const EDIT_USER_ID = document.getElementById('edit-user-id');
const EDIT_USER_EMAIL = document.getElementById('edit-user-email');
const EDIT_DISPLAY_NAME = document.getElementById('edit-display-name');
const EDIT_ROLE = document.getElementById('edit-role');
const EDIT_VALID_UNTIL = document.getElementById('edit-valid-until');
const SAVE_USER_BTN = document.getElementById('save-user-btn');
const CANCEL_EDIT_BTN = document.getElementById('cancel-edit-btn');

const CREDITS_USER_ID = document.getElementById('credits-user-id');
const CREDITS_USER_EMAIL = document.getElementById('credits-user-email');
const CURRENT_CREDITS = document.getElementById('current-credits');
const CREDITS_CHANGE = document.getElementById('credits-change');
const UPDATE_CREDITS_BTN = document.getElementById('update-credits-btn');
const CANCEL_CREDITS_BTN = document.getElementById('cancel-credits-btn');

let allUsers = [];

// Setup modals
if (SAVE_USER_BTN) {
  SAVE_USER_BTN.addEventListener('click', handleSaveUser);
}
if (CANCEL_EDIT_BTN) {
  CANCEL_EDIT_BTN.addEventListener('click', () => {
    if (EDIT_MODAL) EDIT_MODAL.hidden = true;
  });
}
if (UPDATE_CREDITS_BTN) {
  UPDATE_CREDITS_BTN.addEventListener('click', handleUpdateCredits);
}
if (CANCEL_CREDITS_BTN) {
  CANCEL_CREDITS_BTN.addEventListener('click', () => {
    if (CREDITS_MODAL) CREDITS_MODAL.hidden = true;
  });
}

// Export functions per uso globale
window.openEditUserModal = openEditUserModal;
window.openManageCreditsModal = openManageCreditsModal;
window.openManagePaymentsModal = openManagePaymentsModal;

function openEditUserModal(identifier, type = 'user_id') {
  const user = type === 'email' 
    ? allUsers.find(u => u.email === identifier)
    : allUsers.find(u => u.user_id === identifier);
    
  if (!user) {
    showToast('Utente non trovato.', 'error');
    return;
  }

  // Chiudi altri modali prima
  const otherModals = ['manage-credits-modal', 'manage-payments-modal'];
  otherModals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.hidden = true;
      modal.style.display = 'none';
    }
  });

  if (EDIT_USER_ID) EDIT_USER_ID.value = user.user_id || user.email || '';
  if (EDIT_USER_EMAIL) EDIT_USER_EMAIL.value = user.email || '';
  if (EDIT_DISPLAY_NAME) EDIT_DISPLAY_NAME.value = user.display_name || '';
  if (EDIT_ROLE) EDIT_ROLE.value = user.role || 'trial';
  if (EDIT_VALID_UNTIL) {
    EDIT_VALID_UNTIL.value = user.valid_until 
      ? user.valid_until.split('T')[0] 
      : '';
  }
  
  // Salva il tipo di identificatore per handleSaveUser
  if (EDIT_MODAL) {
    EDIT_MODAL.dataset.identifierType = type;
    EDIT_MODAL.dataset.identifier = identifier;
    EDIT_MODAL.hidden = false;
    EDIT_MODAL.style.display = 'flex';
  }
}

function openManageCreditsModal(identifier, type = 'user_id') {
  if (type === 'email') {
    showToast('Gestione crediti disponibile solo per utenti con user_id.', 'error');
    return;
  }
  
  const user = allUsers.find(u => u.user_id === identifier);
  if (!user) {
    showToast('Utente non trovato.', 'error');
    return;
  }

  // Chiudi altri modali prima
  const otherModals = ['edit-user-modal', 'manage-payments-modal'];
  otherModals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.hidden = true;
      modal.style.display = 'none';
    }
  });

  if (CREDITS_USER_ID) CREDITS_USER_ID.value = user.user_id;
  if (CREDITS_USER_EMAIL) CREDITS_USER_EMAIL.value = user.email;
  if (CURRENT_CREDITS) CURRENT_CREDITS.value = user.credits || 0;
  if (CREDITS_CHANGE) CREDITS_CHANGE.value = 0;
  
  if (CREDITS_MODAL) {
    CREDITS_MODAL.hidden = false;
    CREDITS_MODAL.style.display = 'flex';
  }
}

function openManagePaymentsModal(userId) {
  const user = allUsers.find(u => u.user_id === userId);
  if (!user) {
    showToast('Utente non trovato.', 'error');
    return;
  }

  // I campi del modal pagamenti sono gestiti direttamente in admin.js
  // Questa funzione serve solo per compatibilità con onclick handlers
  const PAYMENTS_MODAL = document.getElementById('manage-payments-modal');
  const PAYMENTS_USER_ID = document.getElementById('payments-user-id');
  const PAYMENTS_USER_EMAIL = document.getElementById('payments-user-email');
  
  // Chiudi altri modali prima
  const otherModals = ['edit-user-modal', 'manage-credits-modal'];
  otherModals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.hidden = true;
      modal.style.display = 'none';
    }
  });
  
  if (PAYMENTS_USER_ID) PAYMENTS_USER_ID.value = user.user_id;
  if (PAYMENTS_USER_EMAIL) PAYMENTS_USER_EMAIL.value = user.email || '';
  
  if (PAYMENTS_MODAL) {
    PAYMENTS_MODAL.hidden = false;
    PAYMENTS_MODAL.style.display = 'flex';
  }
}

async function handleSaveUser() {
  const identifier = EDIT_USER_ID?.value;
  const identifierType = EDIT_MODAL?.dataset.identifierType || 'user_id';
  const email = EDIT_USER_EMAIL?.value?.trim();
  const newDisplayName = EDIT_DISPLAY_NAME?.value.trim();
  const newRole = EDIT_ROLE?.value;
  const newValidUntil = EDIT_VALID_UNTIL?.value || null;

  if (!identifier && !email) {
    showToast('Identificatore utente mancante.', 'error');
    return;
  }

  try {
    if (SAVE_USER_BTN) SAVE_USER_BTN.disabled = true;

    // Se abbiamo user_id, aggiorna user_profiles e user_roles
    if (identifierType === 'user_id' && identifier) {
      // Update user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({ 
          user_id: identifier, 
          display_name: newDisplayName || null 
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Update user_roles
      const roleData = {
        user_id: identifier,
        role: newRole,
        valid_until: newValidUntil || null
      };

      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(roleData, { onConflict: 'user_id' });

      if (roleError) throw roleError;
    }
    
    // Se abbiamo email (con o senza user_id), aggiorna dashboard_access_tokens
    if (email) {
      // Trova tutti i token attivi per questa email
      const { data: tokens, error: tokensError } = await supabase
        .from('dashboard_access_tokens')
        .select('id, email, plan_role, valid_until')
        .eq('email', email.toLowerCase())
        .eq('revoked', false);
      
      if (tokensError) {
        Logger.warn('Admin', 'Error loading tokens for update', tokensError);
      } else if (tokens && tokens.length > 0) {
        // Aggiorna tutti i token attivi per questa email
        for (const token of tokens) {
          const { error: updateTokenError } = await supabase
            .from('dashboard_access_tokens')
            .update({
              plan_role: newRole,
              valid_until: newValidUntil || token.valid_until
            })
            .eq('id', token.id);
          
          if (updateTokenError) {
            Logger.warn('Admin', 'Error updating token', updateTokenError);
          }
        }
      } else {
        // Se non ci sono token, crea un nuovo token (opzionale)
        // Per ora non creiamo token automaticamente, solo aggiorniamo quelli esistenti
      }
      
      // Aggiorna anche subscribers se esiste
      if (identifierType === 'email' || !identifier) {
        const { error: subscriberError } = await supabase
          .from('subscribers')
          .update({
            status: newRole && !newValidUntil ? 'active' : (newValidUntil && new Date(newValidUntil) < new Date() ? 'expired' : 'active')
          })
          .eq('email', email.toLowerCase());
        
        if (subscriberError && subscriberError.code !== 'PGRST116') {
          Logger.warn('Admin', 'Error updating subscriber', subscriberError);
        }
      }
    }

    showToast('Utente aggiornato con successo!', 'success');
    if (EDIT_MODAL) EDIT_MODAL.hidden = true;
    
    // Reload data
    if (window.loadAllData) {
      await window.loadAllData();
    }
  } catch (err) {
    Logger.error('Admin', 'Save user error', err);
    showToast('Errore durante il salvataggio: ' + (err.message || ''), 'error');
  } finally {
    if (SAVE_USER_BTN) SAVE_USER_BTN.disabled = false;
  }
}

async function handleUpdateCredits() {
  const userId = CREDITS_USER_ID?.value;
  const currentCredits = parseInt(CURRENT_CREDITS?.value || '0', 10);
  const creditsChange = parseInt(CREDITS_CHANGE?.value || '0', 10);
  const newCreditsBalance = currentCredits + creditsChange;

  if (!userId) {
    showToast('ID utente mancante.', 'error');
    return;
  }

  if (isNaN(newCreditsBalance) || newCreditsBalance < 0) {
    showToast('Il saldo crediti non può essere negativo.', 'error');
    return;
  }

  try {
    if (UPDATE_CREDITS_BTN) UPDATE_CREDITS_BTN.disabled = true;

    // Fetch current credits to calculate total_purchased
    const { data: currentData, error: fetchError } = await supabase
      .from('user_analysis_credits')
      .select('total_purchased, total_used')
      .eq('user_id', userId)
      .maybeSingle();

    const totalPurchased = (currentData?.total_purchased || 0) + Math.max(0, creditsChange);
    const totalUsed = currentData?.total_used || 0;

    // Update user_analysis_credits
    const { error: creditError } = await supabase
      .from('user_analysis_credits')
      .upsert({ 
        user_id: userId, 
        credits_balance: newCreditsBalance,
        total_purchased: totalPurchased,
        total_used: totalUsed
      }, { onConflict: 'user_id' });

    if (creditError) throw creditError;

    showToast('Crediti aggiornati con successo!', 'success');
    if (CREDITS_MODAL) CREDITS_MODAL.hidden = true;
    
    // Reload data
    if (window.loadAllData) {
      await window.loadAllData();
    }
  } catch (err) {
    Logger.error('Admin', 'Update credits error', err);
    showToast('Errore durante l\'aggiornamento: ' + (err.message || ''), 'error');
  } finally {
    if (UPDATE_CREDITS_BTN) UPDATE_CREDITS_BTN.disabled = false;
  }
}

function showToast(message, type = 'info') {
  // Simple toast implementation
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: ${type === 'error' ? 'rgba(248, 113, 113, 0.95)' : type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(96, 165, 250, 0.95)'};
    color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    font-size: var(--fs-14);
    font-weight: 500;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Export per uso in admin.js
window.allUsers = allUsers;
window.showToast = showToast;

