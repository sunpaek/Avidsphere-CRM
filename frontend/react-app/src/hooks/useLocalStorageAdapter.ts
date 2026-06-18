import { useState, useEffect } from 'react'
import type {
  CRMData,
  Customer,
  Sale,
  Reminder,
  Notification,
  Activity,
  Preferences,
  NotificationHistory,
  DashboardStats,
  RecentSaleSummary
} from '@/types'
import { canonicalizeDepartmentName, getRecommendedDepartmentNotifications } from '@/utils/departments'

/**
 * Legacy-compatible adapter for Avidsphere CRM localStorage.
 * Reads and writes CRM data using the existing storage keys.
 */

export const STORAGE_KEYS = {
  customers: 'avidSphere.customers',
  sales: 'avidSphere.sales',
  reminders: 'avidSphere.reminders',
  notifications: 'avidSphere.notifications',
  activities: 'avidSphere.activities',
  preferences: 'avidSphere.preferences',
  notificationHistory: 'avidSphere.notificationHistory'
}

const STORAGE_UPDATE_EVENT = 'avidSphere.storage.updated'
const VALID_SALE_CATEGORIES = new Set(['Mailer', 'Digital', 'Print'])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asFiniteNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function getSaleCategoryFromLegacyType(value: unknown): Sale['saleCategory'] {
  const type = asString(value).toLowerCase()
  if (type.includes('mailer') || type.includes('mail')) return 'Mailer'
  if (
    type.includes('print') || type.includes('banner') || type.includes('brochure') ||
    type.includes('business card') || type.includes('postcard') || type.includes('flyer')
  ) return 'Print'
  return 'Digital'
}

function getRecommendedNotifications(category: Sale['saleCategory'], details: Record<string, unknown>) {
  return getRecommendedDepartmentNotifications(category, details)
}

function mergeInternalNotes(value: Record<string, unknown>, details: Record<string, unknown>) {
  const internalNotes = asString(value.notes).trim()
  const legacyEntries = [
    ['Payment', asString(details.paymentNotes)],
    ['Print details', asString(details.description, asString(details.customDescription, asString(details.printProjectDescription, asString(details.otherPrintDescription))))],
    ['Campaign details', asString(details.campaignNotes, asString(details.staticImageCampaignIdeas))],
    ['Service details', asString(details.serviceNotes)],
    ['Project details', asString(details.projectNotes)]
  ].filter(([, text]) => text.trim())

  const entries: string[] = internalNotes ? [internalNotes] : []
  const searchableNotes = internalNotes.toLowerCase()
  const seen = new Set<string>()
  legacyEntries.forEach(([label, text]) => {
      const key = text.trim().toLowerCase()
      if (seen.has(key) || searchableNotes.includes(key)) return
      seen.add(key)
      entries.push(`${label}: ${text.trim()}`)
    })
  return entries.join('\n\n')
}

export function normalizeSaleRecord(value: unknown, index = 0): Sale | null {
  if (!isPlainObject(value)) return null

  const rawDetails = isPlainObject(value.productDetails) ? value.productDetails : {}
  const legacyCategory = asString(value.saleCategory)
  const canonicalCategory = legacyCategory.charAt(0).toUpperCase() + legacyCategory.slice(1).toLowerCase()
  const saleCategory = VALID_SALE_CATEGORIES.has(canonicalCategory)
    ? canonicalCategory as Sale['saleCategory']
    : getSaleCategoryFromLegacyType(`${legacyCategory} ${asString(value.saleType)}`)
  const details = { ...rawDetails }

  if (saleCategory === 'Mailer') {
    details.mailerArea = asString(details.mailerArea)
    details.month = asString(details.month)
    details.adSize = asString(details.adSize)
  }

  if (saleCategory === 'Digital') {
    details.service = asString(details.service, asString(value.saleType))
    details.websiteOption = asString(details.websiteOption)
    details.paidAdPlatforms = Array.isArray(details.paidAdPlatforms)
      ? details.paidAdPlatforms.filter(item => typeof item === 'string')
      : asString(details.paidAdsOption) ? [asString(details.paidAdsOption)] : []
    details.socialPlatforms = Array.isArray(details.socialPlatforms)
      ? details.socialPlatforms.filter(item => typeof item === 'string')
      : asString(details.socialPlatform) ? [asString(details.socialPlatform)] : []
    details.socialUsernames = isPlainObject(details.socialUsernames) || typeof details.socialUsernames === 'string'
      ? details.socialUsernames
      : ''
    details.socialStartDate = asString(details.socialStartDate, asString(details.startDate))
    details.campaignNotes = asString(details.campaignNotes, asString(details.staticImageCampaignIdeas))
    details.targetAreas = asString(details.targetAreas, asString(details.targetGeography))
    details.targetGeography = asString(details.targetGeography, asString(details.targetAreas))
    details.campaignStartDate = asString(details.campaignStartDate, asString(details.startDate))
  }

  if (saleCategory === 'Print') {
    details.printType = asString(details.printType, asString(value.saleType))
    details.quantity = details.quantity ?? ''
    details.size = asString(details.size)
    details.designFee = asFiniteNumber(details.designFee) ?? 0
    details.customDescription = asString(
      details.customDescription,
      asString(details.printProjectDescription, asString(details.otherPrintDescription))
    )
    const rawNeedsMailing = details.needsMailing
    details.needsMailing = typeof rawNeedsMailing === 'boolean'
      ? rawNeedsMailing
      : asString(rawNeedsMailing, asString(value.needsMailing, 'No')).toLowerCase() === 'yes'
  }

  const recommended = getRecommendedNotifications(saleCategory, details)
  const id = asString(value.id, `legacy-sale-${index}-${Date.now()}`)
  const customerId = asString(value.customerId)
  const saleType = asString(
    value.saleType,
    saleCategory === 'Digital' ? asString(details.service, 'Digital Service') : saleCategory
  )
  const dollarAmount = asFiniteNumber(value.dollarAmount)
  const digitalFinalTotal = asFiniteNumber(value.digitalFinalTotal)
  const totalInvestment = asFiniteNumber(details.totalInvestment)
  if (totalInvestment !== undefined) details.totalInvestment = totalInvestment

  return {
    ...value,
    id,
    customerId,
    businessName: asString(value.businessName) || undefined,
    saleType,
    saleCategory,
    saleDate: asString(value.saleDate, asString(value.createdAt).slice(0, 10)),
    salesRepresentative: asString(value.salesRepresentative),
    dollarAmount,
    digitalFinalTotal,
    notes: mergeInternalNotes(value, details) || undefined,
    designRequired: asString(value.designRequired, 'No') === 'Yes' ? 'Yes' : 'No',
    designChangeRequired: asString(value.designChangeRequired, asString(value.designChange, 'No')) === 'Yes' ? 'Yes' : 'No',
    designChange: asString(value.designChange, asString(value.designChangeRequired, 'No')) === 'Yes' ? 'Yes' : 'No',
    paymentMethod: asString(value.paymentMethod) || undefined,
    otherPaymentMethod: asString(value.otherPaymentMethod) || undefined,
    needsMailing: asString(value.needsMailing) || undefined,
    productDetails: details,
    notifyManagement: typeof value.notifyManagement === 'boolean' ? value.notifyManagement : recommended.notifyManagement,
    notifyPrintTeam: typeof value.notifyPrintTeam === 'boolean' ? value.notifyPrintTeam : recommended.notifyPrintTeam,
    notifyDesigners: typeof value.notifyDesigners === 'boolean' ? value.notifyDesigners : recommended.notifyDesigners,
    notifyDigitalTeam: typeof value.notifyDigitalTeam === 'boolean' ? value.notifyDigitalTeam : recommended.notifyDigitalTeam,
    notifySocialMediaTeam: typeof value.notifySocialMediaTeam === 'boolean' ? value.notifySocialMediaTeam : recommended.notifySocialMediaTeam,
    notifyGeofencing: typeof value.notifyGeofencing === 'boolean' ? value.notifyGeofencing : recommended.notifyGeofencing,
    customerSignatureImage: asString(value.customerSignatureImage) || undefined,
    customerSignatureDate: asString(value.customerSignatureDate) || undefined
  } as Sale
}

function normalizeCustomerRecord(value: unknown): Customer | null {
  if (!isPlainObject(value) || !asString(value.id)) return null
  return {
    ...value,
    id: asString(value.id),
    businessName: asString(value.businessName, 'Unnamed customer'),
    businessAddress: asString(value.businessAddress),
    contactPerson: asString(value.contactPerson),
    emailAddress: asString(value.emailAddress),
    phoneNumber: asString(value.phoneNumber),
    noteEntries: Array.isArray(value.noteEntries) ? value.noteEntries : [],
    communicationHistory: Array.isArray(value.communicationHistory) ? value.communicationHistory : [],
    socialAccounts: isPlainObject(value.socialAccounts)
      ? Object.fromEntries(Object.entries(value.socialAccounts).filter(([, item]) => typeof item === 'string')) as Record<string, string>
      : {}
  } as Customer
}

function normalizeReminderRecord(value: unknown): Reminder | null {
  if (!isPlainObject(value) || !asString(value.id) || !asString(value.title)) return null
  return {
    ...value,
    id: asString(value.id),
    customerId: asString(value.customerId) || undefined,
    title: asString(value.title),
    date: asString(value.date) || undefined,
    dueDate: asString(value.dueDate, asString(value.date)) || undefined,
    assignedTo: asString(value.assignedTo) || undefined,
    completed: value.completed === true
  } as Reminder
}

function normalizeNotificationRecord(value: unknown, index = 0): Notification | null {
  if (!isPlainObject(value)) return null
  const source = asString(value.source)
  return {
    ...value,
    id: asString(value.id, `legacy-notification-${index}-${Date.now()}`),
    recipientRole: canonicalizeDepartmentName(value.recipientRole),
    title: asString(value.title, 'Notification'),
    message: asString(value.message, 'No message'),
    read: value.read === true,
    createdAt: asString(value.createdAt, new Date().toISOString()),
    source: source || undefined,
    type: asString(
      value.type,
      source === 'reminder' ? 'Reminder Notification' : source === 'management' ? 'Management Alert' : 'Sale Notification'
    ),
    archived: value.archived === true
  } as Notification
}

function dispatchStorageUpdateEvent() {
  window.dispatchEvent(new Event(STORAGE_UPDATE_EVENT))
}

export function readCRMData(): CRMData {
  const customers = safeParseJSON<unknown>(
    localStorage.getItem(STORAGE_KEYS.customers),
    []
  )
  const sales = safeParseJSON<unknown>(
    localStorage.getItem(STORAGE_KEYS.sales),
    []
  )
  const reminders = safeParseJSON<unknown>(
    localStorage.getItem(STORAGE_KEYS.reminders),
    []
  )
  const notifications = safeParseJSON<unknown>(
    localStorage.getItem(STORAGE_KEYS.notifications),
    []
  )
  const activities = safeParseJSON<unknown>(
    localStorage.getItem(STORAGE_KEYS.activities),
    []
  )
  const preferences = safeParseJSON<unknown>(
    localStorage.getItem(STORAGE_KEYS.preferences),
    {}
  )
  const notificationHistory = safeParseJSON<unknown>(
    localStorage.getItem(STORAGE_KEYS.notificationHistory),
    {}
  )

  return {
    customers: Array.isArray(customers) ? customers.map(normalizeCustomerRecord).filter((item): item is Customer => Boolean(item)) : [],
    sales: Array.isArray(sales) ? sales.map(normalizeSaleRecord).filter((item): item is Sale => Boolean(item)) : [],
    reminders: Array.isArray(reminders) ? reminders.map(normalizeReminderRecord).filter((item): item is Reminder => Boolean(item)) : [],
    notifications: Array.isArray(notifications)
      ? notifications
        .map(normalizeNotificationRecord)
        .filter((item): item is Notification => item !== null)
        .filter(item => !item.archived)
      : [],
    activities: Array.isArray(activities) ? activities.filter(isPlainObject) as unknown as Activity[] : [],
    preferences: isPlainObject(preferences) ? preferences as Preferences : {},
    notificationHistory: isPlainObject(notificationHistory) ? notificationHistory as NotificationHistory : {}
  }
}

export function writeCRMData(data: CRMData) {
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(Array.isArray(data.customers) ? data.customers : []))
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(Array.isArray(data.sales) ? data.sales : []))
  localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(Array.isArray(data.reminders) ? data.reminders : []))
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(Array.isArray(data.notifications) ? data.notifications : []))
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(Array.isArray(data.activities) ? data.activities : []))
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(isPlainObject(data.preferences) ? data.preferences : {}))
  localStorage.setItem(STORAGE_KEYS.notificationHistory, JSON.stringify(isPlainObject(data.notificationHistory) ? data.notificationHistory : {}))
  dispatchStorageUpdateEvent()
}

export function saveSale(sale: Sale) {
  const data = readCRMData()
  const updatedCustomers = data.customers.map((customer) => {
    if (customer.id !== sale.customerId) return customer
    if (String(customer.customerStatus ?? '').toLowerCase() !== 'prospect') return customer
    return { ...customer, customerStatus: 'Active' }
  })

  writeCRMData({
    ...data,
    sales: [...data.sales, sale],
    customers: updatedCustomers
  })
}

export function updateSale(sale: Sale) {
  const data = readCRMData()
  const existingIndex = data.sales.findIndex(s => s.id === sale.id)
  let newSales
  if (existingIndex >= 0) {
    newSales = [...data.sales]
    newSales[existingIndex] = sale
  } else {
    newSales = [...data.sales, sale]
  }

  const updatedCustomers = data.customers.map((customer) => {
    if (customer.id !== sale.customerId) return customer
    if (String(customer.customerStatus ?? '').toLowerCase() !== 'prospect') return customer
    return { ...customer, customerStatus: 'Active' }
  })

  writeCRMData({
    ...data,
    sales: newSales,
    customers: updatedCustomers
  })
}

function safeParseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch (err) {
    console.error('[StorageAdapter] JSON parse error:', err)
    return fallback
  }
}

export function markNotificationAsRead(notificationId: string) {
  const data = readCRMData()
  const notification = data.notifications.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
    writeCRMData(data)
  }
}

export function archiveNotification(notificationId: string) {
  const data = readCRMData()
  const notification = data.notifications.find(n => n.id === notificationId)
  if (notification) {
    notification.archived = true
    writeCRMData(data)
  }
}

export function deleteNotification(notificationId: string) {
  const data = readCRMData()
  data.notifications = data.notifications.filter(n => n.id !== notificationId)
  writeCRMData(data)
}

export function useLocalStorageAdapter() {
  const [data, setData] = useState<CRMData>({
    customers: [],
    sales: [],
    reminders: [],
    notifications: [],
    activities: [],
    preferences: {},
    notificationHistory: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = () => {
    setIsLoading(true)
    try {
      setData(readCRMData())
      setError(null)
    } catch (err) {
      console.error('[StorageAdapter] Error reading localStorage:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleStorageChange = () => {
      loadData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(STORAGE_UPDATE_EVENT, handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(STORAGE_UPDATE_EVENT, handleStorageChange)
    }
  }, [])

  return { data, isLoading, error, reload: loadData }
}

function parseSaleTotal(sale: Sale) {
  const revenue = sale.digitalFinalTotal ?? sale.dollarAmount ?? sale.productDetails?.totalInvestment
  return typeof revenue === 'number' && Number.isFinite(revenue) ? revenue : 0
}

function formatSaleDate(value: string | undefined) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
}

export function getStorageStats(data: CRMData) {
  return {
    customerCount: data.customers.length,
    salesCount: data.sales.length,
    reminderCount: data.reminders.length,
    notificationCount: data.notifications.filter(n => !n.read).length,
    activityCount: data.activities.length
  }
}

export function getDashboardStats(data: CRMData): DashboardStats {
  const activeCustomerCount = data.customers.filter(customer =>
    String(customer.customerStatus ?? '').toLowerCase() === 'active'
  ).length

  const prospectCount = data.customers.filter(customer =>
    String(customer.customerStatus ?? '').toLowerCase() === 'prospect'
  ).length

  const totalSalesRevenue = data.sales.reduce((sum, sale) => sum + parseSaleTotal(sale), 0)

  const openRemindersCount = data.reminders.filter(reminder => reminder.completed !== true).length

  const recentSales = data.sales
    .map<RecentSaleSummary>(sale => ({
      saleId: sale.id,
      businessName: sale.businessName ?? 'Unknown Client',
      saleType: sale.saleType || sale.saleCategory || 'Sale',
      saleDate: formatSaleDate(sale.saleDate),
      total: parseSaleTotal(sale)
    }))
    .sort((a, b) => (b.saleDate || '').localeCompare(a.saleDate || ''))
    .slice(0, 5)

  return {
    customerCount: data.customers.length,
    activeCustomerCount,
    prospectCount,
    salesCount: data.sales.length,
    totalSalesRevenue,
    openRemindersCount,
    recentSales
  }
}
