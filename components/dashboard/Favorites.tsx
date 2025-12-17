'use client';

import { useFavoritesUniversal } from '@/lib/hooks/useFavoritesUniversal';

/**
 * Adapter hook for dashboard favorites used by UI components.
 * Provides the API expected by `FavoriteButton`:
 * - isFavorite(id, type): Promise<boolean>
 * - addFavorite({ id, type, title, description, href, icon }): Promise<boolean>
 * - removeFavorite(id, type): Promise<boolean>
 */
export function useFavorites() {
  const {
    favorites,
    loading,
    addFavorite: addFavoriteUniversal,
    removeFavorite: removeFavoriteUniversal,
    isFavorite: isFavoriteUniversal,
    toggleFavorite,
  } = useFavoritesUniversal();

  const isFavorite = async (id: string, type: string): Promise<boolean> => {
    // The universal hook expects (itemId, itemType)
    return Promise.resolve(isFavoriteUniversal(id, type));
  };

  const addFavorite = async (fav: {
    id: string;
    type: string;
    title: string;
    description?: string;
    href: string;
    icon?: string;
  }): Promise<boolean> => {
    return await addFavoriteUniversal({
      item_id: fav.id,
      item_type: fav.type,
      title: fav.title,
      description: fav.description || null,
      href: fav.href,
      icon: fav.icon || null,
    } as any);
  };

  const removeFavorite = async (id: string, type: string): Promise<boolean> => {
    return await removeFavoriteUniversal(id, type);
  };

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}

export default useFavorites;
