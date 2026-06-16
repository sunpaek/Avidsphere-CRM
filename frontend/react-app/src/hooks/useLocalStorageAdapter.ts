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

function dispatchStorageUpdateEvent() {
  window.dispatchEvent(new Event(STORAGE_UPDATE_EVENT))
}

export function readCRMData(): CRMData {
  const customers = safeParseJSON<Customer[]>(
    localStorage.getItem(STORAGE_KEYS.customers),
    []
  )
  const sales = safeParseJSON<Sale[]>(
    localStorage.getItem(STORAGE_KEYS.sales),
    []
  )
  const reminders = safeParseJSON<Reminder[]>(
    localStorage.getItem(STORAGE_KEYS.reminders),
    []
  )
  const notifications = safeParseJSON<Notification[]>(
    localStorage.getItem(STORAGE_KEYS.notifications),
    []
  )
  const activities = safeParseJSON<Activity[]>(
    localStorage.getItem(STORAGE_KEYS.activities),
    []
  )
  const preferences = safeParseJSON<Preferences>(
    localStorage.getItem(STORAGE_KEYS.preferences),
    {}
  )
  const notificationHistory = safeParseJSON<NotificationHistory>(
    localStorage.getItem(STORAGE_KEYS.notificationHistory),
    {}
  )

  return {
    customers: Array.isArray(customers) ? customers : [],
    sales: Array.isArray(sales) ? sales : [],
    reminders: Array.isArray(reminders) ? reminders : [],
    notifications: Array.isArray(notifications) ? notifications : [],
    activities: Array.isArray(activities) ? activities : [],
    preferences: typeof preferences === 'object' ? preferences : {},
    notificationHistory: typeof notificationHistory === 'object' ? notificationHistory : {}
  }
}

export function writeCRMData(data: CRMData) {
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(data.customers))
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(data.sales))
  localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(data.reminders))
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(data.notifications))
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(data.activities))
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(data.preferences))
  localStorage.setItem(STORAGE_KEYS.notificationHistory, JSON.stringify(data.notificationHistory))
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

function safeParseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch (err) {
    console.error('[StorageAdapter] JSON parse error:', err)
    return fallback
  }
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
