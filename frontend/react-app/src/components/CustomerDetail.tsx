import { useMemo, useState } from 'react'
import type { Customer, Sale } from '@/types'

interface Props {
  customer: Customer
  sales: Sale[]
  formatDate: (d?: string) => string
  onReorder: (saleId: string) => void
}

function formatCurrency(value?: number | string) {
  const numeric = Number(value || 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number.isFinite(numeric) ? numeric : 0)
}

function getSaleAmount(sale: Sale) {
  return Number(sale.dollarAmount ?? sale.digitalFinalTotal ?? sale.productDetails?.totalInvestment ?? 0)
}

function getSaleDisplayLabel(sale: Sale) {
  return sale.productDetails?.service || sale.saleType || sale.saleCategory || 'Sale'
}

function getSaleCategoryClass(sale: Sale) {
  return String(sale.saleCategory || '').toLowerCase()
}

function getSaleKeyDetails(sale: Sale) {
  const details = sale.productDetails || {}
  if (sale.saleCategory === 'Mailer') {
    return [`Area: ${details.mailerArea || 'N/A'}`, `Size: ${details.adSize || 'N/A'}`, `Run: ${details.mailerRunTime || 'N/A'} mo`].join(' - ')
  }
  if (sale.saleCategory === 'Digital') {
    return [details.service || 'Digital', details.targetAreas || details.targetLocations || ''].filter(Boolean).join(' - ')
  }
  if (sale.saleCategory === 'Print') {
    return [`Type: ${details.printType || 'Print'}`, `Qty: ${details.quantity || 'N/A'}`, `${details.size || 'N/A'}`].join(' - ')
  }
  return sale.saleType || 'Sale'
}

export default function CustomerDetail({ customer, sales, formatDate, onReorder }: Props) {
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const customerSales = useMemo(() => {
    return sales
      .filter(sale => sale.customerId === customer.id)
      .sort((a, b) => (b.saleDate || '').localeCompare(a.saleDate || ''))
  }, [customer.id, sales])
  const selectedSale = customerSales.find(sale => sale.id === selectedSaleId) || null
  const lifetimeRevenue = customerSales.reduce((sum, sale) => sum + getSaleAmount(sale), 0)
  const lastOrderDate = customerSales[0]?.saleDate

  return (
    <section className="data-card customer-detail-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Order History</p>
          <h3>{customer.businessName} · Order History</h3>
        </div>
        <p className="panel-help">View sales history, recent orders, summary metrics, and reorder from a customer profile.</p>
      </div>

      <div className="detail-stats-grid">
        <SummaryCard className="accent-pink" label="Total Orders" value={customerSales.length} />
        <SummaryCard className="accent-purple" label="Lifetime Revenue" value={formatCurrency(lifetimeRevenue)} />
        <SummaryCard className="accent-blue" label="Last Order Date" value={lastOrderDate ? formatDate(lastOrderDate) : 'None'} />
      </div>

      <div className="table-wrap customer-order-history">
        {customerSales.length ? (
          <div className="sales-activity-list customer-sales-history">
            {customerSales.map(order => (
              <article key={order.id} className="sales-activity-row">
                <div className="sales-activity-main">
                  <span className={`sale-category-badge ${getSaleCategoryClass(order)}`}>{order.saleCategory}</span>
                  <strong className="sales-customer-name">{getSaleDisplayLabel(order)}</strong>
                  <span className="sales-product-line">{getSaleKeyDetails(order)}</span>
                </div>
                <div className="sales-activity-meta">
                  <span>{formatDate(order.saleDate)}</span>
                  <span>{order.businessName || customer.businessName}</span>
                </div>
                <div className="sales-activity-side">
                  <strong className="sales-total">{formatCurrency(getSaleAmount(order))}</strong>
                  <div className="sales-action-group">
                    <button className="info-btn compact-action" type="button" onClick={() => setSelectedSaleId(order.id)}>View</button>
                    <button className="primary-btn compact-action" type="button" onClick={() => onReorder(order.id)}>Reorder</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sales-empty-state">
            <strong>No sales recorded yet.</strong>
            <span>Create a sale to begin tracking customer activity.</span>
          </div>
        )}
      </div>

      {selectedSale ? (
        <OrderDetail sale={selectedSale} formatDate={formatDate} onReorder={onReorder} />
      ) : null}
    </section>
  )
}

function SummaryCard({ className, label, value }: { className: string; label: string; value: string | number }) {
  return (
    <div className={`report-card small ${className}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function OrderDetail({ sale, formatDate, onReorder }: { sale: Sale; formatDate: (d?: string) => string; onReorder: (saleId: string) => void }) {
  const details = sale.productDetails || {}
  const lines: string[] = []

  if (sale.saleCategory === 'Mailer') {
    lines.push(`Mailer area: ${details.mailerArea || 'N/A'}`)
    lines.push(`Start month: ${details.month || 'N/A'}`)
    lines.push(`Run time: ${details.mailerRunTime || 'N/A'} months`)
    lines.push(`Size: ${details.adSize || 'N/A'}`)
  }
  if (sale.saleCategory === 'Digital') {
    lines.push(`Service: ${details.service || 'Digital'}`)
    if (details.websiteOption) lines.push(`Website option: ${details.websiteOption}`)
    if (Array.isArray(details.paidAdPlatforms) && details.paidAdPlatforms.length) lines.push(`Paid ad platforms: ${details.paidAdPlatforms.join(', ')}`)
    if (Array.isArray(details.socialPlatforms) && details.socialPlatforms.length) lines.push(`Social platforms: ${details.socialPlatforms.join(', ')}`)
    if (details.campaignGoal) lines.push(`Campaign goal: ${details.campaignGoal}`)
    if (details.serviceDetails) lines.push(`Service details: ${details.serviceDetails}`)
    if (details.creativeType) lines.push(`Creative type: ${details.creativeType}`)
    if (details.projectScope) lines.push(`Project scope: ${details.projectScope}`)
    if (details.targetAreas) lines.push(`Target areas: ${details.targetAreas}`)
    if (details.targetLocations) lines.push(`Target locations: ${details.targetLocations}`)
    if (details.campaignStartDate || details.startDate) lines.push(`Start date: ${details.campaignStartDate || details.startDate}`)
  }
  if (sale.saleCategory === 'Print') {
    lines.push(`Print type: ${details.printType || 'N/A'}`)
    if (details.size) lines.push(`Size: ${details.size}`)
    if (details.quantity) lines.push(`Quantity: ${details.quantity}`)
    if (details.finish) lines.push(`Finish: ${details.finish}`)
    if (details.thickness) lines.push(`Thickness: ${details.thickness}`)
    if (details.fold) lines.push(`Fold: ${details.fold}`)
    if (details.mailingOption) lines.push(`Mailing method: ${details.mailingOption}`)
  }

  return (
    <section className="data-card customer-order-detail-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Order details</p>
          <h3>{getSaleDisplayLabel(sale)}</h3>
        </div>
        <p className="panel-help">Detailed product specifications and pricing for this order.</p>
      </div>
      <div className="detail-summary">
        <div><strong>Category</strong><p>{sale.saleCategory}</p></div>
        <div><strong>Date</strong><p>{formatDate(sale.saleDate)}</p></div>
        <div><strong>Total</strong><p>{formatCurrency(getSaleAmount(sale))}</p></div>
      </div>
      <div className="order-detail-list">
        {lines.map(item => <p key={item}>{item}</p>)}
      </div>
      {sale.notes ? <p><strong>Internal Notes</strong><br />{sale.notes}</p> : null}
      <div className="form-actions">
        <button className="primary-btn" type="button" onClick={() => onReorder(sale.id)}>Reorder this sale</button>
      </div>
    </section>
  )
}
