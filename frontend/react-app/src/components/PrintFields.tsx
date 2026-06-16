import React from 'react'
import type { ProductDetails } from '@/types'

interface Props {
  details: ProductDetails
  onChange: (d: ProductDetails) => void
  errors?: Record<string, string>
}

export default function PrintFields({ details, onChange, errors }: Props) {
  return (
    <div className="print-fields">
      <h4>Print details</h4>
      <label>Print type</label>
      <select value={String(details.printType || '')} onChange={e => onChange({ ...details, printType: e.target.value })}>
        <option value="">Choose print type</option>
        <option value="Flyer">Flyer</option>
        <option value="Brochure">Brochure</option>
        <option value="Business Card">Business Card</option>
        <option value="Poster">Poster</option>
        <option value="Other">Other</option>
      </select>
      {errors?.printType && <div className="field-error">{errors.printType}</div>}

      <label>Quantity</label>
      <input type="number" min="1" value={String(details.quantity || '')} onChange={e => onChange({ ...details, quantity: Number(e.target.value) || 0 })} />
      {errors?.printQuantity && <div className="field-error">{errors.printQuantity}</div>}

      <label>Size</label>
      <input value={String(details.size || '')} onChange={e => onChange({ ...details, size: e.target.value })} />

      <label>Description</label>
      <textarea value={String(details.description || '')} onChange={e => onChange({ ...details, description: e.target.value })} rows={3} />

      <label>Design fee</label>
      <input type="number" min="0" value={String(details.design_fee || details.designFee || '')} onChange={e => onChange({ ...details, designFee: Number(e.target.value) || 0 })} />
    </div>
  )
}
