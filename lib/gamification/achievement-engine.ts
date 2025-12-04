/**
 * Achievement Engine
 * Sistema automatico per sbloccare achievement basato su condizioni
 * 
 * Best Practices:
 * - Self-Determination Theory (Deci & Ryan, 2000)
 * - Flow Theory (Csikszentmihalyi, 1990)
 * - Octalysis Framework (Chou, 2015)
 */

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface AchievementCondition {
  type: 'lessons_completed' | 'course_completed' | 'reports_viewed' | 'days_streak' | 'total_xp';
  value: number;
}

/**
 * Check and unlock achievements for a user
 * Called after significant user actions
 */
export async function checkAndUnlockAchievements(
  userId: string,
  actionType: 'lesson_completed' | 'course_completed' | 'report_viewed' | 'daily_login' | 'paper_trade_opened' | 'paper_trade_closed'
) {
  const supabase = await createClient();
  
  try {
    // Get all achievements with conditions
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .not('condition_type', 'is', null);

    if (achievementsError || !achievements) {
      console.error('Error fetching achievements:', achievementsError);
      return { unlocked: [], error: achievementsError };
    }

    // Get user current stats
    const userStats = await getUserStats(userId);
    const unlockedAchievements: string[] = [];

    // Check each achievement condition
    for (const achievement of achievements) {
      // Skip if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .eq('unlocked', true)
        .single();

      if (existing) continue;

      // Check condition
      const shouldUnlock = await checkAchievementCondition(
        userId,
        achievement.condition_type,
        achievement.condition_value,
        userStats
      );

      if (shouldUnlock) {
        // Unlock achievement
        const { error: unlockError } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: userId,
            achievement_id: achievement.id,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,achievement_id',
          });

        if (!unlockError) {
          unlockedAchievements.push(achievement.id);
        }
      }
    }

    return { unlocked: unlockedAchievements, error: null };
  } catch (error) {
    console.error('Error checking achievements:', error);
    return { unlocked: [], error };
  }
}

/**
 * Check if achievement condition is met
 */
async function checkAchievementCondition(
  userId: string,
  conditionType: string | null,
  conditionValue: number | null,
  userStats: any
): Promise<boolean> {
  if (!conditionType || conditionValue === null) return false;

  const supabase = await createClient();

  switch (conditionType) {
    case 'lessons_completed':
      const { count: lessonsCount } = await supabase
        .from('course_progress')
        .select('completed_lessons', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      return (lessonsCount || 0) >= conditionValue;

    case 'course_completed':
      const { count: coursesCount } = await supabase
        .from('course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('progress', 100);
      
      return (coursesCount || 0) >= conditionValue;

    case 'reports_viewed':
      const { count: reportsCount } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'report_viewed');
      
      return (reportsCount || 0) >= conditionValue;

    case 'days_streak':
      return (userStats?.streak_days || 0) >= conditionValue;

    case 'total_xp':
      return (userStats?.total_xp || 0) >= conditionValue;

    default:
      return false;
  }
}

/**
 * Get user stats (XP, level, streak)
 */
async function getUserStats(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
}

/**
 * Award XP to user
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: 'lesson_completed' | 'course_completed' | 'report_viewed' | 'achievement_unlocked' | 'daily_login'
) {
  const supabase = await createClient();
  
  try {
    // Get or create user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code === 'PGRST116') {
      // Create new stats
      const { error: createError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          total_xp: amount,
          current_level: calculateLevel(amount),
          xp_to_next_level: calculateXPToNextLevel(amount),
        });

      if (createError) {
        console.error('Error creating user stats:', createError);
        return { success: false, error: createError };
      }
    } else if (stats) {
      // Update existing stats
      const newTotalXP = (stats.total_xp || 0) + amount;
      const newLevel = calculateLevel(newTotalXP);
      const xpToNext = calculateXPToNextLevel(newTotalXP);

      const { error: updateError } = await supabase
        .from('user_stats')
        .update({
          total_xp: newTotalXP,
          current_level: newLevel,
          xp_to_next_level: xpToNext,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user stats:', updateError);
        return { success: false, error: updateError };
      }
    }

    // Log XP transaction
    await logXPTransaction(userId, amount, source);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { success: false, error };
  }
}

/**
 * Calculate user level from total XP
 * Formula: level = floor(sqrt(total_xp / 50)) + 1
 */
function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 50)) + 1;
}

/**
 * Calculate XP needed to reach next level
 */
function calculateXPToNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = Math.pow((currentLevel - 1) * 50, 2);
  const xpForNextLevel = Math.pow(currentLevel * 50, 2);
  return xpForNextLevel - totalXP;
}

/**
 * Log XP transaction for analytics
 */
async function logXPTransaction(
  userId: string,
  amount: number,
  source: string
) {
  const supabase = await createClient();
  
  await supabase
    .from('xp_transactions')
    .insert({
      user_id: userId,
      amount,
      source,
      created_at: new Date().toISOString(),
    });
}

/**
 * Update streak
 */
export async function updateStreak(userId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  
  const { data: stats, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Create new stats with streak = 1
    await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        streak_days: 1,
        last_activity_date: today,
      });
    return { streak: 1, isNewRecord: false };
  }

  if (!stats) return { streak: 0, isNewRecord: false };

  const lastActivity = stats.last_activity_date 
    ? new Date(stats.last_activity_date).toISOString().split('T')[0]
    : null;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = stats.streak_days || 0;
  let isNewRecord = false;

  if (lastActivity === today) {
    // Already updated today
    return { streak: newStreak, isNewRecord: false };
  } else if (lastActivity === yesterdayStr) {
    // Consecutive day - increment streak
    newStreak = (stats.streak_days || 0) + 1;
    isNewRecord = newStreak > (stats.streak_days || 0);
  } else {
    // Streak broken - reset to 1
    newStreak = 1;
  }

  await supabase
    .from('user_stats')
    .update({
      streak_days: newStreak,
      last_activity_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return { streak: newStreak, isNewRecord };
}

