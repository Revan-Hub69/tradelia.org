'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Star, FileText, BookOpen, TrendingUp, X, Heart } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useApi } from '@/lib/hooks/useApi';
import { authenticatedFetch } from '@/lib/api/fetch-client';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { VirtualizedList } from './VirtualizedList';

interface Favorite {
  id: string;
  item_id: string;
  item_type: 'report' | 'course' | 'module';
  title: string;
  description: string | null;
  href: string;
  icon: string | null;
  added_at: string;
}

export const Favorites = memo(function Favorites() {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(true);

  const { data: favoritesData, loading: apiLoading, error, retry } = useApi<Favorite[]>(
    '/api/dashboard/favorites',
    {
      cacheTime: 2 * 60 * 1000, // 2 minutes
      requireAuth: false, // Permetti accesso guest
      onError: (err) => {
        // Non mostrare errore per 401 - è normale per guest
        if (err instanceof Error && (err as any).status === 401) {
          return;
        }
        toast.error('Errore nel caricamento dei preferiti', {
          action: {
            label: 'Riprova',
            onClick: retry,
          },
        });
      },
    }
  );

  // Map Supabase data to component format
  const favorites = useMemo(() => {
    if (!favoritesData) return [];

    return favoritesData.map((item) => {
      let iconNode: React.ReactNode = <FileText className="w-4 h-4" />;
      
      if (item.icon) {
        // Map icon string to React node
        switch (item.icon) {
          case 'file':
            iconNode = <FileText className="w-4 h-4" />;
            break;
          case 'book':
            iconNode = <BookOpen className="w-4 h-4" />;
            break;
          case 'trending':
            iconNode = <TrendingUp className="w-4 h-4" />;
            break;
          default:
            iconNode = <FileText className="w-4 h-4" />;
        }
      } else {
        // Default icon based on type
        switch (item.item_type) {
          case 'report':
            iconNode = <FileText className="w-4 h-4" />;
            break;
          case 'course':
            iconNode = <BookOpen className="w-4 h-4" />;
            break;
          case 'module':
            iconNode = <TrendingUp className="w-4 h-4" />;
            break;
        }
      }

      return {
        id: item.id,
        type: item.item_type,
        title: item.title,
        description: item.description || '',
        href: item.href,
        icon: iconNode,
        addedAt: item.added_at,
      };
    });
  }, [favoritesData]);

  const removeFavorite = async (id: string) => {
    try {
      // Sanitize ID to prevent XSS
      const sanitizedId = encodeURIComponent(id);
      if (!sanitizedId || sanitizedId !== id) {
        throw new Error('ID non valido');
      }

      const response = await authenticatedFetch(`/api/dashboard/favorites?id=${sanitizedId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore rimozione preferito');
      }

      toast.success('Rimosso dai preferiti');
      
      // Retry to refresh list
      retry();
    } catch (error) {
      // Error is already handled by authenticatedFetch for 401
      if (error instanceof Error && (error as any).status !== 401) {
        toast.error('Errore nella rimozione del preferito');
      }
    }
  };

  const getTypeIcon = (type: Favorite['item_type']) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'module':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Favorite['item_type']) => {
    switch (type) {
      case 'report':
        return t('dashboard.favorites.types.report') || 'Report';
      case 'course':
        return t('dashboard.favorites.types.course') || 'Corso';
      case 'module':
        return t('dashboard.favorites.types.module') || 'Modulo';
    }
  };

  if (apiLoading) {
    return (
      <section className="mb-8" aria-label={t('dashboard.favorites.title') || 'Preferiti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.favorites.title') || 'Preferiti'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-bg-soft rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (favorites.length === 0) {
    return (
      <section className="mb-8" aria-label={t('dashboard.favorites.title') || 'Preferiti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.favorites.title') || 'Preferiti'}
          </h2>
        </div>
        <div className="bg-bg-soft border-premium shadow-premium rounded-xl p-8 md:p-12 text-center card-mobile">
          <Heart className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
          <p className="text-sm text-text-tertiary mb-2">
            {t('dashboard.favorites.empty') || 'Nessun contenuto salvato nei preferiti'}
          </p>
          <p className="text-xs text-text-tertiary">
            {t('dashboard.favorites.emptyDesc') || 'Clicca sulla stella per salvare i contenuti che usi più spesso'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8" aria-label={t('dashboard.favorites.title') || 'Preferiti'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          {t('dashboard.favorites.title') || 'Preferiti'}
        </h2>
        <span className="text-xs text-text-tertiary">
          {favorites.length} {t('dashboard.favorites.count') || 'preferiti'}
        </span>
      </div>
      {/* Virtual scrolling per liste lunghe (>20 items) - Performance optimization */}
      {favorites.length > 20 ? (
        <div className="h-[600px]">
          <VirtualizedList
            items={favorites}
            itemHeight={120}
            overscan={3}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[120px]"
            aria-label={t('dashboard.favorites.title') || 'Preferiti'}
            renderItem={(favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={favorite.href}
                  className="block p-4 bg-bg-soft border-premium shadow-premium rounded-xl hover:border-border-strong shadow-premium-hover interaction-smooth group relative h-full card-mobile"
                  aria-label={`${favorite.title} - ${favorite.description}`}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFavorite(favorite.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center text-amber-300 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={t('dashboard.favorites.remove') || 'Rimuovi dai preferiti'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(favorite.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-primary text-sm truncate">{favorite.title}</h3>
                        <Star className="w-3 h-3 text-amber-300 fill-amber-300 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 mb-2">{favorite.description}</p>
                      <span className="px-1.5 py-0.5 bg-bg-surface border-premium rounded text-xs text-text-tertiary capitalize">
                        {getTypeLabel(favorite.type)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 spacing-mobile">
          <AnimatePresence>
            {favorites.map((favorite, index) => (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={favorite.href}
                className="block p-4 bg-bg-soft border border-border-subtle rounded-xl hover:border-accent/40 transition-all duration-200 group relative"
                aria-label={`${favorite.title} - ${favorite.description}`}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(favorite.id);
                  }}
                    className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center text-amber-300 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={t('dashboard.favorites.remove') || 'Rimuovi dai preferiti'}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(favorite.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary text-sm truncate">{favorite.title}</h3>
                      <Star className="w-3 h-3 text-amber-300 fill-amber-300 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">{favorite.description}</p>
                    <span className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary capitalize">
                      {getTypeLabel(favorite.type)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}
    </section>
  );
});

// Hook per aggiungere/rimuovere preferiti da altri componenti
export function useFavorites() {
  const addFavorite = async (favorite: {
    id: string;
    type: 'report' | 'course' | 'module';
    title: string;
    description: string;
    href: string;
    icon?: string;
  }): Promise<boolean> => {
    try {
      // Validate and sanitize input
      if (!favorite.id || !favorite.type || !favorite.title || !favorite.href) {
        throw new Error('Dati mancanti');
      }

      const response = await authenticatedFetch('/api/dashboard/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: favorite.id,
          item_type: favorite.type,
          title: favorite.title,
          description: favorite.description,
          href: favorite.href,
          icon: favorite.icon || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore aggiunta preferito');
      }

      toast.success('Aggiunto ai preferiti');
      return true;
    } catch (error) {
      // Error is already handled by authenticatedFetch for 401
      if (error instanceof Error && (error as any).status !== 401) {
        toast.error('Errore nell\'aggiunta del preferito');
      }
      return false;
    }
  };

  const removeFavorite = async (itemId: string, itemType?: 'report' | 'course' | 'module'): Promise<boolean> => {
    try {
      // Sanitize input
      const sanitizedItemId = encodeURIComponent(itemId);
      if (!sanitizedItemId || sanitizedItemId !== itemId) {
        throw new Error('ID non valido');
      }

      // Get all favorites to find the one with matching item_id
      const listResponse = await authenticatedFetch('/api/dashboard/favorites');
      if (!listResponse.ok) {
        throw new Error('Errore nel caricamento preferiti');
      }

      const { data: favorites } = await listResponse.json();
      const favorite = favorites.find((f: Favorite) => 
        f.item_id === itemId && 
        (!itemType || f.item_type === itemType)
      );

      if (!favorite) {
        return false;
      }

      // Sanitize favorite ID
      const sanitizedFavoriteId = encodeURIComponent(favorite.id);
      const response = await authenticatedFetch(`/api/dashboard/favorites?id=${sanitizedFavoriteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Errore rimozione preferito');
      }

      toast.success('Rimosso dai preferiti');
      return true;
    } catch (error) {
      // Error is already handled by authenticatedFetch for 401
      if (error instanceof Error && (error as any).status !== 401) {
        toast.error('Errore nella rimozione del preferito');
      }
      return false;
    }
  };

  const isFavorite = async (
    itemId: string,
    itemType: 'report' | 'course' | 'module'
  ): Promise<boolean> => {
    try {
      // Sanitize input
      const sanitizedItemId = encodeURIComponent(itemId);
      const sanitizedType = encodeURIComponent(itemType);
      
      const response = await authenticatedFetch(
        `/api/dashboard/favorites?check=${sanitizedItemId}&type=${sanitizedType}`
      );
      
      if (!response.ok) return false;
      
      const { isFavorite: result } = await response.json();
      return result || false;
    } catch {
      return false;
    }
  };

  return { addFavorite, removeFavorite, isFavorite };
}

