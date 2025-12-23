'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  KeyIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { createClient } from '@supabase/supabase-js'

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

export default function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Load user profile
      loadUserProfile()
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
          </div>
        </div>
      </main>
    </div>
  )
}
