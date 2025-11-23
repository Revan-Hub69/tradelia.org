/**
 * Education System API
 * Sistema formativo con gamification per retail
 * Best Practice Accademica 2025
 */

import { getServiceSupabase } from "./_lib/supabase.js";
import { safeLog } from "../assets/js/dashboard/security-utils.js";

const supabase = getServiceSupabase();

/**
 * Get all active education modules
 */
export async function getModules(req, res) {
  try {
    const { data, error } = await supabase
      .from("education_modules")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) throw error;

    res.json({ success: true, modules: data || [] });
  } catch (error) {
    safeLog("error", "[Education] Errore getModules:", error);
    res.status(500).json({ success: false, error: "Errore caricamento moduli" });
  }
}

/**
 * Get module details with lessons
 */
export async function getModule(req, res) {
  try {
    const { moduleId } = req.query;

    if (!moduleId) {
      return res.status(400).json({ success: false, error: "moduleId richiesto" });
    }

    // Get module
    const { data: module, error: moduleError } = await supabase
      .from("education_modules")
      .select("*")
      .eq("id", moduleId)
      .eq("is_active", true)
      .single();

    if (moduleError) throw moduleError;
    if (!module) {
      return res.status(404).json({ success: false, error: "Modulo non trovato" });
    }

    // Get lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from("education_lessons")
      .select("*")
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (lessonsError) throw lessonsError;

    // Get user progress if authenticated
    let userProgress = null;
    if (req.user?.id) {
      const { data: progress } = await supabase
        .from("education_user_progress")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("module_id", moduleId)
        .single();

      userProgress = progress;
    }

    res.json({
      success: true,
      module: {
        ...module,
        lessons: lessons || [],
        userProgress,
      },
    });
  } catch (error) {
    safeLog("error", "[Education] Errore getModule:", error);
    res.status(500).json({ success: false, error: "Errore caricamento modulo" });
  }
}

/**
 * Get lesson details
 */
export async function getLesson(req, res) {
  try {
    const { lessonId } = req.query;

    if (!lessonId) {
      return res.status(400).json({ success: false, error: "lessonId richiesto" });
    }

    const { data: lesson, error } = await supabase
      .from("education_lessons")
      .select("*, education_modules(*)")
      .eq("id", lessonId)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lezione non trovata" });
    }

    // Get user progress if authenticated
    let userProgress = null;
    if (req.user?.id) {
      const { data: progress } = await supabase
        .from("education_user_lesson_progress")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("lesson_id", lessonId)
        .single();

      userProgress = progress;
    }

    res.json({
      success: true,
      lesson: {
        ...lesson,
        userProgress,
      },
    });
  } catch (error) {
    safeLog("error", "[Education] Errore getLesson:", error);
    res.status(500).json({ success: false, error: "Errore caricamento lezione" });
  }
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { lessonId, status, timeSpentMinutes } = req.body;

    if (!lessonId || !status) {
      return res.status(400).json({ success: false, error: "lessonId e status richiesti" });
    }

    const progressData = {
      user_id: req.user.id,
      lesson_id: lessonId,
      status,
      last_accessed_at: new Date().toISOString(),
    };

    if (status === "in_progress" && !progressData.started_at) {
      progressData.started_at = new Date().toISOString();
    }

    if (status === "completed") {
      progressData.completed_at = new Date().toISOString();
    }

    if (timeSpentMinutes) {
      progressData.time_spent_minutes = timeSpentMinutes;
    }

    const { data, error } = await supabase
      .from("education_user_lesson_progress")
      .upsert(progressData, { onConflict: "user_id,lesson_id" })
      .select()
      .single();

    if (error) throw error;

    // Update module progress
    const { data: lesson } = await supabase
      .from("education_lessons")
      .select("module_id")
      .eq("id", lessonId)
      .single();

    if (lesson) {
      // Calculate module progress
      const { data: progressPct } = await supabase.rpc("calculate_module_progress", {
        p_user_id: req.user.id,
        p_module_id: lesson.module_id,
      });

      // Update module progress
      await supabase
        .from("education_user_progress")
        .upsert(
          {
            user_id: req.user.id,
            module_id: lesson.module_id,
            progress_percentage: progressPct || 0,
            status: progressPct === 100 ? "completed" : "in_progress",
            last_accessed_at: new Date().toISOString(),
            ...(progressPct === 100 && { completed_at: new Date().toISOString() }),
          },
          { onConflict: "user_id,module_id" }
        );

      // Update user stats
      await supabase.rpc("update_user_education_stats", { p_user_id: req.user.id });
    }

    res.json({ success: true, progress: data });
  } catch (error) {
    safeLog("error", "[Education] Errore updateLessonProgress:", error);
    res.status(500).json({ success: false, error: "Errore aggiornamento progresso" });
  }
}

/**
 * Get test details (without correct answers)
 */
export async function getTest(req, res) {
  try {
    const { testId } = req.query;

    if (!testId) {
      return res.status(400).json({ success: false, error: "testId richiesto" });
    }

    const { data: test, error: testError } = await supabase
      .from("education_tests")
      .select("*")
      .eq("id", testId)
      .eq("is_active", true)
      .single();

    if (testError) throw testError;
    if (!test) {
      return res.status(404).json({ success: false, error: "Test non trovato" });
    }

    // Get questions with options (but hide is_correct in response)
    const { data: questions, error: questionsError } = await supabase
      .from("education_questions")
      .select(`
        id,
        question_text,
        question_type,
        order_index,
        points,
        bloom_level,
        education_question_options (
          id,
          option_text,
          order_index
        )
      `)
      .eq("test_id", testId)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (questionsError) throw questionsError;

    // Get user attempts if authenticated
    let userAttempts = [];
    if (req.user?.id) {
      const { data: attempts } = await supabase
        .from("education_user_test_attempts")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("test_id", testId)
        .order("attempt_number", { ascending: false });

      userAttempts = attempts || [];
    }

    res.json({
      success: true,
      test: {
        ...test,
        questions: questions || [],
        userAttempts,
      },
    });
  } catch (error) {
    safeLog("error", "[Education] Errore getTest:", error);
    res.status(500).json({ success: false, error: "Errore caricamento test" });
  }
}

/**
 * Submit test attempt
 */
export async function submitTest(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { testId, answers, timeSpentSeconds } = req.body;

    if (!testId || !answers) {
      return res.status(400).json({ success: false, error: "testId e answers richiesti" });
    }

    // Get test details
    const { data: test, error: testError } = await supabase
      .from("education_tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (testError) throw testError;

    // Get user's previous attempts
    const { data: previousAttempts } = await supabase
      .from("education_user_test_attempts")
      .select("attempt_number")
      .eq("user_id", req.user.id)
      .eq("test_id", testId)
      .order("attempt_number", { ascending: false });

    const nextAttemptNumber = previousAttempts?.length > 0 
      ? previousAttempts[0].attempt_number + 1 
      : 1;

    // Check max attempts
    if (test.max_attempts && nextAttemptNumber > test.max_attempts) {
      return res.status(400).json({ 
        success: false, 
        error: `Hai raggiunto il numero massimo di tentativi (${test.max_attempts})` 
      });
    }

    // Get correct answers
    const { data: questions } = await supabase
      .from("education_questions")
      .select(`
        id,
        points,
        education_question_options (
          id,
          is_correct
        )
      `)
      .eq("test_id", testId)
      .eq("is_active", true);

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedAnswers = {};

    questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const correctOptions = question.education_question_options.filter(opt => opt.is_correct);

      if (userAnswer) {
        // Check if answer is correct
        let isCorrect = false;
        if (question.education_question_options.some(opt => opt.id === userAnswer.option_id)) {
          const selectedOption = question.education_question_options.find(opt => opt.id === userAnswer.option_id);
          isCorrect = selectedOption.is_correct;
        }

        if (isCorrect) {
          earnedPoints += question.points;
        }

        detailedAnswers[question.id] = {
          option_id: userAnswer.option_id,
          is_correct: isCorrect,
        };
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= test.passing_score;

    // Save attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("education_user_test_attempts")
      .insert({
        user_id: req.user.id,
        test_id: testId,
        attempt_number: nextAttemptNumber,
        score,
        passed,
        time_spent_seconds: timeSpentSeconds,
        answers: detailedAnswers,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // If passed, unlock next module (if applicable)
    if (passed) {
      const { data: module } = await supabase
        .from("education_tests")
        .select("education_modules(*)")
        .eq("id", testId)
        .single();

      if (module?.education_modules) {
        // Check if this is the final test of the module
        const { data: allTests } = await supabase
          .from("education_tests")
          .select("id")
          .eq("module_id", module.education_modules.id)
          .eq("is_active", true);

        const { data: passedTests } = await supabase
          .from("education_user_test_attempts")
          .select("test_id")
          .eq("user_id", req.user.id)
          .eq("passed", true)
          .in("test_id", allTests.map(t => t.id));

        // If all tests passed, mark module as completed
        if (passedTests?.length === allTests?.length) {
          await supabase
            .from("education_user_progress")
            .upsert({
              user_id: req.user.id,
              module_id: module.education_modules.id,
              status: "completed",
              progress_percentage: 100,
              completed_at: new Date().toISOString(),
            }, { onConflict: "user_id,module_id" });
        }
      }

      // Award badges and update stats
      await supabase.rpc("update_user_education_stats", { p_user_id: req.user.id });
      
      // Check for perfect score badge
      if (score === 100) {
        // Award "Perfetto" badge if not already earned
        const { data: perfectBadge } = await supabase
          .from("education_badges")
          .select("id")
          .eq("badge_type", "test_perfect")
          .single();

        if (perfectBadge) {
          await supabase
            .from("education_user_badges")
            .insert({
              user_id: req.user.id,
              badge_id: perfectBadge.id,
            })
            .onConflict("user_id,badge_id")
            .ignore();
        }
      }
    }

    res.json({
      success: true,
      attempt: {
        ...attempt,
        // Include correct answers for review
        correctAnswers: questions.reduce((acc, q) => {
          acc[q.id] = q.education_question_options
            .filter(opt => opt.is_correct)
            .map(opt => opt.id);
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    safeLog("error", "[Education] Errore submitTest:", error);
    res.status(500).json({ success: false, error: "Errore invio test" });
  }
}

/**
 * Get user progress overview
 */
export async function getUserProgress(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    // Get all modules with user progress
    const { data: modules } = await supabase
      .from("education_modules")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    const { data: userProgress } = await supabase
      .from("education_user_progress")
      .select("*")
      .eq("user_id", req.user.id);

    // Get user stats
    const { data: userStats } = await supabase
      .from("education_user_stats")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    // Get user badges
    const { data: userBadges } = await supabase
      .from("education_user_badges")
      .select("*, education_badges(*)")
      .eq("user_id", req.user.id);

    // Map modules with progress
    const modulesWithProgress = modules.map((module) => {
      const progress = userProgress?.find((p) => p.module_id === module.id);
      return {
        ...module,
        userProgress: progress || {
          status: "not_started",
          progress_percentage: 0,
        },
        canAccess: !module.requires_previous_module || 
          (progress?.status === "completed") ||
          (userProgress?.some(p => p.module_id === module.previous_module_id && p.status === "completed")),
      };
    });

    res.json({
      success: true,
      progress: {
        modules: modulesWithProgress,
        stats: userStats || {
          total_points: 0,
          current_level: 1,
          modules_completed: 0,
        },
        badges: userBadges?.map(ub => ub.education_badges) || [],
      },
    });
  } catch (error) {
    safeLog("error", "[Education] Errore getUserProgress:", error);
    res.status(500).json({ success: false, error: "Errore caricamento progresso" });
  }
}

/**
 * Get pathways (specialized paths)
 */
export async function getPathways(req, res) {
  try {
    const { data: pathways, error } = await supabase
      .from("education_pathways")
      .select("*")
      .eq("is_active", true)
      .order("title", { ascending: true });

    if (error) throw error;

    // Get user progress if authenticated
    let userPathwayProgress = [];
    if (req.user?.id) {
      const { data: progress } = await supabase
        .from("education_user_pathway_progress")
        .select("*")
        .eq("user_id", req.user.id);

      userPathwayProgress = progress || [];
    }

    const pathwaysWithProgress = pathways.map((pathway) => {
      const progress = userPathwayProgress.find((p) => p.pathway_id === pathway.id);
      return {
        ...pathway,
        userProgress: progress || {
          status: "not_started",
          progress_percentage: 0,
        },
      };
    });

    res.json({ success: true, pathways: pathwaysWithProgress });
  } catch (error) {
    safeLog("error", "[Education] Errore getPathways:", error);
    res.status(500).json({ success: false, error: "Errore caricamento percorsi" });
  }
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  const { action } = req.query;

  // Get user from token (if authenticated)
  let user = null;
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    } catch (e) {
      // Not authenticated, continue as guest
    }
  }

  req.user = user;

  switch (action) {
    case "modules":
      return getModules(req, res);
    case "module":
      return getModule(req, res);
    case "lesson":
      return getLesson(req, res);
    case "update-lesson-progress":
      return updateLessonProgress(req, res);
    case "test":
      return getTest(req, res);
    case "submit-test":
      return submitTest(req, res);
    case "user-progress":
      return getUserProgress(req, res);
    case "pathways":
      return getPathways(req, res);
    default:
      return res.status(400).json({ success: false, error: "Azione non valida" });
  }
}
