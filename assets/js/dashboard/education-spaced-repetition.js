/* eslint-env browser */
/**
 * Spaced Repetition System - Frontend
 * SM-2 Algorithm Implementation
 * Best Practice 2025
 */

import { safeLog } from "./security-utils.js";
import { getSupabaseClient } from "./supabase-client.js";

const API_BASE = "/api/education";

/**
 * Spaced Repetition System - Frontend Component
 */
export class SpacedRepetitionUI {
  constructor() {
    this.currentItem = null;
    this.reviewStartTime = null;
  }

  /**
   * Initialize spaced repetition UI
   */
  async init(container) {
    if (!container) {
      safeLog("warn", "[SpacedRepetition] Container not found");
      return;
    }

    // Load due items
    await this.loadDueItems(container);
  }

  /**
   * Load items due for review
   */
  async loadDueItems(container) {
    try {
      const token = await this.getAuthToken();

      if (!token) {
        container.innerHTML = `
          <div class="education-message">
            <p>Accedi per utilizzare il sistema di spaced repetition</p>
          </div>
        `;
        return;
      }

      const response = await fetch(`${API_BASE}?action=get-due-flashcards&limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load flashcards");
      }

      const data = await response.json();
      const items = data.items || [];

      if (items.length === 0) {
        container.innerHTML = `
          <div class="education-message">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              Ottimo lavoro!
            </h3>
            <p>Non hai item da rivedere oggi.</p>
            <p>Ritorneremo domani per nuove revisioni.</p>
          </div>
        `;
        return;
      }

      // Show first item
      this.currentItem = items[0];
      this.showFlashcard(this.currentItem, container, items.length);
    } catch (error) {
      safeLog("error", "[SpacedRepetition] Error loading items:", error);
      container.innerHTML = `
        <div class="education-error">
          <p>Errore nel caricamento delle flashcard. Riprova più tardi.</p>
        </div>
      `;
    }
  }

  /**
   * Show flashcard
   */
  showFlashcard(item, container, totalItems = 1) {
    this.reviewStartTime = Date.now();
    const currentIndex = 1; // Simplified for now

    container.innerHTML = `
      <div class="spaced-repetition-container">
        <div class="sr-progress">
          <span>Item ${currentIndex} di ${totalItems}</span>
        </div>
        
        <div class="sr-flashcard" data-item-id="${item.id}">
          <div class="sr-flashcard-front">
            <div class="sr-question">
              <h3>${this.escapeHtml(item.question)}</h3>
              ${
                item.hint
                  ? `<p class="sr-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <path d="M9 21h6"/>
                  <path d="M12 3a6 6 0 0 0 6 6c0 2.22-1.21 4.16-3 5.2V19a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4.8c-1.79-1.04-3-3-3-5.2a6 6 0 0 0 6-6z"/>
                </svg>
                ${this.escapeHtml(item.hint)}
              </p>`
                  : ""
              }
            </div>
            <button class="sr-reveal-btn" onclick="window.SpacedRepetitionUI.revealAnswer()">
              Mostra Risposta
            </button>
          </div>
          
          <div class="sr-flashcard-back" style="display: none;">
            <div class="sr-answer">
              <h3>Risposta:</h3>
              <p>${this.escapeHtml(item.answer)}</p>
              ${item.explanation ? `<div class="sr-explanation"><p>${this.escapeHtml(item.explanation)}</p></div>` : ""}
            </div>
            
            <div class="sr-rating">
              <p><strong>Quanto bene ricordavi?</strong></p>
              <div class="sr-rating-buttons">
                <button class="sr-rating-btn" data-quality="0" onclick="window.SpacedRepetitionUI.rateRecall(0)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Niente
                </button>
                <button class="sr-rating-btn" data-quality="1" onclick="window.SpacedRepetitionUI.rateRecall(1)">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px; color: #dc2626;"><circle cx="12" cy="12" r="10"/></svg>
                  Difficile
                </button>
                <button class="sr-rating-btn" data-quality="2" onclick="window.SpacedRepetitionUI.rateRecall(2)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px; color: #ea580c;"><circle cx="12" cy="12" r="10"/><path d="M12 2v20" stroke-width="2"/></svg>
                  Parziale
                </button>
                <button class="sr-rating-btn" data-quality="3" onclick="window.SpacedRepetitionUI.rateRecall(3)">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px; color: #16a34a;"><circle cx="12" cy="12" r="10"/></svg>
                  Corretto
                </button>
                <button class="sr-rating-btn" data-quality="4" onclick="window.SpacedRepetitionUI.rateRecall(4)">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px; color: #3b82f6;"><circle cx="12" cy="12" r="10"/></svg>
                  Facile
                </button>
                <button class="sr-rating-btn" data-quality="5" onclick="window.SpacedRepetitionUI.rateRecall(5)">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="display: inline-block; vertical-align: middle; margin-right: 4px; color: #fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  Perfetto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  /**
   * Reveal answer
   */
  revealAnswer() {
    const flashcard = document.querySelector(".sr-flashcard");
    if (!flashcard) {
      return;
    }

    const front = flashcard.querySelector(".sr-flashcard-front");
    const back = flashcard.querySelector(".sr-flashcard-back");

    if (front && back) {
      front.style.display = "none";
      back.style.display = "block";
    }
  }

  /**
   * Rate recall quality (0-5)
   */
  async rateRecall(quality) {
    if (!this.currentItem) {
      safeLog("error", "[SpacedRepetition] No current item");
      return;
    }

    const reviewDuration = Math.floor((Date.now() - this.reviewStartTime) / 1000);

    try {
      const token = await this.getAuthToken();
      if (!token) {
        safeLog("warn", "[SpacedRepetition] Not authenticated");
        return;
      }

      const response = await fetch(`${API_BASE}?action=save-spaced-repetition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: this.currentItem.id,
          item_type: this.currentItem.item_type,
          module_id: this.currentItem.module_id,
          lesson_id: this.currentItem.lesson_id,
          quality: quality,
          review_duration_seconds: reviewDuration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save review");
      }

      // Show feedback
      this.showFeedback(quality);

      // Load next item after delay
      setTimeout(() => {
        const container =
          document.getElementById("spaced-repetition-container") ||
          document.querySelector(".spaced-repetition-container")?.parentElement;
        if (container) {
          this.loadDueItems(container);
        }
      }, 2000);
    } catch (error) {
      safeLog("error", "[SpacedRepetition] Error rating recall:", error);
      alert("Errore nel salvataggio. Riprova.");
    }
  }

  /**
   * Show feedback
   */
  showFeedback(quality) {
    const flashcard = document.querySelector(".sr-flashcard");
    if (!flashcard) {
      return;
    }

    const feedbackMessages = {
      0: "Nessun problema! Ripasseremo presto.",
      1: "Difficile, ma ci siamo! Ripasseremo tra poco.",
      2: "Quasi! Ripasseremo tra qualche giorno.",
      3: "Ottimo! Ripasseremo tra una settimana.",
      4: "Perfetto! Ripasseremo tra due settimane.",
      5: "Eccellente! Ripasseremo tra un mese.",
    };

    const feedback = document.createElement("div");
    feedback.className = "sr-feedback";
    feedback.innerHTML = `<p>${feedbackMessages[quality]}</p>`;
    flashcard.appendChild(feedback);
  }

  /**
   * Add styles
   */
  addStyles() {
    if (document.getElementById("spaced-repetition-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "spaced-repetition-styles";
    style.textContent = `
      .spaced-repetition-container {
        max-width: 700px;
        margin: 2rem auto;
      }
      .sr-progress {
        text-align: center;
        color: #666;
        margin-bottom: 1rem;
      }
      .sr-flashcard {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        min-height: 300px;
      }
      .sr-question h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        color: #1f2937;
      }
      .sr-hint {
        color: #666;
        font-style: italic;
        margin-top: 0.5rem;
      }
      .sr-reveal-btn {
        background: #00C76A;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1.5rem;
        width: 100%;
        transition: background 0.2s;
      }
      .sr-reveal-btn:hover {
        background: #00A855;
      }
      .sr-answer {
        margin-bottom: 2rem;
      }
      .sr-answer h3 {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        color: #1f2937;
      }
      .sr-explanation {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 1rem;
      }
      .sr-rating {
        margin-top: 2rem;
      }
      .sr-rating p {
        margin-bottom: 1rem;
        font-weight: 500;
      }
      .sr-rating-buttons {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      .sr-rating-btn {
        padding: 0.75rem;
        border: 2px solid #ddd;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      .sr-rating-btn:hover {
        border-color: #00C76A;
        background: #f0fdf4;
      }
      .sr-feedback {
        margin-top: 1rem;
        padding: 1rem;
        background: #f0fdf4;
        border-radius: 8px;
        text-align: center;
        color: #00C76A;
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
 * Initialize spaced repetition system
 */
export function initSpacedRepetition() {
  const srs = new SpacedRepetitionUI();
  window.SpacedRepetitionUI = srs;
  safeLog("info", "[SpacedRepetition] System initialized");
  return srs;
}
