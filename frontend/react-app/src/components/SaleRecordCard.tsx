import type { Sale } from '@/types'

type SaleRecordCardProps = {
  sale: Sale
  customerName: string
  onEdit: (sale: Sale) => void
  onDelete: (saleId: string) => void
  onAgreement: (sale: Sale) => void
  onDownloadPdf: (sale: Sale) => void
  onReorder: (sale: Sale) => void
}

function formatSaleDate(value?: string) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatCurrency(value?: number | string) {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(numeric)
}

function getSaleAmount(sale: Sale) {
  return sale.digitalFinalTotal ?? sale.dollarAmount ?? sale.productDetails?.totalInvestment ?? 0
}

function getSaleLabel(sale: Sale) {
  return sale.productDetails?.service || sale.saleType || sale.saleCategory || 'Sale'
}

function getCategoryClass(sale: Sale) {
  return String(sale.saleCategory || '').toLowerCase()
}

function getStatus(sale: Sale) {
  return sale.saleStatus || sale.status || 'Completed'
}

export default function SaleRecordCard({
  sale,
  customerName,
  onEdit,
  onDelete,
  onAgreement,
  onDownloadPdf,
  onReorder
}: SaleRecordCardProps) {
  const payment = sale.paymentMethod || 'Payment N/A'
  const agreement = sale.customerSignatureImage ? 'Signed' : 'Agreement'

  return (
    <article className="sales-history-row">
      <div className="sales-history-main">
        <strong>{customerName}</strong>
        <span>{getSaleLabel(sale)}</span>
        <small className="sales-history-status">{getStatus(sale)} / {payment} / {agreement}</small>
      </div>

      <div className="sales-history-meta">
        <span className={`sale-category-badge ${getCategoryClass(sale)}`}>{sale.saleCategory}</span>
        <span>{formatSaleDate(sale.saleDate)}</span>
      </div>

      <div className="sales-history-right">
        <strong>{formatCurrency(getSaleAmount(sale))}</strong>
        <div className="sales-action-group sales-history-actions">
          <button className="edit-btn compact-action" type="button" onClick={() => onEdit(sale)}>Edit</button>
          <button className="info-btn compact-action" type="button" onClick={() => onAgreement(sale)}>View</button>
          <button className="secondary-btn compact-action" type="button" onClick={() => onDownloadPdf(sale)}>PDF</button>
          <button className="primary-btn compact-action" type="button" onClick={() => onReorder(sale)}>Reorder</button>
          <button className="delete-btn compact-action" type="button" onClick={() => onDelete(sale.id)}>Delete</button>
        </div>
      </div>
    </article>
  )
}
