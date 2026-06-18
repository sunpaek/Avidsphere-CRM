import { useState, useMemo, useEffect, useRef } from 'react'
import type { Customer, ProductDetails, Sale } from '@/types'
import { saveSale, updateSale } from '@/hooks/useLocalStorageAdapter'
import { notificationApi } from '@/services/notificationApi'
import ProductTypeSelector from './ProductTypeSelector'
import MailerFields from './MailerFields'
import PrintFields from './PrintFields'
import DigitalFields from './DigitalFields'
import PaymentFields from './PaymentFields'
import PricingPreview from './PricingPreview'
import NotificationFields from './NotificationFields'
import { useToast } from './ToastProvider'
import { calculateMailerTotal, MAILER_PRICES, type MailerSizeOption } from '@/utils/mailerPricing'
import {
  DEPARTMENT_NOTIFICATION_OPTIONS,
  getRecommendedDepartmentNotifications,
  type DepartmentNotificationFlag
} from '@/utils/departments'

interface Props {
  customers: Customer[]
  initialSale?: Sale
  initialCustomerId?: string
  currentUserName?: string
  mode?: 'create' | 'edit' | 'reorder'
  onClose: () => void
  onSave?: (sale: Sale) => void
}

export default function SaleForm({ customers, initialSale, initialCustomerId, currentUserName = 'Sunny', mode = 'create', onClose, onSave }: Props) {
  const { showToast } = useToast()
  const [customerId, setCustomerId] = useState<string | undefined>(initialCustomerId || customers[0]?.id)
  const [saleCategory, setSaleCategory] = useState<'Mailer' | 'Print' | 'Digital'>('Mailer')
  const [saleDate, setSaleDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [saleNotes, setSaleNotes] = useState<string>('')
  const [productDetails, setProductDetails] = useState<ProductDetails>({})
  const [paymentMethod, setPaymentMethod] = useState<string>('Invoice')
  const [paymentOtherMethod, setPaymentOtherMethod] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notificationFlags, setNotificationFlags] = useState<Partial<Sale>>({})
  const [isSaving, setIsSaving] = useState(false)
  const touchedNotificationFlags = useRef<Set<DepartmentNotificationFlag>>(new Set())
  const notificationContext = useRef('')

  const mailerPricing = useMemo(() => {
    const adSize = String(productDetails.adSize || '')
    const runTime = Number(productDetails.mailerRunTime || 0) || 0
    const discountType = String(productDetails.discountType || 'None') as 'None' | 'Dollar Amount' | 'Percentage'
    const discountValue = Number(productDetails.discountValue || 0)
    if (!(adSize in MAILER_PRICES)) {
      return { monthlyRate: 0, subtotal: 0, discountType, discountValue, discountAmount: 0, designFee: 0, designChange: 0, total: 0 }
    }

    const pricing = calculateMailerTotal({
      mailerSize: adSize as MailerSizeOption,
      runTime,
      discountType,
      discountValue,
      designRequired: String(productDetails.designRequired || '').toLowerCase() === 'yes',
      designChangeRequired: String(productDetails.designChangeRequired || '').toLowerCase() === 'yes'
    })

    return {
      monthlyRate: pricing.basePrice,
      subtotal: pricing.subtotal,
      discountType: pricing.discountType,
      discountValue: pricing.discountValue,
      discountAmount: pricing.discountAmount,
      designFee: pricing.designRequiredFee,
      designChange: pricing.designChangeFee,
      total: pricing.total
    }
  }, [productDetails])

  const digitalPricing = useMemo(() => {
    if (saleCategory !== 'Digital') {
      return { servicePrice: 0, discountType: 'None', discountValue: 0, discountAmount: 0, totalInvestment: 0 }
    }

    const servicePrice = Number(productDetails.servicePrice || 0)
    const discountType = String(productDetails.discountType || 'None') as 'None' | 'Dollar Amount' | 'Percentage'
    const discountValue = Number(productDetails.discountValue || 0)
    let discountAmount = 0

    if (discountType === 'Dollar Amount') {
      discountAmount = Math.min(discountValue, servicePrice)
    } else if (discountType === 'Percentage') {
      discountAmount = Math.min(servicePrice * (discountValue / 100), servicePrice)
    }

    if (discountAmount < 0) discountAmount = 0
    const totalInvestment = Math.max(servicePrice - discountAmount, 0)

    return { servicePrice, discountType, discountValue, discountAmount, totalInvestment }
  }, [saleCategory, productDetails.servicePrice, productDetails.discountType, productDetails.discountValue])

  const printPricing = useMemo(() => {
    if (saleCategory !== 'Print') {
      return { projectPrice: 0, designFee: 0, discountType: 'None', discountValue: 0, discountAmount: 0, totalInvestment: 0 }
    }

    const projectPrice = Number(productDetails.projectPrice || 0)
    const designFee = Number(productDetails.designFee || 0)
    const discountType = String(productDetails.discountType || 'None') as 'None' | 'Dollar Amount' | 'Percentage'
    const discountValue = Number(productDetails.discountValue || 0)
    let discountAmount = 0

    if (discountType === 'Dollar Amount') {
      discountAmount = Math.min(discountValue, projectPrice)
    } else if (discountType === 'Percentage') {
      discountAmount = Math.min(projectPrice * (discountValue / 100), projectPrice)
    }

    if (discountAmount < 0) discountAmount = 0
    const totalInvestment = Math.max(projectPrice + designFee - discountAmount, 0)

    return { projectPrice, designFee, discountType, discountValue, discountAmount, totalInvestment }
  }, [saleCategory, productDetails.projectPrice, productDetails.designFee, productDetails.discountType, productDetails.discountValue])

  useEffect(() => {
    if (saleCategory === 'Digital') {
      const currentTotal = Number(productDetails.totalInvestment || 0)
      if (currentTotal !== digitalPricing.totalInvestment) {
        setProductDetails(prev => ({ ...prev, totalInvestment: digitalPricing.totalInvestment }))
      }
    }
  }, [digitalPricing, saleCategory, productDetails.totalInvestment])

  useEffect(() => {
    if (saleCategory === 'Print') {
      const currentTotal = Number(productDetails.totalInvestment || 0)
      if (currentTotal !== printPricing.totalInvestment) {
        setProductDetails(prev => ({ ...prev, totalInvestment: printPricing.totalInvestment }))
      }
    }
  }, [printPricing, saleCategory, productDetails.totalInvestment])

  useEffect(() => {
    if (!initialSale) {
      setCustomerId(initialCustomerId || customers[0]?.id)
      setSaleCategory('Mailer')
      setSaleDate(new Date().toISOString().slice(0, 10))
      setSaleNotes('')
      setProductDetails({})
      setPaymentMethod('Invoice')
      setPaymentOtherMethod('')
      setErrors({})
      setNotificationFlags({})
      touchedNotificationFlags.current.clear()
      notificationContext.current = ''
      return
    }

    setCustomerId(initialSale.customerId || customers[0]?.id)
    setSaleCategory(initialSale.saleCategory || 'Mailer')
    setSaleDate(initialSale.saleDate || new Date().toISOString().slice(0, 10))
    setSaleNotes(initialSale.notes || '')
    const initialDetails = { ...(initialSale.productDetails || {}) }
    if (initialSale.saleCategory === 'Digital') {
      const service = String(initialDetails.service || initialSale.saleType || '')
      if (service === 'Social Media Management' && !initialDetails.serviceDetails) {
        initialDetails.serviceDetails = initialDetails.campaignGoal || initialDetails.campaignNotes || ''
      }
      if (service === 'Website') {
        if (!initialDetails.projectScope) {
          initialDetails.projectScope = [initialDetails.websitePrimaryGoal, initialDetails.pages].filter(Boolean).join(' — ')
        }
        if (!initialDetails.startDate) initialDetails.startDate = initialSale.saleDate?.slice(0, 10)
      }
    }
    setProductDetails(initialDetails)
    setPaymentMethod(initialSale.paymentMethod || 'Invoice')
    setPaymentOtherMethod(initialSale.otherPaymentMethod || '')
    setErrors({})
    touchedNotificationFlags.current.clear()
    notificationContext.current = ''
    setNotificationFlags({
      notifyManagement: initialSale.notifyManagement,
      notifyPrintTeam: initialSale.notifyPrintTeam,
      notifyDesigners: initialSale.notifyDesigners,
      notifyDigitalTeam: initialSale.notifyDigitalTeam,
      notifySocialMediaTeam: initialSale.notifySocialMediaTeam,
      notifyGeofencing: initialSale.notifyGeofencing
    })
  }, [initialCustomerId, initialSale, customers, currentUserName])

  useEffect(() => {
    if (mode === 'edit' && initialSale) return
    const service = String(productDetails.service || '')
    const nextContext = `${saleCategory}:${service}`
    const contextChanged = notificationContext.current !== nextContext
    if (contextChanged) {
      touchedNotificationFlags.current.clear()
      notificationContext.current = nextContext
    }

    const recommended = getRecommendedDepartmentNotifications(saleCategory, productDetails)
    setNotificationFlags(previous => {
      const next = { ...previous }
      DEPARTMENT_NOTIFICATION_OPTIONS.forEach(({ flag }) => {
        if (contextChanged || !touchedNotificationFlags.current.has(flag)) {
          next[flag] = recommended[flag]
        }
      })
      return next
    })
  }, [
    initialSale,
    mode,
    productDetails.designChangeRequired,
    productDetails.designFee,
    productDetails.designRequired,
    productDetails.service,
    saleCategory
  ])

  function createSale(): Sale {
    const selectedCustomer = customers.find((customer) => customer.id === customerId)
    const saleType = saleCategory === 'Mailer'
      ? 'Mailer Campaign'
      : saleCategory === 'Print'
        ? String(productDetails.printType || 'Print Project')
        : String(productDetails.service || 'Digital Service')

    const saleId = mode === 'edit' && initialSale?.id
      ? initialSale.id
      : `sale-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
    const operationalDetails = { ...productDetails }
    ;[
      'campaignNotes',
      'description',
      'customDescription',
      'printProjectDescription',
      'otherPrintDescription',
      'paymentNotes',
      'serviceNotes',
      'projectNotes',
      'staticImageCampaignIdeas'
    ].forEach(key => delete operationalDetails[key])

    const sale: Sale = {
      ...(mode === 'edit' && initialSale ? initialSale : {}),
      id: saleId,
      customerId: customerId ?? '',
      businessName: selectedCustomer?.businessName,
      saleType,
      saleCategory,
      saleDate,
      salesRepresentative: mode === 'edit'
        ? initialSale?.salesRepresentative || currentUserName
        : currentUserName,
      notes: saleNotes || undefined,
      paymentMethod: paymentMethod || undefined,
      otherPaymentMethod: paymentMethod === 'Other' ? paymentOtherMethod.trim() || undefined : undefined,
      status: 'Completed',
      saleStatus: 'Completed',
      designRequired: String(productDetails.designRequired || 'No') as 'Yes' | 'No',
      designChangeRequired: String(productDetails.designChangeRequired || 'No') as 'Yes' | 'No',
      needsMailing: saleCategory === 'Print' ? (productDetails.needsMailing ? 'Yes' : 'No') : undefined,
      // Notification flags
      notifyManagement: notificationFlags.notifyManagement,
      notifyPrintTeam: notificationFlags.notifyPrintTeam,
      notifyDesigners: notificationFlags.notifyDesigners,
      notifyDigitalTeam: notificationFlags.notifyDigitalTeam,
      notifySocialMediaTeam: notificationFlags.notifySocialMediaTeam,
      notifyGeofencing: notificationFlags.notifyGeofencing,
      productDetails: {
        ...operationalDetails,
        totalInvestment: saleCategory === 'Digital'
          ? digitalPricing.totalInvestment
          : saleCategory === 'Print'
            ? printPricing.totalInvestment
            : mailerPricing.total
      },
      dollarAmount: saleCategory === 'Digital' ? undefined : saleCategory === 'Print' ? printPricing.totalInvestment : mailerPricing.total,
      digitalFinalTotal: saleCategory === 'Digital' ? digitalPricing.totalInvestment : undefined
    }

    return sale
  }

  async function handleSubmit() {
    if (!validate()) return

    try {
      setIsSaving(true)
      const sale = createSale()
      const selectedCustomer = customers.find((customer) => customer.id === customerId)

      if (mode === 'edit') {
        updateSale(sale)
      } else {
        saveSale(sale)
      }

      if (mode !== 'edit') {
        console.log('[SaleForm] Routing notifications for sale:', sale.id)
        const results = await notificationApi.routeNotifications(sale, selectedCustomer)
        if (results.size) {
          showToast(`${results.size} operational notification${results.size === 1 ? '' : 's'} created.`, 'info')
        }
      }

      // Reset form
      setCustomerId(customers[0]?.id)
      setSaleCategory('Mailer')
      setSaleDate(new Date().toISOString().slice(0, 10))
      setSaleNotes('')
      setProductDetails({})
      setPaymentMethod('Invoice')
      setPaymentOtherMethod('')
      setErrors({})
      setNotificationFlags({})
      touchedNotificationFlags.current.clear()
      notificationContext.current = ''

      onSave?.(sale)
      onClose()
    } catch (err) {
      console.error('[SaleForm] Save failed:', err)
      showToast('The sale could not be saved. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    // Common validations
    if (!customerId) next.customer = 'Customer is required.'
    if (!saleDate) next.saleDate = 'Sale date is required.'
    if (paymentMethod === 'Other' && !paymentOtherMethod.trim()) next.paymentOtherMethod = 'Specify the payment method.'

    // Mailer required fields
    if (saleCategory === 'Mailer') {
      if (!productDetails.mailerArea) next.mailerArea = 'Mailer area is required.'
      if (!productDetails.month) next.mailerMonth = 'Start month is required.'
      if (!productDetails.mailerRunTime || Number(productDetails.mailerRunTime) <= 0) next.mailerRunTime = 'Run time must be greater than 0.'
      if (!productDetails.adSize) next.adSize = 'Ad size is required.'

      if (productDetails.discountType && productDetails.discountType !== 'None') {
        const discountValue = Number(productDetails.discountValue || 0)
        if (Number.isNaN(discountValue) || discountValue < 0) {
          next.discountValue = 'Enter a valid discount value.'
        } else if (productDetails.discountType === 'Percentage' && discountValue > 100) {
          next.discountValue = 'Enter a percentage discount between 0 and 100.'
        } else if (productDetails.discountType === 'Dollar Amount') {
          const subtotal = (MAILER_PRICES[String(productDetails.adSize || '') as MailerSizeOption] || 0) * Number(productDetails.mailerRunTime || 0)
          if (discountValue > subtotal) {
            next.discountValue = 'Discount cannot exceed the mailer subtotal.'
          }
        }
      }
    }

    // Print required fields
    if (saleCategory === 'Print') {
      if (!productDetails.printType) next.printType = 'Print type is required.'
      if (!productDetails.quantity || Number(productDetails.quantity) <= 0) next.printQuantity = 'Quantity must be greater than 0.'
      if (!productDetails.size) next.printSize = 'Size is required.'
      if (!productDetails.finish) next.printFinish = 'Finish is required.'
      if (productDetails.finish === 'Other' && !productDetails.otherFinish) next.printFinish = 'Specify the custom finish.'
      if (!productDetails.thickness) next.printThickness = 'Thickness is required.'
      if (productDetails.thickness === 'Other' && !productDetails.otherThickness) next.printThickness = 'Specify the custom thickness.'
      if (['BROCHURES', 'FLYERS', 'GREETING CARDS', 'MENUS', 'TABLE TENTS', 'CATALOGS', 'BOOKLETS'].includes(String(productDetails.printType || '')) && !productDetails.fold) {
        next.printFold = 'Select the fold for this print service.'
      }
      
      // Print pricing validation
      if (!productDetails.projectPrice || Number(productDetails.projectPrice) <= 0) next.printProjectPrice = 'Project price must be greater than 0.'
      if (Number(productDetails.designFee || 0) < 0) next.printDesignFee = 'Design fee cannot be negative.'
      
      if (productDetails.discountType && productDetails.discountType !== 'None') {
        const discountValue = Number(productDetails.discountValue || 0)
        if (Number.isNaN(discountValue) || discountValue < 0) next.printDiscountValue = 'Enter a valid discount value.'
        if (productDetails.discountType === 'Percentage' && discountValue > 100) next.printDiscountValue = 'Enter a percentage discount between 0 and 100.'
        if (productDetails.discountType === 'Dollar Amount' && discountValue > Number(productDetails.projectPrice || 0)) next.printDiscountValue = 'Discount cannot exceed the project price.'
      }
    }

    // Digital required fields
    if (saleCategory === 'Digital') {
      if (!productDetails.service) next.digitalService = 'Digital service is required.'
      if (!productDetails.servicePrice || Number(productDetails.servicePrice) <= 0) next.digitalServicePrice = 'Service price must be greater than 0.'
      if (productDetails.discountType && productDetails.discountType !== 'None') {
        const discountValue = Number(productDetails.discountValue || 0)
        if (Number.isNaN(discountValue) || discountValue < 0) next.discountValue = 'Enter a valid discount value.'
        if (productDetails.discountType === 'Percentage' && discountValue > 100) next.discountValue = 'Enter a percentage discount between 0 and 100.'
        if (productDetails.discountType === 'Dollar Amount' && discountValue > Number(productDetails.servicePrice || 0)) next.discountValue = 'Discount cannot exceed the service price.'
      }

      if (productDetails.service === 'Social Media Management') {
        if (!String(productDetails.socialUsernames || '').trim()) next.socialUsernames = 'Enter the social username or account handles.'
        if (!productDetails.socialStartDate && !productDetails.startDate) next.socialStartDate = 'Social media start date is required.'
        if (!productDetails.serviceDetails) next.serviceDetails = 'Enter the social media service details.'
      }

      if (productDetails.service === 'Paid Ads') {
        if (!Array.isArray(productDetails.paidAdPlatforms) || productDetails.paidAdPlatforms.length === 0) next.paidAdPlatforms = 'Select at least one paid advertising channel.'
        if (Array.isArray(productDetails.paidAdPlatforms) && productDetails.paidAdPlatforms.includes('Other Paid Ads') && !String(productDetails.otherPaidAdPlatform || '').trim()) next.otherPaidAdPlatform = 'Specify the other paid ad platform.'
        if (!productDetails.startDate) next.startDate = 'Paid ads start date is required.'
        if (!productDetails.campaignGoal) next.campaignGoal = 'Enter the paid ads campaign goal.'
        if (!productDetails.targetAreas && !productDetails.targetLocations && !productDetails.demographicAge && !productDetails.demographicSex && !productDetails.demographicIncome) next.targetAreas = 'Provide at least one targeting or geographic field.'
        if (!productDetails.monthlyAdSpend || Number(productDetails.monthlyAdSpend) <= 0) next.digitalSpend = 'Monthly ad spend must be greater than 0 for paid ads.'
      }

      if (productDetails.service === 'Website') {
        if (!productDetails.websiteOption) next.websiteOption = 'Website option is required.'
        if (!productDetails.websiteUrl) next.websiteUrl = 'Website URL is required.'
        if (!productDetails.projectScope) next.projectScope = 'Website project scope is required.'
        if (!productDetails.startDate) next.startDate = 'Website start date is required.'
      }

      if (productDetails.service === 'Geofencing') {
        if (!productDetails.campaignType) next.campaignType = 'Geofencing campaign type is required.'
        if (!productDetails.monthlyAdSpend || Number(productDetails.monthlyAdSpend) <= 0) next.digitalSpend = 'Monthly ad spend must be greater than 0 for geofencing.'
        if (!productDetails.startDate) next.startDate = 'Geofencing start date is required.'
        if (!productDetails.targetAreas && !productDetails.targetLocations) next.targetAreas = 'Provide target areas or locations for geofencing.'
      }

      if (productDetails.service === 'Other' && !productDetails.serviceDetails) {
        next.serviceDetails = 'Describe the digital service and deliverables.'
      }
    }

    setErrors(next)
    const firstError = Object.values(next)[0]
    if (firstError) showToast(firstError, 'error')
    return Object.keys(next).length === 0
  }

  return (
    <div className="sale-form-container">
      <div className="sale-form-shell" style={{ background: 'transparent', padding: 0 }}>
        <header className="sale-form-header">
          <div>
            <p className="eyebrow">Add sale</p>
            <h2>{mode === 'edit' ? 'Edit Sale' : mode === 'reorder' ? 'Reorder Sale' : 'New Sale'}</h2>
          </div>
          {mode !== 'create' ? <button type="button" onClick={onClose} aria-label="Close" className="secondary-btn compact-action">Close</button> : null}
        </header>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
          <section className="sale-form-intro">
            <label>Customer
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Choose a customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
              </select>
              {errors.customer ? <span className="field-error">{errors.customer}</span> : null}
            </label>
            <ProductTypeSelector value={saleCategory} onChange={setSaleCategory} />
          </section>

          <section className="form-section sale-product-details">
            {saleCategory === 'Mailer' && (
              <MailerFields details={productDetails} onChange={d => setProductDetails(d)} errors={errors} />
            )}

            {saleCategory === 'Print' && (
              <PrintFields details={productDetails} onChange={d => setProductDetails(d)} errors={errors} />
            )}

            {saleCategory === 'Digital' && (
              <DigitalFields details={productDetails} onChange={d => setProductDetails(d)} errors={errors} />
            )}

            <PricingPreview details={productDetails} paymentMethod={paymentMethod} mailerPricing={mailerPricing} saleCategory={saleCategory} />
          </section>

          <NotificationFields
            sale={{
              ...notificationFlags,
              saleCategory,
              designRequired: String(productDetails.designRequired || 'No') as 'Yes' | 'No',
              designChangeRequired: String(productDetails.designChangeRequired || 'No') as 'Yes' | 'No'
            }}
            productDetails={productDetails}
            onChange={(updates) => {
              Object.keys(updates).forEach(key => {
                if (DEPARTMENT_NOTIFICATION_OPTIONS.some(option => option.flag === key)) {
                  touchedNotificationFlags.current.add(key as DepartmentNotificationFlag)
                }
              })
              setNotificationFlags(prev => ({ ...prev, ...updates }))
            }}
          />

          <section className="form-section sale-closing-fields">
            <div className="form-row">
              <label>Date
                <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
                {errors.saleDate ? <span className="field-error">{errors.saleDate}</span> : null}
              </label>
            </div>
            <PaymentFields
              paymentMethod={paymentMethod}
              paymentOtherMethod={paymentOtherMethod}
              onChange={setPaymentMethod}
              onOtherMethodChange={setPaymentOtherMethod}
              otherMethodError={errors.paymentOtherMethod}
            />
            <label className="internal-notes-field">Internal Notes
              <textarea
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                rows={4}
                placeholder="Add internal context, handoff notes, payment instructions, or exceptions."
              />
            </label>
          </section>

          <footer className="form-actions">
            <button type="submit" className="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : mode === 'edit' ? 'Update Sale' : 'Save Sale'}
            </button>
            <button type="button" onClick={onClose} className="secondary" disabled={isSaving}>
              {mode === 'edit' ? 'Cancel' : 'Clear'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
