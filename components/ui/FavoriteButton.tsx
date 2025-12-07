'use client';

import { useState, useEffect } from 'react';
import { Star, FileText, BookOpen, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useFavoritesUniversal } from '@/lib/hooks/useFavoritesUniversal';

interface FavoriteButtonProps {
  id: string;
  type: 'report' | 'course' | 'module';
  title: string;
  description: string;
  href: string;
  className?: string;
}

export function FavoriteButton({ id, type, title, description, href, className }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesUniversal();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // isFavorite è sincrono, non async
    const result = isFavorite(id, type);
    setFavorited(result);
  }, [id, type, isFavorite]);

  const getTypeIcon = (): string => {
    switch (type) {
      case 'report':
        return 'file';
      case 'course':
        return 'book';
      case 'module':
        return 'trending';
      default:
        return 'file';
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (favorited) {
        const success = await removeFavorite(id, type);
        if (success) {
          setFavorited(false);
        } else {
          // Se fallisce, aggiorna comunque lo stato locale
          setFavorited(isFavorite(id, type));
        }
      } else {
        const success = await addFavorite({ 
          item_id: id, 
          item_type: type, 
          title, 
          description: description || null, 
          href,
          icon: getTypeIcon() || null,
        });
        if (success) {
          setFavorited(true);
        } else {
          // Se fallisce, aggiorna comunque lo stato locale
          setFavorited(isFavorite(id, type));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
        favorited
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-bg-soft text-text-secondary hover:text-amber-400 hover:bg-amber-500/10',
        className
      )}
      aria-label={favorited ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
      aria-pressed={favorited}
    >
      <Star className={cn('w-4 h-4 transition-transform', favorited && 'fill-current')} />
    </button>
  );
}

