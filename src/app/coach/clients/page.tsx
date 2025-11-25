'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserSystemRole } from '@/lib/auth/roles'
import RoleSwitcher from '@/components/shared/RoleSwitcher'
import {
  Users,
  Building2,
  Search,
  Calendar,
  MessageSquare,
  FileText,
  ListChecks,
  TrendingUp,
  Target,
  Briefcase,
  ChevronRight,
  BarChart3,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Business {
  id: string
  business_name: string
  industry: string | null
  status: string
  created_at: string
  program_type: string | null
  session_frequency: string | null
  engagement_start_date: string | null
  enabled_modules: {
    plan: boolean
    forecast: boolean
    goals: boolean
    chat: boolean
    documents: boolean
  }
  user_id: string
}

interface ClientUser {
  first_name: string
  last_name: string
  email: string
}

export default function CoachDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Business[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [userName, setUserName] = useState<string>('')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    // Set selected client from URL or default to first
    const clientId = searchParams.get('client')
    if (clientId) {
      setSelectedClientId(clientId)
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id)
    }
  }, [searchParams, clients])

  async function checkAuthAndLoadData() {
    setLoading(true)

    // Check authentication and role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/coach/login')
      return
    }

    const role = await getUserSystemRole()
    if (role !== 'coach' && role !== 'super_admin') {
      router.push('/login')
      return
    }

    // Set user name from metadata or email
    const name = user.user_metadata?.first_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
      : user.email?.split('@')[0] || 'Coach'
    setUserName(name)

    // Load clients and stats
    await Promise.all([
      loadClients(user.id),
      loadStats()
    ])
    setLoading(false)
  }

  async function loadStats() {
    const res = await fetch('/api/coach/stats')
    const data = await res.json()
    if (data.success) {
      setStats(data.stats)
    }
  }

  async function loadClients(coachId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('assigned_coach_id', coachId)
      .order('business_name', { ascending: true })

    if (error) {
      console.error('Error loading clients:', error)
      return
    }

    setClients(data || [])
  }

  const selectedClient = clients.find(c => c.id === selectedClientId)

  const filteredClients = clients.filter(client =>
    client.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Briefcase className="w-8 h-8 animate-pulse text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading coach portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Coach Portal</h1>
                <p className="text-sm text-gray-600">Wisdom Business Intelligence</p>
              </div>
            </div>
            <RoleSwitcher currentRole="coach" userName={userName} />
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && !selectedClient && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 border-b border-teal-800">
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Clients */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Total Clients</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.clients.total}</p>
                    <p className="text-teal-200 text-xs mt-1">
                      {stats.clients.active} active · {stats.clients.pending} pending
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-teal-200" />
                </div>
              </div>

              {/* Sessions This Month */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Sessions This Month</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.sessions.thisMonth}</p>
                    <p className="text-teal-200 text-xs mt-1">
                      {stats.sessions.upcoming} upcoming
                    </p>
                  </div>
                  <Calendar className="w-10 h-10 text-teal-200" />
                </div>
              </div>

              {/* Pending Actions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Pending Actions</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.actions.pending}</p>
                    <p className="text-teal-200 text-xs mt-1">
                      {stats.actions.completionRate}% completion rate
                    </p>
                  </div>
                  <ListChecks className="w-10 h-10 text-teal-200" />
                </div>
              </div>

              {/* Total Sessions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Total Sessions</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.sessions.total}</p>
                    <p className="text-teal-200 text-xs mt-1">
                      All time
                    </p>
                  </div>
                  <Target className="w-10 h-10 text-teal-200" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {stats.recentActivity && stats.recentActivity.length > 0 && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recent Activity
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {stats.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        activity.type === 'session' ? 'bg-teal-300' : 'bg-green-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white truncate">{activity.title}</p>
                        <p className="text-teal-200 text-xs">
                          {activity.business_name} · {new Date(activity.date).toLocaleDateString('en-AU', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Client List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Client Count */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
              </span>
            </div>
          </div>

          {/* Client List */}
          <div className="flex-1 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No clients found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedClientId === client.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {client.business_name}
                          </h3>
                        </div>
                        {client.industry && (
                          <p className="text-xs text-gray-600 mb-2">{client.industry}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                          {client.program_type && (
                            <span className="text-xs text-gray-500">{client.program_type}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        selectedClientId === client.id ? 'text-indigo-600' : ''
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {!selectedClient ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No Client Selected</p>
                <p className="text-sm">Select a client from the list to view details</p>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {/* Client Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedClient.business_name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {selectedClient.industry && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {selectedClient.industry}
                        </span>
                      )}
                      {selectedClient.program_type && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {selectedClient.program_type}
                        </span>
                      )}
                      {selectedClient.session_frequency && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {selectedClient.session_frequency} sessions
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedClient.status)}`}>
                    {selectedClient.status}
                  </span>
                </div>

                {selectedClient.engagement_start_date && (
                  <p className="text-sm text-gray-600">
                    Started: {new Date(selectedClient.engagement_start_date).toLocaleDateString('en-AU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                  <Calendar className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Schedule Session</p>
                </button>
                <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                  <MessageSquare className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Send Message</p>
                </button>
                <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                  <Plus className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Add Action</p>
                </button>
                <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                  <FileText className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Share Document</p>
                </button>
              </div>

              {/* Module Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Strategic Planning (Goals + Annual Plan) */}
                {selectedClient.enabled_modules.goals && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/coach/clients/${selectedClient.id}?tab=goals`)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategic Planning</h3>
                    <p className="text-sm text-gray-600">Goals, KPIs, initiatives & annual plan</p>
                  </div>
                )}

                {/* Financial Forecast */}
                {selectedClient.enabled_modules.forecast && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/coach/clients/${selectedClient.id}?tab=forecast`)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Forecast</h3>
                    <p className="text-sm text-gray-600">P&L forecast, payroll & assumptions</p>
                  </div>
                )}

                {/* Sessions */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sessions</h3>
                  <p className="text-sm text-gray-600 mb-3">Manage coaching sessions and agendas</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Next session in 3 days</span>
                  </div>
                </div>

                {/* Chat */}
                {selectedClient.enabled_modules.chat && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-orange-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
                    <p className="text-sm text-gray-600 mb-3">Chat and Q&A with client</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span>2 unread messages</span>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedClient.enabled_modules.documents && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-teal-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                    <p className="text-sm text-gray-600 mb-3">Shared documents and resources</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FileText className="w-4 h-4" />
                      <span>12 documents</span>
                    </div>
                  </div>
                )}

                {/* Actions & Tasks */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <ListChecks className="w-6 h-6 text-pink-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions & Tasks</h3>
                  <p className="text-sm text-gray-600 mb-3">Track commitments and follow-ups</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>8 completed</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>3 pending</span>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-cyan-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Insights</h3>
                  <p className="text-sm text-gray-600">Progress reports and analytics</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
