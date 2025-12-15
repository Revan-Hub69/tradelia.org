'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Indicator } from '@/components/ui/indicator';
import { cn } from '@/lib/utils/cn';

export interface AcademicReference {
  paper: string;
  authors: string;
  year: number;
  theory: string;
  validity: 'very-high' | 'high' | 'medium' | 'medium-low' | 'low';
}

export interface IndicatorInterpretation {
  level: 'low' | 'normal' | 'elevated' | 'high';
  meaning: string;
  color: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}

export interface IndicatorCardProps {
  title: string;
  value: number | string;
  change?: number;
  changePercent?: number;
  unit?: string;
  chart?: React.ReactNode;
  aiReading: string;
  academicReference: AcademicReference;
  interpretation?: IndicatorInterpretation;
  timestamp?: string;
  className?: string;
}

const validityColors = {
  'very-high': 'bg-green-500/20 text-green-400 border-green-500/30',
  'high': 'bg-background-secondary/50 text-text-secondary border-border',
  'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'medium-low': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'low': 'bg-red-500/20 text-red-400 border-red-500/30',
};

// Rimossi emoji - sostituiti con badge testuali professionali
const validityLabels = {
  'very-high': 'Very High',
  'high': 'High',
  'medium': 'Medium',
  'medium-low': 'Medium-Low',
  'low': 'Low',
};

export function IndicatorCard({
  title,
  value,
  change,
  changePercent,
  unit,
  chart,
  aiReading,
  academicReference,
  interpretation,
  timestamp,
  className,
}: IndicatorCardProps) {
  const hasChange = change !== undefined && changePercent !== undefined;
  const isPositive = hasChange && change >= 0;
  const isNegative = hasChange && change < 0;

  return (
    <Card variant="academic" className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold mb-2">{title}</CardTitle>
            {interpretation && (
              <div className="flex items-center gap-2 mb-2">
                <Indicator
                  variant={interpretation.variant}
                  shape="circle"
                  size="sm"
                />
                <span className={cn('text-sm font-medium', {
                  'text-green-400': interpretation.color === 'green-400',
                  'text-text-secondary': interpretation.color === 'blue-400',
                  'text-yellow-400': interpretation.color === 'yellow-400',
                  'text-red-400': interpretation.color === 'red-400',
                })}>
                  {interpretation.meaning}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Value Display */}
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">
              {typeof value === 'number' ? value.toLocaleString('it-IT', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              }) : value}
            </span>
            {unit && (
              <span className="text-lg text-text-secondary">{unit}</span>
            )}
          </div>

          {hasChange && (
            <div className={cn(
              'flex items-center gap-2 mt-2 text-sm font-medium',
              isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-text-secondary'
            )}>
              <span>{isPositive ? '↑' : isNegative ? '↓' : '→'}</span>
              <span>
                {isPositive ? '+' : ''}{change?.toLocaleString('it-IT', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              <span>
                ({isPositive ? '+' : ''}{changePercent?.toFixed(2)}%)
              </span>
            </div>
          )}

          {timestamp && (
            <p className="text-xs text-text-tertiary mt-2">
              Aggiornato: {new Date(timestamp).toLocaleString('it-IT')}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Chart */}
        {chart && (
          <div className="w-full h-64">
            {chart}
          </div>
        )}

        {/* AI Reading */}
        <div className="bg-background-secondary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-semibold text-text-primary">Interpretazione AI</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{aiReading}</p>
        </div>

        {/* Academic Reference */}
        <div className="bg-background-secondary/30 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-semibold text-text-primary">Riferimento Accademico</span>
            <Badge 
              variant="outline" 
              className={cn('text-xs', validityColors[academicReference.validity])}
            >
              {validityLabels[academicReference.validity]}
            </Badge>
          </div>
          <p className="text-sm text-text-secondary mb-1">
            <span className="font-medium">{academicReference.authors}</span> ({academicReference.year})
          </p>
          <p className="text-sm text-text-tertiary italic mb-2">
            "{academicReference.paper}"
          </p>
          <p className="text-xs text-text-tertiary">
            <span className="font-medium">Teoria:</span> {academicReference.theory}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
