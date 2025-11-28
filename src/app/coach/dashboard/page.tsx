'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardStats } from '@/components/coach/DashboardStats'
import { TodaySchedule, type Session } from '@/components/coach/TodaySchedule'
import { ClientQuickList, type Client } from '@/components/coach/ClientQuickList'
import { ActivityFeed, type ActivityItem } from '@/components/coach/ActivityFeed'
import { Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function CoachDashboardPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeClients: 0,
    sessionsThisWeek: 0,
    pendingActions: 0,
    unreadMessages: 0
  })
  const [todaySessions, setTodaySessions] = useState<Session[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [clientsNeedingAttention, setClientsNeedingAttention] = useState<{
    id: string
    name: string
    reason: string
  }[]>([])

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load businesses assigned to this coach
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('assigned_coach_id', user.id)
        .order('business_name')

      // Sessions, messages, and action_items tables may not exist yet
      // Use empty defaults for launch-ready state
      const sessions: any[] = []
      const actionsCount = 0
      const messagesCount = 0
      const recentActions: any[] = []

      // Process clients data
      const processedClients: Client[] = (businesses || []).map(b => {
        return {
          id: b.id,
          businessName: b.business_name || 'Unnamed Business',
          status: (b.status as Client['status']) || 'active',
          lastSessionDate: b.last_session_date || undefined,
          healthScore: b.health_score || undefined,
          industry: b.industry || undefined,
          unreadMessages: 0,
          pendingActions: 0
        }
      })

      // Identify clients needing attention
      const attention: { id: string; name: string; reason: string }[] = []
      for (const client of processedClients) {
        if (client.status === 'at-risk') {
          attention.push({
            id: client.id,
            name: client.businessName,
            reason: 'Marked as at-risk'
          })
        } else if (client.healthScore !== undefined && client.healthScore < 50) {
          attention.push({
            id: client.id,
            name: client.businessName,
            reason: `Low health score (${client.healthScore}%)`
          })
        } else if (client.lastSessionDate) {
          const lastSession = new Date(client.lastSessionDate)
          const daysSince = Math.floor((Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSince > 30) {
            attention.push({
              id: client.id,
              name: client.businessName,
              reason: `No session in ${daysSince} days`
            })
          }
        }
      }

      // Process today's sessions
      const processedSessions: Session[] = (sessions || []).map(s => {
        const sessionData = s as any
        const scheduledAt = new Date(s.scheduled_at)
        const endTime = new Date(scheduledAt.getTime() + (s.duration_minutes || 60) * 60000)

        return {
          id: s.id,
          clientName: sessionData.businesses?.business_name || 'Unknown Client',
          clientId: s.business_id,
          time: scheduledAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: endTime.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false }),
          type: (s.session_type as Session['type']) || 'video',
          status: (s.status as Session['status']) || 'upcoming',
          prepCompleted: s.prep_completed || false
        }
      })

      // Process activity feed
      const processedActivities: ActivityItem[] = (recentActions || []).map(a => {
        const actionData = a as any
        return {
          id: a.id,
          type: 'action_completed' as const,
          clientId: a.business_id,
          clientName: actionData.businesses?.business_name || 'Unknown',
          description: `Completed: ${a.title}`,
          timestamp: a.updated_at
        }
      })

      setStats({
        activeClients: processedClients.filter(c => c.status === 'active').length,
        sessionsThisWeek: 0,
        pendingActions: actionsCount || 0,
        unreadMessages: messagesCount || 0
      })
      setTodaySessions(processedSessions)
      setClients(processedClients)
      setActivities(processedActivities)
      setClientsNeedingAttention(attention)

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Row */}
      <DashboardStats
        activeClients={stats.activeClients}
        sessionsThisWeek={stats.sessionsThisWeek}
        pendingActions={stats.pendingActions}
        unreadMessages={stats.unreadMessages}
      />

      {/* Clients Needing Attention Alert */}
      {clientsNeedingAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                {clientsNeedingAttention.length} client{clientsNeedingAttention.length !== 1 ? 's' : ''} need attention
              </h3>
              <div className="mt-2 space-y-2">
                {clientsNeedingAttention.slice(0, 3).map((client) => (
                  <div key={client.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium text-gray-900">{client.name}</span>
                      <span className="text-gray-500 text-sm ml-2">- {client.reason}</span>
                    </div>
                    <Link
                      href={`/coach/clients/${client.id}`}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center"
                    >
                      View <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
                {clientsNeedingAttention.length > 3 && (
                  <Link
                    href="/coach/clients?filter=attention"
                    className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                  >
                    View all {clientsNeedingAttention.length} clients
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <TodaySchedule
            sessions={todaySessions}
            onStartSession={(id) => console.log('Start session:', id)}
            onViewPrep={(id) => console.log('View prep:', id)}
          />
          <ActivityFeed activities={activities} />
        </div>

        {/* Right Column */}
        <div>
          <ClientQuickList
            clients={clients}
            onMessageClient={(id) => console.log('Message client:', id)}
            onScheduleSession={(id) => console.log('Schedule session:', id)}
          />
        </div>
      </div>
    </div>
  )
}
