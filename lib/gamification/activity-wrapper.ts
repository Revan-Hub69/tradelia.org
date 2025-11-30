/**
 * Activity Wrapper
 * Wrapper per creare attività e triggerare gamification automaticamente
 */

import { createActivity } from '@/lib/supabase/server-services';
import { checkAndUnlockAchievements, awardXP } from './achievement-engine';

interface ActivityData {
  user_id: string;
  type: string;
  title: string;
  description: string;
  metadata?: any;
}

/**
 * Create activity and trigger gamification
 */
export async function createActivityWithGamification(
  activityData: ActivityData,
  isAdmin = false
) {
  // Create activity
  const { data: activity, error } = await createActivity(activityData, isAdmin);

  if (error || !activity) {
    return { activity, error };
  }

  // Map activity type to gamification action
  const actionTypeMap: Record<string, 'lesson_completed' | 'course_completed' | 'report_viewed' | 'daily_login'> = {
    'course_completed': 'course_completed',
    'lesson_completed': 'lesson_completed',
    'report_viewed': 'report_viewed',
  };

  const actionType = actionTypeMap[activityData.type];
  
  if (actionType) {
    // Award XP
    const xpAmounts: Record<string, number> = {
      'lesson_completed': 10,
      'course_completed': 100,
      'report_viewed': 5,
    };

    const xpAmount = xpAmounts[actionType];
    if (xpAmount) {
      await awardXP(activityData.user_id, xpAmount, actionType);
    }

    // Check and unlock achievements
    const { unlocked } = await checkAndUnlockAchievements(activityData.user_id, actionType);
    
    // Return activity with unlocked achievements
    return {
      activity,
      unlockedAchievements: unlocked || [],
      error: null,
    };
  }

  return { activity, unlockedAchievements: [], error: null };
}

