// Consolidated financial goals interface (was duplicated as AnnualGoals and QuarterlyGoals)
export interface FinancialGoals {
  revenue: number
  grossProfit: number
  grossMargin: number
  netProfit: number
  netMargin: number
}

export interface Rock {
  id: string
  title: string
  owner: string
  status: 'not_started' | 'on_track' | 'at_risk' | 'completed'
  progressPercentage: number
}

export interface DashboardData {
  annualGoals: FinancialGoals | null
  quarterlyGoals: FinancialGoals | null
  currentQuarter: 'q1' | 'q2' | 'q3' | 'q4'
  rocks: Rock[]
  weeklyGoals: string[]
}

export interface DashboardError {
  type: 'auth' | 'data' | 'network'
  message: string
  details?: string
}
