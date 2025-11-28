'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserSystemRole } from '@/lib/auth/roles'
import { CoachSidebar } from './CoachSidebar'
import { CoachHeader } from './CoachHeader'
import { Loader2 } from 'lucide-react'

interface Client {
  id: string
  business_name: string
  status: string
}

interface CoachLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showHeader?: boolean
}

export function CoachLayout({
  children,
  title,
  subtitle,
  showHeader = true
}: CoachLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  // Check if we're on a public page (login)
  const isPublicPage = pathname === '/coach/login'

  useEffect(() => {
    if (isPublicPage) {
      // Don't run auth check on login page, just render children
      setLoading(false)
      return
    }
    checkAuthAndLoadData()
  }, [isPublicPage])

  async function checkAuthAndLoadData() {
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      console.log('[CoachLayout] User:', user?.id)
      if (!user) {
        console.log('[CoachLayout] No user, redirecting to login')
        router.push('/coach/login')
        return
      }

      // Check role
      console.log('[CoachLayout] Checking role...')
      const role = await getUserSystemRole()
      console.log('[CoachLayout] Role result:', role)
      if (role !== 'coach' && role !== 'super_admin') {
        console.log('[CoachLayout] Not a coach, redirecting. Role was:', role)
        router.push('/login')
        return
      }
      console.log('[CoachLayout] Role check passed')

      // Set user name
      const name = user.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
        : user.email?.split('@')[0] || 'Coach'
      setUserName(name)

      // Load clients for sidebar
      await loadClients(user.id)

      // Load notifications
      await loadNotifications()

      setLoading(false)
      console.log('[CoachLayout] All checks passed, showing layout')
    } catch (error) {
      console.error('[CoachLayout] Error:', error)
      router.push('/coach/login')
    }
  }

  async function loadClients(coachId: string) {
    console.log('[CoachLayout] Loading clients for coach:', coachId)
    const { data, error } = await supabase
      .from('businesses')
      .select('id, business_name, status')
      .eq('assigned_coach_id', coachId)
      .order('business_name', { ascending: true })

    console.log('[CoachLayout] Clients result:', { data, error })
    if (!error && data) {
      setClients(data)
    }
  }

  async function loadNotifications() {
    // TODO: Load real notifications from database
    // For now, return empty array
    setNotifications([])
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/coach/login')
  }

  function handleSearch(query: string) {
    router.push(`/coach/clients?search=${encodeURIComponent(query)}`)
  }

  // For public pages (login), just render children without layout chrome
  if (isPublicPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading coach portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <CoachSidebar
        clients={clients}
        userName={userName}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="pl-64">
        {showHeader && (
          <CoachHeader
            title={title}
            subtitle={subtitle}
            notifications={notifications}
            onSearch={handleSearch}
          />
        )}

        <main className="min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default CoachLayout
