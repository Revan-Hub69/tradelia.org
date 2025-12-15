/**
 * Outlier Detection
 * 
 * Rilevamento dati anomali per migliorare qualità dati
 * 
 * Riferimenti:
 * - Iglewicz & Hoaglin (1993) - "How to Detect and Handle Outliers"
 * - Z-score method
 * - IQR (Interquartile Range) method
 */

/**
 * Z-score outlier detection
 * Identifica valori che deviano più di threshold standard deviations dalla media
 */
export function detectZScoreOutliers(
  data: number[],
  threshold = 3
): { outliers: number[]; cleaned: number[] } {
  if (data.length === 0) {
    return { outliers: [], cleaned: [] };
  }

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance =
    data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length;
  const std = Math.sqrt(variance);

  if (std === 0) {
    return { outliers: [], cleaned: data };
  }

  const outliers: number[] = [];
  const cleaned: number[] = [];

  data.forEach((value) => {
    const zScore = Math.abs((value - mean) / std);
    if (zScore > threshold) {
      outliers.push(value);
    } else {
      cleaned.push(value);
    }
  });

  return { outliers, cleaned };
}

/**
 * IQR (Interquartile Range) outlier detection
 * Identifica valori fuori dal range [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
 */
export function detectIQROutliers(
  data: number[]
): { outliers: number[]; cleaned: number[]; bounds: { lower: number; upper: number } } {
  if (data.length === 0) {
    return { outliers: [], cleaned: [], bounds: { lower: 0, upper: 0 } };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: number[] = [];
  const cleaned: number[] = [];

  data.forEach((value) => {
    if (value < lowerBound || value > upperBound) {
      outliers.push(value);
    } else {
      cleaned.push(value);
    }
  });

  return {
    outliers,
    cleaned,
    bounds: { lower: lowerBound, upper: upperBound },
  };
}

/**
 * Modified Z-score (usando median absolute deviation)
 * Più robusto ai outliers rispetto a Z-score standard
 */
export function detectModifiedZScoreOutliers(
  data: number[],
  threshold = 3.5
): { outliers: number[]; cleaned: number[] } {
  if (data.length === 0) {
    return { outliers: [], cleaned: [] };
  }

  const median = getMedian(data);
  const mad = getMedianAbsoluteDeviation(data, median);

  if (mad === 0) {
    return { outliers: [], cleaned: data };
  }

  const outliers: number[] = [];
  const cleaned: number[] = [];

  data.forEach((value) => {
    const modifiedZScore = Math.abs(0.6745 * (value - median) / mad);
    if (modifiedZScore > threshold) {
      outliers.push(value);
    } else {
      cleaned.push(value);
    }
  });

  return { outliers, cleaned };
}

/**
 * Helper: Calculate median
 */
function getMedian(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Helper: Calculate Median Absolute Deviation (MAD)
 */
function getMedianAbsoluteDeviation(data: number[], median: number): number {
  const deviations = data.map((value) => Math.abs(value - median));
  return getMedian(deviations);
}

/**
 * Detect outliers in price data
 * Specifico per dati crypto (prezzi, volumi, etc.)
 */
export function detectPriceOutliers(
  prices: number[],
  method: 'zscore' | 'iqr' | 'modified-zscore' = 'iqr'
): {
  outliers: number[];
  cleaned: number[];
  outlierIndices: number[];
} {
  let result: { outliers: number[]; cleaned: number[] };

  switch (method) {
    case 'zscore':
      result = detectZScoreOutliers(prices, 3);
      break;
    case 'iqr':
      result = detectIQROutliers(prices);
      break;
    case 'modified-zscore':
      result = detectModifiedZScoreOutliers(prices, 3.5);
      break;
    default:
      result = detectIQROutliers(prices);
  }

  // Trova indici degli outliers
  const outlierIndices: number[] = [];
  prices.forEach((price, index) => {
    if (result.outliers.includes(price)) {
      outlierIndices.push(index);
    }
  });

  return {
    outliers: result.outliers,
    cleaned: result.cleaned,
    outlierIndices,
  };
}


