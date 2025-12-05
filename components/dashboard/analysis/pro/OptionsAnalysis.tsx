'use client';

import { useState, useEffect } from 'react';

interface OptionsAnalysisProps {
  isPro: boolean;
}

/**
 * Options Analysis Component
 * 
 * Features:
 * - Put/Call ratio
 * - Options flow analysis
 * - Volatility analysis
 * - Groq AI reading
 * 
 * Updates: Every 5 minutes (real-time)
 */
export default function OptionsAnalysis({ isPro }: OptionsAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }
    // TODO: Implement options data fetching
    setIsLoading(false);
  }, [isPro]);

  if (!isPro) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Upgrade to Pro to access Options Analysis</p>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">🚧 Coming Soon</p>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Options Analysis sarà disponibile a breve. Put/Call ratio, options flow, volatility analysis con Groq AI readings.
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          Estimated: Q1 2025
        </p>
      </div>
    </div>
  );
}
