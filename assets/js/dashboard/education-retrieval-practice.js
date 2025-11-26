/* eslint-env browser */
/**
 * Retrieval Practice System - Frontend
 * Active Recall through Frequent Quizzes
 * Research: Roediger & Karpicke (2006), Karpicke & Blunt (2011)
 * Best Practice 2025
 */

import { safeLog } from "./security-utils.js";
import { getSupabaseClient } from "./supabase-client.js";
import { SpacedRepetitionUI } from "./education-spaced-repetition.js";

const API_BASE = "/api/education";

/**
 * Retrieval Practice System - Frontend Component
 */
export class RetrievalPracticeUI {
  constructor() {
    this.currentQuiz = null;
    this.quizStartTime = null;
    this.spacedRepetition = new SpacedRepetitionUI();
  }

  /**
   * Show quiz in lesson (frequent quizzes, not just end of module)
   */
  async showQuizInLesson(questions, container, moduleId, lessonId) {
    if (!container || !questions || questions.length === 0) {
      return;
    }

    this.currentQuiz = {
      questions: questions,
      currentIndex: 0,
      answers: [],
      score: 0,
      moduleId: moduleId,
      lessonId: lessonId,
    };

    this.quizStartTime = Date.now();
    this.renderQuestion(0, container);
  }

  /**
   * Render question
   */
  renderQuestion(index, container) {
    if (index >= this.currentQuiz.questions.length) {
      // Quiz complete
      this.showQuizResults(container);
      return;
    }

    const question = this.currentQuiz.questions[index];
    const totalQuestions = this.currentQuiz.questions.length;

    container.innerHTML = `
      <div class="retrieval-quiz-container">
        <div class="rq-progress">
          <span>Domanda ${index + 1} di ${totalQuestions}</span>
          <div class="rq-progress-bar">
            <div class="rq-progress-fill" style="width: ${((index + 1) / totalQuestions) * 100}%"></div>
          </div>
        </div>
        
        <div class="rq-question" data-question-index="${index}">
          <h3>${this.escapeHtml(question.question)}</h3>
          ${
            question.hint
              ? `<p class="rq-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path d="M9 21h6"/>
              <path d="M12 3a6 6 0 0 0 6 6c0 2.22-1.21 4.16-3 5.2V19a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4.8c-1.79-1.04-3-3-3-5.2a6 6 0 0 0 6-6z"/>
            </svg>
            ${this.escapeHtml(question.hint)}
          </p>`
              : ""
          }
        </div>
        
        <div class="rq-options">
          ${question.options
            .map(
              (option, i) => `
            <button class="rq-option-btn" 
                    data-option-index="${i}" 
                    data-correct="${i === question.correctAnswer}"
                    onclick="window.RetrievalPracticeUI.selectAnswer(${i}, ${index})">
              ${this.escapeHtml(option)}
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    this.addQuizStyles();
  }

  /**
   * Select answer
   */
  selectAnswer(optionIndex, questionIndex) {
    const question = this.currentQuiz.questions[questionIndex];
    const isCorrect = optionIndex === question.correctAnswer;

    // Update score
    if (isCorrect) {
      this.currentQuiz.score++;
    }

    // Store answer
    this.currentQuiz.answers.push({
      questionIndex: questionIndex,
      selectedAnswer: optionIndex,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
    });

    // Show feedback
    const container = document.querySelector(".rq-question");
    if (container) {
      const feedback = document.createElement("div");
      feedback.className = `rq-feedback ${isCorrect ? "correct" : "incorrect"}`;
      feedback.innerHTML = `
        <p>
          ${
            isCorrect
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Corretto!`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Sbagliato`
          }
        </p>
        ${question.explanation ? `<p class="rq-explanation">${this.escapeHtml(question.explanation)}</p>` : ""}
      `;
      container.appendChild(feedback);

      // Disable buttons
      const buttons = container.parentElement.querySelectorAll(".rq-option-btn");
      buttons.forEach((btn) => {
        btn.disabled = true;
        if (parseInt(btn.dataset.optionIndex) === question.correctAnswer) {
          btn.classList.add("correct-answer");
        }
        if (parseInt(btn.dataset.optionIndex) === optionIndex && !isCorrect) {
          btn.classList.add("incorrect-answer");
        }
      });

      // Move to next question after delay
      setTimeout(() => {
        this.renderQuestion(questionIndex + 1, container.parentElement);
      }, 2000);
    }
  }

  /**
   * Show quiz results
   */
  async showQuizResults(container) {
    const totalQuestions = this.currentQuiz.questions.length;
    const score = this.currentQuiz.score;
    const percentage = Math.round((score / totalQuestions) * 100);
    const duration = Math.floor((Date.now() - this.quizStartTime) / 1000);

    // Update mastery if authenticated
    if (this.currentQuiz.moduleId && this.currentQuiz.lessonId) {
      await this.updateMasteryAfterQuiz(percentage, totalQuestions, score, duration);
    }

    container.innerHTML = `
      <div class="rq-results">
        <h3>Quiz Completato!</h3>
        <div class="rq-score">
          <p class="rq-score-value">${score} / ${totalQuestions}</p>
          <p class="rq-score-percentage">${percentage}%</p>
        </div>
        <div class="rq-feedback-message">
          ${
            percentage >= 80
              ? "<p>🎉 Eccellente! Hai padroneggiato questo argomento.</p>"
              : percentage >= 60
                ? "<p>👍 Buono! Ripassa i concetti e riprova.</p>"
                : `<p><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> Continua a studiare! Ripassa la lezione e riprova.</p>`
          }
        </div>
        <div class="rq-actions">
          <button class="rq-retry-btn" onclick="location.reload()">Riprova</button>
          <button class="rq-continue-btn" onclick="window.RetrievalPracticeUI.continueLesson()">Continua Lezione</button>
        </div>
      </div>
    `;
  }

  /**
   * Update mastery after quiz
   */
  async updateMasteryAfterQuiz(score, totalQuestions, correctAnswers, duration) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return;
      }

      const { AdaptiveLearningUI } = await import("./education-adaptive-learning.js");
      await AdaptiveLearningUI.updateMastery(
        this.currentQuiz.moduleId,
        this.currentQuiz.lessonId,
        score,
        totalQuestions,
        correctAnswers,
        duration
      );
    } catch (error) {
      safeLog("error", "[RetrievalPractice] Error updating mastery:", error);
    }
  }

  /**
   * Continue lesson
   */
  continueLesson() {
    // Trigger lesson continue event
    const event = new CustomEvent("retrieval-practice-continue");
    window.dispatchEvent(event);
  }

  /**
   * Create flashcard from lesson content
   */
  async createFlashcardFromContent(
    content,
    question,
    answer,
    moduleId,
    lessonId,
    itemType = "concept"
  ) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        // Guest: save to localStorage
        this.saveFlashcardToLocalStorage(content, question, answer, moduleId, lessonId, itemType);
        return;
      }

      const response = await fetch(`${API_BASE}?action=create-spaced-repetition-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content,
          item_type: itemType,
          module_id: moduleId,
          lesson_id: lessonId,
          question: question || content,
          answer: answer || content,
        }),
      });

      if (response.ok) {
        safeLog("info", "[RetrievalPractice] Flashcard created");
      }
    } catch (error) {
      safeLog("error", "[RetrievalPractice] Error creating flashcard:", error);
    }
  }

  /**
   * Save flashcard to localStorage (guest users)
   */
  saveFlashcardToLocalStorage(content, question, answer, moduleId, lessonId, itemType) {
    try {
      const key = `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const flashcard = {
        content: content,
        question: question || content,
        answer: answer || content,
        module_id: moduleId,
        lesson_id: lessonId,
        item_type: itemType,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(flashcard));
    } catch (error) {
      safeLog("error", "[RetrievalPractice] Error saving to localStorage:", error);
    }
  }

  /**
   * Add quiz styles
   */
  addQuizStyles() {
    if (document.getElementById("retrieval-quiz-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "retrieval-quiz-styles";
    style.textContent = `
      .retrieval-quiz-container {
        max-width: 800px;
        margin: 2rem auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 2rem;
      }
      .rq-progress {
        margin-bottom: 2rem;
      }
      .rq-progress-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 0.5rem;
      }
      .rq-progress-fill {
        height: 100%;
        background: #00C76A;
        transition: width 0.3s;
      }
      .rq-question h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #1f2937;
      }
      .rq-hint {
        color: #666;
        font-style: italic;
        margin-top: 0.5rem;
      }
      .rq-options {
        display: grid;
        gap: 1rem;
        margin-top: 2rem;
      }
      .rq-option-btn {
        padding: 1rem;
        border: 2px solid #ddd;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
        font-size: 1rem;
      }
      .rq-option-btn:hover:not(:disabled) {
        border-color: #00C76A;
        background: #f0fdf4;
      }
      .rq-option-btn:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
      .rq-option-btn.correct-answer {
        border-color: #00C76A;
        background: #f0fdf4;
        color: #00C76A;
        font-weight: 500;
      }
      .rq-option-btn.incorrect-answer {
        border-color: #ef4444;
        background: #fef2f2;
        color: #ef4444;
      }
      .rq-feedback {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 8px;
      }
      .rq-feedback.correct {
        background: #f0fdf4;
        color: #00C76A;
      }
      .rq-feedback.incorrect {
        background: #fef2f2;
        color: #ef4444;
      }
      .rq-explanation {
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }
      .rq-results {
        text-align: center;
        padding: 2rem;
      }
      .rq-score-value {
        font-size: 3rem;
        font-weight: bold;
        color: #00C76A;
        margin: 0;
      }
      .rq-score-percentage {
        font-size: 1.5rem;
        color: #666;
        margin: 0.5rem 0;
      }
      .rq-feedback-message {
        margin: 1.5rem 0;
        font-size: 1.1rem;
      }
      .rq-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }
      .rq-retry-btn, .rq-continue-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
      }
      .rq-retry-btn {
        background: #e5e7eb;
        color: #1f2937;
      }
      .rq-retry-btn:hover {
        background: #d1d5db;
      }
      .rq-continue-btn {
        background: #00C76A;
        color: white;
      }
      .rq-continue-btn:hover {
        background: #00A855;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get auth token
   */
  async getAuthToken() {
    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  }
}

/**
 * Initialize retrieval practice system
 */
export function initRetrievalPractice() {
  const rps = new RetrievalPracticeUI();
  window.RetrievalPracticeUI = rps;
  safeLog("info", "[RetrievalPractice] System initialized");
  return rps;
}
