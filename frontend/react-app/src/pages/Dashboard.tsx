import React from 'react'
import DashboardCard from '@/components/DashboardCard'
import { useLocalStorageAdapter, getDashboardStats } from '@/hooks/useLocalStorageAdapter'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

export default function Dashboard() {
  const { data, isLoading, error } = useLocalStorageAdapter()
  const stats = getDashboardStats(data)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">React Shell – Read-only view of existing CRM localStorage</p>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading data: {error.message}
        </div>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            <DashboardCard
              title="Total Customers"
              value={stats.customerCount}
              description="Customers currently stored in CRM"
              accent="blue"
            />
            <DashboardCard
              title="Active Customers"
              value={stats.activeCustomerCount}
              description="Customers with active status"
              accent="green"
            />
            <DashboardCard
              title="Prospects"
              value={stats.prospectCount}
              description="Customers flagged as prospects"
              accent="yellow"
            />
            <DashboardCard
              title="Open Reminders"
              value={stats.openRemindersCount}
              description="Pending reminders awaiting follow-up"
              accent="purple"
            />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mb-6">
            <DashboardCard
              title="Total Sales"
              value={stats.salesCount}
              description="Sales records in the CRM"
              accent="gray"
            />
            <DashboardCard
              title="Sales Revenue"
              value={formatCurrency(stats.totalSalesRevenue)}
              description="Revenue from tracked sales"
              accent="green"
            />
            <DashboardCard
              title="Recent Sales"
              value={stats.recentSales.length}
              description="Latest closed or recorded sales"
              accent="blue"
            >
              <div className="space-y-3 mt-3">
                {stats.recentSales.length ? (
                  stats.recentSales.map(sale => (
                    <div key={sale.saleId} className="rounded border border-slate-200 p-3 bg-white">
                      <div className="text-sm font-semibold text-slate-800">{sale.businessName}</div>
                      <div className="text-xs text-slate-500">{sale.saleType} • {sale.saleDate}</div>
                      <div className="text-sm text-slate-700 font-semibold">{formatCurrency(sale.total)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No recent sales available.</div>
                )}
              </div>
            </DashboardCard>
          </div>
        </>
      )}

      <div className="mt-8 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded">
        <p className="font-bold">Note:</p>
        <p>This dashboard is read-only and uses existing localStorage keys from the legacy CRM. It does not modify customer, sale, or reminder data.</p>
      </div>
    </div>
  )
}
