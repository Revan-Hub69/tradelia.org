'use client';

import { useState, useEffect } from 'react';
import { Star, FileText, BookOpen, TrendingUp, X, Heart } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Favorite {
  id: string;
  type: 'report' | 'course' | 'module';
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  addedAt: string;
}

export function Favorites() {
  const { t } = useTranslations();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem('dashboard-favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = (newFavorites: Favorite[]) => {
    try {
      localStorage.setItem('dashboard-favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    saveFavorites(updated);
  };

  const getTypeIcon = (type: Favorite['type']) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'module':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Favorite['type']) => {
    switch (type) {
      case 'report':
        return t('dashboard.favorites.types.report') || 'Report';
      case 'course':
        return t('dashboard.favorites.types.course') || 'Corso';
      case 'module':
        return t('dashboard.favorites.types.module') || 'Modulo';
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

  if (favorites.length === 0) {
    return (
      <section className="mb-8" aria-label={t('dashboard.favorites.title') || 'Preferiti'}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('dashboard.favorites.title') || 'Preferiti'}
          </h2>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-12 text-center">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </section>
  );
}

// Hook per aggiungere/rimuovere preferiti da altri componenti
export function useFavorites() {
  const addFavorite = (favorite: Omit<Favorite, 'addedAt'>) => {
    try {
      const saved = localStorage.getItem('dashboard-favorites');
      const favorites: Favorite[] = saved ? JSON.parse(saved) : [];
      
      // Evita duplicati
      if (favorites.some(f => f.id === favorite.id)) {
        return;
      }

      const newFavorite: Favorite = {
        ...favorite,
        addedAt: new Date().toISOString(),
      };

      favorites.unshift(newFavorite);
      localStorage.setItem('dashboard-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const removeFavorite = (id: string) => {
    try {
      const saved = localStorage.getItem('dashboard-favorites');
      if (!saved) return;

      const favorites: Favorite[] = JSON.parse(saved);
      const updated = favorites.filter(f => f.id !== id);
      localStorage.setItem('dashboard-favorites', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const isFavorite = (id: string): boolean => {
    try {
      const saved = localStorage.getItem('dashboard-favorites');
      if (!saved) return false;
      const favorites: Favorite[] = JSON.parse(saved);
      return favorites.some(f => f.id === id);
    } catch {
      return false;
    }
  };

  return { addFavorite, removeFavorite, isFavorite };
}

