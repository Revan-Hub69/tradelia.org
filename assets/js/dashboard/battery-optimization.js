/* eslint-env browser */
/**
 * Battery Optimization
 * BEST PRACTICE: Battery API, Energy-Efficient Web Design
 * Riduce animazioni quando batteria è bassa
 */

/**
 * Initialize battery optimization
 */
export function initBatteryOptimization() {
  if (!("getBattery" in navigator)) {
    return; // Battery API non supportata
  }

  navigator.getBattery().then((battery) => {
    checkBatteryLevel(battery);

    battery.addEventListener("levelchange", () => {
      checkBatteryLevel(battery);
    });
  });
}

/**
 * Check battery level and apply optimizations
 */
function checkBatteryLevel(battery) {
  const isLowBattery = battery.level < 0.2; // Sotto 20%

  if (isLowBattery) {
    document.documentElement.classList.add("low-battery");
  } else {
    document.documentElement.classList.remove("low-battery");
  }
}
