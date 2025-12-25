'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  KeyIcon,
  UserIcon,
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import { supabase } from '../../lib/supabase/client'

interface UserProfile {
  display_name?: string
  risk_profile?: {
    risk_pct?: number
    max_leverage?: number
  }
  preferences?: {
    theme?: string
    notifications?: boolean
  }
}

interface ExchangeConnection {
  id: string
  exchange: string
  venue: string
  label: string
  apiKeyHint: string
  isTestnet: boolean
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [exchangeConnections, setExchangeConnections] = useState<ExchangeConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)
  const [showAddConnection, setShowAddConnection] = useState(false)
  const [newConnection, setNewConnection] = useState({
    exchange: 'binance',
    venue: 'futures_usdt',
    label: '',
    apiKey: '',
    apiSecret: '',
    isTestnet: true,
    isEnabled: true
  })
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Load user profile
      loadUserProfile()
      // Load exchange connections
      loadExchangeConnections()
    }

    checkAuth()
  }, [router, supabase])

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // In a real app, this would call the API to get the user profile
      // For now, we'll simulate the response
      setUserProfile({
        display_name: 'Trader',
        risk_profile: {
          risk_pct: 0.003,
          max_leverage: 20
        },
        preferences: {
          theme: 'dark',
          notifications: true
        }
      })
    } catch (error) {
      console.error('Failed to load user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // In a real app, this would call the API to save the user profile
      // For now, we'll simulate the response
      console.log('User profile saved:', userProfile)
    } catch (error) {
      console.error('Failed to save user profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const loadExchangeConnections = async () => {
    try {
      setIsLoadingConnections(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) return

      const response = await fetch(`${apiUrl}/exchange-connections`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExchangeConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Failed to load exchange connections:', error)
    } finally {
      setIsLoadingConnections(false)
    }
  }

  const createExchangeConnection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) return

      const response = await fetch(`${apiUrl}/exchange-connections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConnection)
      })

      if (response.ok) {
        const data = await response.json()
        setExchangeConnections(prev => [...prev, data.connection])
        setShowAddConnection(false)
        setNewConnection({
          exchange: 'binance',
          venue: 'futures_usdt',
          label: '',
          apiKey: '',
          apiSecret: '',
          isTestnet: true,
          isEnabled: true
        })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create exchange connection:', error)
      alert('Failed to create exchange connection')
    }
  }

  const testExchangeConnection = async (connectionId: string) => {
    try {
      setTestingConnection(connectionId)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) return

      const response = await fetch(`${apiUrl}/exchange-connections/${connectionId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        alert('Connection test successful!')
      } else {
        alert(`Connection test failed: ${data.message}`)
      }
    } catch (error) {
      console.error('Failed to test exchange connection:', error)
      alert('Failed to test exchange connection')
    } finally {
      setTestingConnection(null)
    }
  }

  const deleteExchangeConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to delete this exchange connection?')) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) return

      const response = await fetch(`${apiUrl}/exchange-connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        setExchangeConnections(prev => prev.filter(conn => conn.id !== connectionId))
      } else {
        alert('Failed to delete exchange connection')
      }
    } catch (error) {
      console.error('Failed to delete exchange connection:', error)
      alert('Failed to delete exchange connection')
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
              <h1 className="text-xl font-bold text-white">Settings</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white">Settings</h2>
              <nav className="mt-6 space-y-1">
                <a
                  href="#profile"
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-md"
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  Profile
                </a>
                <a
                  href="#exchanges"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                >
                  <CpuChipIcon className="h-5 w-5 mr-3" />
                  Exchange Connections
                </a>
                <a
                  href="#risk"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-3" />
                  Risk Settings
                </a>
                <a
                  href="#preferences"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-3" />
                  Preferences
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium text-white" id="profile">Profile</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="display_name" className="block text-sm font-medium text-white">
                    Display Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="display_name"
                      name="display_name"
                      type="text"
                      value={userProfile.display_name || ''}
                      onChange={(e) => setUserProfile({...userProfile, display_name: e.target.value})}
                      className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30"
                      placeholder="Enter your display name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30"
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-lg font-medium text-white" id="risk">Risk Settings</h3>
                  <div className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="risk_pct" className="block text-sm font-medium text-white">
                        Risk Percentage
                      </label>
                      <div className="mt-1">
                        <input
                          id="risk_pct"
                          name="risk_pct"
                          type="number"
                          step="0.001"
                          min="0.001"
                          max="0.05"
                          value={userProfile.risk_profile?.risk_pct || 0}
                          onChange={(e) => setUserProfile({
                            ...userProfile,
                            risk_profile: {
                              ...userProfile.risk_profile,
                              risk_pct: parseFloat(e.target.value)
                            }
                          })}
                          className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30"
                          placeholder="Enter risk percentage"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="max_leverage" className="block text-sm font-medium text-white">
                        Max Leverage
                      </label>
                      <div className="mt-1">
                        <input
                          id="max_leverage"
                          name="max_leverage"
                          type="number"
                          step="1"
                          min="1"
                          max="125"
                          value={userProfile.risk_profile?.max_leverage || 0}
                          onChange={(e) => setUserProfile({
                            ...userProfile,
                            risk_profile: {
                              ...userProfile.risk_profile,
                              max_leverage: parseInt(e.target.value)
                            }
                          })}
                          className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30"
                          placeholder="Enter max leverage"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <h3 className="text-lg font-medium text-white" id="preferences">Preferences</h3>
                  <div className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-white">
                        Theme
                      </label>
                      <div className="mt-1">
                        <select
                          id="theme"
                          name="theme"
                          value={userProfile.preferences?.theme || 'dark'}
                          onChange={(e) => setUserProfile({
                            ...userProfile,
                            preferences: {
                              ...userProfile.preferences,
                              theme: e.target.value
                            }
                          })}
                          className="input-field bg-white/20 text-white placeholder-gray-300 border-white/30"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="system">System</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="notifications"
                        name="notifications"
                        type="checkbox"
                        checked={userProfile.preferences?.notifications || false}
                        onChange={(e) => setUserProfile({
                          ...userProfile,
                          preferences: {
                            ...userProfile.preferences,
                            notifications: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifications" className="ml-2 block text-sm text-white">
                        Enable Notifications
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* Exchange Connections Section */}
            <div className="bg-gray-800 rounded-lg p-6 mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white" id="exchanges">Exchange Connections</h2>
                <button
                  onClick={() => setShowAddConnection(!showAddConnection)}
                  className="btn-secondary text-sm"
                >
                  {showAddConnection ? 'Cancel' : 'Add Connection'}
                </button>
              </div>

              {/* Add Connection Form */}
              {showAddConnection && (
                <form onSubmit={createExchangeConnection} className="mt-6 p-4 bg-gray-700 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white">Exchange</label>
                      <select
                        value={newConnection.exchange}
                        onChange={(e) => setNewConnection({...newConnection, exchange: e.target.value})}
                        className="mt-1 block w-full input-field bg-white/20 text-white border-white/30"
                      >
                        <option value="binance">Binance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white">Label</label>
                      <input
                        type="text"
                        value={newConnection.label}
                        onChange={(e) => setNewConnection({...newConnection, label: e.target.value})}
                        className="mt-1 block w-full input-field bg-white/20 text-white border-white/30"
                        placeholder="e.g. main, backup"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white">API Key</label>
                      <input
                        type="password"
                        value={newConnection.apiKey}
                        onChange={(e) => setNewConnection({...newConnection, apiKey: e.target.value})}
                        className="mt-1 block w-full input-field bg-white/20 text-white border-white/30"
                        placeholder="Your API Key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white">API Secret</label>
                      <input
                        type="password"
                        value={newConnection.apiSecret}
                        onChange={(e) => setNewConnection({...newConnection, apiSecret: e.target.value})}
                        className="mt-1 block w-full input-field bg-white/20 text-white border-white/30"
                        placeholder="Your API Secret"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        id="isTestnet"
                        type="checkbox"
                        checked={newConnection.isTestnet}
                        onChange={(e) => setNewConnection({...newConnection, isTestnet: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="isTestnet" className="ml-2 block text-sm text-white">
                        Testnet
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="isEnabled"
                        type="checkbox"
                        checked={newConnection.isEnabled}
                        onChange={(e) => setNewConnection({...newConnection, isEnabled: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="isEnabled" className="ml-2 block text-sm text-white">
                        Enabled
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddConnection(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Create Connection
                    </button>
                  </div>
                </form>
              )}

              {/* Connections List */}
              <div className="mt-6">
                {isLoadingConnections ? (
                  <div className="text-white">Loading connections...</div>
                ) : exchangeConnections.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No exchange connections configured yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exchangeConnections.map((connection) => (
                      <div key={connection.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CpuChipIcon className="h-8 w-8 text-blue-400" />
                            <div>
                              <h3 className="text-white font-medium">
                                {connection.exchange.toUpperCase()} - {connection.label}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {connection.venue} • {connection.isTestnet ? 'Testnet' : 'Live'} • {connection.apiKeyHint}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {connection.isEnabled ? (
                              <CheckCircleIconSolid className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-red-400" />
                            )}
                            <button
                              onClick={() => testExchangeConnection(connection.id)}
                              disabled={testingConnection === connection.id}
                              className="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                            >
                              {testingConnection === connection.id ? 'Testing...' : 'Test'}
                            </button>
                            <button
                              onClick={() => deleteExchangeConnection(connection.id)}
                              className="text-red-400 hover:text-red-300 text-xs px-3 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Created: {new Date(connection.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
