'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Star, FileText, BookOpen, TrendingUp, X, Heart } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useFavoritesUniversal, type Favorite } from '@/lib/hooks/useFavoritesUniversal';
import { Skeleton } from '@/components/ui/Skeleton';

export const Favorites = memo(function Favorites() {
  const { t } = useTranslations();
  const { favorites, loading, removeFavorite } = useFavoritesUniversal();

  // Map favorites data to component format
  const favoritesList = useMemo(() => {
    return favorites.map((item) => {
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
          default:
            iconNode = <FileText className="w-4 h-4" />;
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
        item_id: item.item_id,
      };
    });
  }, [favorites]);

  const handleRemoveFavorite = async (itemId: string, itemType: string) => {
    try {
      await removeFavorite(itemId, itemType);
      // Annuncia la rimozione per screen readers (Best Practice: Accessibilità)
      if (typeof window !== 'undefined') {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'Preferito rimosso';
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'module':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'report':
        return t('dashboard.favorites.types.report') || 'Report';
      case 'course':
        return t('dashboard.favorites.types.course') || 'Corso';
      case 'module':
        return t('dashboard.favorites.types.module') || 'Modulo';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <section className="mb-8" aria-label={t('dashboard.favorites.title') || 'Preferiti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.favorites.title') || 'Preferiti'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-bg-soft rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (favoritesList.length === 0) {
    return (
      <section className="mb-8 min-h-[200px]" aria-label={t('dashboard.favorites.title') || 'Preferiti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.favorites.title') || 'Preferiti'}
          </h2>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-12 text-center min-h-[200px] flex flex-col items-center justify-center">
          <Heart className="w-12 h-12 mx-auto mb-3 text-text-secondary opacity-60" />
          <p className="text-sm text-text-secondary mb-2">
            {t('dashboard.favorites.empty') || 'Nessun contenuto salvato nei preferiti'}
          </p>
          <p className="text-xs text-text-secondary opacity-90">
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
        <span className="text-xs text-text-secondary">
          {favoritesList.length} {t('dashboard.favorites.count') || 'preferiti'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {favoritesList.map((favorite, index) => (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={favorite.href}
                className="block p-4 bg-bg-soft border border-border-subtle rounded-xl hover:border-accent/40 transition-all duration-200 group relative focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                aria-label={`${favorite.title} - ${favorite.description}`}
                prefetch={true}
                onKeyDown={(e) => {
                  // Best Practice: Enter e Space attivano il link (WCAG 2.1.1)
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = favorite.href;
                  }
                }}
                onMouseEnter={() => {
                  // Prefetch intelligente al hover (Best Practice: Performance)
                  if (typeof window !== 'undefined') {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = favorite.href;
                    document.head.appendChild(link);
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.item_id, favorite.type);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded flex items-center justify-center text-amber-400 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label={t('dashboard.favorites.remove') || 'Rimuovi dai preferiti'}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(favorite.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary text-sm truncate">{favorite.title}</h3>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-2">{favorite.description}</p>
                    <span className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-xs text-text-secondary capitalize">
                      {getTypeLabel(favorite.type)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
});

// Re-export hook universale per compatibilità
export { useFavoritesUniversal as useFavorites } from '@/lib/hooks/useFavoritesUniversal';

