'use client';

import { type ReactNode } from 'react';

interface StrategyBuilderContentProps {
  children: ReactNode;
  className?: string;
  itemScope?: boolean;
  itemType?: string;
}

export function StrategyBuilderContent({ 
  children, 
  className = 'space-y-6',
  itemScope,
  itemType 
}: StrategyBuilderContentProps) {
  return (
    <div 
      className={className}
      itemScope={itemScope}
      itemType={itemType}
    >
      {children}
    </div>
  );
}
