'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserSystemRole } from '@/lib/auth/roles'
import CreateSessionModal from '@/components/coach/CreateSessionModal'
import {
  Calendar,
  Clock,
  Plus,
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Video,
  Building2
} from 'lucide-react'

interface Session {
  id: string
  business_id: string
  title: string
  scheduled_at: string
  duration_minutes: number
  status: string
  notes: string | null
  summary: string | null
}

interface Business {
  id: string
  business_name: string
}

export default function CoachSessionsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [businesses, setBusinesses] = useState<Record<string, Business>>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    checkAuthAndLoad()
  }, [])

  async function checkAuthAndLoad() {
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

    await loadData()
  }

  async function loadData() {
    setLoading(true)

    // Load businesses first
    const businessRes = await fetch('/api/coach/clients')
    const businessData = await businessRes.json()

    if (businessData.success) {
      const businessMap: Record<string, Business> = {}
      businessData.clients.forEach((b: any) => {
        businessMap[b.id] = { id: b.id, business_name: b.business_name }
      })
      setBusinesses(businessMap)
    }

    // Load sessions
    const sessionsRes = await fetch('/api/sessions')
    const sessionsData = await sessionsRes.json()

    if (sessionsData.success) {
      setSessions(sessionsData.sessions)
    }

    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-teal-100 text-teal-800 border-teal-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const icons = {
      scheduled: <Clock className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <AlertCircle className="w-3 h-3" />
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.scheduled}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const upcomingSessions = sessions
    .filter(s => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date())
    .filter(s => filterStatus === 'all' || s.status === filterStatus)

  const pastSessions = sessions
    .filter(s => s.status === 'completed' || new Date(s.scheduled_at) <= new Date())
    .filter(s => filterStatus === 'all' || s.status === filterStatus)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-8 h-8 animate-pulse text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coaching Sessions</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your coaching calendar</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Session
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sessions.filter(s => s.status === 'completed').length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => router.push(`/coach/sessions/${session.id}`)}
                  className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {businesses[session.business_id]?.business_name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.scheduled_at).toLocaleDateString('en-AU', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(session.scheduled_at).toLocaleTimeString('en-AU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          {session.duration_minutes} min
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Sessions</h2>
            <div className="space-y-3">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => router.push(`/coach/sessions/${session.id}`)}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {businesses[session.business_id]?.business_name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.scheduled_at).toLocaleDateString('en-AU', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {session.summary && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{session.summary}</p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by scheduling your first coaching session.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <Plus className="w-4 h-4" />
              Schedule Session
            </button>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
    </div>
  )
}
