import React, { useState, useMemo } from 'react'
import type { Customer, ProductDetails } from '@/types'
import ProductTypeSelector from './ProductTypeSelector'
import MailerFields from './MailerFields'
import PrintFields from './PrintFields'
import DigitalFields from './DigitalFields'
import PaymentFields from './PaymentFields'
import PricingPreview from './PricingPreview'
import AgreementActions from './AgreementActions'

interface Props {
  customers: Customer[]
  onClose: () => void
}

export default function SaleForm({ customers, onClose }: Props) {
  const [customerId, setCustomerId] = useState<string | undefined>(customers[0]?.id)
  const [saleCategory, setSaleCategory] = useState<'Mailer' | 'Print' | 'Digital'>('Mailer')
  const [saleDate, setSaleDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [salesRep, setSalesRep] = useState<string>('')
  const [saleNotes, setSaleNotes] = useState<string>('')
  const [productDetails, setProductDetails] = useState<ProductDetails>({})
  const [paymentMethod, setPaymentMethod] = useState<string>('Invoice')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pricing constants
  const SIZE_PRICES: Record<string, number> = {
    '3x4': 340,
    '3x8': 655,
    '3x12': 995
  }
  const DESIGN_REQUIRED_FEE = 30
  const DESIGN_CHANGE_FEE = 15

  const mailerPricing = useMemo(() => {
    const adSize = String(productDetails.adSize || '')
    const runTime = Number(productDetails.mailerRunTime || 0) || 0
    const monthlyRate = SIZE_PRICES[adSize] || 0
    const subtotal = monthlyRate * runTime
    const designFee = (String(productDetails.designRequired || '').toLowerCase() === 'yes') ? DESIGN_REQUIRED_FEE : 0
    const designChange = (String(productDetails.designChangeRequired || '').toLowerCase() === 'yes') ? DESIGN_CHANGE_FEE : 0
    const total = subtotal + designFee + designChange
    return { monthlyRate, subtotal, designFee, designChange, total }
  }, [productDetails])

  function validate(): boolean {
    const next: Record<string, string> = {}
    // Common validations
    if (!customerId) next.customer = 'Customer is required.'
    if (!saleDate) next.saleDate = 'Sale date is required.'

    // Mailer required fields
    if (saleCategory === 'Mailer') {
      if (!productDetails.mailerArea) next.mailerArea = 'Mailer area is required.'
      if (!productDetails.month) next.mailerMonth = 'Start month is required.'
      if (!productDetails.mailerRunTime || Number(productDetails.mailerRunTime) <= 0) next.mailerRunTime = 'Run time must be greater than 0.'
      if (!productDetails.adSize) next.adSize = 'Ad size is required.'
    }

    // Print required fields
    if (saleCategory === 'Print') {
      if (!productDetails.printType) next.printType = 'Print type is required.'
      if (!productDetails.quantity || Number(productDetails.quantity) <= 0) next.printQuantity = 'Quantity must be greater than 0.'
    }

    // Digital required fields
    if (saleCategory === 'Digital') {
      if (!productDetails.service) next.digitalService = 'Digital service is required.'
      if (!productDetails.monthlyAdSpend || Number(productDetails.monthlyAdSpend) <= 0) next.digitalSpend = 'Monthly ad spend must be greater than 0.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  return (
    <div className="sale-form-container">
      <div className="sale-form-shell" style={{ background: 'transparent', padding: 0 }}>
        <header className="sale-form-header">
          <h2>New Sale</h2>
          <button onClick={onClose} aria-label="Close">✕</button>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); if (validate()) { console.log('Validated — Mailer pricing:', mailerPricing) } else { console.log('Validation failed') } }}>
          <section className="form-row">
            <div className="form-field">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Choose a customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Sale Date</label>
              <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Sales Rep</label>
              <input value={salesRep} onChange={(e) => setSalesRep(e.target.value)} placeholder="Name" />
            </div>
          </section>
          <section className="form-row">
            <label>Sale notes</label>
            <textarea value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} placeholder="Describe important sale details." rows={4} />
          </section>

          <section className="form-section">
            <ProductTypeSelector value={saleCategory} onChange={setSaleCategory} />

            {saleCategory === 'Mailer' && (
              <MailerFields details={productDetails} onChange={d => setProductDetails(d)} errors={errors} />
            )}

            {saleCategory === 'Print' && (
              <PrintFields details={productDetails} onChange={d => setProductDetails(d)} errors={errors} />
            )}

            {saleCategory === 'Digital' && (
              <DigitalFields details={productDetails} onChange={d => setProductDetails(d)} errors={errors} />
            )}
          </section>

          <section className="form-section">
            <PaymentFields paymentMethod={paymentMethod} onChange={setPaymentMethod} />
          </section>

          <section className="form-section sidebar">
            <PricingPreview details={productDetails} paymentMethod={paymentMethod} mailerPricing={mailerPricing} saleCategory={saleCategory} />
            <AgreementActions />
          </section>

          <footer className="form-actions">
            <button type="button" onClick={onClose} className="secondary">Cancel</button>
            <button type="submit" className="primary" title="Save is not implemented">Save (placeholder)</button>
          </footer>
        </form>
      </div>
    </div>
  )
}
