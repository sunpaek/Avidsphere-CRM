import React from 'react'

interface Props {
  paymentMethod: string
  onChange: (method: string) => void
}

export default function PaymentFields({ paymentMethod, onChange }: Props) {
  return (
    <div className="payment-fields">
      <h4>Payment</h4>
      <label>Payment method</label>
      <select value={paymentMethod} onChange={e => onChange(e.target.value)}>
        <option>Invoice</option>
        <option>Credit Card</option>
        <option>Bank Transfer</option>
        <option>Check</option>
      </select>

      <label>Notes (payment)</label>
      <textarea placeholder="Optional payment notes" />
    </div>
  )
}
