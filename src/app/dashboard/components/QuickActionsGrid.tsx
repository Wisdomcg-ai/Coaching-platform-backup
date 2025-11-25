'use client'

import Link from 'next/link'
import { BarChart3, CheckSquare, XCircle } from 'lucide-react'

const quickActions = [
  {
    href: '/business-dashboard',
    icon: BarChart3,
    title: 'Business Dashboard',
    description: 'View metrics & analytics'
  },
  {
    href: '/todo',
    icon: CheckSquare,
    title: 'To-Do List',
    description: 'Manage your tasks'
  },
  {
    href: '/stop-doing',
    icon: XCircle,
    title: 'Stop Doing List',
    description: 'Eliminate time wasters'
  }
]

export default function QuickActionsGrid() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
              <action.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-semibold text-gray-900 mb-1">{action.title}</span>
            <span className="text-xs text-gray-500 text-center">{action.description}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
