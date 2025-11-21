'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import type { FinancialForecast, ForecastEmployee } from '../types'
import ForecastService from '../services/forecast-service'

interface PayrollTableProps {
  forecast: FinancialForecast
  employees: ForecastEmployee[]
  onSave: (employees: ForecastEmployee[]) => void
}

export default function PayrollTable({ forecast, employees, onSave }: PayrollTableProps) {
  const [emps, setEmps] = useState<ForecastEmployee[]>(employees)
  const [monthColumns, setMonthColumns] = useState<Array<{
    key: string
    label: string
  }>>([])

  useEffect(() => {
    setEmps(employees)
  }, [employees])

  useEffect(() => {
    const columns = ForecastService.generateMonthColumns(
      forecast.actual_start_month,
      forecast.actual_end_month,
      forecast.forecast_start_month,
      forecast.forecast_end_month
    )
    setMonthColumns(columns.map(c => ({ key: c.key, label: c.label })))
  }, [forecast])

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (emps.length > 0 && emps !== employees) {
        onSave(emps)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [emps])

  const addEmployee = () => {
    const newEmp: ForecastEmployee = {
      employee_name: '',
      category: 'Wages Admin',
      hours: 0,
      rate: 0,
      weekly_budget: 0,
      annual_salary: 0,
      weekly_payg: 0,
      super_rate: 11.0,
      is_active: true,
      sort_order: emps.length
    }
    setEmps([...emps, newEmp])
  }

  const removeEmployee = (index: number) => {
    setEmps(emps.filter((_, i) => i !== index))
  }

  const updateEmployee = (index: number, field: keyof ForecastEmployee, value: any) => {
    const updated = [...emps]
    ;(updated[index] as any)[field] = value

    // Auto-calculate annual salary from weekly budget
    if (field === 'weekly_budget') {
      updated[index].annual_salary = value * 52
    }

    // Auto-calculate weekly budget from annual salary
    if (field === 'annual_salary') {
      updated[index].weekly_budget = value / 52
    }

    setEmps(updated)
  }

  // Calculate number of pay runs per month (assuming fortnightly pay)
  const getPayRunsForMonth = (monthKey: string): number => {
    const [year, month] = monthKey.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    // Approximate: 2 pay runs for most months, but some have 3
    // This is a simplified calculation - in reality it depends on pay cycle alignment
    if (daysInMonth === 31) {
      return Math.random() > 0.5 ? 5 : 4 // Some months have 5 weeks
    }
    return 4 // Most months have 4 weeks
  }

  // Calculate monthly wages for a category
  const calculateMonthlyWages = (category: string, monthKey: string): number => {
    const [year, month] = monthKey.split('-').map(Number)
    const payRuns = getPayRunsForMonth(monthKey)

    return emps
      .filter(emp => emp.category === category && emp.is_active)
      .reduce((sum, emp) => {
        // Check if employee is active in this month
        const monthDate = new Date(year, month - 1, 15) // Mid-month

        if (emp.start_date) {
          const startDate = new Date(emp.start_date)
          if (monthDate < startDate) return sum
        }

        if (emp.end_date) {
          const endDate = new Date(emp.end_date)
          if (monthDate > endDate) return sum
        }

        // Calculate based on weekly budget * pay runs
        const weeklyBudget = emp.weekly_budget || 0
        const monthlyAmount = (weeklyBudget / 2) * payRuns // Fortnightly pay

        return sum + monthlyAmount
      }, 0)
  }

  // Calculate monthly PAYG (tax withholding)
  const calculateMonthlyPAYG = (monthKey: string): number => {
    const [year, month] = monthKey.split('-').map(Number)
    const payRuns = getPayRunsForMonth(monthKey)

    return emps
      .filter(emp => emp.is_active)
      .reduce((sum, emp) => {
        const monthDate = new Date(year, month - 1, 15)

        if (emp.start_date && monthDate < new Date(emp.start_date)) return sum
        if (emp.end_date && monthDate > new Date(emp.end_date)) return sum

        const weeklyPAYG = emp.weekly_payg || 0
        const monthlyAmount = (weeklyPAYG / 2) * payRuns

        return sum + monthlyAmount
      }, 0)
  }

  // Calculate monthly superannuation
  const calculateMonthlySuperannuation = (monthKey: string): number => {
    const totalWagesAdmin = calculateMonthlyWages('Wages Admin', monthKey)
    const totalWagesCOGS = calculateMonthlyWages('Wages COGS', monthKey)
    const totalWages = totalWagesAdmin + totalWagesCOGS

    // Default super rate is 11%
    return totalWages * 0.11
  }

  const formatCurrency = (value: number) => {
    if (value === 0) return '-'
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Employee Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Employees & Contractors</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your team members and their compensation details
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weekly Budget
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Salary
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weekly PAYG
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emps.map((emp, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <input
                      type="text"
                      value={emp.employee_name}
                      onChange={(e) => updateEmployee(idx, 'employee_name', e.target.value)}
                      placeholder="Employee name"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="text"
                      value={emp.position || ''}
                      onChange={(e) => updateEmployee(idx, 'position', e.target.value)}
                      placeholder="Position"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={emp.category}
                      onChange={(e) => updateEmployee(idx, 'category', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Wages Admin">Wages Admin</option>
                      <option value="Wages COGS">Wages COGS</option>
                      <option value="Contractor">Contractor</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="date"
                      value={emp.start_date || ''}
                      onChange={(e) => updateEmployee(idx, 'start_date', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="date"
                      value={emp.end_date || ''}
                      onChange={(e) => updateEmployee(idx, 'end_date', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      value={emp.weekly_budget || ''}
                      onChange={(e) => updateEmployee(idx, 'weekly_budget', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      value={emp.annual_salary || ''}
                      onChange={(e) => updateEmployee(idx, 'annual_salary', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      value={emp.weekly_payg || ''}
                      onChange={(e) => updateEmployee(idx, 'weekly_payg', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => removeEmployee(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={addEmployee}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Monthly Payroll Summary */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Monthly Payroll Summary</h2>
          <p className="text-sm text-gray-600 mt-1">
            Auto-calculated based on employee data and pay runs
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[200px]">
                  Category
                </th>
                {monthColumns.slice(0, 12).map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-3 border-r border-gray-200 font-medium text-gray-900">
                  # of Pay Runs
                </td>
                {monthColumns.slice(0, 12).map((col) => {
                  const payRuns = getPayRunsForMonth(col.key)
                  return (
                    <td key={col.key} className="px-4 py-3 text-right text-sm text-gray-700">
                      {payRuns}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-3 border-r border-gray-200 font-medium text-gray-900">
                  Wages Admin
                </td>
                {monthColumns.slice(0, 12).map((col) => {
                  const amount = calculateMonthlyWages('Wages Admin', col.key)
                  return (
                    <td key={col.key} className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(amount)}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-3 border-r border-gray-200 font-medium text-gray-900">
                  Wages COGS
                </td>
                {monthColumns.slice(0, 12).map((col) => {
                  const amount = calculateMonthlyWages('Wages COGS', col.key)
                  return (
                    <td key={col.key} className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(amount)}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-3 border-r border-gray-200 font-medium text-gray-900">
                  PAYG
                </td>
                {monthColumns.slice(0, 12).map((col) => {
                  const amount = calculateMonthlyPAYG(col.key)
                  return (
                    <td key={col.key} className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(amount)}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td className="sticky left-0 z-10 bg-white px-6 py-3 border-r border-gray-200 font-medium text-gray-900">
                  Superannuation
                </td>
                {monthColumns.slice(0, 12).map((col) => {
                  const amount = calculateMonthlySuperannuation(col.key)
                  return (
                    <td key={col.key} className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(amount)}
                    </td>
                  )
                })}
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td className="sticky left-0 z-10 bg-blue-50 px-6 py-3 border-r border-gray-200 text-gray-900">
                  Total Payroll Cost
                </td>
                {monthColumns.slice(0, 12).map((col) => {
                  const wagesAdmin = calculateMonthlyWages('Wages Admin', col.key)
                  const wagesCOGS = calculateMonthlyWages('Wages COGS', col.key)
                  const super_amount = calculateMonthlySuperannuation(col.key)
                  const total = wagesAdmin + wagesCOGS + super_amount
                  return (
                    <td key={col.key} className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(total)}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
