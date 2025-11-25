'use client'

import Link from 'next/link'
import { BarChart3, CheckSquare, XCircle, FileText, Users, TrendingUp } from 'lucide-react'

const quickActions = [
  {
    href: '/business-dashboard',
    icon: BarChart3,
    title: 'Dashboard',
    subtitle: 'Metrics & KPIs'
  },
  {
    href: '/finances/forecast',
    icon: TrendingUp,
    title: 'Forecast',
    subtitle: 'Plan financials'
  },
  {
    href: '/one-page-plan',
    icon: FileText,
    title: 'One Page Plan',
    subtitle: 'Strategy view'
  },
  {
    href: '/todo',
    icon: CheckSquare,
    title: 'To-Do List',
    subtitle: 'Manage tasks'
  },
  {
    href: '/team',
    icon: Users,
    title: 'Team',
    subtitle: 'Your people'
  },
  {
    href: '/stop-doing',
    icon: XCircle,
    title: 'Stop Doing',
    subtitle: 'Eliminate waste'
  }
]

export default function QuickActionsGrid() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Quick Actions</h3>
        <p className="text-xs text-slate-500">Jump to key areas of your business</p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 bg-slate-100 group-hover:bg-teal-500 transition-colors">
                  <Icon className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-800 text-center">{action.title}</span>
                <span className="text-xs text-slate-500 text-center">{action.subtitle}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
