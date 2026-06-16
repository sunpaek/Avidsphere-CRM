import React from 'react'
import type { ProductDetails } from '@/types'

interface Props {
  details: ProductDetails
  onChange: (d: ProductDetails) => void
  errors?: Record<string, string>
}

const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Snapchat', 'LinkedIn', 'X (Twitter)']
const PAID_AD_PLATFORMS = ['Meta Ads', 'Google Ads', 'YouTube Ads', 'TikTok Ads', 'Snapchat Ads', 'LinkedIn Ads', 'Other Paid Ads']
const GEOFENCE_CAMPAIGNS = ['Static Display', 'Smart TV', 'Video']
const WEBSITE_OPTIONS = ['New Build', 'Redo Current Site', 'Landing Pages']
const DISCOUNT_TYPES = ['None', 'Dollar Amount', 'Percentage']

function toggleArrayValue(values: string[] = [], value: string) {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value]
}

export default function DigitalFields({ details, onChange, errors }: Props) {
  const service = String(details.service || '')
  const socialPlatforms = Array.isArray(details.socialPlatforms) ? details.socialPlatforms : []
  const paidAdPlatforms = Array.isArray(details.paidAdPlatforms) ? details.paidAdPlatforms : []

  const set = (k: string, v: unknown) => onChange({ ...details, [k]: v })

  return (
    <div className="digital-fields">
      <h4>Digital details</h4>

      <label>Service</label>
      <select value={service} onChange={e => set('service', e.target.value)}>
        <option value="">Choose service</option>
        <option value="Social Media Management">Social Media Management</option>
        <option value="Paid Ads">Paid Ads</option>
        <option value="Geofencing">Geofencing</option>
        <option value="Website">Website</option>
        <option value="Other">Other</option>
      </select>
      {errors?.digitalService && <div className="field-error">{errors.digitalService}</div>}

      <label>Service price</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={details.servicePrice != null ? String(details.servicePrice) : ''}
        onChange={e => set('servicePrice', Number(e.target.value) || 0)}
      />
      {errors?.digitalServicePrice && <div className="field-error">{errors.digitalServicePrice}</div>}

      <label>Discount type</label>
      <select value={String(details.discountType || 'None')} onChange={e => set('discountType', e.target.value)}>
        {DISCOUNT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
      </select>

      {details.discountType && details.discountType !== 'None' && (
        <>
          <label>Discount value</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={details.discountValue != null ? String(details.discountValue) : ''}
            onChange={e => set('discountValue', Number(e.target.value) || 0)}
          />
          {errors?.discountValue && <div className="field-error">{errors.discountValue}</div>}
        </>
      )}

      <label>Monthly ad spend</label>
      <input
        type="number"
        min="0"
        value={String(details.monthlyAdSpend != null ? details.monthlyAdSpend : '')}
        onChange={e => set('monthlyAdSpend', Number(e.target.value) || 0)}
      />
      {errors?.digitalSpend && <div className="field-error">{errors.digitalSpend}</div>}

      {service === 'Social Media Management' && (
        <>
          <label>Social platforms</label>
          <div className="checkbox-grid">
            {SOCIAL_PLATFORMS.map(platform => (
              <label key={platform} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={socialPlatforms.includes(platform)}
                  onChange={() => set('socialPlatforms', toggleArrayValue(socialPlatforms, platform))}
                />
                {platform}
              </label>
            ))}
          </div>
          {errors?.socialPlatforms && <div className="field-error">{errors.socialPlatforms}</div>}

          <label>Social usernames</label>
          <textarea
            value={String(details.socialUsernames || '')}
            onChange={e => set('socialUsernames', e.target.value)}
            placeholder="Example: Facebook: @handle, Instagram: @handle"
            rows={2}
          />

          <label>Start date</label>
          <input type="date" value={String(details.socialStartDate || details.startDate || '')} onChange={e => set('socialStartDate', e.target.value)} />
          {errors?.socialStartDate && <div className="field-error">{errors.socialStartDate}</div>}

          <label>Campaign goals</label>
          <textarea value={String(details.campaignGoal || '')} onChange={e => set('campaignGoal', e.target.value)} rows={2} />
          <label>Campaign notes</label>
          <textarea value={String(details.campaignNotes || '')} onChange={e => set('campaignNotes', e.target.value)} rows={2} />
          {errors?.campaignGoal && <div className="field-error">{errors.campaignGoal}</div>}
        </>
      )}

      {service === 'Paid Ads' && (
        <>
          <label>Paid ad platforms</label>
          <div className="checkbox-grid">
            {PAID_AD_PLATFORMS.map(platform => (
              <label key={platform} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={paidAdPlatforms.includes(platform)}
                  onChange={() => set('paidAdPlatforms', toggleArrayValue(paidAdPlatforms, platform))}
                />
                {platform}
              </label>
            ))}
          </div>
          {errors?.paidAdPlatforms && <div className="field-error">{errors.paidAdPlatforms}</div>}

          {paidAdPlatforms.includes('Other Paid Ads') && (
            <>
              <label>Other paid ad platform</label>
              <input type="text" value={String(details.otherPaidAdPlatform || '')} onChange={e => set('otherPaidAdPlatform', e.target.value)} placeholder="Specify platform" />
              {errors?.otherPaidAdPlatform && <div className="field-error">{errors.otherPaidAdPlatform}</div>}
            </>
          )}

          <label>Targeting / geographic areas</label>
          <input type="text" value={String(details.targetAreas || '')} onChange={e => set('targetAreas', e.target.value)} placeholder="Cities, counties, regions" />

          <label>Target specific locations</label>
          <input type="text" value={String(details.targetLocations || '')} onChange={e => set('targetLocations', e.target.value)} placeholder="Specific venues, neighborhoods" />

          <label>Demographic targeting</label>
          <div className="filter-grid">
            <label>Age range<input type="text" value={String(details.demographicAge || '')} onChange={e => set('demographicAge', e.target.value)} placeholder="e.g. 25-45" /></label>
            <label>Gender<input type="text" value={String(details.demographicSex || '')} onChange={e => set('demographicSex', e.target.value)} placeholder="e.g. All, Female, Male" /></label>
            <label>Income<input type="text" value={String(details.demographicIncome || '')} onChange={e => set('demographicIncome', e.target.value)} placeholder="e.g. $45k+" /></label>
          </div>

          <label>Start date</label>
          <input type="date" value={String(details.startDate || '')} onChange={e => set('startDate', e.target.value)} />
          <label>Campaign goals</label>
          <textarea value={String(details.campaignGoal || '')} onChange={e => set('campaignGoal', e.target.value)} rows={2} />
          <label>Campaign notes</label>
          <textarea value={String(details.campaignNotes || '')} onChange={e => set('campaignNotes', e.target.value)} rows={2} />
          {errors?.campaignGoal && <div className="field-error">{errors.campaignGoal}</div>}
        </>
      )}

      {service === 'Geofencing' && (
        <>
          <label>Campaign type</label>
          <select value={String(details.campaignType || '')} onChange={e => set('campaignType', e.target.value)}>
            <option value="">Select campaign type</option>
            {GEOFENCE_CAMPAIGNS.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          {errors?.campaignType && <div className="field-error">{errors.campaignType}</div>}

          <label>Target geographic areas</label>
          <input type="text" value={String(details.targetAreas || '')} onChange={e => set('targetAreas', e.target.value)} placeholder="Cities, counties, regions" />

          <label>Target specific locations</label>
          <input type="text" value={String(details.targetLocations || '')} onChange={e => set('targetLocations', e.target.value)} placeholder="Specific venues, neighborhoods" />

          <label>Demographic targeting</label>
          <div className="filter-grid">
            <label>Age range<input type="text" value={String(details.demographicAge || '')} onChange={e => set('demographicAge', e.target.value)} placeholder="e.g. 25-45" /></label>
            <label>Gender<input type="text" value={String(details.demographicSex || '')} onChange={e => set('demographicSex', e.target.value)} placeholder="e.g. All, Female, Male" /></label>
            <label>Income<input type="text" value={String(details.demographicIncome || '')} onChange={e => set('demographicIncome', e.target.value)} placeholder="e.g. $45k+" /></label>
          </div>

          <label>Monthly ad spend</label>
          <input type="number" min="0" step="1" value={String(details.monthlyAdSpend || '')} onChange={e => set('monthlyAdSpend', Number(e.target.value) || 0)} />

          <label>Start date</label>
          <input type="date" value={String(details.startDate || '')} onChange={e => set('startDate', e.target.value)} />
          {errors?.startDate && <div className="field-error">{errors.startDate}</div>}

          <label>Campaign goals</label>
          <textarea value={String(details.campaignGoal || '')} onChange={e => set('campaignGoal', e.target.value)} rows={2} />
          <label>Campaign notes</label>
          <textarea value={String(details.campaignNotes || '')} onChange={e => set('campaignNotes', e.target.value)} rows={2} />
        </>
      )}

      {service === 'Website' && (
        <>
          <label>Website option</label>
          <select value={String(details.websiteOption || '')} onChange={e => set('websiteOption', e.target.value)}>
            <option value="">Select option</option>
            {WEBSITE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
          {errors?.websiteOption && <div className="field-error">{errors.websiteOption}</div>}

          <label>Current website / URL</label>
          <input type="text" value={String(details.websiteUrl || '')} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://example.com" />

          <label>Landing page / conversion URL</label>
          <input type="text" value={String(details.landingPageUrl || '')} onChange={e => set('landingPageUrl', e.target.value)} placeholder="https://example.com/landing" />

          <label>Desired website / goals</label>
          <input type="text" value={String(details.websitePrimaryGoal || '')} onChange={e => set('websitePrimaryGoal', e.target.value)} placeholder="Lead gen, e-commerce, information" />
          {errors?.websitePrimaryGoal && <div className="field-error">{errors.websitePrimaryGoal}</div>}

          <label>Pages</label>
          <input type="text" value={String(details.pages || '')} onChange={e => set('pages', e.target.value)} placeholder="Home, About, Contact" />

          <label>Project notes</label>
          <textarea value={String(details.campaignNotes || '')} onChange={e => set('campaignNotes', e.target.value)} rows={2} />
        </>
      )}

      {service === 'Other' && (
        <>
          <label>Service notes</label>
          <textarea value={String(details.campaignNotes || details.description || '')} onChange={e => set('campaignNotes', e.target.value)} rows={3} />
        </>
      )}
    </div>
  )
}
