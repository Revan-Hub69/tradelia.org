import { z } from 'zod';

/**
 * Validation Schemas
 * Zod schemas per validazione form
 * Riferimento: Zod Best Practices, Type Safety
 */

// Portfolio
export const portfolioPositionSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Simbolo obbligatorio')
    .max(10, 'Simbolo massimo 10 caratteri')
    .regex(/^[A-Z]+$/, 'Solo lettere maiuscole'),
  quantity: z
    .number()
    .positive('Quantità deve essere positiva')
    .min(0.01, 'Quantità minima 0.01'),
  price: z
    .number()
    .positive('Prezzo deve essere positivo')
    .min(0.01, 'Prezzo minimo 0.01'),
  notes: z.string().optional(),
});

// Alerts
export const alertSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome minimo 3 caratteri')
    .max(100, 'Nome massimo 100 caratteri'),
  type: z.enum(['price', 'volume', 'custom']),
  symbol: z
    .string()
    .regex(/^[A-Z]{1,10}$/, 'Simbolo non valido')
    .optional(),
  condition: z.enum(['above', 'below', 'equals']),
  value: z
    .number()
    .positive('Valore deve essere positivo'),
}).refine((data) => {
  if (data.type !== 'custom' && !data.symbol) {
    return false;
  }
  return true;
}, {
  message: 'Simbolo obbligatorio per questo tipo di alert',
  path: ['symbol'],
});

// Trading Journal
export const tradingJournalSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Simbolo obbligatorio')
    .max(10, 'Simbolo massimo 10 caratteri')
    .regex(/^[A-Z]+$/, 'Solo lettere maiuscole'),
  trade_type: z.enum(['buy', 'sell', 'long', 'short']),
  entry_date: z.string().datetime(),
  exit_date: z.string().datetime().optional().nullable(),
  entry_price: z
    .number()
    .positive('Prezzo entry deve essere positivo'),
  exit_price: z
    .number()
    .positive('Prezzo exit deve essere positivo')
    .optional()
    .nullable(),
  quantity: z
    .number()
    .positive('Quantità deve essere positiva'),
  entry_fee: z.number().min(0).optional(),
  exit_fee: z.number().min(0).optional(),
  strategy: z.string().optional(),
  setup_type: z.string().optional(),
  timeframe: z.string().optional(),
  entry_reason: z.string().optional(),
  exit_reason: z.string().optional(),
  notes: z.string().optional(),
  emotions: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

// Course Notes
export const courseNotesSchema = z.object({
  notes: z.string().max(10000, 'Note massimo 10000 caratteri'),
});

// Analysis Request
export const analysisRequestSchema = z.object({
  asset_symbol: z
    .string()
    .min(1, 'Simbolo asset obbligatorio')
    .max(10, 'Simbolo massimo 10 caratteri'),
  analysis_type: z.enum(['technical', 'fundamental', 'sentiment', 'custom']),
  notes: z.string().max(5000, 'Note massimo 5000 caratteri').optional(),
});

// Asset Proposal
export const assetProposalSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Simbolo obbligatorio')
    .max(10, 'Simbolo massimo 10 caratteri')
    .regex(/^[A-Z]+$/, 'Solo lettere maiuscole'),
  name: z
    .string()
    .min(3, 'Nome minimo 3 caratteri')
    .max(100, 'Nome massimo 100 caratteri'),
  asset_type: z.enum(['stock', 'crypto', 'forex', 'commodity', 'other']),
  exchange: z.string().optional(),
  description: z.string().max(1000, 'Descrizione massimo 1000 caratteri').optional(),
  reason: z.string().max(2000, 'Motivazione massimo 2000 caratteri'),
});

// Settings
export const settingsSchema = z.object({
  display_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  language: z.enum(['it', 'en']).optional(),
  timezone: z.string().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
});

// Password Change
export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Password attuale obbligatoria'),
  new_password: z
    .string()
    .min(8, 'Password minimo 8 caratteri')
    .regex(/[A-Z]/, 'Password deve contenere almeno una maiuscola')
    .regex(/[a-z]/, 'Password deve contenere almeno una minuscola')
    .regex(/[0-9]/, 'Password deve contenere almeno un numero'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Le password non corrispondono',
  path: ['confirm_password'],
});

// Export types
export type PortfolioPositionInput = z.infer<typeof portfolioPositionSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type TradingJournalInput = z.infer<typeof tradingJournalSchema>;
export type CourseNotesInput = z.infer<typeof courseNotesSchema>;
export type AnalysisRequestInput = z.infer<typeof analysisRequestSchema>;
export type AssetProposalInput = z.infer<typeof assetProposalSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

