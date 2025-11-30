/**
 * Optimistic version of useFavorites
 * Updates UI immediately, syncs with server
 */

import { useState, useEffect, useCallback } from 'react';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/components/ui/Toast';

export interface Favorite {
  id: string;
  type: 'report' | 'course' | 'module';
  title: string;
  description: string;
  href: string;
  icon: string;
  addedAt: string;
}

const STORAGE_KEY = 'tradelia_favorites';

/**
 * Optimistic favorites hook
 */
export function useFavoritesOptimistic() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage initially
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with server (background)
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // TODO: Sync with Supabase when API is ready
        // const { data } = await supabase
        //   .from('favorites')
        //   .select('*')
        //   .eq('user_id', user.id);
        // if (data) setFavorites(data);
      } catch (error) {
        console.error('Error syncing favorites:', error);
      }
    };

    syncWithServer();
  }, []);

  const updateFn = useCallback(async (newFavorites: Favorite[]) => {
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    
    // TODO: Sync with Supabase
    // const { data: { user } } = await supabase.auth.getUser();
    // if (user) {
    //   await supabase
    //     .from('favorites')
    //     .upsert(newFavorites.map(f => ({ ...f, user_id: user.id })));
    // }
    
    return newFavorites;
  }, []);

  const { data, update, isUpdating } = useOptimisticUpdate(favorites, updateFn);

  // Update local state when optimistic update completes
  useEffect(() => {
    setFavorites(data);
  }, [data]);

  const addFavorite = useCallback(async (favorite: Omit<Favorite, 'addedAt'>) => {
    const newFavorite: Favorite = {
      ...favorite,
      addedAt: new Date().toISOString(),
    };

    const newFavorites = [...favorites, newFavorite];
    
    await update(newFavorites, {
      successMessage: 'Aggiunto ai preferiti',
      errorMessage: 'Errore aggiunta preferito',
    });
  }, [favorites, update]);

  const removeFavorite = useCallback(async (id: string) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    
    await update(newFavorites, {
      successMessage: 'Rimosso dai preferiti',
      errorMessage: 'Errore rimozione preferito',
    });
  }, [favorites, update]);

  const toggleFavorite = useCallback(async (favorite: Omit<Favorite, 'addedAt'>) => {
    const exists = favorites.some(f => f.id === favorite.id);
    
    if (exists) {
      await removeFavorite(favorite.id);
    } else {
      await addFavorite(favorite);
    }
  }, [favorites, addFavorite, removeFavorite]);

  return {
    favorites,
    loading: loading || isUpdating,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite: (id: string) => favorites.some(f => f.id === id),
  };
}

