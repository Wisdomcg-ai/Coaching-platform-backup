import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/annual-plan
 * Fetches the user's annual plan data including 12-month targets
 *
 * This API combines data from multiple sources:
 * 1. Assessment data (12-month revenue/profit targets)
 * 2. Strategic initiatives (selected for annual plan)
 * 3. Strategic plans table (if exists)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get the latest assessment with 12-month targets
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Extract 12-month targets from assessment
    let revenueTarget = null
    let profitTarget = null
    let assessmentDate = null

    if (assessment && !assessmentError) {
      assessmentDate = assessment.created_at

      // Check various possible field names in the answers JSONB
      if (assessment.answers) {
        revenueTarget =
          assessment.answers.targetRevenue ||
          assessment.answers.target_revenue ||
          assessment.answers.revenue_target ||
          assessment.answers['12_month_revenue_target']

        profitTarget =
          assessment.answers.targetProfit ||
          assessment.answers.target_profit ||
          assessment.answers.profit_target ||
          assessment.answers['12_month_profit_target']
      }
    }

    // 2. Get strategic initiatives selected for annual plan
    const { data: initiatives, error: initiativesError } = await supabase
      .from('strategic_initiatives')
      .select('*')
      .eq('user_id', user.id)
      .eq('selected_for_annual_plan', true)
      .order('created_at', { ascending: false })

    // 3. Try to get strategic plan (if exists)
    const { data: strategicPlan, error: planError } = await supabase
      .from('strategic_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 4. Get business profile for context
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Prepare response
    const annualPlanData = {
      // Financial targets
      revenue_target: revenueTarget,
      profit_target: profitTarget,

      // Source information
      has_assessment: !!assessment,
      assessment_date: assessmentDate,
      has_strategic_plan: !!strategicPlan,
      strategic_plan_id: strategicPlan?.id || null,

      // Strategic context
      initiatives_count: initiatives?.length || 0,
      initiatives: initiatives || [],

      // Business context
      business_name: businessProfile?.business_name || '',
      current_revenue: businessProfile?.annual_revenue || null,

      // Metadata
      source: assessment ? 'assessment' : strategicPlan ? 'strategic_plan' : 'none'
    }

    return NextResponse.json(annualPlanData)

  } catch (error) {
    console.error('Error fetching annual plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch annual plan data' },
      { status: 500 }
    )
  }
}
