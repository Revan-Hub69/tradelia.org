'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTrading } from '../../lib/contexts/TradingContext'
import { Dashboard } from '../../components/Dashboard'

export default function DashboardPage() {
  const { user, loading } = useTrading()
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null
  }

  // Render the main dashboard
  return <Dashboard />
}
