import React from 'react'
import type { ProductDetails } from '@/types'

interface Props {
  details: ProductDetails
  onChange: (d: ProductDetails) => void
  errors?: Record<string, string>
}

export default function DigitalFields({ details, onChange, errors }: Props) {
  return (
    <div className="digital-fields">
      <h4>Digital details</h4>
      <label>Service</label>
      <select value={String(details.service || '')} onChange={e => onChange({ ...details, service: e.target.value })}>
        <option value="">Choose service</option>
        <option value="Social Ads">Social Ads</option>
        <option value="Paid Search">Paid Search</option>
        <option value="Geofencing">Geofencing</option>
        <option value="Website">Website</option>
        <option value="Other">Other</option>
      </select>
      {errors?.digitalService && <div className="field-error">{errors.digitalService}</div>}

      <label>Monthly ad spend</label>
      <input type="number" min="0" value={String(details.monthlyAdSpend || '')} onChange={e => onChange({ ...details, monthlyAdSpend: Number(e.target.value) || 0 })} />
      {errors?.digitalSpend && <div className="field-error">{errors.digitalSpend}</div>}

      <label>Social platforms (comma separated)</label>
      <textarea value={Array.isArray(details.socialPlatforms) ? details.socialPlatforms.join(', ') : String(details.socialPlatforms || '')} onChange={e => onChange({ ...details, socialPlatforms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} rows={2} />

      <label>Start date</label>
      <input type="date" value={String(details.startDate || '')} onChange={e => onChange({ ...details, startDate: e.target.value })} />
    </div>
  )
}
