/**
 * Education System API
 * Sistema formativo con gamification per retail
 * Best Practice Accademica 2025
 */

import { getServiceSupabase } from "./_lib/supabase.js";

// Safe log function (avoid circular dependency)
function safeLog(level, ...args) {
  if (process.env.NODE_ENV !== "production") {
    console[level](...args);
  }
}

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

    // Get tests for this module
    const { data: tests, error: testsError } = await supabase
      .from("education_tests")
      .select("id, title, description, passing_score, max_attempts, time_limit_minutes")
      .eq("module_id", moduleId)
      .eq("is_active", true);

    if (testsError) throw testsError;

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

      // Get user attempts for tests
      if (tests && tests.length > 0) {
        const testIds = tests.map(t => t.id);
        const { data: attempts } = await supabase
          .from("education_user_test_attempts")
          .select("*")
          .eq("user_id", req.user.id)
          .in("test_id", testIds)
          .order("attempt_number", { ascending: false });

        // Map attempts to tests
        tests.forEach(test => {
          test.userAttempts = attempts?.filter(a => a.test_id === test.id) || [];
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

    // Get module info for navigation
    const { data: moduleInfo } = await supabase
      .from("education_tests")
      .select("education_modules(id, slug)")
      .eq("id", testId)
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
          .in("test_id", allTests.map(t => t.id));

        // If all tests passed, mark module as completed
        if (passedTests?.length === allTests?.length) {
          await supabase
            .from("education_user_progress")
            .upsert({
              user_id: req.user.id,
              module_id: module.id,
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
    attempts.forEach(attempt => {
      if (attempt.answers) {
        Object.keys(attempt.answers).forEach(questionId => {
          const answer = attempt.answers[questionId];
          const perf = questionPerformance.get(questionId) || { attempts: 0, correct: 0, lastReview: null };
          perf.attempts++;
          if (answer.is_correct) perf.correct++;
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
      .select(`
        id,
        question_text,
        education_tests!inner(education_modules!inner(id, title, slug))
      `)
      .in("id", questionIds)
      .eq("is_active", true);

    // Calculate due dates and filter
    const today = new Date();
    const questionsWithDue = questions.map(q => {
      const perf = questionPerformance.get(q.id);
      const lastReview = perf.lastReview ? new Date(perf.lastReview) : null;
      const daysSinceReview = lastReview ? Math.floor((today - lastReview) / (1000 * 60 * 60 * 24)) : 999;
      
      // Simple spaced repetition: incorrect after 1 day, difficult after 7, easy after 30
      const successRate = perf.attempts > 0 ? perf.correct / perf.attempts : 0;
      let nextReviewDays = 30;
      if (successRate < 0.5) nextReviewDays = 1;
      else if (successRate < 0.7) nextReviewDays = 7;
      else if (successRate < 0.9) nextReviewDays = 14;

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
    }).filter(q => q.due_today || q.days_until_due <= 3)
      .sort((a, b) => a.due_today ? -1 : b.due_today ? 1 : a.days_until_due - b.days_until_due);

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
      .select(`
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
      `)
      .in("id", ids)
      .eq("is_active", true)
      .order("id");

    if (error) throw error;

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
    if (!questionIds) {
      return res.status(400).json({ success: false, error: "questionIds richiesto" });
    }

    const ids = questionIds.split(",").filter(Boolean);

    const { data: questions, error } = await supabase
      .from("education_questions")
      .select(`
        id,
        education_question_options (
          id,
          is_correct
        )
      `)
      .in("id", ids)
      .eq("is_active", true);

    if (error) throw error;

    const answers = {};
    questions.forEach(q => {
      answers[q.id] = q.education_question_options
        .filter(opt => opt.is_correct)
        .map(opt => opt.id);
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

    const { lessonId, knowledgeLevel, expectations } = req.body;

    // Store in user's lesson progress or new metacognition table
    // For now, we'll log it - can be stored in JSONB field
    
    safeLog("info", `[Metacognition] Pre-assessment: lessonId=${lessonId}, knowledge=${knowledgeLevel}`);

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

    const { lessonId, comprehension, unclear, learned } = req.body;

    // Store reflection
    safeLog("info", `[Metacognition] Post-reflection: lessonId=${lessonId}, comprehension=${comprehension}`);

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
    attempts?.forEach(attempt => {
      if (attempt.answers) {
        Object.keys(attempt.answers).forEach(qId => questionIds.add(qId));
      }
    });

    res.json({ success: true, questionIds: Array.from(questionIds).slice(0, 20) });
  } catch (error) {
    safeLog("error", "[Education] Errore getRecentQuestionsForPractice:", error);
    res.status(500).json({ success: false, error: "Errore caricamento domande" });
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
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
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
      default:
        return res.status(400).json({ success: false, error: "Azione non valida" });
    }
  } catch (error) {
    safeLog("error", "[Education] Handler error:", error);
    return res.status(500).json({ success: false, error: "Errore interno del server" });
  }
}
