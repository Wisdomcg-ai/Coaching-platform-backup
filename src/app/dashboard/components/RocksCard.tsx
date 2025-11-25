'use client'

import Link from 'next/link'
import { Rocket } from 'lucide-react'
import type { Rock } from '../types'
import { getRockStatusColor, getQuarterDisplayName } from '../utils/formatters'

interface RocksCardProps {
  rocks: Rock[]
  currentQuarter: string
}

export default function RocksCard({ rocks, currentQuarter }: RocksCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quarterly Rocks</h3>
            <p className="text-xs text-gray-500">{getQuarterDisplayName(currentQuarter)}</p>
          </div>
        </div>
      </div>

      {rocks.length > 0 ? (
        <div className="space-y-3">
          {rocks.map((rock) => (
            <div key={rock.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{rock.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Owner: {rock.owner}</p>
                </div>
                <span className="text-xs font-bold text-blue-700 ml-2 bg-blue-50 px-2 py-1 rounded">
                  {rock.progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getRockStatusColor(rock.status)}`}
                  style={{ width: `${Math.max(rock.progressPercentage, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-3">No rocks defined for {getQuarterDisplayName(currentQuarter)}</p>
          <Link
            href="/one-page-plan"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            Set Your Rocks →
          </Link>
        </div>
      )}
    </div>
  )
}
