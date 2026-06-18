import React from 'react'

interface Props {
  paymentMethod: string
  paymentOtherMethod: string
  onChange: (method: string) => void
  onOtherMethodChange: (value: string) => void
  otherMethodError?: string
}

export default function PaymentFields({ paymentMethod, paymentOtherMethod, onChange, onOtherMethodChange, otherMethodError }: Props) {
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
          {otherMethodError ? <span className="field-error">{otherMethodError}</span> : null}
        </>
      )}

    </div>
  )
}
