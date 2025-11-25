'use client'

import Link from 'next/link'
import { Rocket } from 'lucide-react'
import type { Rock } from '../types'
import { getQuarterDisplayName } from '../utils/formatters'

interface RocksCardProps {
  rocks: Rock[]
  currentQuarter: string
}

function getStatusStyle(status: string, progress: number) {
  if (status === 'completed' || progress === 100) {
    return { dot: 'bg-teal-500', text: 'text-teal-600', label: 'Done' }
  }
  if (status === 'at_risk') {
    return { dot: 'bg-amber-500', text: 'text-amber-600', label: 'At Risk' }
  }
  if (status === 'on_track' || progress >= 30) {
    return { dot: 'bg-teal-500', text: 'text-teal-600', label: 'On Track' }
  }
  return { dot: 'bg-slate-300', text: 'text-slate-500', label: 'Not Started' }
}

export default function RocksCard({ rocks, currentQuarter }: RocksCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Quarterly Rocks</h3>
              <p className="text-xs text-slate-500">{getQuarterDisplayName(currentQuarter)}</p>
            </div>
          </div>
          {rocks.length > 0 && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              {rocks.length} active
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {rocks.length > 0 ? (
          <div className="space-y-3">
            {rocks.map((rock) => {
              const status = getStatusStyle(rock.status, rock.progressPercentage)
              return (
                <div key={rock.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{rock.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{rock.owner}</span>
                        <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 ml-2">
                      {rock.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${status.dot} transition-all`}
                      style={{ width: `${Math.max(rock.progressPercentage, 2)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-lg flex items-center justify-center">
              <Rocket className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">No rocks for {getQuarterDisplayName(currentQuarter)}</p>
            <p className="text-sm text-slate-400 mb-4">Define your key priorities</p>
            <Link
              href="/one-page-plan"
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Set Your Rocks
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
