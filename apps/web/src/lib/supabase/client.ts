import { createClient } from '@supabase/supabase-js'

type PreferenceTheme = 'dark' | 'light'
type PreferenceTextScale = 'small' | 'normal' | 'large'
type PreferenceAnimations = 'on' | 'reduce'

type PreferenceRow = {
  user_id: string
  theme: PreferenceTheme | null
  text_scale: PreferenceTextScale | null
  animations: PreferenceAnimations | null
}

type PreferenceInsert = PreferenceRow
type PreferenceUpdate = Partial<PreferenceRow>
type PreferenceSelection = Pick<PreferenceRow, 'theme' | 'text_scale' | 'animations'>
type PreferenceUpsertPayload = {
  theme: PreferenceTheme
  text_scale: PreferenceTextScale
  animations: PreferenceAnimations
}

type AnyTable = {
  Row: Record<string, unknown>
  Insert: Record<string, unknown>
  Update: Record<string, unknown>
  Relationships: never[]
}

type Database = {
  public: {
    Tables: ({
      user_preferences: {
        Row: PreferenceRow
        Insert: PreferenceInsert
        Update: PreferenceUpdate
        Relationships: never[]
      }
    } & Record<string, AnyTable>)
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Lazy initialization to avoid build-time errors
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })

  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Auth helpers
export const auth = {
  // Sign up with email/password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider: 'google' | 'github' | 'discord') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // User profile operations
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  getPreferences: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('theme, text_scale, animations')
      .eq('user_id', userId)
      .returns<PreferenceSelection>()
      .single()
    return { data, error }
  },

  savePreferences: async (userId: string, payload: PreferenceUpsertPayload) => {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ...payload }, { onConflict: 'user_id' })
      .select('theme, text_scale, animations')
      .returns<PreferenceSelection>()
      .single()
    return { data, error }
  },



  // Exchange connections (encrypted)
  getExchangeConnections: async (userId: string) => {
    const { data, error } = await supabase
      .from('exchange_connections')
      .select('*')
      .eq('user_id', userId)
    return { data, error }
  },

  saveExchangeConnection: async (userId: string, connection: any) => {
    const { data, error } = await supabase
      .from('exchange_connections')
      .upsert({
        user_id: userId,
        ...connection
      })
      .select()
      .single()
    return { data, error }
  },

  deleteExchangeConnection: async (userId: string, exchange: string) => {
    const { error } = await supabase
      .from('exchange_connections')
      .delete()
      .eq('user_id', userId)
      .eq('exchange', exchange)
    return { error }
  }
}

export default supabase

export type {
  PreferenceAnimations,
  PreferenceSelection,
  PreferenceTextScale,
  PreferenceTheme,
}
