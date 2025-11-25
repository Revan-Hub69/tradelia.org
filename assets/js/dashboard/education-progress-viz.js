/* eslint-env browser */
/**
 * Education Progress Visualization
 * Progress rings, heatmap, charts avanzati
 * Best Practice 2025: Data Visualization
 */

import { safeLog } from "./security-utils.js";

/**
 * Progress Ring Component
 */
export class ProgressRing {
  constructor(container, options = {}) {
    this.container = container;
    this.progress = options.progress || 0; // 0-100
    this.size = options.size || 120;
    this.strokeWidth = options.strokeWidth || 8;
    this.color = options.color || "#3b82f6";
    this.animated = options.animated !== false;
    this.render();
  }

  render() {
    const radius = (this.size - this.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (this.progress / 100) * circumference;

    this.container.innerHTML = `
      <svg class="progress-ring" width="${this.size}" height="${this.size}">
        <circle
          class="progress-ring-bg"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          fill="none"
          stroke="var(--edu-surface-elevated)"
          stroke-width="${this.strokeWidth}"
        />
        <circle
          class="progress-ring-fill ${this.animated ? "animated" : ""}"
          cx="${this.size / 2}"
          cy="${this.size / 2}"
          r="${radius}"
          fill="none"
          stroke="${this.color}"
          stroke-width="${this.strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          stroke-linecap="round"
          transform="rotate(-90 ${this.size / 2} ${this.size / 2})"
        />
      </svg>
      <div class="progress-ring-text">
        <span class="progress-ring-value">${Math.round(this.progress)}%</span>
      </div>
    `;

    // Aggiungi stili inline se necessario
    const style = document.createElement("style");
    style.textContent = `
      .progress-ring {
        position: relative;
      }
      .progress-ring-fill {
        transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .progress-ring-fill.animated {
        animation: progressRingPulse 2s ease-in-out infinite;
      }
      @keyframes progressRingPulse {
        0%, 100% {
          filter: drop-shadow(0 0 4px ${this.color}40);
        }
        50% {
          filter: drop-shadow(0 0 8px ${this.color}80);
        }
      }
      .progress-ring-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }
      .progress-ring-value {
        font-size: ${this.size / 5}px;
        font-weight: 700;
        color: var(--edu-text-primary);
      }
    `;
    if (!document.getElementById("progress-ring-styles")) {
      style.id = "progress-ring-styles";
      document.head.appendChild(style);
    }
  }

  update(progress) {
    this.progress = Math.max(0, Math.min(100, progress));
    this.render();
  }
}

/**
 * Activity Heatmap Component (tipo GitHub)
 */
export class ActivityHeatmap {
  constructor(container, options = {}) {
    this.container = container;
    this.data = options.data || [];
    this.weeks = options.weeks || 52;
    this.render();
  }

  generateData() {
    // Genera dati mock se non forniti
    if (this.data.length === 0) {
      const today = new Date();
      const data = [];
      for (let i = this.weeks * 7 - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const count = Math.floor(Math.random() * 5); // 0-4 attività
        data.push({
          date: date.toISOString().split("T")[0],
          count: count,
        });
      }
      this.data = data;
    }
    return this.data;
  }

  getIntensity(count) {
    if (count === 0) {
      return 0;
    }
    if (count === 1) {
      return 1;
    }
    if (count === 2) {
      return 2;
    }
    if (count >= 3) {
      return 3;
    }
    return 0;
  }

  render() {
    const data = this.generateData();
    const weeks = Math.ceil(data.length / 7);
    const intensityColors = [
      "var(--edu-surface-elevated)", // 0
      "rgba(59, 130, 246, 0.3)", // 1
      "rgba(59, 130, 246, 0.6)", // 2
      "rgba(59, 130, 246, 1)", // 3
    ];

    let html = '<div class="activity-heatmap">';
    html += '<div class="heatmap-grid">';

    // Crea griglia 7x52
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        const index = week * 7 + day;
        if (index >= data.length) {
          break;
        }

        const item = data[index];
        const intensity = this.getIntensity(item.count);
        const color = intensityColors[intensity];

        html += `
          <div 
            class="heatmap-cell" 
            style="background: ${color};"
            data-date="${item.date}"
            data-count="${item.count}"
            title="${new Date(item.date).toLocaleDateString("it-IT")}: ${item.count} attività"
          ></div>
        `;
      }
    }

    html += "</div>";
    html += '<div class="heatmap-legend">';
    html += "<span>Meno</span>";
    html += '<div class="legend-cells">';
    intensityColors.forEach((color) => {
      html += `<div class="legend-cell" style="background: ${color};"></div>`;
    });
    html += "</div>";
    html += "<span>Più</span>";
    html += "</div>";
    html += "</div>";

    this.container.innerHTML = html;

    // Aggiungi stili
    const style = document.createElement("style");
    style.textContent = `
      .activity-heatmap {
        padding: var(--edu-spacing-lg);
      }
      .heatmap-grid {
        display: grid;
        grid-template-columns: repeat(${weeks}, 1fr);
        grid-template-rows: repeat(7, 1fr);
        gap: 2px;
        margin-bottom: var(--edu-spacing-md);
      }
      .heatmap-cell {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        cursor: pointer;
        transition: all var(--edu-transition-fast);
      }
      .heatmap-cell:hover {
        transform: scale(1.3);
        z-index: 1;
        position: relative;
      }
      .heatmap-legend {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--edu-spacing-sm);
        font-size: var(--fs-12);
        color: var(--edu-text-muted);
      }
      .legend-cells {
        display: flex;
        gap: 2px;
      }
      .legend-cell {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }
    `;
    if (!document.getElementById("heatmap-styles")) {
      style.id = "heatmap-styles";
      document.head.appendChild(style);
    }
  }

  update(data) {
    this.data = data;
    this.render();
  }
}

/**
 * Progress Chart Component (line chart)
 */
export class ProgressChart {
  constructor(container, options = {}) {
    this.container = container;
    this.data = options.data || [];
    this.render();
  }

  generateData() {
    if (this.data.length === 0) {
      // Genera dati mock (ultimi 30 giorni)
      const data = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split("T")[0],
          value: Math.floor(Math.random() * 100),
        });
      }
      this.data = data;
    }
    return this.data;
  }

  render() {
    const data = this.generateData();
    const maxValue = Math.max(...data.map((d) => d.value), 100);
    const width = 400;
    const height = 200;
    const padding = 20;

    let svg = `<svg class="progress-chart" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

    // Background
    svg += `<rect width="${width}" height="${height}" fill="var(--edu-surface-base)" rx="8"/>`;

    // Grid lines
    for (let gridLine = 0; gridLine <= 4; gridLine++) {
      const y = padding + (gridLine * (height - 2 * padding)) / 4;
      svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--edu-border-subtle)" stroke-width="1"/>`;
    }

    // Line path
    const points = data.map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (item.value / maxValue) * (height - 2 * padding);
      return `${x},${y}`;
    });

    svg += `<polyline 
      points="${points.join(" ")}" 
      fill="none" 
      stroke="var(--tradelia-primary)" 
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />`;

    // Area fill
    const areaPoints = `${points[0]},${height - padding} ${points.join(" ")} ${points[points.length - 1]},${height - padding}`;
    svg += `<polygon 
      points="${areaPoints}" 
      fill="url(#gradient)" 
      opacity="0.3"
    />`;

    // Gradient
    svg += `<defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:var(--tradelia-primary);stop-opacity:0.5" />
        <stop offset="100%" style="stop-color:var(--tradelia-primary);stop-opacity:0" />
      </linearGradient>
    </defs>`;

    // Data points
    data.forEach((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
      const y = height - padding - (item.value / maxValue) * (height - 2 * padding);
      svg += `<circle 
        cx="${x}" 
        cy="${y}" 
        r="4" 
        fill="var(--tradelia-primary)" 
        stroke="var(--edu-surface-base)" 
        stroke-width="2"
      />`;
    });

    svg += "</svg>";

    this.container.innerHTML = svg;
  }

  update(data) {
    this.data = data;
    this.render();
  }
}

/**
 * Inizializza tutte le visualizzazioni
 */
export function initProgressVisualizations() {
  // Progress rings per moduli
  const moduleCards = document.querySelectorAll(".education-module-card");
  moduleCards.forEach((card) => {
    const progressBar = card.querySelector(".progress-bar");
    if (progressBar) {
      const progressFill = progressBar.querySelector(".progress-fill");
      const progress = parseFloat(progressFill?.style.width || "0");
      if (progress > 0) {
        // Crea progress ring
        const ringContainer = document.createElement("div");
        ringContainer.className = "module-progress-ring";
        progressBar.parentElement.appendChild(ringContainer);
        new ProgressRing(ringContainer, {
          progress: progress,
          size: 60,
          strokeWidth: 6,
        });
      }
    }
  });

  safeLog("log", "[ProgressViz] Visualizzazioni inizializzate");
}
