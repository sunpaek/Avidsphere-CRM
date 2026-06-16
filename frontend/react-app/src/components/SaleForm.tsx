import React, { useState, useMemo, useEffect } from 'react'
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
  const [paymentOtherMethod, setPaymentOtherMethod] = useState<string>('')
  const [paymentNotes, setPaymentNotes] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pricing constants
  const SIZE_PRICES: Record<string, number> = {
    '3x4': 340,
    '3x8': 655,
    '3x12': 995,
    '4x6': 655,
    '4x9': 995
  }
  const DESIGN_REQUIRED_FEE = 30
  const DESIGN_CHANGE_FEE = 15

  const mailerPricing = useMemo(() => {
    const adSize = String(productDetails.adSize || '')
    const runTime = Number(productDetails.mailerRunTime || 0) || 0
    const monthlyRate = SIZE_PRICES[adSize] || 0
    const subtotal = monthlyRate * runTime
    const discountType = String(productDetails.discountType || 'None') as 'None' | 'Dollar Amount' | 'Percentage'
    const discountValue = Number(productDetails.discountValue || 0)
    let discountAmount = 0

    if (discountType === 'Dollar Amount') {
      discountAmount = Math.min(Math.max(discountValue, 0), subtotal)
    } else if (discountType === 'Percentage') {
      discountAmount = Math.min(Math.max(subtotal * (discountValue / 100), 0), subtotal)
    }

    const designFee = (String(productDetails.designRequired || '').toLowerCase() === 'yes') ? DESIGN_REQUIRED_FEE : 0
    const designChange = (String(productDetails.designChangeRequired || '').toLowerCase() === 'yes') ? DESIGN_CHANGE_FEE : 0
    const total = subtotal - discountAmount + designFee + designChange

    return { monthlyRate, subtotal, discountType, discountValue, discountAmount, designFee, designChange, total }
  }, [productDetails])

  const digitalPricing = useMemo(() => {
    if (saleCategory !== 'Digital') {
      return { servicePrice: 0, discountType: 'None', discountValue: 0, discountAmount: 0, totalInvestment: 0 }
    }

    const servicePrice = Number(productDetails.servicePrice || 0)
    const discountType = String(productDetails.discountType || 'None') as 'None' | 'Dollar Amount' | 'Percentage'
    const discountValue = Number(productDetails.discountValue || 0)
    let discountAmount = 0

    if (discountType === 'Dollar Amount') {
      discountAmount = Math.min(discountValue, servicePrice)
    } else if (discountType === 'Percentage') {
      discountAmount = Math.min(servicePrice * (discountValue / 100), servicePrice)
    }

    if (discountAmount < 0) discountAmount = 0
    const totalInvestment = Math.max(servicePrice - discountAmount, 0)

    return { servicePrice, discountType, discountValue, discountAmount, totalInvestment }
  }, [saleCategory, productDetails.servicePrice, productDetails.discountType, productDetails.discountValue])

  const printPricing = useMemo(() => {
    if (saleCategory !== 'Print') {
      return { projectPrice: 0, designFee: 0, discountType: 'None', discountValue: 0, discountAmount: 0, totalInvestment: 0 }
    }

    const projectPrice = Number(productDetails.projectPrice || 0)
    const designFee = Number(productDetails.designFee || 0)
    const discountType = String(productDetails.discountType || 'None') as 'None' | 'Dollar Amount' | 'Percentage'
    const discountValue = Number(productDetails.discountValue || 0)
    let discountAmount = 0

    if (discountType === 'Dollar Amount') {
      discountAmount = Math.min(discountValue, projectPrice)
    } else if (discountType === 'Percentage') {
      discountAmount = Math.min(projectPrice * (discountValue / 100), projectPrice)
    }

    if (discountAmount < 0) discountAmount = 0
    const totalInvestment = Math.max(projectPrice + designFee - discountAmount, 0)

    return { projectPrice, designFee, discountType, discountValue, discountAmount, totalInvestment }
  }, [saleCategory, productDetails.projectPrice, productDetails.designFee, productDetails.discountType, productDetails.discountValue])

  useEffect(() => {
    if (saleCategory === 'Digital') {
      const currentTotal = Number(productDetails.totalInvestment || 0)
      if (currentTotal !== digitalPricing.totalInvestment) {
        setProductDetails(prev => ({ ...prev, totalInvestment: digitalPricing.totalInvestment }))
      }
    }
  }, [digitalPricing, saleCategory, productDetails.totalInvestment])

  useEffect(() => {
    if (saleCategory === 'Print') {
      const currentTotal = Number(productDetails.totalInvestment || 0)
      if (currentTotal !== printPricing.totalInvestment) {
        setProductDetails(prev => ({ ...prev, totalInvestment: printPricing.totalInvestment }))
      }
    }
  }, [printPricing, saleCategory, productDetails.totalInvestment])

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

      if (productDetails.discountType && productDetails.discountType !== 'None') {
        const discountValue = Number(productDetails.discountValue || 0)
        if (Number.isNaN(discountValue) || discountValue < 0) {
          next.discountValue = 'Enter a valid discount value.'
        } else if (productDetails.discountType === 'Percentage' && discountValue > 100) {
          next.discountValue = 'Enter a percentage discount between 0 and 100.'
        } else if (productDetails.discountType === 'Dollar Amount') {
          const subtotal = (SIZE_PRICES[String(productDetails.adSize || '')] || 0) * Number(productDetails.mailerRunTime || 0)
          if (discountValue > subtotal) {
            next.discountValue = 'Discount cannot exceed the mailer subtotal.'
          }
        }
      }
    }

    // Print required fields
    if (saleCategory === 'Print') {
      if (!productDetails.printType) next.printType = 'Print type is required.'
      if (!productDetails.quantity || Number(productDetails.quantity) <= 0) next.printQuantity = 'Quantity must be greater than 0.'
      if (!productDetails.size) next.printSize = 'Size is required.'
      if (!productDetails.finish) next.printFinish = 'Finish is required.'
      if (!productDetails.thickness) next.printThickness = 'Thickness is required.'
      if (productDetails.needsMailing && !productDetails.mailingOption) next.printMailing = 'Mailing option is required when mailing is requested.'
      
      // Print pricing validation
      if (!productDetails.projectPrice || Number(productDetails.projectPrice) <= 0) next.printProjectPrice = 'Project price must be greater than 0.'
      if (Number(productDetails.designFee || 0) < 0) next.printDesignFee = 'Design fee cannot be negative.'
      
      if (productDetails.discountType && productDetails.discountType !== 'None') {
        const discountValue = Number(productDetails.discountValue || 0)
        if (Number.isNaN(discountValue) || discountValue < 0) next.printDiscountValue = 'Enter a valid discount value.'
        if (productDetails.discountType === 'Percentage' && discountValue > 100) next.printDiscountValue = 'Enter a percentage discount between 0 and 100.'
        if (productDetails.discountType === 'Dollar Amount' && discountValue > Number(productDetails.projectPrice || 0)) next.printDiscountValue = 'Discount cannot exceed the project price.'
      }
    }

    // Digital required fields
    if (saleCategory === 'Digital') {
      if (!productDetails.service) next.digitalService = 'Digital service is required.'
      if (!productDetails.servicePrice || Number(productDetails.servicePrice) <= 0) next.digitalServicePrice = 'Service price must be greater than 0.'
      if (productDetails.discountType && productDetails.discountType !== 'None') {
        const discountValue = Number(productDetails.discountValue || 0)
        if (Number.isNaN(discountValue) || discountValue < 0) next.discountValue = 'Enter a valid discount value.'
        if (productDetails.discountType === 'Percentage' && discountValue > 100) next.discountValue = 'Enter a percentage discount between 0 and 100.'
        if (productDetails.discountType === 'Dollar Amount' && discountValue > Number(productDetails.servicePrice || 0)) next.discountValue = 'Discount cannot exceed the service price.'
      }

      if (!productDetails.monthlyAdSpend || Number(productDetails.monthlyAdSpend) <= 0) {
        next.digitalSpend = 'Monthly ad spend must be greater than 0.'
      }

      if (productDetails.service === 'Social Media Management') {
        if (!Array.isArray(productDetails.socialPlatforms) || productDetails.socialPlatforms.length === 0) next.socialPlatforms = 'Select at least one social media platform.'
        if (!productDetails.socialStartDate && !productDetails.startDate) next.socialStartDate = 'Social media start date is required.'
        if (!productDetails.campaignGoal && !productDetails.campaignNotes) next.campaignGoal = 'Enter campaign goals or notes for social media management.'
      }

      if (productDetails.service === 'Paid Ads') {
        if (!Array.isArray(productDetails.paidAdPlatforms) || productDetails.paidAdPlatforms.length === 0) next.paidAdPlatforms = 'Select at least one paid advertising channel.'
        if (Array.isArray(productDetails.paidAdPlatforms) && productDetails.paidAdPlatforms.includes('Other Paid Ads') && !String(productDetails.otherPaidAdPlatform || '').trim()) next.otherPaidAdPlatform = 'Specify the other paid ad platform.'
        if (!productDetails.startDate) next.startDate = 'Paid ads start date is required.'
        if (!productDetails.targetAreas && !productDetails.targetLocations && !productDetails.demographicAge && !productDetails.demographicSex && !productDetails.demographicIncome) next.targetAreas = 'Provide at least one targeting or geographic field.'
      }

      if (productDetails.service === 'Website') {
        if (!productDetails.websiteOption) next.websiteOption = 'Website option is required.'
        if (!productDetails.websitePrimaryGoal) next.websitePrimaryGoal = 'Website goal is required.'
      }

      if (productDetails.service === 'Geofencing') {
        if (!productDetails.campaignType) next.campaignType = 'Geofencing campaign type is required.'
        if (!productDetails.monthlyAdSpend || Number(productDetails.monthlyAdSpend) <= 0) next.digitalSpend = 'Monthly ad spend must be greater than 0 for geofencing.'
        if (!productDetails.startDate) next.startDate = 'Geofencing start date is required.'
        if (!productDetails.targetAreas && !productDetails.targetLocations) next.targetAreas = 'Provide target areas or locations for geofencing.'
      }
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
            <PaymentFields
              paymentMethod={paymentMethod}
              paymentOtherMethod={paymentOtherMethod}
              paymentNotes={paymentNotes}
              onChange={setPaymentMethod}
              onOtherMethodChange={setPaymentOtherMethod}
              onNotesChange={setPaymentNotes}
            />
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
