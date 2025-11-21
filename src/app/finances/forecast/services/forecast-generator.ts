import type { FinancialForecast, PLLine, DistributionMethod } from '../types'

interface GenerateForecastParams {
  forecast: FinancialForecast
  revenueGoal: number
  cogsPercentage: number
  opexBudget: number
  distributionMethod: DistributionMethod
  existingLines: PLLine[]
}

interface GeneratedForecast {
  lines: PLLine[]
}

export class ForecastGenerator {
  /**
   * Generate forecast P&L lines from assumptions
   */
  static async generateForecast(params: GenerateForecastParams): Promise<GeneratedForecast> {
    const {
      forecast,
      revenueGoal,
      cogsPercentage,
      opexBudget,
      distributionMethod,
      existingLines
    } = params

    console.log('[ForecastGenerator] Generating forecast with params:', {
      revenueGoal,
      cogsPercentage,
      opexBudget,
      distributionMethod
    })

    // Generate month keys for forecast period
    const forecastMonthKeys = this.generateMonthKeys(
      forecast.forecast_start_month,
      forecast.forecast_end_month
    )

    // 1. Distribute revenue across months
    const revenueDistribution = this.distributeRevenue(
      revenueGoal,
      forecastMonthKeys,
      distributionMethod,
      existingLines
    )

    // 2. Calculate COGS for each month
    const cogsDistribution = this.calculateCOGS(revenueDistribution, cogsPercentage)

    // 3. Distribute OpEx across months
    const opexDistribution = this.distributeOpEx(opexBudget, forecastMonthKeys)

    // 4. Create/update P&L lines
    const updatedLines = this.applyForecastToLines(
      existingLines,
      forecastMonthKeys,
      revenueDistribution,
      cogsDistribution,
      opexDistribution
    )

    return { lines: updatedLines }
  }

  /**
   * Generate array of month keys (YYYY-MM format)
   */
  private static generateMonthKeys(startMonth: string, endMonth: string): string[] {
    const start = new Date(startMonth + '-01')
    const end = new Date(endMonth + '-01')
    const months: string[] = []

    const current = new Date(start)
    while (current <= end) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      months.push(`${year}-${month}`)
      current.setMonth(current.getMonth() + 1)
    }

    return months
  }

  /**
   * Distribute revenue goal across months based on method
   */
  private static distributeRevenue(
    revenueGoal: number,
    monthKeys: string[],
    method: DistributionMethod,
    existingLines: PLLine[]
  ): { [key: string]: number } {
    const monthCount = monthKeys.length

    switch (method) {
      case 'even': {
        // Equal amount each month
        const monthlyAmount = revenueGoal / monthCount
        return monthKeys.reduce((acc, key) => {
          acc[key] = monthlyAmount
          return acc
        }, {} as { [key: string]: number })
      }

      case 'seasonal_pattern': {
        // Use FY25 actual pattern, scaled to goal
        const revenueLines = existingLines.filter(l => l.category === 'Revenue')
        const actualPattern = this.calculateSeasonalPattern(revenueLines, monthKeys)

        if (actualPattern.total > 0) {
          // Scale pattern to match goal
          const scaleFactor = revenueGoal / actualPattern.total
          return monthKeys.reduce((acc, key) => {
            acc[key] = (actualPattern.distribution[key] || 0) * scaleFactor
            return acc
          }, {} as { [key: string]: number })
        }

        // Fallback to even split if no historical data
        const monthlyAmount = revenueGoal / monthCount
        return monthKeys.reduce((acc, key) => {
          acc[key] = monthlyAmount
          return acc
        }, {} as { [key: string]: number })
      }

      case 'custom': {
        // User will set custom values in the P&L table
        // For now, default to even split as placeholder
        const monthlyAmount = revenueGoal / monthCount
        return monthKeys.reduce((acc, key) => {
          acc[key] = monthlyAmount
          return acc
        }, {} as { [key: string]: number })
      }

      default: {
        const monthlyAmount = revenueGoal / monthCount
        return monthKeys.reduce((acc, key) => {
          acc[key] = monthlyAmount
          return acc
        }, {} as { [key: string]: number })
      }
    }
  }

  /**
   * Calculate seasonal pattern from FY25 actuals
   */
  private static calculateSeasonalPattern(
    revenueLines: PLLine[],
    targetMonthKeys: string[]
  ): { distribution: { [key: string]: number }, total: number } {
    // Sum up all revenue line actuals per month
    const monthlyTotals: { [key: string]: number } = {}
    let total = 0

    revenueLines.forEach(line => {
      if (line.actual_months) {
        Object.entries(line.actual_months).forEach(([month, value]) => {
          monthlyTotals[month] = (monthlyTotals[month] || 0) + value
          total += value
        })
      }
    })

    // Map historical months to target forecast months
    // For simplicity, use the same month pattern (e.g., Jul FY25 → Jul FY26)
    const distribution: { [key: string]: number } = {}

    targetMonthKeys.forEach(targetMonth => {
      // Get the month number (e.g., "2025-07" → "07")
      const monthNum = targetMonth.split('-')[1]

      // Find corresponding historical month with same month number
      const historicalMonth = Object.keys(monthlyTotals).find(m => m.endsWith(`-${monthNum}`))

      if (historicalMonth) {
        distribution[targetMonth] = monthlyTotals[historicalMonth]
      } else {
        distribution[targetMonth] = 0
      }
    })

    return { distribution, total }
  }

  /**
   * Calculate COGS for each month based on revenue
   */
  private static calculateCOGS(
    revenueDistribution: { [key: string]: number },
    cogsPercentage: number
  ): { [key: string]: number } {
    const cogs: { [key: string]: number } = {}

    Object.entries(revenueDistribution).forEach(([month, revenue]) => {
      cogs[month] = revenue * cogsPercentage
    })

    return cogs
  }

  /**
   * Distribute OpEx budget across months
   */
  private static distributeOpEx(
    opexBudget: number,
    monthKeys: string[]
  ): { [key: string]: number } {
    // For now, even distribution
    // TODO: Could add seasonal pattern option later
    const monthlyOpEx = opexBudget / monthKeys.length

    return monthKeys.reduce((acc, key) => {
      acc[key] = monthlyOpEx
      return acc
    }, {} as { [key: string]: number })
  }

  /**
   * Apply forecast values to existing P&L lines
   */
  private static applyForecastToLines(
    existingLines: PLLine[],
    forecastMonthKeys: string[],
    revenueDistribution: { [key: string]: number },
    cogsDistribution: { [key: string]: number },
    opexDistribution: { [key: string]: number }
  ): PLLine[] {
    const updatedLines = [...existingLines]

    // Find or create summary lines for each category
    const revenueLine = this.findOrCreateSummaryLine(
      updatedLines,
      'Revenue',
      'Total Revenue',
      1
    )

    const cogsLine = this.findOrCreateSummaryLine(
      updatedLines,
      'Cost of Sales',
      'Total Cost of Sales',
      100
    )

    const opexLine = this.findOrCreateSummaryLine(
      updatedLines,
      'Operating Expenses',
      'Total Operating Expenses',
      200
    )

    // Apply forecast values
    revenueLine.forecast_months = revenueDistribution
    cogsLine.forecast_months = cogsDistribution
    opexLine.forecast_months = opexDistribution

    // Mark as generated from assumptions
    revenueLine.is_manual = false
    cogsLine.is_manual = false
    opexLine.is_manual = false

    return updatedLines
  }

  /**
   * Find existing line or create new summary line
   */
  private static findOrCreateSummaryLine(
    lines: PLLine[],
    category: string,
    accountName: string,
    sortOrder: number
  ): PLLine {
    let line = lines.find(l =>
      l.category === category &&
      l.account_name === accountName
    )

    if (!line) {
      line = {
        account_name: accountName,
        category,
        sort_order: sortOrder,
        actual_months: {},
        forecast_months: {},
        is_manual: false,
        is_from_xero: false
      }
      lines.push(line)
    }

    return line
  }
}
