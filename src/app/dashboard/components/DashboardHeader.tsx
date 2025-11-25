'use client'

import { RefreshCw } from 'lucide-react'

interface DashboardHeaderProps {
  onRefresh: () => void
  rocksOnTrack?: number
  rocksAtRisk?: number
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardHeader({ onRefresh, rocksOnTrack = 0, rocksAtRisk = 0 }: DashboardHeaderProps) {
  const totalRocks = rocksOnTrack + rocksAtRisk

  return (
    <div className="bg-slate-900 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Command Centre</p>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-AU', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Status indicators */}
          {totalRocks > 0 && (
            <div className="hidden md:flex items-center gap-3">
              {rocksOnTrack > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  <span className="text-sm text-slate-300">{rocksOnTrack} on track</span>
                </div>
              )}
              {rocksAtRisk > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-slate-300">{rocksAtRisk} need attention</span>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
