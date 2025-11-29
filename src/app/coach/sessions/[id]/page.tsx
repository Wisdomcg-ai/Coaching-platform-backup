'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  Save,
  CheckCircle,
  Play,
  Upload,
  FileText,
  Star,
  User,
  EyeOff,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react'

interface SessionNote {
  id: string
  business_id: string
  coach_id: string
  session_date: string
  status: 'active' | 'completed'
  duration_minutes: number | null

  // Coach fields
  discussion_points: string | null
  client_commitments: string | null
  coach_action_items: string | null
  private_observations: string | null
  next_session_prep: string | null
  transcript_url: string | null
  transcript_name: string | null

  // Client fields
  client_takeaways: string | null
  client_notes: string | null
  client_rating: number | null
  client_feedback: string | null

  // Visibility
  visible_to_all_users: boolean

  // Timestamps
  created_at: string
  updated_at: string
  coach_started_at: string | null
  client_started_at: string | null
  completed_at: string | null
}

interface Attendee {
  id: string
  user_id: string
  user_type: 'coach' | 'client'
}

interface Business {
  id: string
  business_name: string
  owner_id: string
}

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const sessionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [session, setSession] = useState<SessionNote | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // Editable fields (coach)
  const [discussionPoints, setDiscussionPoints] = useState('')
  const [clientCommitments, setClientCommitments] = useState('')
  const [coachActionItems, setCoachActionItems] = useState('')
  const [privateObservations, setPrivateObservations] = useState('')
  const [nextSessionPrep, setNextSessionPrep] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [visibleToAll, setVisibleToAll] = useState(false)

  // Transcript upload
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const loadSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/coach/login')
        return
      }
      setCurrentUserId(user.id)

      // Load session
      const { data: sessionData, error } = await supabase
        .from('session_notes')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error || !sessionData) {
        console.error('Error loading session:', error)
        return
      }

      setSession(sessionData)
      setDiscussionPoints(sessionData.discussion_points || '')
      setClientCommitments(sessionData.client_commitments || '')
      setCoachActionItems(sessionData.coach_action_items || '')
      setPrivateObservations(sessionData.private_observations || '')
      setNextSessionPrep(sessionData.next_session_prep || '')
      setDurationMinutes(sessionData.duration_minutes)
      setVisibleToAll(sessionData.visible_to_all_users || false)

      // Load business
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id, business_name, owner_id')
        .eq('id', sessionData.business_id)
        .single()

      if (businessData) {
        setBusiness(businessData)
      }

      // Load attendees
      const { data: attendeesData } = await supabase
        .from('session_attendees')
        .select('id, user_id, user_type')
        .eq('session_note_id', sessionId)

      if (attendeesData) {
        setAttendees(attendeesData)
      }
    } catch (error) {
      console.error('Error loading session:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, sessionId, router])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  async function saveSession() {
    if (!session) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('session_notes')
        .update({
          discussion_points: discussionPoints || null,
          client_commitments: clientCommitments || null,
          coach_action_items: coachActionItems || null,
          private_observations: privateObservations || null,
          next_session_prep: nextSessionPrep || null,
          duration_minutes: durationMinutes,
          visible_to_all_users: visibleToAll
        })
        .eq('id', sessionId)

      if (error) throw error

      await loadSession()
    } catch (error) {
      console.error('Error saving session:', error)
      alert('Failed to save session. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function completeSession() {
    if (!session) return

    const confirmComplete = confirm(
      'Are you sure you want to mark this session as complete? This will prompt the client for feedback.'
    )
    if (!confirmComplete) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('session_notes')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          discussion_points: discussionPoints || null,
          client_commitments: clientCommitments || null,
          coach_action_items: coachActionItems || null,
          private_observations: privateObservations || null,
          next_session_prep: nextSessionPrep || null,
          duration_minutes: durationMinutes,
          visible_to_all_users: visibleToAll
        })
        .eq('id', sessionId)

      if (error) throw error

      await loadSession()
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Failed to complete session. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTranscriptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      // Validate file
      const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a .txt, .pdf, or .docx file')
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      // Upload to storage
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `transcripts/${session?.business_id}/${timestamp}-${sanitizedName}`

      const { error: uploadError } = await supabase.storage
        .from('session-transcripts')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error('Failed to upload file. Make sure the storage bucket exists.')
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('session-transcripts')
        .getPublicUrl(filePath)

      // Update session
      const { error } = await supabase
        .from('session_notes')
        .update({
          transcript_url: urlData.publicUrl,
          transcript_name: file.name
        })
        .eq('id', sessionId)

      if (error) throw error

      await loadSession()
    } catch (error: any) {
      console.error('Error uploading transcript:', error)
      setUploadError(error.message || 'Failed to upload transcript')
    } finally {
      setUploading(false)
    }
  }

  async function removeTranscript() {
    if (!session?.transcript_url) return

    try {
      // Extract path from URL
      const urlParts = session.transcript_url.split('/session-transcripts/')
      if (urlParts.length >= 2) {
        await supabase.storage
          .from('session-transcripts')
          .remove([urlParts[1]])
      }

      // Update session
      await supabase
        .from('session_notes')
        .update({
          transcript_url: null,
          transcript_name: null
        })
        .eq('id', sessionId)

      await loadSession()
    } catch (error) {
      console.error('Error removing transcript:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">This session may have been deleted or you don't have access.</p>
          <Link
            href="/coach/sessions"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/coach/sessions"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {business?.business_name || 'Session'}
                  </h1>
                  {session.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <Play className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.session_date)}
                  </span>
                  {session.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveSession}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
              {session.status === 'active' && (
                <button
                  onClick={completeSession}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Discussion Points */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Discussion Points
              </label>
              <textarea
                value={discussionPoints}
                onChange={(e) => setDiscussionPoints(e.target.value)}
                placeholder="Key topics discussed during the session..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Visible to client
              </p>
            </div>

            {/* Client Commitments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Client Commitments
              </label>
              <textarea
                value={clientCommitments}
                onChange={(e) => setClientCommitments(e.target.value)}
                placeholder="Action items and commitments the client agreed to..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Visible to client
              </p>
            </div>

            {/* Private Coach Notes */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <EyeOff className="w-4 h-4 text-amber-600" />
                <label className="block text-sm font-semibold text-amber-900">
                  Private Coach Notes
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-amber-800 mb-2">
                    Action Items (for you)
                  </label>
                  <textarea
                    value={coachActionItems}
                    onChange={(e) => setCoachActionItems(e.target.value)}
                    placeholder="Tasks you need to complete..."
                    rows={3}
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-800 mb-2">
                    Observations
                  </label>
                  <textarea
                    value={privateObservations}
                    onChange={(e) => setPrivateObservations(e.target.value)}
                    placeholder="Private observations about the client or session..."
                    rows={3}
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-800 mb-2">
                    Next Session Prep
                  </label>
                  <textarea
                    value={nextSessionPrep}
                    onChange={(e) => setNextSessionPrep(e.target.value)}
                    placeholder="Topics to cover in the next session..."
                    rows={3}
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white"
                  />
                </div>
              </div>

              <p className="text-xs text-amber-700 mt-3 flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Only visible to you
              </p>
            </div>

            {/* Client Input (Read-only for coach) */}
            {(session.client_takeaways || session.client_notes || session.client_rating || session.client_feedback) && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-900">Client Input</h3>
                </div>

                {session.client_rating && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-blue-800 mb-2">Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= session.client_rating!
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-blue-800">{session.client_rating}/5</span>
                    </div>
                  </div>
                )}

                {session.client_takeaways && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-blue-800 mb-2">Takeaways</label>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{session.client_takeaways}</p>
                  </div>
                )}

                {session.client_notes && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-blue-800 mb-2">Notes</label>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{session.client_notes}</p>
                  </div>
                )}

                {session.client_feedback && (
                  <div>
                    <label className="block text-xs font-medium text-blue-800 mb-2">Feedback</label>
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{session.client_feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Session Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Session Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes || ''}
                    onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Client</label>
                  <Link
                    href={`/coach/clients/${business?.id}`}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                  >
                    <Building2 className="w-4 h-4" />
                    {business?.business_name}
                  </Link>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Visibility</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleToAll}
                      onChange={(e) => setVisibleToAll(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Visible to all team members</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    By default, only owners/partners and attendees can see this session.
                  </p>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Transcript</h3>

              {session.transcript_url ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.transcript_name}
                    </p>
                    <a
                      href={session.transcript_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      View transcript
                    </a>
                  </div>
                  <button
                    onClick={removeTranscript}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {uploading ? 'Uploading...' : 'Upload transcript'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      .txt, .pdf, or .docx (max 10MB)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.pdf,.docx"
                      onChange={handleTranscriptUpload}
                      disabled={uploading}
                    />
                  </label>
                  {uploadError && (
                    <p className="text-xs text-red-600 mt-2">{uploadError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Attendees */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Attendees</h3>

              <div className="space-y-2">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      attendee.user_type === 'coach'
                        ? 'bg-indigo-100'
                        : 'bg-green-100'
                    }`}>
                      <User className={`w-4 h-4 ${
                        attendee.user_type === 'coach'
                          ? 'text-indigo-600'
                          : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {attendee.user_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attendee.user_id === currentUserId ? 'You' : 'Participant'}
                      </p>
                    </div>
                  </div>
                ))}
                {attendees.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No attendees recorded
                  </p>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(session.created_at).toLocaleString('en-AU')}
                  </span>
                </div>
                {session.coach_started_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coach joined</span>
                    <span className="text-gray-900">
                      {new Date(session.coach_started_at).toLocaleString('en-AU')}
                    </span>
                  </div>
                )}
                {session.client_started_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client joined</span>
                    <span className="text-gray-900">
                      {new Date(session.client_started_at).toLocaleString('en-AU')}
                    </span>
                  </div>
                )}
                {session.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-gray-900">
                      {new Date(session.completed_at).toLocaleString('en-AU')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Last updated</span>
                  <span className="text-gray-900">
                    {new Date(session.updated_at).toLocaleString('en-AU')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
