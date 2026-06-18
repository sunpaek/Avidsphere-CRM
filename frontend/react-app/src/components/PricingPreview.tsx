import React from 'react'
import type { ProductDetails } from '@/types'

interface MailerPricing {
  monthlyRate: number
  subtotal: number
  discountType: 'None' | 'Dollar Amount' | 'Percentage'
  discountValue: number
  discountAmount: number
  designFee: number
  designChange: number
  total: number
}

interface Props {
  details: ProductDetails
  paymentMethod: string
  saleCategory: 'Mailer' | 'Print' | 'Digital'
  mailerPricing?: MailerPricing
}

export default function PricingPreview({ details, saleCategory, mailerPricing }: Props) {
  if (saleCategory === 'Mailer') {
    const p = mailerPricing || { monthlyRate: 0, subtotal: 0, discountType: 'None' as const, discountValue: 0, discountAmount: 0, designFee: 0, designChange: 0, total: 0 }
    return (
      <div className="pricing-preview pricing-card">
        <p className="section-label">Pricing Summary</p>
        <div><strong>Base Price</strong><span>${p.monthlyRate.toFixed(2)}</span></div>
        {p.discountType !== 'None' && (
          <>
            <div><strong>Discount</strong><span>-${p.discountAmount.toFixed(2)}</span></div>
          </>
        )}
        <div><strong>Design Required Fee</strong><span>${p.designFee.toFixed(2)}</span></div>
        <div><strong>Design Change Fee</strong><span>${p.designChange.toFixed(2)}</span></div>
        <div className="pricing-total"><strong>Total</strong><span>${p.total.toFixed(2)}</span></div>
      </div>
    )
  }

  if (saleCategory === 'Print') {
    const projectPrice = Number(details.projectPrice || 0)
    const designFee = Number(details.designFee || 0)
    const discountType = String(details.discountType || 'None')
    const discountValue = Number(details.discountValue || 0)
    let discountAmount = 0

    if (discountType === 'Dollar Amount') {
      discountAmount = Math.min(discountValue, projectPrice)
    } else if (discountType === 'Percentage') {
      discountAmount = Math.min(projectPrice * (discountValue / 100), projectPrice)
    }
    if (discountAmount < 0) discountAmount = 0

    const total = Math.max(projectPrice + designFee - discountAmount, 0)

    return (
      <div className="pricing-preview">
        <h4>Print pricing preview</h4>
        <div><strong>Project price:</strong> ${projectPrice.toFixed(2)}</div>
        <div><strong>Design fee:</strong> ${designFee.toFixed(2)}</div>
        {discountType !== 'None' && (
          <>
            <div><strong>Discount:</strong> {discountType} ({discountValue}{discountType === 'Percentage' ? '%' : ''})</div>
            <div><strong>Discount amount:</strong> ${discountAmount.toFixed(2)}</div>
          </>
        )}
        <div className="pricing-total"><strong>Total investment:</strong> ${total.toFixed(2)}</div>
        <p className="muted">Calculated using project price, design fee, and discount values.</p>
      </div>
    )
  }

  if (saleCategory === 'Digital') {
    const servicePrice = Number(details.servicePrice || 0)
    const discountType = String(details.discountType || 'None')
    const discountValue = Number(details.discountValue || 0)
    let discountAmount = 0

    if (discountType === 'Dollar Amount') {
      discountAmount = Math.min(discountValue, servicePrice)
    } else if (discountType === 'Percentage') {
      discountAmount = Math.min(servicePrice * (discountValue / 100), servicePrice)
    }
    if (discountAmount < 0) discountAmount = 0

    const total = Math.max(servicePrice - discountAmount, 0)
    const monthlyAdSpend = Number(details.monthlyAdSpend || 0)

    return (
      <div className="pricing-preview">
        <h4>Digital pricing preview</h4>
        <div><strong>Service price:</strong> ${servicePrice.toFixed(2)}</div>
        <div><strong>Discount:</strong> {discountType} {discountType !== 'None' ? `(${discountValue})` : ''}</div>
        <div><strong>Discount amount:</strong> ${discountAmount.toFixed(2)}</div>
        <div><strong>Total investment:</strong> ${total.toFixed(2)}</div>
        {monthlyAdSpend > 0 && <div><strong>Monthly ad spend:</strong> ${monthlyAdSpend.toFixed(2)}</div>}
        <p className="muted">Digital pricing preview is based on service price and discount values.</p>
      </div>
    )
  }

  return null
}
