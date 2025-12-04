'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/ui/Toast';
import { AchievementNotification } from '@/components/gamification/AchievementNotification';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_type?: string;
}

/**
 * Hook per gestire gamification (XP, achievements, streak)
 * Best Practice: Centralizza tutta la logica gamification
 */
export function useGamification() {
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);

  /**
   * Award XP and check achievements after user action
   */
  const handleUserAction = useCallback(async (
    actionType: 'lesson_completed' | 'course_completed' | 'report_viewed' | 'daily_login' | 'paper_trade_opened' | 'paper_trade_closed' | 'tournament_registered' | 'tournament_completed' | 'tournament_won',
    xpAmount?: number
  ) => {
    try {
      // Award XP if amount specified
      if (xpAmount) {
        const xpResponse = await fetch('/api/gamification/award-xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: xpAmount,
            source: actionType,
          }),
        });

        if (!xpResponse.ok) {
          console.error('Error awarding XP');
        }
      }

      // Check and unlock achievements
      const achievementResponse = await fetch('/api/gamification/check-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType }),
      });

      if (!achievementResponse.ok) {
        console.error('Error checking achievements');
        return;
      }

      const { unlocked } = await achievementResponse.json();

      // Show notification for each unlocked achievement
      if (unlocked && unlocked.length > 0) {
        for (const achievementId of unlocked) {
          // Fetch achievement details
          const achievementDetailsResponse = await fetch(`/api/achievements/${achievementId}`);
          if (achievementDetailsResponse.ok) {
            const achievement = await achievementDetailsResponse.json();
            setUnlockedAchievement(achievement);
          }
        }
      }
    } catch (error) {
      console.error('Error in gamification handler:', error);
    }
  }, []);

  /**
   * Update daily streak
   */
  const updateDailyStreak = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/update-streak', {
        method: 'POST',
      });

      if (response.ok) {
        const { streak, isNewRecord } = await response.json();
        if (isNewRecord && streak > 0) {
          // Award XP for maintaining streak
          await handleUserAction('daily_login', 5);
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [handleUserAction]);

  return {
    handleUserAction,
    updateDailyStreak,
    unlockedAchievement,
    setUnlockedAchievement,
  };
}

