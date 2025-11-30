/**
 * Lazy-loaded components for code splitting
 * Improves initial bundle size and load time
 */

import { lazy } from 'react';

// Lazy load non-critical components
export const HelpSupport = lazy(() => 
  import('./HelpSupport').then(module => ({ default: module.HelpSupport }))
);

export const ProUtilities = lazy(() => 
  import('./ProUtilities').then(module => ({ default: module.ProUtilities }))
);

export const GlobalSearch = lazy(() => 
  import('./GlobalSearch').then(module => ({ default: module.GlobalSearch }))
);

export const UserMenu = lazy(() => 
  import('./UserMenu').then(module => ({ default: module.UserMenu }))
);

// Heavy utilities
export const PortfolioManager = lazy(() => 
  import('./utilities/PortfolioManager').then(module => ({ default: module.PortfolioManager }))
);

export const FinancialCalculator = lazy(() => 
  import('./utilities/FinancialCalculator').then(module => ({ default: module.FinancialCalculator }))
);

export const AlertSystem = lazy(() => 
  import('./utilities/AlertSystem').then(module => ({ default: module.AlertSystem }))
);

