import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import DashboardCard from '@/components/DashboardCard'
import {
  getDashboardStats,
  readCRMData,
  useLocalStorageAdapter,
  writeCRMData
} from '@/hooks/useLocalStorageAdapter'
import type { Customer, Sale } from '@/types'

const DAY_MS = 86_400_000

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return 'N/A'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
}

function getDateKey(value?: string) {
  return String(value || '').slice(0, 10)
}

function getTodayKey() {
  const today = new Date()
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-')
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00`)
  date.setDate(date.getDate() + days)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

function daysSince(value?: string) {
  const dateKey = getDateKey(value)
  if (!dateKey) return Number.POSITIVE_INFINITY
  const date = new Date(`${dateKey}T00:00:00`)
  const today = new Date(`${getTodayKey()}T00:00:00`)
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY
  return Math.floor((today.getTime() - date.getTime()) / DAY_MS)
}

function getSaleAmount(sale: Sale) {
  const value = sale.digitalFinalTotal ?? sale.dollarAmount ?? sale.productDetails?.totalInvestment ?? 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function getSaleDisplayLabel(sale: Sale) {
  const details = sale.productDetails || {}
  if (sale.saleCategory === 'Mailer') {
    return ['Mailer', details.mailerArea, details.month, details.adSize].filter(Boolean).join(' · ') || 'Mailer'
  }
  if (sale.saleCategory === 'Digital') {
    return [details.service || sale.saleType || 'Digital', details.websiteOption].filter(Boolean).join(' · ')
  }
  if (sale.saleCategory === 'Print') {
    return [
      details.printType || sale.saleType || 'Print',
      details.size,
      details.quantity ? `Qty ${details.quantity}` : ''
    ].filter(Boolean).join(' · ')
  }
  return sale.saleType || 'Sale'
}

function getCustomerName(customers: Customer[], customerId?: string, fallback?: string) {
  return customers.find(customer => customer.id === customerId)?.businessName || fallback || 'Unknown customer'
}

type FocusItem = {
  tone: 'urgent' | 'today' | 'week'
  title: string
  detail: string
  action: string
}

type FollowUpItem = {
  key: string
  label: string
  customerName: string
  detail: string
  reminderId?: string
  customerId?: string
}

export default function Dashboard() {
  const { data, isLoading, error, reload } = useLocalStorageAdapter()
  const stats = getDashboardStats(data)
  const today = getTodayKey()
  const weekEnd = addDays(today, 7)
  const openReminders = data.reminders.filter(reminder => !reminder.completed)
  const overdueReminders = openReminders.filter(reminder => {
    const dueDate = getDateKey(reminder.dueDate || reminder.date)
    return dueDate && dueDate < today
  })
  const todayReminders = openReminders.filter(reminder => getDateKey(reminder.dueDate || reminder.date) === today)
  const weekReminders = openReminders.filter(reminder => {
    const dueDate = getDateKey(reminder.dueDate || reminder.date)
    return dueDate > today && dueDate <= weekEnd
  })

  const currentMonth = today.slice(0, 7)
  const monthlySales = data.sales.filter(sale => getDateKey(sale.saleDate).startsWith(currentMonth))
  const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + getSaleAmount(sale), 0)
  const sortedSales = [...data.sales].sort((a, b) => getDateKey(b.saleDate).localeCompare(getDateKey(a.saleDate)))
  const recentSales = sortedSales.slice(0, 5)
  const customerHasOpenReminder = new Set(openReminders.map(reminder => reminder.customerId).filter(Boolean))
  const customerHasSale = new Set(data.sales.map(sale => sale.customerId))

  const recentSalesWithoutReminder = sortedSales.filter(sale => (
    daysSince(sale.saleDate) <= 14 && !customerHasOpenReminder.has(sale.customerId)
  ))
  const staleCustomers = data.customers
    .filter(customer => customer.customerStatus !== 'Closed' && daysSince(customer.lastContactDate) > 30)
    .sort((a, b) => daysSince(b.lastContactDate) - daysSince(a.lastContactDate))
  const prospectsWithoutSale = data.customers.filter(customer => (
    customer.customerStatus === 'Prospect' && !customerHasSale.has(customer.id)
  ))

  const focusItems: FocusItem[] = []
  if (overdueReminders.length) {
    focusItems.push({
      tone: 'urgent',
      title: `${overdueReminders.length} overdue reminder${overdueReminders.length === 1 ? '' : 's'}`,
      detail: `${getCustomerName(data.customers, overdueReminders[0].customerId)} needs follow-up.`,
      action: 'Review'
    })
  }
  if (todayReminders.length) {
    focusItems.push({
      tone: 'today',
      title: `${todayReminders.length} reminder${todayReminders.length === 1 ? '' : 's'} due today`,
      detail: todayReminders.slice(0, 2).map(reminder => reminder.title).join(', '),
      action: 'Open calendar'
    })
  }
  if (weekReminders.length) {
    const first = weekReminders[0]
    focusItems.push({
      tone: 'week',
      title: `${weekReminders.length} reminder${weekReminders.length === 1 ? '' : 's'} due this week`,
      detail: `${first.title} for ${getCustomerName(data.customers, first.customerId)}.`,
      action: 'Review week'
    })
  }

  const followUpItems: FollowUpItem[] = [
    ...overdueReminders.map(reminder => ({
      key: reminder.id,
      label: 'Overdue',
      customerName: getCustomerName(data.customers, reminder.customerId),
      detail: `${reminder.title} was due ${formatDate(reminder.dueDate || reminder.date)}.`,
      reminderId: reminder.id
    })),
    ...prospectsWithoutSale.map(customer => ({
      key: `prospect-${customer.id}`,
      label: 'Prospect',
      customerName: customer.businessName,
      detail: `No sale logged. Assigned to ${customer.assignedSalesRepresentative || 'Unassigned'}.`,
      customerId: customer.id
    })),
    ...recentSalesWithoutReminder.map(sale => ({
      key: `sale-${sale.id}`,
      label: 'Post-sale',
      customerName: getCustomerName(data.customers, sale.customerId, sale.businessName),
      detail: `${getSaleDisplayLabel(sale)} closed ${formatDate(sale.saleDate)} with no open reminder.`,
      customerId: sale.customerId
    })),
    ...staleCustomers.map(customer => ({
      key: `idle-${customer.id}`,
      label: 'Idle',
      customerName: customer.businessName,
      detail: `No recorded activity in ${daysSince(customer.lastContactDate)} days.`,
      customerId: customer.id
    }))
  ].slice(0, 5)

  const pipelineCounts = {
    Prospect: data.customers.filter(customer => customer.customerStatus === 'Prospect').length,
    Active: data.customers.filter(customer => customer.customerStatus === 'Active').length,
    Closed: data.customers.filter(customer => customer.customerStatus === 'Closed').length
  }
  const maxPipelineCount = Math.max(...Object.values(pipelineCounts), 1)

  const productMix = Object.values(data.sales.reduce<Record<string, { label: string; count: number; revenue: number }>>((mix, sale) => {
    const label = getSaleDisplayLabel(sale)
    const key = label.toLowerCase()
    if (!mix[key]) mix[key] = { label, count: 0, revenue: 0 }
    mix[key].count += 1
    mix[key].revenue += getSaleAmount(sale)
    return mix
  }, {}))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  function completeReminder(reminderId: string) {
    const store = readCRMData()
    writeCRMData({
      ...store,
      reminders: store.reminders.map(reminder => (
        reminder.id === reminderId
          ? { ...reminder, completed: true, status: 'Completed' }
          : reminder
      ))
    })
    reload()
  }

  if (isLoading) {
    return <p className="empty-state">Loading dashboard...</p>
  }

  return (
    <div className="dashboard-workspace">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Daily command center</h1>
        </div>
        <p className="panel-help">Prioritized actions, recent sales, follow-up risk, and pipeline health.</p>
      </header>

      {error ? (
        <div className="dashboard-error" role="alert">Error loading dashboard data: {error.message}</div>
      ) : null}

      <div className="dashboard-kpi-grid">
        <DashboardCard title="Total Customers" value={stats.customerCount} description="All customer records" accent="blue" />
        <DashboardCard title="Active Customers" value={stats.activeCustomerCount} description="Customers currently in motion" accent="purple" />
        <DashboardCard title="Open Reminders" value={stats.openRemindersCount} description="Follow-ups still pending" accent="yellow" />
        <DashboardCard title="Sales This Month" value={monthlySales.length} description="Orders logged this month" accent="blue" />
        <DashboardCard title="Revenue This Month" value={formatCurrency(monthlyRevenue)} description="Current month revenue" accent="green" />
      </div>

      <div className="dashboard-main-grid">
        <DashboardSection eyebrow="Today / This Week" title="What needs attention">
          <div className="dashboard-action-list">
            {focusItems.length ? focusItems.map(item => (
              <article key={item.tone} className={`dashboard-action-item ${item.tone}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <Link className="dashboard-small-button" to="/reminders">{item.action}</Link>
              </article>
            )) : (
              <DashboardEmpty message={data.customers.length ? 'No reminders need immediate attention.' : 'Add a customer to begin tracking activity.'} />
            )}
          </div>
        </DashboardSection>

        <DashboardSection eyebrow="Recent Activity" title="Recent sales activity">
          {recentSales.length ? (
            <>
              <div className="dashboard-sales-list">
                {recentSales.map(sale => (
                  <article key={sale.id} className="dashboard-sale-row">
                    <div className="dashboard-sale-main">
                      <strong>{getCustomerName(data.customers, sale.customerId, sale.businessName)}</strong>
                      <span>{getSaleDisplayLabel(sale)}</span>
                    </div>
                    <div className="dashboard-sale-meta">
                      <strong>{formatCurrency(getSaleAmount(sale))}</strong>
                      <span>{formatDate(sale.saleDate)}</span>
                    </div>
                  </article>
                ))}
              </div>
              <Link className="dashboard-footer-button" to="/sales">View all sales</Link>
            </>
          ) : (
            <DashboardEmpty message="No recent sales yet." />
          )}
        </DashboardSection>

        <DashboardSection eyebrow="Follow-Up Queue" title="Customers needing attention">
          <div className="dashboard-followup-list">
            {followUpItems.length ? followUpItems.map(item => (
              <article key={item.key} className="dashboard-followup-item">
                <div>
                  <span className="dashboard-status-label">{item.label}</span>
                  <strong>{item.customerName}</strong>
                  <p>{item.detail}</p>
                </div>
                {item.reminderId ? (
                  <button
                    type="button"
                    className="dashboard-complete-button"
                    onClick={() => completeReminder(item.reminderId || '')}
                  >
                    Complete
                  </button>
                ) : (
                  <Link
                    className="dashboard-small-button"
                    to={item.customerId ? `/customers?customerId=${encodeURIComponent(item.customerId)}` : '/customers'}
                  >
                    Open
                  </Link>
                )}
              </article>
            )) : (
              <DashboardEmpty message="No customers need follow-up right now." />
            )}
          </div>
        </DashboardSection>

        <DashboardSection eyebrow="Pipeline Snapshot" title="Pipeline and product mix">
          <div className="dashboard-pipeline-bars">
            {Object.entries(pipelineCounts).map(([label, count]) => (
              <div className="dashboard-pipeline-row" key={label}>
                <span>{label}</span>
                <div className="dashboard-pipeline-track">
                  <div
                    className={`dashboard-pipeline-fill ${label.toLowerCase()}`}
                    style={{ width: `${(count / maxPipelineCount) * 100}%` }}
                  />
                </div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>

          <div className="dashboard-product-mix">
            <h4>Sales by product type</h4>
            {productMix.length ? productMix.map(item => (
              <div className="dashboard-product-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.count} sale{item.count === 1 ? '' : 's'} - {formatCurrency(item.revenue)}</strong>
              </div>
            )) : (
              <DashboardEmpty message="No sales by product type yet." />
            )}
          </div>
        </DashboardSection>
      </div>
    </div>
  )
}

function DashboardSection({
  eyebrow,
  title,
  children
}: {
  eyebrow: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="dashboard-section-card">
      <div className="dashboard-section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function DashboardEmpty({ message }: { message: string }) {
  return <p className="dashboard-empty-state">{message}</p>
}
