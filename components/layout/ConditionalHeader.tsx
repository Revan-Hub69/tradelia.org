'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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
 */
export function ConditionalHeader() {
  const [isClient, setIsClient] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    setIsClient(true);
    
    // Safe pathname detection - check both current pathname and window.location
    if (typeof window !== 'undefined') {
      const currentPath = pathname || window.location.pathname;
      const dashboard = currentPath?.startsWith('/dashboard') || 
                       currentPath?.startsWith('/en/dashboard') ||
                       window.location.pathname?.startsWith('/dashboard') ||
                       window.location.pathname?.startsWith('/en/dashboard');
      setIsDashboard(dashboard);
    } else if (pathname) {
      // Fallback to pathname if window is not available
      setIsDashboard(pathname.startsWith('/dashboard') || pathname.startsWith('/en/dashboard'));
    }
  }, [pathname]);
  
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

