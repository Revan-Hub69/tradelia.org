'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from './useAuthState';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { toast } from '@/components/ui/Toast';

export interface Favorite {
  id: string;
  item_id: string; // Può essere UUID o stringa
  item_type: string; // Qualsiasi tipo: 'report', 'course', 'module', 'page', 'url', etc.
  title: string;
  description?: string | null;
  href: string;
  icon?: string | null;
  metadata?: Record<string, any>; // Dati aggiuntivi
  added_at: string;
}

/**
 * Hook universale per i preferiti
 * - Solo Supabase per utenti autenticati (NO localStorage per sicurezza)
 * - Array vuoto per utenti non autenticati
 * - Supporta qualsiasi tipo di contenuto
 */
export function useFavoritesUniversal() {
  const { isAuthenticated } = useAuthState();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica preferiti solo da Supabase (NO localStorage)
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          // Carica solo da Supabase
          const response = await authenticatedFetch('/api/dashboard/favorites');
          if (response.ok) {
            const { data } = await response.json();
            setFavorites(data || []);
          } else {
            // Se API fallisce, restituisci array vuoto (NO localStorage)
            setFavorites([]);
          }
        } else {
          // Guest: array vuoto (NO localStorage per sicurezza)
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        // In caso di errore, restituisci array vuoto (NO localStorage)
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  // Aggiungi preferito
  const addFavorite = useCallback(async (
    favorite: Omit<Favorite, 'id' | 'added_at'>
  ): Promise<boolean> => {
    try {
      const newFavorite: Favorite = {
        ...favorite,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        added_at: new Date().toISOString(),
      };

      // Aggiorna UI immediatamente (optimistic update)
      setFavorites((prev) => {
        // Evita duplicati
        const exists = prev.some(
          (f) => f.item_id === favorite.item_id && f.item_type === favorite.item_type
        );
        if (exists) return prev;
        return [...prev, newFavorite];
      });

      // Se autenticato, salva su Supabase (NO localStorage)
      if (isAuthenticated) {
        try {
          const response = await authenticatedFetch('/api/dashboard/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              item_id: favorite.item_id,
              item_type: favorite.item_type,
              title: favorite.title,
              description: favorite.description || null,
              href: favorite.href,
              icon: favorite.icon || null,
              metadata: favorite.metadata || {},
            }),
          });

          if (response.ok) {
            const { data } = await response.json();
            // Aggiorna con l'ID reale da Supabase
            setFavorites((prev) =>
              prev.map((f) =>
                f.id === newFavorite.id ? { ...f, id: data.id } : f
              )
            );
            toast.success('Aggiunto ai preferiti');
            return true;
          } else {
            // Se fallisce, rimuovi dall'UI (NO localStorage)
            setFavorites((prev) =>
              prev.filter((f) => f.id !== newFavorite.id)
            );
            toast.error('Errore nel salvataggio del preferito');
            return false;
          }
        } catch (error) {
          // Se fallisce, rimuovi dall'UI (NO localStorage)
          console.error('Error saving to Supabase:', error);
          setFavorites((prev) =>
            prev.filter((f) => f.id !== newFavorite.id)
          );
          toast.error('Errore nel salvataggio del preferito');
          return false;
        }
      } else {
        // Guest: non può salvare preferiti (NO localStorage)
        setFavorites((prev) =>
          prev.filter((f) => f.id !== newFavorite.id)
        );
        toast.error('Accedi per salvare i preferiti');
        return false;
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Errore nell\'aggiunta del preferito');
      return false;
    }
  }, [favorites, isAuthenticated]);

  // Rimuovi preferito
  const removeFavorite = useCallback(async (
    itemId: string,
    itemType: string
  ): Promise<boolean> => {
    try {
      // Trova il preferito da rimuovere
      const favoriteToRemove = favorites.find(
        (f) => f.item_id === itemId && f.item_type === itemType
      );

      if (!favoriteToRemove) {
        return false;
      }

      // Aggiorna UI immediatamente (optimistic update)
      setFavorites((prev) =>
        prev.filter(
          (f) => !(f.item_id === itemId && f.item_type === itemType)
        )
      );

      // Se autenticato, rimuovi da Supabase (NO localStorage)
      if (isAuthenticated && favoriteToRemove.id) {
        try {
          const response = await authenticatedFetch(
            `/api/dashboard/favorites?id=${encodeURIComponent(favoriteToRemove.id)}`,
            {
              method: 'DELETE',
            }
          );

          if (response.ok) {
            toast.success('Rimosso dai preferiti');
            return true;
          } else {
            // Se fallisce, ripristina in UI (NO localStorage)
            setFavorites((prev) => [...prev, favoriteToRemove]);
            toast.error('Errore nella rimozione del preferito');
            return false;
          }
        } catch (error) {
          console.error('Error removing from Supabase:', error);
          // Se fallisce, ripristina in UI (NO localStorage)
          setFavorites((prev) => [...prev, favoriteToRemove]);
          toast.error('Errore nella rimozione del preferito');
          return false;
        }
      } else {
        // Guest: non può rimuovere preferiti (NO localStorage)
        setFavorites((prev) => [...prev, favoriteToRemove]);
        toast.error('Accedi per gestire i preferiti');
        return false;
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Errore nella rimozione del preferito');
      return false;
    }
  }, [favorites, isAuthenticated]);

  // Verifica se è preferito
  const isFavorite = useCallback(
    (itemId: string, itemType: string): boolean => {
      return favorites.some(
        (f) => f.item_id === itemId && f.item_type === itemType
      );
    },
    [favorites]
  );

  // Toggle preferito
  const toggleFavorite = useCallback(
    async (favorite: Omit<Favorite, 'id' | 'added_at'>): Promise<boolean> => {
      const exists = isFavorite(favorite.item_id, favorite.item_type);
      if (exists) {
        return await removeFavorite(favorite.item_id, favorite.item_type);
      } else {
        return await addFavorite(favorite);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
