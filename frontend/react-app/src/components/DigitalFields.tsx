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
  const set = (key: string, value: unknown) => onChange({ ...details, [key]: value })
  const showAdSpend = service === 'Paid Ads' || service === 'Geofencing'

  return (
    <div className="digital-fields product-field-groups">
      <section className="product-field-section">
        <div className="product-field-heading">
          <span>1</span>
          <div><h4>Digital Service</h4><p>Select the service being sold.</p></div>
        </div>
        <div className="compact-field-grid">
          <label>Service
            <select value={service} onChange={event => set('service', event.target.value)}>
              <option value="">Choose service</option>
              <option value="Social Media Management">Social Media Management</option>
              <option value="Paid Ads">Paid Ads</option>
              <option value="Geofencing">Geofencing</option>
              <option value="Website">Website</option>
              <option value="Other">Other</option>
            </select>
            {errors?.digitalService && <span className="field-error">{errors.digitalService}</span>}
          </label>
        </div>
      </section>

      {service && (
        <section className="product-field-section">
          <div className="product-field-heading">
            <span>2</span>
            <div><h4>Campaign Details</h4><p>Capture the operational brief for this service.</p></div>
          </div>

          {service === 'Social Media Management' && (
            <div className="compact-field-grid">
              <fieldset className="field-span-full selection-field">
                <legend>Social platforms</legend>
                <div className="checkbox-grid">
                  {SOCIAL_PLATFORMS.map(platform => (
                    <label key={platform} className="checkbox-label">
                      <input type="checkbox" checked={socialPlatforms.includes(platform)} onChange={() => set('socialPlatforms', toggleArrayValue(socialPlatforms, platform))} />
                      {platform}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>Username / account handles
                <input value={String(details.socialUsernames || '')} onChange={event => set('socialUsernames', event.target.value)} placeholder="@business or platform-specific handles" />
                {errors?.socialUsernames && <span className="field-error">{errors.socialUsernames}</span>}
              </label>
              <label className="field-span-full">Service details
                <textarea value={String(details.serviceDetails || details.campaignGoal || '')} onChange={event => set('serviceDetails', event.target.value)} placeholder="Platforms managed, posting cadence, content types, community management, reporting…" rows={3} />
                {errors?.serviceDetails && <span className="field-error">{errors.serviceDetails}</span>}
              </label>
            </div>
          )}

          {service === 'Paid Ads' && (
            <div className="compact-field-grid">
              <label>Campaign goal
                <input value={String(details.campaignGoal || '')} onChange={event => set('campaignGoal', event.target.value)} placeholder="Leads, sales, awareness, traffic…" />
                {errors?.campaignGoal && <span className="field-error">{errors.campaignGoal}</span>}
              </label>
              <label>Creative type
                <input value={String(details.creativeType || '')} onChange={event => set('creativeType', event.target.value)} placeholder="Static, video, carousel, search copy…" />
                {errors?.creativeType && <span className="field-error">{errors.creativeType}</span>}
              </label>
              <fieldset className="field-span-full selection-field">
                <legend>Channels</legend>
                <div className="checkbox-grid">
                  {PAID_AD_PLATFORMS.map(platform => (
                    <label key={platform} className="checkbox-label">
                      <input type="checkbox" checked={paidAdPlatforms.includes(platform)} onChange={() => set('paidAdPlatforms', toggleArrayValue(paidAdPlatforms, platform))} />
                      {platform}
                    </label>
                  ))}
                </div>
                {errors?.paidAdPlatforms && <span className="field-error">{errors.paidAdPlatforms}</span>}
              </fieldset>
              {paidAdPlatforms.includes('Other Paid Ads') && (
                <label>Other channel
                  <input value={String(details.otherPaidAdPlatform || '')} onChange={event => set('otherPaidAdPlatform', event.target.value)} placeholder="Specify channel" />
                  {errors?.otherPaidAdPlatform && <span className="field-error">{errors.otherPaidAdPlatform}</span>}
                </label>
              )}
            </div>
          )}

          {service === 'Geofencing' && (
            <div className="compact-field-grid">
              <label>Campaign type
                <select value={String(details.campaignType || '')} onChange={event => set('campaignType', event.target.value)}>
                  <option value="">Select campaign type</option>
                  {GEOFENCE_CAMPAIGNS.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                {errors?.campaignType && <span className="field-error">{errors.campaignType}</span>}
              </label>
              <label>Campaign goal
                <input value={String(details.campaignGoal || '')} onChange={event => set('campaignGoal', event.target.value)} placeholder="Visits, awareness, retargeting…" />
              </label>
            </div>
          )}

          {service === 'Website' && (
            <div className="compact-field-grid">
              <label>Project type
                <select value={String(details.websiteOption || '')} onChange={event => set('websiteOption', event.target.value)}>
                  <option value="">Select project type</option>
                  {WEBSITE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {errors?.websiteOption && <span className="field-error">{errors.websiteOption}</span>}
              </label>
              <label>Website URL
                <input type="url" value={String(details.websiteUrl || '')} onChange={event => set('websiteUrl', event.target.value)} placeholder="https://example.com" />
                {errors?.websiteUrl && <span className="field-error">{errors.websiteUrl}</span>}
              </label>
              <label className="field-span-full">Project scope
                <textarea value={String(details.projectScope || details.websitePrimaryGoal || details.pages || '')} onChange={event => set('projectScope', event.target.value)} placeholder="Pages, functionality, integrations, conversion goals, and deliverables." rows={3} />
                {errors?.projectScope && <span className="field-error">{errors.projectScope}</span>}
              </label>
            </div>
          )}

          {service === 'Other' && (
            <div className="compact-field-grid">
              <label className="field-span-full">Service details
                <textarea value={String(details.serviceDetails || '')} onChange={event => set('serviceDetails', event.target.value)} placeholder="Describe the service and required deliverables." rows={3} />
              </label>
            </div>
          )}
        </section>
      )}

      {service && (
        <section className="product-field-section">
          <div className="product-field-heading">
            <span>3</span>
            <div><h4>Targeting / Dates</h4><p>Define timing and audience details where they apply.</p></div>
          </div>
          <div className="compact-field-grid">
            <label>Start date
              <input
                type="date"
                value={String(service === 'Social Media Management' ? details.socialStartDate || details.startDate || '' : details.startDate || '')}
                onChange={event => set(service === 'Social Media Management' ? 'socialStartDate' : 'startDate', event.target.value)}
              />
              {(errors?.socialStartDate || errors?.startDate) && <span className="field-error">{errors.socialStartDate || errors.startDate}</span>}
            </label>
            {(service === 'Paid Ads' || service === 'Geofencing') && (
              <>
                <label>Geo areas
                  <input value={String(details.targetAreas || '')} onChange={event => set('targetAreas', event.target.value)} placeholder="Cities, ZIP codes, counties, regions" />
                  {errors?.targetAreas && <span className="field-error">{errors.targetAreas}</span>}
                </label>
                <label>Specific locations
                  <input value={String(details.targetLocations || '')} onChange={event => set('targetLocations', event.target.value)} placeholder="Venues, addresses, neighborhoods, competitors" />
                </label>
                <fieldset className="field-span-full demographic-fields">
                  <legend>Demographics</legend>
                  <div className="compact-field-grid compact-field-grid--three">
                    <label>Age range<input value={String(details.demographicAge || '')} onChange={event => set('demographicAge', event.target.value)} placeholder="25–45" /></label>
                    <label>Gender<input value={String(details.demographicSex || '')} onChange={event => set('demographicSex', event.target.value)} placeholder="All" /></label>
                    <label>Income<input value={String(details.demographicIncome || '')} onChange={event => set('demographicIncome', event.target.value)} placeholder="$45k+" /></label>
                  </div>
                </fieldset>
              </>
            )}
          </div>
        </section>
      )}

      {service && (
        <section className="product-field-section">
          <div className="product-field-heading">
            <span>4</span>
            <div><h4>Pricing</h4><p>Enter the service fee, media budget, and discount.</p></div>
          </div>
          <div className="compact-field-grid">
            <label>Service price
              <input type="number" min="0" step="0.01" value={details.servicePrice != null ? String(details.servicePrice) : ''} onChange={event => set('servicePrice', Number(event.target.value) || 0)} placeholder="0.00" />
              {errors?.digitalServicePrice && <span className="field-error">{errors.digitalServicePrice}</span>}
            </label>
            {showAdSpend && (
              <label>Monthly ad spend
                <input type="number" min="0" step="1" value={String(details.monthlyAdSpend ?? '')} onChange={event => set('monthlyAdSpend', Number(event.target.value) || 0)} placeholder="0.00" />
                {errors?.digitalSpend && <span className="field-error">{errors.digitalSpend}</span>}
              </label>
            )}
            <label>Discount type
              <select value={String(details.discountType || 'None')} onChange={event => set('discountType', event.target.value)}>
                {DISCOUNT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            {details.discountType && details.discountType !== 'None' && (
              <label>Discount value
                <input type="number" min="0" step="0.01" value={details.discountValue != null ? String(details.discountValue) : ''} onChange={event => set('discountValue', Number(event.target.value) || 0)} placeholder="0.00" />
                {errors?.discountValue && <span className="field-error">{errors.discountValue}</span>}
              </label>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
