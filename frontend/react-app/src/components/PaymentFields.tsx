import React from 'react'

interface Props {
  paymentMethod: string
  paymentOtherMethod: string
  paymentNotes: string
  onChange: (method: string) => void
  onOtherMethodChange: (value: string) => void
  onNotesChange: (value: string) => void
}

export default function PaymentFields({ paymentMethod, paymentOtherMethod, paymentNotes, onChange, onOtherMethodChange, onNotesChange }: Props) {
  return (
    <div className="payment-fields">
      <h4>Payment</h4>
      <label>Payment method</label>
      <select value={paymentMethod} onChange={e => onChange(e.target.value)}>
        <option value="">Select payment method</option>
        <option value="ACH">ACH</option>
        <option value="Credit Card">Credit Card</option>
        <option value="Debit Card">Debit Card</option>
        <option value="Check">Check</option>
        <option value="Cash">Cash</option>
        <option value="Invoice">Invoice</option>
        <option value="Other">Other</option>
      </select>

      {paymentMethod === 'Other' && (
        <>
          <label>Other payment method</label>
          <input type="text" value={paymentOtherMethod} onChange={e => onOtherMethodChange(e.target.value)} placeholder="Specify payment method" />
        </>
      )}

      <label>Notes (payment)</label>
      <textarea value={paymentNotes} onChange={e => onNotesChange(e.target.value)} placeholder="Optional payment notes" rows={3} />
    </div>
  )
}
