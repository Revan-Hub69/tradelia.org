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
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Non renderizzare header per pagine dashboard (hanno il loro DashboardHeader)
  if (!isClient) {
    return null;
  }
  
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/en/dashboard');
  
  if (isDashboard) {
    return null;
  }
  
  return <Header />;
}

