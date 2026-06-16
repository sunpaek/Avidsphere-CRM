import React, { useMemo } from 'react'
import DashboardCard from '@/components/DashboardCard'
import { useLocalStorageAdapter } from '@/hooks/useLocalStorageAdapter'
import type { Activity, Customer, Reminder, Sale } from '@/types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function normalizeStatus(status?: string) {
  const normalized = String(status ?? 'Unknown').trim()
  if (!normalized) return 'Unknown'
  return normalized
}

function getSaleRevenue(sale: Sale) {
  return sale.digitalFinalTotal ?? sale.dollarAmount ?? 0
}

type GroupedMetric = {
  label: string
  count: number
  revenue: number
}

type CustomerStatusMetric = {
  status: string
  count: number
}

export default function Reports() {
  const { data, isLoading, error } = useLocalStorageAdapter()

  const summary = useMemo(() => {
    const totalRevenue = data.sales.reduce((sum, sale) => sum + getSaleRevenue(sale), 0)
    const openReminders = data.reminders.filter((reminder) => reminder.completed !== true)
    const unreadNotifications = data.notifications.filter((notification) => notification.read !== true).length

    return {
      totalCustomers: data.customers.length,
      totalSales: data.sales.length,
      totalRevenue,
      openReminders: openReminders.length,
      recentActivities: data.activities.length,
      unreadNotifications
    }
  }, [data.customers.length, data.reminders, data.sales, data.activities.length, data.notifications])

  const salesByProductType = useMemo(() => {
    const groups = new Map<string, GroupedMetric>()

    data.sales.forEach((sale) => {
      const key = sale.productDetails?.service || sale.saleType || sale.saleCategory || 'Unknown'
      const label = String(key)
      const current = groups.get(label) ?? { label, count: 0, revenue: 0 }
      groups.set(label, {
        label,
        count: current.count + 1,
        revenue: current.revenue + getSaleRevenue(sale)
      })
    })

    return Array.from(groups.values()).sort((a, b) => b.revenue - a.revenue)
  }, [data.sales])

  const revenueByCategory = useMemo(() => {
    const categories = new Map<string, GroupedMetric>()

    data.sales.forEach((sale) => {
      const category = sale.saleCategory || 'Other'
      const current = categories.get(category) ?? { label: category, count: 0, revenue: 0 }
      categories.set(category, {
        label: category,
        count: current.count + 1,
        revenue: current.revenue + getSaleRevenue(sale)
      })
    })

    return Array.from(categories.values()).sort((a, b) => b.revenue - a.revenue)
  }, [data.sales])

  const statusBreakdown = useMemo(() => {
    const breakdown = new Map<string, number>()

    data.customers.forEach((customer) => {
      const status = normalizeStatus(customer.customerStatus)
      breakdown.set(status, (breakdown.get(status) ?? 0) + 1)
    })

    return Array.from(breakdown.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
  }, [data.customers])

  const openReminders = useMemo(() => {
    return data.reminders
      .filter((reminder) => reminder.completed !== true)
      .sort((a, b) => {
        const dateA = new Date(a.dueDate || a.date || 0).getTime()
        const dateB = new Date(b.dueDate || b.date || 0).getTime()
        return dateA - dateB
      })
      .slice(0, 5)
  }, [data.reminders])

  const recentActivities = useMemo(() => {
    return [...data.activities]
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return timeB - timeA
      })
      .slice(0, 5)
  }, [data.activities])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800">
          <h1 className="text-xl font-semibold mb-2">Reports Unavailable</h1>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-600 max-w-2xl">
              Read-only CRM report summary sourced from the existing legacy localStorage adapter.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
            Data is read-only — no legacy CRM values are modified.
          </div>
        </div>
      </section>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Total Customers" value={summary.totalCustomers} description="Customers stored in CRM" accent="blue" />
        <DashboardCard title="Sales Records" value={summary.totalSales} description="Sales entries found in CRM" accent="gray" />
        <DashboardCard title="Revenue Total" value={formatCurrency(summary.totalRevenue)} description="Revenue from legacy sales" accent="green" />
        <DashboardCard title="Open Reminders" value={summary.openReminders} description="Reminders still pending" accent="purple" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Sales by Product Type</h2>
          {salesByProductType.length === 0 ? (
            <p className="text-slate-600">No sales data available to summarize.</p>
          ) : (
            <div className="space-y-3">
              {salesByProductType.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.count} sale{item.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-900">{formatCurrency(item.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Customer Status Breakdown</h2>
          {statusBreakdown.length === 0 ? (
            <p className="text-slate-600">No customer status data is available.</p>
          ) : (
            <div className="space-y-3">
              {statusBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-900">{item.status}</span>
                  <span className="text-sm text-slate-700">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Revenue Totals by Category</h2>
              <p className="text-sm text-slate-500">This view groups revenue by the sale category in CRM data.</p>
            </div>
          </div>
          {revenueByCategory.length === 0 ? (
            <p className="text-slate-600">No categorized revenue available.</p>
          ) : (
            <div className="space-y-3">
              {revenueByCategory.map((item) => (
                <div key={item.label} className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.count} sale{item.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-900">{formatCurrency(item.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Open Reminders</h2>
          {openReminders.length === 0 ? (
            <p className="text-slate-600">There are no open reminders at this time.</p>
          ) : (
            <div className="space-y-3">
              {openReminders.map((reminder) => (
                <div key={reminder.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-900">{reminder.title}</p>
                    <span className="text-sm text-slate-600">Due {formatDate(reminder.dueDate || reminder.date)}</span>
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    {reminder.assignedTo ? `Assigned to ${reminder.assignedTo}` : 'Unassigned'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <p className="text-slate-600">No activity history is available in the legacy CRM data.</p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-600">{activity.type}</p>
                  </div>
                  <span className="text-sm text-slate-500">{formatDate(activity.timestamp)}</span>
                </div>
                {activity.details ? <p className="mt-3 text-sm text-slate-700">{activity.details}</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900 mb-2">Report Notes</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All values are read-only and derived from legacy CRM localStorage.</li>
          <li>Sales totals use available dollar and digital total fields only.</li>
          <li>Customer statuses are grouped by status text and normalized for missing values.</li>
        </ul>
      </section>
    </div>
  )
}
