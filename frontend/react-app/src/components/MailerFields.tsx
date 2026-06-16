import React from 'react'
import type { ProductDetails } from '@/types'

interface Props {
  details: ProductDetails
  onChange: (d: ProductDetails) => void
  errors?: Record<string, string>
}

export default function MailerFields({ details, onChange, errors }: Props) {
  return (
    <div className="mailer-fields">
      <h4>Mailer details</h4>
      <label>Mailer area</label>
      <input value={String(details.mailerArea || '')} onChange={e => onChange({ ...details, mailerArea: e.target.value })} />
      {errors?.mailerArea && <div className="field-error">{errors.mailerArea}</div>}

      <label>Month</label>
      <select value={String(details.month || '')} onChange={e => onChange({ ...details, month: e.target.value })}>
        <option value="">Select month</option>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="April">April</option>
        <option value="May">May</option>
        <option value="June">June</option>
        <option value="July">July</option>
        <option value="August">August</option>
        <option value="September">September</option>
        <option value="October">October</option>
        <option value="November">November</option>
        <option value="December">December</option>
      </select>
      {errors?.mailerMonth && <div className="field-error">{errors.mailerMonth}</div>}

      <label>Run time (months)</label>
      <input type="number" min="1" value={String(details.mailerRunTime || '')} onChange={e => onChange({ ...details, mailerRunTime: Number(e.target.value) || 0 })} />
      {errors?.mailerRunTime && <div className="field-error">{errors.mailerRunTime}</div>}

      <label>Ad size</label>
      <select value={String(details.adSize || '')} onChange={e => onChange({ ...details, adSize: e.target.value })}>
        <option value="">Select size</option>
        <option value="3x4">3x4</option>
        <option value="3x8">3x8</option>
        <option value="3x12">3x12</option>
        <option value="4x6">4x6</option>
        <option value="4x9">4x9</option>
      </select>
      {errors?.adSize && <div className="field-error">{errors.adSize}</div>}

      <label>
        <input type="checkbox" checked={String(details.designRequired || '').toLowerCase() === 'yes'} onChange={e => onChange({ ...details, designRequired: e.target.checked ? 'Yes' : 'No' })} /> Design required
      </label>
      <label>
        <input type="checkbox" checked={String(details.designChangeRequired || '').toLowerCase() === 'yes'} onChange={e => onChange({ ...details, designChangeRequired: e.target.checked ? 'Yes' : 'No' })} /> Design change required
      </label>
    </div>
  )
}
