/**
 * Charts & Visualizations Module
 * Best Practice: Chart.js integration per visualizzazioni interattive
 * Paper Accademico: "Information Dashboard Design" - Stephen Few (2014-2024)
 */

let Chart = null;

/**
 * Load Chart.js library
 * BEST PRACTICE: Usa CDN (CSP già configurato in vercel.json)
 * Import statico causa problemi con Rollup durante il build
 */
async function loadChartLibrary() {
  if (typeof Chart !== "undefined" && Chart !== null) {
    return Chart;
  }

  // Load Chart.js from CDN (CSP permette cdn.jsdelivr.net)
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      Chart = window.Chart;
      resolve(Chart);
    };
    script.onerror = () => {
      console.error("[Charts] Error loading Chart.js from CDN");
      reject(new Error("Failed to load Chart.js"));
    };
    document.head.appendChild(script);
  });
}

/**
 * Initialize charts module
 */
export async function initCharts() {
  await loadChartLibrary();
}

/**
 * Create line chart
 */
export function createLineChart(canvasId, data, options = {}) {
  if (!Chart) {
    console.error("[Charts] Chart.js not loaded");
    return null;
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`[Charts] Canvas not found: ${canvasId}`);
    return null;
  }

  const ctx = canvas.getContext("2d");

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#a8a8a8",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(168, 168, 168, 0.1)",
        },
        ticks: {
          color: "#a8a8a8",
        },
      },
      y: {
        grid: {
          color: "rgba(168, 168, 168, 0.1)",
        },
        ticks: {
          color: "#a8a8a8",
        },
      },
    },
  };

  const config = {
    type: "line",
    data,
    options: { ...defaultOptions, ...options },
  };

  return new Chart(ctx, config);
}

/**
 * Create bar chart
 */
export function createBarChart(canvasId, data, options = {}) {
  if (!Chart) {
    console.error("[Charts] Chart.js not loaded");
    return null;
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`[Charts] Canvas not found: ${canvasId}`);
    return null;
  }

  const ctx = canvas.getContext("2d");

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#a8a8a8",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(168, 168, 168, 0.1)",
        },
        ticks: {
          color: "#a8a8a8",
        },
      },
      y: {
        grid: {
          color: "rgba(168, 168, 168, 0.1)",
        },
        ticks: {
          color: "#a8a8a8",
        },
        beginAtZero: true,
      },
    },
  };

  const config = {
    type: "bar",
    data,
    options: { ...defaultOptions, ...options },
  };

  return new Chart(ctx, config);
}

/**
 * Create pie chart
 */
export function createPieChart(canvasId, data, options = {}) {
  if (!Chart) {
    console.error("[Charts] Chart.js not loaded");
    return null;
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`[Charts] Canvas not found: ${canvasId}`);
    return null;
  }

  const ctx = canvas.getContext("2d");

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: "#a8a8a8",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
      },
    },
  };

  const config = {
    type: "pie",
    data,
    options: { ...defaultOptions, ...options },
  };

  return new Chart(ctx, config);
}

/**
 * Create doughnut chart
 */
export function createDoughnutChart(canvasId, data, options = {}) {
  if (!Chart) {
    console.error("[Charts] Chart.js not loaded");
    return null;
  }

  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`[Charts] Canvas not found: ${canvasId}`);
    return null;
  }

  const ctx = canvas.getContext("2d");

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          color: "#a8a8a8",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
      },
    },
  };

  const config = {
    type: "doughnut",
    data,
    options: { ...defaultOptions, ...options },
  };

  return new Chart(ctx, config);
}

/**
 * Create stats chart for overview
 */
export function createStatsChart(canvasId, statsData) {
  const labels = statsData.map((item) => item.label);
  const values = statsData.map((item) => item.value);

  const colors = [
    "rgba(59, 130, 246, 0.8)", // blue
    "rgba(16, 185, 129, 0.8)", // green
    "rgba(245, 158, 11, 0.8)", // yellow
    "rgba(239, 68, 68, 0.8)", // red
    "rgba(139, 92, 246, 0.8)", // purple
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Statistiche",
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderColor: colors.slice(0, values.length).map((c) => c.replace("0.8", "1")),
        borderWidth: 2,
      },
    ],
  };

  return createBarChart(canvasId, data, {
    plugins: {
      legend: {
        display: false,
      },
    },
  });
}

/**
 * Create trend chart (time series)
 */
export function createTrendChart(canvasId, timeSeriesData) {
  const labels = timeSeriesData.map((item) => item.date || item.label);
  const datasets =
    timeSeriesData[0]?.series?.map((series, index) => ({
      label: series.label,
      data: timeSeriesData.map((item) => item.series[index].value),
      borderColor: [
        "rgba(59, 130, 246, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(245, 158, 11, 1)",
        "rgba(239, 68, 68, 1)",
      ][index % 4],
      backgroundColor: [
        "rgba(59, 130, 246, 0.1)",
        "rgba(16, 185, 129, 0.1)",
        "rgba(245, 158, 11, 0.1)",
        "rgba(239, 68, 68, 0.1)",
      ][index % 4],
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    })) || [];

  const data = {
    labels,
    datasets,
  };

  return createLineChart(canvasId, data);
}

/**
 * Destroy chart
 */
export function destroyChart(chartInstance) {
  if (chartInstance && typeof chartInstance.destroy === "function") {
    chartInstance.destroy();
  }
}

/**
 * Update chart data
 */
export function updateChart(chartInstance, newData) {
  if (!chartInstance) {
    return;
  }

  chartInstance.data = newData;
  chartInstance.update();
}
