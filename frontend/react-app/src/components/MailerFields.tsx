import type { ProductDetails } from '@/types'

interface Props {
  details: ProductDetails
  onChange: (d: ProductDetails) => void
  errors?: Record<string, string>
}

const MAILER_AREAS = [
  '17601', '17602', '17603', 'Blandon', 'Denver', 'Elizabethtown', 'Ephrata', 'Hershey', 'Lebanon', 'Lititz',
  'Manheim', 'Manheim Twp', 'Millersville', 'Muhlenberg', 'Myerstown', 'New Holland', 'Palmyra', 'Shillington',
  'Sinking Spring', 'Willow Street'
]

export default function MailerFields({ details, onChange, errors }: Props) {
  return (
    <div className="conditional-product-group mailer-fields">
      <p className="section-label">Mailer details</p>

      <div className="mailer-top-grid">
        <label>Mailer Area
          <select value={String(details.mailerArea || '')} onChange={e => onChange({ ...details, mailerArea: e.target.value })}>
            <option value="">Select area</option>
            {MAILER_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
          {errors?.mailerArea && <span className="field-error">{errors.mailerArea}</span>}
        </label>

        <label>Start Month
          <select value={String(details.month || '')} onChange={e => onChange({ ...details, month: e.target.value })}>
            <option value="">Select month</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
              .map(month => <option key={month} value={month}>{month}</option>)}
          </select>
          {errors?.mailerMonth && <span className="field-error">{errors.mailerMonth}</span>}
        </label>

        <label>Run Time (Months)
          <select value={String(details.mailerRunTime || '')} onChange={e => onChange({ ...details, mailerRunTime: Number(e.target.value) || 0 })}>
            <option value="">Select runtime</option>
            {[...Array(12)].map((_, idx) => {
              const value = idx + 1
              return <option key={value} value={value}>{value}</option>
            })}
          </select>
          {errors?.mailerRunTime && <span className="field-error">{errors.mailerRunTime}</span>}
        </label>
      </div>

      <label className="mailer-adsize-row">Ad Size
        <select value={String(details.adSize || '')} onChange={e => onChange({ ...details, adSize: e.target.value })}>
          <option value="">Select size</option>
          <option value="3x4">3x4</option>
          <option value="3x8">3x8</option>
          <option value="3x12">3x12</option>
          <option value="4x6">4x6</option>
          <option value="4x9">4x9</option>
        </select>
        {errors?.adSize && <span className="field-error">{errors.adSize}</span>}
      </label>

      <div className="design-fieldset">
        <label className="checkbox-label">
          <input type="checkbox" checked={String(details.designRequired || '').toLowerCase() === 'yes'} onChange={e => onChange({ ...details, designRequired: e.target.checked ? 'Yes' : 'No' })} />
          Design Required (+$30)
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={String(details.designChangeRequired || '').toLowerCase() === 'yes'} onChange={e => onChange({ ...details, designChangeRequired: e.target.checked ? 'Yes' : 'No' })} />
          Design Change (+$15)
        </label>
      </div>

      <div className="discount-controls">
        <label>Discount Type
          <select value={String(details.discountType || 'None')} onChange={e => onChange({ ...details, discountType: e.target.value as 'None' | 'Dollar Amount' | 'Percentage' })}>
            <option value="None">None</option>
            <option value="Dollar Amount">Dollar Amount</option>
            <option value="Percentage">Percentage</option>
          </select>
        </label>
        <label>Discount Value
          <input
            type="number"
            value={details.discountValue ?? ''}
            min="0"
            step="0.01"
            disabled={String(details.discountType || 'None') === 'None'}
            onChange={e => onChange({ ...details, discountValue: Number(e.target.value) || 0 })}
            placeholder="0"
          />
          {errors?.discountValue && <span className="field-error">{errors.discountValue}</span>}
        </label>
      </div>
    </div>
  )
}
