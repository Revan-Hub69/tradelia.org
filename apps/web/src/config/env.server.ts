import { z } from 'zod'

// Server-side environment validation for Next.js web app
const envSchema = z.object({
  // API URLs
  API_INTERNAL_URL: z.string().url().optional(),
  API_URL: z.string().url().optional(),

  // Ensure at least one API URL is provided
}).refine((data) => data.API_INTERNAL_URL || data.API_URL, {
  message: 'Either API_INTERNAL_URL or API_URL must be provided'
})

// Parse and validate environment variables
const envParse = envSchema.safeParse(process.env)

if (!envParse.success) {
  console.error('❌ Web environment validation failed:')
  console.error(envParse.error.format())
  process.exit(1)
}

export const env = envParse.data
