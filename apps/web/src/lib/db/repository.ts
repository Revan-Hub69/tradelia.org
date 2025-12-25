import { supabase } from '@/lib/supabase/client'

export interface TradePlan {
  plan_id: string
  symbol: string
  mode: string
  side: string
  state: string
  created_at: string
}

export interface Execution {
  exec_id: string
  symbol: string
  state: string
  created_at: string
}

export async function getTradePlans(userId: string): Promise<TradePlan[]> {
  const { data, error } = await supabase
    .from('trade_plans')
    .select('plan_id, symbol, mode, side, state, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching trade plans:', error)
    return []
  }

  return (data as TradePlan[]) || []
}

export async function getExecutions(userId: string): Promise<Execution[]> {
  const { data, error } = await supabase
    .from('executions')
    .select('exec_id, symbol, state, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching executions:', error)
    return []
  }

  return (data as Execution[]) || []
}
