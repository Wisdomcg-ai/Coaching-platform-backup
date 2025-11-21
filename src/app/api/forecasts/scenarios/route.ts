import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/forecasts/scenarios?forecast_id=xxx
 * Fetch all scenarios for a forecast
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const forecastId = searchParams.get('forecast_id')

    if (!forecastId) {
      return NextResponse.json({ error: 'forecast_id is required' }, { status: 400 })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch scenarios
    const { data: scenarios, error } = await supabase
      .from('forecast_scenarios')
      .select('*')
      .eq('forecast_id', forecastId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching scenarios:', error)
      return NextResponse.json({ error: 'Failed to fetch scenarios' }, { status: 500 })
    }

    return NextResponse.json({ scenarios: scenarios || [] })

  } catch (error) {
    console.error('Error in GET /api/forecasts/scenarios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/forecasts/scenarios
 * Create a new scenario
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      forecast_id,
      name,
      description,
      revenue_multiplier = 1.0,
      cogs_multiplier = 1.0,
      opex_multiplier = 1.0,
      scenario_type = 'planning'
    } = body

    if (!forecast_id || !name) {
      return NextResponse.json(
        { error: 'forecast_id and name are required' },
        { status: 400 }
      )
    }

    // Create scenario
    const { data: scenario, error } = await supabase
      .from('forecast_scenarios')
      .insert({
        forecast_id,
        user_id: user.id,
        name,
        description,
        scenario_type,
        revenue_multiplier,
        cogs_multiplier,
        opex_multiplier,
        is_active: false,
        is_baseline: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating scenario:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create scenario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ scenario })

  } catch (error) {
    console.error('Error in POST /api/forecasts/scenarios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/forecasts/scenarios
 * Update a scenario (set active, update multipliers, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scenario_id, ...updates } = body

    if (!scenario_id) {
      return NextResponse.json({ error: 'scenario_id is required' }, { status: 400 })
    }

    // Update scenario
    const { data: scenario, error } = await supabase
      .from('forecast_scenarios')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', scenario_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating scenario:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update scenario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ scenario })

  } catch (error) {
    console.error('Error in PATCH /api/forecasts/scenarios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/forecasts/scenarios?scenario_id=xxx
 * Delete a scenario
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const scenarioId = searchParams.get('scenario_id')

    if (!scenarioId) {
      return NextResponse.json({ error: 'scenario_id is required' }, { status: 400 })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if it's the baseline scenario
    const { data: scenario } = await supabase
      .from('forecast_scenarios')
      .select('is_baseline')
      .eq('id', scenarioId)
      .single()

    if (scenario?.is_baseline) {
      return NextResponse.json(
        { error: 'Cannot delete baseline scenario' },
        { status: 400 }
      )
    }

    // Delete scenario
    const { error } = await supabase
      .from('forecast_scenarios')
      .delete()
      .eq('id', scenarioId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting scenario:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete scenario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in DELETE /api/forecasts/scenarios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
