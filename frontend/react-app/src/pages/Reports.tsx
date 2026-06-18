import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardCard from '@/components/DashboardCard'
import { readCRMData, useLocalStorageAdapter, writeCRMData } from '@/hooks/useLocalStorageAdapter'
import type { Customer, Reminder, Sale } from '@/types'

type RangeKey = 'this-month' | 'last-month' | 'this-quarter' | 'last-30' | 'this-year' | 'all-time'

type DateBounds = {
  start: Date | null
  end: Date | null
}

type ProductMetric = {
  label: string
  count: number
  revenue: number
}

type OwnerMetric = {
  name: string
  count: number
  revenue: number
  lastSaleDate: string
}

type FollowUpOpportunity = {
  key: string
  label: string
  customer: Customer
  detail: string
  saleId?: string
}

const reportRanges: Array<{ key: RangeKey; label: string }> = [
  { key: 'this-month', label: 'This Month' },
  { key: 'last-month', label: 'Last Month' },
  { key: 'this-quarter', label: 'This Quarter' },
  { key: 'last-30', label: 'Last 30 Days' },
  { key: 'this-year', label: 'This Year' },
  { key: 'all-time', label: 'All Time' }
]

const productTypes = [
  'Mailers',
  'Print',
  'Social Media Management',
  'Paid Ads',
  'Geofencing',
  'Website Services'
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0)
}

function formatDate(value?: string) {
  const date = toLocalDate(value)
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toLocalDate(value?: string) {
  if (!value) return null
  const source = String(value)
  const parsed = new Date(source.includes('T') ? source : `${source}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function normalizeRange(value?: string): RangeKey {
  return reportRanges.some(range => range.key === value) ? value as RangeKey : 'this-month'
}

function getDateBounds(range: RangeKey): DateBounds {
  const today = getToday()
  if (range === 'last-month') {
    return {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0)
    }
  }
  if (range === 'this-quarter') {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
    return {
      start: new Date(today.getFullYear(), quarterStartMonth, 1),
      end: today
    }
  }
  if (range === 'last-30') {
    const start = new Date(today)
    start.setDate(start.getDate() - 29)
    return { start, end: today }
  }
  if (range === 'this-year') {
    return { start: new Date(today.getFullYear(), 0, 1), end: today }
  }
  if (range === 'all-time') {
    return { start: null, end: null }
  }
  return {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
  }
}

function isDateInRange(value: string | undefined, bounds: DateBounds) {
  if (!bounds.start && !bounds.end) return true
  const parsed = toLocalDate(value)
  if (!parsed) return false
  if (bounds.start && parsed < bounds.start) return false
  if (bounds.end && parsed > bounds.end) return false
  return true
}

function getSaleRevenue(sale: Sale) {
  const details = sale.productDetails || {}
  const amount = sale.dollarAmount ?? sale.digitalFinalTotal ?? details.totalInvestment ?? details.finalTotal ?? 0
  const numeric = Number(amount)
  return Number.isFinite(numeric) ? numeric : 0
}

function getProductType(sale: Sale) {
  const category = sale.saleCategory
  const service = String(sale.productDetails?.service || sale.saleType || '').trim()
  if (category === 'Mailer') return 'Mailers'
  if (category === 'Print') return 'Print'
  if (service === 'Social Media Management') return 'Social Media Management'
  if (service === 'Paid Ads') return 'Paid Ads'
  if (service === 'Geofencing') return 'Geofencing'
  if (service === 'Website' || service === 'Website Services') return 'Website Services'
  return category || service || 'Digital'
}

function buildProductBreakdown(sales: Sale[]) {
  const map = new Map<string, ProductMetric>()
  productTypes.forEach(label => map.set(label, { label, count: 0, revenue: 0 }))

  sales.forEach(sale => {
    const label = getProductType(sale)
    if (label === 'Digital') return
    const current = map.get(label) || { label, count: 0, revenue: 0 }
    map.set(label, {
      label,
      count: current.count + 1,
      revenue: current.revenue + getSaleRevenue(sale)
    })
  })

  return Array.from(map.values())
}

function buildOwnerPerformance(sales: Sale[], currentUserName: string) {
  const map = new Map<string, OwnerMetric>()
  sales.forEach(sale => {
    const name = sale.salesRepresentative || currentUserName
    const current = map.get(name) || { name, count: 0, revenue: 0, lastSaleDate: '' }
    map.set(name, {
      name,
      count: current.count + 1,
      revenue: current.revenue + getSaleRevenue(sale),
      lastSaleDate: !current.lastSaleDate || String(sale.saleDate || '') > current.lastSaleDate
        ? sale.saleDate || ''
        : current.lastSaleDate
    })
  })
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
}

function daysSince(value?: string) {
  const parsed = toLocalDate(value)
  if (!parsed) return Number.POSITIVE_INFINITY
  return Math.max(0, Math.floor((getToday().getTime() - parsed.getTime()) / 86400000))
}

function hasSaleForCustomer(sales: Sale[], customerId: string) {
  return sales.some(sale => sale.customerId === customerId)
}

function hasOpenReminder(reminders: Reminder[], customerId: string) {
  return reminders.some(reminder => reminder.customerId === customerId && !reminder.completed)
}

function getFollowUpOpportunities(customers: Customer[], sales: Sale[], reminders: Reminder[]) {
  const today = getToday()
  const opportunities: FollowUpOpportunity[] = []

  customers
    .filter(customer => customer.customerStatus === 'Prospect' && !hasSaleForCustomer(sales, customer.id))
    .forEach(customer => opportunities.push({
      key: `Prospect-${customer.id}`,
      label: 'Prospect',
      customer,
      detail: 'No sale has been logged for this prospect yet.'
    }))

  reminders
    .filter(reminder => {
      const dueDate = toLocalDate(reminder.dueDate || reminder.date)
      return !reminder.completed && dueDate !== null && dueDate < today
    })
    .forEach(reminder => {
      const customer = customers.find(item => item.id === reminder.customerId)
      if (!customer) return
      opportunities.push({
        key: `Overdue-${customer.id}-${reminder.id}`,
        label: 'Overdue',
        customer,
        detail: `${reminder.title} was due ${formatDate(reminder.dueDate || reminder.date)}.`
      })
    })

  customers
    .filter(customer => customer.customerStatus !== 'Closed' && daysSince(customer.lastContactDate || customer.dateCreated) > 30)
    .forEach(customer => opportunities.push({
      key: `Idle-${customer.id}`,
      label: 'Idle',
      customer,
      detail: `No recorded activity in ${daysSince(customer.lastContactDate || customer.dateCreated)} days.`
    }))

  sales
    .filter(sale => daysSince(sale.saleDate) <= 14 && !hasOpenReminder(reminders, sale.customerId))
    .sort((a, b) => String(b.saleDate || '').localeCompare(String(a.saleDate || '')))
    .forEach(sale => {
      const customer = customers.find(item => item.id === sale.customerId)
      if (!customer) return
      opportunities.push({
        key: `Post-sale-${customer.id}-${sale.id}`,
        label: 'Post-sale',
        customer,
        saleId: sale.id,
        detail: `${getProductType(sale)} closed ${formatDate(sale.saleDate)} with no open reminder.`
      })
    })

  const seen = new Set<string>()
  return opportunities.filter(item => {
    if (seen.has(item.key)) return false
    seen.add(item.key)
    return true
  }).slice(0, 8)
}

function getProductionWorkload(sales: Sale[]) {
  return sales.reduce<Record<string, number>>((workload, sale) => {
    const productType = getProductType(sale)
    if (sale.notifyPrintTeam || productType === 'Mailers' || productType === 'Print') workload['Print Team'] += 1
    if (sale.notifyDesigners || sale.designRequired === 'Yes' || sale.designChangeRequired === 'Yes') workload.Designers += 1
    if (sale.notifyDigitalTeam || ['Digital', 'Paid Ads', 'Website Services', 'Geofencing'].includes(productType)) workload['Digital Team'] += 1
    if (sale.notifySocialMediaTeam || productType === 'Social Media Management') workload['Social Media Team'] += 1
    if (sale.notifyGeofencing || productType === 'Geofencing') workload.Geofencing += 1
    return workload
  }, { 'Print Team': 0, Designers: 0, 'Digital Team': 0, 'Social Media Team': 0, Geofencing: 0 })
}

export default function Reports() {
  const { data, isLoading, error, reload } = useLocalStorageAdapter()
  const navigate = useNavigate()
  const currentUserName = String(data.preferences.currentUserName || 'Sunny')
  const [range, setRange] = useState<RangeKey>(() => normalizeRange(readCRMData().preferences.reportsDateRange))

  const analytics = useMemo(() => {
    const bounds = getDateBounds(range)
    const scopedSales = data.sales.filter(sale => isDateInRange(sale.saleDate, bounds))
    const scopedCustomers = data.customers.filter(customer => isDateInRange(customer.dateCreated, bounds))
    const scopedReminders = data.reminders.filter(reminder => isDateInRange(reminder.dueDate || reminder.date, bounds))
    const totalRevenue = scopedSales.reduce((sum, sale) => sum + getSaleRevenue(sale), 0)
    const activeCustomerIds = new Set(scopedSales.map(sale => sale.customerId).filter(Boolean))
    const customersWithSales = new Set(data.sales.map(sale => sale.customerId).filter(Boolean))
    const opportunities = getFollowUpOpportunities(data.customers, data.sales, data.reminders)

    return {
      bounds,
      scopedSales,
      scopedCustomers,
      scopedReminders,
      totalRevenue,
      averageSale: scopedSales.length ? totalRevenue / scopedSales.length : 0,
      activeCustomerCount: activeCustomerIds.size,
      openReminderCount: scopedReminders.filter(reminder => !reminder.completed).length,
      products: buildProductBreakdown(scopedSales),
      owners: buildOwnerPerformance(scopedSales, currentUserName),
      workload: getProductionWorkload(scopedSales),
      opportunities,
      pipeline: {
        total: data.customers.length,
        prospect: data.customers.filter(customer => customer.customerStatus === 'Prospect').length,
        active: data.customers.filter(customer => customer.customerStatus === 'Active').length,
        closed: data.customers.filter(customer => customer.customerStatus === 'Closed').length,
        noSales: data.customers.filter(customer => !customersWithSales.has(customer.id)).length,
        followUp: new Set(opportunities.map(item => item.customer.id)).size
      }
    }
  }, [currentUserName, data.customers, data.reminders, data.sales, range])

  const rangeLabel = reportRanges.find(item => item.key === range)?.label || 'This Month'
  const maxProductRevenue = Math.max(...analytics.products.map(item => item.revenue), 1)

  function changeRange(nextRange: RangeKey) {
    setRange(nextRange)
    const store = readCRMData()
    writeCRMData({
      ...store,
      preferences: {
        ...store.preferences,
        reportsDateRange: nextRange
      }
    })
    reload()
  }

  if (isLoading) {
    return <p className="empty-state">Loading reports...</p>
  }

  if (error) {
    return (
      <section className="data-card">
        <p className="eyebrow">Reports</p>
        <h3>Reports unavailable</h3>
        <p>{error.message}</p>
      </section>
    )
  }

  return (
    <div className="reports-shell">
      <div className="reports-hero">
        <div>
          <p className="eyebrow">Reports & Analytics</p>
          <h2>Reports & Analytics</h2>
          <p className="panel-help">Track sales performance, customer activity, and production workload.</p>
        </div>
        <div className="report-range-controls" aria-label="Report date range">
          {reportRanges.map(item => (
            <button
              key={item.key}
              type="button"
              className={`report-range-btn${range === item.key ? ' active' : ''}`}
              onClick={() => changeRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="report-kpi-grid">
        <DashboardCard title="Total Revenue" value={formatCurrency(analytics.totalRevenue)} description={rangeLabel} accent="green" />
        <DashboardCard title="Sales Count" value={analytics.scopedSales.length} description="Sales records" accent="blue" />
        <DashboardCard title="Average Sale Value" value={formatCurrency(analytics.averageSale)} description="Revenue per sale" accent="purple" />
        <DashboardCard title="Active Customers" value={analytics.activeCustomerCount} description="Customers buying" accent="gray" />
        <DashboardCard title="Open Reminders" value={analytics.openReminderCount} description="Open in range" accent="yellow" />
        <DashboardCard title="Follow-Up Opportunities" value={analytics.pipeline.followUp} description="Customers needing attention" accent="purple" />
      </div>

      <div className="reports-two-column">
        <section className="data-card report-section-card">
          <SectionHeader eyebrow="Sales Breakdown" title="Sales by product category" />
          <div className="report-breakdown-list">
            {analytics.scopedSales.length ? analytics.products.map(item => {
              const percentage = analytics.totalRevenue ? (item.revenue / analytics.totalRevenue) * 100 : 0
              const width = Math.max((item.revenue / maxProductRevenue) * 100, item.revenue ? 4 : 0)
              return (
                <div className="report-breakdown-row" key={item.label}>
                  <div className="report-breakdown-main">
                    <strong>{item.label}</strong>
                    <span>{item.count} sale{item.count === 1 ? '' : 's'} - {formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="report-bar-wrap">
                    <div className="report-bar-track"><div className="report-bar-fill" style={{ width: `${width}%` }} /></div>
                    <small>{percentage.toFixed(1)}%</small>
                  </div>
                </div>
              )
            }) : <p className="empty-state">No sales in this date range.</p>}
          </div>
        </section>

        <section className="data-card report-section-card">
          <SectionHeader eyebrow="Product Mix" title="Revenue by product type" />
          {analytics.totalRevenue ? (
            <div className="table-wrap report-table-wrap">
              <table className="report-table">
                <thead><tr><th>Product Type</th><th>Revenue</th><th>% of Total</th></tr></thead>
                <tbody>
                  {analytics.products.map(item => {
                    const percentage = (item.revenue / analytics.totalRevenue) * 100
                    return (
                      <tr key={item.label}>
                        <td>{item.label}</td>
                        <td>{formatCurrency(item.revenue)}</td>
                        <td>
                          <div className="report-percent-cell">
                            <div className="report-bar-track"><div className="report-bar-fill" style={{ width: `${percentage}%` }} /></div>
                            <strong>{percentage.toFixed(1)}%</strong>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-state">No sales in this date range.</p>}
        </section>
      </div>

      <section className="data-card report-section-card">
        <SectionHeader eyebrow="Account Ownership" title="Owner performance" />
        {analytics.owners.length ? (
          <div className="table-wrap report-table-wrap">
            <table className="report-table">
              <thead><tr><th>Owner</th><th>Sales Count</th><th>Revenue</th><th>Average Sale</th><th>Last Sale Date</th></tr></thead>
              <tbody>
                {analytics.owners.map(owner => (
                  <tr key={owner.name}>
                    <td>{owner.name}</td>
                    <td>{owner.count}</td>
                    <td>{formatCurrency(owner.revenue)}</td>
                    <td>{formatCurrency(owner.count ? owner.revenue / owner.count : 0)}</td>
                    <td>{formatDate(owner.lastSaleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-state">No owner data exists for this date range.</p>}
      </section>

      <div className="reports-two-column">
        <section className="data-card report-section-card">
          <SectionHeader eyebrow="Customer Insights" title="Pipeline health" />
          <div className="customer-insight-grid">
            <InsightCard label="Total Customers" value={analytics.pipeline.total} />
            <InsightCard label="Prospect Customers" value={analytics.pipeline.prospect} />
            <InsightCard label="Active Customers" value={analytics.pipeline.active} />
            <InsightCard label="Closed Customers" value={analytics.pipeline.closed} />
            <InsightCard label="Customers With No Sales" value={analytics.pipeline.noSales} />
            <InsightCard label="Customers Needing Follow-Up" value={analytics.pipeline.followUp} />
          </div>
        </section>

        <section className="data-card report-section-card">
          <SectionHeader eyebrow="Operations" title="Production workload" />
          <div className="workload-grid">
            {Object.entries(analytics.workload).map(([label, count]) => (
              <div className="workload-card" key={label}>
                <span>{label}</span>
                <strong>{count}</strong>
                <small>{count === 1 ? 'item' : 'items'} in range</small>
              </div>
            ))}
          </div>
          {!Object.values(analytics.workload).some(Boolean) ? <p className="empty-state">No production workload available.</p> : null}
        </section>
      </div>

      <section className="data-card report-section-card">
        <SectionHeader eyebrow="Follow-Up Opportunities" title="Customers needing attention" />
        <div className="compact-list">
          {analytics.opportunities.length ? analytics.opportunities.map(item => (
            <div className="compact-row-card" key={item.key}>
              <div className="compact-row-main">
                <span className="tag">{item.label}</span>
                <strong>{item.customer.businessName}</strong>
                <small>{item.detail}</small>
              </div>
              <div className="compact-row-actions">
                <button type="button" className="info-btn compact-action" onClick={() => navigate(`/customers?customerId=${encodeURIComponent(item.customer.id)}`)}>View Customer</button>
                <button type="button" className="secondary-btn compact-action" onClick={() => navigate(`/reminders?customerId=${encodeURIComponent(item.customer.id)}`)}>Add Reminder</button>
                <button type="button" className="secondary-btn compact-action" onClick={() => navigate(`/sales?customerId=${encodeURIComponent(item.customer.id)}`)}>Add Sale</button>
              </div>
            </div>
          )) : <p className="empty-state">No customer activity needs attention right now.</p>}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="section-header-row">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
    </div>
  )
}

function InsightCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="insight-mini-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
