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
const FOLD_OPTIONS = ['None', 'Half Fold', 'Tri-Fold', 'Z Fold', 'Gate Fold', 'Accordion Fold', 'Other']
const FOLD_APPLICABLE_TYPES = new Set(['BROCHURES', 'FLYERS', 'GREETING CARDS', 'MENUS', 'TABLE TENTS', 'CATALOGS', 'BOOKLETS'])
export default function PrintFields({ details, onChange, errors }: Props) {
  const set = (key: string, value: unknown) => onChange({ ...details, [key]: value })
  const printService = String(details.printType || '')
  const finishValue = String(details.finish || '')
  const thicknessValue = String(details.thickness || '')
  const foldApplies = FOLD_APPLICABLE_TYPES.has(printService) || Boolean(details.fold)
  const mailingRequired = Boolean(details.needsMailing)
  const designRequired = String(details.designRequired || '').toLowerCase() === 'yes'
  const designChangeRequired = String(details.designChangeRequired || '').toLowerCase() === 'yes'

  return (
    <div className="print-fields product-field-groups">
      <section className="product-field-section">
        <div className="product-field-heading">
          <span>1</span>
          <div><h4>Print Project Details</h4><p>What is being produced and how many are needed.</p></div>
        </div>
        <div className="compact-field-grid">
          <label>Print service / type
            <select value={printService} onChange={event => set('printType', event.target.value)}>
              <option value="">Select print service</option>
              {PRINT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors?.printType && <span className="field-error">{errors.printType}</span>}
          </label>
          <label>Quantity
            <input type="number" min={1} value={String(details.quantity || '')} onChange={event => set('quantity', Number(event.target.value) || '')} placeholder="Example: 5000" />
            {errors?.printQuantity && <span className="field-error">{errors.printQuantity}</span>}
          </label>
        </div>
      </section>

      <section className="product-field-section">
        <div className="product-field-heading">
          <span>2</span>
          <div><h4>Specs</h4><p>Production-ready size, stock, finish, and folding selections.</p></div>
        </div>
        <div className="compact-field-grid">
          <label>Finished size
            <input value={String(details.size || '')} onChange={event => set('size', event.target.value)} placeholder="Example: 8.5 × 11 in" />
            {errors?.printSize && <span className="field-error">{errors.printSize}</span>}
          </label>
          <label>Finish
            <select value={finishValue} onChange={event => set('finish', event.target.value)}>
              <option value="">Select finish</option>
              {FINISH_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors?.printFinish && <span className="field-error">{errors.printFinish}</span>}
          </label>
          {finishValue === 'Other' && (
            <label>Custom finish
              <input value={String(details.otherFinish || '')} onChange={event => set('otherFinish', event.target.value)} placeholder="Specify finish" />
            </label>
          )}
          <label>Paper / material thickness
            <select value={thicknessValue} onChange={event => set('thickness', event.target.value)}>
              <option value="">Select thickness</option>
              {THICKNESS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
            {errors?.printThickness && <span className="field-error">{errors.printThickness}</span>}
          </label>
          {thicknessValue === 'Other' && (
            <label>Custom thickness
              <input value={String(details.otherThickness || '')} onChange={event => set('otherThickness', event.target.value)} placeholder="Specify stock or material" />
            </label>
          )}
          {foldApplies && (
            <label>Fold
              <select value={String(details.fold || '')} onChange={event => set('fold', event.target.value)}>
                <option value="">Select fold</option>
                {FOLD_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
              {errors?.printFold && <span className="field-error">{errors.printFold}</span>}
            </label>
          )}
        </div>
      </section>

      <section className="product-field-section">
        <div className="product-field-heading">
          <span>3</span>
          <div><h4>Mailing &amp; Artwork</h4><p>Confirm fulfillment and whether artwork is ready for production.</p></div>
        </div>
        <div className="print-fulfillment-row">
          <fieldset className="compact-choice-group">
            <legend>Mailing required?</legend>
            <div className="radio-group">
              <label><input type="radio" name="printMailingRequired" checked={mailingRequired} onChange={() => set('needsMailing', true)} /> Yes</label>
              <label><input type="radio" name="printMailingRequired" checked={!mailingRequired} onChange={() => onChange({ ...details, needsMailing: false, mailingOption: undefined })} /> No</label>
            </div>
          </fieldset>
          <fieldset className="compact-choice-group">
            <legend>Artwork</legend>
            <div className="checkbox-stack">
              <label className="checkbox-label">
                <input type="checkbox" checked={designRequired} onChange={event => set('designRequired', event.target.checked ? 'Yes' : 'No')} />
                Design needed
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={designChangeRequired} onChange={event => set('designChangeRequired', event.target.checked ? 'Yes' : 'No')} />
                Design changes needed
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <section className="product-field-section">
        <div className="product-field-heading">
          <span>4</span>
          <div><h4>Pricing</h4><p>Enter the quoted production and design amounts.</p></div>
        </div>
        <div className="compact-field-grid">
          <label>Project price
            <input type="number" min={0} step="0.01" value={String(details.projectPrice || '')} onChange={event => set('projectPrice', Number(event.target.value) || 0)} placeholder="0.00" />
            {errors?.printProjectPrice && <span className="field-error">{errors.printProjectPrice}</span>}
          </label>
          {(designRequired || designChangeRequired || Number(details.designFee || 0) > 0) && (
            <label>Artwork / design fee
              <input type="number" min={0} step="0.01" value={String(details.designFee || '')} onChange={event => set('designFee', Number(event.target.value) || 0)} placeholder="0.00" />
              {errors?.printDesignFee && <span className="field-error">{errors.printDesignFee}</span>}
            </label>
          )}
          <label>Discount type
            <select value={String(details.discountType || 'None')} onChange={event => set('discountType', event.target.value)}>
              <option value="None">None</option>
              <option value="Dollar Amount">Dollar Amount</option>
              <option value="Percentage">Percentage</option>
            </select>
          </label>
          {String(details.discountType || 'None') !== 'None' && (
            <label>Discount value
              <input type="number" min={0} step="0.01" value={String(details.discountValue || '')} onChange={event => set('discountValue', Number(event.target.value) || 0)} placeholder="0.00" />
              {errors?.printDiscountValue && <span className="field-error">{errors.printDiscountValue}</span>}
            </label>
          )}
        </div>
      </section>
    </div>
  )
}
