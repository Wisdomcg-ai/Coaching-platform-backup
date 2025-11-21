import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { ExcelExportService } from '@/app/finances/forecast/services/excel-export-service'
import { PDFExportService } from '@/app/finances/forecast/services/pdf-export-service'

/**
 * GET /api/forecasts/export?forecast_id=xxx&format=pdf|excel
 * Export forecast to PDF or Excel
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const forecastId = searchParams.get('forecast_id')
    const format = searchParams.get('format') || 'pdf'

    if (!forecastId) {
      return NextResponse.json({ error: 'forecast_id is required' }, { status: 400 })
    }

    if (!['pdf', 'excel'].includes(format)) {
      return NextResponse.json({ error: 'format must be "pdf" or "excel"' }, { status: 400 })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch forecast
    const { data: forecast, error: forecastError } = await supabase
      .from('financial_forecasts')
      .select('*')
      .eq('id', forecastId)
      .eq('user_id', user.id)
      .single()

    if (forecastError || !forecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 })
    }

    // Fetch P&L lines
    const { data: plLines, error: plError } = await supabase
      .from('forecast_pl_lines')
      .select('*')
      .eq('forecast_id', forecastId)
      .order('category')
      .order('display_order')

    if (plError) {
      console.error('Error fetching P&L lines:', plError)
      return NextResponse.json({ error: 'Failed to fetch forecast data' }, { status: 500 })
    }

    // Fetch payroll employees (optional)
    const { data: payrollEmployees } = await supabase
      .from('forecast_payroll_employees')
      .select('*')
      .eq('forecast_id', forecastId)
      .order('employee_name')

    // Fetch active scenario (optional)
    const { data: scenarios } = await supabase
      .from('forecast_scenarios')
      .select('*')
      .eq('forecast_id', forecastId)
      .eq('is_active', true)
      .single()

    const exportData = {
      forecast,
      plLines: plLines || [],
      payrollEmployees: payrollEmployees || [],
      activeScenario: scenarios || undefined
    }

    if (format === 'excel') {
      // Generate Excel
      const excelService = new ExcelExportService(exportData)
      const buffer = await excelService.generate()

      const filename = `forecast_${forecast.fiscal_year}_${new Date().getTime()}.xlsx`

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    } else {
      // Generate PDF
      const pdfService = new PDFExportService(exportData)
      const doc = pdfService.generate()
      const pdfBuffer = doc.output('arraybuffer')

      const filename = `forecast_${forecast.fiscal_year}_${new Date().getTime()}.pdf`

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }

  } catch (error) {
    console.error('Error in GET /api/forecasts/export:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
