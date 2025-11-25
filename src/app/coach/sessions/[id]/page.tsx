'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Edit3
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
  agenda: any[]
  session_actions?: Action[]
}

interface Action {
  id: string
  action_text: string
  assigned_to: string | null
  due_date: string | null
  status: string
  created_at: string
}

interface Business {
  id: string
  business_name: string
}

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [notes, setNotes] = useState('')
  const [summary, setSummary] = useState('')
  const [newAction, setNewAction] = useState('')

  useEffect(() => {
    loadSession()
  }, [sessionId])

  async function loadSession() {
    setLoading(true)

    const res = await fetch(`/api/sessions/${sessionId}`)
    const data = await res.json()

    if (data.success) {
      setSession(data.session)
      setNotes(data.session.notes || '')
      setSummary(data.session.summary || '')

      // Load business name
      const bizRes = await fetch(`/api/coach/clients/${data.session.business_id}`)
      const bizData = await bizRes.json()
      if (bizData.success) {
        setBusiness({
          id: bizData.client.id,
          business_name: bizData.client.business_name || bizData.client.name
        })
      }
    }

    setLoading(false)
  }

  async function saveNotes() {
    setSaving(true)

    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, summary })
    })

    setSaving(false)
    await loadSession() // Reload to get updated data
  }

  async function markComplete() {
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    })
    await loadSession()
  }

  async function addAction() {
    if (!newAction.trim()) return

    await fetch(`/api/sessions/${sessionId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_text: newAction,
        status: 'open'
      })
    })

    setNewAction('')
    await loadSession()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-600">Loading session...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Session not found</p>
          <Link href="/coach/sessions" className="text-teal-600 hover:underline">
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  const isUpcoming = new Date(session.scheduled_at) > new Date()
  const isPast = new Date(session.scheduled_at) <= new Date()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/coach/sessions"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sessions
            </Link>

            <div className="flex items-center gap-2">
              {session.status === 'scheduled' && isPast && (
                <button
                  onClick={markComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
              )}
              <button
                onClick={saveNotes}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {business && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {business.business_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(session.scheduled_at).toLocaleDateString('en-AU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
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
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                session.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : session.status === 'scheduled'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {session.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Session Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief overview of the session..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900">
                  Session Notes
                </label>
                <Edit3 className="w-4 h-4 text-gray-400" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes during or after the session..."
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Notes are private and only visible to coaches
              </p>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Action Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Action Items</h3>

              {/* Add New Action */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAction()}
                    placeholder="Add action item..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={addAction}
                    className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action List */}
              <div className="space-y-2">
                {session.session_actions && session.session_actions.length > 0 ? (
                  session.session_actions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3 rounded-lg border ${
                        action.status === 'completed'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <p className="text-sm text-gray-900">{action.action_text}</p>
                      {action.due_date && (
                        <p className="text-xs text-gray-600 mt-1">
                          Due: {new Date(action.due_date).toLocaleDateString('en-AU')}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No action items yet
                  </p>
                )}
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Session Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{session.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium text-gray-900 capitalize">{session.status}</p>
                </div>
                {business && (
                  <div>
                    <p className="text-gray-600">Client</p>
                    <Link
                      href={`/coach/clients/${business.id}`}
                      className="font-medium text-teal-600 hover:underline"
                    >
                      {business.business_name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
