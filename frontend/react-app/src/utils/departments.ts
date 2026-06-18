import type { ProductDetails, Sale } from '@/types'

export const DEPARTMENTS = [
  'Management',
  'Print Team',
  'Designers',
  'Digital Team',
  'Social Media Team',
  'Geofencing'
] as const

export type DepartmentName = typeof DEPARTMENTS[number]
export type DepartmentNotificationFlag =
  | 'notifyManagement'
  | 'notifyPrintTeam'
  | 'notifyDesigners'
  | 'notifyDigitalTeam'
  | 'notifySocialMediaTeam'
  | 'notifyGeofencing'

export const DEPARTMENT_NOTIFICATION_OPTIONS: Array<{
  name: DepartmentName
  flag: DepartmentNotificationFlag
  description: string
}> = [
  { name: 'Management', flag: 'notifyManagement', description: 'Alert management about the new sale' },
  { name: 'Print Team', flag: 'notifyPrintTeam', description: 'Send production and mailing work to print' },
  { name: 'Designers', flag: 'notifyDesigners', description: 'Create a design or artwork-change task' },
  { name: 'Digital Team', flag: 'notifyDigitalTeam', description: 'Send digital setup and campaign work' },
  { name: 'Social Media Team', flag: 'notifySocialMediaTeam', description: 'Create a social campaign handoff' },
  { name: 'Geofencing', flag: 'notifyGeofencing', description: 'Create a geofencing campaign handoff' }
]

const LEGACY_DEPARTMENT_NAMES: Record<string, DepartmentName> = {
  management: 'Management',
  'print team': 'Print Team',
  'mailing team': 'Print Team',
  designers: 'Designers',
  'design team': 'Designers',
  'design department': 'Designers',
  'digital team': 'Digital Team',
  'digital department': 'Digital Team',
  'social media team': 'Social Media Team',
  'social team': 'Social Media Team',
  geofencing: 'Geofencing',
  'geofencing team': 'Geofencing'
}

export function canonicalizeDepartmentName(value: unknown, fallback = 'Sales Staff') {
  if (typeof value !== 'string') return fallback
  return LEGACY_DEPARTMENT_NAMES[value.trim().toLowerCase()] || value
}

function isYes(value: unknown) {
  return String(value || '').toLowerCase() === 'yes'
}

export function getRecommendedDepartmentNotifications(
  saleCategory: Sale['saleCategory'],
  details: ProductDetails = {}
): Record<DepartmentNotificationFlag, boolean> {
  const service = String(details.service || '')
  const designWorkSelected = (
    isYes(details.designRequired) ||
    isYes(details.designChangeRequired) ||
    (saleCategory === 'Print' && Number(details.designFee || 0) > 0)
  )

  return {
    notifyManagement: true,
    notifyPrintTeam: saleCategory === 'Mailer' || saleCategory === 'Print',
    notifyDesigners: (saleCategory === 'Mailer' || saleCategory === 'Print') && designWorkSelected,
    notifyDigitalTeam: saleCategory === 'Digital',
    notifySocialMediaTeam: service === 'Social Media Management',
    notifyGeofencing: service === 'Geofencing'
  }
}
