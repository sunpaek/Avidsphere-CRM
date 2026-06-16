// Avidsphere CRM Type Definitions (read from localStorage)

export interface Customer {
  id: string
  businessName: string
  businessAddress: string
  contactPerson: string
  emailAddress: string
  phoneNumber: string
  notes?: string
  dateCreated?: string
  lastContactDate?: string
  assignedSalesRepresentative?: string
  customerStatus?: string
  noteEntries?: NoteEntry[]
  communicationHistory?: CommunicationEntry[]
  socialAccounts?: Record<string, string>
}

export interface NoteEntry {
  id: string
  text: string
  author?: string
  timestamp?: string
}

export interface CommunicationEntry {
  id: string
  type: string
  details?: string
  timestamp?: string
}

export interface Sale {
  id: string
  customerId: string
  businessName?: string
  saleType: string
  saleCategory: 'Mailer' | 'Digital' | 'Print'
  saleDate: string
  salesRepresentative: string
  dollarAmount?: number
  digitalFinalTotal?: number
  notes?: string
  designRequired?: 'Yes' | 'No'
  designChangeRequired?: 'Yes' | 'No'
  paymentMethod?: string
  status?: string
  saleStatus?: string
  productDetails?: ProductDetails
  notifyManagement?: boolean
  notifyPrintTeam?: boolean
  notifyDesigners?: boolean
  notifyDigitalTeam?: boolean
  notifySocialMediaTeam?: boolean
  notifyGeofencing?: boolean
}

export interface ProductDetails {
  service?: string
  mailerArea?: string
  month?: string
  mailerRunTime?: number
  adSize?: string
  printType?: string
  quantity?: string
  size?: string
  finish?: string
  thickness?: string
  fold?: string
  socialPlatforms?: string[]
  paidAdPlatforms?: string[]
  websiteOption?: string
  monthlyAdSpend?: string
  startDate?: string
  [key: string]: unknown
}

export interface Reminder {
  id: string
  customerId?: string
  title: string
  date?: string
  dueDate?: string
  assignedTo?: string
  notes?: string
  priority?: 'Low' | 'Normal' | 'Medium' | 'High'
  status?: string
  completed?: boolean
}

export interface Notification {
  id: string
  recipientRole: string
  title: string
  message: string
  relatedId?: string
  relatedCustomerId?: string
  priority?: 'Normal' | 'High'
  source?: string
  type?: string
  read: boolean
  createdAt: string
  archived?: boolean
}

export interface RecentSaleSummary {
  saleId: string
  businessName: string
  saleType: string
  saleDate: string
  total: number
}

export interface DashboardStats {
  customerCount: number
  activeCustomerCount: number
  prospectCount: number
  salesCount: number
  totalSalesRevenue: number
  openRemindersCount: number
  recentSales: RecentSaleSummary[]
}

export interface Activity {
  id: string
  type: string
  title: string
  details?: string
  relatedId?: string
  timestamp: string
}

export interface Preferences {
  currentRole?: string
  filters?: Record<string, unknown>
  calendarMonth?: string
  selectedCalendarDate?: string
  activeView?: string
  currentCustomerId?: string
  notificationFilterType?: string
  notificationSortType?: string
  reportsDateRange?: string
}

export interface NotificationHistory {
  [key: string]: unknown
}

export interface CRMData {
  customers: Customer[]
  sales: Sale[]
  reminders: Reminder[]
  notifications: Notification[]
  activities: Activity[]
  preferences: Preferences
  notificationHistory: NotificationHistory
}
