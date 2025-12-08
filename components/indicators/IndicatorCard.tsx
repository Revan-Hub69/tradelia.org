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
  'high': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'medium-low': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'low': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const validityStars = {
  'very-high': '⭐⭐⭐⭐⭐',
  'high': '⭐⭐⭐⭐',
  'medium': '⭐⭐⭐',
  'medium-low': '⭐⭐',
  'low': '⭐',
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
                  'text-blue-400': interpretation.color === 'blue-400',
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
            <span className="text-sm font-semibold text-text-primary">📊 Interpretazione AI</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{aiReading}</p>
        </div>

        {/* Academic Reference */}
        <div className="bg-background-secondary/30 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-text-primary">🎓 Riferimento Accademico</span>
            <Badge 
              variant="outline" 
              className={cn('text-xs', validityColors[academicReference.validity])}
            >
              {validityStars[academicReference.validity]}
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
