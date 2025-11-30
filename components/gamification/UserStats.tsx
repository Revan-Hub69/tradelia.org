'use client';

import { useState, useEffect, memo } from 'react';
import { TrendingUp, Award, Flame, Target } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { useApi } from '@/lib/hooks/useApi';
import { Skeleton } from '@/components/ui/Skeleton';

interface UserStatsData {
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  streak_days: number;
  last_activity_date: string | null;
}

export const UserStats = memo(function UserStats() {
  const { t } = useTranslations();

  const { data: stats, loading, error } = useApi<UserStatsData>(
    '/api/gamification/stats',
    {
      cacheTime: 1 * 60 * 1000, // 1 minute
      revalidateOnFocus: true,
    }
  );

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangular" height={40} width={100} />
        <Skeleton variant="rectangular" height={40} width={100} />
        <Skeleton variant="rectangular" height={40} width={100} />
      </div>
    );
  }

  if (error || !stats) {
    return null; // Fail silently
  }

  const progressToNextLevel = stats.xp_to_next_level > 0
    ? Math.round(((stats.xp_to_next_level - (stats.xp_to_next_level - 100)) / 100) * 100)
    : 0;

  return (
    <div className="flex items-center gap-4">
      {/* Level */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/30">
        <Target className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-text-primary">
          Lv. {stats.current_level}
        </span>
      </div>

      {/* XP */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-soft border border-border-subtle">
        <TrendingUp className="w-4 h-4 text-text-secondary" />
        <span className="text-xs text-text-secondary">
          {stats.total_xp.toLocaleString()} XP
        </span>
      </div>

      {/* Streak */}
      {stats.streak_days > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">
            {stats.streak_days} {stats.streak_days === 1 ? 'giorno' : 'giorni'}
          </span>
        </div>
      )}
    </div>
  );
});

