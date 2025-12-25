'use client'

import React, { useState, useEffect } from 'react'
import {
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  QueueListIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'

interface Job {
  id: string
  type: string
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
  planId?: string
  payload?: any
  result?: any
  error?: string
}

interface Execution {
  id: string
  planId: string
  symbol: string
  side: string
  status: 'ACTIVE' | 'CLOSED' | 'CANCELLED'
  pnl: number
  pnlPct: number
  createdAt: string
  closedAt?: string
}

export const JobsTab: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        type: 'EXECUTE_PLAN',
        status: 'PROCESSING',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        updatedAt: new Date(Date.now() - 60000).toISOString(),
        planId: 'plan-123',
        payload: { symbol: 'BTCUSDT', side: 'LONG' }
      },
      {
        id: '2',
        type: 'MONITOR_POSITION',
        status: 'QUEUED',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        updatedAt: new Date(Date.now() - 600000).toISOString(),
        planId: 'plan-456'
      },
      {
        id: '3',
        type: 'EXECUTE_PLAN',
        status: 'COMPLETED',
        createdAt: new Date(Date.now() - 1200000).toISOString(),
        updatedAt: new Date(Date.now() - 900000).toISOString(),
        planId: 'plan-789',
        result: { orderId: '12345', status: 'PLACED' }
      },
      {
        id: '4',
        type: 'UPDATE_SLTP',
        status: 'FAILED',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1700000).toISOString(),
        planId: 'plan-101',
        error: 'Exchange API timeout'
      }
    ]

    const mockExecutions: Execution[] = [
      {
        id: '1',
        planId: 'plan-123',
        symbol: 'BTCUSDT',
        side: 'LONG',
        status: 'ACTIVE',
        pnl: 45.67,
        pnlPct: 2.34,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        planId: 'plan-789',
        symbol: 'ETHUSDT',
        side: 'SHORT',
        status: 'CLOSED',
        pnl: -12.34,
        pnlPct: -0.89,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        closedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]

    setJobs(mockJobs)
    setExecutions(mockExecutions)
    setIsLoading(false)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'PROCESSING':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'COMPLETED':
        return <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDuration = (createdAt: string, updatedAt?: string) => {
    const endTime = updatedAt ? new Date(updatedAt) : new Date()
    const startTime = new Date(createdAt)
    const duration = endTime.getTime() - startTime.getTime()

    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Queue & Executions</h2>
          <p className="text-gray-600 mt-1">
            Monitor trading jobs and active executions in real-time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Queued</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(j => j.status === 'QUEUED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <ArrowPathIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(j => j.status === 'PROCESSING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CheckCircleSolidIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(j => j.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(j => j.status === 'FAILED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Jobs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(job.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.planId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(job.createdAt, job.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Executions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Executions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Side
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executions.map((execution) => (
                <tr key={execution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {execution.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      execution.side === 'LONG'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {execution.side}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      execution.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-800'
                        : execution.status === 'CLOSED'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {execution.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      execution.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {execution.pnl >= 0 ? '+' : ''}${execution.pnl.toFixed(2)}
                      ({execution.pnlPct >= 0 ? '+' : ''}{execution.pnlPct.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(execution.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job ID</label>
                  <p className="text-sm text-gray-900">{selectedJob.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900">{selectedJob.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedJob.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedJob.status)}`}>
                      {selectedJob.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan ID</label>
                  <p className="text-sm text-gray-900">{selectedJob.planId || 'N/A'}</p>
                </div>
              </div>

              {selectedJob.payload && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payload</label>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedJob.payload, null, 2)}
                  </pre>
                </div>
              )}

              {selectedJob.result && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Result</label>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedJob.result, null, 2)}
                  </pre>
                </div>
              )}

              {selectedJob.error && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Error</label>
                  <pre className="bg-red-50 p-3 rounded text-xs text-red-700 overflow-x-auto">
                    {selectedJob.error}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedJob.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Updated</label>
                  <p className="text-sm text-gray-900">{new Date(selectedJob.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
