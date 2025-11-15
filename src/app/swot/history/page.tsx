'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowLeft, Calendar, TrendingUp, Eye, FileText, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface SwotAnalysis {
  id: string
  quarter: number
  year: number
  type: string
  status: string
  swot_score: number
  finalized_at: string | null
  created_at: string
  updated_at: string
  item_counts?: {
    strengths: number
    weaknesses: number
    opportunities: number
    threats: number
    total: number
  }
}

export default function SwotHistoryPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [analyses, setAnalyses] = useState<SwotAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Please log in to view history')
        return
      }

      // Fetch all SWOT analyses for this user
      const { data: swots, error: fetchError } = await supabase
        .from('swot_analyses')
        .select(`
          *,
          swot_items (category)
        `)
        .eq('business_id', user.id)
        .order('year', { ascending: false })
        .order('quarter', { ascending: false })

      if (fetchError) throw fetchError

      // Count items by category for each analysis
      const analysesWithCounts = swots.map((swot: any) => {
        const items = swot.swot_items || []
        const counts = {
          strengths: items.filter((i: any) => i.category === 'strength').length,
          weaknesses: items.filter((i: any) => i.category === 'weakness').length,
          opportunities: items.filter((i: any) => i.category === 'opportunity').length,
          threats: items.filter((i: any) => i.category === 'threat').length,
          total: items.length
        }

        return {
          ...swot,
          item_counts: counts
        }
      })

      setAnalyses(analysesWithCounts)
    } catch (err) {
      console.error('Error loading history:', err)
      setError('Failed to load SWOT history')
    } finally {
      setLoading(false)
    }
  }

  const getQuarterLabel = (quarter: number, year: number) => {
    return `Q${quarter} ${year}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-blue-600'
    if (score >= 25) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/swot" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current SWOT
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SWOT History</h1>
              <p className="mt-1 text-sm text-gray-500">
                View all your past SWOT analyses
              </p>
            </div>

            <button
              onClick={() => router.push('/swot/compare')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Compare Quarters
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analyses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't completed any SWOT analyses yet.
            </p>
            <button
              onClick={() => router.push('/swot')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Start Your First SWOT
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {getQuarterLabel(analysis.quarter, analysis.year)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                        {analysis.status === 'final' ? 'Final' : analysis.status === 'in-progress' ? 'In Progress' : 'Draft'}
                      </span>
                      {analysis.status === 'final' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      {/* Created Date */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Created</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(analysis.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>

                      {/* Strengths */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Strengths</div>
                        <div className="text-2xl font-bold text-green-600">
                          {analysis.item_counts?.strengths || 0}
                        </div>
                      </div>

                      {/* Weaknesses */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Weaknesses</div>
                        <div className="text-2xl font-bold text-red-600">
                          {analysis.item_counts?.weaknesses || 0}
                        </div>
                      </div>

                      {/* Opportunities */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Opportunities</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {analysis.item_counts?.opportunities || 0}
                        </div>
                      </div>

                      {/* Threats */}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Threats</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {analysis.item_counts?.threats || 0}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Updated {new Date(analysis.updated_at).toLocaleDateString()}
                      </div>
                      {analysis.finalized_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Finalized {new Date(analysis.finalized_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => router.push(`/swot/${analysis.id}`)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
