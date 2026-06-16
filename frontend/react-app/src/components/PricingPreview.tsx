import React from 'react'
import type { ProductDetails } from '@/types'

interface MailerPricing {
  monthlyRate: number
  subtotal: number
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
    const p = mailerPricing || { monthlyRate: 0, subtotal: 0, designFee: 0, designChange: 0, total: 0 }
    return (
      <div className="pricing-preview">
        <h4>Mailer pricing preview</h4>
        <div><strong>Monthly rate:</strong> ${p.monthlyRate.toFixed(2)}</div>
        <div><strong>Run-time subtotal:</strong> ${p.subtotal.toFixed(2)}</div>
        <div><strong>Design fee:</strong> ${p.designFee.toFixed(2)}</div>
        <div><strong>Design change fee:</strong> ${p.designChange.toFixed(2)}</div>
        <div className="pricing-total"><strong>Total:</strong> ${p.total.toFixed(2)}</div>
        <p className="muted">Calculated client-side using size &amp; run-time constants.</p>
      </div>
    )
  }

  // Generic placeholder for other categories
  const subtotal = Number((details.projectPrice || details.totalInvestment || 0) as number) || 0
  return (
    <div className="pricing-preview">
      <h4>Pricing preview</h4>
      <div><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</div>
      <p className="muted">Pricing preview for this product type is not implemented yet.</p>
    </div>
  )
}
