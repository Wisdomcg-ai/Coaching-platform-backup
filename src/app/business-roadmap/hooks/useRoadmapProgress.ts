import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRoadmapProgress() {
  const [completedBuilds, setCompletedBuilds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  // Load completed builds from database
  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.log('No user found')
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('roadmap_progress')
        .select('completed_builds')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error loading roadmap progress:', error)
      } else if (data) {
        const builds = data.completed_builds as string[]
        setCompletedBuilds(new Set(builds))
        console.log('✅ Loaded roadmap progress:', builds.length, 'builds completed')
      } else {
        console.log('No existing progress found, starting fresh')
      }
    } catch (error) {
      console.error('Error in loadProgress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Save completed builds to database
  const saveProgress = async (builds: Set<string>) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.error('No user found, cannot save progress')
        return
      }

      const buildsArray = Array.from(builds)

      // Upsert (insert or update)
      const { error } = await supabase
        .from('roadmap_progress')
        .upsert({
          user_id: user.id,
          completed_builds: buildsArray
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving roadmap progress:', error)
      } else {
        console.log('✅ Saved roadmap progress:', buildsArray.length, 'builds')
      }
    } catch (error) {
      console.error('Error in saveProgress:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle a build's completion status
  const toggleBuild = useCallback((buildName: string) => {
    setCompletedBuilds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(buildName)) {
        newSet.delete(buildName)
      } else {
        newSet.add(buildName)
      }

      // Save to database (debounced via separate effect)
      saveProgress(newSet)

      return newSet
    })
  }, [])

  // Check if a build is complete
  const isComplete = useCallback((buildName: string) => {
    return completedBuilds.has(buildName)
  }, [completedBuilds])

  // Get completion stats
  const getStats = useCallback((totalBuilds: number) => {
    const completedCount = completedBuilds.size
    const percentage = totalBuilds > 0 ? Math.round((completedCount / totalBuilds) * 100) : 0

    return {
      completed: completedCount,
      total: totalBuilds,
      percentage
    }
  }, [completedBuilds])

  return {
    completedBuilds,
    isLoading,
    isSaving,
    toggleBuild,
    isComplete,
    getStats
  }
}
