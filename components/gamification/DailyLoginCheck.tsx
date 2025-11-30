'use client';

import { useEffect } from 'react';
import { useGamification } from '@/lib/gamification/hooks/useGamification';

/**
 * Component to check daily login and update streak
 * Runs once per day when user visits dashboard
 */
export function DailyLoginCheck() {
  const { updateDailyStreak } = useGamification();

  useEffect(() => {
    // Check if already checked today (localStorage)
    const lastCheck = localStorage.getItem('gamification-daily-check');
    const today = new Date().toISOString().split('T')[0];

    if (lastCheck !== today) {
      // Update streak and mark as checked
      updateDailyStreak();
      localStorage.setItem('gamification-daily-check', today);
    }
  }, [updateDailyStreak]);

  return null; // No UI
}

