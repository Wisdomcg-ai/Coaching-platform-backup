'use client'

import { useEffect, useState } from 'react'
import { useBusinessContext } from '@/hooks/useBusinessContext'
import { Loader2, AlertCircle, Construction } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import client page components
// This allows us to render the same components the client sees
const pageComponents: Record<string, React.ComponentType<any>> = {
  // These will be lazy loaded
}

// Map of path to component imports
const getPageComponent = (path: string[]) => {
  const fullPath = path.join('/')

  // Map paths to their respective components
  const componentMap: Record<string, () => Promise<any>> = {
    'dashboard': () => import('@/app/dashboard/page'),
    'business-profile': () => import('@/app/business-profile/page'),
    'assessment': () => import('@/app/assessment/page'),
    'business-roadmap': () => import('@/app/business-roadmap/page'),
    'vision-mission': () => import('@/app/vision-mission/page'),
    'swot': () => import('@/app/swot/page'),
    'goals': () => import('@/app/goals/page'),
    'one-page-plan': () => import('@/app/one-page-plan/page'),
    'finances/forecast': () => import('@/app/finances/forecast/page'),
    'finances/budget': () => import('@/app/financials/page'),
    'business-dashboard': () => import('@/app/business-dashboard/page'),
    'issues-list': () => import('@/app/issues-list/page'),
    'open-loops': () => import('@/app/open-loops/page'),
    'todo': () => import('@/app/todo/page'),
    'stop-doing': () => import('@/app/stop-doing/page'),
    'reviews/weekly': () => import('@/app/reviews/weekly/page'),
    'reviews/monthly': () => import('@/app/reviews/weekly/page'), // Using weekly for now
    'quarterly-review': () => import('@/app/quarterly-review/page'),
    'marketing/value-prop': () => import('@/app/marketing/value-prop/page'),
    'team/accountability': () => import('@/app/team/accountability/page'),
  }

  return componentMap[fullPath]
}

interface PageProps {
  params: {
    id: string
    path: string[]
  }
}

export default function CoachViewPage({ params }: PageProps) {
  const { activeBusiness, isLoading: contextLoading } = useBusinessContext()
  const [PageComponent, setPageComponent] = useState<React.ComponentType<any> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pathString = params.path.join('/')

  useEffect(() => {
    const loadComponent = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const componentLoader = getPageComponent(params.path)

        if (!componentLoader) {
          setError(`Page not found: ${pathString}`)
          setIsLoading(false)
          return
        }

        const module = await componentLoader()
        setPageComponent(() => module.default)
      } catch (err) {
        console.error('Error loading page component:', err)
        setError(`Failed to load page: ${pathString}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadComponent()
  }, [params.path, pathString])

  if (contextLoading || isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading {pathString}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Construction className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Page Coming Soon</h3>
          <p className="text-gray-500 mb-4">
            This view is being set up for coach access.
          </p>
          <p className="text-sm text-gray-400">Path: {pathString}</p>
        </div>
      </div>
    )
  }

  if (!PageComponent) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Page Not Found</h3>
          <p className="text-gray-500">
            The requested page could not be loaded.
          </p>
        </div>
      </div>
    )
  }

  // Render the client page component
  // The component will use useBusinessContext() to get the correct business data
  return <PageComponent />
}
