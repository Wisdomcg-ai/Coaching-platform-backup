'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Target,
  TrendingUp,
  MessageSquare,
  FileText,
  Users,
  Loader2,
  ChevronRight,
  Calendar,
  BarChart3
} from 'lucide-react'

interface Business {
  id: string
  name: string
  business_name: string
  industry: string | null
  status: string
  enabled_modules: {
    plan: boolean
    forecast: boolean
    goals: boolean
    chat: boolean
    documents: boolean
  }
  owner_id: string
}

interface ClientUser {
  id: string
  email: string
  user_metadata: {
    first_name?: string
    last_name?: string
  }
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)
  const [clientUser, setClientUser] = useState<ClientUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClientData()
  }, [clientId])

  const loadClientData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Get current coach
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Not authenticated')
        return
      }

      // Get business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', clientId)
        .eq('assigned_coach_id', user.id)
        .single()

      if (businessError) {
        console.error('Business error:', businessError)
        setError('Business not found or you do not have access')
        return
      }

      setBusiness(businessData)

      // Get client user details
      if (businessData.owner_id) {
        const { data: { user: clientUserData }, error: clientError } = await supabase.auth.admin.getUserById(businessData.owner_id)

        if (!clientError && clientUserData) {
          setClientUser(clientUserData as ClientUser)
        }
      }

    } catch (err) {
      console.error('Error loading client:', err)
      setError('Failed to load client data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Client not found'}</p>
          <Link href="/coach/clients" className="text-teal-600 hover:underline">
            Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  const clientName = clientUser
    ? `${clientUser.user_metadata?.first_name || ''} ${clientUser.user_metadata?.last_name || ''}`.trim() || clientUser.email
    : 'Client'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/coach/clients" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-teal-600" />
                  <h1 className="text-2xl font-bold text-gray-900">{business.name || business.business_name}</h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {clientName} • {business.industry || 'No industry set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                business.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {business.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Client Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{clientUser?.email || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Industry</p>
              <p className="font-medium">{business.industry || 'Not set'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium capitalize">{business.status}</p>
            </div>
          </div>
        </div>

        {/* Module Cards - Professional Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Strategic Planning */}
          {business.enabled_modules.goals && (
            <Link
              href={`/coach/clients/${clientId}/goals`}
              className="block bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-teal-500 hover:shadow-md transition-all p-6 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Strategic Planning</h3>
                    <p className="text-sm text-gray-600">
                      Goals, KPIs, strategic initiatives & annual plan
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Financial Forecast */}
          {business.enabled_modules.forecast && (
            <Link
              href={`/coach/clients/${clientId}/forecast`}
              className="block bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:border-teal-500 hover:shadow-md transition-all p-6 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Financial Forecast</h3>
                    <p className="text-sm text-gray-600">
                      P&L forecast, payroll & financial assumptions
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          )}

          {/* Sessions - Coming Soon */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 opacity-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Coaching Sessions</h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Schedule sessions, add notes & track action items
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat - Coming Soon */}
          {business.enabled_modules.chat && (
            <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 opacity-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Direct messaging and Q&A with your client
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents - Coming Soon */}
          {business.enabled_modules.documents && (
            <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 opacity-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Share resources, templates & reports
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights - Coming Soon */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm p-6 opacity-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">Insights & Analytics</h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Coming Soon</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Progress tracking, trends & performance metrics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
