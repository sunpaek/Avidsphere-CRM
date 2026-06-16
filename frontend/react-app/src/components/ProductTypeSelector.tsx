import React from 'react'

interface Props {
  value: 'Mailer' | 'Print' | 'Digital'
  onChange: (v: 'Mailer' | 'Print' | 'Digital') => void
}

export default function ProductTypeSelector({ value, onChange }: Props) {
  return (
    <div className="product-type-selector">
      <label>Product Type</label>
      <div className="product-type-options">
        <label>
          <input type="radio" name="productType" checked={value === 'Mailer'} onChange={() => onChange('Mailer')} /> Mailer
        </label>
        <label>
          <input type="radio" name="productType" checked={value === 'Print'} onChange={() => onChange('Print')} /> Print
        </label>
        <label>
          <input type="radio" name="productType" checked={value === 'Digital'} onChange={() => onChange('Digital')} /> Digital
        </label>
      </div>
    </div>
  )
}
