'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useFavorites } from '@/components/dashboard/Favorites';

interface FavoriteButtonProps {
  id: string;
  type: 'report' | 'course' | 'module';
  title: string;
  description: string;
  href: string;
  className?: string;
}

export function FavoriteButton({ id, type, title, description, href, className }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(id));
  }, [id, isFavorite]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (favorited) {
      removeFavorite(id);
      setFavorited(false);
    } else {
      addFavorite({ id, type, title, description, href });
      setFavorited(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
        favorited
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-bg-soft text-text-tertiary hover:text-amber-400 hover:bg-amber-500/10',
        className
      )}
      aria-label={favorited ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
      aria-pressed={favorited}
    >
      <Star className={cn('w-4 h-4 transition-transform', favorited && 'fill-current')} />
    </button>
  );
}

