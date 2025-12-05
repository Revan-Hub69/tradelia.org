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
 * Sync favorites to Supabase
 */
export async function syncFavorites(favorites: any[]): Promise<void> {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Implement Supabase favorites table sync
    // await supabase
    //   .from('favorites')
    //   .upsert(favorites.map(f => ({ ...f, user_id: user.id })));
    
    console.log('Favorites sync to Supabase (TODO: implement table)');
  } catch (error) {
    console.warn('Failed to sync favorites to Supabase:', error);
  }
}

/**
 * Sync legal consent to Supabase (audit trail)
 */
export async function syncLegalConsent(consent: string): Promise<void> {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Implement Supabase user_preferences table
    // await supabase
    //   .from('user_preferences')
    //   .upsert({
    //     user_id: user.id,
    //     legal_consent: consent,
    //     consent_date: new Date().toISOString(),
    //   });
    
    console.log('Legal consent sync to Supabase (TODO: implement table)');
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

    // TODO: Implement Supabase user_preferences table
    // await supabase
    //   .from('user_preferences')
    //   .upsert({
    //     user_id: user.id,
    //     ...preferences,
    //     updated_at: new Date().toISOString(),
    //   });
    
    console.log('User preferences sync to Supabase (TODO: implement table)');
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
        // TODO: Implement if needed
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
 */
export async function loadFromSupabase(): Promise<void> {
  const loggedIn = await isUserLoggedIn();
  if (!loggedIn) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Load from Supabase and merge with local storage
    // Priority: Supabase > LocalStorage (server is source of truth)
    
    // Example:
    // const { data: favorites } = await supabase
    //   .from('favorites')
    //   .select('*')
    //   .eq('user_id', user.id);
    // if (favorites) {
    //   await setItem('tradelia_favorites', favorites);
    // }
    
    console.log('Load from Supabase (TODO: implement)');
  } catch (error) {
    console.warn('Failed to load from Supabase:', error);
  }
}
