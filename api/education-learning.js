/**
 * Education Learning API - Advanced Features
 * Spaced Repetition, Retrieval Practice, Adaptive Learning
 * Best Practice 2025
 */

import { getServiceSupabase } from "./_lib/supabase.js";

const supabase = getServiceSupabase();

/**
 * Save spaced repetition review result
 * POST /api/education?action=save-spaced-repetition
 */
export async function saveSpacedRepetitionReview(req, res) {
  try {
    const { item_id, quality, review_duration_seconds } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!item_id || quality === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get current item data
    const { data: item, error: itemError } = await supabase
      .from("spaced_repetition_items")
      .select("*")
      .eq("id", item_id)
      .eq("user_id", user_id)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Calculate next review using SM-2 algorithm
    const { data: sm2Result, error: sm2Error } = await supabase.rpc("calculate_next_review_sm2", {
      p_quality: quality,
      p_repetitions: item.repetitions || 0,
      p_ease_factor: item.ease_factor || 2.5,
      p_interval_days: item.interval_days || 0,
    });

    if (sm2Error) {
      console.error("SM-2 calculation error:", sm2Error);
      return res.status(500).json({ error: "Failed to calculate next review" });
    }

    const nextReview = sm2Result[0];

    // Update item with new parameters
    const updateData = {
      repetitions: nextReview.new_repetitions,
      ease_factor: nextReview.new_ease_factor,
      interval_days: nextReview.new_interval_days,
      next_review_date: nextReview.next_review_date,
      last_review_date: new Date().toISOString(),
      total_reviews: (item.total_reviews || 0) + 1,
      correct_reviews: quality >= 3 ? (item.correct_reviews || 0) + 1 : (item.correct_reviews || 0),
      average_quality: calculateAverageQuality(item.average_quality, item.total_reviews || 0, quality),
    };

    const { error: updateError } = await supabase
      .from("spaced_repetition_items")
      .update(updateData)
      .eq("id", item_id)
      .eq("user_id", user_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Failed to update item" });
    }

    // Save review record
    const { error: reviewError } = await supabase
      .from("spaced_repetition_reviews")
      .insert({
        item_id: item_id,
        user_id: user_id,
        quality: quality,
        review_duration_seconds: review_duration_seconds || null,
        new_repetitions: nextReview.new_repetitions,
        new_ease_factor: nextReview.new_ease_factor,
        new_interval_days: nextReview.new_interval_days,
        new_next_review_date: nextReview.next_review_date,
        device_type: req.headers["user-agent"]?.includes("Mobile") ? "mobile" : "desktop",
        session_id: req.body.session_id || null,
      });

    if (reviewError) {
      console.error("Review save error:", reviewError);
      // Don't fail if review record fails, item update succeeded
    }

    return res.json({
      success: true,
      item: {
        id: item_id,
        ...updateData,
      },
      next_review: nextReview.next_review_date,
    });
  } catch (error) {
    console.error("Error in saveSpacedRepetitionReview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get items due for review
 * GET /api/education?action=get-due-flashcards
 */
export async function getDueFlashcards(req, res) {
  try {
    const user_id = req.user?.id;
    const limit = parseInt(req.query.limit) || 50;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get due items using function
    const { data: items, error } = await supabase.rpc("get_due_items", {
      p_user_id: user_id,
      p_limit: limit,
    });

    if (error) {
      console.error("Error getting due items:", error);
      return res.status(500).json({ error: "Failed to get due items" });
    }

    return res.json({
      success: true,
      items: items || [],
      count: items?.length || 0,
    });
  } catch (error) {
    console.error("Error in getDueFlashcards:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Create spaced repetition item
 * POST /api/education?action=create-spaced-repetition-item
 */
export async function createSpacedRepetitionItem(req, res) {
  try {
    const { content, item_type, module_id, lesson_id, question, answer, hint, explanation } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!content || !item_type || !module_id || !lesson_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const itemData = {
      user_id: user_id,
      item_type: item_type,
      module_id: module_id,
      lesson_id: lesson_id,
      content: content,
      question: question || content,
      answer: answer || content,
      hint: hint || null,
      explanation: explanation || null,
      next_review_date: new Date().toISOString(), // Review immediately
    };

    const { data: item, error } = await supabase
      .from("spaced_repetition_items")
      .insert(itemData)
      .select()
      .single();

    if (error) {
      console.error("Error creating item:", error);
      return res.status(500).json({ error: "Failed to create item" });
    }

    return res.json({
      success: true,
      item: item,
    });
  } catch (error) {
    console.error("Error in createSpacedRepetitionItem:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Update mastery score (adaptive learning)
 * POST /api/education?action=update-mastery
 */
export async function updateMastery(req, res) {
  try {
    const { module_id, lesson_id, score, total_questions, correct_answers, response_time_seconds } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!module_id || !lesson_id || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get or create progress record
    const { data: existing } = await supabase
      .from("adaptive_learning_progress")
      .select("*")
      .eq("user_id", user_id)
      .eq("lesson_id", lesson_id)
      .single();

    let progressData;

    if (existing) {
      // Update existing
      const newTotalAttempts = (existing.total_attempts || 0) + 1;
      const newCorrect = (existing.correct_answers || 0) + (correct_answers || 0);
      const newIncorrect = (existing.incorrect_answers || 0) + ((total_questions || 0) - (correct_answers || 0));

      // Calculate mastery score (weighted average)
      const masteryScore = calculateMasteryScore(
        existing.mastery_score || 0,
        newTotalAttempts - 1,
        score,
        1
      );

      // Adaptive difficulty: adjust based on performance
      let newDifficulty = existing.difficulty_level || 1;
      if (score >= 90 && existing.difficulty_level < 5) {
        newDifficulty = Math.min(5, existing.difficulty_level + 1);
      } else if (score < 60 && existing.difficulty_level > 1) {
        newDifficulty = Math.max(1, existing.difficulty_level - 1);
      }

      progressData = {
        mastery_score: masteryScore,
        difficulty_level: newDifficulty,
        total_attempts: newTotalAttempts,
        correct_answers: newCorrect,
        incorrect_answers: newIncorrect,
        average_response_time_seconds: calculateAverageTime(
          existing.average_response_time_seconds,
          existing.total_attempts || 0,
          response_time_seconds
        ),
        last_attempt_date: new Date().toISOString(),
        mastery_achieved_date: masteryScore >= (existing.mastery_threshold || 80) && !existing.mastery_achieved_date
          ? new Date().toISOString()
          : existing.mastery_achieved_date,
      };

      const { data: updated, error: updateError } = await supabase
        .from("adaptive_learning_progress")
        .update(progressData)
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        return res.status(500).json({ error: "Failed to update mastery" });
      }

      return res.json({
        success: true,
        progress: updated,
        mastery_achieved: masteryScore >= (existing.mastery_threshold || 80),
      });
    } else {
      // Create new
      progressData = {
        user_id: user_id,
        module_id: module_id,
        lesson_id: lesson_id,
        mastery_score: score,
        difficulty_level: 1,
        total_attempts: 1,
        correct_answers: correct_answers || 0,
        incorrect_answers: (total_questions || 0) - (correct_answers || 0),
        average_response_time_seconds: response_time_seconds || null,
        first_attempt_date: new Date().toISOString(),
        last_attempt_date: new Date().toISOString(),
        mastery_achieved_date: score >= 80 ? new Date().toISOString() : null,
      };

      const { data: created, error: createError } = await supabase
        .from("adaptive_learning_progress")
        .insert(progressData)
        .select()
        .single();

      if (createError) {
        console.error("Create error:", createError);
        return res.status(500).json({ error: "Failed to create mastery record" });
      }

      return res.json({
        success: true,
        progress: created,
        mastery_achieved: score >= 80,
      });
    }
  } catch (error) {
    console.error("Error in updateMastery:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get adaptive difficulty for lesson
 * GET /api/education?action=get-adaptive-difficulty
 */
export async function getAdaptiveDifficulty(req, res) {
  try {
    const { module_id, lesson_id } = req.query;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!module_id || !lesson_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: progress, error } = await supabase
      .from("adaptive_learning_progress")
      .select("*")
      .eq("user_id", user_id)
      .eq("module_id", module_id)
      .eq("lesson_id", lesson_id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found, which is OK
      console.error("Error getting progress:", error);
      return res.status(500).json({ error: "Failed to get progress" });
    }

    return res.json({
      success: true,
      progress: progress || {
        mastery_score: 0,
        difficulty_level: 1,
        mastery_threshold: 80,
        total_attempts: 0,
      },
    });
  } catch (error) {
    console.error("Error in getAdaptiveDifficulty:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper functions

function calculateAverageQuality(currentAverage, totalReviews, newQuality) {
  if (totalReviews === 0) {
    return newQuality;
  }
  return ((currentAverage * totalReviews) + newQuality) / (totalReviews + 1);
}

function calculateMasteryScore(currentMastery, previousAttempts, newScore, weight = 1) {
  if (previousAttempts === 0) {
    return newScore;
  }
  // Weighted average: recent attempts count more
  const totalWeight = previousAttempts + weight;
  return ((currentMastery * previousAttempts) + (newScore * weight)) / totalWeight;
}

function calculateAverageTime(currentAverage, previousAttempts, newTime) {
  if (!newTime) return currentAverage;
  if (previousAttempts === 0) {
    return newTime;
  }
  return ((currentAverage * previousAttempts) + newTime) / (previousAttempts + 1);
}

