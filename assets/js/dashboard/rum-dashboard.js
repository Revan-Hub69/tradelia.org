/**
 * Real User Monitoring (RUM) Dashboard
 * Visualizzazione metriche performance e Web Vitals
 * Paper Accademico: "Performance Budgets & Web Vitals" - Google (2024)
 */

import { getPerformanceSummary, getPerformanceVitals, getPerformanceMetrics, getPerformanceResources } from "./performance-monitor.js";
import { createLineChart, createBarChart, createDoughnutChart } from "./charts.js";

/**
 * Initialize RUM Dashboard
 */
export function initRUMDashboard() {
  // Check if RUM dashboard panel exists
  const rumPanel = document.getElementById('panel-performance');
  if (rumPanel) {
    loadRUMDashboard();
  }
}

/**
 * Load RUM Dashboard content
 */
export async function loadRUMDashboard() {
  const container = document.getElementById('performance-container');
  if (!container) return;

  // Get performance data
  const summary = getPerformanceSummary();
  const vitals = getPerformanceVitals();
  const metrics = getPerformanceMetrics();
  const resources = getPerformanceResources();

  // Render dashboard
  renderRUMDashboard(container, summary, vitals, metrics, resources);
}

/**
 * Render RUM Dashboard
 */
function renderRUMDashboard(container, summary, vitals, metrics, resources) {
  container.innerHTML = `
    <div class="rum-dashboard">
      <div class="rum-dashboard-header">
        <h2 class="rum-dashboard-title">Performance Monitoring</h2>
        <p class="rum-dashboard-description">Metriche Real User Monitoring (RUM) e Web Vitals</p>
      </div>

      <!-- Web Vitals Section -->
      <div class="rum-section">
        <h3 class="rum-section-title">Core Web Vitals</h3>
        <div class="rum-vitals-grid">
          ${renderVitalCard('LCP', vitals.lcp, 'Largest Contentful Paint', { good: 2500, needsImprovement: 4000, unit: 'ms' })}
          ${renderVitalCard('FID', vitals.fid, 'First Input Delay', { good: 100, needsImprovement: 300, unit: 'ms' })}
          ${renderVitalCard('CLS', vitals.cls, 'Cumulative Layout Shift', { good: 0.1, needsImprovement: 0.25, unit: '' })}
        </div>
      </div>

      <!-- Performance Metrics Section -->
      <div class="rum-section">
        <h3 class="rum-section-title">Performance Metrics</h3>
        <div class="rum-metrics-grid">
          ${renderMetricCard('TTFB', metrics.ttfb, 'Time to First Byte', 'ms')}
          ${renderMetricCard('FCP', metrics.fcp, 'First Contentful Paint', 'ms')}
          ${renderMetricCard('DOM Content Loaded', metrics.domContentLoaded, 'DOM Content Loaded', 'ms')}
          ${renderMetricCard('Load Complete', metrics.loadComplete, 'Load Complete', 'ms')}
        </div>
      </div>

      <!-- Charts Section -->
      <div class="rum-section">
        <h3 class="rum-section-title">Visualizzazioni</h3>
        <div class="rum-charts-grid">
          <div class="rum-chart-card">
            <h4 class="rum-chart-title">Web Vitals Trend</h4>
            <div class="rum-chart-container">
              <canvas id="rum-vitals-chart" width="400" height="200"></canvas>
            </div>
          </div>
          <div class="rum-chart-card">
            <h4 class="rum-chart-title">Performance Metrics</h4>
            <div class="rum-chart-container">
              <canvas id="rum-metrics-chart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Resources Section -->
      ${resources && resources.length > 0 ? `
      <div class="rum-section">
        <h3 class="rum-section-title">Resource Timing</h3>
        <div class="rum-resources-list">
          ${renderResourcesList(resources)}
        </div>
      </div>
      ` : ''}

      <!-- Refresh Button -->
      <div class="rum-dashboard-footer">
        <button class="btn btn-primary" id="rum-refresh-btn">Aggiorna Metriche</button>
      </div>
    </div>
  `;

  // Render charts
  setTimeout(() => {
    renderRUMCharts(vitals, metrics);
  }, 500);

  // Add refresh button listener
  const refreshBtn = document.getElementById('rum-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadRUMDashboard();
    });
  }
}

/**
 * Render vital card
 */
function renderVitalCard(name, value, description, thresholds) {
  if (value === null || value === undefined) {
    return `
      <div class="rum-vital-card">
        <div class="rum-vital-header">
          <h4 class="rum-vital-name">${name}</h4>
          <span class="rum-vital-status rum-vital-status-unknown">Non disponibile</span>
        </div>
        <div class="rum-vital-description">${description}</div>
        <div class="rum-vital-value">—</div>
      </div>
    `;
  }

  const displayValue = thresholds.unit === 'ms' ? `${(value / 1000).toFixed(2)}s` : value.toFixed(3);
  let status = 'good';
  let statusText = 'Buono';

  if (value > thresholds.needsImprovement) {
    status = 'poor';
    statusText = 'Da migliorare';
  } else if (value > thresholds.good) {
    status = 'needs-improvement';
    statusText = 'Migliorabile';
  }

  return `
    <div class="rum-vital-card rum-vital-card-${status}">
      <div class="rum-vital-header">
        <h4 class="rum-vital-name">${name}</h4>
        <span class="rum-vital-status rum-vital-status-${status}">${statusText}</span>
      </div>
      <div class="rum-vital-description">${description}</div>
      <div class="rum-vital-value">${displayValue}</div>
      <div class="rum-vital-thresholds">
        <span class="rum-vital-threshold">Buono: &lt;${thresholds.unit === 'ms' ? (thresholds.good / 1000).toFixed(1) + 's' : thresholds.good}</span>
        <span class="rum-vital-threshold">Da migliorare: &gt;${thresholds.unit === 'ms' ? (thresholds.needsImprovement / 1000).toFixed(1) + 's' : thresholds.needsImprovement}</span>
      </div>
    </div>
  `;
}

/**
 * Render metric card
 */
function renderMetricCard(name, value, description, unit) {
  const displayValue = value !== null && value !== undefined ? `${value.toFixed(0)}${unit}` : '—';
  
  return `
    <div class="rum-metric-card">
      <div class="rum-metric-header">
        <h4 class="rum-metric-name">${name}</h4>
      </div>
      <div class="rum-metric-description">${description}</div>
      <div class="rum-metric-value">${displayValue}</div>
    </div>
  `;
}

/**
 * Render resources list
 */
function renderResourcesList(resources) {
  // Sort by duration (slowest first)
  const sortedResources = [...resources].sort((a, b) => b.duration - a.duration);

  return sortedResources
    .slice(0, 10)
    .map((resource) => {
      const sizeKB = (resource.size / 1024).toFixed(2);
      return `
        <div class="rum-resource-item">
          <div class="rum-resource-info">
            <div class="rum-resource-name">${resource.name.split('/').pop()}</div>
            <div class="rum-resource-type">${resource.type}</div>
          </div>
          <div class="rum-resource-metrics">
            <span class="rum-resource-metric">${resource.duration.toFixed(0)}ms</span>
            <span class="rum-resource-metric">${sizeKB}KB</span>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Render RUM charts
 */
function renderRUMCharts(vitals, metrics) {
  // Wait for Chart.js to load
  if (typeof Chart === 'undefined') {
    setTimeout(() => renderRUMCharts(vitals, metrics), 500);
    return;
  }

  // Vitals chart
  const vitalsCanvas = document.getElementById('rum-vitals-chart');
  if (vitalsCanvas) {
    const vitalsData = {
      labels: ['LCP', 'FID', 'CLS'],
      datasets: [
        {
          label: 'Web Vitals',
          data: [
            vitals.lcp ? vitals.lcp / 1000 : 0,
            vitals.fid ? vitals.fid : 0,
            vitals.cls ? vitals.cls * 1000 : 0,
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };

    createBarChart('rum-vitals-chart', vitalsData);
  }

  // Metrics chart
  const metricsCanvas = document.getElementById('rum-metrics-chart');
  if (metricsCanvas && metrics) {
    const metricsData = {
      labels: ['TTFB', 'FCP', 'DOM Ready', 'Load Complete'],
      datasets: [
        {
          label: 'Performance Metrics (ms)',
          data: [
            metrics.ttfb || 0,
            metrics.fcp || 0,
            metrics.domContentLoaded || 0,
            metrics.loadComplete || 0,
          ],
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderColor: [
            'rgba(139, 92, 246, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };

    createBarChart('rum-metrics-chart', metricsData);
  }
}

