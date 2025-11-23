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
      distributionMethod,
      existingLinesCount: existingLines.length,
      opexLinesCount: existingLines.filter(l => l.category === 'Operating Expenses').length
    })

    // Generate month keys for forecast period
    const forecastMonthKeys = this.generateMonthKeys(
      forecast.forecast_start_month,
      forecast.forecast_end_month
    )

    // 1. Distribute revenue to individual revenue lines based on FY25 patterns
    const linesWithRevenue = this.distributeRevenueToLines(
      revenueGoal,
      existingLines,
      forecastMonthKeys,
      distributionMethod
    )

    // 2. Distribute OpEx across individual lines based on FY25 patterns
    const linesWithOpEx = this.distributeOpExToLines(
      opexBudget,
      linesWithRevenue,
      forecastMonthKeys
    )

    // 3. Create/update P&L lines with COGS and summary lines
    const updatedLines = this.applyForecastToLines(
      linesWithOpEx,
      forecastMonthKeys,
      cogsPercentage
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
   * Distribute revenue budget across individual revenue lines based on FY25 actuals
   * This is the CFO best practice: use historical patterns to forecast
   */
  private static distributeRevenueToLines(
    revenueGoal: number,
    existingLines: PLLine[],
    monthKeys: string[],
    distributionMethod: DistributionMethod
  ): PLLine[] {
    if (revenueGoal === 0) {
      console.log('[ForecastGenerator] Revenue goal is 0, skipping distribution')
      return existingLines
    }

    // Get all Revenue lines (excluding the summary line)
    const revenueLines = existingLines.filter(l =>
      l.category === 'Revenue' &&
      l.account_name !== 'Total Revenue'
    )

    if (revenueLines.length === 0) {
      console.log('[ForecastGenerator] No revenue detail lines found, creating default line')
      // Create a default "Sales" line if none exist
      const defaultRevenueLine: PLLine = {
        account_name: 'Sales',
        category: 'Revenue',
        sort_order: 2,
        actual_months: {},
        forecast_months: {},
        is_manual: false,
        is_from_xero: false
      }
      existingLines.push(defaultRevenueLine)
      revenueLines.push(defaultRevenueLine)
    }

    // Calculate total FY25 Revenue from actuals
    const fy25RevenueTotals = revenueLines.map(line => {
      const total = Object.values(line.actual_months || {}).reduce((sum, val) => sum + val, 0)
      return { line, total }
    })

    const totalFY25Revenue = fy25RevenueTotals.reduce((sum, item) => sum + item.total, 0)

    if (totalFY25Revenue === 0) {
      console.log('[ForecastGenerator] No FY25 revenue actuals found, using even distribution')
      // Fallback: distribute evenly across all revenue lines
      const budgetPerLine = revenueGoal / revenueLines.length

      // Use distribution method for monthly pattern
      if (distributionMethod === 'even') {
        const monthlyAmount = budgetPerLine / monthKeys.length
        revenueLines.forEach(line => {
          line.forecast_months = monthKeys.reduce((acc, key) => {
            acc[key] = monthlyAmount
            return acc
          }, {} as { [key: string]: number })
          line.is_manual = false
        })
      } else {
        // Even distribution across lines, but seasonal pattern across months
        const monthlyAmount = budgetPerLine / monthKeys.length
        revenueLines.forEach(line => {
          line.forecast_months = monthKeys.reduce((acc, key) => {
            acc[key] = monthlyAmount
            return acc
          }, {} as { [key: string]: number })
          line.is_manual = false
        })
      }
      return existingLines
    }

    // Distribute budget to each line based on its % of FY25 total
    fy25RevenueTotals.forEach(({ line, total }) => {
      const percentageOfTotal = total / totalFY25Revenue
      const lineBudget = revenueGoal * percentageOfTotal

      console.log(`[ForecastGenerator] ${line.account_name}: FY25=${total.toFixed(0)}, %=${(percentageOfTotal * 100).toFixed(1)}%, FY26 Budget=${lineBudget.toFixed(0)}`)

      // Use seasonal pattern from FY25 or distribution method
      if (distributionMethod === 'seasonal_pattern') {
        const seasonalDistribution = this.calculateSeasonalPattern([line], monthKeys)

        if (seasonalDistribution.total > 0) {
          // Scale the pattern to match the line's budget
          const scaleFactor = lineBudget / seasonalDistribution.total
          line.forecast_months = monthKeys.reduce((acc, key) => {
            acc[key] = (seasonalDistribution.distribution[key] || 0) * scaleFactor
            return acc
          }, {} as { [key: string]: number })
        } else {
          // No historical pattern, use even distribution
          const monthlyAmount = lineBudget / monthKeys.length
          line.forecast_months = monthKeys.reduce((acc, key) => {
            acc[key] = monthlyAmount
            return acc
          }, {} as { [key: string]: number })
        }
      } else {
        // Even distribution across months
        const monthlyAmount = lineBudget / monthKeys.length
        line.forecast_months = monthKeys.reduce((acc, key) => {
          acc[key] = monthlyAmount
          return acc
        }, {} as { [key: string]: number })
      }

      // Mark as not manual (generated from assumptions)
      line.is_manual = false
    })

    return existingLines
  }

  /**
   * Distribute OpEx budget across individual OpEx lines based on FY25 actuals
   * This is the CFO best practice: use historical patterns to forecast
   */
  private static distributeOpExToLines(
    opexBudget: number,
    existingLines: PLLine[],
    monthKeys: string[]
  ): PLLine[] {
    if (opexBudget === 0) {
      console.log('[ForecastGenerator] OpEx budget is 0, skipping distribution')
      return existingLines
    }

    // Get all Operating Expense lines (excluding the summary line)
    const opexLines = existingLines.filter(l =>
      l.category === 'Operating Expenses' &&
      l.account_name !== 'Total Operating Expenses'
    )

    if (opexLines.length === 0) {
      console.log('[ForecastGenerator] No OpEx detail lines found')
      return existingLines
    }

    // Calculate total FY25 OpEx from actuals
    const fy25OpexTotals = opexLines.map(line => {
      const total = Object.values(line.actual_months || {}).reduce((sum, val) => sum + val, 0)
      return { line, total }
    })

    const totalFY25OpEx = fy25OpexTotals.reduce((sum, item) => sum + item.total, 0)

    if (totalFY25OpEx === 0) {
      console.log('[ForecastGenerator] No FY25 OpEx actuals found, using even distribution')
      // Fallback: distribute evenly across all OpEx lines
      const budgetPerLine = opexBudget / opexLines.length
      const monthlyAmount = budgetPerLine / monthKeys.length

      opexLines.forEach(line => {
        line.forecast_months = monthKeys.reduce((acc, key) => {
          acc[key] = monthlyAmount
          return acc
        }, {} as { [key: string]: number })
        line.is_manual = false
      })
      return existingLines
    }

    // Distribute budget to each line based on its % of FY25 total
    fy25OpexTotals.forEach(({ line, total }) => {
      const percentageOfTotal = total / totalFY25OpEx
      const lineBudget = opexBudget * percentageOfTotal

      console.log(`[ForecastGenerator] ${line.account_name}: FY25=${total.toFixed(0)}, %=${(percentageOfTotal * 100).toFixed(1)}%, FY26 Budget=${lineBudget.toFixed(0)}`)

      // Use seasonal pattern from FY25 to distribute across months
      const seasonalDistribution = this.calculateSeasonalPattern([line], monthKeys)

      if (seasonalDistribution.total > 0) {
        // Scale the pattern to match the line's budget
        const scaleFactor = lineBudget / seasonalDistribution.total
        line.forecast_months = monthKeys.reduce((acc, key) => {
          acc[key] = (seasonalDistribution.distribution[key] || 0) * scaleFactor
          return acc
        }, {} as { [key: string]: number })
      } else {
        // No historical pattern, use even distribution
        const monthlyAmount = lineBudget / monthKeys.length
        line.forecast_months = monthKeys.reduce((acc, key) => {
          acc[key] = monthlyAmount
          return acc
        }, {} as { [key: string]: number })
      }

      // Mark as not manual (generated from assumptions)
      line.is_manual = false
    })

    return existingLines
  }

  /**
   * Apply forecast values to existing P&L lines (COGS only)
   * Revenue and OpEx are already distributed to individual lines
   */
  private static applyForecastToLines(
    existingLines: PLLine[],
    forecastMonthKeys: string[],
    cogsPercentage: number
  ): PLLine[] {
    const updatedLines = [...existingLines]

    // Remove any summary lines (we only want detail lines from chart of accounts)
    const filteredLines = updatedLines.filter(l =>
      l.account_name !== 'Total Revenue' &&
      l.account_name !== 'Total Cost of Sales' &&
      l.account_name !== 'Total Operating Expenses'
    )

    // Calculate total revenue from individual lines
    const revenueLines = filteredLines.filter(l => l.category === 'Revenue')

    // Calculate COGS based on total revenue for each month
    const cogsLine = this.findOrCreateSummaryLine(
      filteredLines,
      'Cost of Sales',
      'Cost of Goods Sold',
      100
    )

    cogsLine.forecast_months = forecastMonthKeys.reduce((acc, monthKey) => {
      const totalRevenue = revenueLines.reduce((sum, line) => {
        return sum + (line.forecast_months?.[monthKey] || 0)
      }, 0)
      acc[monthKey] = totalRevenue * cogsPercentage
      return acc
    }, {} as { [key: string]: number })

    cogsLine.is_manual = false

    return filteredLines
  }

  /**
   * Find existing line or create new summary line
   * Note: This ensures we only have ONE summary line per category
   */
  private static findOrCreateSummaryLine(
    lines: PLLine[],
    category: string,
    accountName: string,
    sortOrder: number
  ): PLLine {
    // Find ALL matching lines (in case there are duplicates)
    const matchingLines = lines.filter(l =>
      l.category === category &&
      l.account_name === accountName
    )

    if (matchingLines.length > 1) {
      // If duplicates exist, remove all but the first one
      console.warn(`[ForecastGenerator] Found ${matchingLines.length} duplicate "${accountName}" lines, removing duplicates`)
      const lineToKeep = matchingLines[0]
      const linesToRemove = matchingLines.slice(1)

      // Remove duplicates from the array
      linesToRemove.forEach(dupLine => {
        const index = lines.indexOf(dupLine)
        if (index > -1) {
          lines.splice(index, 1)
        }
      })

      return lineToKeep
    } else if (matchingLines.length === 1) {
      return matchingLines[0]
    }

    // No matching line found, create a new one
    const newLine: PLLine = {
      account_name: accountName,
      category,
      sort_order: sortOrder,
      actual_months: {},
      forecast_months: {},
      is_manual: false,
      is_from_xero: false
    }
    lines.push(newLine)
    return newLine
  }
}
