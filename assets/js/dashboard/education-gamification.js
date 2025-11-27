/* eslint-env browser */
/**
 * Education Gamification System - Professional
 * Paper: Sailer et al. (2017), Deterding et al. (2011)
 * Best Practice: Non-competitive, self-improvement focus
 */

import { safeLog, escapeHtml } from "./security-utils.js";
import { getSupabaseClient } from "./supabase-client.js";

const API_BASE = "/api/education";

/**
 * XP System
 */
export class XPSystem {
  constructor() {
    this.xpGainQueue = [];
  }

  /**
   * Add XP with animation
   * BEST PRACTICE: Validazione input e queue system per evitare race conditions
   */
  async addXP(amount, sourceType, sourceId = null, description = null) {
    // Validazione input
    if (!amount || amount <= 0 || amount > 1000) {
      safeLog("warn", "[Gamification] XP amount invalido:", amount);
      return null;
    }
    if (!sourceType) {
      safeLog("warn", "[Gamification] sourceType richiesto");
      return null;
    }

    try {
      const token = await this.getAuthToken();

      if (token) {
        const response = await fetch(`${API_BASE}?action=add-xp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            xp_amount: amount,
            source_type: sourceType,
            source_id: sourceId,
            description,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          this.showXPGainAnimation(amount, data.level_up);
          this.updateXPDisplay(data.new_total_xp, data.new_level);
          return data;
        }
      } else {
        // Guest: salva in localStorage
        const progress = this.loadProgress();
        progress.stats.total_points = (progress.stats.total_points || 0) + amount;
        this.saveProgress(progress);
        this.showXPGainAnimation(amount, false);
        this.updateXPDisplay(
          progress.stats.total_points,
          this.calculateLevel(progress.stats.total_points)
        );
      }
    } catch (error) {
      safeLog("error", "[Gamification] Errore addXP:", error);
    }
  }

  /**
   * Show XP gain animation
   */
  showXPGainAnimation(amount, levelUp = false) {
    const container = document.createElement("div");
    container.className = "education-xp-gain";
    container.innerHTML = `
      <div class="education-xp-gain-content">
        <span>+${amount} XP</span>
        ${levelUp ? '<span class="level-up-badge">LEVEL UP!</span>' : ""}
      </div>
    `;

    document.body.appendChild(container);

    setTimeout(() => {
      container.remove();
    }, 1000);
  }

  /**
   * Update XP display
   */
  updateXPDisplay(totalXP, level) {
    const xpDisplay = document.querySelector(".education-xp-value");
    const levelDisplay = document.querySelector(".education-level-badge");

    if (xpDisplay) {
      xpDisplay.textContent = totalXP;
    }

    if (levelDisplay) {
      levelDisplay.textContent = this.getLevelName(level);
      levelDisplay.setAttribute("data-level", this.getLevelSlug(level));

      if (level > parseInt(levelDisplay.dataset.currentLevel || "1")) {
        levelDisplay.classList.add("education-level-up");
        setTimeout(() => {
          levelDisplay.classList.remove("education-level-up");
        }, 600);
      }
    }

    // Update progress bar
    this.updateXPProgressBar(totalXP, level);
  }

  /**
   * Update XP progress bar
   */
  updateXPProgressBar(totalXP, currentLevel) {
    const levelData = this.getLevelData(currentLevel);
    if (!levelData) {
      return;
    }

    const progress = levelData.max_xp
      ? ((totalXP - levelData.min_xp) / (levelData.max_xp - levelData.min_xp)) * 100
      : 100;

    const progressBar = document.querySelector(".education-xp-progress-fill");
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    const progressText = document.querySelector(".education-xp-progress-text");
    if (progressText) {
      const remaining = levelData.max_xp ? levelData.max_xp - totalXP : 0;
      progressText.textContent = levelData.max_xp
        ? `${remaining} XP al prossimo livello`
        : "Livello massimo raggiunto!";
    }
  }

  /**
   * Get level name
   */
  getLevelName(level) {
    const levels = {
      1: "Foundation",
      2: "Explorer",
      3: "Scholar",
      4: "Master",
      5: "Grandmaster",
    };
    return levels[level] || "Foundation";
  }

  /**
   * Get level slug
   */
  getLevelSlug(level) {
    const slugs = {
      1: "foundation",
      2: "explorer",
      3: "scholar",
      4: "master",
      5: "grandmaster",
    };
    return slugs[level] || "foundation";
  }

  /**
   * Calculate level from XP
   */
  calculateLevel(totalXP) {
    if (totalXP < 101) {
      return 1;
    }
    if (totalXP < 301) {
      return 2;
    }
    if (totalXP < 601) {
      return 3;
    }
    if (totalXP < 1001) {
      return 4;
    }
    return 5;
  }

  /**
   * Get level data
   */
  getLevelData(level) {
    const levels = {
      1: { min_xp: 0, max_xp: 100 },
      2: { min_xp: 101, max_xp: 300 },
      3: { min_xp: 301, max_xp: 600 },
      4: { min_xp: 601, max_xp: 1000 },
      5: { min_xp: 1001, max_xp: null },
    };
    return levels[level];
  }

  async getAuthToken() {
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        return null;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  }

  loadProgress() {
    try {
      const stored = localStorage.getItem("tradelia_education_progress");
      return stored ? JSON.parse(stored) : { stats: { total_points: 0 } };
    } catch {
      return { stats: { total_points: 0 } };
    }
  }

  saveProgress(progress) {
    try {
      localStorage.setItem("tradelia_education_progress", JSON.stringify(progress));
    } catch (error) {
      safeLog("warn", "[Gamification] Errore saveProgress:", error);
    }
  }
}

/**
 * Badge System
 */
export class BadgeSystem {
  /**
   * Unlock badge with animation
   */
  async unlockBadge(badgeId, badgeName) {
    try {
      const token = await this.getAuthToken();

      if (token) {
        const response = await fetch(`${API_BASE}?action=unlock-badge`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ badge_id: badgeId }),
        });

        if (response.ok) {
          this.showBadgeUnlockAnimation(badgeName);
          this.updateBadgeDisplay();
        }
      } else {
        // Guest: salva in localStorage
        const progress = this.loadProgress();
        if (!progress.badges) {
          progress.badges = [];
        }
        if (!progress.badges.find((b) => b.id === badgeId)) {
          progress.badges.push({
            id: badgeId,
            name: badgeName,
            earned_at: new Date().toISOString(),
          });
          this.saveProgress(progress);
          this.showBadgeUnlockAnimation(badgeName);
        }
      }
    } catch (error) {
      safeLog("error", "[Gamification] Errore unlockBadge:", error);
    }
  }

  /**
   * Show badge unlock animation
   */
  showBadgeUnlockAnimation(badgeName) {
    const modal = document.createElement("div");
    modal.className = "badge-unlock-modal";
    modal.innerHTML = `
      <div class="badge-unlock-overlay"></div>
      <div class="badge-unlock-content">
        <div class="badge-unlock-icon education-badge-unlock">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
        </div>
        <h3>Badge Sbloccato!</h3>
        <p>${escapeHtml(badgeName)}</p>
        <button class="btn btn-primary" data-dismiss>Fantastico!</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-dismiss dopo 3 secondi
    setTimeout(() => {
      modal.remove();
    }, 3000);

    // Click per chiudere
    modal.querySelector("[data-dismiss]")?.addEventListener("click", () => {
      modal.remove();
    });
  }

  /**
   * Update badge display
   * BEST PRACTICE: Carica badge da API o localStorage e aggiorna UI
   */
  async updateBadgeDisplay() {
    try {
      const token = await this.getAuthToken();
      const progress = this.loadProgress();
      const badges = progress.badges || [];

      // Aggiorna UI se esiste container badges
      const badgesContainer = document.querySelector(".education-badges-preview, .badges-list");
      if (badgesContainer && badges.length > 0) {
        badgesContainer.innerHTML = badges
          .map(
            (badge) => `
          <div class="badge-item" title="${escapeHtml(badge.description || badge.name)}">
            <span class="badge-icon">🏆</span>
            <span class="badge-name">${escapeHtml(badge.name)}</span>
          </div>
        `
          )
          .join("");
      }
    } catch (error) {
      safeLog("warn", "[Gamification] Errore updateBadgeDisplay:", error);
    }
  }

  async getAuthToken() {
    return null;
  }

  loadProgress() {
    try {
      const stored = localStorage.getItem("tradelia_education_progress");
      return stored ? JSON.parse(stored) : { badges: [] };
    } catch {
      return { badges: [] };
    }
  }

  saveProgress(progress) {
    try {
      localStorage.setItem("tradelia_education_progress", JSON.stringify(progress));
    } catch (error) {
      safeLog("warn", "[Gamification] Errore saveProgress:", error);
    }
  }
}

/**
 * Streak System
 */
export class StreakSystem {
  /**
   * Update streak
   */
  async updateStreak() {
    try {
      const token = await this.getAuthToken();

      if (token) {
        const response = await fetch(`${API_BASE}?action=update-streak`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.updateStreakDisplay(data.current_streak, data.streak_broken);
          this.checkStreakRewards(data.current_streak);
          return data;
        }
      } else {
        // Guest: salva in localStorage
        const progress = this.loadProgress();
        const today = new Date().toDateString();
        const lastActivity = progress.stats?.last_activity_date;

        if (lastActivity !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastActivity === yesterday.toDateString()) {
            // Continua streak
            progress.stats.current_streak_days = (progress.stats.current_streak_days || 0) + 1;
          } else {
            // Streak rotto
            progress.stats.current_streak_days = 1;
          }

          progress.stats.last_activity_date = today;
          this.saveProgress(progress);
          this.updateStreakDisplay(progress.stats.current_streak_days, false);
        }
      }
    } catch (error) {
      safeLog("error", "[Gamification] Errore updateStreak:", error);
    }
  }

  /**
   * Update streak display
   */
  updateStreakDisplay(currentStreak, streakBroken) {
    const streakDisplay = document.querySelector(".education-streak-value");
    if (streakDisplay) {
      streakDisplay.textContent = currentStreak;
    }

    if (streakBroken) {
      // Mostra notifica streak rotto
      this.showStreakBrokenNotification();
    }

    // Update calendar
    this.updateStreakCalendar(currentStreak);
  }

  /**
   * Update streak calendar
   */
  updateStreakCalendar(currentStreak) {
    const calendar = document.querySelector(".education-streak-calendar");
    if (!calendar) {
      return;
    }

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayElement = calendar.querySelector(`[data-date="${date.toDateString()}"]`);

      if (dayElement) {
        if (i === 0) {
          dayElement.classList.add("today");
        }
        if (i < currentStreak) {
          dayElement.classList.add("completed");
        }
      }
    }
  }

  /**
   * Check streak rewards
   */
  checkStreakRewards(currentStreak) {
    const rewards = {
      7: { xp: 50, badge: "Week Warrior" },
      30: { xp: 200, badge: "Month Master" },
      100: { xp: 500, badge: "Century Club" },
    };

    if (rewards[currentStreak]) {
      const reward = rewards[currentStreak];
      // Aggiungi XP e badge
      if (window.xpSystem) {
        window.xpSystem.addXP(reward.xp, "streak_bonus", null, `Streak ${currentStreak} giorni`);
      }
      if (window.badgeSystem) {
        window.badgeSystem.unlockBadge(null, reward.badge);
      }
    }
  }

  showStreakBrokenNotification() {
    if (window.showToast) {
      window.showToast("Streak rotto! Ricomincia oggi per mantenere il tuo progresso.", "warning");
    }
  }

  async getAuthToken() {
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        return null;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  }

  loadProgress() {
    try {
      const stored = localStorage.getItem("tradelia_education_progress");
      return stored ? JSON.parse(stored) : { stats: { current_streak_days: 0 } };
    } catch {
      return { stats: { current_streak_days: 0 } };
    }
  }

  saveProgress(progress) {
    try {
      localStorage.setItem("tradelia_education_progress", JSON.stringify(progress));
    } catch (error) {
      safeLog("warn", "[Gamification] Errore saveProgress:", error);
    }
  }
}

/**
 * Quest System
 */
export class QuestSystem {
  /**
   * Load active quests
   */
  async loadQuests() {
    try {
      const token = await this.getAuthToken();

      if (token) {
        const response = await fetch(`${API_BASE}?action=quests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return data.quests || [];
        }
      }
    } catch (error) {
      safeLog("error", "[Gamification] Errore loadQuests:", error);
    }
    return [];
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(questId, objectiveIndex) {
    try {
      const token = await this.getAuthToken();

      if (token) {
        const response = await fetch(`${API_BASE}?action=update-quest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quest_id: questId,
            objective_index: objectiveIndex,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.completed) {
            this.onQuestCompleted(questId, data.xp_reward);
          }
          return data;
        }
      }
    } catch (error) {
      safeLog("error", "[Gamification] Errore updateQuestProgress:", error);
    }
  }

  /**
   * On quest completed
   */
  onQuestCompleted(questId, xpReward) {
    if (window.xpSystem) {
      window.xpSystem.addXP(xpReward, "quest", questId, "Quest completata");
    }

    if (window.showToast) {
      window.showToast(`Quest completata! +${xpReward} XP`, "success");
    }
  }

  async getAuthToken() {
    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        return null;
      }
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
 * Initialize gamification system
 */
export function initGamification() {
  // Initialize systems
  window.xpSystem = new XPSystem();
  window.badgeSystem = new BadgeSystem();
  window.streakSystem = new StreakSystem();
  window.questSystem = new QuestSystem();

  // Update streak on page load
  window.streakSystem.updateStreak();

  // Load and display quests
  window.questSystem.loadQuests().then((quests) => {
    if (quests.length > 0) {
      renderQuests(quests);
    }
  });
}

/**
 * Render quests
 */
function renderQuests(quests) {
  const container = document.getElementById("education-quests-container");
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="education-quests-section">
      <h3>Missioni Attive</h3>
      <div class="education-quests-list">
        ${quests.map((quest) => renderQuestCard(quest)).join("")}
      </div>
    </div>
  `;
}

/**
 * Render quest card
 */
function renderQuestCard(quest) {
  const progress = quest.progress || {};
  const objectives = quest.objectives || [];

  return `
    <div class="education-quest-card" data-quest-id="${quest.id}">
      <div class="education-quest-header">
        <div>
          <div class="education-quest-title">${escapeHtml(quest.title)}</div>
          <div class="education-quest-description">${escapeHtml(quest.description)}</div>
        </div>
        <div class="education-quest-xp">+${quest.xp_reward} XP</div>
      </div>
      <div class="education-quest-objectives">
        ${objectives
          .map(
            (obj, index) => `
          <div class="education-quest-objective ${progress[index] ? "completed" : ""}">
            <div class="education-quest-objective-checkbox">
              ${progress[index] ? "✓" : ""}
            </div>
            <div>${escapeHtml(obj.text)}</div>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="education-quest-progress">
        ${objectives.filter((_, i) => progress[i]).length} / ${objectives.length} completati
      </div>
    </div>
  `;
}

// Auto-initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGamification);
} else {
  initGamification();
}
