'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, setAnalyticsUser, isAnalyticsEnabled } from '@/lib/analytics/tracker';
import { useUserRole, useIsPro } from '@/lib/hooks/useUserRole';

/**
 * Hook per automatic page view tracking
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   useAnalytics();
 *   // ...
 * }
 * ```
 */
export function useAnalytics() {
  const pathname = usePathname();
  const { role } = useUserRole();
  const isPro = useIsPro();

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    // Track page view
    trackPageView(pathname);

    // Update user properties
    setAnalyticsUser({
      userRole: role || undefined,
      isPro,
      subscriptionTier: isPro ? 'pro' : 'base',
    });
  }, [pathname, role, isPro]);
}

