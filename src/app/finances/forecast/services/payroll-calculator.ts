import type { PayrollFrequency, ForecastEmployee } from '../types'

export class PayrollCalculator {
  /**
   * Calculate pay per period from annual salary
   */
  static calculatePayPerPeriod(annualSalary: number, frequency: PayrollFrequency): number {
    switch (frequency) {
      case 'weekly':
        return annualSalary / 52
      case 'fortnightly':
        return annualSalary / 26
      case 'monthly':
        return annualSalary / 12
      default:
        return 0
    }
  }

  /**
   * Calculate annual salary from hourly rate and standard hours
   */
  static calculateAnnualSalaryFromHourly(
    hourlyRate: number,
    standardHoursPerWeek: number
  ): number {
    return hourlyRate * standardHoursPerWeek * 52
  }

  /**
   * Calculate hourly rate from annual salary and standard hours
   */
  static calculateHourlyRateFromAnnual(
    annualSalary: number,
    standardHoursPerWeek: number
  ): number {
    if (standardHoursPerWeek === 0) return 0
    return annualSalary / (standardHoursPerWeek * 52)
  }

  /**
   * Calculate pay per period from hourly rate
   */
  static calculatePayPerPeriodFromHourly(
    hourlyRate: number,
    standardHoursPerWeek: number,
    frequency: PayrollFrequency
  ): number {
    const weeklyPay = hourlyRate * standardHoursPerWeek

    switch (frequency) {
      case 'weekly':
        return weeklyPay
      case 'fortnightly':
        return weeklyPay * 2
      case 'monthly':
        return (weeklyPay * 52) / 12
      default:
        return 0
    }
  }

  /**
   * Calculate superannuation per period
   */
  static calculateSuperPerPeriod(payPerPeriod: number, superRate: number = 0.12): number {
    return payPerPeriod * superRate
  }

  /**
   * Calculate PAYG tax per period using Australian tax brackets
   * Based on annual salary, then divided by periods
   */
  static calculatePAYGPerPeriod(
    annualSalary: number,
    frequency: PayrollFrequency
  ): number {
    // Australian tax brackets (2024-25)
    let annualTax = 0

    if (annualSalary <= 18200) {
      annualTax = 0
    } else if (annualSalary <= 45000) {
      annualTax = (annualSalary - 18200) * 0.19
    } else if (annualSalary <= 120000) {
      annualTax = (annualSalary - 45000) * 0.325 + 5092
    } else if (annualSalary <= 180000) {
      annualTax = (annualSalary - 120000) * 0.37 + 29467
    } else {
      annualTax = (annualSalary - 180000) * 0.45 + 51667
    }

    // Divide by number of periods
    switch (frequency) {
      case 'weekly':
        return annualTax / 52
      case 'fortnightly':
        return annualTax / 26
      case 'monthly':
        return annualTax / 12
      default:
        return 0
    }
  }

  /**
   * Calculate monthly cost (gross wages + super)
   */
  static calculateMonthlyCost(
    annualSalary: number,
    superRate: number = 0.12
  ): number {
    const monthlySalary = annualSalary / 12
    const monthlySuper = monthlySalary * superRate
    return monthlySalary + monthlySuper
  }

  /**
   * Recalculate all employee fields based on what was changed
   * Returns updated employee object with all calculated fields
   */
  static recalculateEmployee(
    employee: ForecastEmployee,
    frequency: PayrollFrequency,
    superRate: number = 0.12,
    changedField?: 'annual_salary' | 'hourly_rate'
  ): ForecastEmployee {
    const updated = { ...employee }

    // If annual salary was changed, recalculate hourly rate
    if (changedField === 'annual_salary' && updated.annual_salary) {
      const standardHours = updated.standard_hours_per_week || 40 // Default to 40 hours
      updated.hourly_rate = this.calculateHourlyRateFromAnnual(
        updated.annual_salary,
        standardHours
      )
    }

    // If hourly rate was changed, recalculate annual salary
    if (changedField === 'hourly_rate' && updated.hourly_rate) {
      const standardHours = updated.standard_hours_per_week || 40
      updated.annual_salary = this.calculateAnnualSalaryFromHourly(
        updated.hourly_rate,
        standardHours
      )
    }

    // Always recalculate derived fields
    if (updated.annual_salary) {
      updated.pay_per_period = this.calculatePayPerPeriod(updated.annual_salary, frequency)
      updated.super_per_period = this.calculateSuperPerPeriod(updated.pay_per_period, superRate)
      updated.payg_per_period = this.calculatePAYGPerPeriod(updated.annual_salary, frequency)
      updated.monthly_cost = this.calculateMonthlyCost(updated.annual_salary, superRate)
    }

    return updated
  }

  /**
   * Calculate number of pay periods in a given month
   * For weekly/fortnightly based on pay day
   */
  static calculatePayPeriodsInMonth(
    monthKey: string, // Format: "2024-07"
    frequency: PayrollFrequency,
    payDay?: string // e.g., "thursday"
  ): number {
    if (frequency === 'monthly') {
      return 1
    }

    // Parse month key
    const [year, month] = monthKey.split('-').map(Number)
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()

    // For weekly/fortnightly, count occurrences of pay day
    if (!payDay) return frequency === 'weekly' ? 4 : 2 // Default approximation

    const payDayIndex = this.getPayDayIndex(payDay)
    let count = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      if (date.getDay() === payDayIndex) {
        count++
      }
    }

    // For fortnightly, divide by 2 (assuming pay periods are every 2 weeks)
    return frequency === 'fortnightly' ? Math.ceil(count / 2) : count
  }

  /**
   * Helper to convert pay day string to day index (0 = Sunday, 6 = Saturday)
   */
  private static getPayDayIndex(payDay: string): number {
    const days: { [key: string]: number } = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    }
    return days[payDay.toLowerCase()] || 5 // Default to Friday
  }

  /**
   * Calculate proration factor for partial month employment
   * Returns a number between 0 and 1
   */
  static calculateProrationFactor(
    monthKey: string,
    startDate?: string,
    endDate?: string
  ): number {
    const [year, month] = monthKey.split('-').map(Number)
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0)
    const daysInMonth = monthEnd.getDate()

    let workingDays = daysInMonth

    // Check if employee starts mid-month
    if (startDate) {
      const [startYear, startMonth] = startDate.split('-').map(Number)
      if (startYear === year && startMonth === month) {
        // Employee starts mid-month
        const startDay = 1 // We only have month/year, assume start of month for now
        // TODO: If we need day-level precision, update start_date format to "2024-07-15"
        workingDays = daysInMonth // For now, count full month
      } else if (startYear > year || (startYear === year && startMonth > month)) {
        // Employee hasn't started yet
        return 0
      }
    }

    // Check if employee ends mid-month
    if (endDate) {
      const [endYear, endMonth] = endDate.split('-').map(Number)
      if (endYear === year && endMonth === month) {
        // Employee ends mid-month
        workingDays = daysInMonth // For now, count full month
      } else if (endYear < year || (endYear === year && endMonth < month)) {
        // Employee already left
        return 0
      }
    }

    return workingDays / daysInMonth
  }

  /**
   * Calculate employee cost for a specific month
   * Takes into account start/end dates
   */
  static calculateEmployeeMonthlyCost(
    employee: ForecastEmployee,
    monthKey: string,
    frequency: PayrollFrequency,
    payDay?: string,
    superRate: number = 0.12
  ): number {
    if (!employee.annual_salary) return 0

    // Check if employee is active in this month
    const prorationFactor = this.calculateProrationFactor(
      monthKey,
      employee.start_date,
      employee.end_date
    )

    if (prorationFactor === 0) return 0

    // Calculate base monthly cost (salary + super)
    const monthlyCost = this.calculateMonthlyCost(employee.annual_salary, superRate)

    // Apply proration if partial month
    return monthlyCost * prorationFactor
  }
}
