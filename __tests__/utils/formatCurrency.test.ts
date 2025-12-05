import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/lib/utils/formatCurrency';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });

  it('should format EUR correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-1000, 'USD')).toBe('-$1,000.00');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
  });
});
