'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  CpuChipIcon,
  PlayIcon,
  StopIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { createClient } from '@supabase/supabase-js'

interface SessionState {
  session_id?: string
  mode?: string
  screener_profile?: string
  execution_mode?: string
  binance_env?: string
  status?: string
  badge?: string
}

export default function DashboardPage() {
  const [sessionState, setSessionState] = useState<SessionState>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Load session state
      loadSessionState()
    }

    checkAuth()
  }, [router, supabase])

  const loadSessionState = async () => {
    try {
      // In a real app, this would call the API
      // For now, we'll simulate the response
      setSessionState({
        status: 'NO_SESSION'
      })
    } catch (error) {
      console.error('Failed to load session state:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startSession = async () => {
    try {
      // Simulate starting a session with default values
      setSessionState({
        session_id: 'demo_session_123',
        mode: 'DEMO_STRESS',
        screener_profile: 'A',
        execution_mode: 'confirm',
        binance_env: 'testnet',
        status: 'RUNNING',
        badge: 'DEMO'
      })
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const stopSession = async () => {
    try {
      setSessionState({
        status: 'NO_SESSION'
      })
    } catch (error) {
      console.error('Failed to stop session:', error)
    }
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
              <h1 className="text-xl font-bold text-white">Tradelia Futures Engine</h1>
              {sessionState.badge && (
                <span className={`ml-3 px-2 py-1 text-xs font-medium rounded ${
                  sessionState.badge === 'LIVE'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {sessionState.badge}
                </span>
              )}
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
        {/* Session Control */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-white">Trading Session</h2>
              <p className="text-sm text-gray-400">
                {sessionState.status === 'RUNNING'
                  ? `Running: ${sessionState.mode} | Profile ${sessionState.screener_profile} | ${sessionState.execution_mode}`
                  : 'No active session'}
              </p>
            </div>
            <div className="flex space-x-3">
              {sessionState.status === 'RUNNING' ? (
                <button
                  onClick={stopSession}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop Session
                </button>
              ) : (
                <button
                  onClick={startSession}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Start Session
                </button>
              )}
              <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Screener */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-400" />
              <h3 className="ml-3 text-lg font-medium text-white">Screener</h3>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              AI-powered symbol screening with dynamic K selection
            </p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Active symbols</div>
            </div>
          </div>

          {/* Signal Engine */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <CpuChipIcon className="h-8 w-8 text-green-400" />
              <h3 className="ml-3 text-lg font-medium text-white">Signal Engine</h3>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              15m trend analysis with 1m micro-timing
            </p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Signal candidates</div>
            </div>
          </div>

          {/* Trade Plans */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <PlayIcon className="h-8 w-8 text-yellow-400" />
              <h3 className="ml-3 text-lg font-medium text-white">Trade Plans</h3>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Ready-to-execute trading plans
            </p>
            <div className="mt-4">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Pending plans</div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {sessionState.status !== 'RUNNING' && (
          <div className="mt-8 bg-blue-900/50 border border-blue-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-200">Getting Started</h3>
            <p className="mt-2 text-blue-300">
              Start a trading session to begin using the AI-powered futures trading engine.
              The system will automatically screen markets, generate signals, and create executable trade plans.
            </p>
            <div className="mt-4">
              <button
                onClick={startSession}
                className="btn-primary"
              >
                Start Your First Session
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
