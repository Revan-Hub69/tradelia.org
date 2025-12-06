'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tradelia_dashboard_preferences';

interface DashboardPreferences {
  hideHero: boolean;
  compactView: boolean;
  showFavoritesInHeader: boolean;
}

const defaultPreferences: DashboardPreferences = {
  hideHero: false,
  compactView: false,
  showFavoritesInHeader: true,
};

/**
 * Hook for dashboard user preferences
 * Based on academic UX research: User control and personalization improve engagement
 * Stores preferences in localStorage for persistence
 */
export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading dashboard preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback((updates: Partial<DashboardPreferences>) => {
    if (typeof window === 'undefined') return;

    setPreferences((prev) => {
      const newPrefs = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      } catch (error) {
        console.error('Error saving dashboard preferences:', error);
      }
      return newPrefs;
    });
  }, []);

  const toggleHero = useCallback(() => {
    updatePreferences({ hideHero: !preferences.hideHero });
  }, [preferences.hideHero, updatePreferences]);

  const toggleCompactView = useCallback(() => {
    updatePreferences({ compactView: !preferences.compactView });
  }, [preferences.compactView, updatePreferences]);

  return {
    preferences,
    isLoaded,
    updatePreferences,
    toggleHero,
    toggleCompactView,
  };
}
