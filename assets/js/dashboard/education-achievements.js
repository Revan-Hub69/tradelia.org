/* eslint-env browser */
/**
 * Education Achievements System
 * Badge, achievement, milestone visualization
 * Best Practice 2025: Gamification
 */

import { safeLog } from "./security-utils.js";
import { EducationIcons } from "./education-icons.js";

let achievementsInstance = null;

/**
 * Inizializza achievement system
 */
export function initAchievements() {
  if (achievementsInstance) {
    return achievementsInstance;
  }

  achievementsInstance = new AchievementSystem();
  return achievementsInstance;
}

/**
 * Achievement System Class
 */
class AchievementSystem {
  constructor() {
    this.badges = [];
    this.achievements = [];
    this.loadBadges();
  }

  async loadBadges() {
    try {
      const token = await this.getAuthToken();
      const response = await fetch("/api/education?action=badges", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        this.badges = data.badges || [];
        this.renderBadgeWall();
      }
    } catch (error) {
      safeLog("error", "[Achievements] Errore caricamento badge:", error);
    }
  }

  /**
   * Mostra achievement quando sbloccato
   */
  async showAchievement(badge) {
    // Crea notification toast
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML = `
      <div class="achievement-toast-content">
        <div class="achievement-icon">${badge.icon ? badge.icon.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="48" height="48"') : EducationIcons.badge.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="48" height="48"')}</div>
        <div class="achievement-text">
          <div class="achievement-title">Badge Sbloccato!</div>
          <div class="achievement-name">${badge.name}</div>
          ${badge.description ? `<div class="achievement-desc">${badge.description}</div>` : ""}
        </div>
      </div>
      <div class="achievement-confetti"></div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    // Confetti animation
    this.createConfetti();

    // Auto-remove dopo 5 secondi
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Sound effect (opzionale)
    this.playAchievementSound();
  }

  /**
   * Render badge wall
   */
  renderBadgeWall() {
    const container = document.getElementById("achievements-container");
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="achievements-header">
        <h3>I Tuoi Achievement</h3>
        <div class="achievements-stats">
          <span>${this.badges.length} badge sbloccati</span>
        </div>
      </div>
      <div class="badges-grid">
        ${this.badges
          .map(
            (badge) => `
          <div class="badge-card ${badge.earned ? "earned" : "locked"}" data-badge-id="${badge.id}">
            <div class="badge-icon-large">${badge.icon ? badge.icon.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="64" height="64"') : EducationIcons.badge.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="64" height="64"')}</div>
            <div class="badge-name">${badge.name}</div>
            ${badge.description ? `<div class="badge-desc">${badge.description}</div>` : ""}
            ${badge.earned ? `<div class="badge-date">Sbloccato il ${new Date(badge.earned_at).toLocaleDateString("it-IT")}</div>` : ""}
            ${!badge.earned && badge.progress ? `<div class="badge-progress"><div class="badge-progress-fill" style="width: ${badge.progress}%"></div></div>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Bind hover events
    const badgeCards = container.querySelectorAll(".badge-card");
    badgeCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        this.showBadgeTooltip(card);
      });
    });
  }

  /**
   * Show badge tooltip
   */
  showBadgeTooltip(card) {
    const badgeId = card.dataset.badgeId;
    const badge = this.badges.find((b) => b.id === badgeId);
    if (!badge) {
      return;
    }

    // Rimuovi tooltip esistente
    const existing = document.querySelector(".badge-tooltip");
    if (existing) {
      existing.remove();
    }

    const tooltip = document.createElement("div");
    tooltip.className = "badge-tooltip";
    tooltip.innerHTML = `
      <div class="tooltip-header">
        <span class="tooltip-icon">${badge.icon ? badge.icon.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="24" height="24"') : EducationIcons.badge.replace('viewBox="0 0 24 24"', 'viewBox="0 0 24 24" width="24" height="24"')}</span>
        <strong>${badge.name}</strong>
      </div>
      ${badge.description ? `<div class="tooltip-desc">${badge.description}</div>` : ""}
      ${badge.criteria ? `<div class="tooltip-criteria">${this.formatCriteria(badge.criteria)}</div>` : ""}
      ${badge.points_reward ? `<div class="tooltip-points">+${badge.points_reward} punti</div>` : ""}
    `;

    document.body.appendChild(tooltip);

    // Position tooltip
    const rect = card.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;

    // Remove on mouse leave
    card.addEventListener("mouseleave", () => {
      tooltip.remove();
    });
  }

  formatCriteria(criteria) {
    if (typeof criteria === "string") {
      return criteria;
    }
    if (typeof criteria === "object") {
      return Object.entries(criteria)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
    }
    return "";
  }

  /**
   * Create confetti animation
   */
  createConfetti() {
    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  }

  /**
   * Play achievement sound (opzionale)
   */
  playAchievementSound() {
    // Crea audio context per suono
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Ignora errori audio
      safeLog("warn", "[Achievements] Audio non disponibile:", error);
    }
  }

  async getAuthToken() {
    try {
      const { getToken } = await import("./token-storage.js");
      return await getToken();
    } catch {
      return null;
    }
  }
}

/**
 * Check e mostra achievement se sbloccato
 */
export async function checkAndShowAchievements() {
  const system = initAchievements();
  await system.loadBadges();

  // Verifica nuovi badge sbloccati
  const newBadges = system.badges.filter((badge) => badge.earned && !badge.shown);
  newBadges.forEach((badge) => {
    system.showAchievement(badge);
    badge.shown = true;
  });
}
