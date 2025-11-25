/* eslint-env browser */
/**
 * Adaptive Learning System - Frontend
 * Mastery Learning + Adaptive Difficulty
 * Best Practice 2025
 */

import { safeLog } from "./security-utils.js";
import { getSupabaseClient } from "./supabase-client.js";

const API_BASE = "/api/education";

/**
 * Adaptive Learning System - Frontend Component
 */
export class AdaptiveLearningUI {
  constructor() {
    this.masteryThreshold = 80; // 80% to pass (best practice)
  }

  /**
   * Get adaptive difficulty for lesson
   */
  async getDifficulty(moduleId, lessonId) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { difficulty_level: 1, mastery_score: 0 };
      }

      const response = await fetch(
        `${API_BASE}?action=get-adaptive-difficulty&module_id=${moduleId}&lesson_id=${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get difficulty");
      }

      const data = await response.json();
      return data.progress || { difficulty_level: 1, mastery_score: 0 };
    } catch (error) {
      safeLog("error", "[AdaptiveLearning] Error getting difficulty:", error);
      return { difficulty_level: 1, mastery_score: 0 };
    }
  }

  /**
   * Update mastery after quiz/test
   */
  async updateMastery(moduleId, lessonId, score, totalQuestions, correctAnswers, responseTimeSeconds) {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        safeLog("warn", "[AdaptiveLearning] Not authenticated");
        return null;
      }

      const response = await fetch(`${API_BASE}?action=update-mastery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          module_id: moduleId,
          lesson_id: lessonId,
          score: score,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          response_time_seconds: responseTimeSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update mastery");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      safeLog("error", "[AdaptiveLearning] Error updating mastery:", error);
      return null;
    }
  }

  /**
   * Show mastery indicator
   */
  showMasteryIndicator(container, masteryScore, masteryThreshold = 80) {
    if (!container) return;

    const percentage = Math.round(masteryScore);
    const isMastered = percentage >= masteryThreshold;

    container.innerHTML = `
      <div class="adaptive-mastery-indicator">
        <div class="mastery-header">
          <h4>Mastery Score</h4>
          <span class="mastery-percentage">${percentage}%</span>
        </div>
        <div class="mastery-progress-bar">
          <div class="mastery-progress-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="mastery-status">
          ${isMastered 
            ? '<span class="mastery-achieved">✅ Mastery Raggiunto!</span>'
            : `<span class="mastery-pending">📚 Continua a studiare (${masteryThreshold}% per passare)</span>`
          }
        </div>
      </div>
    `;

    this.addMasteryStyles();
  }

  /**
   * Check if lesson can be passed (mastery >= threshold)
   */
  canPassLesson(masteryScore, masteryThreshold = 80) {
    return masteryScore >= masteryThreshold;
  }

  /**
   * Get difficulty label
   */
  getDifficultyLabel(difficultyLevel) {
    const labels = {
      1: "Facile",
      2: "Intermedio",
      3: "Avanzato",
      4: "Esperto",
      5: "Master",
    };
    return labels[difficultyLevel] || "Facile";
  }

  /**
   * Add mastery styles
   */
  addMasteryStyles() {
    if (document.getElementById("adaptive-mastery-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "adaptive-mastery-styles";
    style.textContent = `
      .adaptive-mastery-indicator {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .mastery-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .mastery-header h4 {
        margin: 0;
        font-size: 1rem;
        color: #1f2937;
      }
      .mastery-percentage {
        font-size: 1.5rem;
        font-weight: bold;
        color: #00C76A;
      }
      .mastery-progress-bar {
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin: 0.5rem 0;
      }
      .mastery-progress-fill {
        height: 100%;
        background: #00C76A;
        transition: width 0.3s;
      }
      .mastery-status {
        margin-top: 0.5rem;
        font-size: 0.9rem;
      }
      .mastery-achieved {
        color: #00C76A;
        font-weight: 500;
      }
      .mastery-pending {
        color: #666;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get auth token
   */
  async getAuthToken() {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      return null;
    }
  }
}

/**
 * Initialize adaptive learning system
 */
export function initAdaptiveLearning() {
  const als = new AdaptiveLearningUI();
  window.AdaptiveLearningUI = als;
  safeLog("info", "[AdaptiveLearning] System initialized");
  return als;
}

