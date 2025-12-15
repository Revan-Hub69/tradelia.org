/**
 * Data Quality Scorer
 * 
 * Calcola metriche qualità dati basate su framework accademici
 * 
 * Riferimenti:
 * - Redman (1996) - "Data Quality for the Information Age"
 * - Wang & Strong (1996) - "Beyond Accuracy: What Data Quality Means to Data Consumers"
 * - ISO/IEC 25012 - Data Quality Model
 */

export interface DataQualityMetrics {
  completeness: number; // 0-1: % dati presenti
  accuracy: number; // 0-1: % dati corretti
  consistency: number; // 0-1: % dati coerenti tra fonti
  timeliness: number; // 0-1: % dati aggiornati
  validity: number; // 0-1: % dati validi (conformi schema)
  uniqueness?: number; // 0-1: % dati unici (no duplicati)
}

export interface DataQualityScore {
  overall: number; // 0-1
  metrics: DataQualityMetrics;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: string[];
}

/**
 * Calcola score qualità dati complessivo
 */
export function calculateDataQualityScore(
  metrics: DataQualityMetrics
): DataQualityScore {
  // Pesi basati su importanza per trading crypto
  const weights = {
    completeness: 0.15, // Importante ma non critico
    accuracy: 0.30, // Molto importante per decisioni
    consistency: 0.20, // Importante per multi-exchange
    timeliness: 0.20, // Critico per real-time trading
    validity: 0.15, // Base, ma importante
  };

  const overall =
    metrics.completeness * weights.completeness +
    metrics.accuracy * weights.accuracy +
    metrics.consistency * weights.consistency +
    metrics.timeliness * weights.timeliness +
    metrics.validity * weights.validity;

  const issues: string[] = [];
  if (metrics.completeness < 0.9) {
    issues.push(`Completeness low: ${(metrics.completeness * 100).toFixed(1)}%`);
  }
  if (metrics.accuracy < 0.95) {
    issues.push(`Accuracy low: ${(metrics.accuracy * 100).toFixed(1)}%`);
  }
  if (metrics.consistency < 0.85) {
    issues.push(`Consistency low: ${(metrics.consistency * 100).toFixed(1)}%`);
  }
  if (metrics.timeliness < 0.9) {
    issues.push(`Timeliness low: ${(metrics.timeliness * 100).toFixed(1)}%`);
  }
  if (metrics.validity < 0.95) {
    issues.push(`Validity low: ${(metrics.validity * 100).toFixed(1)}%`);
  }

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 0.9) grade = 'A';
  else if (overall >= 0.8) grade = 'B';
  else if (overall >= 0.7) grade = 'C';
  else if (overall >= 0.6) grade = 'D';
  else grade = 'F';

  return {
    overall,
    metrics,
    grade,
    issues,
  };
}

/**
 * Calcola completeness: % dati presenti vs attesi
 */
export function calculateCompleteness(
  present: number,
  expected: number
): number {
  if (expected === 0) return 1;
  return Math.min(1, present / expected);
}

/**
 * Calcola accuracy: % dati corretti (richiede ground truth)
 */
export function calculateAccuracy(
  correct: number,
  total: number
): number {
  if (total === 0) return 1;
  return correct / total;
}

/**
 * Calcola consistency: % dati coerenti tra fonti multiple
 */
export function calculateConsistency(
  sources: Array<{ value: number; source: string }>,
  tolerance = 0.01 // 1% tolerance
): number {
  if (sources.length < 2) return 1;

  const values = sources.map((s) => s.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const consistent = values.filter(
    (value) => Math.abs(value - mean) / mean <= tolerance
  ).length;

  return consistent / values.length;
}

/**
 * Calcola timeliness: % dati aggiornati (entro maxAge)
 */
export function calculateTimeliness(
  timestamps: number[],
  maxAge = 5000 // 5 secondi
): number {
  if (timestamps.length === 0) return 0;

  const now = Date.now();
  const fresh = timestamps.filter(
    (ts) => now - ts <= maxAge
  ).length;

  return fresh / timestamps.length;
}

/**
 * Calcola validity: % dati conformi schema
 */
export function calculateValidity(
  valid: number,
  total: number
): number {
  if (total === 0) return 1;
  return valid / total;
}

/**
 * Calcola qualità dati per crypto market data
 */
export function calculateCryptoDataQuality(data: {
  prices: Array<{ value: number; timestamp: number; source: string }>;
  expectedCount: number;
  maxAge?: number;
}): DataQualityScore {
  const { prices, expectedCount, maxAge = 5000 } = data;

  // Completeness
  const completeness = calculateCompleteness(prices.length, expectedCount);

  // Accuracy (assumiamo 100% se non abbiamo ground truth)
  // In produzione, confrontare con dati verificati
  const accuracy = 1.0; // Placeholder

  // Consistency
  const sourcesByTime = new Map<number, Array<{ value: number; source: string }>>();
  prices.forEach((price) => {
    const timeBucket = Math.floor(price.timestamp / 1000) * 1000; // Bucket per secondo
    if (!sourcesByTime.has(timeBucket)) {
      sourcesByTime.set(timeBucket, []);
    }
    sourcesByTime.get(timeBucket)!.push({
      value: price.value,
      source: price.source,
    });
  });

  const consistencyScores = Array.from(sourcesByTime.values())
    .filter((sources) => sources.length > 1)
    .map((sources) => calculateConsistency(sources));

  const consistency =
    consistencyScores.length > 0
      ? consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length
      : 1.0;

  // Timeliness
  const timestamps = prices.map((p) => p.timestamp);
  const timeliness = calculateTimeliness(timestamps, maxAge);

  // Validity (assumiamo tutti validi se arrivano qui)
  const validity = 1.0;

  const metrics: DataQualityMetrics = {
    completeness,
    accuracy,
    consistency,
    timeliness,
    validity,
  };

  return calculateDataQualityScore(metrics);
}


