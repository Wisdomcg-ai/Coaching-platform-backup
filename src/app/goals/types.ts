// /app/goals/types.ts
// This file contains all TypeScript interfaces used across the goals wizard

export interface FinancialData {
  revenue: { current: number; year1: number; year2: number; year3: number }
  grossProfit: { current: number; year1: number; year2: number; year3: number }
  grossMargin: { current: number; year1: number; year2: number; year3: number }
  netProfit: { current: number; year1: number; year2: number; year3: number }
  netMargin: { current: number; year1: number; year2: number; year3: number }
  customers: { current: number; year1: number; year2: number; year3: number }
  employees: { current: number; year1: number; year2: number; year3: number }
}

export interface CoreMetricsData {
  leadsPerMonth: { current: number; year1: number; year2: number; year3: number }
  conversionRate: { current: number; year1: number; year2: number; year3: number }
  avgTransactionValue: { current: number; year1: number; year2: number; year3: number }
  teamHeadcount: { current: number; year1: number; year2: number; year3: number }
  ownerHoursPerWeek: { current: number; year1: number; year2: number; year3: number }
}

export interface KPIData {
  id: string
  name: string
  friendlyName?: string
  category: string
  currentValue: number
  year1Target: number
  year2Target: number
  year3Target: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  description?: string
  isStandard?: boolean
  isIndustry?: boolean
  isCustom?: boolean
}

export type InitiativeCategory =
  | 'marketing'
  | 'operations'
  | 'finance'
  | 'people'
  | 'systems'
  | 'product'
  | 'customer_experience'
  | 'other'
  | 'misc'

export type InitiativePriority = 'high' | 'medium' | 'low'

export type InitiativeEffort = 'small' | 'medium' | 'large'

export type InitiativeStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'

export interface StrategicInitiative {
  id: string
  title: string
  description?: string
  source: 'strategic_ideas' | 'roadmap'
  category?: InitiativeCategory
  priority?: InitiativePriority
  estimatedEffort?: InitiativeEffort
  timeline?: 'year1' | 'year2' | 'year3'
  selected?: boolean
  notes?: string
  linkedKPIs?: string[]
  order?: number
  assignedTo?: string
  // Lifecycle tracking
  status?: InitiativeStatus
  progressPercentage?: number
  actualStartDate?: string
  actualCompletionDate?: string
  quarterAssigned?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  yearAssigned?: number
  reflectionNotes?: string
}

export interface BusinessProfile {
  id?: string
  company_name?: string
  industry: string
  current_revenue?: number
  employee_count?: number
}

export type YearType = 'FY' | 'CY'

export type QuarterType = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived'

export type PlanType = 'initial' | 'quarterly_refresh' | 'annual_reset'

export interface StrategicPlan {
  id: string
  businessId: string
  userId: string
  wizardCompletedAt?: string
  planStartDate?: string
  planYear?: number
  currentQuarter?: QuarterType
  status: PlanStatus
  planType: PlanType
  createdAt: string
  updatedAt: string
}

export interface QuarterlySnapshot {
  id: string
  businessId: string
  userId: string
  strategicPlanId?: string
  snapshotYear: number
  snapshotQuarter: QuarterType
  snapshotDate: string
  // Performance summary
  totalInitiatives: number
  completedInitiatives: number
  inProgressInitiatives: number
  cancelledInitiatives: number
  completionRate: number
  // Snapshot data
  initiativesSnapshot: StrategicInitiative[]
  kpisSnapshot: any // KPI performance data
  financialSnapshot: any // Financial actuals
  // Reflections
  wins?: string
  challenges?: string
  learnings?: string
  adjustments?: string
  overallReflection?: string
  createdAt: string
  updatedAt: string
}

export interface KPIActual {
  id: string
  businessId: string
  userId: string
  kpiId: string
  periodYear: number
  periodQuarter?: QuarterType
  periodMonth?: number
  periodType: 'monthly' | 'quarterly' | 'annual'
  actualValue: number
  targetValue?: number
  variance?: number
  variancePercentage?: number
  notes?: string
  recordedAt: string
  createdAt: string
  updatedAt: string
}

export interface AnnualSnapshot {
  id: string
  businessId: string
  userId: string
  strategicPlanId?: string
  snapshotYear: number
  snapshotDate: string
  totalInitiatives: number
  completedInitiatives: number
  annualCompletionRate: number
  q1SnapshotId?: string
  q2SnapshotId?: string
  q3SnapshotId?: string
  q4SnapshotId?: string
  fullYearSnapshot: any
  financialPerformance: any
  kpiPerformance: any
  yearWins?: string
  yearChallenges?: string
  yearLearnings?: string
  strategicAdjustments?: string
  nextYearFocus?: string
  createdAt: string
  updatedAt: string
}