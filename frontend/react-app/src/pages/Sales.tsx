import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readCRMData, updateSale, useLocalStorageAdapter, writeCRMData } from '@/hooks/useLocalStorageAdapter'
import type { Customer, Sale } from '@/types'
import SaleRecordCard from '@/components/SaleRecordCard'
import SaleForm from '@/components/SaleForm'
import SignaturePad from '@/components/SignaturePad'
import { downloadAgreementPdfFile } from '@/utils/agreementPdf'
import { useToast } from '@/components/ToastProvider'

type FormMode = 'create' | 'edit' | 'reorder'
type PackageState = {
  status: 'idle' | 'preparing' | 'ready' | 'error'
  message?: string
  fileName?: string
}

function formatCurrency(value?: number | string) {
  const numeric = Number(value ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number.isFinite(numeric) ? numeric : 0)
}

function formatDate(value?: string) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getSaleAmount(sale: Sale) {
  return sale.digitalFinalTotal ?? sale.dollarAmount ?? sale.productDetails?.totalInvestment ?? 0
}

function getSaleProductSummary(sale: Sale) {
  const details = sale.productDetails || {}
  if (sale.saleCategory === 'Mailer') {
    return `${details.mailerArea || 'Mailer'} / ${details.adSize || 'Ad'} / ${details.mailerRunTime || 0} months`
  }
  if (sale.saleCategory === 'Print') {
    return `${details.printType || 'Print'} / Qty ${details.quantity || 'N/A'} / ${details.size || 'Size N/A'}`
  }
  if (sale.saleCategory === 'Digital') {
    return String(details.service || sale.saleType || 'Digital Service')
  }
  return sale.saleType || sale.saleCategory || 'Sale'
}

export default function Sales() {
  const { showToast } = useToast()
  const { data, isLoading, error, reload } = useLocalStorageAdapter()
  const [formSale, setFormSale] = useState<Sale | undefined>()
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [confirmationSaleId, setConfirmationSaleId] = useState<string | null>(null)
  const [packageState, setPackageState] = useState<PackageState>({ status: 'idle' })
  const [searchParams, setSearchParams] = useSearchParams()
  const confirmationRef = useRef<HTMLDivElement | null>(null)
  const currentUserName = String(data.preferences.currentUserName || 'Sunny')

  const salesWithCustomer = useMemo(() => {
    return [...data.sales]
      .sort((a, b) => (b.saleDate || '').localeCompare(a.saleDate || ''))
      .map<Sale & { customerName: string }>((sale) => {
        const matchingCustomer = data.customers.find((customer) => customer.id === sale.customerId)
        const customerName = matchingCustomer?.businessName || sale.businessName || 'Unknown customer'
        return { ...sale, customerName }
      })
  }, [data.customers, data.sales])

  const confirmationSale = confirmationSaleId
    ? data.sales.find(sale => sale.id === confirmationSaleId) || null
    : null
  const requestedCustomerId = searchParams.get('customerId') || undefined

  useEffect(() => {
    const viewSaleId = searchParams.get('viewSaleId')
    if (!viewSaleId || isLoading) return
    const sale = data.sales.find((item) => item.id === viewSaleId)
    if (sale) {
      setConfirmationSaleId(sale.id)
      setFormSale(undefined)
      setFormMode('create')
      setPackageState({ status: 'idle' })
      showToast('Sale agreement loaded.', 'info')
    } else {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('viewSaleId')
      setSearchParams(nextParams, { replace: true })
      showToast('The requested sale could not be found.', 'error')
    }
  }, [data.sales, isLoading, searchParams, setSearchParams, showToast])

  useEffect(() => {
    const saleId = searchParams.get('reorderSaleId')
    if (!saleId) return

    const sale = data.sales.find((item) => item.id === saleId)
    if (sale) {
      setFormSale(sale)
      setFormMode('reorder')
      showToast('Reorder loaded into the sale form.', 'info')
    }
  }, [data.sales, searchParams, showToast])

  useEffect(() => {
    if (!confirmationSaleId) return
    window.requestAnimationFrame(() => {
      confirmationRef.current?.focus()
      confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [confirmationSaleId])

  function clearReorderParam() {
    if (!searchParams.has('reorderSaleId') && !searchParams.has('viewSaleId')) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('reorderSaleId')
    nextParams.delete('viewSaleId')
    setSearchParams(nextParams)
  }

  function resetForm() {
    setFormSale(undefined)
    setFormMode('create')
    clearReorderParam()
  }

  function handleEdit(sale: Sale) {
    setFormSale(sale)
    setFormMode('edit')
    setConfirmationSaleId(null)
    setPackageState({ status: 'idle' })
    showToast('Sale loaded for editing.', 'info')
  }

  function handleReorder(sale: Sale) {
    setFormSale(sale)
    setFormMode('reorder')
    setConfirmationSaleId(null)
    setPackageState({ status: 'idle' })
    showToast('Reorder loaded into the sale form.', 'info')
  }

  function handleDelete(saleId: string) {
    const sale = data.sales.find(item => item.id === saleId)
    if (!sale) return
    const confirmed = window.confirm('Delete this sale and its related notifications?')
    if (!confirmed) return

    const store = readCRMData()
    writeCRMData({
      ...store,
      sales: store.sales.filter(item => item.id !== saleId),
      notifications: store.notifications.filter(notification => notification.relatedId !== saleId)
    })
    if (confirmationSaleId === saleId) setConfirmationSaleId(null)
    if (formSale?.id === saleId) resetForm()
    reload()
    showToast('Sale deleted successfully.', 'success')
  }

  async function handleDownloadPdf(sale: Sale) {
    const customer = data.customers.find(item => item.id === sale.customerId)
    try {
      await downloadAgreementPdfFile(sale, customer)
      showToast('Agreement PDF downloaded.', 'success')
    } catch (err) {
      console.error('[Sales] PDF generation failed', err)
      showToast('Unable to generate PDF. Check the console for details.', 'error')
    }
  }

  function handleSave(savedSale: Sale) {
    reload()
    setConfirmationSaleId(savedSale.id)
    setPackageState({ status: 'idle' })
    resetForm()
    showToast(formMode === 'edit' ? 'Sale updated successfully.' : 'Sale saved successfully.', 'success')
  }

  function handleSignatureSave(sale: Sale, signature: string | null) {
    if (!signature) {
      showToast('Draw a customer signature before saving.', 'error')
      return
    }
    const updated = {
      ...sale,
      customerSignatureImage: signature,
      customerSignatureDate: new Date().toISOString()
    }
    updateSale(updated)
    reload()
    setConfirmationSaleId(updated.id)
    showToast('Customer signature saved.', 'success')
  }

  async function handleSendPackage(sale: Sale) {
    const customer = data.customers.find(item => item.id === sale.customerId)
    const errors: string[] = []
    if (!customer) errors.push('Customer record not found.')
    if (!customer?.emailAddress?.trim()) errors.push('Customer email address is required.')
    if (!sale.saleDate) errors.push('Sale date is required.')
    if (Number(getSaleAmount(sale)) <= 0) errors.push('Agreement total must be greater than zero.')
    if (errors.length) {
      const message = errors.join(' ')
      setPackageState({ status: 'error', message })
      showToast(message, 'error')
      return
    }
    if (!customer) return

    setPackageState({ status: 'preparing', message: 'Generating agreement PDF...' })
    try {
      const fileName = await downloadAgreementPdfFile(sale, customer)
      const subject = encodeURIComponent(`Avidsphere Advertising Agreement - ${customer.businessName || sale.businessName || 'Customer'}`)
      const body = encodeURIComponent([
        `Hello ${customer.contactPerson || ''},`,
        '',
        'Your Avidsphere advertising agreement package is ready for review.',
        '',
        `Products Sold: ${getSaleProductSummary(sale)}`,
        `Total: ${formatCurrency(getSaleAmount(sale))}`,
        `Payment Method: ${sale.paymentMethod === 'Other' ? sale.otherPaymentMethod || 'Other' : sale.paymentMethod || 'Not specified'}`,
        '',
        `Please attach the downloaded PDF named ${fileName} before sending.`,
        '',
        'Please review and authorize the agreement.'
      ].join('\n'))
      setPackageState({
        status: 'ready',
        fileName,
        message: 'PDF downloaded and email draft opened. Attach the PDF before sending.'
      })
      window.location.href = `mailto:${encodeURIComponent(customer.emailAddress)}?subject=${subject}&body=${body}`
      showToast('Agreement package prepared. Attach the downloaded PDF to the email draft.', 'success')
    } catch (err) {
      console.error('[Sales] Agreement package failed', err)
      const message = 'Agreement package could not be prepared. Please try downloading the PDF again.'
      setPackageState({ status: 'error', message })
      showToast(message, 'error')
    }
  }

  function openConfirmation(sale: Sale) {
    setConfirmationSaleId(sale.id)
    setPackageState({ status: 'idle' })
    setFormSale(undefined)
    setFormMode('create')
  }

  function returnToSales() {
    setConfirmationSaleId(null)
    setPackageState({ status: 'idle' })
    clearReorderParam()
  }

  if (confirmationSale) {
    return (
      <div className="sales-workspace agreement-workspace" ref={confirmationRef} tabIndex={-1}>
        <AgreementConfirmation
          sale={confirmationSale}
          customer={data.customers.find(customer => customer.id === confirmationSale.customerId)}
          packageState={packageState}
          onDownload={() => handleDownloadPdf(confirmationSale)}
          onSend={() => handleSendPackage(confirmationSale)}
          onReturn={returnToSales}
          onSaveSignature={(signature) => handleSignatureSave(confirmationSale, signature)}
        />
      </div>
    )
  }

  return (
    <div className="sales-workspace">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Sales</p>
          <h2>Sales ledger</h2>
        </div>
        <p className="panel-help">Record and edit sales transactions for customers.</p>
      </div>

      <div className="card-grid two-column sales-work-grid">
        <SaleForm
          key={`${formMode}-${formSale?.id || requestedCustomerId || 'new'}`}
          customers={data.customers}
          initialSale={formSale}
          initialCustomerId={requestedCustomerId}
          currentUserName={currentUserName}
          mode={formMode}
          onClose={resetForm}
          onSave={handleSave}
        />

        <section className="data-card sales-ledger-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">History</p>
              <h3>Recent sales</h3>
            </div>
            <span className="tag">{salesWithCustomer.length} records</span>
          </div>

          {error ? (
            <div className="sales-empty-state">
              <strong>Unable to load sales history.</strong>
              <span>{error.message}</span>
            </div>
          ) : isLoading ? (
            <p className="empty-state">Loading sales records...</p>
          ) : salesWithCustomer.length === 0 ? (
            <div className="sales-empty-state">
              <strong>No sales recorded yet.</strong>
              <span>Create a sale to begin tracking customer activity.</span>
            </div>
          ) : (
            <div className="sales-ledger">
              <div className="sales-history-list">
                {salesWithCustomer.map((sale) => (
                  <SaleRecordCard
                    key={sale.id}
                    sale={sale}
                    customerName={sale.customerName}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAgreement={openConfirmation}
                    onDownloadPdf={handleDownloadPdf}
                    onReorder={handleReorder}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

type AgreementConfirmationProps = {
  sale: Sale
  customer?: Customer
  packageState: PackageState
  onDownload: () => void
  onSend: () => void
  onReturn: () => void
  onSaveSignature: (signature: string | null) => void
}

function AgreementConfirmation({ sale, customer, packageState, onDownload, onSend, onReturn, onSaveSignature }: AgreementConfirmationProps) {
  const [signature, setSignature] = useState<string | null>(null)
  const [signaturePadKey, setSignaturePadKey] = useState(0)

  function saveSignature() {
    onSaveSignature(signature)
    if (!signature) return
    setSignature(null)
    setSignaturePadKey(current => current + 1)
  }

  return (
    <section className="data-card sale-confirmation-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Agreement</p>
          <h2>Advertising agreement ready</h2>
        </div>
        <p className="panel-help">Review the recorded sale, collect authorization, then send or download the package.</p>
      </div>

      <div className="confirmation-grid">
        <div><strong>Business Name</strong><p>{customer?.businessName || sale.businessName || 'N/A'}</p></div>
        <div><strong>Contact Person</strong><p>{customer?.contactPerson || 'N/A'}</p></div>
        <div><strong>Product(s) Sold</strong><p>{getSaleProductSummary(sale)}</p></div>
        <div><strong>Total</strong><p>{formatCurrency(getSaleAmount(sale))}</p></div>
        <div><strong>Date Created</strong><p>{formatDate(sale.saleDate)}</p></div>
        <div><strong>Payment Method</strong><p>{sale.paymentMethod === 'Other' ? sale.otherPaymentMethod || 'Other' : sale.paymentMethod || 'Not specified'}</p></div>
        <div className="confirmation-full"><strong>Internal Notes</strong><p>{sale.notes || 'No internal notes.'}</p></div>
      </div>

      <div className="agreement-confirmation-grid">
        <section className="signature-card">
          <div>
            <p className="eyebrow">Authorization</p>
            <h3>Collect handwritten signature</h3>
          </div>
          <SignaturePad key={signaturePadKey} width={520} height={170} onChange={setSignature} />
          <div className="signature-controls">
            <button type="button" className="primary-btn" onClick={saveSignature}>Save Signature</button>
          </div>
        </section>

        <section className="agreement-package-success">
          <div className="agreement-package-status">
            <span className="tag active">Package ready</span>
            <h3>Agreement package actions</h3>
            <p>Your agreement details are ready for customer authorization.</p>
          </div>
          <div className="agreement-package-next">
            <button type="button" className="primary-btn" onClick={onSend} disabled={packageState.status === 'preparing'}>
              {packageState.status === 'preparing' ? 'Preparing Package...' : 'Send Agreement Package'}
            </button>
            <button type="button" className="secondary-btn" onClick={onDownload}>Download Agreement PDF</button>
            <button type="button" className="info-btn" onClick={onReturn}>Return to CRM</button>
          </div>
          {packageState.status === 'ready' ? (
            <div className="agreement-package-reminder" role="status">
              <p className="reminder-label">Agreement Package Ready</p>
              <div className="reminder-box">
                <p><strong>PDF generated:</strong></p>
                <p className="attachment-name">{packageState.fileName}</p>
                <p className="reminder-note">{packageState.message}</p>
                <ol className="next-steps-list">
                  <li>Review or personalize the email draft.</li>
                  <li>Attach the downloaded PDF shown above.</li>
                  <li>Send the email to the customer.</li>
                </ol>
              </div>
            </div>
          ) : null}
          {packageState.status === 'error' ? (
            <div className="agreement-package-error" role="alert">{packageState.message}</div>
          ) : null}
        </section>
      </div>
    </section>
  )
}
