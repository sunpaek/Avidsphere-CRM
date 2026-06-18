import type { Sale, ProductDetails } from '@/types'
import { DEPARTMENT_NOTIFICATION_OPTIONS } from '@/utils/departments'

interface Props {
  sale: Partial<Sale>
  productDetails: ProductDetails
  onChange: (updates: Partial<Sale>) => void
}

export default function NotificationFields({ sale, productDetails, onChange }: Props) {
  const handleToggle = (field: keyof Sale, value: boolean) => {
    onChange({ [field]: value })
  }

  const recommended = new Set<string>()
  if (sale.saleCategory === 'Mailer' || sale.saleCategory === 'Print') recommended.add('Print Team')
  if (
    sale.designRequired === 'Yes' ||
    sale.designChangeRequired === 'Yes' ||
    (sale.saleCategory === 'Print' && Number(productDetails.designFee || 0) > 0)
  ) recommended.add('Designers')
  if (sale.saleCategory === 'Digital') recommended.add('Digital Team')
  if (productDetails.service === 'Social Media Management') recommended.add('Social Media Team')
  if (productDetails.service === 'Geofencing') recommended.add('Geofencing')

  return (
    <div className="form-section">
      <h3 className="form-section-title">Notify Departments</h3>
      <p className="text-sm text-slate-600 mb-4">
        Recommended teams are selected automatically. Adjust the six operational departments as needed.
      </p>

      <div className="notify-department-grid">
        {DEPARTMENT_NOTIFICATION_OPTIONS.map(option => {
          const isRecommended = option.name === 'Management' || recommended.has(option.name)
          return (
            <label key={option.name} className="notify-department-option">
              <input
                type="checkbox"
                checked={sale[option.flag] === true}
                onChange={(event) => handleToggle(option.flag, event.target.checked)}
              />
              <span className="notify-department-copy">
                <span className="notify-department-name">
                  {option.name}
                  {isRecommended ? <span className="notify-recommended">Recommended</span> : null}
                </span>
                <span className="notify-department-description">{option.description}</span>
              </span>
            </label>
          )
        })}
      </div>

      <div className="notification-routing-note">
        <strong>Routing:</strong> Notifications are created immediately for every selected department and remain in the Notifications Center.
      </div>
    </div>
  )
}
