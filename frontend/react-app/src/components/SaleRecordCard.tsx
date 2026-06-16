import type { Sale } from '@/types'

type SaleRecordCardProps = {
  sale: Sale
  customerName: string
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

function formatCurrency(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'N/A'
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

function getStatusStyles(status?: string) {
  const normalized = status?.toLowerCase() ?? ''
  switch (normalized) {
    case 'pending':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200'
    case 'completed':
    case 'closed':
      return 'bg-green-50 text-green-800 border-green-200'
    case 'cancelled':
    case 'rejected':
      return 'bg-red-50 text-red-800 border-red-200'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300'
  }
}

export default function SaleRecordCard({ sale, customerName }: SaleRecordCardProps) {
  const saleType = sale.saleType || sale.saleCategory || sale.productDetails?.service || 'Unknown product'
  const amount = sale.digitalFinalTotal ?? sale.dollarAmount
  const status = sale.saleStatus ?? sale.status

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Customer</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{customerName}</h2>
          </div>
          {status ? (
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(status)}`}>
              {status}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Product type:</span> {saleType}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Sale date:</span> {formatSaleDate(sale.saleDate)}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Amount:</span> {formatCurrency(amount)}
          </div>
          {sale.productDetails?.service && (
            <div>
              <span className="font-semibold text-slate-800">Service:</span> {sale.productDetails.service}
            </div>
          )}
        </div>
      </div>

      {sale.notes ? (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-800">Notes</p>
          <p className="mt-1 leading-relaxed">{sale.notes}</p>
        </div>
      ) : null}
    </article>
  )
}
