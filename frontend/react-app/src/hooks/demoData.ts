import type { CRMData } from '@/types'
import { writeCRMData } from '@/hooks/useLocalStorageAdapter'

const CURRENT_USER = 'Sunny'

const demoData: CRMData = {
  customers: [
    {
      id: 'cust-001',
      businessName: 'Blue Moon Bakery',
      businessAddress: '123 Main St, Lancaster, PA',
      contactPerson: 'Maya Patel',
      emailAddress: 'maya@bluemoonbakery.com',
      phoneNumber: '717-555-0198',
      notes: 'Seasonal direct-mail customer with strong coupon redemption.',
      dateCreated: '2026-02-12T10:30:00.000Z',
      lastContactDate: '2026-06-15T09:00:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Active',
      noteEntries: [
        { id: 'note-001', text: 'Requested a July offer featuring catering trays.', author: CURRENT_USER, timestamp: '2026-06-15T09:00:00.000Z' },
        { id: 'note-002', text: 'Spring coupon mailer produced 143 tracked redemptions.', author: CURRENT_USER, timestamp: '2026-05-20T14:15:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-001', type: 'Email', details: 'Sent July 3x8 mailer proof and updated coupon copy.', timestamp: '2026-06-15T09:00:00.000Z' },
        { id: 'comm-002', type: 'Call', details: 'Reviewed results from the previous 3x4 neighborhood mailer.', timestamp: '2026-05-20T14:15:00.000Z' }
      ],
      socialAccounts: { website: 'bluemoonbakery.com', facebook: 'BlueMoonBakeryPA', instagram: 'BlueMoonBakeryPA' }
    },
    {
      id: 'cust-002',
      businessName: 'Crescent Coffee Co.',
      businessAddress: '788 Market Street, Reading, PA',
      contactPerson: 'Jordan Miles',
      emailAddress: 'jordan@crescentcoffee.com',
      phoneNumber: '610-555-0142',
      notes: 'Growing retail and wholesale brand using social and paid media.',
      dateCreated: '2026-03-04T12:15:00.000Z',
      lastContactDate: '2026-06-16T10:15:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Active',
      noteEntries: [
        { id: 'note-003', text: 'Wholesale lead campaign should prioritize independent restaurants.', author: CURRENT_USER, timestamp: '2026-06-16T10:15:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-003', type: 'Meeting', details: 'Approved summer social calendar and Google Ads launch.', timestamp: '2026-06-16T10:15:00.000Z' },
        { id: 'comm-004', type: 'Email', details: 'Shared May engagement recap and creative recommendations.', timestamp: '2026-06-03T15:20:00.000Z' }
      ],
      socialAccounts: { website: 'crescentcoffee.com', facebook: 'CrescentCoffeeCo', instagram: 'CrescentCoffeeCo', tiktok: 'CrescentRoasts' }
    },
    {
      id: 'cust-003',
      businessName: 'Northstar Wellness',
      businessAddress: '440 Lakeview Ave, Lititz, PA',
      contactPerson: 'Morgan Lee',
      emailAddress: 'morgan@northstarwellness.com',
      phoneNumber: '717-555-0136',
      notes: 'Second location opening; coordinated print collateral is in production.',
      dateCreated: '2026-01-22T13:45:00.000Z',
      lastContactDate: '2026-06-13T16:30:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Active',
      noteEntries: [
        { id: 'note-004', text: 'Approved heavier brochure stock and soft-touch business cards.', author: CURRENT_USER, timestamp: '2026-06-13T16:30:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-005', type: 'Meeting', details: 'Reviewed brochure fold, signage dimensions, and opening schedule.', timestamp: '2026-06-13T16:30:00.000Z' },
        { id: 'comm-006', type: 'Call', details: 'Confirmed reorder of new-patient rack cards.', timestamp: '2026-05-11T11:00:00.000Z' }
      ],
      socialAccounts: { website: 'northstarwellness.com', facebook: 'NorthstarWellness', instagram: 'NorthstarWellness', linkedin: 'company/northstar-wellness' }
    },
    {
      id: 'cust-004',
      businessName: 'Keystone Family Dental',
      businessAddress: '82 Walnut Lane, Ephrata, PA',
      contactPerson: 'Dr. Elena Brooks',
      emailAddress: 'elena@keystonefamilydental.com',
      phoneNumber: '717-555-0117',
      notes: 'New prospect evaluating a new-patient campaign for late summer.',
      dateCreated: '2026-06-05T09:20:00.000Z',
      lastContactDate: '2026-06-11T13:30:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Prospect',
      noteEntries: [
        { id: 'note-005', text: 'Interested in combining mailers with a landing page.', author: CURRENT_USER, timestamp: '2026-06-11T13:30:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-007', type: 'Call', details: 'Discovery call covering new-patient goals and service area.', timestamp: '2026-06-11T13:30:00.000Z' }
      ],
      socialAccounts: { website: 'keystonefamilydental.com', facebook: 'KeystoneFamilyDental' }
    },
    {
      id: 'cust-005',
      businessName: 'Riverbend Realty Group',
      businessAddress: '19 Riverfront Plaza, Harrisburg, PA',
      contactPerson: 'Avery Chen',
      emailAddress: 'avery@riverbendrealty.com',
      phoneNumber: '717-555-0164',
      notes: 'Uses geofencing and oversized mailers for new developments.',
      dateCreated: '2025-11-18T15:00:00.000Z',
      lastContactDate: '2026-06-14T08:45:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Active',
      noteEntries: [
        { id: 'note-006', text: 'Model-home campaign should include nearby apartment communities.', author: CURRENT_USER, timestamp: '2026-06-14T08:45:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-008', type: 'Email', details: 'Received final addresses and model-home event dates.', timestamp: '2026-06-14T08:45:00.000Z' },
        { id: 'comm-009', type: 'Meeting', details: 'Mapped geofences around three competing developments.', timestamp: '2026-06-02T14:00:00.000Z' }
      ],
      socialAccounts: { website: 'riverbendrealty.com', facebook: 'RiverbendRealtyGroup', instagram: 'RiverbendHomes', linkedin: 'company/riverbend-realty-group' }
    },
    {
      id: 'cust-006',
      businessName: 'Harbor Home Services',
      businessAddress: '610 Harbor Road, Lebanon, PA',
      contactPerson: 'Sam Rodriguez',
      emailAddress: 'sam@harborhomeservices.com',
      phoneNumber: '717-555-0129',
      notes: 'Completed website launch and spring leave-behind print package.',
      dateCreated: '2025-09-08T11:10:00.000Z',
      lastContactDate: '2026-04-28T10:00:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Closed',
      noteEntries: [
        { id: 'note-007', text: 'Account closed after successful project delivery; revisit in Q4.', author: CURRENT_USER, timestamp: '2026-04-28T10:00:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-010', type: 'Email', details: 'Delivered website credentials and final print inventory.', timestamp: '2026-04-28T10:00:00.000Z' }
      ],
      socialAccounts: { website: 'harborhomeservices.com', facebook: 'HarborHomeServices', instagram: 'HarborHomeServices' }
    },
    {
      id: 'cust-007',
      businessName: 'Lancaster Pet Market',
      businessAddress: '245 Orange Street, Lancaster, PA',
      contactPerson: 'Priya Shah',
      emailAddress: 'priya@lancasterpetmarket.com',
      phoneNumber: '717-555-0183',
      notes: 'Repeat print customer preparing a loyalty-program relaunch.',
      dateCreated: '2026-02-28T08:40:00.000Z',
      lastContactDate: '2026-06-12T12:25:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Active',
      noteEntries: [
        { id: 'note-008', text: 'Mail loyalty postcards after the new POS rollout.', author: CURRENT_USER, timestamp: '2026-06-12T12:25:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-011', type: 'Call', details: 'Confirmed postcard list count and presort requirements.', timestamp: '2026-06-12T12:25:00.000Z' },
        { id: 'comm-012', type: 'Email', details: 'Approved reorder of grooming service rack cards.', timestamp: '2026-05-06T09:10:00.000Z' }
      ],
      socialAccounts: { website: 'lancasterpetmarket.com', facebook: 'LancasterPetMarket', instagram: 'LancasterPetMarket' }
    },
    {
      id: 'cust-008',
      businessName: 'Greenfield Fitness Studio',
      businessAddress: '31 College Avenue, Millersville, PA',
      contactPerson: 'Taylor Green',
      emailAddress: 'taylor@greenfieldfitness.com',
      phoneNumber: '717-555-0175',
      notes: 'Prospect interested in membership growth before the fall semester.',
      dateCreated: '2026-06-09T14:10:00.000Z',
      lastContactDate: '2026-06-09T14:10:00.000Z',
      assignedSalesRepresentative: CURRENT_USER,
      customerStatus: 'Prospect',
      noteEntries: [
        { id: 'note-009', text: 'Send options for paid social and student apartment geofencing.', author: CURRENT_USER, timestamp: '2026-06-09T14:10:00.000Z' }
      ],
      communicationHistory: [
        { id: 'comm-013', type: 'Meeting', details: 'Initial consultation about fall membership acquisition.', timestamp: '2026-06-09T14:10:00.000Z' }
      ],
      socialAccounts: { website: 'greenfieldfitness.com', instagram: 'GreenfieldFitnessStudio', tiktok: 'GreenfieldFit' }
    }
  ],
  sales: [
    {
      id: 'sale-001',
      customerId: 'cust-001',
      businessName: 'Blue Moon Bakery',
      saleType: 'Mailer Campaign',
      saleCategory: 'Mailer',
      saleDate: '2026-06-15T09:20:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 1830,
      notes: 'July catering offer for the Lancaster city route.',
      designRequired: 'No',
      designChangeRequired: 'Yes',
      designChange: 'Yes',
      paymentMethod: 'Credit Card',
      productDetails: {
        service: 'Mailer',
        mailerArea: '17603',
        month: 'July',
        mailerRunTime: 3,
        adSize: '3x8',
        discountType: 'Dollar Amount',
        discountValue: 150,
        totalInvestment: 1830,
        designRequired: 'No',
        designChangeRequired: 'Yes'
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      saleStatus: 'Proofing'
    },
    {
      id: 'sale-002',
      customerId: 'cust-001',
      businessName: 'Blue Moon Bakery',
      saleType: 'Mailer Campaign',
      saleCategory: 'Mailer',
      saleDate: '2026-05-18T14:00:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 1866,
      notes: 'Repeat-order neighborhood coupon mailer.',
      designRequired: 'Yes',
      designChangeRequired: 'No',
      paymentMethod: 'Credit Card',
      productDetails: {
        service: 'Mailer',
        mailerArea: '17602',
        month: 'June',
        mailerRunTime: 6,
        adSize: '3x4',
        discountType: 'Percentage',
        discountValue: 10,
        totalInvestment: 1866,
        designRequired: 'Yes',
        designChangeRequired: 'No'
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      saleStatus: 'Completed'
    },
    {
      id: 'sale-003',
      customerId: 'cust-005',
      businessName: 'Riverbend Realty Group',
      saleType: 'Mailer Campaign',
      saleCategory: 'Mailer',
      saleDate: '2026-06-10T11:30:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 4025,
      notes: 'Oversized four-month new-development awareness placement.',
      designRequired: 'Yes',
      designChangeRequired: 'Yes',
      designChange: 'Yes',
      paymentMethod: 'ACH',
      productDetails: {
        service: 'Mailer',
        mailerArea: 'Hershey',
        month: 'June',
        mailerRunTime: 4,
        adSize: '3x12',
        discountType: 'None',
        discountValue: 0,
        totalInvestment: 4025,
        designRequired: 'Yes',
        designChangeRequired: 'Yes'
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      saleStatus: 'In Production'
    },
    {
      id: 'sale-004',
      customerId: 'cust-003',
      businessName: 'Northstar Wellness',
      saleType: 'BROCHURES',
      saleCategory: 'Print',
      saleDate: '2026-06-13T16:45:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 2945,
      notes: 'Tri-fold new-location brochures with soft-touch finish.',
      designRequired: 'Yes',
      designChangeRequired: 'No',
      paymentMethod: 'ACH',
      needsMailing: 'No',
      productDetails: {
        printType: 'BROCHURES',
        quantity: 5000,
        size: '8.5x11',
        finish: 'Matte',
        thickness: '100lb',
        fold: 'Tri-Fold',
        needsMailing: false,
        description: 'New patient services and grand-opening offer.',
        projectPrice: 2645,
        designFee: 300,
        discountType: 'None',
        totalInvestment: 2945
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      saleStatus: 'In Production'
    },
    {
      id: 'sale-005',
      customerId: 'cust-003',
      businessName: 'Northstar Wellness',
      saleType: 'RACK CARDS',
      saleCategory: 'Print',
      saleDate: '2026-05-11T11:15:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 875,
      notes: 'Reorder of patient referral rack cards.',
      designRequired: 'No',
      designChangeRequired: 'Yes',
      paymentMethod: 'Invoice',
      productDetails: {
        printType: 'RACK CARDS',
        quantity: 2500,
        size: '4x9',
        finish: 'High Gloss UV',
        thickness: '16pt',
        fold: 'None',
        needsMailing: false,
        description: 'Reorder with updated phone number.',
        projectPrice: 925,
        designFee: 0,
        discountType: 'Dollar Amount',
        discountValue: 50,
        totalInvestment: 875
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      saleStatus: 'Completed'
    },
    {
      id: 'sale-006',
      customerId: 'cust-007',
      businessName: 'Lancaster Pet Market',
      saleType: 'POSTCARDS',
      saleCategory: 'Print',
      saleDate: '2026-06-12T12:40:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 2125,
      notes: 'Loyalty-program relaunch postcard with presorted mailing.',
      designRequired: 'Yes',
      designChangeRequired: 'No',
      paymentMethod: 'Invoice',
      needsMailing: 'Yes',
      productDetails: {
        printType: 'POSTCARDS',
        quantity: 8500,
        size: '6x9',
        finish: 'Gloss',
        thickness: '14pt',
        fold: 'None',
        needsMailing: true,
        mailingOption: 'Presorted',
        description: 'Variable coupon codes by customer segment.',
        projectPrice: 1950,
        designFee: 175,
        discountType: 'None',
        totalInvestment: 2125
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      saleStatus: 'List Processing'
    },
    {
      id: 'sale-007',
      customerId: 'cust-007',
      businessName: 'Lancaster Pet Market',
      saleType: 'RACK CARDS',
      saleCategory: 'Print',
      saleDate: '2026-05-06T09:20:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 690,
      notes: 'Repeat grooming rack-card order.',
      designRequired: 'No',
      designChangeRequired: 'No',
      paymentMethod: 'Credit Card',
      productDetails: {
        printType: 'RACK CARDS',
        quantity: 2000,
        size: '4x9',
        finish: 'Gloss',
        thickness: '14pt',
        fold: 'None',
        needsMailing: false,
        projectPrice: 690,
        designFee: 0,
        discountType: 'None',
        totalInvestment: 690
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      saleStatus: 'Completed'
    },
    {
      id: 'sale-008',
      customerId: 'cust-002',
      businessName: 'Crescent Coffee Co.',
      saleType: 'Social Media Management',
      saleCategory: 'Digital',
      saleDate: '2026-06-16T10:30:00.000Z',
      salesRepresentative: CURRENT_USER,
      digitalFinalTotal: 2280,
      notes: 'Three-platform content and community management package.',
      designRequired: 'Yes',
      paymentMethod: 'Invoice',
      productDetails: {
        service: 'Social Media Management',
        servicePrice: 2400,
        discountType: 'Percentage',
        discountValue: 5,
        totalInvestment: 2280,
        monthlyAdSpend: 600,
        socialPlatforms: ['Facebook', 'Instagram', 'TikTok'],
        socialUsernames: '@CrescentCoffeeCo',
        socialStartDate: '2026-06-22',
        campaignGoal: 'Increase retail visits and wholesale inquiries.',
        campaignNotes: 'Feature roasting process, staff stories, and summer drinks.'
      },
      notifyManagement: true,
      notifyDesigners: false,
      notifyDigitalTeam: true,
      notifySocialMediaTeam: true,
      saleStatus: 'Scheduled'
    },
    {
      id: 'sale-009',
      customerId: 'cust-002',
      businessName: 'Crescent Coffee Co.',
      saleType: 'Paid Ads',
      saleCategory: 'Digital',
      saleDate: '2026-06-06T15:10:00.000Z',
      salesRepresentative: CURRENT_USER,
      digitalFinalTotal: 3200,
      notes: 'Search and Meta lead generation for wholesale accounts.',
      designRequired: 'Yes',
      paymentMethod: 'Invoice',
      productDetails: {
        service: 'Paid Ads',
        servicePrice: 3400,
        discountType: 'Dollar Amount',
        discountValue: 200,
        totalInvestment: 3200,
        monthlyAdSpend: 2800,
        paidAdPlatforms: ['Google Ads', 'Meta Ads'],
        targetAreas: 'Reading, Lancaster, Allentown',
        targetLocations: 'Independent restaurants and boutique grocers',
        demographicAge: '28-55',
        demographicSex: 'All',
        demographicIncome: '$55k+',
        startDate: '2026-06-20',
        campaignGoal: 'Generate qualified wholesale tasting requests.',
        campaignNotes: 'Use separate landing pages for restaurant and retail leads.'
      },
      notifyManagement: true,
      notifyDesigners: false,
      notifyDigitalTeam: true,
      notifySocialMediaTeam: false,
      saleStatus: 'Setup'
    },
    {
      id: 'sale-010',
      customerId: 'cust-006',
      businessName: 'Harbor Home Services',
      saleType: 'Website',
      saleCategory: 'Digital',
      saleDate: '2026-04-18T10:30:00.000Z',
      salesRepresentative: CURRENT_USER,
      digitalFinalTotal: 7800,
      notes: 'Completed lead-generation website rebuild.',
      designRequired: 'Yes',
      paymentMethod: 'ACH',
      productDetails: {
        service: 'Website',
        servicePrice: 8000,
        discountType: 'Dollar Amount',
        discountValue: 200,
        totalInvestment: 7800,
        monthlyAdSpend: 1,
        websiteOption: 'Redo Current Site',
        websiteUrl: 'https://harborhomeservices.com',
        landingPageUrl: 'https://harborhomeservices.com/schedule',
        websitePrimaryGoal: 'Generate booked estimates from mobile visitors.',
        pages: 'Home, Services, Service Areas, Reviews, About, Contact',
        campaignNotes: 'Integrated quote form, call tracking, and review feed.'
      },
      notifyManagement: true,
      notifyDesigners: false,
      notifyDigitalTeam: true,
      saleStatus: 'Completed'
    },
    {
      id: 'sale-011',
      customerId: 'cust-005',
      businessName: 'Riverbend Realty Group',
      saleType: 'Geofencing',
      saleCategory: 'Digital',
      saleDate: '2026-06-02T14:20:00.000Z',
      salesRepresentative: CURRENT_USER,
      digitalFinalTotal: 4650,
      notes: 'Geofencing campaign supporting model-home weekend traffic.',
      designRequired: 'Yes',
      paymentMethod: 'ACH',
      productDetails: {
        service: 'Geofencing',
        servicePrice: 4900,
        discountType: 'Dollar Amount',
        discountValue: 250,
        totalInvestment: 4650,
        monthlyAdSpend: 3500,
        campaignType: 'Static Display',
        targetAreas: 'Harrisburg and Mechanicsburg',
        targetLocations: 'Competing developments, apartment communities, mortgage offices',
        demographicAge: '30-64',
        demographicSex: 'All',
        demographicIncome: '$75k+',
        startDate: '2026-06-19',
        campaignGoal: 'Drive qualified visitors to model-home events.',
        campaignNotes: 'Retarget fence visitors for 30 days after initial visit.'
      },
      notifyManagement: true,
      notifyDesigners: false,
      notifyDigitalTeam: true,
      notifyGeofencing: true,
      saleStatus: 'Geofences Building'
    },
    {
      id: 'sale-012',
      customerId: 'cust-006',
      businessName: 'Harbor Home Services',
      saleType: 'DOOR HANGERS',
      saleCategory: 'Print',
      saleDate: '2026-04-22T13:00:00.000Z',
      salesRepresentative: CURRENT_USER,
      dollarAmount: 1375,
      notes: 'Spring service-area door hanger package.',
      designRequired: 'Yes',
      designChangeRequired: 'No',
      paymentMethod: 'ACH',
      productDetails: {
        printType: 'DOOR HANGERS',
        quantity: 10000,
        size: '4.25x11',
        finish: 'High Gloss UV',
        thickness: '14pt',
        fold: 'None',
        needsMailing: false,
        description: 'HVAC tune-up and plumbing inspection offers.',
        projectPrice: 1225,
        designFee: 150,
        discountType: 'None',
        totalInvestment: 1375
      },
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      saleStatus: 'Completed'
    }
  ],
  reminders: [
    { id: 'rem-001', customerId: 'cust-001', title: 'Approve July mailer proof', date: '2026-06-17', dueDate: '2026-06-17', assignedTo: CURRENT_USER, notes: 'Confirm catering photo, coupon code, and expiration date.', priority: 'High', status: 'Open', completed: false },
    { id: 'rem-002', customerId: 'cust-002', title: 'Digital campaign kickoff', date: '2026-06-18', dueDate: '2026-06-18', assignedTo: CURRENT_USER, notes: 'Review access, tracking, creative queue, and reporting cadence.', priority: 'High', status: 'Open', completed: false },
    { id: 'rem-003', customerId: 'cust-003', title: 'Confirm brochure production proof', date: '2026-06-19', dueDate: '2026-06-19', assignedTo: CURRENT_USER, notes: 'Check fold panels, phone number, and soft-touch stock.', priority: 'Normal', status: 'Open', completed: false },
    { id: 'rem-004', customerId: 'cust-004', title: 'Send dental campaign options', date: '2026-06-20', dueDate: '2026-06-20', assignedTo: CURRENT_USER, notes: 'Include 3x8 mailer and landing-page package options.', priority: 'Normal', status: 'Open', completed: false },
    { id: 'rem-005', customerId: 'cust-005', title: 'Review geofence map', date: '2026-06-16', dueDate: '2026-06-16', assignedTo: CURRENT_USER, notes: 'Client needs final map before creative trafficking.', priority: 'High', status: 'Overdue', completed: false },
    { id: 'rem-006', customerId: 'cust-007', title: 'Upload loyalty mailing list', date: '2026-06-22', dueDate: '2026-06-22', assignedTo: CURRENT_USER, notes: 'Remove duplicates and confirm presort count.', priority: 'Medium', status: 'Open', completed: false },
    { id: 'rem-007', customerId: 'cust-008', title: 'Follow up on fall membership proposal', date: '2026-06-24', dueDate: '2026-06-24', assignedTo: CURRENT_USER, notes: 'Discuss paid social versus geofencing budget split.', priority: 'Normal', status: 'Open', completed: false },
    { id: 'rem-008', customerId: 'cust-001', title: 'Record June mailer results', date: '2026-06-12', dueDate: '2026-06-12', assignedTo: CURRENT_USER, notes: 'Redemption total added to customer notes.', priority: 'Low', status: 'Completed', completed: true },
    { id: 'rem-009', customerId: 'cust-006', title: 'Website handoff call', date: '2026-04-28', dueDate: '2026-04-28', assignedTo: CURRENT_USER, notes: 'Credentials and training delivered.', priority: 'Normal', status: 'Completed', completed: true }
  ],
  notifications: [
    { id: 'notif-001', recipientRole: 'Management', title: 'New Mailer Order - Blue Moon Bakery', message: 'Assigned Department: Management. Service: Mailer Campaign. Status: Proofing.', relatedId: 'sale-001', relatedCustomerId: 'cust-001', priority: 'Normal', source: 'management', type: 'Management Alert', read: false, createdAt: '2026-06-15T09:22:00.000Z', archived: false },
    { id: 'notif-002', recipientRole: 'Print Team', title: 'New Mailer Order - Blue Moon Bakery', message: 'Assigned Department: Print Team. Service: Mailer Campaign. Status: Proofing.', relatedId: 'sale-001', relatedCustomerId: 'cust-001', priority: 'High', source: 'print', type: 'Sale Notification', read: false, createdAt: '2026-06-15T09:23:00.000Z', archived: false },
    { id: 'notif-003', recipientRole: 'Designers', title: 'New Mailer Order - Blue Moon Bakery', message: 'Assigned Department: Designers. Service: Mailer Campaign. Status: Proofing.', relatedId: 'sale-001', relatedCustomerId: 'cust-001', priority: 'High', source: 'design', type: 'Sale Notification', read: false, createdAt: '2026-06-15T09:24:00.000Z', archived: false },
    { id: 'notif-004', recipientRole: 'Social Media Team', title: 'New Social Media Campaign - Crescent Coffee Co.', message: 'Assigned Department: Social Media Team. Service: Social Media Management. Status: Scheduled.', relatedId: 'sale-008', relatedCustomerId: 'cust-002', priority: 'Normal', source: 'social', type: 'Sale Notification', read: false, createdAt: '2026-06-16T10:32:00.000Z', archived: false },
    { id: 'notif-005', recipientRole: 'Digital Team', title: 'New Paid Advertising Campaign - Crescent Coffee Co.', message: 'Assigned Department: Digital Team. Service: Paid Ads. Status: Setup.', relatedId: 'sale-009', relatedCustomerId: 'cust-002', priority: 'High', source: 'digital', type: 'Sale Notification', read: false, createdAt: '2026-06-06T15:12:00.000Z', archived: false },
    { id: 'notif-006', recipientRole: 'Geofencing', title: 'New Geofencing Campaign - Riverbend Realty Group', message: 'Assigned Department: Geofencing. Service: Geofencing. Status: Geofences Building.', relatedId: 'sale-011', relatedCustomerId: 'cust-005', priority: 'High', source: 'geofencing', type: 'Sale Notification', read: false, createdAt: '2026-06-02T14:22:00.000Z', archived: false },
    { id: 'notif-007', recipientRole: 'Print Team', title: 'Brochure production task', message: 'Northstar Wellness approved 5,000 tri-fold brochures for production.', relatedId: 'sale-004', relatedCustomerId: 'cust-003', priority: 'High', source: 'print', type: 'Sale Notification', read: true, createdAt: '2026-06-13T16:47:00.000Z', archived: false },
    { id: 'notif-008', recipientRole: 'Designers', title: 'Brochure files need preflight', message: 'Review Northstar Wellness brochure panels and image resolution.', relatedId: 'sale-004', relatedCustomerId: 'cust-003', priority: 'Normal', source: 'design', type: 'Sale Notification', read: false, createdAt: '2026-06-13T16:48:00.000Z', archived: false },
    { id: 'notif-009', recipientRole: 'Print Team', title: 'Mailing list processing required', message: 'Lancaster Pet Market loyalty postcards require presort and duplicate removal.', relatedId: 'sale-006', relatedCustomerId: 'cust-007', priority: 'High', source: 'print', type: 'Sale Notification', read: false, createdAt: '2026-06-12T12:42:00.000Z', archived: false },
    { id: 'notif-010', recipientRole: 'Sales Staff', title: 'Reminder overdue', message: 'Riverbend Realty Group geofence map review was due June 16.', relatedId: 'rem-005', relatedCustomerId: 'cust-005', priority: 'High', source: 'reminder', type: 'Reminder Notification', read: false, createdAt: '2026-06-17T08:00:00.000Z', archived: false },
    { id: 'notif-011', recipientRole: 'Management', title: 'Production workload update', message: 'Three active print jobs and four digital campaigns are currently in progress.', priority: 'Normal', source: 'management', type: 'Management Alert', read: true, createdAt: '2026-06-14T17:00:00.000Z', archived: false },
    { id: 'notif-012', recipientRole: 'Digital Team', title: 'Website project completed', message: 'Harbor Home Services website handoff is complete.', relatedId: 'sale-010', relatedCustomerId: 'cust-006', priority: 'Normal', source: 'digital', type: 'Sale Notification', read: true, createdAt: '2026-04-28T10:05:00.000Z', archived: false }
  ],
  activities: [
    { id: 'act-001', type: 'Sale', title: 'Social media program booked', details: 'Crescent Coffee Co. approved a three-platform monthly program.', relatedId: 'sale-008', timestamp: '2026-06-16T10:32:00.000Z' },
    { id: 'act-002', type: 'Communication', title: 'Blue Moon proof delivered', details: 'July 3x8 mailer proof sent for approval.', relatedId: 'cust-001', timestamp: '2026-06-15T09:00:00.000Z' },
    { id: 'act-003', type: 'Sale', title: 'Northstar brochures moved to production', details: '5,000 tri-fold brochures approved with soft-touch finish.', relatedId: 'sale-004', timestamp: '2026-06-13T16:47:00.000Z' },
    { id: 'act-004', type: 'Sale', title: 'Pet Market mailing booked', details: 'Loyalty postcard project includes presorted mailing.', relatedId: 'sale-006', timestamp: '2026-06-12T12:42:00.000Z' },
    { id: 'act-005', type: 'Communication', title: 'Dental discovery call completed', details: 'Keystone Family Dental discussed late-summer new-patient acquisition.', relatedId: 'cust-004', timestamp: '2026-06-11T13:30:00.000Z' },
    { id: 'act-006', type: 'Sale', title: 'Riverbend 3x12 mailer booked', details: 'Four-month oversized placement added for the new development.', relatedId: 'sale-003', timestamp: '2026-06-10T11:32:00.000Z' },
    { id: 'act-007', type: 'Customer', title: 'Greenfield Fitness added', details: 'New prospect added after a fall membership consultation.', relatedId: 'cust-008', timestamp: '2026-06-09T14:10:00.000Z' },
    { id: 'act-008', type: 'Sale', title: 'Crescent paid ads approved', details: 'Google and Meta wholesale lead campaign entered.', relatedId: 'sale-009', timestamp: '2026-06-06T15:12:00.000Z' },
    { id: 'act-009', type: 'Sale', title: 'Riverbend geofencing launched', details: 'Target locations entered for model-home traffic campaign.', relatedId: 'sale-011', timestamp: '2026-06-02T14:22:00.000Z' },
    { id: 'act-010', type: 'Reminder', title: 'Mailer results recorded', details: 'Blue Moon June redemption total added to customer history.', relatedId: 'rem-008', timestamp: '2026-06-12T16:00:00.000Z' },
    { id: 'act-011', type: 'Sale', title: 'Northstar rack cards reordered', details: 'Updated patient referral cards completed.', relatedId: 'sale-005', timestamp: '2026-05-11T11:16:00.000Z' },
    { id: 'act-012', type: 'Project', title: 'Harbor website handed off', details: 'Website credentials, training, and final files delivered.', relatedId: 'sale-010', timestamp: '2026-04-28T10:05:00.000Z' }
  ],
  preferences: {
    currentRole: 'Sales Staff',
    currentUserName: CURRENT_USER,
    filters: {
      search: '',
      customerStatus: 'All',
      sortField: 'dateCreated',
      sortDirection: 'desc'
    },
    calendarMonth: '2026-06-01T00:00:00.000Z',
    selectedCalendarDate: '2026-06-17',
    activeView: 'dashboard',
    currentCustomerId: undefined,
    notificationFilterType: 'All',
    notificationSortType: 'Newest',
    reportsDateRange: 'this-month'
  },
  notificationHistory: {
    'notif-001': { read: false, seenAt: '2026-06-15T09:25:00.000Z' },
    'notif-002': { read: false, seenAt: '2026-06-15T09:25:00.000Z' },
    'notif-003': { read: false, seenAt: '2026-06-15T09:25:00.000Z' },
    'notif-004': { read: false, seenAt: '2026-06-16T10:35:00.000Z' },
    'notif-005': { read: false, seenAt: '2026-06-06T15:15:00.000Z' },
    'notif-006': { read: false, seenAt: '2026-06-02T14:25:00.000Z' },
    'notif-007': { read: true, seenAt: '2026-06-13T16:50:00.000Z' },
    'notif-008': { read: false, seenAt: '2026-06-13T16:50:00.000Z' },
    'notif-009': { read: false, seenAt: '2026-06-12T12:45:00.000Z' },
    'notif-010': { read: false, seenAt: '2026-06-17T08:01:00.000Z' },
    'notif-011': { read: true, seenAt: '2026-06-14T17:05:00.000Z' },
    'notif-012': { read: true, seenAt: '2026-04-28T10:10:00.000Z' }
  }
}

function createDemoData(): CRMData {
  return JSON.parse(JSON.stringify(demoData)) as CRMData
}

export function resetDemoData() {
  const data = createDemoData()
  writeCRMData(data)
  return data
}

export function seedReactDemoData() {
  return resetDemoData()
}
