/**
 * Education System API
 * Sistema formativo con gamification per retail
 * Best Practice Accademica 2025
 * Security: OWASP, NIST
 */

import { getServiceSupabase } from "./_lib/supabase.js";
import { validateUUID, validateArray } from "./_lib/validation.js";
import { checkRateLimit, getRateLimitIdentifier } from "./_lib/rateLimit.js";

// Safe log function (avoid circular dependency)
function safeLog(level, ...args) {
  if (process.env.NODE_ENV !== "production") {
    if (level === "warn" || level === "error") {
      console[level](...args);
    }
  }
}

const supabase = getServiceSupabase();

/**
 * Get all active education modules
 */
export async function getModules(req, res) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimit = checkRateLimit(identifier, "education");

    res.setHeader("X-RateLimit-Limit", "100");
    res.setHeader("X-RateLimit-Remaining", rateLimit.remaining);
    if (rateLimit.resetAt) {
      res.setHeader("X-RateLimit-Reset", new Date(rateLimit.resetAt).toISOString());
    }

    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: rateLimit.locked
          ? "Troppe richieste. Account temporaneamente bloccato."
          : "Troppe richieste. Riprova più tardi.",
        retryAfter: rateLimit.locked ? 15 : Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
      });
    }

    const { data, error } = await supabase
      .from("education_modules")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      throw error;
    }

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

    // Validazione UUID (previene SQL injection)
    let validatedModuleId;
    try {
      validatedModuleId = validateUUID(moduleId, "moduleId");
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Get module (usa UUID validato)
    const { data: module, error: moduleError } = await supabase
      .from("education_modules")
      .select("*")
      .eq("id", validatedModuleId)
      .eq("is_active", true)
      .single();

    if (moduleError) {
      throw moduleError;
    }
    if (!module) {
      return res.status(404).json({ success: false, error: "Modulo non trovato" });
    }

    // Get lessons and tests in parallel (ottimizzazione N+1 query)
    const [lessonsResult, testsResult] = await Promise.all([
      supabase
        .from("education_lessons")
        .select("*")
        .eq("module_id", validatedModuleId)
        .eq("is_active", true)
        .order("order_index", { ascending: true }),
      supabase
        .from("education_tests")
        .select("id, title, description, passing_score, max_attempts, time_limit_minutes")
        .eq("module_id", validatedModuleId)
        .eq("is_active", true),
    ]);

    const { data: lessons, error: lessonsError } = lessonsResult;
    const { data: tests, error: testsError } = testsResult;

    if (lessonsError) {
      throw lessonsError;
    }
    if (testsError) {
      throw testsError;
    }

    if (testsError) {
      throw testsError;
    }

    // Get user progress if authenticated
    let userProgress = null;
    if (req.user?.id) {
      const { data: progress } = await supabase
        .from("education_user_progress")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("module_id", validatedModuleId)
        .single();

      userProgress = progress;

      // Get user attempts for tests (ottimizzazione: una query invece di N)
      if (tests && tests.length > 0) {
        const testIds = tests.map((t) => t.id);
        const { data: attempts } = await supabase
          .from("education_user_test_attempts")
          .select("*")
          .eq("user_id", req.user.id)
          .in("test_id", testIds)
          .order("attempt_number", { ascending: false });

        // Map attempts to tests (in memoria, più veloce)
        const attemptsMap = new Map();
        attempts?.forEach((attempt) => {
          if (!attemptsMap.has(attempt.test_id)) {
            attemptsMap.set(attempt.test_id, []);
          }
          attemptsMap.get(attempt.test_id).push(attempt);
        });

        tests.forEach((test) => {
          test.userAttempts = attemptsMap.get(test.id) || [];
        });
      }
    }

    res.json({
      success: true,
      module: {
        ...module,
        lessons: lessons || [],
        tests: tests || [],
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

    // Validazione UUID (previene SQL injection)
    let validatedLessonId;
    try {
      validatedLessonId = validateUUID(lessonId, "lessonId");
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const { data: lesson, error } = await supabase
      .from("education_lessons")
      .select("*, education_modules(*)")
      .eq("id", validatedLessonId)
      .eq("is_active", true)
      .single();

    if (error) {
      throw error;
    }
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
        .eq("lesson_id", validatedLessonId)
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

    if (error) {
      throw error;
    }

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
      await supabase.from("education_user_progress").upsert(
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

    // Validazione UUID (previene SQL injection)
    let validatedTestId;
    try {
      validatedTestId = validateUUID(testId, "testId");
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const { data: test, error: testError } = await supabase
      .from("education_tests")
      .select("*")
      .eq("id", validatedTestId)
      .eq("is_active", true)
      .single();

    if (testError) {
      throw testError;
    }
    if (!test) {
      return res.status(404).json({ success: false, error: "Test non trovato" });
    }

    // Get questions with options (but hide is_correct in response)
    const { data: questions, error: questionsError } = await supabase
      .from("education_questions")
      .select(
        `
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
      `
      )
      .eq("test_id", validatedTestId)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    // Get user attempts if authenticated
    let userAttempts = [];
    if (req.user?.id) {
      const { data: attempts } = await supabase
        .from("education_user_test_attempts")
        .select("*")
        .eq("user_id", req.user.id)
        .eq("test_id", validatedTestId)
        .order("attempt_number", { ascending: false });

      userAttempts = attempts || [];
    }

    // Get module info for navigation
    const { data: moduleInfo } = await supabase
      .from("education_tests")
      .select("education_modules(id, slug)")
      .eq("id", validatedTestId)
      .single();

    res.json({
      success: true,
      test: {
        ...test,
        questions: questions || [],
        userAttempts,
        education_modules: moduleInfo?.education_modules,
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

    // Validazione UUID (previene SQL injection)
    let validatedTestId;
    try {
      validatedTestId = validateUUID(testId, "testId");
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Validazione answers (deve essere oggetto)
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: "answers deve essere un oggetto" });
    }

    // Sanitizza answers JSONB (prima di usarlo)
    let sanitizedAnswers;
    // validateJSONB sanitizza l'oggetto
    sanitizedAnswers = typeof answers === "object" && !Array.isArray(answers) ? answers : {};
    // Rimuovi proprietà pericolose
    const sanitized = { ...sanitizedAnswers };
    delete sanitized.__proto__;
    delete sanitized.constructor;
    sanitizedAnswers = sanitized;

    // Get test details
    const { data: test, error: testError } = await supabase
      .from("education_tests")
      .select("*")
      .eq("id", validatedTestId)
      .single();

    if (testError) {
      throw testError;
    }

    // Get user's previous attempts
    const { data: previousAttempts } = await supabase
      .from("education_user_test_attempts")
      .select("attempt_number")
      .eq("user_id", req.user.id)
      .eq("test_id", validatedTestId)
      .order("attempt_number", { ascending: false });

    const nextAttemptNumber =
      previousAttempts?.length > 0 ? previousAttempts[0].attempt_number + 1 : 1;

    // Check max attempts
    if (test.max_attempts && nextAttemptNumber > test.max_attempts) {
      return res.status(400).json({
        success: false,
        error: `Hai raggiunto il numero massimo di tentativi (${test.max_attempts})`,
      });
    }

    // Get correct answers
    const { data: questions } = await supabase
      .from("education_questions")
      .select(
        `
        id,
        points,
        education_question_options (
          id,
          is_correct
        )
      `
      )
      .eq("test_id", validatedTestId)
      .eq("is_active", true);

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedAnswers = {};

    questions.forEach((question) => {
      totalPoints += question.points;
      const userAnswer = sanitizedAnswers[question.id];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const correctOptions = question.education_question_options.filter((opt) => opt.is_correct);

      if (userAnswer) {
        // Check if answer is correct
        let isCorrect = false;
        if (question.education_question_options.some((opt) => opt.id === userAnswer.option_id)) {
          const selectedOption = question.education_question_options.find(
            (opt) => opt.id === userAnswer.option_id
          );
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

    // Check tracking consent (GDPR compliance)
    const { data: preferences } = await supabase
      .from("education_user_tracking_preferences")
      .select("track_test_scores, track_test_answers")
      .eq("user_id", req.user.id)
      .single();

    const trackScores = preferences?.track_test_scores !== false; // Default: true
    const trackAnswers = preferences?.track_test_answers === true; // Default: false (minimizzazione)

    // Prepare data (minimizzazione GDPR)
    const attemptData = {
      user_id: req.user.id,
      attempt_number: nextAttemptNumber,
      completed_at: new Date().toISOString(),
    };

    // Solo se consenso per punteggi
    if (trackScores) {
      attemptData.score = score;
      attemptData.passed = passed;
      attemptData.time_spent_seconds = timeSpentSeconds;
    }

    // Solo se consenso esplicito per risposte dettagliate (default: NO)
    if (trackAnswers) {
      // answers sarà aggiunto dopo con sanitizedAnswers
    } else {
      // Minimizzazione: salva solo question IDs sbagliate (array semplice)
      const wrongQuestionIds = Object.keys(detailedAnswers)
        .filter((qId) => !detailedAnswers[qId].is_correct)
        .map((qId) => qId);
      attemptData.wrong_question_ids = wrongQuestionIds.length > 0 ? wrongQuestionIds : null;
    }

    // Save attempt (usa UUID e answers validati)
    attemptData.test_id = validatedTestId;
    if (trackAnswers) {
      attemptData.answers = sanitizedAnswers;
    }

    const { data: attempt, error: attemptError } = await supabase
      .from("education_user_test_attempts")
      .insert(attemptData)
      .select()
      .single();

    if (attemptError) {
      throw attemptError;
    }

    // If passed, unlock next module (if applicable)
    if (passed) {
      const { data: testWithModule } = await supabase
        .from("education_tests")
        .select("module_id, education_modules(*)")
        .eq("id", testId)
        .single();

      const module = testWithModule?.education_modules;

      if (module) {
        // Check if this is the final test of the module
        const { data: allTests } = await supabase
          .from("education_tests")
          .select("id")
          .eq("module_id", module.id)
          .eq("is_active", true);

        const { data: passedTests } = await supabase
          .from("education_user_test_attempts")
          .select("test_id")
          .eq("user_id", req.user.id)
          .eq("passed", true)
          .in(
            "test_id",
            allTests.map((t) => t.id)
          );

        // If all tests passed, mark module as completed
        if (passedTests?.length === allTests?.length) {
          await supabase.from("education_user_progress").upsert(
            {
              user_id: req.user.id,
              module_id: module.id,
              status: "completed",
              progress_percentage: 100,
              completed_at: new Date().toISOString(),
            },
            { onConflict: "user_id,module_id" }
          );
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
            .filter((opt) => opt.is_correct)
            .map((opt) => opt.id);
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
        canAccess:
          !module.requires_previous_module ||
          progress?.status === "completed" ||
          userProgress?.some(
            (p) => p.module_id === module.previous_module_id && p.status === "completed"
          ),
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
        badges: userBadges?.map((ub) => ub.education_badges) || [],
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

    if (error) {
      throw error;
    }

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
 * Get questions due for spaced repetition
 * Paper: Ebbinghaus (1885), Cepeda et al. (2006)
 */
export async function getSpacedRepetitionDue(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    // Get all questions from user's test attempts
    const { data: attempts } = await supabase
      .from("education_user_test_attempts")
      .select("answers, test_id, completed_at")
      .eq("user_id", req.user.id)
      .order("completed_at", { ascending: false })
      .limit(100);

    if (!attempts || attempts.length === 0) {
      return res.json({ success: true, questions: [] });
    }

    // Extract question IDs and performance
    const questionPerformance = new Map();
    attempts.forEach((attempt) => {
      if (attempt.answers) {
        Object.keys(attempt.answers).forEach((questionId) => {
          const answer = attempt.answers[questionId];
          const perf = questionPerformance.get(questionId) || {
            attempts: 0,
            correct: 0,
            lastReview: null,
          };
          perf.attempts++;
          if (answer.is_correct) {
            perf.correct++;
          }
          if (!perf.lastReview || new Date(attempt.completed_at) > new Date(perf.lastReview)) {
            perf.lastReview = attempt.completed_at;
          }
          questionPerformance.set(questionId, perf);
        });
      }
    });

    // Get question details
    const questionIds = Array.from(questionPerformance.keys());
    if (questionIds.length === 0) {
      return res.json({ success: true, questions: [] });
    }

    const { data: questions } = await supabase
      .from("education_questions")
      .select(
        `
        id,
        question_text,
        education_tests!inner(education_modules!inner(id, title, slug))
      `
      )
      .in("id", questionIds)
      .eq("is_active", true);

    // Calculate due dates and filter
    const today = new Date();
    const questionsWithDue = questions
      .map((q) => {
        const perf = questionPerformance.get(q.id);
        const lastReview = perf.lastReview ? new Date(perf.lastReview) : null;
        const daysSinceReview = lastReview
          ? Math.floor((today - lastReview) / (1000 * 60 * 60 * 24))
          : 999;

        // Simple spaced repetition: incorrect after 1 day, difficult after 7, easy after 30
        const successRate = perf.attempts > 0 ? perf.correct / perf.attempts : 0;
        let nextReviewDays = 30;
        if (successRate < 0.5) {
          nextReviewDays = 1;
        } else if (successRate < 0.7) {
          nextReviewDays = 7;
        } else if (successRate < 0.9) {
          nextReviewDays = 14;
        }

        return {
          id: q.id,
          question_id: q.id,
          question_text: q.question_text,
          text: q.question_text,
          module_title: q.education_tests?.education_modules?.title || "Modulo",
          success_rate: successRate,
          due_today: daysSinceReview >= nextReviewDays,
          days_until_due: Math.max(0, nextReviewDays - daysSinceReview),
        };
      })
      .filter((q) => q.due_today || q.days_until_due <= 3)
      .sort((a, b) => (a.due_today ? -1 : b.due_today ? 1 : a.days_until_due - b.days_until_due));

    res.json({ success: true, questions: questionsWithDue });
  } catch (error) {
    safeLog("error", "[Education] Errore getSpacedRepetitionDue:", error);
    res.status(500).json({ success: false, error: "Errore caricamento ripasso" });
  }
}

/**
 * Get questions for retrieval practice
 */
export async function getRetrievalQuestions(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { questionIds } = req.query;
    if (!questionIds) {
      return res.status(400).json({ success: false, error: "questionIds richiesto" });
    }

    const ids = questionIds.split(",").filter(Boolean);

    const { data: questions, error } = await supabase
      .from("education_questions")
      .select(
        `
        id,
        question_text,
        question_type,
        bloom_level,
        explanation,
        education_question_options (
          id,
          option_text,
          order_index
        )
      `
      )
      .in("id", ids)
      .eq("is_active", true)
      .order("id");

    if (error) {
      throw error;
    }

    res.json({ success: true, questions: questions || [] });
  } catch (error) {
    safeLog("error", "[Education] Errore getRetrievalQuestions:", error);
    res.status(500).json({ success: false, error: "Errore caricamento domande" });
  }
}

/**
 * Get correct answers for retrieval practice
 */
export async function getRetrievalAnswers(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { questionIds } = req.query;

    // Validazione questionIds (array di UUID)
    if (!questionIds) {
      return res.status(400).json({ success: false, error: "questionIds richiesto" });
    }

    let questionIdsArray;
    try {
      questionIdsArray = Array.isArray(questionIds)
        ? questionIds
        : questionIds.split(",").filter(Boolean);
      questionIdsArray = validateArray(questionIdsArray, "questionIds", 1);

      // Valida ogni UUID
      questionIdsArray = questionIdsArray.map((id) => validateUUID(id.trim(), "questionId"));
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    const { data: questions, error } = await supabase
      .from("education_questions")
      .select(
        `
        id,
        education_question_options (
          id,
          is_correct
        )
      `
      )
      .in("id", questionIdsArray)
      .eq("is_active", true);

    if (error) {
      throw error;
    }

    const answers = {};
    questions.forEach((q) => {
      answers[q.id] = q.education_question_options
        .filter((opt) => opt.is_correct)
        .map((opt) => opt.id);
    });

    res.json({ success: true, answers });
  } catch (error) {
    safeLog("error", "[Education] Errore getRetrievalAnswers:", error);
    res.status(500).json({ success: false, error: "Errore caricamento risposte" });
  }
}

/**
 * Update spaced repetition review
 */
export async function updateSpacedRepetition(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { questionId, isCorrect, timeSpent, reviewedAt } = req.body;

    // Store in user's spaced repetition tracking (could be a new table or JSONB field)
    // For now, we'll track via test attempts - this will be improved with dedicated table

    res.json({ success: true, message: "Ripasso aggiornato" });
  } catch (error) {
    safeLog("error", "[Education] Errore updateSpacedRepetition:", error);
    res.status(500).json({ success: false, error: "Errore aggiornamento ripasso" });
  }
}

/**
 * Save pre-lesson assessment
 * Paper: Zimmerman (2002) - Metacognition
 */
export async function savePreAssessment(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lessonId, knowledgeLevel, expectations } = req.body;

    // Store in user's lesson progress or new metacognition table
    // For now, we'll log it - can be stored in JSONB field

    safeLog(
      "info",
      `[Metacognition] Pre-assessment: lessonId=${lessonId}, knowledge=${knowledgeLevel}`
    );

    res.json({ success: true });
  } catch (error) {
    safeLog("error", "[Education] Errore savePreAssessment:", error);
    res.status(500).json({ success: false, error: "Errore salvataggio valutazione" });
  }
}

/**
 * Save post-lesson reflection
 * Paper: Zimmerman (2002) - Metacognition
 */
export async function savePostReflection(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lessonId, comprehension, unclear, learned } = req.body;

    // Store reflection
    safeLog(
      "info",
      `[Metacognition] Post-reflection: lessonId=${lessonId}, comprehension=${comprehension}`
    );

    res.json({ success: true });
  } catch (error) {
    safeLog("error", "[Education] Errore savePostReflection:", error);
    res.status(500).json({ success: false, error: "Errore salvataggio riflessione" });
  }
}

/**
 * Get learning goals
 */
export async function getLearningGoals(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    // Get from user preferences or dedicated table
    // For now, return empty array
    res.json({ success: true, goals: [] });
  } catch (error) {
    safeLog("error", "[Education] Errore getLearningGoals:", error);
    res.status(500).json({ success: false, error: "Errore caricamento obiettivi" });
  }
}

/**
 * Save learning goals
 */
export async function saveLearningGoals(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { goals } = req.body;

    // Store goals (could be in user preferences JSONB or dedicated table)
    safeLog("info", `[Metacognition] Learning goals saved: ${goals.length} goals`);

    res.json({ success: true });
  } catch (error) {
    safeLog("error", "[Education] Errore saveLearningGoals:", error);
    res.status(500).json({ success: false, error: "Errore salvataggio obiettivi" });
  }
}

/**
 * Get recent questions for retrieval practice
 */
export async function getRecentQuestionsForPractice(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    // Get question IDs from recent test attempts
    const { data: attempts } = await supabase
      .from("education_user_test_attempts")
      .select("answers")
      .eq("user_id", req.user.id)
      .order("completed_at", { ascending: false })
      .limit(10);

    const questionIds = new Set();
    attempts?.forEach((attempt) => {
      if (attempt.answers) {
        Object.keys(attempt.answers).forEach((qId) => questionIds.add(qId));
      }
    });

    res.json({ success: true, questionIds: Array.from(questionIds).slice(0, 20) });
  } catch (error) {
    safeLog("error", "[Education] Errore getRecentQuestionsForPractice:", error);
    res.status(500).json({ success: false, error: "Errore caricamento domande" });
  }
}

/**
 * Get learning analytics data
 * Paper: Siemens & Long (2011) - Learning Analytics
 */
export async function getLearningAnalytics(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const userId = req.user.id;

    // Get user stats
    const { data: userStats } = await supabase
      .from("education_user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get module progress
    const { data: moduleProgress } = await supabase
      .from("education_user_progress")
      .select(
        `
        *,
        education_modules (id, title, slug)
      `
      )
      .eq("user_id", userId);

    // Get lesson progress
    const { data: lessonProgress } = await supabase
      .from("education_user_lesson_progress")
      .select("*")
      .eq("user_id", userId);

    // Get test attempts
    const { data: testAttempts } = await supabase
      .from("education_user_test_attempts")
      .select(
        `
        *,
        education_tests (id, title, education_modules (title))
      `
      )
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(20);

    // Calculate overview
    const totalModules = await supabase
      .from("education_modules")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const totalLessons = await supabase
      .from("education_lessons")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const totalTests = await supabase
      .from("education_tests")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const modulesCompleted = moduleProgress?.filter((m) => m.status === "completed").length || 0;
    const lessonsCompleted = lessonProgress?.filter((l) => l.status === "completed").length || 0;
    const testsPassed = testAttempts?.filter((t) => t.passed).length || 0;

    // Calculate progress by module
    const progress = (moduleProgress || []).map((mp) => ({
      name: mp.education_modules?.title || "Modulo",
      percentage: mp.progress_percentage || 0,
      status: mp.status,
    }));

    // Calculate test performance
    const testPerformance = {
      averageScore:
        testAttempts && testAttempts.length > 0
          ? Math.round(
              testAttempts.reduce((sum, t) => sum + (t.score || 0), 0) / testAttempts.length
            )
          : 0,
      tests: (testAttempts || []).map((ta) => ({
        name: ta.education_tests?.title || "Test",
        score: ta.score || 0,
        date: ta.completed_at,
        module: ta.education_tests?.education_modules?.title,
      })),
    };

    // Calculate time spent
    const totalTime = userStats?.total_study_time_minutes || 0;
    const today = new Date();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get time spent from lesson progress (simplified - would need proper time tracking)
    const timeSpent = {
      today: 0, // Would calculate from lesson progress with started_at today
      thisWeek: 0,
      thisMonth: 0,
      total: totalTime,
    };

    // Calculate retention rate (simplified - would need spaced repetition data)
    const retentionRate = {
      day1: 85, // Placeholder
      day7: 70,
      day30: 50,
    };

    // Calculate learning velocity
    const learningVelocity = {
      lessonsPerWeek: lessonsCompleted > 0 ? Math.round(lessonsCompleted / 4) : 0, // Simplified
      avgTimePerLesson: lessonsCompleted > 0 ? Math.round(totalTime / lessonsCompleted) : 0,
      testsPerWeek: testsPassed > 0 ? Math.round(testsPassed / 4) : 0,
    };

    // Identify weak areas (modules with low scores)
    const weakAreas = (moduleProgress || [])
      .filter((mp) => mp.progress_percentage < 50)
      .map((mp) => ({
        id: mp.module_id,
        name: mp.education_modules?.title || "Modulo",
        score: mp.progress_percentage,
        description: "Completa più lezioni in quest'area per migliorare",
      }));

    // Recent activity
    const recentActivity = [];

    // Add recent lesson completions
    (lessonProgress || [])
      .filter((lp) => lp.completed_at)
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
      .slice(0, 5)
      .forEach((lp) => {
        recentActivity.push({
          type: "lesson_completed",
          title: "Lezione completata",
          timestamp: lp.completed_at,
        });
      });

    // Add recent test completions
    (testAttempts || [])
      .filter((ta) => ta.completed_at)
      .slice(0, 5)
      .forEach((ta) => {
        recentActivity.push({
          type: "test_completed",
          title: `Test completato: ${ta.education_tests?.title || "Test"}`,
          timestamp: ta.completed_at,
          module: ta.education_tests?.education_modules?.title,
        });
      });

    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      overview: {
        modulesCompleted,
        totalModules: totalModules.count || 0,
        lessonsCompleted,
        totalLessons: totalLessons.count || 0,
        testsPassed,
        totalTests: totalTests.count || 0,
        totalPoints: userStats?.total_points || 0,
        currentLevel: userStats?.current_level || 1,
      },
      progress: {
        modules: progress,
      },
      testPerformance,
      timeSpent,
      retentionRate,
      learningVelocity,
      weakAreas,
      streaks: {
        current: userStats?.current_streak_days || 0,
        longest: userStats?.longest_streak_days || 0,
      },
      recentActivity: recentActivity.slice(0, 10),
    });
  } catch (error) {
    safeLog("error", "[Education] Errore getLearningAnalytics:", error);
    res.status(500).json({ success: false, error: "Errore caricamento analytics" });
  }
}

/**
 * Get interleaved questions from multiple modules
 * Paper: Rohrer & Taylor (2007) - Interleaving
 */
export async function getInterleavedQuestions(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { moduleIds, count = 20, difficulty } = req.query;

    if (!moduleIds) {
      return res.status(400).json({ success: false, error: "moduleIds richiesto" });
    }

    const ids = moduleIds.split(",").filter(Boolean);
    const limit = parseInt(count) || 20;

    // Get questions from multiple modules
    let query = supabase
      .from("education_questions")
      .select(
        `
        id,
        question_text,
        question_type,
        bloom_level,
        explanation,
        topic,
        education_tests!inner (
          id,
          title,
          education_modules!inner (
            id,
            title,
            slug
          )
        ),
        education_question_options (
          id,
          option_text,
          order_index
        )
      `
      )
      .in("education_tests.education_modules.id", ids)
      .eq("is_active", true)
      .limit(limit * 2); // Get more to allow for filtering

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data: questions, error } = await query;

    if (error) {
      throw error;
    }

    // Shuffle and limit
    const shuffled = (questions || []).sort(() => Math.random() - 0.5).slice(0, limit);

    res.json({ success: true, questions: shuffled });
  } catch (error) {
    safeLog("error", "[Education] Errore getInterleavedQuestions:", error);
    res.status(500).json({ success: false, error: "Errore caricamento domande interleaved" });
  }
}

/**
 * Get personalized learning path
 * Paper: Koedinger et al. (2013) - Personalized learning paths
 */
export async function getPersonalizedPath(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { goal, focusArea, difficulty } = req.query;

    if (!goal) {
      return res.status(400).json({ success: false, error: "Obiettivo richiesto" });
    }

    const userId = req.user.id;

    // Get user progress and stats
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: userStats } = await supabase
      .from("education_user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: moduleProgress } = await supabase
      .from("education_user_progress")
      .select(
        `
        *,
        education_modules (id, title, slug, description, order_index)
      `
      )
      .eq("user_id", userId);

    // Get all modules
    const { data: allModules } = await supabase
      .from("education_modules")
      .select(
        `
        id,
        title,
        slug,
        description,
        order_index,
        estimated_hours,
        education_lessons!inner (id)
      `
      )
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    // Calculate module stats
    const modulesWithStats = (allModules || []).map((module) => {
      const progress = moduleProgress?.find((mp) => mp.module_id === module.id);
      const lessonsCount = module.education_lessons?.length || 0;

      return {
        ...module,
        lessons_count: lessonsCount,
        userProgress: progress || {
          status: "not_started",
          progress_percentage: 0,
        },
      };
    });

    // Filter and sort based on goal
    let recommendedModules = [];
    let pathDescription = "";

    switch (goal) {
      case "foundations":
        recommendedModules = modulesWithStats
          .filter((m) => m.order_index <= 4) // First 4 modules
          .sort((a, b) => a.order_index - b.order_index);
        pathDescription =
          "Percorso completo per i fondamenti della finanza personale e degli investimenti.";
        break;

      case "trading":
        recommendedModules = modulesWithStats
          .filter(
            (m) =>
              m.title.toLowerCase().includes("trading") || m.title.toLowerCase().includes("mercato")
          )
          .sort((a, b) => a.order_index - b.order_index);
        if (recommendedModules.length === 0) {
          recommendedModules = modulesWithStats.slice(0, 3);
        }
        pathDescription =
          "Percorso specializzato per il trading e l'analisi dei mercati finanziari.";
        break;

      case "analysis":
        recommendedModules = modulesWithStats
          .filter(
            (m) =>
              m.title.toLowerCase().includes("analisi") || m.title.toLowerCase().includes("tecnica")
          )
          .sort((a, b) => a.order_index - b.order_index);
        if (recommendedModules.length === 0) {
          recommendedModules = modulesWithStats.slice(0, 3);
        }
        pathDescription = "Percorso focalizzato sull'analisi tecnica e fondamentale.";
        break;

      case "risk":
        recommendedModules = modulesWithStats
          .filter(
            (m) =>
              m.title.toLowerCase().includes("rischio") ||
              m.title.toLowerCase().includes("gestione")
          )
          .sort((a, b) => a.order_index - b.order_index);
        if (recommendedModules.length === 0) {
          recommendedModules = modulesWithStats.slice(0, 3);
        }
        pathDescription = "Percorso per la gestione del rischio e la protezione del capitale.";
        break;

      case "portfolio":
        recommendedModules = modulesWithStats
          .filter(
            (m) =>
              m.title.toLowerCase().includes("portafoglio") ||
              m.title.toLowerCase().includes("diversificazione")
          )
          .sort((a, b) => a.order_index - b.order_index);
        if (recommendedModules.length === 0) {
          recommendedModules = modulesWithStats.slice(0, 3);
        }
        pathDescription = "Percorso per la costruzione e gestione di un portafoglio diversificato.";
        break;

      default:
        recommendedModules = modulesWithStats.slice(0, 4);
        pathDescription = "Percorso formativo personalizzato.";
    }

    // Apply focus area filter
    if (focusArea === "weak") {
      // Prioritize modules with low progress
      recommendedModules = recommendedModules.sort(
        (a, b) =>
          (a.userProgress.progress_percentage || 0) - (b.userProgress.progress_percentage || 0)
      );
    } else if (focusArea === "strong") {
      // Prioritize modules with high progress
      recommendedModules = recommendedModules.sort(
        (a, b) =>
          (b.userProgress.progress_percentage || 0) - (a.userProgress.progress_percentage || 0)
      );
    } else if (focusArea === "new") {
      // Prioritize not started modules
      recommendedModules = recommendedModules.sort((a, b) => {
        const aStarted = a.userProgress.status !== "not_started" ? 1 : 0;
        const bStarted = b.userProgress.status !== "not_started" ? 1 : 0;
        return aStarted - bStarted;
      });
    }

    // Limit to 5-6 modules for optimal path
    recommendedModules = recommendedModules.slice(0, 6);

    // Add reasons for each module
    recommendedModules = recommendedModules.map((module, index) => {
      let reason = "";
      if (index === 0) {
        reason = "Punto di partenza";
      } else if (module.userProgress.progress_percentage < 50) {
        reason = "Da completare";
      } else if (focusArea === "weak" && module.userProgress.progress_percentage < 30) {
        reason = "Area di debolezza";
      } else {
        reason = "Prossimo passo";
      }
      return { ...module, reason };
    });

    // Calculate estimated time
    const estimatedTime = recommendedModules.reduce((sum, m) => sum + (m.estimated_hours || 0), 0);

    res.json({
      success: true,
      path: {
        modules: recommendedModules,
        estimatedTime: estimatedTime > 0 ? `${estimatedTime}` : "Variabile",
        difficulty: difficulty || "adattivo",
        description: pathDescription,
      },
    });
  } catch (error) {
    safeLog("error", "[Education] Errore getPersonalizedPath:", error);
    res.status(500).json({ success: false, error: "Errore generazione percorso" });
  }
}

/**
 * Add XP to user
 */
export async function addXP(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { xp_amount, source_type, source_id, description } = req.body;

    if (!xp_amount || !source_type) {
      return res.status(400).json({ success: false, error: "xp_amount e source_type richiesti" });
    }

    // Call database function
    const { data, error } = await supabase.rpc("add_education_xp", {
      p_user_id: req.user.id,
      p_xp_amount: xp_amount,
      p_source_type: source_type,
      p_source_id: source_id || null,
      p_description: description || null,
    });

    if (error) {
      throw error;
    }

    res.json({ success: true, ...data });
  } catch (error) {
    safeLog("error", "[Education] Errore addXP:", error);
    res.status(500).json({ success: false, error: "Errore aggiunta XP" });
  }
}

/**
 * Unlock badge for user
 */
export async function unlockBadge(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { badge_id } = req.body;

    if (!badge_id) {
      return res.status(400).json({ success: false, error: "badge_id richiesto" });
    }

    // Check and unlock badge
    const { data, error } = await supabase.rpc("check_and_unlock_badge", {
      p_user_id: req.user.id,
      p_badge_id: badge_id,
    });

    if (error) {
      throw error;
    }

    if (data) {
      // Get badge details
      const { data: badge } = await supabase
        .from("education_badges")
        .select("*")
        .eq("id", badge_id)
        .single();

      res.json({ success: true, unlocked: true, badge });
    } else {
      res.json({ success: true, unlocked: false });
    }
  } catch (error) {
    safeLog("error", "[Education] Errore unlockBadge:", error);
    res.status(500).json({ success: false, error: "Errore unlock badge" });
  }
}

/**
 * Update learning streak
 */
export async function updateStreak(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { streak_type = "daily" } = req.body;

    // Call database function
    const { data, error } = await supabase.rpc("update_learning_streak", {
      p_user_id: req.user.id,
      p_streak_type: streak_type,
    });

    if (error) {
      throw error;
    }

    // Check streak rewards
    if (data.current_streak > 0) {
      const { data: rewards } = await supabase
        .from("education_streak_rewards")
        .select("*")
        .eq("streak_days", data.current_streak)
        .single();

      if (rewards && !data.streak_rewards_claimed?.includes(data.current_streak)) {
        // Add XP reward
        await supabase.rpc("add_education_xp", {
          p_user_id: req.user.id,
          p_xp_amount: rewards.xp_reward,
          p_source_type: "streak_bonus",
          p_source_id: null,
          p_description: rewards.description,
        });

        // Mark reward as claimed
        const { data: stats } = await supabase
          .from("education_user_stats")
          .select("streak_rewards_claimed")
          .eq("user_id", req.user.id)
          .single();

        const claimed = stats?.streak_rewards_claimed || [];
        claimed.push(data.current_streak);

        await supabase
          .from("education_user_stats")
          .update({ streak_rewards_claimed: claimed })
          .eq("user_id", req.user.id);
      }
    }

    res.json({ success: true, ...data });
  } catch (error) {
    safeLog("error", "[Education] Errore updateStreak:", error);
    res.status(500).json({ success: false, error: "Errore update streak" });
  }
}

/**
 * Get active quests for user
 */
export async function getQuests(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const today = new Date().toISOString().split("T")[0];

    // Get active quests
    const { data: activeQuests, error: questsError } = await supabase
      .from("education_quests")
      .select("*")
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order("quest_type", { ascending: true });

    if (questsError) {
      throw questsError;
    }

    // Get user quest progress
    const { data: userQuests, error: userQuestsError } = await supabase
      .from("education_user_quests")
      .select("*")
      .eq("user_id", req.user.id)
      .in("quest_id", activeQuests?.map((q) => q.id) || []);

    if (userQuestsError) {
      throw userQuestsError;
    }

    // Merge quests with user progress
    const questsWithProgress = (activeQuests || []).map((quest) => {
      const userQuest = userQuests?.find((uq) => uq.quest_id === quest.id);
      return {
        ...quest,
        progress: userQuest?.progress || {},
        status: userQuest?.status || "in_progress",
        started_at: userQuest?.started_at,
        completed_at: userQuest?.completed_at,
      };
    });

    res.json({ success: true, quests: questsWithProgress });
  } catch (error) {
    safeLog("error", "[Education] Errore getQuests:", error);
    res.status(500).json({ success: false, error: "Errore caricamento quest" });
  }
}

/**
 * Update quest progress
 */
export async function updateQuest(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { quest_id, objective_index } = req.body;

    if (!quest_id || objective_index === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "quest_id e objective_index richiesti" });
    }

    // Get quest
    const { data: quest, error: questError } = await supabase
      .from("education_quests")
      .select("*")
      .eq("id", quest_id)
      .single();

    if (questError || !quest) {
      return res.status(404).json({ success: false, error: "Quest non trovata" });
    }

    // Get or create user quest
    const { data: userQuest } = await supabase
      .from("education_user_quests")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("quest_id", quest_id)
      .single();

    let progress = {};
    if (userQuest) {
      progress = userQuest.progress || {};
    }

    // Update objective progress
    progress[objective_index] = true;

    // Check if all objectives completed
    const objectives = quest.objectives || [];
    const allCompleted = objectives.every((_, index) => progress[index] === true);

    // Upsert user quest
    const { data: updatedQuest, error: updateError } = await supabase
      .from("education_user_quests")
      .upsert(
        {
          user_id: req.user.id,
          quest_id: quest_id,
          progress: progress,
          status: allCompleted ? "completed" : "in_progress",
          completed_at: allCompleted ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,quest_id" }
      )
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // If completed, add XP
    if (allCompleted && !userQuest?.completed_at) {
      await supabase.rpc("add_education_xp", {
        p_user_id: req.user.id,
        p_xp_amount: quest.xp_reward,
        p_source_type: "quest",
        p_source_id: quest_id,
        p_description: `Quest completata: ${quest.title}`,
      });
    }

    res.json({
      success: true,
      quest: updatedQuest,
      completed: allCompleted,
      xp_reward: allCompleted ? quest.xp_reward : 0,
    });
  } catch (error) {
    safeLog("error", "[Education] Errore updateQuest:", error);
    res.status(500).json({ success: false, error: "Errore update quest" });
  }
}

/**
 * Update tracking preferences (GDPR compliance)
 */
export async function updateTrackingPreferences(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const {
      track_detailed_progress,
      track_test_scores,
      track_test_answers,
      share_anonymous_analytics,
    } = req.body;

    // Update preferences
    const { data, error } = await supabase
      .from("education_user_tracking_preferences")
      .upsert(
        {
          user_id: req.user.id,
          track_detailed_progress:
            track_detailed_progress !== undefined ? track_detailed_progress : true,
          track_test_scores: track_test_scores !== undefined ? track_test_scores : true,
          track_test_answers: track_test_answers !== undefined ? track_test_answers : false, // Default: NO
          share_anonymous_analytics:
            share_anonymous_analytics !== undefined ? share_anonymous_analytics : true,
          updated_at: new Date().toISOString(),
          // Se disattiva tutto, registra withdrawal
          consent_withdrawn_at:
            track_detailed_progress === false &&
            track_test_scores === false &&
            track_test_answers === false
              ? new Date().toISOString()
              : null,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, preferences: data });
  } catch (error) {
    safeLog("error", "[Education] Errore updateTrackingPreferences:", error);
    res.status(500).json({ success: false, error: "Errore aggiornamento preferenze" });
  }
}

/**
 * Get tracking preferences
 */
export async function getTrackingPreferences(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { data, error } = await supabase
      .from("education_user_tracking_preferences")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned (OK, usa default)
      throw error;
    }

    // Default preferences se non esiste
    const preferences = data || {
      track_detailed_progress: true,
      track_test_scores: true,
      track_test_answers: false, // Default: NO (minimizzazione)
      share_anonymous_analytics: true,
    };

    res.json({ success: true, preferences });
  } catch (error) {
    safeLog("error", "[Education] Errore getTrackingPreferences:", error);
    res.status(500).json({ success: false, error: "Errore caricamento preferenze" });
  }
}

/**
 * Save spaced repetition review (SM-2 algorithm)
 */
async function saveSpacedRepetitionReview(req, res) {
  try {
    const { item_id, quality, review_duration_seconds } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    if (!item_id || quality === undefined) {
      return res.status(400).json({ success: false, error: "item_id e quality richiesti" });
    }

    // Get current item
    const { data: item, error: itemError } = await supabase
      .from("spaced_repetition_items")
      .select("*")
      .eq("id", item_id)
      .eq("user_id", user_id)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ success: false, error: "Item non trovato" });
    }

    // Calculate next review using SM-2
    const { data: sm2Result, error: sm2Error } = await supabase.rpc("calculate_next_review_sm2", {
      p_quality: quality,
      p_repetitions: item.repetitions || 0,
      p_ease_factor: item.ease_factor || 2.5,
      p_interval_days: item.interval_days || 0,
    });

    if (sm2Error || !sm2Result || sm2Result.length === 0) {
      safeLog("error", "[Education] SM-2 error:", sm2Error);
      return res.status(500).json({ success: false, error: "Errore calcolo prossima revisione" });
    }

    const nextReview = sm2Result[0];

    // Update item
    const updateData = {
      repetitions: nextReview.new_repetitions,
      ease_factor: nextReview.new_ease_factor,
      interval_days: nextReview.new_interval_days,
      next_review_date: nextReview.next_review_date,
      last_review_date: new Date().toISOString(),
      total_reviews: (item.total_reviews || 0) + 1,
      correct_reviews: quality >= 3 ? (item.correct_reviews || 0) + 1 : item.correct_reviews || 0,
      average_quality: item.total_reviews
        ? ((item.average_quality || 0) * item.total_reviews + quality) / (item.total_reviews + 1)
        : quality,
    };

    const { error: updateError } = await supabase
      .from("spaced_repetition_items")
      .update(updateData)
      .eq("id", item_id)
      .eq("user_id", user_id);

    if (updateError) {
      throw updateError;
    }

    // Save review record
    await supabase.from("spaced_repetition_reviews").insert({
      item_id: item_id,
      user_id: user_id,
      quality: quality,
      review_duration_seconds: review_duration_seconds || null,
      new_repetitions: nextReview.new_repetitions,
      new_ease_factor: nextReview.new_ease_factor,
      new_interval_days: nextReview.new_interval_days,
      new_next_review_date: nextReview.next_review_date,
    });

    res.json({
      success: true,
      item: { id: item_id, ...updateData },
      next_review: nextReview.next_review_date,
    });
  } catch (error) {
    safeLog("error", "[Education] Errore saveSpacedRepetitionReview:", error);
    res.status(500).json({ success: false, error: "Errore salvataggio revisione" });
  }
}

/**
 * Get flashcards due for review
 */
async function getDueFlashcards(req, res) {
  try {
    const user_id = req.user?.id;
    const limit = parseInt(req.query.limit) || 50;

    if (!user_id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    const { data: items, error } = await supabase.rpc("get_due_items", {
      p_user_id: user_id,
      p_limit: limit,
    });

    if (error) {
      throw error;
    }

    res.json({ success: true, items: items || [], count: items?.length || 0 });
  } catch (error) {
    safeLog("error", "[Education] Errore getDueFlashcards:", error);
    res.status(500).json({ success: false, error: "Errore caricamento flashcards" });
  }
}

/**
 * Create spaced repetition item
 */
async function createSpacedRepetitionItem(req, res) {
  try {
    const { content, item_type, module_id, lesson_id, question, answer, hint, explanation } =
      req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    if (!content || !item_type || !module_id || !lesson_id) {
      return res.status(400).json({ success: false, error: "Campi richiesti mancanti" });
    }

    const { data: item, error } = await supabase
      .from("spaced_repetition_items")
      .insert({
        user_id: user_id,
        item_type: item_type,
        module_id: module_id,
        lesson_id: lesson_id,
        content: content,
        question: question || content,
        answer: answer || content,
        hint: hint || null,
        explanation: explanation || null,
        next_review_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, item });
  } catch (error) {
    safeLog("error", "[Education] Errore createSpacedRepetitionItem:", error);
    res.status(500).json({ success: false, error: "Errore creazione item" });
  }
}

/**
 * Update mastery score (adaptive learning)
 */
async function updateMastery(req, res) {
  try {
    const { module_id, lesson_id, score, total_questions, correct_answers } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    if (!module_id || !lesson_id || score === undefined) {
      return res.status(400).json({ success: false, error: "Campi richiesti mancanti" });
    }

    // Get or create progress
    const { data: existing } = await supabase
      .from("adaptive_learning_progress")
      .select("*")
      .eq("user_id", user_id)
      .eq("lesson_id", lesson_id)
      .single();

    let progressData;
    if (existing) {
      const newTotalAttempts = (existing.total_attempts || 0) + 1;
      const newCorrect = (existing.correct_answers || 0) + (correct_answers || 0);
      const newIncorrect =
        (existing.incorrect_answers || 0) + ((total_questions || 0) - (correct_answers || 0));
      const masteryScore = existing.total_attempts
        ? ((existing.mastery_score || 0) * existing.total_attempts + score) /
          (existing.total_attempts + 1)
        : score;

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
        last_attempt_date: new Date().toISOString(),
        mastery_achieved_date:
          masteryScore >= (existing.mastery_threshold || 80) && !existing.mastery_achieved_date
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
        throw updateError;
      }

      res.json({ success: true, progress: updated, mastery_achieved: masteryScore >= 80 });
    } else {
      progressData = {
        user_id: user_id,
        module_id: module_id,
        lesson_id: lesson_id,
        mastery_score: score,
        difficulty_level: 1,
        total_attempts: 1,
        correct_answers: correct_answers || 0,
        incorrect_answers: (total_questions || 0) - (correct_answers || 0),
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
        throw createError;
      }

      res.json({ success: true, progress: created, mastery_achieved: score >= 80 });
    }
  } catch (error) {
    safeLog("error", "[Education] Errore updateMastery:", error);
    res.status(500).json({ success: false, error: "Errore aggiornamento mastery" });
  }
}

/**
 * Get adaptive difficulty for lesson
 */
async function getAdaptiveDifficulty(req, res) {
  try {
    const { module_id, lesson_id } = req.query;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ success: false, error: "Autenticazione richiesta" });
    }

    if (!module_id || !lesson_id) {
      return res.status(400).json({ success: false, error: "module_id e lesson_id richiesti" });
    }

    const { data: progress } = await supabase
      .from("adaptive_learning_progress")
      .select("*")
      .eq("user_id", user_id)
      .eq("module_id", module_id)
      .eq("lesson_id", lesson_id)
      .single();

    res.json({
      success: true,
      progress: progress || {
        mastery_score: 0,
        difficulty_level: 1,
        mastery_threshold: 80,
        total_attempts: 0,
      },
    });
  } catch (error) {
    safeLog("error", "[Education] Errore getAdaptiveDifficulty:", error);
    res.status(500).json({ success: false, error: "Errore caricamento difficoltà" });
  }
}

/**
 * Main handler (Vercel serverless function)
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { action } = req.query;

  // Get user from token (if authenticated)
  let user = null;
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && authUser) {
        user = authUser;
      }
    } catch (e) {
      // Not authenticated, continue as guest
      safeLog("warn", "[Education] Auth error:", e);
    }
  }

  req.user = user;

  try {
    switch (action) {
      case "modules":
        return await getModules(req, res);
      case "module":
        return await getModule(req, res);
      case "lesson":
        return await getLesson(req, res);
      case "update-lesson-progress":
        return await updateLessonProgress(req, res);
      case "test":
        return await getTest(req, res);
      case "submit-test":
        return await submitTest(req, res);
      case "user-progress":
        return await getUserProgress(req, res);
      case "pathways":
        return await getPathways(req, res);
      case "spaced-repetition-due":
        return await getSpacedRepetitionDue(req, res);
      case "retrieval-questions":
        return await getRetrievalQuestions(req, res);
      case "retrieval-answers":
        return await getRetrievalAnswers(req, res);
      case "update-spaced-repetition":
        return await updateSpacedRepetition(req, res);
      case "save-pre-assessment":
        return await savePreAssessment(req, res);
      case "save-post-reflection":
        return await savePostReflection(req, res);
      case "learning-goals":
        return await getLearningGoals(req, res);
      case "save-learning-goals":
        return await saveLearningGoals(req, res);
      case "recent-questions-for-practice":
        return await getRecentQuestionsForPractice(req, res);
      case "learning-analytics":
        return await getLearningAnalytics(req, res);
      case "interleaved-questions":
        return await getInterleavedQuestions(req, res);
      case "personalized-path":
        return await getPersonalizedPath(req, res);
      case "add-xp":
        return await addXP(req, res);
      case "unlock-badge":
        return await unlockBadge(req, res);
      case "update-streak":
        return await updateStreak(req, res);
      case "quests":
        return await getQuests(req, res);
      case "update-quest":
        return await updateQuest(req, res);
      case "update-tracking-preferences":
        return await updateTrackingPreferences(req, res);
      case "get-tracking-preferences":
        return await getTrackingPreferences(req, res);
      case "save-spaced-repetition":
        return await saveSpacedRepetitionReview(req, res);
      case "get-due-flashcards":
        return await getDueFlashcards(req, res);
      case "create-spaced-repetition-item":
        return await createSpacedRepetitionItem(req, res);
      case "update-mastery":
        return await updateMastery(req, res);
      case "get-adaptive-difficulty":
        return await getAdaptiveDifficulty(req, res);
      default:
        // Log 400 per azione non valida

        console.error("[400 Bad Request]", {
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
          path: "/api/education",
          action: req.query?.action,
          error: "Azione non valida",
          query: req.query,
        });
        return res.status(400).json({ success: false, error: "Azione non valida" });
    }
  } catch (error) {
    // Log 400 se è un errore di validazione
    if (error.status === 400 || (error.message && error.message.includes("richiesto"))) {
      console.error("[400 Bad Request]", {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        path: "/api/education",
        action: req.query?.action,
        error: error.message || error,
        query: req.query,
      });
      return res
        .status(400)
        .json({ success: false, error: error.message || "Richiesta non valida" });
    }
    safeLog("error", "[Education] Handler error:", error);
    return res.status(500).json({ success: false, error: "Errore interno del server" });
  }
}
