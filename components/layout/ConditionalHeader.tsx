'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('./Header').then(m => ({ default: m.Header })), {
  ssr: false,
});

/**
 * Conditional Header Component
 * Best Practice: Render header only for non-dashboard pages
 * Dashboard pages have their own DashboardHeader component
 * 
 * IMPORTANT: Uses safe pathname detection to avoid hydration errors
 * CRITICAL: Memoized to prevent double rendering
 */
export function ConditionalHeader() {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  
  // Memoize dashboard detection to prevent unnecessary re-renders
  const isDashboard = useMemo(() => {
    if (typeof window === 'undefined') {
      return pathname?.startsWith('/dashboard') || pathname?.startsWith('/en/dashboard') || false;
    }
    const currentPath = pathname || window.location.pathname;
    return currentPath?.startsWith('/dashboard') || 
           currentPath?.startsWith('/en/dashboard') ||
           window.location.pathname?.startsWith('/dashboard') ||
           window.location.pathname?.startsWith('/en/dashboard') ||
           false;
  }, [pathname]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Non renderizzare nulla durante SSR o prima che il client sia pronto
  if (!isClient) {
    return null;
  }
  
  // Non renderizzare header per pagine dashboard (hanno il loro DashboardHeader)
  if (isDashboard) {
    return null;
  }
  
  return <Header />;
}

