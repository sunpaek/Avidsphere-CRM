import type { CRMData } from '@/types'
import { STORAGE_KEYS } from '@/hooks/useLocalStorageAdapter'

const demoData: CRMData = {
  customers: [
    {
      id: 'cust-001',
      businessName: 'Blue Moon Bakery',
      businessAddress: '123 Main St, Austin, TX',
      contactPerson: 'Sunny Patel',
      emailAddress: 'sunny@bluemoonbakery.com',
      phoneNumber: '512-555-0198',
      notes: 'Ready to launch a new direct mail campaign.',
      dateCreated: '2026-05-20T10:30:00.000Z',
      lastContactDate: '2026-06-10T09:00:00.000Z',
      assignedSalesRepresentative: 'Sunny',
      customerStatus: 'Active',
      noteEntries: [
        {
          id: 'note-001',
          text: 'First meeting went well, customer asked for mockups by next week.',
          author: 'Sunny',
          timestamp: '2026-06-10T09:00:00.000Z'
        }
      ],
      communicationHistory: [
        {
          id: 'comm-001',
          type: 'Email',
          details: 'Proposal sent for June mailer campaign.',
          timestamp: '2026-06-10T09:00:00.000Z'
        }
      ],
      socialAccounts: {
        website: 'bluemoonbakery.com',
        facebook: 'BlueMoonBakery',
        instagram: 'BlueMoonBakery',
        linkedin: '',
        twitter: '',
        tiktok: '',
        youtube: ''
      }
    },
    {
      id: 'cust-002',
      businessName: 'Crescent Coffee Co.',
      businessAddress: '788 Coffee Loop, Denver, CO',
      contactPerson: 'Jordan Miles',
      emailAddress: 'jordan@crescentcoffee.com',
      phoneNumber: '303-555-0142',
      notes: 'Interested in digital ads and retargeting.',
      dateCreated: '2026-05-28T12:15:00.000Z',
      lastContactDate: '2026-06-08T10:15:00.000Z',
      assignedSalesRepresentative: 'Sunny',
      customerStatus: 'Prospect',
      noteEntries: [
        {
          id: 'note-002',
          text: 'Will review campaign budget after the next coffee expo.',
          author: 'Sunny',
          timestamp: '2026-06-08T10:15:00.000Z'
        }
      ],
      communicationHistory: [
        {
          id: 'comm-002',
          type: 'Call',
          details: 'Intro call to discuss paid social campaign.',
          timestamp: '2026-06-08T10:15:00.000Z'
        }
      ],
      socialAccounts: {
        website: 'crescentcoffee.com',
        facebook: 'CrescentCoffeeCo',
        instagram: 'CrescentCoffeeCo',
        linkedin: '',
        twitter: '',
        tiktok: '',
        youtube: ''
      }
    }
  ],
  sales: [
    {
      id: 'sale-001',
      customerId: 'cust-001',
      businessName: 'Blue Moon Bakery',
      saleType: 'Mailer Campaign',
      saleCategory: 'Mailer',
      saleDate: '2026-06-12T14:00:00.000Z',
      salesRepresentative: 'Sunny',
      dollarAmount: 4200,
      notes: '10,000-piece neighborhood mailer with promotional coupon.',
      designRequired: 'Yes',
      paymentMethod: 'Credit Card',
      productDetails: {
        service: 'Mailer',
        mailerArea: 'Austin South',
        month: 'June',
        mailerRunTime: 10,
        quantity: '10000',
        size: '6x11',
        finish: 'Matte'
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      notifyDigitalTeam: false,
      notifySocialMediaTeam: false,
      notifyGeofencing: false,
      saleStatus: 'Completed'
    },
    {
      id: 'sale-002',
      customerId: 'cust-002',
      businessName: 'Crescent Coffee Co.',
      saleType: 'Digital Ad Package',
      saleCategory: 'Digital',
      saleDate: '2026-06-08T10:15:00.000Z',
      salesRepresentative: 'Sunny',
      digitalFinalTotal: 5800,
      notes: 'Social and search ad bundle with weekly reporting.',
      designRequired: 'No',
      paymentMethod: 'Invoice',
      productDetails: {
        service: 'Digital Ads',
        socialPlatforms: ['Facebook', 'Instagram'],
        paidAdPlatforms: ['Google Ads'],
        monthlyAdSpend: '2800',
        startDate: '2026-06-15'
      },
      notifyManagement: true,
      notifyDigitalTeam: true,
      notifySocialMediaTeam: true,
      notifyGeofencing: false,
      saleStatus: 'Pending'
    }
  ],
  reminders: [
    {
      id: 'rem-001',
      customerId: 'cust-001',
      title: 'Review mailer proofs',
      dueDate: '2026-06-16T15:00:00.000Z',
      assignedTo: 'Sunny',
      notes: 'Confirm final copy and voucher placement.',
      completed: false
    },
    {
      id: 'rem-002',
      customerId: 'cust-002',
      title: 'Prepare digital ad schedule',
      dueDate: '2026-06-17T11:00:00.000Z',
      assignedTo: 'Sunny',
      notes: 'Coordinate campaign calendar with Crescent Coffee launch.',
      completed: false
    }
  ],
  notifications: [
    {
      id: 'notif-001',
      recipientRole: 'Sales Staff',
      title: 'New sale recorded',
      message: 'Blue Moon Bakery mailer sale has been added to the CRM.',
      relatedId: 'sale-001',
      relatedCustomerId: 'cust-001',
      priority: 'Normal',
      source: 'sales',
      type: 'Sale Notification',
      read: false,
      createdAt: '2026-06-12T14:05:00.000Z',
      archived: false
    },
    {
      id: 'notif-002',
      recipientRole: 'Sales Staff',
      title: 'Reminder due soon',
      message: 'Review mailer proofs for Blue Moon Bakery before the deadline.',
      relatedId: 'rem-001',
      relatedCustomerId: 'cust-001',
      priority: 'High',
      source: 'reminder',
      type: 'Reminder Notification',
      read: false,
      createdAt: '2026-06-14T09:30:00.000Z',
      archived: false
    }
  ],
  activities: [
    {
      id: 'act-001',
      type: 'Sale',
      title: 'Mailer campaign booked',
      details: 'Blue Moon Bakery order created for June direct mail.',
      relatedId: 'sale-001',
      timestamp: '2026-06-12T14:05:00.000Z'
    },
    {
      id: 'act-002',
      type: 'Reminder',
      title: 'Proof review scheduled',
      details: 'Reminder set for Blue Moon Bakery to approve final mailer proof.',
      relatedId: 'rem-001',
      timestamp: '2026-06-14T09:30:00.000Z'
    }
  ],
  preferences: {
    currentRole: 'Sales Staff',
    filters: {
      search: '',
      customerStatus: 'All',
      representative: 'All',
      sortField: 'dateCreated',
      sortDirection: 'desc'
    },
    calendarMonth: '2026-06-01T00:00:00.000Z',
    selectedCalendarDate: '2026-06-12T00:00:00.000Z',
    activeView: 'dashboard',
    currentCustomerId: undefined,
    notificationFilterType: 'All',
    notificationSortType: 'Newest',
    reportsDateRange: 'this-month'
  },
  notificationHistory: {
    'notif-001': { read: false, seenAt: '2026-06-12T14:06:00.000Z' },
    'notif-002': { read: false, seenAt: '2026-06-14T09:31:00.000Z' }
  }
}

export function seedReactDemoData() {
  ;(Object.keys(demoData) as Array<keyof CRMData>).forEach((key) => {
    const storageKey = STORAGE_KEYS[key]
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(demoData[key]))
  })
}
