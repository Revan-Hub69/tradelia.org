import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(value / 100)
}

export function getCoverageColor(coverage: 'FULL' | 'PARTIAL' | 'INFO'): string {
  switch (coverage) {
    case 'FULL':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'INFO':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getCoverageLabel(coverage: 'FULL' | 'PARTIAL' | 'INFO'): string {
  switch (coverage) {
    case 'FULL':
      return 'Copertura Completa'
    case 'PARTIAL':
      return 'Copertura Parziale'
    case 'INFO':
      return 'Solo Informazioni'
    default:
      return 'Non Valutabile'
  }
}