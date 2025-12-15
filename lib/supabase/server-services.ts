/**
 * Server-side Supabase services
 * Utilities per comunicare con Supabase dal server
 */

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface Module {
  id: string;
  title: string;
  description: string | null;
  href: string;
  icon: string | null;
  priority: "primary" | "secondary";
  is_active: boolean;
  order_index: number;
  badge_count: number;
}

export interface Favorite {
  id: string;
  item_id?: string | null; // UUID (retrocompatibilità)
  item_id_string?: string | null; // Stringa per qualsiasi contenuto
  item_type: string; // Qualsiasi tipo, non più limitato
  title: string;
  description: string | null;
  href: string;
  icon: string | null;
  metadata?: Record<string, any> | null;
  added_at: string;
}

/**
 * Get user activities
 */
export async function getUserActivities(userId: string, limit = 10, filter?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filter && filter !== "all") {
    query = query.eq("type", filter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching activities:", error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Get user course progress
 */
export async function getUserCourseProgress(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_progress")
    .select(
      `
      *,
      courses (
        id,
        title,
        description,
        total_lessons,
        slug
      )
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching course progress:", error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}


/**
 * Get dashboard stats
 */
export async function getDashboardStats(userId: string) {
  const supabase = await createClient();

  // Get reports count
  const { count: reportsCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Active courses removed - focus on analysis only

  // Get pending requests count
  const { count: pendingRequestsCount } = await supabase
    .from("analysis_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending");

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    totalReports: reportsCount || 0,
    pendingRequests: pendingRequestsCount || 0,
    recentActivity: recentActivity || null,
  };
}

/**
 * Search across dashboard content
 */
export async function searchDashboardContent(userId: string, query: string) {
  const supabase = await createClient();

  const searchTerm = `%${query}%`;
  const queryLower = query.toLowerCase();

  // Search reports
  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, description, created_at, type")
    .eq("user_id", userId)
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .limit(5);

  // Search indicators from indicator-tooltips
  const { INDICATOR_TOOLTIPS } = await import('@/lib/data/indicator-tooltips');
  const indicators = Object.values(INDICATOR_TOOLTIPS)
    .filter(indicator => {
      const nameMatch = indicator.name.toLowerCase().includes(queryLower);
      const descMatch = indicator.description.toLowerCase().includes(queryLower);
      const howToUseMatch = indicator.howToUse.toLowerCase().includes(queryLower);
      return nameMatch || descMatch || howToUseMatch;
    })
    .slice(0, 5)
    .map(indicator => ({
      id: indicator.id,
      name: indicator.name,
      description: indicator.description,
      howToUse: indicator.howToUse,
    }));

  // Search modules
  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, description, href, icon")
    .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .limit(5);

  return {
    reports: reports || [],
    indicators: indicators || [],
    modules: modules || [],
  };
}

/**
 * Admin: Get all activities
 */
export async function getAllActivities(limit = 50, offset = 0, filter?: string) {
  let query = supabaseAdmin
    .from("user_activities")
    .select(
      `
      *,
      profiles!user_activities_user_id_fkey (
        display_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filter && filter !== "all") {
    query = query.eq("type", filter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching all activities:", error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Admin: Get all course progress
 */
export async function getAllCourseProgress(limit = 50, offset = 0) {
  const { data, error } = await supabaseAdmin
    .from("course_progress")
    .select(
      `
      *,
      courses (
        id,
        title,
        slug
      ),
      profiles!course_progress_user_id_fkey (
        display_name,
        email
      )
    `
    )
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching all course progress:", error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

/**
 * Admin: Get all users with stats
 */
export async function getAllUsersWithStats(limit = 50, offset = 0) {
  const { data: users, error: usersError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (usersError) {
    return { data: [], error: usersError };
  }

  // Get stats for each user
  const usersWithStats = await Promise.all(
    (users || []).map(async (user: { id: string; [key: string]: any }) => {
      const [reportsCount, coursesCount, activitiesCount] = await Promise.all([
        supabaseAdmin
          .from("reports")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabaseAdmin
          .from("course_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabaseAdmin
          .from("user_activities")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      return {
        ...user,
        stats: {
          reports: reportsCount.count || 0,
          courses: coursesCount.count || 0,
          activities: activitiesCount.count || 0,
        },
      };
    })
  );

  return { data: usersWithStats, error: null };
}

/**
 * Create activity (user or admin)
 */
export async function createActivity(
  activityData: {
    user_id: string;
    type: string;
    title: string;
    description: string;
    metadata?: any;
  },
  isAdmin = false
) {
  const supabase = isAdmin ? supabaseAdmin : await createClient();

  const { data, error } = await supabase
    .from("user_activities")
    .insert(activityData)
    .select()
    .single();

  if (error) {
    console.error("Error creating activity:", error);
    return { data: null, error };
  }


  return { data, error: null };
}

/**
 * Admin: Update course progress
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  progress: number,
  completedLessons: number
) {
  const { data, error } = await supabaseAdmin
    .from("course_progress")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        progress,
        completed_lessons: completedLessons,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,course_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error updating course progress:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get modules
 */
export async function getModules(priority?: "primary" | "secondary") {
  const supabase = await createClient();

  let query = supabase
    .from("modules")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (priority) {
    query = query.eq("priority", priority);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching modules:", error);
    return { data: [], error };
  }

  return { data: (data || []) as Module[], error: null };
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return { data: [], error };
  }

  // Normalizza i dati: usa item_id_string se disponibile, altrimenti item_id
  const normalized = (data || []).map((f: any) => ({
    ...f,
    item_id: f.item_id_string || f.item_id,
  }));

  return { data: normalized as Favorite[], error: null };
}

/**
 * Add favorite
 */
export async function addFavorite(
  userId: string,
  favorite: Omit<Favorite, "id" | "added_at">
) {
  const supabase = await createClient();

  // Determina se item_id è UUID o stringa
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    favorite.item_id || ""
  );

  const insertData: any = {
    user_id: userId,
    item_type: favorite.item_type,
    title: favorite.title,
    description: favorite.description,
    href: favorite.href,
    icon: favorite.icon,
    metadata: favorite.metadata || {},
  };

  // Usa item_id_string per stringhe, item_id per UUID
  if (isUUID) {
    insertData.item_id = favorite.item_id;
  } else {
    insertData.item_id_string = favorite.item_id;
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error adding favorite:", error);
    return { data: null, error };
  }

  // Normalizza la risposta
  const normalized = {
    ...data,
    item_id: data.item_id_string || data.item_id,
  };

  return { data: normalized as Favorite, error: null };
}

/**
 * Remove favorite
 */
export async function removeFavorite(userId: string, favoriteId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error removing favorite:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Check if item is favorite
 */
export async function isFavorite(
  userId: string,
  itemId: string,
  itemType: string
) {
  const supabase = await createClient();

  // Determina se item_id è UUID o stringa
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    itemId
  );

  let query = supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("item_type", itemType);

  // Cerca in item_id o item_id_string a seconda del tipo
  if (isUUID) {
    query = query.eq("item_id", itemId);
  } else {
    query = query.eq("item_id_string", itemId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error checking favorite:", error);
    return { isFavorite: false, error };
  }

  return { isFavorite: !!data, error: null };
}
