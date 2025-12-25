'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlayIcon,
  StopIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase/client'
import { getTradePlans, getExecutions } from '@/lib/db/repository'
import { TradePlanBuilder, TradePlan as TradePlanType } from '@/components/TradePlanBuilder'

interface TradePlan {
  plan_id: string
  symbol: string
  mode: string
  side: string
  state: string
  created_at: string
}

interface Execution {
  exec_id: string
  symbol: string
  state: string
  created_at: string
}

export default function TradePage() {
  const [tradePlans, setTradePlans] = useState<TradePlan[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPlanBuilder, setShowPlanBuilder] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Load trade plans and executions
      loadTradePlans(session.user.id)
      loadExecutions(session.user.id)
    }

    checkAuth()
  }, [router])

  const loadTradePlans = async (userId: string) => {
    try {
      const plans = await getTradePlans(userId)
      setTradePlans(plans)
    } catch (error) {
      console.error('Failed to load trade plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadExecutions = async (userId: string) => {
    try {
      const execs = await getExecutions(userId)
      setExecutions(execs)
    } catch (error) {
      console.error('Failed to load executions:', error)
    }
  }

  const handleCreatePlan = () => {
    setShowPlanBuilder(true)
  }

  const handleSavePlan = async (plan: TradePlanType) => {
    try {
      // In a real implementation, this would save to the API
      console.log('Saving trade plan:', plan)

      // For now, just close the builder
      setShowPlanBuilder(false)

      // Reload plans to show the new one
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        loadTradePlans(session.user.id)
      }
    } catch (error) {
      console.error('Failed to save trade plan:', error)
    }
  }

  const handleCancelPlan = () => {
    setShowPlanBuilder(false)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Trading</h1>
            </div>
            <button
              onClick={logout}
              className="flex items-center text-gray-300 hover:text-white"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trade Plans */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <PlayIcon className="h-8 w-8 text-yellow-400" />
                <h2 className="ml-3 text-lg font-medium text-white">Trade Plans</h2>
              </div>
              <button
                onClick={handleCreatePlan}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Plan
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Ready-to-execute trading plans
            </p>
            <div className="mt-6 space-y-4">
              {tradePlans.length === 0 ? (
                <div className="text-center text-gray-400">
                  No trade plans found
                </div>
              ) : (
                tradePlans.map((plan) => (
                  <div key={plan.plan_id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{plan.symbol}</h3>
                        <p className="text-sm text-gray-400">
                          {plan.mode} | {plan.side} | {plan.state}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">
                          <PlayIcon className="h-3 w-3 mr-1" />
                          Execute
                        </button>
                        <button className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">
                          <StopIcon className="h-3 w-3 mr-1" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Executions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
              <h2 className="ml-3 text-lg font-medium text-white">Executions</h2>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Executed trade plans
            </p>
            <div className="mt-6 space-y-4">
              {executions.length === 0 ? (
                <div className="text-center text-gray-400">
                  No executions found
                </div>
              ) : (
                executions.map((exec) => (
                  <div key={exec.exec_id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-white">{exec.symbol}</h3>
                        <p className="text-sm text-gray-400">
                          {exec.state}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">
                          <Cog6ToothIcon className="h-3 w-3 mr-1" />
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Trade Plan Builder Modal */}
      {showPlanBuilder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-transparent rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <TradePlanBuilder
                onSave={handleSavePlan}
                onCancel={handleCancelPlan}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
