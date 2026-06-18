import type { Sale, Customer } from '@/types'
import { readCRMData, writeCRMData } from '@/hooks/useLocalStorageAdapter'
import type { DepartmentName } from '@/utils/departments'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

interface NotificationPayload {
  sale: Sale
  customer?: Customer
  agreementHtml?: string
  pdfBase64?: string
}

interface ApiResponse {
  success: boolean
  message: string
  data?: unknown
  error?: string
}

function getSaleServiceLabel(sale: Sale) {
  return String(sale.productDetails?.service || sale.saleType || sale.saleCategory || 'Sale')
}

function getNotificationTitle(sale: Sale, customerName: string) {
  const service = getSaleServiceLabel(sale)
  let workType = service

  if (sale.saleCategory === 'Mailer') workType = 'Mailer Order'
  else if (sale.saleCategory === 'Print') workType = 'Print Order'
  else if (service === 'Social Media Management') workType = 'Social Media Campaign'
  else if (service === 'Paid Ads' || service === 'Paid Advertising') workType = 'Paid Advertising Campaign'
  else if (service === 'Website' || service === 'Website Services') workType = 'Website Services Project'
  else if (service === 'Geofencing') workType = 'Geofencing Campaign'

  return `New ${workType} - ${customerName}`
}

function getNotificationMessage(sale: Sale, department: DepartmentName) {
  const status = sale.saleStatus || sale.status || 'New'
  return `Assigned Department: ${department}. Service: ${getSaleServiceLabel(sale)}. Status: ${status}.`
}

class NotificationApi {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE
  }

  private createLocalNotification(
    title: string,
    message: string,
    saleId: string,
    customerId: string | undefined,
    source: string,
    recipientRole: string,
    type = 'Sale Notification',
    priority: 'Normal' | 'High' = 'Normal'
  ) {
    const data = readCRMData()
    const duplicate = data.notifications.some(notification => (
      notification.relatedId === saleId && notification.source === source && !notification.archived
    ))
    if (duplicate) return
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    const notification = {
      id: notificationId,
      recipientRole,
      title,
      message,
      relatedId: saleId,
      relatedCustomerId: customerId,
      priority,
      source,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      archived: false
    }

    data.notifications.push(notification)
    writeCRMData(data)

    console.log('[notificationApi] Created local notification:', notificationId)
  }

  private async request(endpoint: string, payload?: NotificationPayload): Promise<ApiResponse> {
    try {
      console.log(`[notificationApi] POST ${endpoint}`, {
        saleName: payload?.sale?.businessName,
        saleId: payload?.sale?.id,
        customerName: payload?.customer?.businessName
      })

      const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload ? JSON.stringify(payload) : undefined
      })

      const data = await response.json() as ApiResponse

      if (!response.ok) {
        console.error(`[notificationApi] ${endpoint} failed:`, data)
        throw new Error(data.message || `Failed to send ${endpoint}`)
      }

      console.log(`[notificationApi] ${endpoint} success:`, data)
      return data
    } catch (error) {
      console.error(`[notificationApi] ${endpoint} error:`, error)
      // Return success: false but don't throw - we want notifications to fail gracefully
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: String(error)
      }
    }
  }

  async sendManagementNotification(payload: NotificationPayload): Promise<ApiResponse> {
    return this.request('send-management-email', payload)
  }

  async sendDesignerNotification(payload: NotificationPayload): Promise<ApiResponse> {
    return this.request('send-designer-email', payload)
  }

  async sendSocialNotification(payload: NotificationPayload): Promise<ApiResponse> {
    return this.request('send-social-email', payload)
  }

  async sendPrintTeamNotification(payload: NotificationPayload): Promise<ApiResponse> {
    return this.request('send-print-email', payload)
  }

  async sendDigitalTeamNotification(payload: NotificationPayload): Promise<ApiResponse> {
    return this.request('send-digital-email', payload)
  }

  async sendGeofencingNotification(payload: NotificationPayload): Promise<ApiResponse> {
    return this.request('send-geofencing-email', payload)
  }

  async sendAgreementEmail(payload: NotificationPayload): Promise<ApiResponse> {
    return this.request('send-agreement-email', payload)
  }

  async sendTestEmail(): Promise<ApiResponse> {
    return this.request('send-test-email')
  }

  /**
   * Send notifications to all enabled departments based on sale flags
   */
  async routeNotifications(
    sale: Sale,
    customer: Customer | undefined,
    options?: {
      agreementHtml?: string
      pdfBase64?: string
    }
  ): Promise<Map<string, ApiResponse>> {
    const results = new Map<string, ApiResponse>()
    const payload: NotificationPayload = {
      sale,
      customer,
      agreementHtml: options?.agreementHtml,
      pdfBase64: options?.pdfBase64
    }
    const customerName = sale.businessName || customer?.businessName || 'Unknown customer'
    const notificationTitle = getNotificationTitle(sale, customerName)

    const departmentRoutings = [
      {
        name: 'management',
        enabled: sale.notifyManagement === true,
        fn: () => this.sendManagementNotification(payload),
        recipientRole: 'Management' as DepartmentName,
        type: 'Management Alert',
        priority: 'High' as const,
        title: notificationTitle
      },
      {
        name: 'designers',
        enabled: sale.notifyDesigners === true,
        fn: () => this.sendDesignerNotification(payload),
        recipientRole: 'Designers' as DepartmentName,
        type: 'Sale Notification',
        priority: 'High' as const,
        title: notificationTitle
      },
      {
        name: 'social',
        enabled: sale.notifySocialMediaTeam === true,
        fn: () => this.sendSocialNotification(payload),
        recipientRole: 'Social Media Team' as DepartmentName,
        type: 'Sale Notification',
        priority: 'Normal' as const,
        title: notificationTitle
      },
      {
        name: 'print',
        enabled: sale.notifyPrintTeam === true,
        fn: () => this.sendPrintTeamNotification(payload),
        recipientRole: 'Print Team' as DepartmentName,
        type: 'Sale Notification',
        priority: 'High' as const,
        title: notificationTitle
      },
      {
        name: 'digital',
        enabled: sale.notifyDigitalTeam === true,
        fn: () => this.sendDigitalTeamNotification(payload),
        recipientRole: 'Digital Team' as DepartmentName,
        type: 'Sale Notification',
        priority: 'High' as const,
        title: notificationTitle
      },
      {
        name: 'geofencing',
        enabled: sale.notifyGeofencing === true,
        fn: () => this.sendGeofencingNotification(payload),
        recipientRole: 'Geofencing' as DepartmentName,
        type: 'Sale Notification',
        priority: 'Normal' as const,
        title: notificationTitle
      }
    ]

    const enabledRoutings = departmentRoutings.filter(routing => routing.enabled)
    enabledRoutings.forEach(routing => {
      this.createLocalNotification(
        routing.title,
        getNotificationMessage(sale, routing.recipientRole),
        sale.id,
        sale.customerId,
        routing.name,
        routing.recipientRole,
        routing.type,
        routing.priority
      )
      results.set(routing.name, {
        success: true,
        message: `${routing.recipientRole} in-app notification created.`
      })
    })

    // Email delivery is best-effort and does not control the durable in-app queue.
    void Promise.all(
      enabledRoutings
        .map(async (routing) => {
          try {
            const result = await routing.fn()
            console.log(`[notificationApi] Routed notification to ${routing.name}:`, result.success)
          } catch (error) {
            console.error(`[notificationApi] Error routing to ${routing.name}:`, error)
          }
        })
    )

    return results
  }
}

export const notificationApi = new NotificationApi()
