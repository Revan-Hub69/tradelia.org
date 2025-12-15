/**
 * Supabase Sync Utility
 * 
 * Best Practice: Sync user data to Supabase for:
 * - Multi-device access
 * - Data backup
 * - Audit trail (legal consents)
 * - User preferences sync
 */

import { supabase } from '@/lib/supabase/client';
import { getItem, setItem } from './storage';

// Keys that require Supabase sync
const REQUIRED_SYNC_KEYS = [
  'tradelia_favorites',
  'tradelia-legal-consent',
];

const OPTIONAL_SYNC_KEYS = [
  'oslo_locale',
  'tradelia-currency',
  'tradelia-ai-chat-messages',
  'gamification-daily-check',
];

/**
 * Check if user is logged in
 */
async function isUserLoggedIn(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

/**
 * Sync chat messages to Supabase (opzionale - backup per utenti loggati)
 */
async function syncChatMessages(messages: any[]): Promise<void> {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) return; // Solo per utenti loggati

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Usa il primo conversation_id o creane uno nuovo
    const conversationId = messages[0]?.conversationId || crypto.randomUUID();

    // Prepara messaggi per inserimento (solo ultimi 50 per performance)
    const messagesToSync = messages.slice(-50).map((msg: any) => ({
      user_id: user.id,
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      metadata: {
        timestamp: msg.timestamp,
        id: msg.id,
      },
    }));

    if (messagesToSync.length > 0) {
      // Delete old messages for this conversation (keep only last 50)
      await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId);

      // Insert new messages
      const { error } = await supabase
        .from('ai_chat_messages')
        .insert(messagesToSync);

      if (error) {
        console.warn('Failed to sync chat messages to Supabase:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to sync chat messages to Supabase:', error);
  }
}

/**
 * Sync favorites to Supabase - OBBLIGATORIO
 */
export async function syncFavorites(favorites: any[]): Promise<void> {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete all existing favorites for this user
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id);

    // Insert new favorites
    if (favorites.length > 0) {
      const favoritesToInsert = favorites.map(f => ({
        user_id: user.id,
        item_id: f.id,
        item_type: f.type,
        title: f.title,
        description: f.description || null,
        href: f.href,
        icon: f.icon || null,
        added_at: f.addedAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('favorites')
        .insert(favoritesToInsert);

      if (error) {
        console.warn('Failed to sync favorites to Supabase:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to sync favorites to Supabase:', error);
  }
}

/**
 * Sync legal consent to Supabase (audit trail) - OBBLIGATORIO
 */
export async function syncLegalConsent(consent: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Get IP and user agent for audit trail
    let ipAddress: string | null = null;
    let userAgent: string | null = null;
    
    if (typeof window !== 'undefined') {
      // Try to get IP from headers (if available via API)
      userAgent = navigator.userAgent;
    }

    const consentValue = consent === 'accepted' ? 'accepted' : 
                        consent === 'rejected' ? 'rejected' : 'pending';

    // Sync to legal_consents table (audit trail)
    const { error } = await supabase
      .from('legal_consents')
      .upsert({
        user_id: userId,
        consent_type: 'legal',
        consent_value: consentValue,
        ip_address: ipAddress,
        user_agent: userAgent,
        consent_date: new Date().toISOString(),
      }, {
        onConflict: 'user_id,consent_type'
      });

    if (error) {
      console.warn('Failed to sync legal consent to Supabase:', error);
    }
  } catch (error) {
    console.warn('Failed to sync legal consent to Supabase:', error);
  }
}

/**
 * Sync user preferences to Supabase
 */
export async function syncUserPreferences(preferences: {
  locale?: string;
  currency?: string;
}): Promise<void> {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profiles table (language and currency)
    const profileUpdate: any = {};
    if (preferences.locale) {
      profileUpdate.language = preferences.locale;
    }
    if (preferences.currency) {
      profileUpdate.currency = preferences.currency;
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) {
        console.warn('Failed to sync user preferences to profiles:', profileError);
      }
    }
  } catch (error) {
    console.warn('Failed to sync user preferences to Supabase:', error);
  }
}

/**
 * Auto-sync data to Supabase when changed
 * Call this after setItem for keys that need sync
 */
export async function autoSync(key: string, value: any): Promise<void> {
  if (!REQUIRED_SYNC_KEYS.includes(key) && !OPTIONAL_SYNC_KEYS.includes(key)) {
    return; // No sync needed
  }

  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) {
    // For required sync keys, log warning
    if (REQUIRED_SYNC_KEYS.includes(key)) {
      console.warn(`Required sync key ${key} changed but user not logged in`);
    }
    return;
  }

  try {
    switch (key) {
      case 'tradelia_favorites':
        await syncFavorites(value);
        break;
      case 'tradelia-legal-consent':
        await syncLegalConsent(value);
        break;
      case 'oslo_locale':
      case 'tradelia-currency':
        await syncUserPreferences({
          locale: key === 'oslo_locale' ? value : undefined,
          currency: key === 'tradelia-currency' ? value : undefined,
        });
        break;
      case 'tradelia-ai-chat-messages':
        // Optional: backup chat messages for logged-in users
        await syncChatMessages(value);
        break;
      case 'gamification-daily-check':
        // Optional: sync for gamification stats
        // TODO: Implement if needed
        break;
    }
  } catch (error) {
    console.warn(`Failed to auto-sync ${key} to Supabase:`, error);
  }
}

/**
 * Load data from Supabase and merge with local storage
 * Call this on app initialization for logged-in users
 * Priority: Supabase > LocalStorage (server is source of truth)
 */
export async function loadFromSupabase(): Promise<void> {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Load favorites from Supabase
    try {
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (!error && favorites && favorites.length > 0) {
        // Convert to local format
        const localFavorites = favorites.map(f => ({
          id: f.item_id,
          type: f.item_type,
          title: f.title,
          description: f.description,
          href: f.href,
          icon: f.icon,
          addedAt: f.added_at,
        }));
        await setItem('tradelia_favorites', localFavorites);
      }
    } catch (error) {
      console.warn('Failed to load favorites from Supabase:', error);
    }

    // 2. Load user preferences from profiles
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('language, currency')
        .eq('id', user.id)
        .single();

      if (!error && profile) {
        if (profile.language) {
          await setItem('oslo_locale', profile.language, { skipSync: true });
        }
        if (profile.currency) {
          await setItem('tradelia-currency', profile.currency, { skipSync: true });
        }
      }
    } catch (error) {
      console.warn('Failed to load user preferences from Supabase:', error);
    }

    // 3. Load legal consent (latest)
    try {
      const { data: consent, error } = await supabase
        .from('legal_consents')
        .select('consent_value')
        .eq('user_id', user.id)
        .eq('consent_type', 'legal')
        .order('consent_date', { ascending: false })
        .limit(1)
        .single();

      if (!error && consent) {
        await setItem('tradelia-legal-consent', consent.consent_value, { skipSync: true });
      }
    } catch (error) {
      // No consent found is OK
      console.debug('No legal consent found in Supabase (OK for new users)');
    }
  } catch (error) {
    console.warn('Failed to load from Supabase:', error);
  }
}
