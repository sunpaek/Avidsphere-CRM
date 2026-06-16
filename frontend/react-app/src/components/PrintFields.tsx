import React from 'react'
import type { ProductDetails } from '@/types'

interface Props {
  details: ProductDetails
  onChange: (d: ProductDetails) => void
  errors?: Record<string, string>
}

const PRINT_TYPES = [
  'BANNERS', 'BROCHURES', 'BUSINESS CARDS', 'CARBONLESS FORMS', 'DOOR HANGERS', 'FLYERS', 'GIFT CERTIFICATES',
  'GREETING CARDS', 'LABELS', 'LETTERHEAD', 'MAGNETS', 'MENUS', 'POSTCARDS', 'BULK POSTERS', 'PRESENTATION FOLDERS',
  'RACK CARDS', 'YARD SIGNS', 'TABLE TENTS', 'POUCHES', 'CUSTOM BOXES', 'NOTE PADS', 'ENVELOPES', 'CATALOGS', 'BOOKLETS', 'OTHER'
]
const FINISH_OPTIONS = ['Uncoated', 'Matte', 'Gloss', 'High Gloss UV', 'Other']
const THICKNESS_OPTIONS = ['70lb Uncoated', '80lb', '100lb', '10pt', '14pt', '16pt', '17pt', 'Other']
const MAILING_OPTIONS = ['Standard', 'First Class', 'Presorted']

export default function PrintFields({ details, onChange, errors }: Props) {
  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v })
  const printService = String(details.printType || '')
  const mailingRequired = Boolean(details.needsMailing)
  const finishValue = String(details.finish || '')
  const thicknessValue = String(details.thickness || '')

  return (
    <div className="print-fields">
      <h4>Print details</h4>

      <label>Print service</label>
      <select value={printService} onChange={e => set('printType', e.target.value)}>
        <option value="">Select print service</option>
        {PRINT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
      </select>
      {errors?.printType && <div className="field-error">{errors.printType}</div>}

      <label>Quantity</label>
      <input type="number" min={1} value={String(details.quantity || '')} onChange={e => set('quantity', Number(e.target.value) || '')} />
      {errors?.printQuantity && <div className="field-error">{errors.printQuantity}</div>}

      <label>Size</label>
      <input value={String(details.size || '')} onChange={e => set('size', e.target.value)} placeholder="Example: 8.5x11" />
      {errors?.printSize && <div className="field-error">{errors.printSize}</div>}

      <label>Finish</label>
      <select value={finishValue} onChange={e => set('finish', e.target.value)}>
        <option value="">Select finish</option>
        {FINISH_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      {errors?.printFinish && <div className="field-error">{errors.printFinish}</div>}

      {finishValue === 'Other' && (
        <>
          <label>Other finish</label>
          <input value={String(details.otherFinish || '')} onChange={e => set('otherFinish', e.target.value)} placeholder="Specify finish" />
        </>
      )}

      <label>Thickness</label>
      <select value={thicknessValue} onChange={e => set('thickness', e.target.value)}>
        <option value="">Select thickness</option>
        {THICKNESS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      {errors?.printThickness && <div className="field-error">{errors.printThickness}</div>}

      {thicknessValue === 'Other' && (
        <>
          <label>Other thickness</label>
          <input value={String(details.otherThickness || '')} onChange={e => set('otherThickness', e.target.value)} placeholder="Specify thickness" />
        </>
      )}

      <label>Fold</label>
      <input value={String(details.fold || '')} onChange={e => set('fold', e.target.value)} placeholder="e.g. Half Fold, Tri-Fold, Z Fold" />

      <label>Is mailing required?</label>
      <div role="group" aria-label="mailing-required" className="radio-group">
        <label>
          <input type="radio" name="needsMailing" checked={mailingRequired} onChange={() => set('needsMailing', true)} /> Yes
        </label>
        <label>
          <input type="radio" name="needsMailing" checked={!mailingRequired} onChange={() => set('needsMailing', false)} /> No
        </label>
      </div>

      {mailingRequired && (
        <>
          <label>Mailing option</label>
          <select value={String(details.mailingOption || '')} onChange={e => set('mailingOption', e.target.value)}>
            <option value="">Choose mailing option</option>
            {MAILING_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          {errors?.printMailing && <div className="field-error">{errors.printMailing}</div>}
        </>
      )}

      <label>Notes / description</label>
      <textarea value={String(details.description || '')} onChange={e => set('description', e.target.value)} rows={3} />

      <h4 style={{ marginTop: '1.5rem' }}>Pricing</h4>

      <label>Project Price</label>
      <input type="number" min={0} step="0.01" value={String(details.projectPrice || '')} onChange={e => set('projectPrice', Number(e.target.value) || 0)} placeholder="0.00" />
      {errors?.printProjectPrice && <div className="field-error">{errors.printProjectPrice}</div>}

      <label>Design Fee</label>
      <input type="number" min={0} step="0.01" value={String(details.designFee || '')} onChange={e => set('designFee', Number(e.target.value) || 0)} placeholder="0.00" />
      {errors?.printDesignFee && <div className="field-error">{errors.printDesignFee}</div>}

      <label>Discount Type</label>
      <select value={String(details.discountType || 'None')} onChange={e => set('discountType', e.target.value)}>
        <option value="None">None</option>
        <option value="Dollar Amount">Dollar Amount</option>
        <option value="Percentage">Percentage</option>
      </select>

      {String(details.discountType || 'None') !== 'None' && (
        <>
          <label>Discount Value</label>
          <input type="number" min={0} step="0.01" value={String(details.discountValue || '')} onChange={e => set('discountValue', Number(e.target.value) || 0)} placeholder="0.00" />
          {errors?.printDiscountValue && <div className="field-error">{errors.printDiscountValue}</div>}
        </>
      )}

      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0f0f0', borderRadius: '0.375rem' }}>
        <strong>Total Investment: ${calculatePrintTotal(details).toFixed(2)}</strong>
      </div>
    </div>
  )
}

function calculatePrintTotal(details: ProductDetails): number {
  const base = Number(details.projectPrice || 0)
  const designFee = Number(details.designFee || 0)
  const discountType = String(details.discountType || 'None')
  const discountValue = Number(details.discountValue || 0)

  let discountAmount = 0
  if (discountType === 'Dollar Amount') {
    discountAmount = Math.min(discountValue, base)
  } else if (discountType === 'Percentage') {
    discountAmount = Math.min(base * (discountValue / 100), base)
  }

  if (discountAmount < 0) discountAmount = 0
  const total = Math.max(base + designFee - discountAmount, 0)
  return total
}
