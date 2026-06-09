const STORAGE_KEYS = {
  customers: "avidSphere.customers",
  sales: "avidSphere.sales",
  reminders: "avidSphere.reminders",
  notifications: "avidSphere.notifications",
  activities: "avidSphere.activities",
  preferences: "avidSphere.preferences",
  notificationHistory: "avidSphere.notificationHistory"
};

const BACKEND_API_BASE = "http://localhost:3000/api";

const ROLE_ACCESS = {
  "Sales Staff": [
    "Create customer records",
    "Update customer information",
    "Schedule reminders",
    "View upcoming reminders",
    "Log sales transactions"
  ],
  Management: [
    "View all customer records",
    "View all sales records",
    "View all notes",
    "Access reporting and analytics",
    "Receive notification alerts"
  ],
  "Digital Team": [
    "Review digital campaign tasks",
    "Coordinate with design and social marketing",
    "Track digital delivery timelines"
  ],
  Designers: [
    "Review design briefs",
    "Update proofs and assets",
    "Confirm design requests from sales"
  ],
  "Social Media Team": [
    "Manage social campaigns",
    "Publish and monitor social posts",
    "Coordinate social strategy with sales"
  ]
};

const DEFAULT_SOCIAL_ACCOUNTS = {
  website: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  tiktok: "",
  youtube: ""
};

const SOCIAL_MEDIA_PLATFORMS = ["Facebook", "Instagram", "TikTok", "YouTube", "Snapchat", "LinkedIn", "X (Twitter)"];
const PAID_AD_PLATFORM_OPTIONS = ["Meta Ads", "Google Ads", "YouTube Ads", "TikTok Ads", "Snapchat Ads", "LinkedIn Ads", "Other Paid Ads"];

const state = {
  customers: [],
  sales: [],
  reminders: [],
  notifications: [],
  activities: [],
  currentRole: "Sales Staff",
  currentUserName: "Sunny",
  activeView: "dashboard",
  currentCustomerId: null,
  editingCustomerId: null,
  editingSaleId: null,
  saleConfirmationSaleId: null,
  editingReminderId: null,
  currentDetailTab: "overview",
  selectedCalendarDate: null,
  calendarMode: "month",
  calendarMonth: new Date(),
  calendarYear: new Date().getFullYear(),
  selectedNotificationIds: [],
  filters: {
    search: "",
    customerStatus: "All",
    representative: "All",
    sortField: "dateCreated",
    sortDirection: "desc"
  },
  notificationFilterType: "All",
  notificationSortType: "Newest",
  notificationHistory: {},
  reportsDateRange: "this-month",
  detailSalesSearch: "",
  detailSalesSortField: "saleDate",
  detailSalesSortDirection: "desc",
  currentCustomerNoteId: null,
  currentCustomerReminderId: null,
  currentCommunicationId: null
};

const ui = {
  currentRole: document.getElementById("currentRole"),
  currentUserName: document.getElementById("currentUserName"),
  currentUserRoleLabel: document.getElementById("currentUserRoleLabel"),
  resetDemoData: document.getElementById("resetDemoData"),
  sendTestEmail: document.getElementById("sendTestEmail"),
  toastContainer: document.getElementById("toastContainer"),
  confirmOverlay: document.getElementById("confirmOverlay"),
  customerForm: document.getElementById("customerForm"),
  customerId: document.getElementById("customerId"),
  businessName: document.getElementById("businessName"),
  businessAddress: document.getElementById("businessAddress"),
  contactPerson: document.getElementById("contactPerson"),
  emailAddress: document.getElementById("emailAddress"),
  phoneNumber: document.getElementById("phoneNumber"),
  customerStatus: document.getElementById("customerStatus"),
  customerNotes: document.getElementById("customerNotes"),
  clearCustomerForm: document.getElementById("clearCustomerForm"),
  customerSearch: document.getElementById("customerSearch"),
  customerStatusFilter: document.getElementById("customerStatusFilter"),
  representativeFilter: document.getElementById("representativeFilter"),
  customerSortField: document.getElementById("customerSortField"),
  customerSortDirection: document.getElementById("customerSortDirection"),
  customerTableWrap: document.getElementById("customerTableWrap"),
  customerDetailPanel: document.getElementById("customerDetailPanel"),
  customerSummaryGrid: document.getElementById("customerSummaryGrid"),
  customerRecentOrders: document.getElementById("customerRecentOrders"),
  customerOrderHistory: document.getElementById("customerOrderHistory"),
  customerOrderDetailPanel: document.getElementById("customerOrderDetailPanel"),
  saleForm: document.getElementById("saleForm"),
  saleCustomer: document.getElementById("saleCustomer"),
  saleCategory: document.getElementById("saleCategory"),
  saleMailerArea: document.getElementById("saleMailerArea"),
  saleMailerMonth: document.getElementById("saleMailerMonth"),
  saleMailerRunTime: document.getElementById("saleMailerRunTime"),
  saleMailerAdSize: document.getElementById("saleMailerAdSize"),
  saleMailerMonthlyRate: document.getElementById("saleMailerMonthlyRate"),
  saleMailerSubtotal: document.getElementById("saleMailerSubtotal"),
  saleMailerDiscountType: document.getElementById("saleMailerDiscountType"),
  saleMailerDiscountValue: document.getElementById("saleMailerDiscountValue"),
  saleMailerTotalInvestment: document.getElementById("saleMailerTotalInvestment"),
  saleDigitalService: document.getElementById("saleDigitalService"),
  saleDigitalServicePrice: document.getElementById("saleDigitalServicePrice"),
  saleDigitalDiscountType: document.getElementById("saleDigitalDiscountType"),
  saleDigitalDiscountValue: document.getElementById("saleDigitalDiscountValue"),
  saleDigitalTotalInvestment: document.getElementById("saleDigitalTotalInvestment"),
  saleSocialPlatforms: document.getElementById("saleSocialPlatforms"),
  saleSocialUsername: document.getElementById("saleSocialUsername"),
  saleSocialStartDate: document.getElementById("saleSocialStartDate"),
  saleDigitalStaticIdeas: document.getElementById("saleDigitalStaticIdeas"),
  saleDigitalVideoCampaign: document.getElementById("saleDigitalVideoCampaign"),
  saleDigitalClientVideo: document.getElementById("saleDigitalClientVideo"),
  saleDigitalTargetAreas: document.getElementById("saleDigitalTargetAreas"),
  saleDigitalTargetLocations: document.getElementById("saleDigitalTargetLocations"),
  saleDigitalAge: document.getElementById("saleDigitalAge"),
  saleDigitalSex: document.getElementById("saleDigitalSex"),
  saleDigitalIncome: document.getElementById("saleDigitalIncome"),
  saleDigitalMonthlySpend: document.getElementById("saleDigitalMonthlySpend"),
  saleDigitalStartDate: document.getElementById("saleDigitalStartDate"),
  saleWebsiteOption: document.getElementById("saleWebsiteOption"),
  saleWebsiteUrl: document.getElementById("saleWebsiteUrl"),
  saleWebsitePrimaryGoal: document.getElementById("saleWebsitePrimaryGoal"),
  salePaidAdsPlatforms: document.getElementById("salePaidAdsPlatforms"),
  salePaidAdsOtherCheckbox: document.getElementById("salePaidAdsOtherCheckbox"),
  saleOtherPaidAdsPlatformContainer: document.getElementById("saleOtherPaidAdsPlatformContainer"),
  saleOtherPaidAdsPlatform: document.getElementById("saleOtherPaidAdsPlatform"),
  saleDigitalCampaignGoal: document.getElementById("saleDigitalCampaignGoal"),
  salePrintProjectPrice: document.getElementById("salePrintProjectPrice"),
  salePrintDiscountType: document.getElementById("salePrintDiscountType"),
  salePrintDiscountValue: document.getElementById("salePrintDiscountValue"),
  salePrintTotalInvestment: document.getElementById("salePrintTotalInvestment"),
  saleDigitalWebsiteUrl: document.getElementById("saleDigitalWebsiteUrl"),
  saleDigitalLandingPageUrl: document.getElementById("saleDigitalLandingPageUrl"),
  saleDigitalCampaignNotes: document.getElementById("saleDigitalCampaignNotes"),
  digitalGeofencingFields: document.getElementById("digitalGeofencingFields"),
  saleGeofenceTargetAreas: document.getElementById("saleGeofenceTargetAreas"),
  saleGeofenceTargetLocations: document.getElementById("saleGeofenceTargetLocations"),
  saleGeofenceCampaignType: document.getElementById("saleGeofenceCampaignType"),
  saleGeofenceMonthlySpend: document.getElementById("saleGeofenceMonthlySpend"),
  saleGeofenceAge: document.getElementById("saleGeofenceAge"),
  saleGeofenceSex: document.getElementById("saleGeofenceSex"),
  saleGeofenceIncome: document.getElementById("saleGeofenceIncome"),
  saleGeofenceStartDate: document.getElementById("saleGeofenceStartDate"),
  salePrintType: document.getElementById("salePrintType"),
  salePrintDescription: document.getElementById("salePrintDescription"),
  salePrintDescriptionLabel: document.getElementById("salePrintDescriptionLabel"),
  salePrintFinish: document.getElementById("salePrintFinish"),
  salePrintOtherFinishContainer: document.getElementById("salePrintOtherFinishContainer"),
  salePrintOtherFinish: document.getElementById("salePrintOtherFinish"),
  salePrintThickness: document.getElementById("salePrintThickness"),
  salePrintOtherThicknessContainer: document.getElementById("salePrintOtherThicknessContainer"),
  salePrintOtherThickness: document.getElementById("salePrintOtherThickness"),
  salePrintFold: document.getElementById("salePrintFold"),
  salePrintQuantity: document.getElementById("salePrintQuantity"),
  salePrintSize: document.getElementById("salePrintSize"),
  salePrintDesignFee: document.getElementById("salePrintDesignFee"),
  printDesignFeeContainer: document.getElementById("printDesignFeeContainer"),
  designFieldset: document.getElementById("designFieldset"),
  mailingRequiredContainer: document.getElementById("mailingRequiredContainer"),
  needsMailing: document.getElementById("needsMailing"),
  saleMailerDesignRequiredAmount: document.getElementById("saleMailerDesignRequiredAmount"),
  saleMailerDesignChangeAmount: document.getElementById("saleMailerDesignChangeAmount"),
  notifyManagement: document.getElementById("notifyManagement"),
  notifyPrintTeam: document.getElementById("notifyPrintTeam"),
  notifyDesigners: document.getElementById("notifyDesigners"),
  notifyDigitalTeam: document.getElementById("notifyDigitalTeam"),
  notifySocialMediaTeam: document.getElementById("notifySocialMediaTeam"),
  notifyGeofencing: document.getElementById("notifyGeofencing"),
  saleDate: document.getElementById("saleDate"),
  saleRepresentative: document.getElementById("saleRepresentative"),
  mailerFields: document.getElementById("mailerFields"),
  digitalFields: document.getElementById("digitalFields"),
  digitalSocialFields: document.getElementById("digitalSocialFields"),
  digitalWebsiteFields: document.getElementById("digitalWebsiteFields"),
  digitalPaidAdsFields: document.getElementById("digitalPaidAdsFields"),
  printFields: document.getElementById("printFields"),
  saleProductDetails: document.getElementById("saleProductDetails"),
  saleAmount: document.getElementById("saleAmount"),
  designRequired: document.getElementById("designRequired"),
  designChangeRequired: document.getElementById("designChangeRequired"),
  salePaymentMethod: document.getElementById("salePaymentMethod"),
  otherPaymentMethodContainer: document.getElementById("otherPaymentMethodContainer"),
  saleOtherPaymentMethod: document.getElementById("saleOtherPaymentMethod"),
  saleNotes: document.getElementById("saleNotes"),
  clearSaleForm: document.getElementById("clearSaleForm"),
  salesTableWrap: document.getElementById("salesTableWrap"),
  saleConfirmationPanel: document.getElementById("saleConfirmation"),
  saleConfirmationBusinessName: document.getElementById("saleConfirmationBusinessName"),
  saleConfirmationContactPerson: document.getElementById("saleConfirmationContactPerson"),
  saleConfirmationProducts: document.getElementById("saleConfirmationProducts"),
  saleConfirmationAmount: document.getElementById("saleConfirmationAmount"),
  saleConfirmationDate: document.getElementById("saleConfirmationDate"),
  saleConfirmationSalesRep: document.getElementById("saleConfirmationSalesRep"),
  saleConfirmationNotes: document.getElementById("saleConfirmationNotes"),
  sendAgreementPackageBtn: document.getElementById("sendAgreementPackageBtn"),
  downloadAgreementBtn: document.getElementById("downloadAgreementBtn"),
  returnToCRMBtn: document.getElementById("returnToCRMBtn"),
  returnToCRMAfterPackageBtn: document.getElementById("returnToCRMAfterPackageBtn"),
  saleConfirmationPackagePanel: document.getElementById("saleConfirmationPackage"),
  packagePdfFileName: document.getElementById("packagePdfFileName"),
  packagePdfAttachmentName: document.getElementById("packagePdfAttachmentName"),
  signaturePad: document.getElementById("signaturePad"),
  clearSignatureBtn: document.getElementById("clearSignatureBtn"),
  saveSignatureBtn: document.getElementById("saveSignatureBtn"),
  saleEditPanel: document.getElementById("saleEditPanel"),
  saleEditForm: document.getElementById("saleEditForm"),
  editingSaleId: document.getElementById("editingSaleId"),
  editSaleCustomer: document.getElementById("editSaleCustomer"),
  editSaleType: document.getElementById("editSaleType"),
  editSaleDate: document.getElementById("editSaleDate"),
  editSaleRepresentative: document.getElementById("editSaleRepresentative"),
  editSaleAmount: document.getElementById("editSaleAmount"),
  editDesignRequired: document.getElementById("editDesignRequired"),
  editDesignChangeRequired: document.getElementById("editDesignChangeRequired"),
  editSaleNotes: document.getElementById("editSaleNotes"),
  cancelSaleEdit: document.getElementById("cancelSaleEdit"),
  reminderForm: document.getElementById("reminderForm"),
  reminderCustomer: document.getElementById("reminderCustomer"),
  reminderTitle: document.getElementById("reminderTitle"),
  reminderDate: document.getElementById("reminderDate"),
  reminderAssignedTo: document.getElementById("reminderAssignedTo"),
  reminderNotes: document.getElementById("reminderNotes"),
  clearReminderForm: document.getElementById("clearReminderForm"),
  reminderList: document.getElementById("reminderList"),
  calendarGrid: document.getElementById("calendarGrid"),
  selectedDateLabel: document.getElementById("selectedDateLabel"),
  selectedDateReminders: document.getElementById("selectedDateReminders"),
  monthViewBtn: document.getElementById("monthViewBtn"),
  yearViewBtn: document.getElementById("yearViewBtn"),
  prevMonth: document.getElementById("prevMonth"),
  nextMonth: document.getElementById("nextMonth"),
  prevYear: document.getElementById("prevYear"),
  nextYear: document.getElementById("nextYear"),
  monthSelect: document.getElementById("monthSelect"),
  yearSelect: document.getElementById("yearSelect"),
  customerCount: document.getElementById("customerCount"),
  reminderCount: document.getElementById("reminderCount"),
  notificationCount: document.getElementById("notificationCount"),
  dashboardCustomerCount: document.getElementById("dashboardCustomerCount"),
  dashboardActiveCustomerCount: document.getElementById("dashboardActiveCustomerCount"),
  dashboardReminderCount: document.getElementById("dashboardReminderCount"),
  dashboardMonthlySaleCount: document.getElementById("dashboardMonthlySaleCount"),
  dashboardMonthlySales: document.getElementById("dashboardMonthlySales"),
  dashboardFocusList: document.getElementById("dashboardFocusList"),
  dashboardRecentSales: document.getElementById("dashboardRecentSales"),
  dashboardFollowUpQueue: document.getElementById("dashboardFollowUpQueue"),
  dashboardPipelineSnapshot: document.getElementById("dashboardPipelineSnapshot"),
  roleAccessList: document.getElementById("roleAccessList"),
  repReportWrap: document.getElementById("repReportWrap"),
  managementCustomerTable: document.getElementById("managementCustomerTable"),
  managementActivityFeed: document.getElementById("managementActivityFeed"),
  notificationFilterType: document.getElementById("notificationFilterType"),
  notificationSortType: document.getElementById("notificationSortType"),
  todaySalesAmount: document.getElementById("todaySalesAmount"),
  totalSalesAmount: document.getElementById("totalSalesAmount"),
  todayNotesCount: document.getElementById("todayNotesCount"),
  activeCustomersCount: document.getElementById("activeCustomersCount"),
  notificationFeed: document.getElementById("notificationFeed"),
  deleteSelectedNotifications: document.getElementById("deleteSelectedNotifications"),
  clearAllNotifications: document.getElementById("clearAllNotifications"),
  navButtons: document.querySelectorAll(".nav-btn"),
  // Developer Panel elements
  devPanelToggle: document.getElementById("devPanelToggle"),
  devPanelContent: document.getElementById("devPanelContent"),
  // customer-detail elements removed: Customer Detail page has been deleted
  // keep navButtons for view switching

};

const notificationService = {
  createNotification({ recipientRole, title, message, relatedId, priority = "Normal", source = "manual", type = "Sale Notification", relatedCustomerId = null }) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}`,
      recipientRole,
      title,
      message,
      relatedId,
      relatedCustomerId,
      priority,
      source,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
  },
  send(notification) {
    return { delivered: true, channel: "in-app", provider: "notification-service-stub", notification };
  }
};

function sendManagementNotification({ title, message, relatedId, relatedCustomerId, priority = "High", source = "management" }) {
  const notification = notificationService.createNotification({
    recipientRole: "Management",
    title,
    message,
    relatedId,
    relatedCustomerId,
    priority,
    source,
    type: "Management Alert"
  });
  addNotification(notification);
  return notification;
}

function sendDigitalNotification({ businessName, contactPerson, emailAddress, phoneNumber, salesRepresentative, saleDate, relatedId, relatedCustomerId }) {
  const title = "Digital team task added";
  const message = `${businessName} requires digital campaign support. Contact ${contactPerson} (${emailAddress}, ${phoneNumber}).`;
  const notification = notificationService.createNotification({
    recipientRole: "Digital Team",
    title,
    message,
    relatedId,
    relatedCustomerId,
    priority: "High",
    source: "sale",
    type: "Sale Notification"
  });
  notification.details = { businessName, contactPerson, emailAddress, phoneNumber, salesRepresentative, saleDate };
  addNotification(notification);
  return notification;
}

function sendPrintNotification({ businessName, saleType, relatedId, relatedCustomerId }) {
  const title = "Print team task added";
  const message = `${businessName} requires print production support for ${saleType}.`;
  const notification = notificationService.createNotification({
    recipientRole: "Print Team",
    title,
    message,
    relatedId,
    relatedCustomerId,
    priority: "High",
    source: "sale",
    type: "Sale Notification"
  });
  notification.details = { businessName, saleType };
  addNotification(notification);
  return notification;
}

function sendGeofencingNotification({ businessName, saleType, relatedId, relatedCustomerId }) {
  const title = "Geofencing task queued";
  const message = `${businessName} has a geofencing opportunity: ${saleType}.`;
  const notification = notificationService.createNotification({
    recipientRole: "Geofencing",
    title,
    message,
    relatedId,
    relatedCustomerId,
    priority: "Normal",
    source: "sale",
    type: "Sale Notification"
  });
  notification.details = { businessName, saleType };
  addNotification(notification);
  return notification;
}

function sendDesignerNotification({ businessName, saleType, designRequired, designChangeRequired, notes, relatedId, relatedCustomerId }) {
  const title = "Design task created";
  const message = `${businessName} needs design support for ${saleType}. Design required: ${designRequired}. Change required: ${designChangeRequired}.`;
  const notification = notificationService.createNotification({
    recipientRole: "Design Team",
    title,
    message,
    relatedId,
    relatedCustomerId,
    priority: "High",
    source: "sale",
    type: "Sale Notification"
  });
  notification.details = { businessName, saleType, designRequired, designChangeRequired, notes };
  addNotification(notification);
  return notification;
}

function sendSocialNotification({ businessName, contactPerson, website, socialLinks, salesRepresentative, relatedId, relatedCustomerId }) {
  const title = "Social media task queued";
  const message = `${businessName} needs social media implementation support. Contact ${contactPerson}. Website: ${website || "N/A"}.`;
  const notification = notificationService.createNotification({
    recipientRole: "Social Media Team",
    title,
    message,
    relatedId,
    relatedCustomerId,
    priority: "Normal",
    source: "sale",
    type: "Sale Notification"
  });
  notification.details = { businessName, contactPerson, website, socialLinks, salesRepresentative };
  addNotification(notification);
  return notification;
}

function postEmailNotification(route, payload) {
  console.log(`[CRM][Email] Attempting email request ${route}`, payload);
  return fetch(`${BACKEND_API_BASE}/${route}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(async response => {
      console.log(`[CRM][Email] Email response received ${route}:`, response.status, response.statusText);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        console.warn(`Email request failed for ${route}:`, errorBody || response.statusText);
      }
      return response;
    })
    .catch(error => {
      console.warn(`Email request failed for ${route}:`, error);
    });
}

function sendSaleEmailsToBackend(sale) {
  if (!sale || !sale.customerId) {
    console.warn('[CRM][Email] sendSaleEmailsToBackend called without valid sale or customerId', sale);
    return;
  }
  console.log('[CRM][Email] sendSaleEmailsToBackend triggered', { saleId: sale.id, businessName: sale.businessName });
  if (!sale || !sale.customerId) return;

  const customer = getCustomerById(sale.customerId);
  const payload = { sale, customer };
  const notificationSettings = getSaleNotificationSettings(sale);

  if (notificationSettings.notifyManagement) {
    postEmailNotification('send-management-email', payload);
  }
  if (notificationSettings.notifyPrintTeam) {
    postEmailNotification('send-print-email', payload);
  }
  if (notificationSettings.notifyDesigners) {
    postEmailNotification('send-designer-email', payload);
  }
  if (notificationSettings.notifyDigitalTeam) {
    postEmailNotification('send-digital-email', payload);
  }
  if (notificationSettings.notifySocialMediaTeam) {
    postEmailNotification('send-social-email', payload);
  }
  if (notificationSettings.notifyGeofencing) {
    postEmailNotification('send-geofencing-email', payload);
  }
}

function sendReminderNotification({ title, message, relatedId, relatedCustomerId, priority = "Normal", source = "reminder" }) {
  const notification = notificationService.createNotification({
    recipientRole: "Sales Staff",
    title,
    message,
    relatedId,
    relatedCustomerId,
    priority,
    source,
    type: "Reminder Notification"
  });
  addNotification(notification);
  return notification;
}

const TOAST_DURATION = 4500;
const TOAST_VARIANTS = {
  success: { label: "Success", icon: "✓" },
  error: { label: "Error", icon: "!" },
  warning: { label: "Warning", icon: "!" },
  info: { label: "Info", icon: "i" }
};

function showToast(message, type = "info") {
  const container = ui.toastContainer || document.body;
  const variant = TOAST_VARIANTS[type] || TOAST_VARIANTS.info;
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const icon = document.createElement("div");
  icon.className = "toast__icon";
  icon.textContent = variant.icon;

  const content = document.createElement("div");
  content.className = "toast__content";

  const title = document.createElement("strong");
  title.className = "toast__title";
  title.textContent = variant.label;

  const messageNode = document.createElement("p");
  messageNode.className = "toast__message";
  messageNode.textContent = message;

  content.appendChild(title);
  content.appendChild(messageNode);
  toast.appendChild(icon);
  toast.appendChild(content);
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  const timeoutId = window.setTimeout(() => {
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, TOAST_DURATION);

  toast.addEventListener("click", () => {
    window.clearTimeout(timeoutId);
    toast.classList.remove("toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  });
}

function showError(message) { showToast(message, "error"); }
function showSuccess(message) { showToast(message, "success"); }
function showWarning(message) { showToast(message, "warning"); }
function showInfo(message) { showToast(message, "info"); }

function showConfirmModal(message, onConfirm) {
  const overlay = ui.confirmOverlay;
  if (!overlay) {
    console.warn("[Confirm] Confirm overlay missing. Proceeding with action.");
    onConfirm();
    return;
  }

  const messageNode = overlay.querySelector(".confirm-message");
  const confirmButton = overlay.querySelector(".confirm-confirm-btn");
  const cancelButton = overlay.querySelector(".confirm-cancel-btn");
  if (!messageNode || !confirmButton || !cancelButton) {
    onConfirm();
    return;
  }

  messageNode.textContent = message;
  overlay.classList.remove("hidden");

  const closeModal = () => {
    overlay.classList.add("hidden");
    cleanup();
  };

  const confirmHandler = (event) => {
    event.preventDefault();
    onConfirm();
    closeModal();
  };

  const cancelHandler = (event) => {
    event.preventDefault();
    closeModal();
  };

  const outsideClickHandler = (event) => {
    if (event.target === overlay) closeModal();
  };

  const keyHandler = (event) => {
    if (event.key === "Escape") closeModal();
  };

  const cleanup = () => {
    confirmButton.removeEventListener("click", confirmHandler);
    cancelButton.removeEventListener("click", cancelHandler);
    overlay.removeEventListener("click", outsideClickHandler);
    document.removeEventListener("keydown", keyHandler);
  };

  confirmButton.addEventListener("click", confirmHandler);
  cancelButton.addEventListener("click", cancelHandler);
  overlay.addEventListener("click", outsideClickHandler);
  document.addEventListener("keydown", keyHandler);
  cancelButton.focus();
}

function validateAgreementPackageData(sale, customer) {
  if (!sale) {
    console.error('[Agreement] Validation failed: sale missing');
    showError('Unable to prepare the agreement package: sale record not found.');
    return false;
  }
  if (!customer) {
    console.error('[Agreement] Validation failed: customer missing', { saleId: sale.id });
    showError('Unable to prepare the agreement package: customer record not found.');
    return false;
  }
  if (!customer.emailAddress) {
    console.error('[Agreement] Validation failed: customer email missing', { customer });
    showError('Unable to prepare the agreement package: customer email address is missing.');
    return false;
  }
  const totalExists = [
    sale.dollarAmount,
    sale.digitalFinalTotal,
    sale.productDetails?.finalTotal,
    sale.productDetails?.totalInvestment,
    sale.productDetails?.subtotal,
    sale.productDetails?.monthlyRate
  ].some(value => value != null);
  if (!totalExists) {
    console.warn('[Agreement] Validation warning: sale total is missing. Proceeding with fallback values.', { saleId: sale.id });
  }

  const productSummary = getSaleProductSummary(sale);
  if (!productSummary || productSummary.trim() === '' || productSummary === 'Sale') {
    console.warn('[Agreement] Validation warning: product/service summary is missing or incomplete.', { saleId: sale.id, productSummary });
  }

  if (!sale.paymentMethod) {
    console.warn('[Agreement] Validation warning: paymentMethod is missing. PDF will display fallback text.', { saleId: sale.id });
  }

  return true;
}
const MAILER_PRICING_RATES = {
  "3x4": 340,
  "3x8": 655,
  "4x6": 655,
  "4x9": 995,
  "3x12": 995
};

function getMailerBaseRate(adSize) {
  return MAILER_PRICING_RATES[adSize] || 0;
}

function getMailerCalculatedPricing({ adSize = "", runTime = 0, discountType = "None", discountValue = 0, designRequired = "No", designChangeRequired = "No" } = {}) {
  const monthlyRate = getMailerBaseRate(adSize);
  const runMonths = Number(runTime) || 0;
  const subtotal = monthlyRate * runMonths;
  const parsedDiscount = Number(discountValue) || 0;
  let discountAmount = 0;
  if (discountType === "Dollar Amount") {
    discountAmount = Math.min(parsedDiscount, subtotal);
  }
  if (discountType === "Percentage") {
    discountAmount = Math.min(subtotal * (parsedDiscount / 100), subtotal);
  }
  if (discountAmount < 0) discountAmount = 0;
  const designRequiredFee = designRequired === "Yes" ? 30 : 0;
  const designChangeFee = designChangeRequired === "Yes" ? 15 : 0;
  const totalInvestment = Math.max(subtotal - discountAmount + designRequiredFee + designChangeFee, 0);
  return {
    monthlyRate,
    runTime: runMonths,
    subtotal,
    discountType,
    discountValue: parsedDiscount,
    discountAmount,
    designRequiredFee,
    designChangeFee,
    totalInvestment
  };
}

function calculateMailerPricing() {
  if (ui.saleCategory?.value !== "Mailer") return;
  if (!ui.saleMailerMonthlyRate) return;
  const pricing = getMailerCalculatedPricing({
    adSize: ui.saleMailerAdSize?.value || "",
    runTime: ui.saleMailerRunTime?.value || 0,
    discountType: ui.saleMailerDiscountType?.value || "None",
    discountValue: ui.saleMailerDiscountValue?.value || 0,
    designRequired: getYesNo(ui.designRequired),
    designChangeRequired: getYesNo(ui.designChangeRequired)
  });

  ui.saleMailerMonthlyRate.value = Number.isFinite(pricing.monthlyRate) ? formatCurrency(pricing.monthlyRate) : "";
  ui.saleMailerSubtotal.value = Number.isFinite(pricing.subtotal) ? formatCurrency(pricing.subtotal) : "";
  ui.saleMailerDesignRequiredAmount.value = Number.isFinite(pricing.designRequiredFee) ? formatCurrency(pricing.designRequiredFee) : "";
  ui.saleMailerDesignChangeAmount.value = Number.isFinite(pricing.designChangeFee) ? formatCurrency(pricing.designChangeFee) : "";
  ui.saleMailerTotalInvestment.value = Number.isFinite(pricing.totalInvestment) ? formatCurrency(pricing.totalInvestment) : "";
  if (ui.saleAmount) ui.saleAmount.value = Number.isFinite(pricing.totalInvestment) ? pricing.totalInvestment.toFixed(2) : "";
  if (ui.saleMailerDiscountValue) ui.saleMailerDiscountValue.disabled = pricing.discountType === "None";
  if (pricing.discountType === "None" && ui.saleMailerDiscountValue) ui.saleMailerDiscountValue.value = "";
}

function getDigitalCalculatedPricing({ servicePrice = 0, discountType = "None", discountValue = 0 } = {}) {
  const basePrice = Number(servicePrice) || 0;
  const parsedDiscount = Number(discountValue) || 0;
  let discountAmount = 0;
  if (discountType === "Dollar Amount") {
    discountAmount = Math.min(parsedDiscount, basePrice);
  }
  if (discountType === "Percentage") {
    discountAmount = Math.min(basePrice * (parsedDiscount / 100), basePrice);
  }
  if (discountAmount < 0) discountAmount = 0;
  const totalInvestment = Math.max(basePrice - discountAmount, 0);
  return {
    servicePrice: basePrice,
    discountType,
    discountValue: parsedDiscount,
    discountAmount,
    totalInvestment
  };
}

function calculateDigitalPricing() {
  if (!ui.saleDigitalTotalInvestment) return;
  const pricing = getDigitalCalculatedPricing({
    servicePrice: ui.saleDigitalServicePrice?.value || 0,
    discountType: ui.saleDigitalDiscountType?.value || "None",
    discountValue: ui.saleDigitalDiscountValue?.value || 0
  });

  ui.saleDigitalTotalInvestment.value = Number.isFinite(pricing.totalInvestment) ? formatCurrency(pricing.totalInvestment) : "";
  if (ui.saleAmount) ui.saleAmount.value = Number.isFinite(pricing.totalInvestment) ? pricing.totalInvestment.toFixed(2) : "";
  if (ui.saleDigitalDiscountValue) ui.saleDigitalDiscountValue.disabled = pricing.discountType === "None";
  if (pricing.discountType === "None" && ui.saleDigitalDiscountValue) ui.saleDigitalDiscountValue.value = "";
}

function calculatePrintPricing() {
  if (!ui.salePrintTotalInvestment) return;
  const base = Number(ui.salePrintProjectPrice?.value) || 0;
  const designFee = Number(ui.salePrintDesignFee?.value) || 0;
  const discountType = ui.salePrintDiscountType?.value || "None";
  const discountValue = Number(ui.salePrintDiscountValue?.value) || 0;
  let discountAmount = 0;
  if (discountType === "Dollar Amount") {
    discountAmount = Math.min(discountValue, base);
  } else if (discountType === "Percentage") {
    discountAmount = Math.min(base * (discountValue / 100), base);
  }
  if (discountAmount < 0) discountAmount = 0;
  const total = Math.max(base + designFee - discountAmount, 0);
  ui.salePrintTotalInvestment.value = formatCurrency(total);
  // keep hidden saleAmount in sync for saving and other logic
  if (ui.saleAmount) ui.saleAmount.value = total.toFixed(2);
}

function getSaleProductSummary(sale) {
  if (!sale) return "N/A";
  const details = sale.productDetails || {};
  const category = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  if (category === "Mailer") {
    const parts = [
      details.mailerArea && `Area: ${details.mailerArea}`,
      details.month && `Month: ${details.month}`,
      details.mailerRunTime && `Run Time: ${details.mailerRunTime} Months`,
      details.adSize && `Ad Size: ${details.adSize}`,
      (details.campaignStartDate || details.startDate) && `Start Date: ${details.campaignStartDate || details.startDate}`
    ].filter(Boolean);
    return parts.join(" · ") || "Mailer";
  }
  if (category === "Digital") {
    const parts = [`Service: ${details.service || "Digital"}`];
    if (details.service === "Social Media Management") {
      const socialPlatforms = Array.isArray(details.socialPlatforms)
        ? details.socialPlatforms
        : details.socialPlatform ? [details.socialPlatform] : [];
      if (socialPlatforms.length) parts.push(`Platforms: ${socialPlatforms.join(", ")}`);
    }
    if (details.websiteOption) parts.push(`Website: ${details.websiteOption}`);
    if (details.service === "Paid Ads") {
      const paidAdPlatforms = Array.isArray(details.paidAdPlatforms)
        ? details.paidAdPlatforms
        : details.paidAdsOption ? [details.paidAdsOption] : [];
      if (paidAdPlatforms.length) parts.push(`Paid Ads: ${paidAdPlatforms.join(", ")}`);
    } else if (details.paidAdsOption) {
      parts.push(`Paid Ads: ${details.paidAdsOption}`);
    }
    if (details.service === "Geofencing") {
      if (details.campaignType) parts.push(`Campaign: ${details.campaignType}`);
      if (details.monthlyAdSpend) parts.push(`Budget: ${formatCurrency(details.monthlyAdSpend)}`);
    } else if (details.monthlyAdSpend) {
      parts.push(`Budget: ${formatCurrency(details.monthlyAdSpend)}`);
    }
    return parts.join(" · ");
  }
  if (category === "Print") {
    const parts = [`Type: ${details.printType || "Print"}`];
    if (details.size) parts.push(`Size: ${details.size}`);
    if (details.quantity) parts.push(`Qty ${details.quantity}`);
    if (details.finish) parts.push(`Finish: ${details.finish}`);
    if (details.thickness) parts.push(`Thickness: ${details.thickness}`);
    if (details.fold) parts.push(`Fold: ${details.fold}`);
    return parts.join(" · ");
  }
  return sale.saleType || sale.saleCategory || "Sale";
}

function buildAgreementHtml(sale, customer) {
  const productSummary = getSaleProductSummary(sale);
  const rows = [
    { label: "Business Name", value: customer.businessName },
    { label: "Address", value: customer.businessAddress },
    { label: "Contact Person", value: customer.contactPerson },
    { label: "Email", value: customer.emailAddress },
    { label: "Phone", value: customer.phoneNumber },
    { label: "Products Purchased", value: productSummary },
  ];
  if (sale.saleCategory === "Mailer") {
    rows.push(
      { label: "Monthly Rate", value: formatCurrency(sale.productDetails?.monthlyRate || 0) },
      { label: "Run Time", value: `${sale.productDetails?.mailerRunTime || 0} Months` },
      { label: "Subtotal", value: formatCurrency(sale.productDetails?.subtotal || 0) },
      { label: "Discount", value: sale.productDetails?.discountType === "Percentage" ? `${sale.productDetails?.discountValue || 0}%` : sale.productDetails?.discountType === "Dollar Amount" ? formatCurrency(sale.productDetails?.discountValue || 0) : "None" }
    );
  }
  if (sale.saleCategory === "Digital") {
    const details = sale.productDetails || {};
    if (details.service === "Geofencing") {
      rows.push(
        { label: "Campaign Type", value: details.campaignType || "N/A" },
        { label: "Monthly Ad Spend", value: details.monthlyAdSpend ? formatCurrency(details.monthlyAdSpend) : "N/A" }
      );
      const demographics = [
        details.demographicAge ? `Age: ${details.demographicAge}` : null,
        details.demographicSex ? `Gender: ${details.demographicSex}` : null,
        details.demographicIncome ? `Income: ${details.demographicIncome}` : null
      ].filter(Boolean).join(' • ');
      if (demographics) rows.push({ label: "Demographic Targeting", value: demographics });
    }
    const socialPlatforms = Array.isArray(sale.productDetails?.socialPlatforms)
      ? sale.productDetails.socialPlatforms
      : sale.productDetails?.socialPlatform ? [sale.productDetails.socialPlatform] : [];
    if (socialPlatforms.length) {
      rows.push({ label: "Platforms Managed", value: socialPlatforms.join(", ") });
    }
    const socialUsernames = sale.productDetails?.socialUsernames || {};
    const usernameEntries = Object.keys(socialUsernames || {}).map(k => `${k}: ${socialUsernames[k] || ''}`).filter(Boolean);
    if (usernameEntries.length) rows.push({ label: "Social Usernames", value: usernameEntries.join(', ') });
    const paidAdPlatforms = Array.isArray(sale.productDetails?.paidAdPlatforms)
      ? sale.productDetails.paidAdPlatforms
      : sale.productDetails?.paidAdsOption ? [sale.productDetails.paidAdsOption] : [];
    if (paidAdPlatforms.length) {
      rows.push({ label: "Channels", value: paidAdPlatforms.join(", ") });
    }
  }
  if (sale.saleCategory === "Digital") {
    const servicePrice = sale.productDetails?.servicePrice || sale.digitalFinalTotal || sale.dollarAmount || 0;
    rows.push(
      { label: "Service Price", value: formatCurrency(servicePrice) },
      { label: "Discount", value: sale.digitalDiscountType === "Percentage" ? `${sale.digitalDiscountValue || 0}%` : sale.digitalDiscountType === "Dollar Amount" ? formatCurrency(sale.digitalDiscountValue || 0) : "None" }
    );
  }
  // Design fields for Mailer and Print
  if (sale.saleCategory === "Mailer" || sale.saleCategory === "Print") {
    rows.push(
      { label: "Design Required", value: sale.designRequired || "No" },
      { label: "Design Change", value: sale.designChange || sale.designChangeRequired || "No" }
    );
  }
  // Mailing Required only for eligible Print products
  if (sale.saleCategory === "Print") {
    const pt = (sale.productDetails?.printType || "").trim();
    if (pt === "Custom Print Project" || pt === "Other") {
      rows.push({ label: "Mailing Required", value: sale.needsMailing || sale.productDetails?.needsMailing || "No" });
    }
  }
  if (sale.saleCategory === "Print") {
    const projectDescription = sale.productDetails?.printProjectDescription || sale.productDetails?.otherPrintDescription || sale.productDetails?.customDescription || "";
    if (projectDescription) {
      rows.push({ label: "Project Description", value: projectDescription });
    }
    if (sale.productDetails?.finish) rows.push({ label: 'Finish', value: sale.productDetails.finish + (sale.productDetails.otherFinish ? ` (${sale.productDetails.otherFinish})` : '') });
    if (sale.productDetails?.thickness) rows.push({ label: 'Thickness', value: sale.productDetails.thickness + (sale.productDetails.otherThickness ? ` (${sale.productDetails.otherThickness})` : '') });
    if (sale.productDetails?.fold) rows.push({ label: 'Fold', value: sale.productDetails.fold });
  }
  rows.push(
    { label: "Total", value: formatCurrency(sale.digitalFinalTotal || sale.dollarAmount) },
    { label: "Date Created", value: formatDate(sale.saleDate) },
    { label: "Sales Rep", value: sale.salesRepresentative },
    { label: "Notes", value: sale.notes || "None" }
  );
  const rowsHtml = rows.map(row => `
      <tr>
        <td class="label">${row.label}</td>
        <td class="value">${row.value || "N/A"}</td>
      </tr>
    `).join("");
  return `
    <html>
      <head>
        <meta charset="utf-8" />
          <style>
          body { font-family: Arial, sans-serif; color: #111827; background: #f8fafc; margin: 0; padding: 0; }
          .container { width: 100%; max-width: 700px; margin: 0 auto; padding: 28px; }
          .header { margin-bottom: 24px; }
          .brand { font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 8px; }
          .title { font-size: 24px; color: #0f172a; margin: 0 0 8px; }
          .subtitle { color: #475569; line-height: 1.6; margin: 0; }
          .section { margin-top: 24px; }
          .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 10px 0; vertical-align: top; }
          .label { width: 32%; color: #475569; font-weight: 700; }
          .value { color: #0f172a; }
          .signature-lines { margin-top: 32px; }
          .signature-line { margin-bottom: 22px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Avidsphere Advertising</div>
            <div class="title">Advertising Agreement</div>
            <p class="subtitle">This agreement confirms services sold through Avidsphere Advertising and documents the terms for customer authorization.</p>
          </div>
          <div class="section">
            <div class="section-title">Customer Information</div>
            <table>${rowsHtml}</table>
          </div>
          <div class="section">
            <div class="section-title">Agreement Notes</div>
            <p class="value">${sale.notes ? sale.notes.replace(/\n/g,'<br/>') : "No additional notes."}</p>
          </div>
          <div class="section signature-lines">
            <div class="section-title">Customer Authorization</div>
            <div class="signature-line">Customer Signature: _______________________</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function generateAgreementPdfBase64(sale, customer) {
  console.log('[Agreement] PDF generation started', { saleId: sale?.id, customerId: customer?.id, saleCategory: sale?.saleCategory, customerEmail: customer?.emailAddress });
  console.log('[PDF] Starting generation');
  if (!sale) throw new Error('Sale object is required for PDF generation.');
  if (!customer) throw new Error('Customer object is required for PDF generation.');
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) throw new Error('PDF generator is unavailable.');

  try {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    // Typography: use a clean sans-serif available in jsPDF
    try { doc.setFont('helvetica'); } catch (e) {}

    function safePdfText(value) {
      if (value == null) {
        console.log('[Agreement] PDF Text Value:', value, typeof value, '=>', '');
        return '';
      }
      if (Array.isArray(value)) {
        const normalized = value.map(item => item == null ? '' : String(item));
        console.log('[Agreement] PDF Text Value:', value, typeof value, '=>', normalized);
        return normalized;
      }
      const textValue = String(value);
      console.log('[Agreement] PDF Text Value:', value, typeof value, '=>', textValue);
      return textValue;
    }

    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const margin = 48; // reduced page margins to fit single page
  let y = margin;

  // Brand colors (unchanged)
  const PINK = '#F21B7F';
  const PURPLE = '#472773';
  const BLUE = '#398CBF';
  const YELLOW = '#F2E966';
  const BG = '#F2F2F2';

  // Try to get embedded logo data URL first (created earlier), otherwise attempt DOM hack
  let logoDataUrl = (typeof AVID_LOGO_DATAURL !== 'undefined' && AVID_LOGO_DATAURL) ? AVID_LOGO_DATAURL : null;
  if (!logoDataUrl) {
    try {
      const logoEl = document.querySelector('.brand-logo');
      if (logoEl && logoEl.src) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = logoEl.src;
        if (img.complete) {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          logoDataUrl = canvas.toDataURL('image/png');
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Header: logo + title (ample spacing)
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, 'PNG', margin, y, 88, 44); } catch (e) { /* ignore image add errors */ }
  }
  doc.setFontSize(18);
  doc.setTextColor(PURPLE);
  doc.text(safePdfText('Avidsphere'), margin + 120, y + 15);
  doc.setFontSize(10);
  doc.setTextColor(BLUE);
  doc.text(safePdfText('Advertising Agreement & Authorization'), margin + 120, y + 33);

  const transactionDate = getSaleDateOrToday(sale.saleDate);
  const transactionLabel = `Transaction Date: ${formatDate(transactionDate)}`;
  doc.setFontSize(9);
  doc.setTextColor('#475569');
  const transactionX = PAGE_WIDTH - margin - doc.getTextWidth(transactionLabel);
  doc.text(safePdfText(transactionLabel), transactionX, y + 15);

  y += 60; // more compact header spacing

  // Soft divider
  doc.setDrawColor(220);
  doc.setLineWidth(0.6);
  doc.line(margin, y, PAGE_WIDTH - margin, y);
  y += 16;

  // Section spacing preferences
  const sectionGap = 6;
  const cardSpacing = 8;
  const labelColor = '#475569';

  // Helper for rounded rect (fallback to rect)
  function drawCard(x, yy, w, h, radius = 6, fill = true) {
    try {
      if (typeof doc.roundedRect === 'function') {
        doc.roundedRect(x, yy, w, h, radius, radius, fill ? 'F' : 'S');
        return;
      }
    } catch (e) {}
    if (fill) doc.rect(x, yy, w, h, 'F'); else doc.rect(x, yy, w, h);
  }

  // Customer Information card (increased padding)
  const cardPadding = 8;
  const cardW = PAGE_WIDTH - margin * 2;
  const custCardH = 88;
  doc.setFillColor(BG);
  doc.setDrawColor(210);
  drawCard(margin, y, cardW, custCardH, 8, true);
  doc.setFontSize(10);
  doc.setTextColor(PURPLE);
  doc.text(safePdfText('Customer Information'), margin + cardPadding, y + 20);
  doc.setFontSize(9);
  doc.setTextColor(40);
  const infoX = margin + cardPadding;
  let infoY = y + 36;
  const infoFieldGap = 12;
  const custFields = [
    ['Business Name', customer.businessName],
    ['Contact', customer.contactPerson],
    ['Address', customer.businessAddress],
    ['Email', customer.emailAddress],
    ['Phone', customer.phoneNumber]
  ];
  custFields.forEach(([label, val]) => {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(safePdfText(`${label}:`), infoX, infoY);
    doc.setFontSize(10);
    doc.setTextColor(20);
    const split = doc.splitTextToSize(String(val || 'N/A'), cardW - cardPadding * 2 - 120);
    doc.text(safePdfText(split), infoX + 120, infoY);
    infoY += Math.max(split.length * 12, infoFieldGap);
  });
  y += custCardH + 22;
  const signatureH = 72;
  const summaryW = 280;
  const footerHeight = 12;
  const rowHeight = 12;
  const headerHeight = 24;
  const productDetails = sale.productDetails || {};
  const isDigital = sale.saleCategory === 'Digital';
  const isMail = sale.saleCategory === 'Mailer';
  const isPrint = sale.saleCategory === 'Print';
  let pricingRows = [];

  if (isMail) {
    if (productDetails.monthlyRate) pricingRows.push(['Monthly Rate', formatCurrency(productDetails.monthlyRate)]);
    if (productDetails.mailerRunTime) pricingRows.push(['Run Time', productDetails.mailerRunTime]);
    if (productDetails.totalInvestment) pricingRows.push(['Subtotal', formatCurrency(productDetails.totalInvestment)]);
    if (sale.designRequired === 'Yes' && productDetails.designRequiredFee) pricingRows.push(['Design Required', formatCurrency(productDetails.designRequiredFee)]);
    if (sale.designChangeRequired === 'Yes' && productDetails.designChangeFee) pricingRows.push(['Design Changes', formatCurrency(productDetails.designChangeFee)]);
    if (productDetails.discountType && productDetails.discountType !== 'None' && productDetails.discountValue) {
      const discountDisplay = productDetails.discountType === 'Percentage' ? `${productDetails.discountValue}%` : formatCurrency(productDetails.discountValue);
      pricingRows.push(['Discount', `-${discountDisplay}`]);
    }
    if (productDetails.finalTotal) pricingRows.push(['Total', formatCurrency(productDetails.finalTotal)]);
  } else if (isDigital) {
    const servicePrice = productDetails.servicePrice || sale.dollarAmount;
    pricingRows.push(['Service Price', formatCurrency(servicePrice)]);
    if (sale.digitalDiscountType && sale.digitalDiscountType !== 'None' && sale.digitalDiscountValue) {
      const discountDisplay = sale.digitalDiscountType === 'Percentage' ? `${sale.digitalDiscountValue}%` : formatCurrency(sale.digitalDiscountValue);
      pricingRows.push(['Discount', `-${discountDisplay}`]);
    }
    pricingRows.push(['Total', formatCurrency(sale.digitalFinalTotal || sale.dollarAmount)]);
  } else if (isPrint) {
    if (productDetails.projectPrice || sale.dollarAmount) pricingRows.push(['Project Price', formatCurrency(productDetails.projectPrice || sale.dollarAmount)]);
    if (productDetails.designFee && Number(productDetails.designFee) > 0) pricingRows.push(['Design Fee', formatCurrency(productDetails.designFee)]);
    if (productDetails.discountType && productDetails.discountType !== 'None' && productDetails.discountValue) {
      const discountDisplay = productDetails.discountType === 'Percentage' ? `${productDetails.discountValue}%` : formatCurrency(productDetails.discountValue);
      pricingRows.push(['Discount', `-${discountDisplay}`]);
    }
    pricingRows.push(['Total', formatCurrency(productDetails.finalTotal || sale.dollarAmount)]);
  }

  const summaryH = headerHeight + (pricingRows.length * rowHeight) + footerHeight;
  const bottomSectionHeight = Math.max(summaryH, signatureH);
  const requiredBottomSpace = bottomSectionHeight + 24;

  // Products Purchased section styled like the other agreement cards
  const details = sale.productDetails || {};
  const productName = details.service || details.printType || sale.saleType || sale.saleCategory || 'Service';
  const purchasedRows = [
    ['Product / Service', productName],
    ['Category', sale.saleCategory || 'N/A']
  ];

  if (details.quantity) purchasedRows.push(['Quantity', details.quantity]);
  const adSizeValue = details.adSize || details.size;
  if (adSizeValue) purchasedRows.push(['Ad Size', adSizeValue]);
  if (details.month) purchasedRows.push(['Month', details.month]);
  const startDate = details.campaignStartDate || details.startDate;
  if (startDate) purchasedRows.push(['Start Date', startDate]);

  if (sale.saleCategory === 'Mailer' && details.mailerArea) {
    purchasedRows.push(['Area', details.mailerArea]);
  }
  if (sale.saleCategory === 'Mailer' && details.mailerRunTime) {
    purchasedRows.push(['Run Time', `${details.mailerRunTime} Months`]);
  }

  if (details.printType && sale.saleCategory === 'Print') {
    purchasedRows.push(['Print Type', details.printType]);
  }
  if (details.finish) purchasedRows.push(['Finish', details.finish + (details.otherFinish ? ` (${details.otherFinish})` : '')]);
  if (details.thickness) purchasedRows.push(['Thickness', details.thickness + (details.otherThickness ? ` (${details.otherThickness})` : '')]);
  if (details.fold) purchasedRows.push(['Fold', details.fold]);

  if (details.service === 'Social Media Management') {
    const platforms = Array.isArray(details.socialPlatforms)
      ? details.socialPlatforms.join(', ')
      : details.socialPlatform || '';
    if (platforms) purchasedRows.push(['Platforms', platforms]);
  }

  const paidAdPlatforms = Array.isArray(details.paidAdPlatforms)
    ? details.paidAdPlatforms
    : details.paidAdsOption ? [details.paidAdsOption] : [];
  if (paidAdPlatforms.length) purchasedRows.push(['Channels', paidAdPlatforms.join(', ')]);

  if (details.websiteOption) purchasedRows.push(['Website', details.websiteOption]);
  if (details.printProjectDescription) purchasedRows.push(['Project Description', details.printProjectDescription]);
  if (details.customDescription && !details.printProjectDescription) purchasedRows.push(['Description', details.customDescription]);

  const productsCardX = margin;
  const productsCardW = PAGE_WIDTH - margin * 2;
  const productsCardPadding = 8;
  const productLabelFontSize = 7;
  const productValueFontSize = 7;
  const productRowHeight = 10;
  const productsValueMaxW = productsCardW - productsCardPadding * 2 - 110;

  function ellipsifyText(text, width) {
    const ellipsis = '...';
    let candidate = String(text);
    if (doc.getTextWidth(candidate) <= width) return candidate;
    let low = 0;
    let high = candidate.length;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      const tryText = candidate.slice(0, mid) + ellipsis;
      if (doc.getTextWidth(tryText) <= width) {
        low = mid;
      } else {
        high = mid - 1;
      }
    }
    return candidate.slice(0, low) + ellipsis;
  }

  function limitLines(lines, maxLines) {
    if (lines.length <= maxLines) return lines;
    const limited = lines.slice(0, maxLines);
    limited[maxLines - 1] = ellipsifyText(limited[maxLines - 1], productsValueMaxW);
    return limited;
  }

  function buildProductRows(maxLines, rowsOverride) {
    const rowsSource = rowsOverride || purchasedRows;
    return rowsSource.map(([label, value]) => {
      doc.setFontSize(productValueFontSize);
      const wrapped = doc.splitTextToSize(String(value || 'N/A'), productsValueMaxW);
      const finalWrapped = maxLines ? limitLines(wrapped, maxLines) : wrapped;
      return {
        label,
        wrapped: finalWrapped,
        height: Math.max(finalWrapped.length * productRowHeight, productRowHeight)
      };
    });
  }

  const maxAvailableProductsH = Math.max(100, PAGE_HEIGHT - margin - y - requiredBottomSpace - sectionGap);
  const maxLinesAvailable = Math.max(1, Math.floor((maxAvailableProductsH - 38) / productRowHeight));
  let productRowsData = buildProductRows(4);
  let totalLines = productRowsData.reduce((sum, row) => sum + row.wrapped.length, 0);
  let productsContentHeight = productRowsData.reduce((sum, row) => sum + row.height, 0);
  let productsCardH = Math.max(94, productsContentHeight + 38);

  if (totalLines > maxLinesAvailable) {
    for (let maxLines = 3; maxLines >= 1; maxLines--) {
      productRowsData = buildProductRows(maxLines);
      totalLines = productRowsData.reduce((sum, row) => sum + row.wrapped.length, 0);
      productsContentHeight = productRowsData.reduce((sum, row) => sum + row.height, 0);
      productsCardH = Math.max(94, productsContentHeight + 38);
      if (totalLines <= maxLinesAvailable && productsCardH <= maxAvailableProductsH) break;
    }
  }

  if (totalLines > maxLinesAvailable) {
    const baseRows = purchasedRows.slice(0, 6);
    const overflowRows = purchasedRows.slice(6);
    const overflowText = overflowRows.map(([label, value]) => `${label}: ${value}`).filter(Boolean).join(' • ');
    if (overflowText) baseRows.push(['Additional Details', overflowText]);
    productRowsData = buildProductRows(1, baseRows);
    totalLines = productRowsData.reduce((sum, row) => sum + row.wrapped.length, 0);
    productsContentHeight = productRowsData.reduce((sum, row) => sum + row.height, 0);
    productsCardH = Math.max(94, productsContentHeight + 38);
  }

  if (productsCardH > maxAvailableProductsH) {
    productsCardH = maxAvailableProductsH;
  }

  doc.setFillColor(BG);
  doc.setDrawColor(210);
  drawCard(productsCardX, y, productsCardW, productsCardH, 8, true);
  doc.setFontSize(11);
  doc.setTextColor(PURPLE);
  doc.text('Products Purchased', productsCardX + productsCardPadding, y + 18);
  doc.setLineWidth(0.5);
  doc.setDrawColor(210);
  doc.line(productsCardX, y + 26, productsCardX + productsCardW, y + 26);

  let productRowY = y + 40;
  productRowsData.forEach(({ label, wrapped, height }) => {
    doc.setFontSize(productLabelFontSize);
    doc.setTextColor(labelColor);
    doc.text(safePdfText(label), productsCardX + productsCardPadding, productRowY);
    doc.setFontSize(productValueFontSize);
    doc.setTextColor(20);
    doc.text(safePdfText(wrapped), productsCardX + productsCardPadding + 110, productRowY);
    productRowY += height;
  });

  y += productsCardH + sectionGap;

  // Production details for mailer / print
  if (sale.saleCategory === 'Mailer' || sale.saleCategory === 'Print') {
    const productionFields = [
      ['Design Required', sale.designRequired || 'No'],
      ['Design Change', sale.designChange || sale.designChangeRequired || 'No']
    ];
    // Mailing only for eligible Print products
    if (sale.saleCategory === 'Print') {
      const pt = (sale.productDetails?.printType || '').trim();
      if (pt === 'Custom Print Project' || pt === 'Other') {
        productionFields.push(['Mailing Required', sale.needsMailing || sale.productDetails?.needsMailing || 'No']);
      }
      const projectDescription = sale.productDetails?.printProjectDescription || sale.productDetails?.otherPrintDescription || sale.productDetails?.customDescription || '';
      if (projectDescription) productionFields.push(['Project Description', projectDescription]);
      if (sale.productDetails?.finish) productionFields.push(['Finish', sale.productDetails.finish + (sale.productDetails.otherFinish ? ` (${sale.productDetails.otherFinish})` : '')]);
      if (sale.productDetails?.thickness) productionFields.push(['Thickness', sale.productDetails.thickness + (sale.productDetails.otherThickness ? ` (${sale.productDetails.otherThickness})` : '')]);
      if (sale.productDetails?.fold) productionFields.push(['Fold', sale.productDetails.fold]);
    }

    const fieldValueMaxW = cardW - cardPadding * 2 - 120;
    const productionRows = productionFields.map(([label, value]) => {
      const wrapped = doc.splitTextToSize(String(value || 'N/A'), fieldValueMaxW);
      return { label, wrapped, height: Math.max(wrapped.length * 14, 16) };
    });

    const productionContentHeight = productionRows.reduce((sum, row) => sum + row.height, 0);
    const detailsCardH = Math.max(100, productionContentHeight + 36);

    doc.setFillColor(BG);
    doc.setDrawColor(210);
    drawCard(margin, y, cardW, detailsCardH, 8, true);
    doc.setFontSize(11);
    doc.setTextColor(PURPLE);
    doc.text('Production Details', margin + cardPadding, y + 18);
    doc.setLineWidth(0.5);
    doc.setDrawColor(210);
    doc.line(margin, y + 26, margin + cardW, y + 26);

    let productionY = y + 40;
    productionRows.forEach(({ label, wrapped, height }) => {
      doc.setFontSize(9);
      doc.setTextColor(labelColor);
      doc.text(safePdfText(label), margin + cardPadding, productionY);
      doc.setFontSize(9);
      doc.setTextColor(20);
      doc.text(safePdfText(wrapped), margin + cardPadding + 120, productionY);
      productionY += height;
    });
    y += detailsCardH + cardSpacing;
  }

  // Campaign / Service details (render only fields relevant to the purchased product)
  if (sale.saleCategory === 'Digital') {
    const rows = [];
    function isPresent(v) {
      if (v == null) return false;
      if (Array.isArray(v)) return v.length > 0 && v.some(i => isPresent(i));
      if (typeof v === 'object') return Object.keys(v).length > 0;
      return String(v).trim() !== '';
    }

    const serviceName = details.service || details.websiteOption || details.printType || '';

    // Social Media Management
    if (details.service === 'Social Media Management') {
      const platforms = Array.isArray(details.socialPlatforms) ? details.socialPlatforms.join(', ') : (details.socialPlatform || '');
      if (isPresent(platforms)) rows.push(['Platforms Managed', platforms]);

      const socialUsernames = details.socialUsernames || {};
      const usernameEntries = Object.keys(socialUsernames).map(k => `${k}: ${socialUsernames[k] || ''}`).filter(Boolean);
      if (usernameEntries.length) rows.push(['Usernames', usernameEntries.join(', ')]);

      if (isPresent(details.socialStartDate) || isPresent(details.startDate)) rows.push(['Start Date', details.socialStartDate || details.startDate]);
      if (isPresent(details.campaignNotes) || isPresent(details.staticImageCampaignIdeas)) rows.push(['Service Notes', details.campaignNotes || details.staticImageCampaignIdeas]);
    }

    // Website
    else if (serviceName && (serviceName.toLowerCase().includes('website') || serviceName.toLowerCase().includes('site') || details.websiteUrl || details.websitePrimaryGoal)) {
      if (isPresent(details.websiteUrl)) rows.push(['Website URL', details.websiteUrl]);
      if (isPresent(details.websiteOption)) rows.push(['Project Type', details.websiteOption]);
      if (isPresent(details.websitePrimaryGoal)) rows.push(['Primary Goal', details.websitePrimaryGoal]);
      if (isPresent(details.pages)) rows.push(['Pages', details.pages]);
      if (isPresent(details.campaignNotes) || isPresent(details.campaignGoal)) rows.push(['Notes', details.campaignNotes || details.campaignGoal]);
    }

    // Paid Ads
    else if (details.service === 'Paid Ads' || (Array.isArray(details.paidAdPlatforms) && details.paidAdPlatforms.length) || details.paidAdsOption) {
      const paidPlatforms = Array.isArray(details.paidAdPlatforms) ? details.paidAdPlatforms.join(', ') : (details.paidAdsOption || '');
      if (isPresent(paidPlatforms)) rows.push(['Channels', paidPlatforms]);
      if (isPresent(details.campaignType)) rows.push(['Campaign Type', details.campaignType]);
      const targeting = [details.targetGeography || details.targetAreas, details.targetLocations, details.demographicAge ? `Age: ${details.demographicAge}` : null, details.demographicSex ? `Gender: ${details.demographicSex}` : null, details.demographicIncome ? `Income: ${details.demographicIncome}` : null].filter(Boolean).join(' • ');
      if (isPresent(targeting)) rows.push(['Targeting', targeting]);
      const adSpendRaw = details.monthlyAdSpend || details.totalInvestment || details.monthlyRate || '';
      if (isPresent(adSpendRaw)) rows.push(['Ad Spend', formatCurrency(adSpendRaw)]);
      if (isPresent(details.campaignStartDate) || isPresent(details.startDate)) rows.push(['Start Date', details.campaignStartDate || details.startDate]);
      if (isPresent(details.campaignNotes)) rows.push(['Campaign Notes', details.campaignNotes]);
    }

    // Geofencing (treated as a specialized Paid/Targeting product)
    else if (details.service === 'Geofencing' || details.targetGeography || details.targetLocations) {
      if (isPresent(details.campaignType)) rows.push(['Campaign Type', details.campaignType]);
      const geoTarget = [details.targetGeography || details.targetAreas, details.targetLocations].filter(Boolean).join(' • ');
      if (isPresent(geoTarget)) rows.push(['Targeting', geoTarget]);
      const adSpendRaw = details.monthlyAdSpend || details.totalInvestment || '';
      if (isPresent(adSpendRaw)) rows.push(['Ad Spend', formatCurrency(adSpendRaw)]);
      if (isPresent(details.campaignStartDate) || isPresent(details.startDate)) rows.push(['Start Date', details.campaignStartDate || details.startDate]);
      const demographics = [details.demographicAge ? `Age: ${details.demographicAge}` : null, details.demographicSex ? `Gender: ${details.demographicSex}` : null, details.demographicIncome ? `Income: ${details.demographicIncome}` : null].filter(Boolean).join(' • ');
      if (isPresent(demographics)) rows.push(['Demographic', demographics]);
    }

    // Fallback for generic Digital services
    else {
      if (isPresent(details.service)) rows.push(['Service', details.service]);
      const targeting = [details.targetGeography || details.targetAreas, details.targetLocations, details.demographicAge ? `Age: ${details.demographicAge}` : null, details.demographicSex ? `Gender: ${details.demographicSex}` : null].filter(Boolean).join(' • ');
      if (isPresent(targeting)) rows.push(['Targeting', targeting]);
      const adSpendRaw = details.monthlyAdSpend || details.totalInvestment || '';
      if (isPresent(adSpendRaw)) rows.push(['Ad Spend', formatCurrency(adSpendRaw)]);
      if (isPresent(details.campaignStartDate) || isPresent(details.startDate) || isPresent(details.socialStartDate)) rows.push(['Start Date', details.campaignStartDate || details.startDate || details.socialStartDate]);
      if (isPresent(details.campaignNotes) || isPresent(details.campaignGoal)) rows.push(['Notes', details.campaignNotes || details.campaignGoal]);
    }

    // Only render the card if we have relevant rows
    if (rows.length) {
      const campaignValueMaxW = cardW - cardPadding * 2 - 96;
      const campaignRows = rows.map(([label, value]) => {
        const wrapped = doc.splitTextToSize(String(value || ''), campaignValueMaxW);
        return { label, wrapped, height: Math.max(wrapped.length * 14, 16) };
      });

      const campaignContentHeight = campaignRows.reduce((sum, row) => sum + row.height, 0);
      const campaignCardH = Math.max(110, campaignContentHeight + 36);

      doc.setFillColor(BG);
      doc.setDrawColor(210);
      drawCard(margin, y, cardW, campaignCardH, 8, true);
      doc.setFontSize(11);
      doc.setTextColor(PURPLE);
      doc.text('Campaign Details', margin + cardPadding, y + 18);
      doc.setLineWidth(0.5);
      doc.setDrawColor(210);
      doc.line(margin, y + 26, margin + cardW, y + 26);

      let campaignY = y + 40;
      campaignRows.forEach(({ label, wrapped, height }) => {
        doc.setFontSize(9);
        doc.setTextColor(labelColor);
        doc.text(safePdfText(label), margin + cardPadding, campaignY);
        doc.setFontSize(9);
        doc.setTextColor(20);
        doc.text(safePdfText(wrapped), margin + cardPadding + 96, campaignY);
        campaignY += height;
      });
      y += campaignCardH + cardSpacing;
    }
  }

  // Payment Method section
  let paymentMethodDisplayValue = sale.paymentMethod === "Other" ? sale.otherPaymentMethod || sale.paymentMethod : sale.paymentMethod;
  if (typeof paymentMethodDisplayValue === 'string' && paymentMethodDisplayValue.includes('Invoice')) {
    paymentMethodDisplayValue = 'Invoice';
  }
  const paymentCardH = 48;
  doc.setFillColor(BG);
  doc.setDrawColor(210);
  drawCard(margin, y, cardW, paymentCardH, 8, true);
  doc.setFontSize(11);
  doc.setTextColor(PURPLE);
  doc.text('Payment Method', margin + cardPadding, y + 18);
  doc.setLineWidth(0.5);
  doc.setDrawColor(210);
  doc.line(margin, y + 26, margin + cardW, y + 26);
  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text(safePdfText(paymentMethodDisplayValue || 'Not specified'), margin + cardPadding, y + 42);
  y += paymentCardH + cardSpacing;
  const summaryX = PAGE_WIDTH - margin - summaryW;
  const signatureW = summaryX - margin - cardSpacing;

  // Footer helper
  const footerTextItems = [
    { text: 'Avidsphere', xFactor: 0.02, align: 'left' },
    { text: 'PO Box 595 Blue Ball PA 17506', xFactor: 0.33, align: 'left' },
    { text: 'https://avidsphereinc.com/', xFactor: 0.66, align: 'left' },
    { text: '267-482-0890', xFactor: 0.98, align: 'right' }
  ];
  function renderFooter() {
    doc.setFont(undefined, 'normal');
    let footerFontSize = 8;
    const footerY = PAGE_HEIGHT - 12;
    const availableWidth = PAGE_WIDTH - margin * 2;
    const minGap = 8;

    while (footerFontSize > 6) {
      doc.setFontSize(footerFontSize);
      const positions = footerTextItems.map(item => {
        const width = doc.getTextWidth(item.text);
        const anchorX = margin + availableWidth * item.xFactor;
        const left = item.align === 'right' ? anchorX - width : anchorX;
        const right = item.align === 'right' ? anchorX : anchorX + width;
        return { left, right };
      });

      const allGood = positions.every((pos, idx) => {
        if (idx === 0) return pos.left >= margin;
        const prev = positions[idx - 1];
        return pos.left >= prev.right + minGap;
      }) && positions[positions.length - 1].right <= PAGE_WIDTH - margin;

      if (allGood) break;
      footerFontSize -= 0.5;
    }

    doc.setTextColor(110);
    footerTextItems.forEach(item => {
      const x = margin + availableWidth * item.xFactor;
      doc.text(item.text, x, footerY, { align: item.align });
    });
  }

  if (y + requiredBottomSpace > PAGE_HEIGHT - margin) {
    // fallback onto a new page only if absolutely necessary
    doc.addPage();
    y = margin;
  }

  // Signature card on the left, pricing summary on the right
  doc.setFillColor(BG);
  doc.setDrawColor(210);
  drawCard(margin, y, signatureW, signatureH, 8, true);
  doc.setFillColor('#ffffff');
  drawCard(summaryX, y, summaryW, summaryH, 8, true);

  // Signature content
  let sigY = y + 18;
  doc.setFontSize(10);
  doc.setTextColor(PURPLE);
  doc.text('Customer Authorization', margin + cardPadding, sigY);
  sigY += 12;
  const sigLabelX = margin + cardPadding;
  if (sale && sale.customerSignatureImage) {
    const imgW = 120;
    const imgH = 32;
    doc.setFontSize(9);
    doc.setTextColor(labelColor);
    doc.text('Customer Signature', sigLabelX, sigY);
    sigY += 10;
    try { doc.addImage(sale.customerSignatureImage, 'PNG', sigLabelX, sigY, imgW, imgH); } catch (e) { /* ignore image add errors */ }
  } else {
    const lineLength = signatureW - cardPadding * 2;
    doc.setFontSize(9);
    doc.setTextColor(labelColor);
    doc.text('Customer Signature', sigLabelX, sigY);
    sigY += 8;
    doc.setDrawColor(140);
    doc.setLineWidth(0.7);
    doc.line(sigLabelX, sigY, sigLabelX + lineLength, sigY);
  }

  // Pricing summary content
  doc.setFontSize(10);
  doc.setTextColor(labelColor);
  doc.text(safePdfText('Pricing Summary'), summaryX + 14, y + 18);
  doc.setLineWidth(0.5);
  doc.line(summaryX + 14, y + 24, summaryX + summaryW - 14, y + 24);

  let rowY = y + 40;
  pricingRows.forEach((row, idx) => {
    const [label, value] = row;
    const isTotal = String(label || '').toUpperCase().includes('TOTAL');

    doc.setFontSize(isTotal ? 9 : 8);
    doc.setTextColor(100);
    doc.text(safePdfText(label), summaryX + 14, rowY);

    doc.setFontSize(isTotal ? 11 : 9);
    doc.setTextColor(isTotal ? PINK : 20);
    if (isTotal) doc.setFont(undefined, 'bold');
    doc.text(safePdfText(value), summaryX + summaryW - 14, rowY, { align: 'right' });
    if (isTotal) doc.setFont(undefined, 'normal');

    rowY += rowHeight;
  });

  renderFooter();

    const dataUriString = doc.output('datauristring');
    const base64 = dataUriString.split(',')[1];
    console.log('[Agreement] PDF generated successfully', { saleId: sale?.id, base64Length: base64.length });
    return base64;
  } catch (error) {
    console.error('[Agreement] PDF Generation Error:', error, { saleId: sale?.id, customerId: customer?.id, saleCategory: sale?.saleCategory, customerEmail: customer?.emailAddress });
    throw error;
  }
}

function downloadAgreementPdf(sale, customer) {
  try {
    const base64 = generateAgreementPdfBase64(sale, customer);
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${base64}`;
    const fname = makeSafeAgreementFilename(customer?.businessName, sale?.saleDate);
    link.download = fname;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    showError('Agreement PDF could not be generated. Check console for details.');
    console.error('[Agreement] Download agreement PDF error:', error, { saleId: sale?.id, customerId: customer?.id });
  }
}

function buildAgreementEmailBody(sale, customer) {
  const lines = [
    `Business Name: ${customer.businessName || "N/A"}`,
    `Contact Name: ${customer.contactPerson || "N/A"}`,
    `Products Purchased: ${getSaleProductSummary(sale)}`
  ];

  const details = sale.productDetails || {};
  if (sale.saleCategory === "Mailer") {
    if (details.mailerArea) lines.push(`Mailer Area: ${details.mailerArea}`);
    if (details.month) lines.push(`Month: ${details.month}`);
    if (details.adSize) lines.push(`Ad Size: ${details.adSize}`);
  }
  if (sale.saleCategory === "Digital") {
    if (details.service) lines.push(`Digital Service Purchased: ${details.service}`);
    if (details.service === "Social Media Management") {
      const socialPlatforms = Array.isArray(details.socialPlatforms)
        ? details.socialPlatforms
        : details.socialPlatform ? [details.socialPlatform] : [];
      if (socialPlatforms.length) lines.push(`Platforms Managed: ${socialPlatforms.join(", ")}`);
      const socialUsernames = details.socialUsernames || {};
      const usernameEntries = Object.keys(socialUsernames).map(k => `${k}: ${socialUsernames[k] || ''}`).filter(Boolean);
      if (usernameEntries.length) lines.push(`Social Usernames: ${usernameEntries.join(', ')}`);
    }
    if (details.websiteOption) lines.push(`Website Option: ${details.websiteOption}`);
    if (details.service === "Paid Ads") {
      const paidAdPlatforms = Array.isArray(details.paidAdPlatforms)
        ? details.paidAdPlatforms
        : details.paidAdsOption ? [details.paidAdsOption] : [];
      if (paidAdPlatforms.length) lines.push(`Channels: ${paidAdPlatforms.join(", ")}`);
    } else if (details.paidAdsOption) {
      lines.push(`Paid Ads Option: ${details.paidAdsOption}`);
    }
    if (details.monthlyAdSpend) lines.push(`Monthly Ad Spend: ${formatCurrency(details.monthlyAdSpend)}`);
    if (details.campaignStartDate || details.startDate) lines.push(`Start Date: ${details.campaignStartDate || details.startDate}`);
  }
  if (sale.saleCategory === "Print") {
    if (details.printType) lines.push(`Print Service: ${details.printType}`);
    const printDescription = details.printProjectDescription || details.otherPrintDescription || details.customDescription || "";
    if (printDescription) lines.push(`Description: ${printDescription}`);
    if (details.quantity) lines.push(`Quantity: ${details.quantity}`);
    if (details.size) lines.push(`Size: ${details.size}`);
    if (details.finish) lines.push(`Finish: ${details.finish}${details.otherFinish ? ` (${details.otherFinish})` : ''}`);
    if (details.thickness) lines.push(`Thickness: ${details.thickness}${details.otherThickness ? ` (${details.otherThickness})` : ''}`);
    if (details.fold) lines.push(`Fold: ${details.fold}`);
  }
  if (sale.saleCategory === "Mailer" || sale.saleCategory === "Print") {
    lines.push(`Design Required: ${sale.designRequired || "No"}`);
    lines.push(`Design Change: ${sale.designChange || sale.designChangeRequired || "No"}`);
  }
  if (sale.saleCategory === "Print") {
    const pt = (details.printType || "").trim();
    if (pt === "Custom Print Project" || pt === "Other") {
      lines.push(`Mailing Required: ${sale.needsMailing || details.needsMailing || "No"}`);
    }
  }

  lines.push(`Pricing Summary: ${formatCurrency(sale.dollarAmount)}`);
  lines.push(`Sales Rep: ${sale.salesRepresentative || "N/A"}`);
  lines.push(`Notes: ${sale.notes ? sale.notes : "None"}`);
  lines.push("\nCustomer Authorization");
  lines.push("Customer Signature: ______________________");

  return lines.join("\n");
}

function sendAgreementEmail(sale) {
  console.log('[Agreement] Preparing agreement email', { saleId: sale?.id });
  if (!sale || !sale.customerId) {
    console.error('[Agreement] Invalid sale for email preparation', { sale });
    showError('Unable to prepare the agreement email: invalid sale data.');
    return;
  }
  const customer = getCustomerById(sale.customerId);
  if (!customer) {
    console.error('[Agreement] Customer not found for email', { saleId: sale.id });
    showError('Unable to prepare the agreement email: customer record not found.');
    return;
  }
  if (!customer.emailAddress) {
    console.error('[Agreement] Customer email missing for email', { customer });
    showError('Unable to prepare the agreement email: customer email address is missing.');
    return;
  }

  const subject = `Avidsphere Advertising Agreement - ${customer.businessName || "Customer"}`;
  const body = buildAgreementEmailBody(sale, customer);
  const mailto = `mailto:${encodeURIComponent(customer.emailAddress)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  console.log('[Agreement] Mailto link generated', { mailto });
  window.open(mailto, "_blank");
  showSuccess("Your email draft has been created. If using a PDF agreement, attach the downloaded PDF before sending.");
}

function initiateAgreementPackageWorkflow(sale) {
  console.log('[Agreement] Initiating agreement package workflow', { saleId: sale?.id, sale });
  if (!sale || !sale.customerId) {
    console.error('[Agreement] Invalid sale provided to package workflow', { sale });
    showError('Unable to prepare the agreement package: invalid sale data.');
    return;
  }
  const customer = getCustomerById(sale.customerId);
  if (!customer) {
    console.error('[Agreement] Customer not found for agreement package', { saleId: sale.id });
    showError('Unable to prepare the agreement package: customer record is missing.');
    return;
  }
  if (!validateAgreementPackageData(sale, customer)) {
    return;
  }

  try {
    console.log('[Agreement] Agreement package creation started', { saleId: sale.id, customerId: customer.id });
    const pdfBase64 = generateAgreementPdfBase64(sale, customer);
    const pdfFileName = makeSafeAgreementFilename(customer?.businessName);
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = pdfFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('[Agreement] PDF attachment preparation completed', { saleId: sale.id, pdfFileName });

    showAgreementPackageSuccess(sale, customer, pdfFileName);
    console.log('[Agreement] Agreement package success panel shown', { saleId: sale.id, pdfFileName });

    setTimeout(() => {
      const subject = `Avidsphere Advertising Agreement - ${customer.businessName || "Customer"}`;
      const body = buildAgreementEmailBody(sale, customer);
      const mailto = `mailto:${encodeURIComponent(customer.emailAddress)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      console.log('[Agreement] Opening mail client', { mailto });
      window.open(mailto, "_blank");
    }, 300);

    console.log('[Agreement] Agreement package prepared', { saleId: sale.id, pdfFileName });
  } catch (error) {
    showError('Agreement PDF could not be generated. Check console for details.');
    console.error('[Agreement] Agreement package error:', error, { saleId: sale?.id, customerId: customer?.id });
  }
}

function getSaleDateOrToday(saleDate) {
  const rawDate = saleDate || getTodayISO();
  const parsed = new Date(rawDate + (String(rawDate).includes('T') ? '' : 'T00:00:00'));
  return Number.isNaN(parsed.getTime()) ? getTodayISO() : parsed.toISOString().slice(0, 10);
}

function makeSafeAgreementFilename(name, saleDate) {
  const cleanedName = String(name || '').replace(/[\\/:*?"<>|]+/g, '').trim().replace(/\s+/g, '_');
  const safeDate = getSaleDateOrToday(saleDate);
  if (!cleanedName) return `Avidsphere_Agreement_${safeDate}.pdf`;
  return `Avidsphere_Agreement_${cleanedName}_${safeDate}.pdf`;
}

function showAgreementPackageSuccess(sale, customer, pdfFileName) {
  if (!ui.saleConfirmationPackagePanel) return;

  // Update file names in the success panel
  if (ui.packagePdfFileName) {
    ui.packagePdfFileName.textContent = pdfFileName;
  }
  if (ui.packagePdfAttachmentName) {
    ui.packagePdfAttachmentName.textContent = pdfFileName;
  }

  // Switch to success panel view
  renderView("saleConfirmationPackage");
}


function renderSaleConfirmation(sale) {
  const customer = getCustomerById(sale.customerId);
  if (!sale || !customer || !ui.saleConfirmationPanel) return;
  state.saleConfirmationSaleId = sale.id;
  ui.saleConfirmationBusinessName.textContent = customer.businessName || "";
  ui.saleConfirmationContactPerson.textContent = customer.contactPerson || "";
  ui.saleConfirmationProducts.textContent = getSaleProductSummary(sale);
  ui.saleConfirmationAmount.textContent = formatCurrency(sale.dollarAmount);
  ui.saleConfirmationDate.textContent = formatDate(sale.saleDate);
  ui.saleConfirmationSalesRep.textContent = sale.salesRepresentative || "";
  ui.saleConfirmationNotes.textContent = sale.notes || "No internal notes.";
  // Load any existing saved signature for this sale into the signature pad and fields
  loadSignatureForSale(sale.id);
  renderView("saleConfirmation");
}

// Signature pad implementation (lightweight, native canvas)
function initSignaturePad() {
  const canvas = ui.signaturePad;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let last = { x: 0, y: 0 };

  function resizeCanvasForDisplay() {
    // keep internal resolution crisp while preserving element size
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(300, Math.round(rect.width * ratio));
    canvas.height = Math.max(120, Math.round(rect.height * ratio));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    // reset transform before scaling to avoid accumulation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#111827';
    clearCanvasVisual();
  }

  function clearCanvasVisual() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // if there is an existing saved image for current sale, it'll be loaded separately
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function pointerDown(e) { e.preventDefault(); drawing = true; last = getPos(e); }
  function pointerMove(e) { if (!drawing) return; e.preventDefault(); const p = getPos(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; }
  function pointerUp(e) { if (!drawing) return; e.preventDefault(); drawing = false; }

  // Pointer events and touch/mouse fallback
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointerleave', pointerUp);
  canvas.addEventListener('touchstart', pointerDown, { passive: false });
  canvas.addEventListener('touchmove', pointerMove, { passive: false });
  canvas.addEventListener('touchend', pointerUp);

  window.addEventListener('resize', () => { try { initSignaturePad(); } catch (e) {} });
}

function clearSignatureCanvas() {
  const canvas = ui.signaturePad;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loadSignatureForSale(saleId) {
  const sale = getSaleById(saleId);
  if (!sale) return;
  // load signature image
  // load image into canvas if present
  if (sale.customerSignatureImage && ui.signaturePad) {
    const img = new Image();
    img.onload = () => {
      const canvas = ui.signaturePad;
      const ctx = canvas.getContext('2d');
      // fit image into canvas while preserving aspect and handle devicePixelRatio
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(300, Math.round(rect.width * ratio));
      canvas.height = Math.max(120, Math.round(rect.height * ratio));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = sale.customerSignatureImage;
  } else if (ui.signaturePad) {
    // clear if no image
    clearSignatureCanvas();
  }
}

function saveSignatureForSale(saleId) {
  const sale = getSaleById(saleId);
  if (!sale) return;
  const canvas = ui.signaturePad;
  if (!canvas) return;
  const dataUrl = canvas.toDataURL('image/png');
  sale.customerSignatureImage = dataUrl;
  if ('customerSignatureDate' in sale) delete sale.customerSignatureDate;
  persistState();
  showSuccess('Signature saved to sale.');
}

// Hook up clear and save buttons (init once)
function wireSignatureButtons() {
  if (ui.clearSignatureBtn) ui.clearSignatureBtn.addEventListener('click', e => { e.preventDefault(); clearSignatureCanvas(); });
  if (ui.saveSignatureBtn) ui.saveSignatureBtn.addEventListener('click', e => { e.preventDefault(); if (!state.saleConfirmationSaleId) { showError('No sale selected.'); return; } saveSignatureForSale(state.saleConfirmationSaleId); });
}

function formatDate(dateString) { if (!dateString) return "N/A"; const parsed = new Date(dateString + (dateString.includes("T") ? "" : "T00:00:00")); if (Number.isNaN(parsed.getTime())) return dateString; return parsed.toLocaleDateString(); }
function formatCurrency(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0); }
function getCheckedValuesByName(name) { return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(input => input.value); }
function setCheckboxGroupValues(name, values = []) {
  const selected = new Set((values || []).filter(Boolean));
  document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
    input.checked = selected.has(input.value);
  });
}
// design checkbox helpers: accept either select or checkbox elements
function getYesNo(el) {
  if (!el) return "No";
  try {
    if (el.type === 'checkbox') return el.checked ? "Yes" : "No";
    return (el.value || "No") === "Yes" ? "Yes" : "No";
  } catch (e) { return "No"; }
}
function setYesNo(el, val) {
  if (!el) return;
  try {
    if (el.type === 'checkbox') el.checked = (val === "Yes"); else el.value = val || "No";
  } catch (e) { /* ignore */ }
}
function updatePaidAdsOtherVisibility() {
  if (!ui.saleOtherPaidAdsPlatformContainer) return;
  const otherSelected = getCheckedValuesByName("salePaidAdsPlatform").includes("Other Paid Ads");
  ui.saleOtherPaidAdsPlatformContainer.classList.toggle("hidden", !otherSelected);
  if (!otherSelected && ui.saleOtherPaidAdsPlatform) ui.saleOtherPaidAdsPlatform.value = "";
}

const PLATFORM_USERNAME_LABELS = {
  "Facebook": "Facebook Username / Page",
  "Instagram": "Instagram Username",
  "TikTok": "TikTok Username",
  "YouTube": "YouTube Channel",
  "Snapchat": "Snapchat Username",
  "LinkedIn": "LinkedIn Company Page",
  "X (Twitter)": "X Username"
};

function idSafe(name) { return String(name).replace(/[^a-z0-9]/gi, '_'); }

function renderChipsForGroup(inputName, chipsContainerId) {
  const values = getCheckedValuesByName(inputName);
  const container = document.getElementById(chipsContainerId);
  if (!container) return;
  container.innerHTML = '';
  values.forEach(v => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = v;
    // remove button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '×';
    btn.style.marginLeft = '8px';
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      // uncheck underlying checkbox(s)
      const inputs = document.querySelectorAll(`input[name="${inputName}"][value="${CSS.escape(v)}"]`);
      inputs.forEach(i => { i.checked = false; i.dispatchEvent(new Event('change', { bubbles: true })); });
      // re-render chips
      renderChipsForGroup(inputName, chipsContainerId);
    });
    chip.appendChild(btn);
    container.appendChild(chip);
  });
}

function renderSocialUsernames() {
  const selected = getCheckedValuesByName('saleSocialPlatform');
  const container = document.getElementById('socialUsernamesContainer');
  if (!container) return;
  container.innerHTML = '';
  selected.forEach(platform => {
    const key = idSafe(platform);
    const label = PLATFORM_USERNAME_LABELS[platform] || `${platform} Username`;
    const wrapper = document.createElement('label');
    wrapper.textContent = label;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `socialUser_${key}`;
    input.placeholder = '';
    input.value = '';
    input.className = 'social-username-input';
    wrapper.appendChild(input);
    container.appendChild(wrapper);
  });
}

function wireMultiSelectBehavior() {
  // Toggles
  const socialToggle = document.getElementById('saleSocialToggle');
  const socialDropdown = document.getElementById('saleSocialDropdown');
  const paidToggle = document.getElementById('salePaidAdsToggle');
  const paidDropdown = document.getElementById('salePaidAdsDropdown');
  if (socialToggle && socialDropdown) {
    socialToggle.addEventListener('click', () => socialDropdown.classList.toggle('hidden'));
  }
  if (paidToggle && paidDropdown) {
    paidToggle.addEventListener('click', () => paidDropdown.classList.toggle('hidden'));
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (!t) return;
    const socialMultiEl = document.getElementById('saleSocialMulti');
    const paidMultiEl = document.getElementById('salePaidAdsMulti');
    if (socialMultiEl && !socialMultiEl.contains(t)) {
      document.getElementById('saleSocialDropdown')?.classList.add('hidden');
    }
    if (paidMultiEl && !paidMultiEl.contains(t)) {
      document.getElementById('salePaidAdsDropdown')?.classList.add('hidden');
    }
  });

  // Update chips and username fields when checkboxes change
  const paidContainer = document.getElementById('salePaidAdsPlatforms');
  const socialContainer = document.getElementById('saleSocialPlatforms');
  if (paidContainer) {
    paidContainer.addEventListener('change', () => {
      renderChipsForGroup('salePaidAdsPlatform', 'salePaidAdsChips');
      updatePaidAdsOtherVisibility();
    });
  }
  if (socialContainer) {
    socialContainer.addEventListener('change', () => {
      renderChipsForGroup('saleSocialPlatform', 'saleSocialChips');
      renderSocialUsernames();
    });
  }
}
function safeParseStorage(key, fallback) { try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; } catch (error) { console.error(error); return fallback; } }
function getCustomerById(id) { return state.customers.find(customer => customer.id === id) || null; }
function getSaleById(id) { return state.sales.find(sale => sale.id === id) || null; }
function getReminderById(id) { return state.reminders.find(reminder => reminder.id === id) || null; }
function getSaleCategoryFromLegacyType(type) {
  if (!type) return "Digital";
  if (type === "Mailer") return "Mailer";
  if (type === "Print") return "Print";
  return "Digital";
}

function getRecommendedNotificationSelections(category, productDetails = {}) {
  if (!category) {
    return {
      notifyManagement: false,
      notifyPrintTeam: false,
      notifyDesigners: false,
      notifyDigitalTeam: false,
      notifySocialMediaTeam: false,
      notifyGeofencing: false
    };
  }
  if (category === "Mailer" || category === "Print") {
    return {
      notifyManagement: true,
      notifyPrintTeam: true,
      notifyDesigners: true,
      notifyDigitalTeam: false,
      notifySocialMediaTeam: false,
      notifyGeofencing: false
    };
  }
  if (category === "Digital") {
    const service = (productDetails.service || "").trim();
    if (service === "Social Media Management") {
      return {
        notifyManagement: true,
        notifyPrintTeam: false,
        notifyDesigners: false,
        notifyDigitalTeam: false,
        notifySocialMediaTeam: true,
        notifyGeofencing: false
      };
    }
    if (service === "Geofencing") {
      return {
        notifyManagement: true,
        notifyPrintTeam: false,
        notifyDesigners: false,
        notifyDigitalTeam: true,
        notifySocialMediaTeam: false,
        notifyGeofencing: true
      };
    }
    // Generic digital
    return {
      notifyManagement: true,
      notifyPrintTeam: false,
      notifyDesigners: false,
      notifyDigitalTeam: true,
      notifySocialMediaTeam: false,
      notifyGeofencing: false
    };
  }
  return {
    notifyManagement: true,
    notifyPrintTeam: false,
    notifyDesigners: false,
    notifyDigitalTeam: false,
    notifySocialMediaTeam: false,
    notifyGeofencing: false
  };
}

function getSaleNotificationSettings(sale) {
  const category = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  const recommended = getRecommendedNotificationSelections(category, sale.productDetails || {});
  return {
    notifyManagement: typeof sale.notifyManagement === "boolean" ? sale.notifyManagement : recommended.notifyManagement,
    notifyPrintTeam: typeof sale.notifyPrintTeam === "boolean" ? sale.notifyPrintTeam : recommended.notifyPrintTeam,
    notifyDesigners: typeof sale.notifyDesigners === "boolean" ? sale.notifyDesigners : recommended.notifyDesigners,
    notifyDigitalTeam: typeof sale.notifyDigitalTeam === "boolean" ? sale.notifyDigitalTeam : recommended.notifyDigitalTeam,
    notifySocialMediaTeam: typeof sale.notifySocialMediaTeam === "boolean" ? sale.notifySocialMediaTeam : recommended.notifySocialMediaTeam,
    notifyGeofencing: typeof sale.notifyGeofencing === "boolean" ? sale.notifyGeofencing : recommended.notifyGeofencing
  };
}

function normalizeSale(sale) {
  if (!sale) return null;
  sale.saleCategory = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  sale.productDetails = sale.productDetails || {};
  if (!sale.designRequired) sale.designRequired = "No";
  if (!sale.designChangeRequired) sale.designChangeRequired = sale.designChange || "No";
  if (!sale.designChange) sale.designChange = sale.designChangeRequired || "No";
  // Only keep needsMailing when it's applicable to Print products
  const incomingPrintType = (sale.productDetails?.printType || "").trim();
  if (sale.saleCategory === "Print" && (incomingPrintType === "Custom Print Project" || incomingPrintType === "Other")) {
    if (!sale.needsMailing) sale.needsMailing = sale.productDetails?.needsMailing || "No";
  } else {
    if ('needsMailing' in sale) delete sale.needsMailing;
    if (sale.productDetails && 'needsMailing' in sale.productDetails) delete sale.productDetails.needsMailing;
  }
  if ('customerSignatureDate' in sale) delete sale.customerSignatureDate;

  if (sale.saleCategory === "Mailer") {
    sale.productDetails.mailerArea = sale.productDetails.mailerArea || (sale.saleType === "Mailer" ? "" : "");
    sale.productDetails.month = sale.productDetails.month || "";
    sale.productDetails.adSize = sale.productDetails.adSize || "";
  }

  if (sale.saleCategory === "Digital") {
    sale.productDetails.service = sale.productDetails.service || (sale.saleType === "Social Media Management" ? "Social Media Management" : sale.saleType === "Website" ? "Website" : sale.saleType === "Paid Ads" ? "Paid Ads" : "");
    sale.productDetails.websiteOption = sale.productDetails.websiteOption || "";
    sale.productDetails.paidAdsOption = sale.productDetails.paidAdsOption || "";
    sale.productDetails.paidAdPlatforms = Array.isArray(sale.productDetails.paidAdPlatforms)
      ? sale.productDetails.paidAdPlatforms
      : sale.productDetails.paidAdsOption ? [sale.productDetails.paidAdsOption] : [];
    sale.productDetails.otherPaidAdsPlatform = sale.productDetails.otherPaidAdsPlatform || "";
    sale.productDetails.staticImageCampaignIdeas = sale.productDetails.staticImageCampaignIdeas || "";
    sale.productDetails.videoCampaign = sale.productDetails.videoCampaign || "";
    sale.productDetails.clientProvidingVideo = sale.productDetails.clientProvidingVideo || "";
    sale.productDetails.targetAreas = sale.productDetails.targetAreas || "";
    sale.productDetails.targetLocations = sale.productDetails.targetLocations || "";
    sale.productDetails.demographicAge = sale.productDetails.demographicAge || "";
    sale.productDetails.demographicSex = sale.productDetails.demographicSex || "";
    sale.productDetails.demographicIncome = sale.productDetails.demographicIncome || "";
    sale.productDetails.monthlyAdSpend = sale.productDetails.monthlyAdSpend || "";
    sale.productDetails.startDate = sale.productDetails.startDate || "";
    // New structured fields
    sale.productDetails.socialPlatform = sale.productDetails.socialPlatform || "";
    sale.productDetails.socialPlatforms = Array.isArray(sale.productDetails.socialPlatforms)
      ? sale.productDetails.socialPlatforms
      : sale.productDetails.socialPlatform ? [sale.productDetails.socialPlatform] : [];
    sale.productDetails.socialUsername = sale.productDetails.socialUsername || "";
    sale.productDetails.socialUsernames = sale.productDetails.socialUsernames || {};
    sale.productDetails.socialStartDate = sale.productDetails.socialStartDate || sale.productDetails.startDate || "";
    sale.productDetails.campaignGoal = sale.productDetails.campaignGoal || "";
    sale.productDetails.campaignNotes = sale.productDetails.campaignNotes || sale.productDetails.staticImageCampaignIdeas || "";
    sale.productDetails.websiteUrl = sale.productDetails.websiteUrl || "";
    sale.productDetails.websitePrimaryGoal = sale.productDetails.websitePrimaryGoal || "";
    sale.productDetails.landingPageUrl = sale.productDetails.landingPageUrl || "";
    sale.productDetails.otherPaidAdsPlatform = sale.productDetails.otherPaidAdsPlatform || "";
    // Geofencing aliases (preserve older keys and add explicit names)
    sale.productDetails.targetGeography = sale.productDetails.targetGeography || sale.productDetails.targetAreas || "";
    sale.productDetails.campaignStartDate = sale.productDetails.campaignStartDate || sale.productDetails.startDate || "";
  }

  if (sale.saleCategory === "Print") {
    sale.productDetails.printType = sale.productDetails.printType || "";
    sale.productDetails.printProjectDescription = sale.productDetails.printProjectDescription || (sale.productDetails.printType === "Custom Print Project" ? sale.productDetails.customDescription || "" : "");
    sale.productDetails.otherPrintDescription = sale.productDetails.otherPrintDescription || (sale.productDetails.printType === "Other" ? sale.productDetails.customDescription || "" : "");
    sale.productDetails.customDescription = sale.productDetails.customDescription || sale.productDetails.printProjectDescription || sale.productDetails.otherPrintDescription || "";
    sale.productDetails.quantity = sale.productDetails.quantity || "";
    sale.productDetails.size = sale.productDetails.size || "";
    sale.productDetails.designFee = sale.productDetails.designFee != null ? sale.productDetails.designFee : 0;
    const pt = (sale.productDetails.printType || "").trim();
    if (pt === "Custom Print Project" || pt === "Other") {
      sale.productDetails.needsMailing = sale.productDetails.needsMailing || sale.needsMailing || "No";
    } else {
      if ('needsMailing' in sale.productDetails) delete sale.productDetails.needsMailing;
      if ('needsMailing' in sale) delete sale.needsMailing;
    }
  }

  const recommended = getRecommendedNotificationSelections(sale.saleCategory, sale.productDetails);
  sale.notifyManagement = typeof sale.notifyManagement === "boolean" ? sale.notifyManagement : recommended.notifyManagement;
  sale.notifyPrintTeam = typeof sale.notifyPrintTeam === "boolean" ? sale.notifyPrintTeam : recommended.notifyPrintTeam;
  sale.notifyDesigners = typeof sale.notifyDesigners === "boolean" ? sale.notifyDesigners : recommended.notifyDesigners;
  sale.notifyDigitalTeam = typeof sale.notifyDigitalTeam === "boolean" ? sale.notifyDigitalTeam : recommended.notifyDigitalTeam;
  sale.notifySocialMediaTeam = typeof sale.notifySocialMediaTeam === "boolean" ? sale.notifySocialMediaTeam : recommended.notifySocialMediaTeam;
  sale.notifyGeofencing = typeof sale.notifyGeofencing === "boolean" ? sale.notifyGeofencing : recommended.notifyGeofencing;

  return sale;
}

function getSaleDisplayLabel(sale) {
  if (!sale) return "Unknown";
  const category = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  if (category === "Mailer") {
    const details = sale.productDetails || {};
    const parts = ["Mailer", details.mailerArea, details.month, details.adSize].filter(Boolean);
    return parts.join(" • ") || "Mailer";
  }
  if (category === "Digital") {
    const details = sale.productDetails || {};
    const parts = [details.service || "Digital"].filter(Boolean);
    if (details.websiteOption) parts.push(details.websiteOption);
    if (details.paidAdsOption) parts.push(details.paidAdsOption);
    return parts.join(" • ") || "Digital";
  }
  if (category === "Print") {
    const details = sale.productDetails || {};
    const parts = [details.printType || "Print", details.size, details.quantity ? `Qty ${details.quantity}` : ""].filter(Boolean);
    return parts.join(" • ") || "Print";
  }
  return sale.saleType || "Sale";
}

function getSaleCategoryBadgeLabel(sale) {
  if (!sale) return "Sale";
  const category = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  const service = (sale.productDetails?.service || sale.saleType || "").trim();
  if (category === "Mailer") return "Mailer";
  if (category === "Print") return "Print";
  if (service === "Social Media Management") return "Social Media";
  if (service === "Paid Ads") return "Paid Ads";
  if (service === "Geofencing") return "Geofencing";
  if (service === "Website" || service === "Website Services") return "Website";
  if (category === "Digital") return "Digital";
  return category || sale.saleType || "Sale";
}

function getSaleCategoryClass(sale) {
  return getSaleCategoryBadgeLabel(sale).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "sale";
}

function getSaleStatusLabel(sale) {
  if (!sale) return "";
  return sale.status || sale.saleStatus || sale.agreementStatus || sale.paymentStatus || "";
}

function getSaleNotePreview(sale, maxLength = 96) {
  const notes = (sale?.notes || "").trim();
  if (!notes) return "";
  return notes.length > maxLength ? `${notes.slice(0, maxLength - 1)}...` : notes;
}

function updatePrintDesignFeeVisibility() {
  if (!ui.printDesignFeeContainer) return;
  const category = ui.saleCategory?.value;
  if (category !== "Print") return;
  const designRequired = ui.designRequired?.checked || false;
  const designChangeRequired = ui.designChangeRequired?.checked || false;
  const showDesignFee = designRequired || designChangeRequired;
  ui.printDesignFeeContainer.classList.toggle("hidden", !showDesignFee);
  if (!showDesignFee && ui.salePrintDesignFee) {
    ui.salePrintDesignFee.value = "";
  }
}

function updateSaleFormVisibility(category = ui.saleCategory?.value, productDetails = {}) {
  if (!ui.mailerFields || !ui.digitalFields || !ui.printFields) return;
  ui.mailerFields.classList.toggle("hidden", category !== "Mailer");
  ui.digitalFields.classList.toggle("hidden", category !== "Digital");
  ui.printFields.classList.toggle("hidden", category !== "Print");

  const showDesign = category === "Mailer" || category === "Print";
  // Mailing is only applicable for certain Print products
  const printType = (productDetails.printType || ui.salePrintType?.value || "").trim();
  const allowedPrintMailing = printType === "Custom Print Project" || printType === "Other";
  const showMailing = category === "Print" && allowedPrintMailing;
  if (ui.designFieldset) ui.designFieldset.classList.toggle("hidden", !showDesign);
  if (ui.mailingRequiredContainer) ui.mailingRequiredContainer.classList.toggle("hidden", !showMailing);

  // when design is hidden, clear selections; use checked for checkbox inputs
  if (!showDesign && ui.designRequired) ui.designRequired.checked = false;
  if (!showDesign && ui.designChangeRequired) ui.designChangeRequired.checked = false;
  if (!showMailing && ui.needsMailing) ui.needsMailing.value = "No";

  if (category === "Digital") {
    updateDigitalServiceVisibility(productDetails.service || ui.saleDigitalService?.value);
  } else {
    ui.digitalSocialFields?.classList.add("hidden");
    ui.digitalWebsiteFields?.classList.add("hidden");
    ui.digitalPaidAdsFields?.classList.add("hidden");
    if (ui.saleGeofenceCampaignType) ui.saleGeofenceCampaignType.required = false;
  }
  if (category === "Print") {
    updatePrintDescriptionLabel(ui.salePrintType?.value || "");
  }
  if (ui.saleAmount) ui.saleAmount.readOnly = category === "Mailer" || category === "Digital";

  // move designFieldset into Mailer or Print sections so it's directly placed above pricing
  try {
    if (ui.designFieldset && showDesign) {
      if (category === "Mailer") {
        const pricingCard = ui.mailerFields.querySelector('.pricing-card');
        if (pricingCard) pricingCard.parentNode.insertBefore(ui.designFieldset, pricingCard);
        // set labels to include fees for Mailer
        ui.designFieldset.querySelectorAll('.design-label').forEach(el => el.textContent = el.dataset.mailer || el.textContent);
      } else if (category === "Print") {
        const pricingSection = ui.printFields.querySelector('.pricing-section');
        if (pricingSection) pricingSection.parentNode.insertBefore(ui.designFieldset, pricingSection);
        // set labels to remove fees for Print
        ui.designFieldset.querySelectorAll('.design-label').forEach(el => el.textContent = el.dataset.print || el.textContent);
      }
    }
  } catch (e) { console.error(e); }
  
  // Update Print Design Fee visibility
  if (category === "Print") {
    updatePrintDesignFeeVisibility();
  } else {
    // Hide Design Fee container for non-Print categories
    if (ui.printDesignFeeContainer) ui.printDesignFeeContainer.classList.add("hidden");
  }
}

function updateDigitalServiceVisibility(service) {
  if (!ui.digitalSocialFields || !ui.digitalWebsiteFields || !ui.digitalPaidAdsFields) return;
  ui.digitalSocialFields.classList.toggle("hidden", service !== "Social Media Management");
  ui.digitalWebsiteFields.classList.toggle("hidden", service !== "Website");
  ui.digitalPaidAdsFields.classList.toggle("hidden", service !== "Paid Ads");
  if (ui.digitalGeofencingFields) ui.digitalGeofencingFields.classList.toggle("hidden", service !== "Geofencing");
  // Ensure Optional Design Services are not visible for any Digital service
  if (ui.designFieldset) ui.designFieldset.classList.add('hidden');
  if (ui.saleGeofenceCampaignType) ui.saleGeofenceCampaignType.required = service === "Geofencing";
}

function updatePrintDescriptionLabel(printType) {
  if (!ui.salePrintDescriptionLabel || !ui.salePrintDescription) return;
  const isOther = String(printType || '').toLowerCase() === 'other' || String(printType || '').toUpperCase() === 'OTHER';
  const labelText = isOther ? "Other Print Service Description" : "Project Description";
  const textNode = Array.from(ui.salePrintDescriptionLabel.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
  if (textNode) textNode.nodeValue = labelText;
  ui.salePrintDescription.placeholder = isOther
    ? "Describe the print service in detail."
    : "Describe the print project (Examples: business cards, brochures, banners, flyers, postcards, signs, etc.)";
  // Show description only for OTHER; hide for standard products
  ui.salePrintDescriptionLabel.classList.toggle('hidden', !isOther);
  if (!isOther) ui.salePrintDescription.value = ui.salePrintDescription.value || "";
}

function updateOtherFinishVisibility() {
  if (!ui.salePrintFinish || !ui.salePrintOtherFinishContainer || !ui.salePrintOtherFinish) return;
  const isOther = String(ui.salePrintFinish.value || '').toLowerCase() === 'other';
  ui.salePrintOtherFinishContainer.classList.toggle('hidden', !isOther);
  if (!isOther) ui.salePrintOtherFinish.value = '';
}

function updateOtherThicknessVisibility() {
  if (!ui.salePrintThickness || !ui.salePrintOtherThicknessContainer || !ui.salePrintOtherThickness) return;
  const isOther = String(ui.salePrintThickness.value || '').toLowerCase() === 'other';
  ui.salePrintOtherThicknessContainer.classList.toggle('hidden', !isOther);
  if (!isOther) ui.salePrintOtherThickness.value = '';
}

function updatePaymentMethodVisibility(paymentMethod) {
  if (!ui.otherPaymentMethodContainer) return;
  ui.otherPaymentMethodContainer.classList.toggle("hidden", paymentMethod !== "Other");
  if (paymentMethod !== "Other" && ui.saleOtherPaymentMethod) {
    ui.saleOtherPaymentMethod.value = "";
  }
}

function collectSaleProductDetails() {
  const details = {};
  const category = ui.saleCategory?.value;
  if (category === "Mailer") {
    details.mailerArea = ui.saleMailerArea?.value || "";
    details.month = ui.saleMailerMonth?.value || "";
    details.mailerRunTime = Number(ui.saleMailerRunTime?.value) || 0;
    details.adSize = ui.saleMailerAdSize?.value || "";
    details.discountType = ui.saleMailerDiscountType?.value || "None";
    details.discountValue = Number(ui.saleMailerDiscountValue?.value) || 0;
    // Mailers are inherently mailed; do not persist/display a separate mailing field
    const pricing = getMailerCalculatedPricing({
      adSize: details.adSize,
      runTime: details.mailerRunTime,
      discountType: details.discountType,
      discountValue: details.discountValue,
      designRequired: ui.designRequired?.value || "No",
      designChangeRequired: ui.designChangeRequired?.value || "No"
    });
    details.monthlyRate = pricing.monthlyRate;
    details.subtotal = pricing.subtotal;
    details.designRequiredFee = pricing.designRequiredFee;
    details.designChangeFee = pricing.designChangeFee;
    details.totalInvestment = pricing.totalInvestment;
  }
  if (category === "Digital") {
    details.service = ui.saleDigitalService?.value || "";
    details.servicePrice = Number(ui.saleDigitalServicePrice?.value) || 0;
    details.discountType = ui.saleDigitalDiscountType?.value || "None";
    details.discountValue = Number(ui.saleDigitalDiscountValue?.value) || 0;
    const pricing = getDigitalCalculatedPricing({
      servicePrice: details.servicePrice,
      discountType: details.discountType,
      discountValue: details.discountValue
    });
    details.discountAmount = pricing.discountAmount;
    details.totalInvestment = pricing.totalInvestment;

    details.websiteOption = ui.saleWebsiteOption?.value || "";
    details.paidAdPlatforms = getCheckedValuesByName("salePaidAdsPlatform");
    const otherPaidAdValue = ui.saleOtherPaidAdsPlatform?.value?.trim();
    if (otherPaidAdValue && details.paidAdPlatforms.includes("Other Paid Ads")) {
      details.paidAdPlatforms = details.paidAdPlatforms.filter(item => item !== "Other Paid Ads");
      details.paidAdPlatforms.push(otherPaidAdValue);
    }
    details.otherPaidAdsPlatform = otherPaidAdValue || "";
    // Paid Ads / Campaign fields (moved under Paid Ads workflow)
    details.campaignGoal = ui.saleDigitalCampaignGoal?.value.trim() || "";
    details.staticImageCampaignIdeas = ui.saleDigitalStaticIdeas?.value.trim() || "";
    details.videoCampaign = ui.saleDigitalVideoCampaign?.value.trim() || "";
    details.clientProvidingVideo = ui.saleDigitalClientVideo?.value || "";
    details.targetAreas = ui.saleDigitalTargetAreas?.value.trim() || "";
    details.targetLocations = ui.saleDigitalTargetLocations?.value.trim() || "";
    details.demographicAge = ui.saleDigitalAge?.value.trim() || "";
    details.demographicSex = ui.saleDigitalSex?.value.trim() || "";
    details.demographicIncome = ui.saleDigitalIncome?.value.trim() || "";
    details.monthlyAdSpend = ui.saleDigitalMonthlySpend?.value || "";
    details.startDate = ui.saleDigitalStartDate?.value || "";
    details.websiteUrl = ui.saleDigitalWebsiteUrl?.value?.trim() || "";
    details.landingPageUrl = ui.saleDigitalLandingPageUrl?.value?.trim() || "";
    details.campaignNotes = ui.saleDigitalCampaignNotes?.value.trim() || "";

    // Social Media Management fields (lightweight)
    details.socialPlatforms = getCheckedValuesByName("saleSocialPlatform");
    // collect per-platform usernames from dynamic inputs
    const socialUsernames = {};
    (details.socialPlatforms || []).forEach(p => {
      const el = document.getElementById(`socialUser_${idSafe(p)}`);
      if (el) socialUsernames[p] = el.value.trim();
    });
    details.socialUsernames = socialUsernames;
    // legacy single username preserved for backwards compatibility
    details.socialUsername = ui.saleSocialUsername?.value?.trim() || "";
    details.socialStartDate = ui.saleSocialStartDate?.value || "";

    // Geofencing fields
    details.campaignType = ui.saleGeofenceCampaignType?.value || details.campaignType || "";
    details.monthlyAdSpend = ui.saleDigitalService?.value === "Geofencing"
      ? (ui.saleGeofenceMonthlySpend?.value || details.monthlyAdSpend || "")
      : (ui.saleDigitalMonthlySpend?.value || details.monthlyAdSpend || "");
    details.targetGeography = ui.saleGeofenceTargetAreas?.value.trim() || details.targetAreas || "";
    details.targetLocations = ui.saleGeofenceTargetLocations?.value.trim() || details.targetLocations || "";
    details.demographicAge = ui.saleGeofenceAge?.value.trim() || details.demographicAge || "";
    details.demographicSex = ui.saleGeofenceSex?.value.trim() || details.demographicSex || "";
    details.demographicIncome = ui.saleGeofenceIncome?.value.trim() || details.demographicIncome || "";
    details.campaignStartDate = ui.saleGeofenceStartDate?.value || details.startDate || "";
  }
  if (category === "Print") {
    details.printType = ui.salePrintType?.value || "";
    const printDescriptionValue = ui.salePrintDescription?.value.trim() || "";
    details.printProjectDescription = details.printType === "Custom Print Project" ? printDescriptionValue : "";
    details.otherPrintDescription = details.printType === "Other" ? printDescriptionValue : "";
    details.customDescription = printDescriptionValue;
    const selectedFinish = ui.salePrintFinish?.value || "";
    details.finish = selectedFinish === "Gloss High UV" ? "High Gloss UV" : selectedFinish;
    details.otherFinish = ui.salePrintOtherFinish?.value?.trim() || "";
    details.thickness = ui.salePrintThickness?.value || "";
    details.otherThickness = ui.salePrintOtherThickness?.value?.trim() || "";
    details.fold = ui.salePrintFold?.value?.trim() || "";
    details.quantity = ui.salePrintQuantity?.value || "";
    details.size = ui.salePrintSize?.value.trim() || "";
    // Only record mailing when the selected print type requires it
    const pt = (details.printType || "").trim();
    if (pt === "Custom Print Project" || pt === "Other") {
      details.needsMailing = ui.needsMailing?.value || "No";
    }
    // Capture project price and optional discount inputs (UI-only; calculations unchanged)
    details.projectPrice = Number(ui.salePrintProjectPrice?.value) || 0;
    details.designFee = Number(ui.salePrintDesignFee?.value) || 0;
    details.discountType = ui.salePrintDiscountType?.value || "None";
    details.discountValue = Number(ui.salePrintDiscountValue?.value) || 0;
    // compute discount amount and final total for Print
    let pDiscountAmount = 0;
    if (details.discountType === "Dollar Amount") {
      pDiscountAmount = Math.min(details.discountValue, details.projectPrice);
    } else if (details.discountType === "Percentage") {
      pDiscountAmount = Math.min(details.projectPrice * (details.discountValue / 100), details.projectPrice);
    }
    if (pDiscountAmount < 0) pDiscountAmount = 0;
    details.discountAmount = pDiscountAmount;
    details.totalInvestment = Math.max(details.projectPrice + details.designFee - pDiscountAmount, 0);
  }
  return details;
}

function setSaleFormFieldsFromSale(sale) {
  if (!sale) return;
  ui.saleCategory.value = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  updateSaleFormVisibility(ui.saleCategory.value, sale.productDetails);

  const notificationSettings = getSaleNotificationSettings(sale);
  if (ui.notifyManagement) ui.notifyManagement.checked = notificationSettings.notifyManagement;
  if (ui.notifyPrintTeam) ui.notifyPrintTeam.checked = notificationSettings.notifyPrintTeam;
  if (ui.notifyDesigners) ui.notifyDesigners.checked = notificationSettings.notifyDesigners;
  if (ui.notifyDigitalTeam) ui.notifyDigitalTeam.checked = notificationSettings.notifyDigitalTeam;
  if (ui.notifySocialMediaTeam) ui.notifySocialMediaTeam.checked = notificationSettings.notifySocialMediaTeam;
  if (ui.notifyGeofencing) ui.notifyGeofencing.checked = notificationSettings.notifyGeofencing;

  if (sale.saleCategory === "Mailer") {
    ui.saleMailerArea.value = sale.productDetails.mailerArea || "";
    ui.saleMailerMonth.value = sale.productDetails.month || "";
    ui.saleMailerRunTime.value = sale.productDetails.mailerRunTime || "";
    ui.saleMailerAdSize.value = sale.productDetails.adSize || "";
    ui.saleMailerDiscountType.value = sale.productDetails.discountType || "None";
    ui.saleMailerDiscountValue.value = sale.productDetails.discountValue || "";
    // Mailers do not display a separate Mailing Required field
    calculateMailerPricing();
  }
  if (sale.saleCategory === "Digital") {
    const legacyServicePrice = sale.productDetails.servicePrice || sale.digitalFinalTotal || sale.dollarAmount || 0;
    ui.saleDigitalService.value = sale.productDetails.service || "";
    if (ui.saleDigitalServicePrice) ui.saleDigitalServicePrice.value = sale.productDetails.servicePrice || sale.digitalFinalTotal || sale.dollarAmount || "";
    if (ui.saleDigitalDiscountType) ui.saleDigitalDiscountType.value = sale.productDetails.discountType || sale.digitalDiscountType || "None";
    if (ui.saleDigitalDiscountValue) ui.saleDigitalDiscountValue.value = sale.productDetails.discountValue || sale.digitalDiscountValue || "";
    if (ui.saleWebsiteOption) ui.saleWebsiteOption.value = sale.productDetails.websiteOption || "";
    const paidAdPlatforms = Array.isArray(sale.productDetails.paidAdPlatforms)
      ? sale.productDetails.paidAdPlatforms
      : sale.productDetails.paidAdsOption ? [sale.productDetails.paidAdsOption] : [];
    const customPaidAdValues = paidAdPlatforms.filter(platform => !PAID_AD_PLATFORM_OPTIONS.includes(platform));
    const paidAdCheckboxValues = paidAdPlatforms
      .filter(platform => PAID_AD_PLATFORM_OPTIONS.includes(platform))
      .concat(customPaidAdValues.length ? ["Other Paid Ads"] : []);
    setCheckboxGroupValues("salePaidAdsPlatform", Array.from(new Set(paidAdCheckboxValues)));
    if (ui.saleOtherPaidAdsPlatform) ui.saleOtherPaidAdsPlatform.value = customPaidAdValues.length ? customPaidAdValues[0] : "";
    if (ui.saleDigitalStaticIdeas) ui.saleDigitalStaticIdeas.value = sale.productDetails.staticImageCampaignIdeas || "";
    if (ui.saleDigitalVideoCampaign) ui.saleDigitalVideoCampaign.value = sale.productDetails.videoCampaign || "";
    if (ui.saleDigitalClientVideo) ui.saleDigitalClientVideo.value = sale.productDetails.clientProvidingVideo || "";
    if (ui.saleDigitalTargetAreas) ui.saleDigitalTargetAreas.value = sale.productDetails.targetAreas || "";
    if (ui.saleDigitalTargetLocations) ui.saleDigitalTargetLocations.value = sale.productDetails.targetLocations || "";
    if (ui.saleDigitalAge) ui.saleDigitalAge.value = sale.productDetails.demographicAge || "";
    if (ui.saleDigitalSex) ui.saleDigitalSex.value = sale.productDetails.demographicSex || "";
    if (ui.saleDigitalIncome) ui.saleDigitalIncome.value = sale.productDetails.demographicIncome || "";
    if (ui.saleDigitalMonthlySpend) ui.saleDigitalMonthlySpend.value = sale.productDetails.service === "Geofencing" ? "" : (sale.productDetails.monthlyAdSpend || "");
    if (ui.saleDigitalStartDate) ui.saleDigitalStartDate.value = sale.productDetails.startDate || "";
    if (ui.saleGeofenceCampaignType) ui.saleGeofenceCampaignType.value = sale.productDetails.campaignType || "";
    if (ui.saleGeofenceMonthlySpend) ui.saleGeofenceMonthlySpend.value = sale.productDetails.service === "Geofencing" ? (sale.productDetails.monthlyAdSpend || "") : "";
    if (ui.saleGeofenceAge) ui.saleGeofenceAge.value = sale.productDetails.demographicAge || "";
    if (ui.saleGeofenceSex) ui.saleGeofenceSex.value = sale.productDetails.demographicSex || "";
    if (ui.saleGeofenceIncome) ui.saleGeofenceIncome.value = sale.productDetails.demographicIncome || "";
    // New fields
    setCheckboxGroupValues("saleSocialPlatform", sale.productDetails.socialPlatforms || (sale.productDetails.socialPlatform ? [sale.productDetails.socialPlatform] : []));
    if (ui.saleSocialUsername) ui.saleSocialUsername.value = sale.productDetails.socialUsername || "";
    // render chips and per-platform username fields
    try { renderChipsForGroup('saleSocialPlatform', 'saleSocialChips'); } catch (e) {}
    try { renderSocialUsernames(); } catch (e) {}
    // populate username values if available
    const savedUsernames = sale.productDetails.socialUsernames || {};
    Object.keys(savedUsernames).forEach(platform => {
      const el = document.getElementById(`socialUser_${idSafe(platform)}`);
      if (el) el.value = savedUsernames[platform] || '';
    });
    if (ui.saleSocialStartDate) ui.saleSocialStartDate.value = sale.productDetails.socialStartDate || sale.productDetails.startDate || "";
    if (ui.saleWebsiteUrl) ui.saleWebsiteUrl.value = sale.productDetails.websiteUrl || "";
    if (ui.saleWebsitePrimaryGoal) ui.saleWebsitePrimaryGoal.value = sale.productDetails.websitePrimaryGoal || "";
    if (ui.saleDigitalCampaignGoal) ui.saleDigitalCampaignGoal.value = sale.productDetails.campaignGoal || "";
    if (ui.saleDigitalWebsiteUrl) ui.saleDigitalWebsiteUrl.value = sale.productDetails.websiteUrl || "";
    if (ui.saleDigitalLandingPageUrl) ui.saleDigitalLandingPageUrl.value = sale.productDetails.landingPageUrl || "";
    if (ui.saleDigitalCampaignNotes) ui.saleDigitalCampaignNotes.value = sale.productDetails.campaignNotes || sale.productDetails.staticImageCampaignIdeas || "";
    updatePaidAdsOtherVisibility();
    if (ui.saleGeofenceTargetAreas) ui.saleGeofenceTargetAreas.value = sale.productDetails.targetGeography || sale.productDetails.targetAreas || "";
    if (ui.saleGeofenceTargetLocations) ui.saleGeofenceTargetLocations.value = sale.productDetails.targetLocations || "";
    if (ui.saleGeofenceStartDate) ui.saleGeofenceStartDate.value = sale.productDetails.campaignStartDate || sale.productDetails.startDate || "";
    if (ui.saleDigitalTotalInvestment) ui.saleDigitalTotalInvestment.value = formatCurrency(sale.digitalFinalTotal || sale.productDetails.totalInvestment || legacyServicePrice || 0);
    calculateDigitalPricing();
  }
  if (sale.saleCategory === "Print") {
    ui.salePrintType.value = sale.productDetails.printType || "";
    updatePrintDescriptionLabel(ui.salePrintType?.value || "");
    const descriptionValue = sale.productDetails.printType === "Other"
      ? sale.productDetails.otherPrintDescription || sale.productDetails.customDescription || ""
      : sale.productDetails.printProjectDescription || sale.productDetails.customDescription || "";
    ui.salePrintDescription.value = descriptionValue;
    // New print specification fields
    if (ui.salePrintFinish) {
      const finishValue = sale.productDetails.finish || "";
      ui.salePrintFinish.value = finishValue === "High Gloss UV" ? "Gloss High UV" : finishValue;
    }
    if (ui.salePrintOtherFinish) ui.salePrintOtherFinish.value = sale.productDetails.otherFinish || "";
    if (ui.salePrintThickness) ui.salePrintThickness.value = sale.productDetails.thickness || "";
    if (ui.salePrintOtherThickness) ui.salePrintOtherThickness.value = sale.productDetails.otherThickness || "";
    if (ui.salePrintFold) ui.salePrintFold.value = sale.productDetails.fold || "";
    try { updateOtherFinishVisibility(); } catch (e) {}
    try { updateOtherThicknessVisibility(); } catch (e) {}
    ui.salePrintQuantity.value = sale.productDetails.quantity || "";
    ui.salePrintSize.value = sale.productDetails.size || "";
    // Only populate mailing control when the print type supports it
    const pt = (sale.productDetails.printType || "").trim();
    if (pt === "Custom Print Project" || pt === "Other") {
      if (ui.needsMailing) ui.needsMailing.value = sale.productDetails.needsMailing || sale.needsMailing || "No";
    } else {
      if (ui.needsMailing) ui.needsMailing.value = "No";
    }
    // populate project price and discounts if present
    if (ui.salePrintProjectPrice) ui.salePrintProjectPrice.value = sale.productDetails.projectPrice != null ? sale.productDetails.projectPrice : "";
    if (ui.salePrintDesignFee) ui.salePrintDesignFee.value = sale.productDetails.designFee != null ? sale.productDetails.designFee : "";
    if (ui.salePrintDiscountType) ui.salePrintDiscountType.value = sale.productDetails.discountType || "None";
    if (ui.salePrintDiscountValue) ui.salePrintDiscountValue.value = sale.productDetails.discountValue != null ? sale.productDetails.discountValue : "";
    if (ui.salePrintTotalInvestment) ui.salePrintTotalInvestment.value = formatCurrency(sale.productDetails.totalInvestment || sale.dollarAmount || 0);
    calculatePrintPricing();
  }
  
  if (ui.salePaymentMethod) ui.salePaymentMethod.value = sale.paymentMethod || "";
  if (ui.saleOtherPaymentMethod) ui.saleOtherPaymentMethod.value = sale.otherPaymentMethod || "";
  updatePaymentMethodVisibility(ui.salePaymentMethod?.value || "");
}

function getPrimaryCategoryCountKey(sale) {
  if (!sale) return sale.saleType || "Unknown";
  return sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
}

function createId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function getTodayISO() { return new Date().toISOString().slice(0, 10); }
function getNextDate(daysFromToday) { const date = new Date(); date.setDate(date.getDate() + daysFromToday); return date.toISOString().slice(0, 10); }

function persistState() {
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(state.customers));
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(state.sales));
  localStorage.setItem(STORAGE_KEYS.reminders, JSON.stringify(state.reminders));
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(state.notifications));
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(state.activities));
  localStorage.setItem(STORAGE_KEYS.notificationHistory, JSON.stringify(state.notificationHistory));
  localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({
    currentRole: state.currentRole,
    filters: state.filters,
    calendarMonth: state.calendarMonth.toISOString(),
    selectedCalendarDate: state.selectedCalendarDate,
    activeView: state.activeView,
    currentCustomerId: state.currentCustomerId,
    notificationFilterType: state.notificationFilterType,
    notificationSortType: state.notificationSortType,
    reportsDateRange: state.reportsDateRange
  }));
}

function recordActivity({ type, title, details, relatedId, timestamp = new Date().toISOString() }) {
  state.activities.unshift({ id: createId("act"), type, title, details, relatedId, timestamp });
  if (state.activities.length > 120) state.activities.length = 120;
  persistState();
}

// Command Focus persistence (editable command center)
function persistCommandFocus() {
  try {
    const items = Array.from(document.querySelectorAll('.priority-item')).map(el => {
      const id = el.dataset.id || null;
      const container = el.querySelector('div');
      const title = container?.querySelector('strong')?.textContent?.trim() || '';
      const note = container?.querySelector('p')?.textContent?.trim() || '';
      return { id, title, note };
    });
    localStorage.setItem('avidSphere.commandFocus', JSON.stringify(items));
  } catch (e) { console.error(e); }
}

function loadCommandFocus() {
  const saved = safeParseStorage('avidSphere.commandFocus', null);
  if (!saved) return;
  saved.forEach(item => {
    if (!item || !item.id) return;
    const el = document.querySelector(`.priority-item[data-id="${item.id}"]`);
    if (!el) return;
    const container = el.querySelector('div');
    if (!container) return;
    const strong = container.querySelector('strong');
    const p = container.querySelector('p');
    if (strong) strong.textContent = item.title || strong.textContent;
    if (p) p.textContent = item.note || p.textContent;
  });
}

function makePriorityEditable() {
  document.querySelectorAll('.priority-item').forEach(item => {
    const container = item.querySelector('div');
    if (!container) return;
    container.addEventListener('dblclick', (e) => {
      container.contentEditable = 'true';
      container.focus();
    });
    container.addEventListener('blur', () => {
      container.contentEditable = 'false';
      // parse first line as title, rest as note
      const lines = container.innerText.split('\n').map(s => s.trim()).filter(Boolean);
      const title = lines.shift() || '';
      const note = lines.join(' ')
      const strong = container.querySelector('strong');
      const p = container.querySelector('p');
      if (strong) strong.textContent = title || strong.textContent;
      if (p) p.textContent = note || p.textContent;
      persistCommandFocus();
    });
  });
}

function normalizeCustomer(customer) {
  if (!customer) return null;
  customer.noteEntries = Array.isArray(customer.noteEntries) ? customer.noteEntries : [];
  if (customer.notes && !customer.noteEntries.length) {
    customer.noteEntries.push({ id: createId("note"), text: customer.notes, author: "Legacy import", timestamp: customer.dateCreated || new Date().toISOString() });
  }
  customer.communicationHistory = Array.isArray(customer.communicationHistory) ? customer.communicationHistory : [];
  customer.socialAccounts = customer.socialAccounts || { ...DEFAULT_SOCIAL_ACCOUNTS };
  return customer;
}

function normalizeStateData() {
  state.customers = (safeParseStorage(STORAGE_KEYS.customers, []) || []).map(normalizeCustomer).filter(Boolean);
  state.sales = (safeParseStorage(STORAGE_KEYS.sales, []) || []).map(normalizeSale).filter(Boolean);
  state.reminders = safeParseStorage(STORAGE_KEYS.reminders, []) || [];
  state.notifications = (safeParseStorage(STORAGE_KEYS.notifications, []) || []).filter(notification => !notification.archived).map(notification => ({
    ...notification,
    id: notification.id || (crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}`),
    createdAt: notification.createdAt || new Date().toISOString(),
    read: typeof notification.read === "boolean" ? notification.read : false,
    type: notification.type || (notification.source === "reminder" ? "Reminder Notification" : notification.source === "management" ? "Management Alert" : "Sale Notification")
  }));
  state.notificationHistory = safeParseStorage(STORAGE_KEYS.notificationHistory, {}) || {};
  state.activities = safeParseStorage(STORAGE_KEYS.activities, []) || [];
  const prefs = safeParseStorage(STORAGE_KEYS.preferences, {});
  if (prefs.currentRole) state.currentRole = prefs.currentRole;
  if (prefs.filters) state.filters = { ...state.filters, ...prefs.filters };
  if (prefs.calendarMonth) state.calendarMonth = new Date(prefs.calendarMonth);
  state.selectedCalendarDate = prefs.selectedCalendarDate || null;
  state.activeView = prefs.activeView || "dashboard";
  state.currentCustomerId = prefs.currentCustomerId || null;
  state.notificationFilterType = prefs.notificationFilterType || state.notificationFilterType;
  state.notificationSortType = prefs.notificationSortType || state.notificationSortType;
  state.reportsDateRange = prefs.reportsDateRange || state.reportsDateRange;
  if (!state.customers.length && !state.sales.length && !state.reminders.length) {
    seedDemoData();
  }
  state.customers = state.customers.map(normalizeCustomer).filter(Boolean);
}

function refreshAllData() {
  normalizeStateData();
  renderAll();
}

function clearDemoStorage() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

function seedDemoData() {
  state.customers = [
    {
      id: "cust-1",
      businessName: "Northstar Media Group",
      businessAddress: "120 Market Street, Chicago, IL",
      contactPerson: "Julia Chen",
      emailAddress: "julia@northstarmedia.com",
      phoneNumber: "312-555-0198",
      notes: "Active client with integrated digital and print campaigns.",
      dateCreated: "2026-01-10",
      lastContactDate: "2026-06-01",
      assignedSalesRepresentative: "Jordan Lee",
      customerStatus: "Active",
      noteEntries: [
        { id: createId("note"), text: "Active client with integrated digital and print campaigns.", author: "System", timestamp: "2026-01-10" }
      ],
      communicationHistory: [],
      socialAccounts: {
        ...DEFAULT_SOCIAL_ACCOUNTS,
        website: "https://northstarmedia.com",
        linkedin: "https://linkedin.com/company/northstarmedia",
        facebook: "https://facebook.com/northstarmedia"
      }
    },
    {
      id: "cust-2",
      businessName: "Cedar & Co. Events",
      businessAddress: "88 Pine Ave, Austin, TX",
      contactPerson: "Maya Ortiz",
      emailAddress: "maya@cedarcoevents.com",
      phoneNumber: "512-555-0122",
      notes: "Prospecting event brand for direct mail and social media packages.",
      dateCreated: "2026-03-02",
      lastContactDate: "2026-06-03",
      assignedSalesRepresentative: "Amina Patel",
      customerStatus: "Prospect",
      noteEntries: [
        { id: createId("note"), text: "Prospecting event brand for direct mail and social media packages.", author: "System", timestamp: "2026-03-02" }
      ],
      communicationHistory: [],
      socialAccounts: {
        ...DEFAULT_SOCIAL_ACCOUNTS,
        website: "https://cedarcoevents.com",
        instagram: "https://instagram.com/cedarcoevents"
      }
    },
    {
      id: "cust-3",
      businessName: "Evergreen Print House",
      businessAddress: "45 River Road, Denver, CO",
      contactPerson: "Nolan Brooks",
      emailAddress: "nolan@evergreenprint.com",
      phoneNumber: "720-555-0134",
      notes: "High-volume print partner with regular brochure and mailer needs.",
      dateCreated: "2025-12-20",
      lastContactDate: "2026-05-29",
      assignedSalesRepresentative: "Jordan Lee",
      customerStatus: "Active",
      noteEntries: [
        { id: createId("note"), text: "High-volume print partner with regular brochure and mailer needs.", author: "System", timestamp: "2025-12-20" }
      ],
      communicationHistory: [],
      socialAccounts: {
        ...DEFAULT_SOCIAL_ACCOUNTS,
        website: "https://evergreenprint.com",
        facebook: "https://facebook.com/evergreenprint"
      }
    },
    {
      id: "cust-4",
      businessName: "Harbor Health Clinic",
      businessAddress: "210 Bayview Drive, San Diego, CA",
      contactPerson: "Tanya Brooks",
      emailAddress: "tanya@harborhealthclinic.com",
      phoneNumber: "619-555-0175",
      notes: "Closed account with a completed website and paid ads launch.",
      dateCreated: "2024-11-15",
      lastContactDate: "2026-05-14",
      assignedSalesRepresentative: "Tanya Brooks",
      customerStatus: "Closed",
      noteEntries: [
        { id: createId("note"), text: "Closed account with a completed website and paid ads launch.", author: "System", timestamp: "2024-11-15" }
      ],
      communicationHistory: [],
      socialAccounts: {
        ...DEFAULT_SOCIAL_ACCOUNTS,
        website: "https://harborhealthclinic.com",
        linkedin: "https://linkedin.com/company/harborhealthclinic"
      }
    },
    {
      id: "cust-5",
      businessName: "Brightline Boutique",
      businessAddress: "320 Seaside Blvd, Miami, FL",
      contactPerson: "Elena Ruiz",
      emailAddress: "elena@brightlineboutique.com",
      phoneNumber: "305-555-0190",
      notes: "Retail brand launching a geofencing and seasonal mailer program.",
      dateCreated: "2026-02-12",
      lastContactDate: "2026-06-05",
      assignedSalesRepresentative: "Amina Patel",
      customerStatus: "Active",
      noteEntries: [
        { id: createId("note"), text: "Retail brand launching a geofencing and seasonal mailer program.", author: "System", timestamp: "2026-02-12" }
      ],
      communicationHistory: [],
      socialAccounts: {
        ...DEFAULT_SOCIAL_ACCOUNTS,
        website: "https://brightlineboutique.com",
        instagram: "https://instagram.com/brightlineboutique"
      }
    },
    {
      id: "cust-6",
      businessName: "Riverfront Realty",
      businessAddress: "15 Commerce Court, Seattle, WA",
      contactPerson: "Connor James",
      emailAddress: "connor@riverfrontrealty.com",
      phoneNumber: "206-555-0114",
      notes: "Prospect for website refresh, paid ads, and social lead generation.",
      dateCreated: "2026-04-08",
      lastContactDate: "2026-06-02",
      assignedSalesRepresentative: "Jordan Lee",
      customerStatus: "Prospect",
      noteEntries: [
        { id: createId("note"), text: "Prospect for website refresh, paid ads, and social lead generation.", author: "System", timestamp: "2026-04-08" }
      ],
      communicationHistory: [],
      socialAccounts: {
        ...DEFAULT_SOCIAL_ACCOUNTS,
        website: "https://riverfrontrealty.com",
        facebook: "https://facebook.com/riverfrontrealty"
      }
    }
  ];

  state.sales = [
    {
      id: "sale-1",
      customerId: "cust-1",
      businessName: "Northstar Media Group",
      saleCategory: "Digital",
      saleType: "Paid Ads",
      saleDate: "2026-06-01",
      salesRepresentative: "Jordan Lee",
      dollarAmount: 7200,
      notes: "Summer paid search launch with retargeting and lead-gen landing pages.",
      status: "Completed",
      designRequired: "No",
      designChangeRequired: "No",
      productDetails: {
        service: "Paid Ads",
        servicePrice: 6500,
        discountType: "Percentage",
        discountValue: 10,
        monthlyAdSpend: "$6,500",
        paidAdPlatforms: ["Google Ads", "Meta Ads"],
        campaignGoal: "Increase lead volume for Q3 promotions",
        targetAreas: "Chicago metro",
        targetLocations: "Loop, South Loop, West Loop",
        demographicAge: "25-54",
        demographicSex: "All",
        demographicIncome: "$50k+",
        startDate: "2026-06-01",
        campaignNotes: "Focused on appointment bookings and a dedicated landing page.",
        otherPaidAdsPlatform: ""
      }
    },
    {
      id: "sale-2",
      customerId: "cust-1",
      businessName: "Northstar Media Group",
      saleCategory: "Print",
      saleType: "Brochure Refresh",
      saleDate: "2026-05-25",
      salesRepresentative: "Jordan Lee",
      dollarAmount: 2200,
      notes: "High-gloss brochure refresh for sales kits with spot UV finish.",
      status: "Approval Pending",
      designRequired: "Yes",
      designChangeRequired: "Yes",
      productDetails: {
        printType: "Custom Print Project",
        printProjectDescription: "12-page high-gloss brochure with spot UV and custom inserts.",
        finish: "Gloss High UV",
        thickness: "14 pt",
        fold: "Tri-fold",
        quantity: "750",
        size: "8.5 x 11",
        needsMailing: "Yes",
        projectPrice: 1850,
        designFee: 350,
        discountType: "Dollar Amount",
        discountValue: 0,
        totalInvestment: 2200
      }
    },
    {
      id: "sale-3",
      customerId: "cust-2",
      businessName: "Cedar & Co. Events",
      saleCategory: "Mailer",
      saleType: "Mailer",
      saleDate: "2026-05-27",
      salesRepresentative: "Amina Patel",
      dollarAmount: 1600,
      notes: "Invitation postcard campaign with mailing service and campaign reporting.",
      status: "Proposal",
      designRequired: "Yes",
      designChangeRequired: "No",
      productDetails: {
        mailerArea: "Austin Metro",
        month: "June",
        mailerRunTime: 4,
        adSize: "6 x 11 Postcard",
        monthlyRate: 380,
        subtotal: 1520,
        discountType: "Percentage",
        discountValue: 12,
        designRequiredFee: 80,
        designChangeFee: 0,
        totalInvestment: 1600
      }
    },
    {
      id: "sale-4",
      customerId: "cust-3",
      businessName: "Evergreen Print House",
      saleCategory: "Print",
      saleType: "Brochure + Flyer Package",
      saleDate: "2026-05-22",
      salesRepresentative: "Jordan Lee",
      dollarAmount: 2800,
      notes: "Full launch bundle with brochures, flyers, mailing, and variable data.",
      status: "In Production",
      designRequired: "Yes",
      designChangeRequired: "Yes",
      productDetails: {
        printType: "Custom Print Project",
        printProjectDescription: "Brochure and flyer kit with multi-stock printing and mailing coordination.",
        finish: "Matte",
        thickness: "12 pt",
        fold: "Bi-fold",
        quantity: "1000",
        size: "8.5 x 11 / 5.5 x 8.5",
        needsMailing: "Yes",
        projectPrice: 2400,
        designFee: 400,
        discountType: "None",
        discountValue: 0,
        totalInvestment: 2800
      }
    },
    {
      id: "sale-5",
      customerId: "cust-4",
      businessName: "Harbor Health Clinic",
      saleCategory: "Digital",
      saleType: "Website Services",
      saleDate: "2026-05-14",
      salesRepresentative: "Tanya Brooks",
      dollarAmount: 5200,
      notes: "New website launch with appointment booking and local SEO.",
      status: "Closed",
      designRequired: "Yes",
      designChangeRequired: "No",
      productDetails: {
        service: "Website Services",
        websiteOption: "New Website Build",
        websiteUrl: "https://harborhealthclinic.com",
        websitePrimaryGoal: "Launch new patient intake portal",
        landingPageUrl: "https://harborhealthclinic.com/book",
        campaignGoal: "Build trust and increase bookings",
        campaignNotes: "Include HIPAA-friendly forms with online scheduling integration.",
        monthlyAdSpend: "",
        targetAreas: "Greater San Diego area"
      }
    },
    {
      id: "sale-6",
      customerId: "cust-5",
      businessName: "Brightline Boutique",
      saleCategory: "Digital",
      saleType: "Geofencing",
      saleDate: "2026-06-03",
      salesRepresentative: "Amina Patel",
      dollarAmount: 3400,
      notes: "Geofencing campaign for new flagship store opening.",
      status: "Scheduled",
      designRequired: "No",
      designChangeRequired: "No",
      productDetails: {
        service: "Geofencing",
        campaignType: "Retail Launch",
        monthlyAdSpend: "$3,200",
        targetAreas: "Downtown district",
        targetLocations: "Riverview Plaza, Midtown Mall, 15th Street Mall",
        demographicAge: "18-45",
        demographicSex: "All",
        demographicIncome: "$40k+",
        campaignStartDate: "2026-06-10",
        campaignNotes: "Drive weekend store visits and VIP sign-ups."
      }
    },
    {
      id: "sale-7",
      customerId: "cust-6",
      businessName: "Riverfront Realty",
      saleCategory: "Digital",
      saleType: "Social Media Management",
      saleDate: "2026-06-05",
      salesRepresentative: "Jordan Lee",
      dollarAmount: 1950,
      notes: "Organic social launch across Instagram and Facebook for property tours.",
      status: "Proposal",
      designRequired: "No",
      designChangeRequired: "No",
      productDetails: {
        service: "Social Media Management",
        socialPlatforms: ["Instagram", "Facebook"],
        socialUsernames: { Instagram: "@riverfrontrealty", Facebook: "/riverfrontrealty" },
        socialUsername: "@riverfrontrealty",
        socialStartDate: "2026-06-08",
        campaignGoal: "Generate property tour leads",
        staticImageCampaignIdeas: "Feature listed homes, neighborhood highlights, and local amenities.",
        videoCampaign: "Two property walkthrough videos and a neighborhood highlights reel.",
        clientProvidingVideo: "Yes",
        targetAreas: "Riverfront district",
        targetLocations: "Downtown condos and waterfront listings",
        demographicAge: "28-60",
        demographicSex: "All",
        demographicIncome: "$80k+",
        campaignNotes: "Focus on high-value listings and referral-driven engagement."
      }
    },
    {
      id: "sale-8",
      customerId: "cust-5",
      businessName: "Brightline Boutique",
      saleCategory: "Mailer",
      saleType: "Mailer",
      saleDate: "2026-05-30",
      salesRepresentative: "Amina Patel",
      dollarAmount: 1300,
      notes: "VIP coupon mailer to promote the summer collection.",
      status: "In Production",
      designRequired: "No",
      designChangeRequired: "No",
      productDetails: {
        mailerArea: "Downtown",
        month: "May",
        mailerRunTime: 3,
        adSize: "4 x 9 Postcard",
        monthlyRate: 450,
        subtotal: 1350,
        discountType: "Dollar Amount",
        discountValue: 100,
        designRequiredFee: 0,
        designChangeFee: 0,
        totalInvestment: 1250
      }
    }
  ];

  state.reminders = [
    { id: "rem-1", customerId: "cust-1", title: "Follow-up on digital proposal", dueDate: getNextDate(2), assignedTo: "Jordan Lee", notes: "Confirm landing page approvals and budget allocation.", completed: false },
    { id: "rem-2", customerId: "cust-2", title: "Review social campaign scope", dueDate: getNextDate(5), assignedTo: "Amina Patel", notes: "Validate influencer list and mailing audience.", completed: false },
    { id: "rem-3", customerId: "cust-3", title: "Approve print proof package", dueDate: getNextDate(7), assignedTo: "Jordan Lee", notes: "Get sign-off on brochure cover, interior spreads, and mailing list.", completed: false },
    { id: "rem-4", customerId: "cust-4", title: "Deliver website analytics recap", dueDate: getNextDate(-6), assignedTo: "Tanya Brooks", notes: "Share launch performance and paid search ROI report.", completed: true },
    { id: "rem-5", customerId: "cust-5", title: "Confirm geofencing zones", dueDate: getNextDate(3), assignedTo: "Amina Patel", notes: "Review store perimeter targets and event schedule.", completed: false },
    { id: "rem-6", customerId: "cust-6", title: "Send proposal for website and ads", dueDate: getNextDate(1), assignedTo: "Jordan Lee", notes: "Include pricing for new website, social, and paid ads bundles.", completed: false }
  ];

  state.notifications = [];
  state.notificationHistory = {};
  state.activities = [
    {
      id: createId("act"),
      type: "Sale",
      title: "Paid Ads campaign launched",
      details: "Northstar Media Group started a Summer Paid Ads campaign.",
      relatedId: "sale-1",
      timestamp: "2026-06-01T09:15:00.000Z"
    },
    {
      id: createId("act"),
      type: "Reminder",
      title: "Proof review requested",
      details: "Evergreen Print House requested print proof review for brochure package.",
      relatedId: "rem-3",
      timestamp: "2026-05-29T14:10:00.000Z"
    },
    {
      id: createId("act"),
      type: "Customer",
      title: "New prospect engaged",
      details: "Riverfront Realty started a website and lead generation discovery process.",
      relatedId: "cust-6",
      timestamp: "2026-06-02T11:30:00.000Z"
    },
    {
      id: createId("act"),
      type: "Notification",
      title: "Social media task queued",
      details: "Riverfront Realty social media campaign is ready for the Social Media Team.",
      relatedId: "sale-7",
      timestamp: "2026-06-05T08:25:00.000Z"
    },
    {
      id: createId("act"),
      type: "Reminder",
      title: "Follow-up scheduled",
      details: "A follow-up reminder was added for Cedar & Co. Events.",
      relatedId: "rem-2",
      timestamp: "2026-06-03T10:05:00.000Z"
    }
  ];

  state.sales.forEach(createSaleNotificationsForSale);
}

function createSaleNotificationsForSale(sale) {
  if (!sale || state.notificationHistory[sale.id]) return;
  const customer = getCustomerById(sale.customerId);
  const existingSaleNotifications = state.notifications.some(notification => notification.source === "sale" && notification.relatedId === sale.id);
  if (existingSaleNotifications) {
    state.notificationHistory[sale.id] = true;
    return;
  }

  const notificationSettings = getSaleNotificationSettings(sale);
  const saleMeta = {
    businessName: sale.businessName,
    contactPerson: customer?.contactPerson || "",
    emailAddress: customer?.emailAddress || "",
    phoneNumber: customer?.phoneNumber || "",
    salesRepresentative: sale.salesRepresentative,
    saleDate: sale.saleDate,
    website: customer?.socialAccounts?.website || "",
    socialLinks: { ...customer?.socialAccounts }
  };

  const saleSubject = getSaleDisplayLabel(sale);
  if (notificationSettings.notifyManagement) {
    sendManagementNotification({
      title: "New sale recorded",
      message: `${sale.businessName} logged a ${saleSubject} sale for ${formatCurrency(sale.dollarAmount)}.`,
      relatedId: sale.id,
      relatedCustomerId: sale.customerId,
      priority: "High"
    });
  }

  if (notificationSettings.notifyPrintTeam) {
    sendPrintNotification({
      businessName: sale.businessName,
      saleType: getSaleDisplayLabel(sale),
      relatedId: sale.id,
      relatedCustomerId: sale.customerId
    });
  }

  if (notificationSettings.notifyDesigners) {
    sendDesignerNotification({
      businessName: sale.businessName,
      saleType: getSaleDisplayLabel(sale),
      designRequired: sale.designRequired,
      designChangeRequired: sale.designChangeRequired,
      notes: sale.notes,
      relatedId: sale.id,
      relatedCustomerId: sale.customerId
    });
  }

  if (notificationSettings.notifyDigitalTeam) {
    sendDigitalNotification({
      businessName: sale.businessName,
      contactPerson: saleMeta.contactPerson,
      emailAddress: saleMeta.emailAddress,
      phoneNumber: saleMeta.phoneNumber,
      salesRepresentative: saleMeta.salesRepresentative,
      saleDate: sale.saleDate,
      relatedId: sale.id,
      relatedCustomerId: sale.customerId
    });
  }

  if (notificationSettings.notifySocialMediaTeam) {
    sendSocialNotification({
      businessName: sale.businessName,
      contactPerson: saleMeta.contactPerson,
      website: saleMeta.website,
      socialLinks: saleMeta.socialLinks,
      salesRepresentative: saleMeta.salesRepresentative,
      relatedId: sale.id,
      relatedCustomerId: sale.customerId
    });
  }

  if (notificationSettings.notifyGeofencing) {
    sendGeofencingNotification({
      businessName: sale.businessName,
      saleType: getSaleDisplayLabel(sale),
      relatedId: sale.id,
      relatedCustomerId: sale.customerId
    });
  }

  state.notificationHistory[sale.id] = true;
}

function addNotification(notification) {
  state.notifications.push(notification);
  notificationService.send(notification);
  persistState();
}

function validateCustomerForm() {
  const fields = [
    ["businessName", "Business Name is required"],
    ["businessAddress", "Business Address is required"],
    ["contactPerson", "Contact Person is required"],
    ["emailAddress", "Email Address is required"],
    ["phoneNumber", "Phone Number is required"]
  ];

  for (const [id, message] of fields) {
    if (!document.getElementById(id).value.trim()) {
      showError(message);
      return false;
    }
  }

  const email = ui.emailAddress.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("Please enter a valid email address.");
    return false;
  }

  return true;
}

function getCurrentUserName() {
  // This field is intended to be populated by future authenticated user accounts.
  return state.currentUserName || "Sunny";
}

function validateSaleForm() {
  if (!ui.saleCustomer.value) { console.warn("[Validate] Sale validation failed: customer missing"); showError("Select a customer before logging a sale."); return false; }
  if (!ui.saleCategory.value) { console.warn("[Validate] Sale validation failed: category missing"); showError("Select a product category."); return false; }
  if (ui.saleCategory.value === "Mailer") {
    if (!ui.saleMailerArea.value) { console.warn("[Validate] Mailer validation failed: area missing"); showError("Select a mailer area."); return false; }
    if (!ui.saleMailerMonth.value) { console.warn("[Validate] Mailer validation failed: month missing"); showError("Select a month for the mailer."); return false; }
    if (!ui.saleMailerRunTime.value) { console.warn("[Validate] Mailer validation failed: runtime missing"); showError("Select a run time for the mailer."); return false; }
    if (!ui.saleMailerAdSize.value) { console.warn("[Validate] Mailer validation failed: ad size missing"); showError("Select an ad size for the mailer."); return false; }
    if (ui.saleMailerDiscountType.value !== "None") {
      const discountValue = Number(ui.saleMailerDiscountValue.value);
      if (Number.isNaN(discountValue) || discountValue < 0) {
        console.warn("[Validate] Mailer validation failed: discount invalid", { value: ui.saleMailerDiscountValue.value });
        showError("Enter a valid discount value.");
        return false;
      }
      if (ui.saleMailerDiscountType.value === "Percentage" && discountValue > 100) {
        console.warn("[Validate] Mailer validation failed: percentage discount out of range", { value: discountValue });
        showError("Enter a percentage discount between 0 and 100."); return false;
      }
    }
  }
  if (ui.saleCategory.value === "Digital") {
    if (!ui.saleDigitalService.value) { console.warn("[Validate] Digital validation failed: service missing"); showError("Select a digital service."); return false; }
    if (!ui.saleDigitalServicePrice.value || Number(ui.saleDigitalServicePrice.value) <= 0) { console.warn("[Validate] Digital validation failed: service price invalid", { value: ui.saleDigitalServicePrice.value }); showError("Enter a valid service price for digital services."); return false; }
    if (ui.saleDigitalDiscountType.value !== "None") {
      const discountValue = Number(ui.saleDigitalDiscountValue.value);
      if (Number.isNaN(discountValue) || discountValue < 0) {
        console.warn("[Validate] Digital validation failed: discount invalid", { value: ui.saleDigitalDiscountValue.value });
        showError("Enter a valid discount value."); return false;
      }
      if (ui.saleDigitalDiscountType.value === "Dollar Amount" && discountValue > Number(ui.saleDigitalServicePrice.value)) {
        console.warn("[Validate] Digital validation failed: discount exceeds service price", { discountValue, price: ui.saleDigitalServicePrice.value });
        showError("Discount cannot exceed the service price."); return false;
      }
      if (ui.saleDigitalDiscountType.value === "Percentage" && discountValue > 100) {
        console.warn("[Validate] Digital validation failed: percentage discount out of range", { value: discountValue });
        showError("Enter a percentage discount between 0 and 100."); return false;
      }
    }
    if (ui.saleDigitalService.value === "Website" && !ui.saleWebsiteOption.value) { console.warn("[Validate] Digital validation failed: website option missing"); showError("Select the website option."); return false; }
    if (ui.saleDigitalService.value === "Social Media Management" && !getCheckedValuesByName("saleSocialPlatform").length) { console.warn("[Validate] Digital validation failed: social platform missing"); showError("Select at least one social media platform."); return false; }
    if (ui.saleDigitalService.value === "Paid Ads" && !getCheckedValuesByName("salePaidAdsPlatform").length) { console.warn("[Validate] Digital validation failed: paid ads channel missing"); showError("Select at least one paid advertising channel."); return false; }
    if (ui.saleDigitalService.value === "Geofencing") {
      if (!ui.saleGeofenceCampaignType.value) { console.warn("[Validate] Digital validation failed: geofencing campaign type missing"); showError("Select the geofencing campaign type."); return false; }
      if (ui.saleGeofenceMonthlySpend.value) {
        const spendValue = Number(ui.saleGeofenceMonthlySpend.value);
        if (Number.isNaN(spendValue) || spendValue < 0) { console.warn("[Validate] Digital validation failed: monthly spend invalid", { value: ui.saleGeofenceMonthlySpend.value }); showError("Enter a valid monthly ad spend."); return false; }
      }
    }
  }
  if (ui.saleCategory.value === "Print") {
    if (!ui.salePrintType.value) { console.warn("[Validate] Print validation failed: print service missing", { category: ui.saleCategory.value }); showError("Select a print service type."); return false; }
    if (!ui.salePrintQuantity.value || Number(ui.salePrintQuantity.value) <= 0) { console.warn("[Validate] Print validation failed: quantity missing or invalid", { value: ui.salePrintQuantity.value }); showError("Enter a valid print quantity."); return false; }
    if (!ui.salePrintSize.value.trim()) { console.warn("[Validate] Print validation failed: size missing", { value: ui.salePrintSize.value }); showError("Enter the print size."); return false; }
    if (!ui.salePrintFinish.value) { console.warn("[Validate] Print validation failed: finish missing", { value: ui.salePrintFinish.value }); showError("Select a print finish."); return false; }
    if (!ui.salePrintThickness.value) { console.warn("[Validate] Print validation failed: thickness missing", { value: ui.salePrintThickness.value }); showError("Select a print thickness."); return false; }
    if (ui.salePrintType.value === "Other" && !ui.salePrintDescription.value.trim()) {
      console.warn("[Validate] Print validation failed: Other print service description missing", { type: ui.salePrintType.value });
      showError("Enter a description for the other print service.");
      return false;
    }
    // Require a project price for print products (Amount field removed from UI)
    if (!ui.salePrintProjectPrice?.value || Number(ui.salePrintProjectPrice.value) <= 0) { console.warn("[Validate] Print validation failed: project price invalid", { value: ui.salePrintProjectPrice?.value }); showError("Enter a valid project price for print services."); return false; }
  }

  return true;
}

function validateSaleEditForm() {
  if (!ui.editSaleCustomer.value) { console.warn("[Validate] Sale edit validation failed: customer missing"); showError("Select a customer to update the sale."); return false; }
  if (ui.editSaleAmount && (!ui.editSaleAmount.value || Number(ui.editSaleAmount.value) <= 0)) { console.warn("[Validate] Sale edit validation failed: dollar amount invalid", { value: ui.editSaleAmount.value }); showError("Enter a valid dollar amount."); return false; }
  return true;
}

function validateReminderForm() {
  if (!ui.reminderCustomer.value) { showError("Select a customer for the reminder."); return false; }
  if (!ui.reminderTitle.value.trim()) { showError("Reminder title is required."); return false; }
  if (!ui.reminderDate.value) { showError("Due Date is required."); return false; }
  return true;
}

function clearCustomerForm() {
  ui.customerForm.reset();
  state.editingCustomerId = null;
  ui.customerId.value = "";
}

function updateNotificationRecommendations() {
  if (!ui.saleCategory) return;
  const category = ui.saleCategory.value;
  const productDetails = {
    service: ui.saleDigitalService?.value || ""
  };
  const recommendation = getRecommendedNotificationSelections(category, productDetails);
  if (ui.notifyManagement) ui.notifyManagement.checked = recommendation.notifyManagement;
  if (ui.notifyPrintTeam) ui.notifyPrintTeam.checked = recommendation.notifyPrintTeam;
  if (ui.notifyDesigners) ui.notifyDesigners.checked = recommendation.notifyDesigners;
  if (ui.notifyDigitalTeam) ui.notifyDigitalTeam.checked = recommendation.notifyDigitalTeam;
  if (ui.notifySocialMediaTeam) ui.notifySocialMediaTeam.checked = recommendation.notifySocialMediaTeam;
  if (ui.notifyGeofencing) ui.notifyGeofencing.checked = recommendation.notifyGeofencing;
}

function clearSaleForm() {
  ui.saleForm.reset();
  ui.saleDate.value = getTodayISO();
  updateSaleFormVisibility();
  updatePaidAdsOtherVisibility();
  updatePaymentMethodVisibility("");
  updateNotificationRecommendations();
  calculateMailerPricing();
}

function clearSaleEditForm() {
  if (!ui.saleEditForm) {
    state.editingSaleId = null;
    if (ui.editingSaleId) ui.editingSaleId.value = "";
    return;
  }
  ui.saleEditForm.reset();
  if (ui.saleEditPanel) ui.saleEditPanel.classList.add("hidden");
  state.editingSaleId = null;
  if (ui.editingSaleId) ui.editingSaleId.value = "";
}

function clearReminderForm() {
  if (!ui.reminderForm) return;
  ui.reminderForm.reset();
  ui.reminderDate.value = state.selectedCalendarDate || getNextDate(1);
  state.editingReminderId = null;
  setReminderFormMode(false);
}

function setReminderFormMode(isEditing = false) {
  const submitButton = ui.reminderForm?.querySelector('button[type="submit"]');
  if (!submitButton) return;
  submitButton.textContent = isEditing ? "Update Reminder" : "Save Reminder";
}

function clearCustomerNoteForm() {
  if (!ui.customerNoteForm) return;
  ui.customerNoteForm.reset();
  state.currentCustomerNoteId = null;
  ui.customerNoteId.value = "";
}

function clearCustomerReminderForm() {
  if (!ui.customerReminderForm) return;
  ui.customerReminderForm.reset();
  state.currentCustomerReminderId = null;
  ui.customerReminderId.value = "";
  if (state.currentCustomerId) {
    const customer = getCustomerById(state.currentCustomerId);
    if (customer && ui.customerReminderDate) {
      ui.customerReminderDate.value = state.selectedCalendarDate || getNextDate(1);
    }
  }
}

function clearCommunicationForm() {
  if (!ui.customerCommunicationForm) return;
  ui.customerCommunicationForm.reset();
  ui.communicationAuthor.value = state.currentRole;
}

function ensureCustomerOptions() {
  const customerOptions = state.customers.map(customer => `<option value="${customer.id}">${customer.businessName}</option>`).join("") || '<option value="">No customers available</option>';
  if (ui.saleCustomer) ui.saleCustomer.innerHTML = customerOptions;
  if (ui.reminderCustomer) ui.reminderCustomer.innerHTML = customerOptions;
  if (ui.editSaleCustomer) ui.editSaleCustomer.innerHTML = customerOptions;
  const reps = [...new Set(state.customers.map(customer => customer.assignedSalesRepresentative))];
  if (ui.representativeFilter) ui.representativeFilter.innerHTML = `<option value="All">All</option>` + reps.map(rep => `<option value="${rep}">${rep}</option>`).join("");
}

function addCustomer(event) {
  event.preventDefault();
  if (!validateCustomerForm()) return;
  const customerRepresentative = state.editingCustomerId
    ? getCustomerById(state.editingCustomerId)?.assignedSalesRepresentative || getCurrentUserName()
    : getCurrentUserName();

  const customerData = {
    id: state.editingCustomerId || createId("cust"),
    businessName: ui.businessName.value.trim(),
    businessAddress: ui.businessAddress.value.trim(),
    contactPerson: ui.contactPerson.value.trim(),
    emailAddress: ui.emailAddress.value.trim(),
    phoneNumber: ui.phoneNumber.value.trim(),
    notes: ui.customerNotes.value.trim(),
    dateCreated: state.editingCustomerId ? getCustomerById(state.editingCustomerId).dateCreated : getTodayISO(),
    lastContactDate: getTodayISO(),
    assignedSalesRepresentative: customerRepresentative,
    customerStatus: ui.customerStatus.value,
    noteEntries: [],
    communicationHistory: [],
    socialAccounts: { ...DEFAULT_SOCIAL_ACCOUNTS }
  };

  if (ui.customerNotes.value.trim()) {
    customerData.noteEntries.push({ id: createId("note"), text: ui.customerNotes.value.trim(), author: state.currentRole, timestamp: getTodayISO() });
  }

  if (state.editingCustomerId) {
    state.customers = state.customers.map(customer => customer.id === state.editingCustomerId ? customerData : customer);
    recordActivity({ type: "customer", title: "Customer updated", details: `Customer ${customerData.businessName} updated.`, relatedId: customerData.id });
  } else {
    state.customers.unshift(customerData);
    recordActivity({ type: "customer", title: "New customer added", details: `Customer ${customerData.businessName} was added by ${state.currentRole}.`, relatedId: customerData.id });
  }

  persistState();
  clearCustomerForm();
  refreshAllData();
  showSuccess(state.editingCustomerId ? "Customer updated successfully." : "Customer added successfully.");
}

function editCustomer(id) {
  const customer = getCustomerById(id);
  if (!customer) return;
  state.editingCustomerId = id;
  ui.customerId.value = customer.id;
  ui.businessName.value = customer.businessName;
  ui.businessAddress.value = customer.businessAddress;
  ui.contactPerson.value = customer.contactPerson;
  ui.emailAddress.value = customer.emailAddress;
  ui.phoneNumber.value = customer.phoneNumber;
  ui.customerStatus.value = customer.customerStatus;
  ui.customerNotes.value = customer.notes || (customer.noteEntries[0] ? customer.noteEntries[0].text : "");
  renderView("customers");
}

function deleteCustomer(id) {
  showConfirmModal("Delete this customer and related sales/reminders?", () => {
    const removedCustomer = state.customers.find(customer => customer.id === id);
    state.customers = state.customers.filter(customer => customer.id !== id);
    state.sales = state.sales.filter(sale => sale.customerId !== id);
    state.reminders = state.reminders.filter(reminder => reminder.customerId !== id);
    if (state.currentCustomerId === id) state.currentCustomerId = null;
    recordActivity({ type: "customer", title: "Customer deleted", details: `Customer ${removedCustomer?.businessName || "Unknown"} was deleted.`, relatedId: id });
    persistState();
    refreshAllData();
    showSuccess("Customer deleted successfully.");
  });
}

function addSale(event) {
  console.log("[Save Sale] Button clicked");
  event.preventDefault();
  try {
    console.log("[Save Sale] Starting");
    console.log("[Save Sale] Collecting form data");
    if (!validateSaleForm()) {
      console.warn("[Save Sale] Validation failed", { category: ui.saleCategory.value, customerId: ui.saleCustomer.value });
      return;
    }
    console.log("[Save Sale] Validation passed");
    const customer = getCustomerById(ui.saleCustomer.value);
    if (!customer) {
      console.warn("[Save Sale] Customer not found", ui.saleCustomer?.value);
      return;
    }
    console.log("[Save Sale] Customer found", { customerId: customer.id, businessName: customer.businessName });
    console.log("[Save Sale] Existing sales:", state.sales.length);
    if (state.editingSaleId) {
    const sale = getSaleById(state.editingSaleId);
    if (!sale) return;
    sale.customerId = customer.id;
    sale.businessName = customer.businessName;
    sale.saleCategory = ui.saleCategory.value;
    sale.saleType = ui.saleCategory.value;
    if (ui.saleCategory.value === "Mailer") calculateMailerPricing();
    if (ui.saleCategory.value === "Digital") calculateDigitalPricing();
    if (ui.saleCategory.value === "Print") calculatePrintPricing();
    sale.productDetails = collectSaleProductDetails();
    sale.saleDate = ui.saleDate.value;
    sale.salesRepresentative = ui.saleRepresentative?.value.trim() || sale.salesRepresentative || getCurrentUserName();
    // For Print products, use totalInvestment which includes design fee
    if (sale.saleCategory === "Print") {
      sale.dollarAmount = sale.productDetails?.totalInvestment || 0;
    } else {
      sale.dollarAmount = Number(ui.saleAmount.value);
    }
    sale.digitalDiscountType = sale.productDetails.discountType;
    sale.digitalDiscountValue = sale.productDetails.discountValue;
    sale.digitalFinalTotal = sale.productDetails.totalInvestment;
    sale.notes = ui.saleNotes.value.trim();
    sale.designRequired = getYesNo(ui.designRequired);
    sale.designChangeRequired = getYesNo(ui.designChangeRequired);
    sale.designChange = sale.designChangeRequired;
    // Only persist needsMailing for eligible Print products
    if (sale.saleCategory === "Print" && (sale.productDetails?.printType === "Custom Print Project" || sale.productDetails?.printType === "Other")) {
      sale.needsMailing = ui.needsMailing?.value || "No";
    } else {
      delete sale.needsMailing;
      if (sale.productDetails) delete sale.productDetails.needsMailing;
    }
    sale.paymentMethod = ui.salePaymentMethod?.value || "";
    if (sale.paymentMethod === "Other") {
      sale.otherPaymentMethod = ui.saleOtherPaymentMethod?.value || "";
    } else {
      if ('otherPaymentMethod' in sale) delete sale.otherPaymentMethod;
    }
    sale.notifyManagement = ui.notifyManagement?.checked || false;
    sale.notifyPrintTeam = ui.notifyPrintTeam?.checked || false;
    sale.notifyDesigners = ui.notifyDesigners?.checked || false;
    sale.notifyDigitalTeam = ui.notifyDigitalTeam?.checked || false;
    sale.notifySocialMediaTeam = ui.notifySocialMediaTeam?.checked || false;
    sale.notifyGeofencing = ui.notifyGeofencing?.checked || false;
    customer.lastContactDate = sale.saleDate;
    state.editingSaleId = null;
    recordActivity({ type: "sale", title: "Sale updated", details: `Sale for ${sale.businessName} was updated.`, relatedId: sale.id });
    persistState();
    clearSaleForm();
    refreshAllData();
    showSuccess("Sale updated successfully.");
    return;
  }

  if (ui.saleCategory.value === "Mailer") calculateMailerPricing();
  if (ui.saleCategory.value === "Digital") calculateDigitalPricing();
  const saleRepresentative = ui.saleRepresentative?.value.trim() || getCurrentUserName();
  const sale = {
    id: createId("sale"),
    customerId: customer.id,
    businessName: customer.businessName,
    saleCategory: ui.saleCategory.value,
    saleType: ui.saleCategory.value,
    productDetails: collectSaleProductDetails(),
    saleDate: ui.saleDate.value,
    salesRepresentative: saleRepresentative,
    dollarAmount: Number(ui.saleAmount.value),
    digitalDiscountType: ui.saleDigitalDiscountType?.value || "None",
    digitalDiscountValue: Number(ui.saleDigitalDiscountValue?.value) || 0,
    digitalFinalTotal: Number(ui.saleAmount.value) || 0,
    notes: ui.saleNotes.value.trim(),
    designRequired: getYesNo(ui.designRequired),
    designChangeRequired: getYesNo(ui.designChangeRequired),
    paymentMethod: ui.salePaymentMethod?.value || "",
    otherPaymentMethod: ui.salePaymentMethod?.value === "Other" ? (ui.saleOtherPaymentMethod?.value || "") : undefined,
    notifyManagement: ui.notifyManagement?.checked || false,
    notifyPrintTeam: ui.notifyPrintTeam?.checked || false,
    notifyDesigners: ui.notifyDesigners?.checked || false,
    notifyDigitalTeam: ui.notifyDigitalTeam?.checked || false,
    notifySocialMediaTeam: ui.notifySocialMediaTeam?.checked || false,
    notifyGeofencing: ui.notifyGeofencing?.checked || false
  };

  // If product is Print, ensure dollarAmount includes the design fee (use totalInvestment)
  if (sale.saleCategory === "Print") {
    const totalInvestment = sale.productDetails?.totalInvestment || 0;
    if (totalInvestment > 0) {
      sale.dollarAmount = totalInvestment;
      const el = document.getElementById('saleAmount');
      if (el) el.value = totalInvestment.toFixed(2);
    }
  }

  // Persist needsMailing only when product is an eligible Print type
  if (sale.saleCategory === "Print" && (sale.productDetails?.printType === "Custom Print Project" || sale.productDetails?.printType === "Other")) {
    sale.needsMailing = sale.productDetails?.needsMailing || "No";
  } else {
    if ('needsMailing' in sale) delete sale.needsMailing;
    if (sale.productDetails) delete sale.productDetails.needsMailing;
  }

  console.log("[Save Sale] Saving sale", sale);
  state.sales.unshift(sale);
  customer.lastContactDate = sale.saleDate;
  // If customer was a Prospect, promote to Active on successful sale
  if (customer.customerStatus === "Prospect") {
    customer.customerStatus = "Active";
    recordActivity({ type: "customer", title: "Customer status updated", details: `Customer ${customer.businessName} promoted Prospect → Active due to new sale.`, relatedId: customer.id });
  }
  createSaleNotificationsForSale(sale);
  recordActivity({ type: "sale", title: "New sale added", details: `Sale for ${sale.businessName} (${getSaleDisplayLabel(sale)}) was added by ${sale.salesRepresentative}.`, relatedId: sale.id });
  persistState();
  console.log("[Save Sale] Sale saved successfully", { saleId: sale.id, updatedSales: state.sales.length });
  clearSaleForm();
  refreshAllData();
  renderSaleConfirmation(sale);
  sendSaleEmailsToBackend(sale);
  } catch (error) {
    console.error("[Save Sale Error]", error);
  }
}

function editSale(id) {
  const sale = getSaleById(id);
  if (!sale) return;
  state.editingSaleId = id;
  // If dedicated edit UI exists, use it
  if (ui.saleEditPanel && ui.editSaleCustomer && ui.editSaleType && ui.editSaleDate && ui.editSaleRepresentative && ui.editSaleAmount && ui.editDesignRequired && ui.editDesignChangeRequired && ui.editSaleNotes) {
    if (ui.editingSaleId) ui.editingSaleId.value = id;
    ui.editSaleCustomer.value = sale.customerId;
    ui.editSaleType.value = sale.saleType;
    ui.editSaleDate.value = sale.saleDate;
    ui.editSaleRepresentative.value = sale.salesRepresentative;
    ui.editSaleAmount.value = sale.dollarAmount;
    ui.editDesignRequired.value = sale.designRequired;
    ui.editDesignChangeRequired.value = sale.designChangeRequired;
    ui.editSaleNotes.value = sale.notes || "";
    if (ui.saleEditPanel) {
      ui.saleEditPanel.classList.remove("hidden");
      ui.saleEditPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    return;
  }

  // Fallback: reuse main sale form for editing
  if (ui.saleCustomer) ui.saleCustomer.value = sale.customerId;
  setSaleFormFieldsFromSale(sale);
  if (ui.saleDate) ui.saleDate.value = sale.saleDate;
  if (ui.saleRepresentative) ui.saleRepresentative.value = sale.salesRepresentative;
  if (ui.saleAmount) ui.saleAmount.value = sale.dollarAmount;
  if (ui.designRequired) setYesNo(ui.designRequired, sale.designRequired);
  if (ui.designChangeRequired) setYesNo(ui.designChangeRequired, sale.designChangeRequired);
  if (ui.saleNotes) ui.saleNotes.value = sale.notes || "";
  const form = document.getElementById("saleForm");
  if (form) form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function deleteSale(id) {
  showConfirmModal("Delete this sale and its related notifications?", () => {
    const deletedSale = state.sales.find(sale => sale.id === id);
    state.sales = state.sales.filter(sale => sale.id !== id);
    state.notifications = state.notifications.filter(notification => notification.relatedId !== id);
    if (deletedSale) {
      recordActivity({ type: "sale", title: "Sale deleted", details: `Sale for ${deletedSale.businessName} was deleted.`, relatedId: id });
    }
    persistState();
    refreshAllData();
    showSuccess("Sale deleted successfully.");
  });
}

function saveSaleEdit(event) {
  event.preventDefault();
  if (!validateSaleEditForm()) {
    console.warn("[Save Sale Edit] Validation failed", { saleId: state.editingSaleId, customerId: ui.editSaleCustomer?.value });
    return;
  }
  const sale = getSaleById(state.editingSaleId);
  if (!sale) return;
  const customer = getCustomerById(ui.editSaleCustomer.value);
  if (!customer) return;

  sale.customerId = customer.id;
  sale.businessName = customer.businessName;
  sale.saleCategory = ui.saleCategory.value;
  sale.saleType = ui.saleCategory.value;
  if (ui.saleCategory.value === "Mailer") calculateMailerPricing();
  sale.productDetails = collectSaleProductDetails();
  sale.saleDate = ui.editSaleDate.value;
  sale.salesRepresentative = ui.editSaleRepresentative?.value.trim() || sale.salesRepresentative || getCurrentUserName();
  sale.dollarAmount = Number(ui.editSaleAmount.value);
  sale.notes = ui.editSaleNotes.value.trim();
  sale.designRequired = ui.editDesignRequired.value;
  sale.designChangeRequired = ui.editDesignChangeRequired.value;
  sale.designChange = sale.designChangeRequired;
  // Only persist needsMailing for eligible Print products
  if (sale.saleCategory === "Print" && (sale.productDetails?.printType === "Custom Print Project" || sale.productDetails?.printType === "Other")) {
    sale.needsMailing = ui.needsMailing?.value || sale.needsMailing || "No";
  } else {
    if ('needsMailing' in sale) delete sale.needsMailing;
    if (sale.productDetails) delete sale.productDetails.needsMailing;
  }
  // preserve notification preferences when editing
  sale.notifyManagement = ui.notifyManagement?.checked || false;
  sale.notifyPrintTeam = ui.notifyPrintTeam?.checked || false;
  sale.notifyDesigners = ui.notifyDesigners?.checked || false;
  sale.notifyDigitalTeam = ui.notifyDigitalTeam?.checked || false;
  sale.notifySocialMediaTeam = ui.notifySocialMediaTeam?.checked || false;
  sale.notifyGeofencing = ui.notifyGeofencing?.checked || false;
  customer.lastContactDate = sale.saleDate;
  recordActivity({ type: "sale", title: "Sale edited", details: `Sale for ${sale.businessName} was modified.`, relatedId: sale.id });
  persistState();
  clearSaleEditForm();
  refreshAllData();
  showSuccess("Sale updated successfully.");
}

function addReminder(event) {
  event.preventDefault();
  if (!validateReminderForm()) return;
  // If editing an existing reminder, update it
  if (state.editingReminderId) {
    const rem = getReminderById(state.editingReminderId);
    if (!rem) return;
    rem.customerId = ui.reminderCustomer.value;
    rem.title = ui.reminderTitle.value.trim();
    rem.dueDate = ui.reminderDate.value;
    rem.assignedTo = ui.reminderAssignedTo?.value.trim() || rem.assignedTo || getCurrentUserName();
    rem.notes = ui.reminderNotes.value.trim();
    state.editingReminderId = null;
    recordActivity({ type: "reminder", title: "Reminder updated", details: `Reminder ${rem.title} was updated.`, relatedId: rem.id });
    persistState();
    clearReminderForm();
    refreshAllData();
    showSuccess("Reminder updated.");
    return;
  }

  const reminder = {
    id: createId("rem"),
    customerId: ui.reminderCustomer.value,
    title: ui.reminderTitle.value.trim(),
    dueDate: ui.reminderDate.value,
    assignedTo: ui.reminderAssignedTo?.value.trim() || getCurrentUserName(),
    notes: ui.reminderNotes.value.trim(),
    completed: false
  };
  state.reminders.unshift(reminder);
  sendReminderNotification({
    title: "Reminder scheduled",
    message: `${getCustomerById(reminder.customerId)?.businessName || "A customer"} has a reminder: ${reminder.title}.`,
    relatedId: reminder.id,
    relatedCustomerId: reminder.customerId
  });
  recordActivity({ type: "reminder", title: "Reminder created", details: `Reminder ${reminder.title} was created for ${getCustomerById(reminder.customerId)?.businessName || "a customer"}.`, relatedId: reminder.id });
  persistState();
  clearReminderForm();
  refreshAllData();
  showSuccess("Reminder scheduled.");
}

function toggleReminderComplete(id) {
  const reminder = state.reminders.find(reminder => reminder.id === id);
  state.reminders = state.reminders.map(reminder => reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder);
  recordActivity({ type: "reminder", title: reminder?.completed ? "Reminder reopened" : "Reminder completed", details: `${reminder?.title || "Reminder"} was ${reminder?.completed ? "reopened" : "completed"}.`, relatedId: id });
  persistState();
  refreshAllData();
}

function deleteReminder(id) {
  showConfirmModal("Delete this reminder?", () => {
    const removedReminder = state.reminders.find(reminder => reminder.id === id);
    state.reminders = state.reminders.filter(reminder => reminder.id !== id);
    recordActivity({ type: "reminder", title: "Reminder deleted", details: `${removedReminder?.title || "Reminder"} was deleted.`, relatedId: id });
    persistState();
    refreshAllData();
    showSuccess("Reminder deleted successfully.");
  });
}

function editReminder(id) {
  const rem = getReminderById(id);
  if (!rem) return;
  state.editingReminderId = id;
  if (ui.reminderCustomer) ui.reminderCustomer.value = rem.customerId;
  if (ui.reminderTitle) ui.reminderTitle.value = rem.title || "";
  if (ui.reminderDate) ui.reminderDate.value = rem.dueDate || getTodayISO();
  if (ui.reminderAssignedTo) ui.reminderAssignedTo.value = rem.assignedTo || "";
  if (ui.reminderNotes) ui.reminderNotes.value = rem.notes || "";
  setReminderFormMode(true);
  renderView("reminders");
  if (ui.reminderTitle) ui.reminderTitle.focus();
}

function saveCustomerReminder(event) {
  if (!ui.customerReminderForm) return;
  event.preventDefault();
  if (!ui.customerReminderTitle.value.trim() || !ui.customerReminderDate.value) {
    showError("Reminder title and due date are required.");
    return;
  }
  const customerReminderAssignedTo = ui.customerReminderAssignedTo?.value.trim() || getCurrentUserName();
  const payload = {
    id: state.currentCustomerReminderId || createId("rem"),
    customerId: state.currentCustomerId,
    title: ui.customerReminderTitle.value.trim(),
    dueDate: ui.customerReminderDate.value,
    assignedTo: customerReminderAssignedTo,
    notes: ui.customerReminderNotes.value.trim(),
    completed: false
  };
  if (state.currentCustomerReminderId) {
    state.reminders = state.reminders.map(reminder => reminder.id === state.currentCustomerReminderId ? payload : reminder);
  } else {
    state.reminders.unshift(payload);
    sendReminderNotification({
      title: "Reminder scheduled",
      message: `${getCustomerById(payload.customerId)?.businessName || "A customer"} has a reminder: ${payload.title}.`,
      relatedId: payload.id,
      relatedCustomerId: payload.customerId
    });
  }
  persistState();
  clearCustomerReminderForm();
  refreshAllData();
  showSuccess("Reminder saved.");
}

function addCustomerNote(event) {
  if (!ui.customerNoteForm) return;
  event.preventDefault();
  const customer = getCustomerById(state.currentCustomerId);
  if (!customer) return;
  if (!ui.customerNoteAuthor.value.trim() || !ui.customerNoteText.value.trim()) {
    showError("Author and note text are required.");
    return;
  }
  const note = { id: state.currentCustomerNoteId || createId("note"), text: ui.customerNoteText.value.trim(), author: ui.customerNoteAuthor.value.trim(), timestamp: getTodayISO() };
  if (state.currentCustomerNoteId) {
    customer.noteEntries = customer.noteEntries.map(entry => entry.id === state.currentCustomerNoteId ? note : entry);
  } else {
    customer.noteEntries.push(note);
  }
  customer.notes = customer.noteEntries[customer.noteEntries.length - 1]?.text || customer.notes;
  customer.lastContactDate = getTodayISO();
  persistState();
  clearCustomerNoteForm();
  renderAll();
  showSuccess("Note saved.");
}

function deleteCustomerNote(id) {
  const customer = getCustomerById(state.currentCustomerId);
  customer.noteEntries = customer.noteEntries.filter(note => note.id !== id);
  customer.notes = customer.noteEntries[0]?.text || "";
  persistState();
  renderAll();
}

function editCustomerNote(id) {
  const customer = getCustomerById(state.currentCustomerId);
  const note = customer.noteEntries.find(entry => entry.id === id);
  if (!note) return;
  state.currentCustomerNoteId = id;
  if (!ui.customerNoteForm) return;
  ui.customerNoteId.value = id;
  ui.customerNoteAuthor.value = note.author;
  ui.customerNoteText.value = note.text;
  const tabBtn = document.querySelector('[data-tab="notes"]');
  if (tabBtn) tabBtn.click();
}

function saveCustomerCommunication(event) {
  event.preventDefault();
  const customer = getCustomerById(state.currentCustomerId);
  if (!customer) return;
  if (!ui.communicationAuthor.value.trim() || !ui.communicationSummary.value.trim()) {
    showError("Author and summary are required.");
    return;
  }
  customer.communicationHistory.push({ id: createId("comm"), type: ui.communicationType.value, summary: ui.communicationSummary.value.trim(), author: ui.communicationAuthor.value.trim(), timestamp: getTodayISO() });
  customer.lastContactDate = getTodayISO();
  persistState();
  clearCommunicationForm();
  renderAll();
  showSuccess("Communication saved.");
}

function deleteCustomerCommunication(id) {
  const customer = getCustomerById(state.currentCustomerId);
  customer.communicationHistory = customer.communicationHistory.filter(item => item.id !== id);
  persistState();
  renderAll();
}

function deleteSelectedNotifications() {
  if (!state.selectedNotificationIds.length) {
    showError("Select at least one notification to delete.");
    return;
  }
  showConfirmModal("Delete the selected notifications?", () => {
    state.notifications = state.notifications.filter(notification => !state.selectedNotificationIds.includes(notification.id));
    state.selectedNotificationIds = [];
    persistState();
    refreshAllData();
    showSuccess("Selected notifications deleted.");
  });
}

function clearAllNotifications() {
  showConfirmModal("Clear all notifications?", () => {
    state.notifications = [];
    state.selectedNotificationIds = [];
    persistState();
    refreshAllData();
    showSuccess("All notifications cleared.");
  });
}

function deleteNotification(id) {
  showConfirmModal("Delete this notification?", () => {
    state.notifications = state.notifications.filter(notification => notification.id !== id);
    persistState();
    refreshAllData();
    showSuccess("Notification deleted.");
  });
}

function markNotificationRead(id) {
  const notification = state.notifications.find(notification => notification.id === id);
  if (!notification) return;
  notification.read = true;
  persistState();
  renderNotificationFeed();
  renderDashboardStats();
  updateSummaryMetrics();
}

function toggleNotificationRead(id) {
  const notification = state.notifications.find(notification => notification.id === id);
  if (!notification) return;
  notification.read = !notification.read;
  persistState();
  renderNotificationFeed();
  renderDashboardStats();
  updateSummaryMetrics();
}

function viewNotificationCustomer(id) {
  const notification = state.notifications.find(notification => notification.id === id);
  const sale = notification?.relatedId ? getSaleById(notification.relatedId) : null;
  const customerId = notification?.relatedCustomerId || sale?.customerId;
  if (customerId) {
    openCustomerOrderHistory(customerId);
    return;
  }
  renderView("notifications");
}

function viewNotificationSale(id) {
  const notification = state.notifications.find(notification => notification.id === id);
  const sale = notification?.relatedId ? getSaleById(notification.relatedId) : null;
  if (sale) {
    renderSaleConfirmation(sale);
    return;
  }
  viewNotificationCustomer(id);
}

function applyCustomerFilters() {
  let rows = [...state.customers];
  if (state.filters.search) {
    const query = state.filters.search.toLowerCase();
    rows = rows.filter(customer => [customer.businessName, customer.contactPerson, customer.emailAddress].join(" ").toLowerCase().includes(query));
  }
  if (state.filters.customerStatus !== "All") rows = rows.filter(customer => customer.customerStatus === state.filters.customerStatus);
  if (state.filters.representative !== "All") rows = rows.filter(customer => customer.assignedSalesRepresentative === state.filters.representative);

  rows.sort((a, b) => {
    const left = a[state.filters.sortField] || "";
    const right = b[state.filters.sortField] || "";
    if (typeof left === "string") {
      return state.filters.sortDirection === "asc" ? left.localeCompare(right) : right.localeCompare(left);
    }
    return state.filters.sortDirection === "asc" ? Number(left) - Number(right) : Number(right) - Number(left);
  });

  return rows;
}

function renderCustomerTable() {
  if (!ui.customerTableWrap) return;
  const rows = applyCustomerFilters();
  if (!rows.length) {
    ui.customerTableWrap.innerHTML = '<p class="empty-state">No customer records match the current filters.</p>';
    return;
  }

  ui.customerTableWrap.innerHTML = `
    <div class="customer-list-grid">
      ${rows.map(customer => {
        const notesPreview = customer.notes || customer.noteEntries?.[0]?.text || "";
        return `
        <article data-customer-id="${customer.id}" class="customer-card row-clickable${state.currentCustomerId === customer.id ? ' row-selected' : ''}">
          <div class="customer-card-header">
            <div class="customer-card-title-group">
              <strong class="customer-card-title">${customer.businessName}</strong>
              <div class="customer-card-subtext">${customer.businessAddress || "No address on file"}</div>
            </div>
            <span class="tag customer-status ${customer.customerStatus.toLowerCase()} customer-card-status">${customer.customerStatus}</span>
          </div>

          <div class="customer-card-details">
            <div class="customer-card-field">
              <span class="field-label">Contact</span>
              <strong>${customer.contactPerson || "No contact"}</strong>
            </div>
            <div class="customer-card-field">
              <span class="field-label">Phone</span>
              <strong>${customer.phoneNumber || "No phone"}</strong>
            </div>
            <div class="customer-card-field">
              <span class="field-label">Email</span>
              <strong>${customer.emailAddress || "No email"}</strong>
            </div>
            <div class="customer-card-field">
              <span class="field-label">Representative</span>
              <strong>${customer.assignedSalesRepresentative || "Unassigned"}</strong>
            </div>
            <div class="customer-card-field">
              <span class="field-label">Last Contact</span>
              <strong>${formatDate(customer.lastContactDate)}</strong>
            </div>
          </div>

          ${notesPreview ? `
            <div class="customer-card-notes">
              <span class="field-label">Notes</span>
              <p>${notesPreview}</p>
            </div>
          ` : ""}

          <div class="customer-actions customer-card-actions">
            <button class="info-btn compact-action" data-action="view-customer-orders" data-id="${customer.id}" title="View order history">View</button>
            <button class="edit-btn compact-action" data-action="edit-customer" data-id="${customer.id}" title="Edit customer">Edit</button>
            <button class="delete-btn compact-action" data-action="delete-customer" data-id="${customer.id}" title="Delete customer">Delete</button>
          </div>
        </article>`;
      }).join("")}
    </div>`;
}

function getCustomerOrders(customerId) {
  return state.sales
    .filter(sale => sale.customerId === customerId)
    .sort((a, b) => (b.saleDate || "").localeCompare(a.saleDate || ""));
}

function getSaleKeyDetails(sale) {
  if (!sale) return "";
  const category = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  const details = sale.productDetails || {};
  if (category === "Mailer") {
    return [`Area: ${details.mailerArea || "N/A"}`, `Size: ${details.adSize || "N/A"}`, `Run: ${details.mailerRunTime || "N/A"} mo`].filter(Boolean).join(" • ");
  }
  if (category === "Digital") {
    const platformInfo = details.service || details.paidAdPlatforms?.join(", ") || details.socialPlatforms?.join(", ") || "Digital";
    return [platformInfo, details.targetAreas || details.targetLocations || ""].filter(Boolean).join(" • ");
  }
  if (category === "Print") {
    return [`Type: ${details.printType || "Print"}`, `Qty: ${details.quantity || "N/A"}`, `${details.size || "N/A"}`].filter(Boolean).join(" • ");
  }
  return sale.saleType || category || "Sale";
}

function renderCustomerDetailPanel(customerId) {
  if (!ui.customerDetailPanel) return;
  const customer = getCustomerById(customerId);
  if (!customer) {
    ui.customerDetailPanel.classList.add("hidden");
    return;
  }

  state.currentCustomerId = customerId;
  ui.customerDetailPanel.classList.remove("hidden");
  const orders = getCustomerOrders(customerId);
  const totalOrders = orders.length;
  const lifetimeRevenue = orders.reduce((sum, sale) => sum + Number(sale.dollarAmount || 0), 0);
  const lastOrderDate = orders.length ? orders[0].saleDate : null;

  const summaryHtml = `
    <div class="report-card small"><span>Total Orders</span><strong>${totalOrders}</strong></div>
    <div class="report-card small"><span>Lifetime Revenue</span><strong>${formatCurrency(lifetimeRevenue)}</strong></div>
    <div class="report-card small"><span>Last Order Date</span><strong>${lastOrderDate ? formatDate(lastOrderDate) : "None"}</strong></div>
  `;
  ui.customerSummaryGrid.innerHTML = summaryHtml;

  const nameHeader = document.getElementById("customerDetailName");
  if (nameHeader) nameHeader.textContent = `${customer.businessName} · Order History`;

  const recentOrders = orders.slice(0, 5);
  if (ui.customerRecentOrders) {
    ui.customerRecentOrders.innerHTML = recentOrders.length ? recentOrders.map(order => `
      <article class="recent-order-card sales-mini-card">
        <div class="sales-mini-main">
          <span class="sale-category-badge ${getSaleCategoryClass(order)}">${getSaleCategoryBadgeLabel(order)}</span>
          <strong>${getSaleDisplayLabel(order)}</strong>
          <span class="recent-order-summary">${getSaleKeyDetails(order)}</span>
        </div>
        <div class="recent-order-meta">
          <span>${formatDate(order.saleDate)}</span>
          <span>${order.businessName ? order.businessName : ""}</span>
        </div>
        <div class="sales-mini-side">
          <strong class="sales-total">${formatCurrency(order.dollarAmount)}</strong>
          <div class="sales-action-group">
            <button class="info-btn compact-action" data-action="view-order-details" data-id="${order.id}">View</button>
            <button class="primary-btn compact-action" data-action="reorder-sale" data-id="${order.id}">Reorder</button>
          </div>
        </div>
      </article>
    `).join("") : `
      <div class="sales-empty-state mini">
        <strong>No previous orders yet.</strong>
        <span>Saved sales will appear here for quick reorder.</span>
      </div>`;
  }

  if (ui.customerOrderHistory) {
    if (!orders.length) {
      ui.customerOrderHistory.innerHTML = `
        <div class="sales-empty-state">
          <strong>No sales recorded yet.</strong>
          <span>Create a sale to begin tracking customer activity.</span>
        </div>`;
    } else {
      ui.customerOrderHistory.innerHTML = `
        <div class="sales-activity-list customer-sales-history">
          ${orders.map(order => `
            <article class="sales-activity-row">
              <div class="sales-activity-main">
                <strong class="sales-customer-name">${getSaleDisplayLabel(order)}</strong>
                <span class="sales-product-line">${getSaleKeyDetails(order)}</span>
              </div>
              <div class="sales-activity-meta">
                <span class="sale-category-badge ${getSaleCategoryClass(order)}">${getSaleCategoryBadgeLabel(order)}</span>
                <span>${formatDate(order.saleDate)}</span>
              </div>
              <div class="sales-activity-side">
                <strong class="sales-total">${formatCurrency(order.dollarAmount)}</strong>
                <div class="sales-action-group">
                  <button class="info-btn compact-action" data-action="view-order-details" data-id="${order.id}">View</button>
                  <button class="primary-btn compact-action" data-action="reorder-sale" data-id="${order.id}">Reorder</button>
                </div>
              </div>
            </article>
          `).join("")}
        </div>`;
    }
  }
  if (ui.customerOrderDetailPanel) {
    ui.customerOrderDetailPanel.classList.add("hidden");
    ui.customerOrderDetailPanel.innerHTML = "";
  }
}

function renderOrderDetailPanel(saleId) {
  if (!ui.customerOrderDetailPanel) return;
  const sale = getSaleById(saleId);
  if (!sale) {
    ui.customerOrderDetailPanel.classList.add("hidden");
    return;
  }

  const category = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  const details = sale.productDetails || {};
  const lines = [];

  if (category === "Mailer") {
    lines.push(`Mailer area: ${details.mailerArea || "N/A"}`);
    lines.push(`Start month: ${details.month || "N/A"}`);
    lines.push(`Run time: ${details.mailerRunTime || "N/A"} months`);
    lines.push(`Size: ${details.adSize || "N/A"}`);
  }
  if (category === "Digital") {
    lines.push(`Service: ${details.service || "Digital"}`);
    if (details.websiteOption) lines.push(`Website option: ${details.websiteOption}`);
    if (details.paidAdPlatforms?.length) lines.push(`Paid ad platforms: ${details.paidAdPlatforms.join(", ")}`);
    if (details.socialPlatforms?.length) lines.push(`Social platforms: ${details.socialPlatforms.join(", ")}`);
    if (details.campaignGoal) lines.push(`Campaign goal: ${details.campaignGoal}`);
    if (details.targetAreas) lines.push(`Target areas: ${details.targetAreas}`);
    if (details.targetLocations) lines.push(`Target locations: ${details.targetLocations}`);
    if (details.campaignStartDate || details.startDate) lines.push(`Start date: ${details.campaignStartDate || details.startDate}`);
  }
  if (category === "Print") {
    lines.push(`Print type: ${details.printType || "N/A"}`);
    if (details.size) lines.push(`Size: ${details.size}`);
    if (details.quantity) lines.push(`Quantity: ${details.quantity}`);
    if (details.finish) lines.push(`Finish: ${details.finish}`);
    if (details.thickness) lines.push(`Thickness: ${details.thickness}`);
    if (details.fold) lines.push(`Fold: ${details.fold}`);
    if (details.customDescription) lines.push(`Description: ${details.customDescription}`);
  }

  const orderNotes = sale.notes ? `<p><strong>Notes</strong><br />${sale.notes}</p>` : "";
  ui.customerOrderDetailPanel.classList.remove("hidden");
  ui.customerOrderDetailPanel.innerHTML = `
    <div class="panel-header">
      <div>
        <p class="eyebrow">Order details</p>
        <h3>${getSaleDisplayLabel(sale)}</h3>
      </div>
      <p class="panel-help">Detailed product specifications and pricing for this order.</p>
    </div>
    <div class="detail-summary">
      <div><strong>Category</strong><p>${category}</p></div>
      <div><strong>Date</strong><p>${formatDate(sale.saleDate)}</p></div>
      <div><strong>Total</strong><p>${formatCurrency(sale.dollarAmount)}</p></div>
      <div><strong>Representative</strong><p>${sale.salesRepresentative || "N/A"}</p></div>
    </div>
    <div class="order-detail-list">
      ${lines.map(item => `<p>${item}</p>`).join("")}
    </div>
    ${orderNotes}
    <div class="form-actions">
      <button class="primary-btn" data-action="reorder-sale" data-id="${sale.id}">Reorder this sale</button>
    </div>
  `;
}

function openCustomerOrderHistory(customerId) {
  renderView("customers");
  renderCustomerDetailPanel(customerId);
}

function reorderSale(saleId) {
  const sale = getSaleById(saleId);
  if (!sale) return;
  state.editingSaleId = null;
  renderView("sales");
  if (ui.saleCustomer) ui.saleCustomer.value = sale.customerId;
  setSaleFormFieldsFromSale(sale);
  if (ui.saleDate) ui.saleDate.value = sale.saleDate || getTodayISO();
  if (ui.saleRepresentative) ui.saleRepresentative.value = sale.salesRepresentative || "";
  if (ui.saleNotes) ui.saleNotes.value = sale.notes || "";
  if (ui.saleAmount) ui.saleAmount.value = Number(sale.dollarAmount || sale.digitalFinalTotal || 0).toFixed(2);
  if (ui.salePaymentMethod) ui.salePaymentMethod.value = sale.paymentMethod || "";
  updatePaymentMethodVisibility(ui.salePaymentMethod?.value || "");
  window.scrollTo({ top: 0, behavior: "smooth" });
  showSuccess("Reorder loaded into the new sale form. Modify fields as needed and save to create a new sale.");
}

function renderSalesTable() {
  if (!ui.salesTableWrap) return;
  if (!state.sales.length) {
    ui.salesTableWrap.innerHTML = `
      <div class="sales-empty-state">
        <strong>No sales recorded yet.</strong>
        <span>Create a sale to begin tracking customer activity.</span>
      </div>`;
    return;
  }

  ui.salesTableWrap.innerHTML = `
    <div class="sales-ledger">
      <div class="sales-history-list">
      ${state.sales.map(sale => {
        const status = getSaleStatusLabel(sale);
        return `
          <article class="sales-history-row">
            <div class="sales-history-main">
              <strong>${sale.businessName || "Unknown customer"}</strong>
              <span>${getSaleDisplayLabel(sale)}</span>
              ${status ? `<small class="sales-history-status">${status}</small>` : ""}
            </div>
            <div class="sales-history-meta">
              <span class="sale-category-badge ${getSaleCategoryClass(sale)}">${getSaleCategoryBadgeLabel(sale)}</span>
              <span>${formatDate(sale.saleDate)}</span>
              <span>${sale.salesRepresentative || "Unassigned"}</span>
            </div>
            <div class="sales-history-right">
              <strong>${formatCurrency(sale.dollarAmount)}</strong>
              <div class="sales-action-group sales-history-actions">
                <button class="edit-btn compact-action" data-action="edit-sale" data-id="${sale.id}" title="Edit sale">Edit</button>
                <button class="secondary-btn compact-action" data-action="download-agreement" data-id="${sale.id}" title="Download agreement">Agreement</button>
                <button class="delete-btn compact-action" data-action="delete-sale" data-id="${sale.id}" title="Delete sale">Delete</button>
              </div>
            </div>
          </article>`;
      }).join("")}
      </div>
    </div>`;
}

function renderReminderList() {
  if (!ui.reminderList) return;
  const monthKey = `${state.calendarYear}-${String(state.calendarMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthReminders = state.reminders.filter(reminder => reminder.dueDate.startsWith(monthKey)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  if (!state.reminders.length) {
    ui.reminderList.innerHTML = '<p class="empty-state">No reminders scheduled.</p>';
    return;
  }

  if (!monthReminders.length) {
    ui.reminderList.innerHTML = '<p class="empty-state">No reminders this month.</p>';
    return;
  }

  ui.reminderList.innerHTML = monthReminders.map(reminder => {
    const customer = getCustomerById(reminder.customerId);
    return `
      <div class="reminder-item">
        <div>
          <strong>${reminder.title}</strong>
          <p>${customer ? customer.businessName : "Unknown customer"}</p>
          <div class="reminder-meta">
            <span>${formatDate(reminder.dueDate)}</span>
            <span>${reminder.completed ? "Completed" : "Open"}</span>
          </div>
        </div>
        <div class="reminder-actions">
          <button class="edit-btn" data-action="edit-reminder" data-id="${reminder.id}">Edit</button>
          <button class="complete-btn" data-action="toggle-reminder" data-id="${reminder.id}">${reminder.completed ? "Reopen" : "Complete"}</button>
          <button class="delete-btn" data-action="delete-reminder" data-id="${reminder.id}">Delete</button>
        </div>
      </div>`;
  }).join("");
}

function renderCalendar() {
  if (!ui.yearSelect || !ui.monthSelect || !ui.calendarGrid || !ui.selectedDateLabel || !ui.selectedDateReminders) return;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = state.calendarMonth.getMonth();
  const currentYear = state.calendarYear;
  ui.monthSelect.innerHTML = monthNames.map((month, index) => `<option value="${index}" ${index === currentMonth ? "selected" : ""}>${month}</option>`).join("");
  // populate a compact year select (currentYear +/- 5)
  if (ui.yearSelect) {
    const start = currentYear - 5;
    const end = currentYear + 5;
    ui.yearSelect.innerHTML = Array.from({ length: end - start + 1 }, (_, i) => {
      const y = start + i;
      return `<option value="${y}" ${y === currentYear ? "selected" : ""}>${y}</option>`;
    }).join("");
  }

  if (state.calendarMode === "year") {
    ui.calendarGrid.innerHTML = monthNames.map((month, index) => {
      const active = index === currentMonth;
      const count = state.reminders.filter(reminder => reminder.dueDate.startsWith(`${currentYear}-${String(index + 1).padStart(2, "0")}`)).length;
      return `<button type="button" class="calendar-day ${active ? "active" : ""} year-month-cell" data-month="${index}">
        <span class="date-num">${month}</span>
        <span class="calendar-day-reminder">${count} reminders</span>
      </button>`;
    }).join("");
    return;
  }

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const numberOfCells = 42;
  const cells = [];

  for (let i = 0; i < firstDay; i += 1) cells.push('<div class="calendar-day"></div>');

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const remindersForDay = state.reminders.filter(reminder => reminder.dueDate === isoDate);
    const isSelected = state.selectedCalendarDate === isoDate;
    cells.push(`<button type="button" class="calendar-day current-month ${isSelected ? "active" : ""} ${remindersForDay.length ? "has-reminders" : ""}" data-date="${isoDate}"><span class="date-num">${day}</span>${remindersForDay.map(reminder => `<span class="calendar-day-reminder">${reminder.title}</span>`).join("")}</button>`);
  }

  while (cells.length < numberOfCells) cells.push('<div class="calendar-day"></div>');
  ui.calendarGrid.innerHTML = cells.join("");
  updateSelectedDateSummary();
}

function updateSelectedDateSummary() {
  if (!ui.selectedDateLabel || !ui.selectedDateReminders) return;
  if (!state.selectedCalendarDate) {
    ui.selectedDateLabel.textContent = "Select a date";
    ui.selectedDateReminders.innerHTML = '<p class="empty-state">Choose a date to view reminders.</p>';
    return;
  }
  const reminderItems = state.reminders.filter(reminder => reminder.dueDate === state.selectedCalendarDate);
  ui.selectedDateLabel.textContent = new Date(`${state.selectedCalendarDate}T00:00:00`).toLocaleDateString();
  if (!reminderItems.length) {
    ui.selectedDateReminders.innerHTML = '<p class="empty-state">No reminders attached to this date.</p>';
    return;
  }
  ui.selectedDateReminders.innerHTML = reminderItems.map(reminder => `
    <div class="reminder-item">
      <div>
        <strong>${reminder.title}</strong>
        <p>${getCustomerById(reminder.customerId)?.businessName || "Unknown customer"}</p>
        <div class="reminder-meta">
          <span>${formatDate(reminder.dueDate)}</span>
          <span>${reminder.completed ? "Completed" : "Open"}</span>
        </div>
        <p>${reminder.notes || "No notes"}</p>
      </div>
      <div class="reminder-actions">
        <button class="edit-btn" data-action="edit-reminder" data-id="${reminder.id}">Edit</button>
        <button class="complete-btn" data-action="toggle-reminder" data-id="${reminder.id}">${reminder.completed ? "Reopen" : "Complete"}</button>
        <button class="delete-btn" data-action="delete-reminder" data-id="${reminder.id}">Delete</button>
      </div>
    </div>`).join("");
}

function getFilteredNotifications() {
  const filter = state.notificationFilterType || "All";
  const filtered = state.notifications.filter(notification => {
    if (filter === "Unread") return !notification.read;
    if (filter === "Sales") return notification.type === "Sale Notification" || notification.source === "sale";
    if (filter === "Management") return notification.type === "Management Alert" || notification.recipientRole === "Management";
    if (["Print", "Design", "Digital", "Social", "Geofencing"].includes(filter)) return getNotificationCategory(notification) === filter;
    return true;
  });

  return sortNotifications(filtered);
}

function getNotificationCategory(notification) {
  const haystack = [
    notification.recipientRole,
    notification.type,
    notification.source,
    notification.title,
    notification.message
  ].join(" ").toLowerCase();
  if (haystack.includes("geofenc")) return "Geofencing";
  if (haystack.includes("social")) return "Social";
  if (haystack.includes("digital")) return "Digital";
  if (haystack.includes("design")) return "Design";
  if (haystack.includes("print")) return "Print";
  if (haystack.includes("management")) return "Management";
  if (haystack.includes("sale")) return "Sales";
  return "General";
}

function getNotificationPriorityRank(notification) {
  if (notification.priority === "High") return 3;
  if (notification.priority === "Normal") return 2;
  return 1;
}

function sortNotifications(notifications) {
  const sortType = state.notificationSortType || "Newest";
  return notifications.slice().sort((a, b) => {
    if (sortType === "Oldest") return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
    if (sortType === "Priority") {
      const priorityDifference = getNotificationPriorityRank(b) - getNotificationPriorityRank(a);
      if (priorityDifference) return priorityDifference;
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    }
    return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
  });
}

function getNotificationRelatedLabel(notification) {
  const customer = getCustomerById(notification.relatedCustomerId);
  const sale = getSaleById(notification.relatedId);
  if (customer && sale) return `${customer.businessName} - ${getSaleDisplayLabel(sale)}`;
  if (customer) return customer.businessName;
  if (sale) return `${sale.businessName || "Sale"} - ${getSaleDisplayLabel(sale)}`;
  return "No related record";
}

function getNotificationPreview(message) {
  const text = String(message || "No message").trim();
  return text.length > 132 ? `${text.slice(0, 129)}...` : text;
}

function renderNotificationFeed() {
  if (!ui.notificationFeed) return;
  const visibleNotifications = getFilteredNotifications();
  if (!visibleNotifications.length) {
    ui.notificationFeed.innerHTML = `<p class="empty-state">${state.notifications.length ? "No notifications match this filter." : "No notifications yet."}</p>`;
    return;
  }

  ui.notificationFeed.innerHTML = visibleNotifications.map(notification => {
    const sale = getSaleById(notification.relatedId);
    const relatedCustomerId = notification.relatedCustomerId || sale?.customerId || "";
    return `
    <div class="notification-item notification-row ${notification.priority === "High" ? "priority-high" : ""} ${notification.read ? "notification-read" : "notification-unread"}">
      <div class="notification-select-cell">
        <input type="checkbox" class="notification-select" aria-label="Select notification" value="${notification.id}" ${state.selectedNotificationIds.includes(notification.id) ? "checked" : ""} />
      </div>
      <div class="notification-priority-cell">
        <span class="priority-dot ${notification.priority === "High" ? "pink" : "blue"}"></span>
        ${notification.read ? "" : '<span class="unread-dot"></span>'}
      </div>
      <div class="notification-content-cell">
        <div class="notification-title-row">
          <strong>${notification.title}</strong>
          <span class="tag ${notification.read ? "active" : "unread"}">${notification.read ? "Read" : "Unread"}</span>
        </div>
        <p>${getNotificationPreview(notification.message)}</p>
        <div class="notification-meta">
          <span>${getNotificationCategory(notification)}</span>
          <span>${getNotificationRelatedLabel(notification)}</span>
          <span>${notification.createdAt ? formatDate(notification.createdAt.slice(0, 10)) : "N/A"}</span>
        </div>
      </div>
      <div class="notification-actions-cell">
        <button class="secondary-btn compact-action" data-action="toggle-notification-read" data-id="${notification.id}">${notification.read ? "Mark unread" : "Mark read"}</button>
        ${relatedCustomerId ? `<button class="info-btn compact-action" data-action="view-notification-customer" data-id="${notification.id}">Customer</button>` : ""}
        ${sale ? `<button class="info-btn compact-action" data-action="view-notification-sale" data-id="${notification.id}">Sale</button>` : ""}
        <button class="delete-btn compact-action" data-action="delete-notification" data-id="${notification.id}">Delete</button>
      </div>
    </div>`;
  }).join("");
}

function renderManagementActivityFeed() {
  if (!ui.managementActivityFeed) return;
  const activities = state.activities.slice(0, 8);
  if (!activities.length) {
    ui.managementActivityFeed.innerHTML = '<p class="empty-state">No management activity recorded yet.</p>';
    return;
  }
  ui.managementActivityFeed.innerHTML = activities.map(entry => `
    <div class="notification-item">
      <strong>${entry.title}</strong>
      <p>${entry.details}</p>
      <div class="notification-meta">
        <span>Type: ${entry.type}</span>
        <span>${formatDate(entry.timestamp.slice(0, 10))}</span>
      </div>
    </div>`).join("");
}

function renderReportsAnalytics() {
  const today = getTodayISO();
  const todaysSales = state.sales.filter(sale => sale.saleDate === today);
  const salesByRep = {};
  const salesByType = {};
  const salesTypeCounts = { Digital: 0, Print: 0, Mailer: 0 };

  state.sales.forEach(sale => {
    const categoryKey = getPrimaryCategoryCountKey(sale);
    salesByRep[sale.salesRepresentative] = (salesByRep[sale.salesRepresentative] || 0) + Number(sale.dollarAmount);
    const displayLabel = getSaleDisplayLabel(sale);
    salesByType[displayLabel] = (salesByType[displayLabel] || 0) + Number(sale.dollarAmount);
    if (categoryKey in salesTypeCounts) salesTypeCounts[categoryKey] += 1;
  });

  const upcomingReminders = state.reminders.filter(r => !r.completed).slice(0, 10);
  const recentWorkflowNotifications = state.notifications.filter(notification => !notification.archived).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const dailyActivity = state.activities.filter(activity => activity.timestamp.slice(0, 10) === today).slice(0, 6);

  const html = `
    <div class="management-summary-grid">
      <div class="report-card small"><span>Total Customers</span><strong>${state.customers.length}</strong></div>
      <div class="report-card small"><span>Total Sales</span><strong>${state.sales.length}</strong></div>
      <div class="report-card small"><span>Today's Sales</span><strong>${formatCurrency(todaysSales.reduce((sum, sale) => sum + Number(sale.dollarAmount), 0))}</strong></div>
      <div class="report-card small"><span>Open Reminders</span><strong>${state.reminders.filter(r => !r.completed).length}</strong></div>
    </div>
    <div class="management-details">
      <section class="data-card">
        <h4>Sales by Type</h4>
        <ul>
          <li>Digital: ${salesTypeCounts.Digital}</li>
          <li>Print: ${salesTypeCounts.Print}</li>
          <li>Mailer: ${salesTypeCounts.Mailer}</li>
        </ul>
      </section>
      <section class="data-card">
        <h4>Sales by Representative</h4>
        ${Object.keys(salesByRep).length ? `<ul>${Object.entries(salesByRep).map(([rep, amt]) => `<li>${rep}: ${formatCurrency(amt)}</li>`).join('')}</ul>` : '<p class="empty-state">No sales</p>'}
      </section>
      <section class="data-card">
        <h4>Recent Workflow Notifications</h4>
        ${recentWorkflowNotifications.length ? `<ul>${recentWorkflowNotifications.map(note => `<li>${formatDate(note.createdAt)} • ${note.title}</li>`).join('')}</ul>` : '<p class="empty-state">No workflow notifications</p>'}
      </section>
      <section class="data-card">
        <h4>Daily Sales Activity</h4>
        ${dailyActivity.length ? `<ul>${dailyActivity.map(item => `<li>${formatDate(item.timestamp.slice(0, 10))}: ${item.title}</li>`).join('')}</ul>` : '<p class="empty-state">No activity for today</p>'}
      </section>
    </div>`;

  if (ui.managementCustomerTable) ui.managementCustomerTable.innerHTML = html;
}

const REPORT_DATE_RANGES = [
  { key: "this-month", label: "This Month" },
  { key: "last-month", label: "Last Month" },
  { key: "last-30", label: "Last 30 Days" },
  { key: "this-year", label: "This Year" },
  { key: "all-time", label: "All Time" }
];

const REPORT_PRODUCT_TYPES = [
  "Mailers",
  "Print",
  "Social Media Management",
  "Paid Ads",
  "Geofencing",
  "Website Services"
];

function toLocalDate(dateString) {
  if (!dateString) return null;
  const parsed = new Date(String(dateString).includes("T") ? dateString : `${dateString}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getReportDateBounds(rangeKey = state.reportsDateRange) {
  const today = new Date(`${getTodayISO()}T00:00:00`);
  if (rangeKey === "last-month") {
    return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 0) };
  }
  if (rangeKey === "last-30") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { start, end: today };
  }
  if (rangeKey === "this-year") return { start: new Date(today.getFullYear(), 0, 1), end: today };
  if (rangeKey === "all-time") return { start: null, end: null };
  return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 0) };
}

function isDateInRange(dateString, bounds) {
  if (!bounds.start && !bounds.end) return true;
  const parsed = toLocalDate(dateString);
  if (!parsed) return false;
  if (bounds.start && parsed < bounds.start) return false;
  if (bounds.end && parsed > bounds.end) return false;
  return true;
}

function getReportSaleAmount(sale) {
  return Number(sale.dollarAmount || sale.digitalFinalTotal || sale.productDetails?.totalInvestment || sale.productDetails?.finalTotal || 0) || 0;
}

function getReportProductType(sale) {
  const category = sale.saleCategory || getSaleCategoryFromLegacyType(sale.saleType);
  const service = (sale.productDetails?.service || sale.saleType || "").trim();
  if (category === "Mailer") return "Mailers";
  if (category === "Print") return "Print";
  if (service === "Social Media Management") return "Social Media Management";
  if (service === "Paid Ads") return "Paid Ads";
  if (service === "Geofencing") return "Geofencing";
  if (service === "Website" || service === "Website Services") return "Website Services";
  if (category === "Digital") return "Digital";
  return category || "Digital";
}

function getReportScopedData() {
  const bounds = getReportDateBounds();
  return {
    sales: state.sales.filter(sale => isDateInRange(sale.saleDate || sale.createdAt, bounds)),
    customers: state.customers.filter(customer => isDateInRange(customer.dateCreated || customer.createdAt, bounds)),
    reminders: state.reminders.filter(reminder => isDateInRange(reminder.dueDate || reminder.createdAt, bounds))
  };
}

function renderReportKpiCard(label, value, note = "") {
  return `<div class="report-card report-kpi"><span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ""}</div>`;
}

function buildProductBreakdown(sales) {
  const breakdown = REPORT_PRODUCT_TYPES.reduce((acc, label) => {
    acc[label] = { count: 0, revenue: 0 };
    return acc;
  }, {});
  sales.forEach(sale => {
    const type = getReportProductType(sale);
    if (type === "Digital") return;
    if (!breakdown[type]) breakdown[type] = { count: 0, revenue: 0 };
    breakdown[type].count += 1;
    breakdown[type].revenue += getReportSaleAmount(sale);
  });
  return breakdown;
}

function renderProductBreakdown(breakdown, totalRevenue) {
  const maxRevenue = Math.max(...Object.values(breakdown).map(item => item.revenue), 1);
  return Object.entries(breakdown).map(([label, item]) => {
    const percent = totalRevenue ? (item.revenue / totalRevenue) * 100 : 0;
    const width = Math.max((item.revenue / maxRevenue) * 100, item.revenue ? 4 : 0);
    return `
      <div class="report-breakdown-row">
        <div class="report-breakdown-main">
          <strong>${label}</strong>
          <span>${item.count} sale${item.count === 1 ? "" : "s"} - ${formatCurrency(item.revenue)}</span>
        </div>
        <div class="report-bar-wrap">
          <div class="report-bar-track"><div class="report-bar-fill" style="width: ${width}%"></div></div>
          <small>${percent.toFixed(1)}%</small>
        </div>
      </div>`;
  }).join("");
}

function renderRevenueProductRows(breakdown, totalRevenue) {
  if (!totalRevenue) return '<p class="empty-state">No sales in this date range.</p>';
  return `
    <div class="table-wrap report-table-wrap">
      <table class="report-table">
        <thead><tr><th>Product Type</th><th>Revenue</th><th>% of Total</th></tr></thead>
        <tbody>
          ${Object.entries(breakdown).map(([label, item]) => {
            const percent = totalRevenue ? (item.revenue / totalRevenue) * 100 : 0;
            return `<tr><td>${label}</td><td>${formatCurrency(item.revenue)}</td><td><div class="report-percent-cell"><div class="report-bar-track"><div class="report-bar-fill" style="width: ${percent}%"></div></div><strong>${percent.toFixed(1)}%</strong></div></td></tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}

function renderSalesRepPerformance(sales) {
  const repMap = sales.reduce((acc, sale) => {
    const rep = sale.salesRepresentative || "Unassigned";
    if (!acc[rep]) acc[rep] = { count: 0, revenue: 0, lastSaleDate: "" };
    acc[rep].count += 1;
    acc[rep].revenue += getReportSaleAmount(sale);
    if (!acc[rep].lastSaleDate || String(sale.saleDate || "") > acc[rep].lastSaleDate) acc[rep].lastSaleDate = sale.saleDate || "";
    return acc;
  }, {});
  const rows = Object.entries(repMap).sort((a, b) => b[1].revenue - a[1].revenue);
  if (!rows.length) return '<p class="empty-state">No sales rep data exists for this date range.</p>';
  return `
    <div class="table-wrap report-table-wrap">
      <table class="report-table">
        <thead><tr><th>Sales Rep</th><th>Sales Count</th><th>Revenue</th><th>Average Sale</th><th>Last Sale Date</th></tr></thead>
        <tbody>
          ${rows.map(([rep, data]) => `<tr><td>${rep}</td><td>${data.count}</td><td>${formatCurrency(data.revenue)}</td><td>${formatCurrency(data.count ? data.revenue / data.count : 0)}</td><td>${data.lastSaleDate ? formatDate(data.lastSaleDate) : "N/A"}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function getCustomerInsights() {
  const customersWithSales = new Set(state.sales.map(sale => sale.customerId).filter(Boolean));
  const customersNeedingFollowUp = new Set([
    ...state.customers.filter(customer => customer.customerStatus === "Prospect" && !customersWithSales.has(customer.id)).map(customer => customer.id),
    ...getOpenReminders().filter(reminder => reminder.dueDate < getTodayISO()).map(reminder => reminder.customerId),
    ...state.customers.filter(customer => customer.customerStatus !== "Closed" && daysSince(customer.lastContactDate || customer.dateCreated) > 30).map(customer => customer.id)
  ].filter(Boolean));
  return [
    ["Total Customers", state.customers.length],
    ["Prospect Customers", state.customers.filter(customer => customer.customerStatus === "Prospect").length],
    ["Active Customers", state.customers.filter(customer => customer.customerStatus === "Active").length],
    ["Closed Customers", state.customers.filter(customer => customer.customerStatus === "Closed").length],
    ["Customers With No Sales", state.customers.filter(customer => !customersWithSales.has(customer.id)).length],
    ["Customers Needing Follow-Up", customersNeedingFollowUp.size]
  ];
}

function getReportFollowUpOpportunities() {
  const today = getTodayISO();
  const recentSalesWithoutReminder = sortByDateDesc(state.sales, "saleDate").filter(sale => daysSince(sale.saleDate) <= 14 && !hasOpenReminderForCustomer(sale.customerId));
  const opportunities = [
    ...state.customers.filter(customer => customer.customerStatus === "Prospect" && !hasSaleForCustomer(customer.id)).map(customer => ({ label: "Prospect", customer, detail: `No sale logged. Assigned to ${customer.assignedSalesRepresentative || "Unassigned"}.` })),
    ...getOpenReminders().filter(reminder => reminder.dueDate < today).map(reminder => ({ label: "Overdue", customer: getCustomerById(reminder.customerId), detail: `${reminder.title} was due ${formatDate(reminder.dueDate)}.` })).filter(item => item.customer),
    ...state.customers.filter(customer => customer.customerStatus !== "Closed" && daysSince(customer.lastContactDate || customer.dateCreated) > 30).map(customer => ({ label: "Idle", customer, detail: `No recorded activity in ${daysSince(customer.lastContactDate || customer.dateCreated)} days.` })),
    ...recentSalesWithoutReminder.map(sale => ({ label: "Post-sale", customer: getCustomerById(sale.customerId), saleId: sale.id, detail: `${getSaleDisplayLabel(sale)} closed ${formatDate(sale.saleDate)} with no open reminder.` })).filter(item => item.customer)
  ];
  const seen = new Set();
  return opportunities.filter(item => {
    const key = `${item.label}-${item.customer.id}-${item.saleId || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

function renderFollowUpOpportunities() {
  const opportunities = getReportFollowUpOpportunities();
  if (!opportunities.length) return '<p class="empty-state">No customer activity needs attention right now.</p>';
  return opportunities.map(item => `
    <div class="compact-row-card">
      <div class="compact-row-main">
        <span class="tag">${item.label}</span>
        <strong>${item.customer.businessName}</strong>
        <small>${item.detail}</small>
      </div>
      <div class="compact-row-actions">
        <button class="info-btn compact-action" data-action="view-customer-orders" data-id="${item.customer.id}">View Customer</button>
        <button class="secondary-btn compact-action" data-action="add-reminder-for-customer" data-id="${item.customer.id}">Add Reminder</button>
        <button class="secondary-btn compact-action" data-action="add-sale-for-customer" data-id="${item.customer.id}">Add Sale</button>
      </div>
    </div>`).join("");
}

function getProductionWorkload(sales) {
  return sales.reduce((workload, sale) => {
    const settings = getSaleNotificationSettings(sale);
    const productType = getReportProductType(sale);
    if (settings.notifyPrintTeam || productType === "Mailers" || productType === "Print") workload["Print Team"] += 1;
    if (settings.notifyDesigners || sale.designRequired === "Yes" || sale.designChangeRequired === "Yes") workload.Designers += 1;
    if (settings.notifyDigitalTeam || ["Digital", "Paid Ads", "Website Services", "Geofencing"].includes(productType)) workload["Digital Team"] += 1;
    if (settings.notifySocialMediaTeam || productType === "Social Media Management") workload["Social Media Team"] += 1;
    if (settings.notifyGeofencing || productType === "Geofencing") workload.Geofencing += 1;
    return workload;
  }, { "Print Team": 0, Designers: 0, "Digital Team": 0, "Social Media Team": 0, Geofencing: 0 });
}

function renderModernReportsAnalytics() {
  const scopedData = getReportScopedData();
  const sales = scopedData.sales;
  const totalRevenue = sales.reduce((sum, sale) => sum + getReportSaleAmount(sale), 0);
  const averageSale = sales.length ? totalRevenue / sales.length : 0;
  const activeCustomerIds = new Set(sales.map(sale => sale.customerId).filter(Boolean));
  const breakdown = buildProductBreakdown(sales);
  const customerInsights = getCustomerInsights();
  const workload = getProductionWorkload(sales);
  const selectedRangeLabel = REPORT_DATE_RANGES.find(range => range.key === state.reportsDateRange)?.label || "This Month";

  const html = `
    <div class="reports-shell">
      <div class="reports-hero">
        <div>
          <p class="eyebrow">Reports &amp; Analytics</p>
          <h2>Reports &amp; Analytics</h2>
          <p class="panel-help">Track sales performance, customer activity, and production workload.</p>
        </div>
        <div class="report-range-controls" aria-label="Report date range">
          ${REPORT_DATE_RANGES.map(range => `<button type="button" class="report-range-btn ${state.reportsDateRange === range.key ? "active" : ""}" data-report-range="${range.key}">${range.label}</button>`).join("")}
        </div>
      </div>

      <div class="report-kpi-grid">
        ${renderReportKpiCard("Total Revenue", formatCurrency(totalRevenue), selectedRangeLabel)}
        ${renderReportKpiCard("Sales Count", sales.length, "Sales records")}
        ${renderReportKpiCard("Average Sale Value", formatCurrency(averageSale), "Revenue per sale")}
        ${renderReportKpiCard("Active Customers", activeCustomerIds.size, "Customers buying")}
        ${renderReportKpiCard("New Customers", scopedData.customers.length, selectedRangeLabel)}
        ${renderReportKpiCard("Open Reminders", scopedData.reminders.filter(reminder => !reminder.completed).length, "Open in range")}
      </div>

      <div class="reports-two-column">
        <section class="data-card report-section-card">
          <div class="section-header-row"><div><p class="eyebrow">Sales Breakdown</p><h3>Sales by product category</h3></div></div>
          <div class="report-breakdown-list">${sales.length ? renderProductBreakdown(breakdown, totalRevenue) : '<p class="empty-state">No sales in this date range.</p>'}</div>
        </section>
        <section class="data-card report-section-card">
          <div class="section-header-row"><div><p class="eyebrow">Product Mix</p><h3>Revenue by Product Type</h3></div></div>
          ${renderRevenueProductRows(breakdown, totalRevenue)}
        </section>
      </div>

      <section class="data-card report-section-card">
        <div class="section-header-row"><div><p class="eyebrow">Sales Team</p><h3>Sales Rep Performance</h3></div></div>
        ${renderSalesRepPerformance(sales)}
      </section>

      <div class="reports-two-column">
        <section class="data-card report-section-card">
          <div class="section-header-row"><div><p class="eyebrow">Customer Insights</p><h3>Pipeline health</h3></div></div>
          <div class="customer-insight-grid">${customerInsights.map(([label, value]) => `<div class="insight-mini-card"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
          ${state.customers.length ? "" : '<p class="empty-state">No customer activity yet.</p>'}
        </section>
        <section class="data-card report-section-card">
          <div class="section-header-row"><div><p class="eyebrow">Operations</p><h3>Production Workload</h3></div></div>
          <div class="workload-grid">${Object.entries(workload).map(([label, count]) => `<div class="workload-card"><span>${label}</span><strong>${count}</strong><small>${count === 1 ? "item" : "items"} in range</small></div>`).join("")}</div>
          ${Object.values(workload).some(Boolean) ? "" : '<p class="empty-state">No production workload available.</p>'}
        </section>
      </div>

      <section class="data-card report-section-card">
        <div class="section-header-row"><div><p class="eyebrow">Follow-Up Opportunities</p><h3>Customers needing attention</h3></div></div>
        <div class="compact-list">${renderFollowUpOpportunities()}</div>
      </section>
    </div>`;

  if (ui.managementCustomerTable) ui.managementCustomerTable.innerHTML = html;
}

function getCurrentMonthSales() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return state.sales.filter(sale => {
    const saleDate = new Date(`${sale.saleDate || ""}T00:00:00`);
    return !Number.isNaN(saleDate.getTime()) && saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
}

function getOpenReminders() {
  return state.reminders.filter(reminder => !reminder.completed);
}

function sortByDateDesc(rows, field) {
  return rows.slice().sort((a, b) => String(b[field] || "").localeCompare(String(a[field] || "")));
}

function daysSince(dateString) {
  if (!dateString) return Infinity;
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return Infinity;
  const today = new Date(`${getTodayISO()}T00:00:00`);
  return Math.floor((today - date) / 86400000);
}

function hasOpenReminderForCustomer(customerId) {
  return state.reminders.some(reminder => reminder.customerId === customerId && !reminder.completed);
}

function hasSaleForCustomer(customerId) {
  return state.sales.some(sale => sale.customerId === customerId);
}

function getProductMix() {
  return state.sales.reduce((mix, sale) => {
    const label = getSaleDisplayLabel(sale) || "Unknown";
    if (!mix[label]) mix[label] = { count: 0, revenue: 0 };
    mix[label].count += 1;
    mix[label].revenue += Number(sale.dollarAmount) || 0;
    return mix;
  }, {});
}

function renderEmptyDashboardState(message) {
  return `<p class="empty-state">${message}</p>`;
}

function renderDashboardFocus(today, openReminders, recentSalesWithoutReminder, staleCustomers) {
  if (!ui.dashboardFocusList) return;
  const todayReminders = openReminders.filter(reminder => reminder.dueDate === today);
  const overdueReminders = openReminders.filter(reminder => reminder.dueDate < today);
  const weekEnd = getNextDate(7);
  const thisWeekReminders = openReminders.filter(reminder => reminder.dueDate > today && reminder.dueDate <= weekEnd);
  const focusItems = [];

  if (overdueReminders.length) {
    focusItems.push({
      tone: "urgent",
      title: `${overdueReminders.length} overdue reminder${overdueReminders.length === 1 ? "" : "s"}`,
      text: `${getCustomerById(overdueReminders[0].customerId)?.businessName || "A customer"} needs follow-up.`,
      action: `<button class="secondary-btn compact-action" data-view="reminders">Review</button>`
    });
  }

  if (todayReminders.length) {
    focusItems.push({
      tone: "today",
      title: `${todayReminders.length} reminder${todayReminders.length === 1 ? "" : "s"} due today`,
      text: todayReminders.slice(0, 2).map(reminder => reminder.title).join(", "),
      action: `<button class="secondary-btn compact-action" data-view="reminders">Open calendar</button>`
    });
  }

  if (thisWeekReminders.length) {
    focusItems.push({
      tone: "week",
      title: `${thisWeekReminders.length} reminder${thisWeekReminders.length === 1 ? "" : "s"} due this week`,
      text: `${thisWeekReminders[0].title} for ${getCustomerById(thisWeekReminders[0].customerId)?.businessName || "a customer"}.`,
      action: `<button class="secondary-btn compact-action" data-view="reminders">Review week</button>`
    });
  }

  if (recentSalesWithoutReminder.length) {
    const sale = recentSalesWithoutReminder[0];
    focusItems.push({
      tone: "sale",
      title: "Recent sale needs a follow-up reminder",
      text: `${sale.businessName} - ${getSaleDisplayLabel(sale)} on ${formatDate(sale.saleDate)}.`,
      action: `<button class="secondary-btn compact-action" data-action="reorder-sale" data-id="${sale.id}">Reorder</button>`
    });
  }

  if (staleCustomers.length) {
    focusItems.push({
      tone: "idle",
      title: `${staleCustomers.length} customer${staleCustomers.length === 1 ? "" : "s"} with no recent activity`,
      text: `${staleCustomers[0].businessName} has been idle for ${daysSince(staleCustomers[0].lastContactDate)} days.`,
      action: `<button class="secondary-btn compact-action" data-view="customers">View customers</button>`
    });
  }

  if (!focusItems.length) {
    ui.dashboardFocusList.innerHTML = renderEmptyDashboardState(state.customers.length ? "No reminders due today." : "Add a customer to begin tracking activity.");
    return;
  }

  ui.dashboardFocusList.innerHTML = focusItems.map(item => `
    <div class="action-item ${item.tone}">
      <div>
        <strong>${item.title}</strong>
        <p>${item.text}</p>
      </div>
      ${item.action}
    </div>`).join("");
}

function renderDashboardRecentSales() {
  if (!ui.dashboardRecentSales) return;
  const recentSales = sortByDateDesc(state.sales, "saleDate").slice(0, 5);
  if (!recentSales.length) {
    ui.dashboardRecentSales.innerHTML = `
      <div class="sales-empty-state mini">
        <strong>No recent sales yet.</strong>
        <span>Create a sale to begin tracking customer activity.</span>
      </div>`;
    return;
  }
  const viewAllAction = state.sales.length > recentSales.length
    ? '<button class="secondary-btn compact-action dashboard-view-all-sales" data-view="sales">View all sales</button>'
    : "";
  ui.dashboardRecentSales.innerHTML = `
    <div class="dashboard-recent-sales-list">
      ${recentSales.map(sale => `
      <div class="recent-sale-row">
        <div class="recent-sale-main">
          <strong>${sale.businessName || "Unknown customer"}</strong>
          <span>${getSaleDisplayLabel(sale)}</span>
        </div>
        <div class="recent-sale-meta">
          <strong class="recent-sale-total">${formatCurrency(sale.dollarAmount)}</strong>
          <span>${formatDate(sale.saleDate)}</span>
        </div>
      </div>`).join("")}
    </div>
    ${viewAllAction}`;
}

function renderDashboardFollowUpQueue(recentSalesWithoutReminder, staleCustomers) {
  if (!ui.dashboardFollowUpQueue) return;
  const prospectsWithoutSale = state.customers.filter(customer => customer.customerStatus === "Prospect" && !hasSaleForCustomer(customer.id)).slice(0, 3);
  const customersWithOverdueReminders = getOpenReminders()
    .filter(reminder => reminder.dueDate < getTodayISO())
    .map(reminder => ({ customer: getCustomerById(reminder.customerId), reminder }))
    .filter(item => item.customer)
    .slice(0, 3);
  const queueItems = [
    ...prospectsWithoutSale.map(customer => ({
      label: "Prospect",
      title: customer.businessName,
      detail: `No sale logged. Assigned to ${customer.assignedSalesRepresentative || "Unassigned"}.`,
      action: `<button class="info-btn compact-action" data-action="edit-customer" data-id="${customer.id}">Open</button>`
    })),
    ...customersWithOverdueReminders.map(({ customer, reminder }) => ({
      label: "Overdue",
      title: customer.businessName,
      detail: `${reminder.title} was due ${formatDate(reminder.dueDate)}.`,
      action: `<button class="complete-btn compact-action" data-action="toggle-reminder" data-id="${reminder.id}">Complete</button>`
    })),
    ...recentSalesWithoutReminder.slice(0, 3).map(sale => ({
      label: "Post-sale",
      title: sale.businessName,
      detail: `${getSaleDisplayLabel(sale)} closed ${formatDate(sale.saleDate)} with no open reminder.`,
      action: `<button class="secondary-btn compact-action" data-view="reminders">Add reminder</button>`
    })),
    ...staleCustomers.slice(0, 2).map(customer => ({
      label: "Idle",
      title: customer.businessName,
      detail: `No recorded activity in ${daysSince(customer.lastContactDate)} days.`,
      action: `<button class="info-btn compact-action" data-action="edit-customer" data-id="${customer.id}">Open</button>`
    }))
  ].slice(0, 7);

  if (!queueItems.length) {
    ui.dashboardFollowUpQueue.innerHTML = renderEmptyDashboardState(state.customers.length ? "No customers need follow-up right now." : "Add a customer to begin tracking activity.");
    return;
  }

  ui.dashboardFollowUpQueue.innerHTML = queueItems.map(item => `
    <div class="compact-row-card">
      <div class="compact-row-main">
        <span class="tag">${item.label}</span>
        <strong>${item.title}</strong>
        <small>${item.detail}</small>
      </div>
      <div class="compact-row-actions">${item.action}</div>
    </div>`).join("");
}

function renderDashboardPipelineSnapshot() {
  if (!ui.dashboardPipelineSnapshot) return;
  const counts = {
    Prospect: state.customers.filter(customer => customer.customerStatus === "Prospect").length,
    Active: state.customers.filter(customer => customer.customerStatus === "Active").length,
    Closed: state.customers.filter(customer => customer.customerStatus === "Closed").length
  };
  const maxCount = Math.max(counts.Prospect, counts.Active, counts.Closed, 1);
  const productMix = Object.entries(getProductMix()).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

  ui.dashboardPipelineSnapshot.innerHTML = `
    <div class="pipeline-bars">
      ${Object.entries(counts).map(([label, count]) => `
        <div class="pipeline-bar-row">
          <span>${label}</span>
          <div class="pipeline-bar-track"><div class="pipeline-bar-fill ${label.toLowerCase()}" style="width: ${(count / maxCount) * 100}%"></div></div>
          <strong>${count}</strong>
        </div>`).join("")}
    </div>
    <div class="product-mix">
      <h4>Sales by product type</h4>
      ${productMix.length ? productMix.map(([label, data]) => `
        <div class="product-mix-row">
          <span>${label}</span>
          <strong>${data.count} sale${data.count === 1 ? "" : "s"} - ${formatCurrency(data.revenue)}</strong>
        </div>`).join("") : renderEmptyDashboardState("No sales by product type yet.")}
    </div>`;
}

function renderDashboardStats() {
  const today = getTodayISO();
  const monthlySalesRows = getCurrentMonthSales();
  const monthlyRevenue = monthlySalesRows.reduce((sum, sale) => sum + Number(sale.dollarAmount), 0);
  const openReminders = getOpenReminders();
  const recentSalesWithoutReminder = sortByDateDesc(state.sales, "saleDate")
    .filter(sale => daysSince(sale.saleDate) <= 14 && !hasOpenReminderForCustomer(sale.customerId));
  const staleCustomers = state.customers
    .filter(customer => customer.customerStatus !== "Closed" && daysSince(customer.lastContactDate) > 30)
    .sort((a, b) => daysSince(b.lastContactDate) - daysSince(a.lastContactDate));

  if (ui.dashboardCustomerCount) ui.dashboardCustomerCount.textContent = String(state.customers.length);
  if (ui.dashboardActiveCustomerCount) ui.dashboardActiveCustomerCount.textContent = String(state.customers.filter(customer => customer.customerStatus === "Active").length);
  if (ui.dashboardReminderCount) ui.dashboardReminderCount.textContent = String(openReminders.length);
  if (ui.dashboardMonthlySaleCount) ui.dashboardMonthlySaleCount.textContent = String(monthlySalesRows.length);
  if (ui.dashboardMonthlySales) ui.dashboardMonthlySales.textContent = formatCurrency(monthlyRevenue);

  renderDashboardFocus(today, openReminders, recentSalesWithoutReminder, staleCustomers);
  renderDashboardRecentSales();
  renderDashboardFollowUpQueue(recentSalesWithoutReminder, staleCustomers);
  renderDashboardPipelineSnapshot();
}

function renderRoleAccess() {
  if (!ui.roleAccessList) return;
  ui.roleAccessList.innerHTML = (ROLE_ACCESS[state.currentRole] || []).map(item => `<li>${item}</li>`).join("");
}

function renderCurrentUser() {
  if (ui.currentUserName) ui.currentUserName.textContent = state.currentUserName || "Sunny";
  if (ui.currentUserRoleLabel) ui.currentUserRoleLabel.textContent = `Role: ${state.currentRole || "Sales Staff"}`;
}

function renderView(viewKey) {
  state.activeView = viewKey;
  document.querySelectorAll(".content-panel").forEach(panel => panel.classList.remove("active-panel"));
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  const panel = document.getElementById(viewKey);
  if (panel) panel.classList.add("active-panel");
  const navBtn = document.querySelector(`[data-view="${viewKey}"]`);
  if (navBtn) navBtn.classList.add("active");
}

// renderCustomerDetail removed — Customer Detail view deleted

function startReminderForCustomer(customerId) {
  const customer = getCustomerById(customerId);
  if (!customer) return;
  clearReminderForm();
  if (ui.reminderCustomer) ui.reminderCustomer.value = customer.id;
  if (ui.reminderDate) ui.reminderDate.value = getNextDate(1);
  renderView("reminders");
  if (ui.reminderTitle) ui.reminderTitle.focus();
}

function startSaleForCustomer(customerId) {
  const customer = getCustomerById(customerId);
  if (!customer) return;
  clearSaleForm();
  if (ui.saleCustomer) ui.saleCustomer.value = customer.id;
  renderView("sales");
  if (ui.saleCategory) ui.saleCategory.focus();
}

function handleDocumentClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  if (action === "view-customer-orders") openCustomerOrderHistory(target.dataset.id);
  if (action === "edit-customer") editCustomer(target.dataset.id);
  if (action === "delete-customer") deleteCustomer(target.dataset.id);
  if (action === "edit-sale") editSale(target.dataset.id);
  if (action === "delete-sale") deleteSale(target.dataset.id);
  if (action === "reorder-sale") reorderSale(target.dataset.id);
  if (action === "view-order-details") renderOrderDetailPanel(target.dataset.id);
  if (action === "download-agreement") {
    const sale = getSaleById(target.dataset.id);
    if (sale) downloadAgreementPdf(sale, getCustomerById(sale.customerId));
  }
  if (action === "view-notification-customer") viewNotificationCustomer(target.dataset.id);
  if (action === "view-notification-sale") viewNotificationSale(target.dataset.id);
  if (action === "toggle-reminder") toggleReminderComplete(target.dataset.id);
  if (action === "delete-reminder") deleteReminder(target.dataset.id);
  if (action === "mark-notification-read") markNotificationRead(target.dataset.id);
  if (action === "toggle-notification-read") toggleNotificationRead(target.dataset.id);
  if (action === "delete-notification") deleteNotification(target.dataset.id);
  if (action === "edit-customer-note") editCustomerNote(target.dataset.id);
  if (action === "delete-customer-note") deleteCustomerNote(target.dataset.id);
  if (action === "edit-reminder") editReminder(target.dataset.id);
  if (action === "delete-communication") deleteCustomerCommunication(target.dataset.id);
  if (action === "add-reminder-for-customer") startReminderForCustomer(target.dataset.id);
  if (action === "add-sale-for-customer") startSaleForCustomer(target.dataset.id);

  // Calendar day clicked: select date and update summary
  // Use closest() to find parent button with data-date, handles clicks on child elements like .date-num or .calendar-day-reminder
  const calendarDayBtn = target.closest("[data-date]");
  if (calendarDayBtn) {
    state.selectedCalendarDate = calendarDayBtn.dataset.date;
    state.activeView = "reminders";
    renderCalendar();
    updateSelectedDateSummary();
    // prefill reminder form date if present
    if (ui.reminderDate) ui.reminderDate.value = state.selectedCalendarDate;
    // show reminders panel
    renderView("reminders");
    return;
  }

  // If a reminder item in selected-date list is clicked and has action data-attr, let action handler above pick it up.

  if (target.matches(".nav-btn")) renderView(target.dataset.view);
  if (target.matches("[data-view]")) renderView(target.dataset.view);
  if (target.dataset.reportRange) {
    state.reportsDateRange = target.dataset.reportRange;
    renderModernReportsAnalytics();
    persistState();
  }
}

function handleDocumentChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.classList.contains("notification-select")) {
    if (target.checked) {
      state.selectedNotificationIds = [...new Set([...state.selectedNotificationIds, target.value])];
    } else {
      state.selectedNotificationIds = state.selectedNotificationIds.filter(id => id !== target.value);
    }
    renderNotificationFeed();
  }
}

function handleFilterChange() {
  state.filters.search = ui.customerSearch.value.trim();
  state.filters.customerStatus = ui.customerStatusFilter.value;
  state.filters.representative = ui.representativeFilter.value;
  state.filters.sortField = ui.customerSortField.value;
  state.filters.sortDirection = ui.customerSortDirection.value;
  renderCustomerTable();
}

function bindEvents() {
  function on(el, ev, fn) { if (!el) return; el.addEventListener(ev, fn); }
  on(ui.currentRole, "change", (event) => { state.currentRole = event.target.value; renderRoleAccess(); renderCurrentUser(); persistState(); });
  on(ui.customerForm, "submit", addCustomer);
  on(ui.saleForm, "submit", addSale);
  on(ui.saleCategory, "change", () => {
    updateSaleFormVisibility();
    // ensure payment method UI is consistent when sale type changes
    updatePaymentMethodVisibility(ui.salePaymentMethod?.value || "");
    updateNotificationRecommendations();
    calculateMailerPricing();
    calculateDigitalPricing();
    calculatePrintPricing();
  });
  on(ui.saleMailerAdSize, "change", calculateMailerPricing);
  on(ui.saleMailerRunTime, "change", calculateMailerPricing);
  on(ui.saleMailerDiscountType, "change", calculateMailerPricing);
  on(ui.saleMailerDiscountValue, "input", calculateMailerPricing);
  on(ui.saleDigitalService, "change", () => {
    updateDigitalServiceVisibility(ui.saleDigitalService.value);
    updatePaidAdsOtherVisibility();
    updateNotificationRecommendations();
    calculateDigitalPricing();
  });
  on(ui.salePrintProjectPrice, "input", calculatePrintPricing);
  on(ui.salePrintDiscountType, "change", calculatePrintPricing);
  on(ui.salePrintDiscountValue, "input", calculatePrintPricing);
  on(ui.salePaidAdsPlatforms, "change", () => {
    updatePaidAdsOtherVisibility();
  });
  on(ui.salePrintType, "change", () => {
    updatePrintDescriptionLabel(ui.salePrintType.value);
    updateNotificationRecommendations();
    // recalc mailing visibility when print service changes
    updateSaleFormVisibility(ui.saleCategory?.value, { printType: ui.salePrintType?.value });
    calculatePrintPricing();
  });
  on(ui.salePrintFinish, "change", updateOtherFinishVisibility);
  on(ui.salePrintThickness, "change", updateOtherThicknessVisibility);
  on(ui.salePaymentMethod, "change", () => {
    updatePaymentMethodVisibility(ui.salePaymentMethod.value);
  });
  on(ui.designRequired, "change", () => {
    calculateMailerPricing();
    updatePrintDesignFeeVisibility();
  });
  on(ui.designChangeRequired, "change", () => {
    calculateMailerPricing();
    updatePrintDesignFeeVisibility();
  });
  on(ui.salePrintDesignFee, "input", calculatePrintPricing);
  on(ui.saleDigitalServicePrice, "input", calculateDigitalPricing);
  on(ui.saleDigitalDiscountType, "change", calculateDigitalPricing);
  on(ui.saleDigitalDiscountValue, "input", calculateDigitalPricing);


  on(ui.saleEditForm, "submit", saveSaleEdit);
  on(ui.reminderForm, "submit", addReminder);
  on(ui.customerSearch, "input", handleFilterChange);
  on(ui.customerStatusFilter, "change", handleFilterChange);
  on(ui.representativeFilter, "change", handleFilterChange);
  on(ui.customerSortField, "change", handleFilterChange);
  on(ui.customerSortDirection, "change", handleFilterChange);
  on(ui.clearCustomerForm, "click", clearCustomerForm);
  on(ui.clearSaleForm, "click", clearSaleForm);
  on(ui.sendAgreementPackageBtn, "click", () => {
    const sale = getSaleById(state.saleConfirmationSaleId);
    if (sale) initiateAgreementPackageWorkflow(sale);
  });
  on(ui.downloadAgreementBtn, "click", () => {
    const sale = getSaleById(state.saleConfirmationSaleId);
    if (sale) downloadAgreementPdf(sale, getCustomerById(sale.customerId));
  });
  on(ui.returnToCRMBtn, "click", () => { renderView("sales"); });
  on(ui.returnToCRMAfterPackageBtn, "click", () => { renderView("sales"); });
  on(ui.clearReminderForm, "click", clearReminderForm);
  on(ui.cancelSaleEdit, "click", clearSaleEditForm);
  on(ui.sendTestEmail, "click", () => {
    console.log('[CRM][Email] sendTestEmail button clicked');
    postEmailNotification('send-test-email', {}).then(response => {
      if (!response) return;
      console.log('[CRM][Email] sendTestEmail completed', { status: response.status });
    });
  });
  // Developer Panel toggle
  if (ui.devPanelToggle && ui.devPanelContent) {
    ui.devPanelToggle.addEventListener('click', () => {
      ui.devPanelContent.classList.toggle('active');
    });
  }
  on(ui.monthViewBtn, "click", () => { state.calendarMode = "month"; renderCalendar(); ui.monthViewBtn?.classList.add("active"); ui.yearViewBtn?.classList.remove("active"); });
  on(ui.yearViewBtn, "click", () => { state.calendarMode = "year"; renderCalendar(); ui.yearViewBtn?.classList.add("active"); ui.monthViewBtn?.classList.remove("active"); });
  on(ui.prevMonth, "click", () => { state.calendarMonth = new Date(state.calendarYear, state.calendarMonth.getMonth() - 1, 1); state.calendarYear = state.calendarMonth.getFullYear(); renderCalendar(); renderReminderList(); persistState(); });
  on(ui.nextMonth, "click", () => { state.calendarMonth = new Date(state.calendarYear, state.calendarMonth.getMonth() + 1, 1); state.calendarYear = state.calendarMonth.getFullYear(); renderCalendar(); renderReminderList(); persistState(); });
  on(ui.prevYear, "click", () => { state.calendarYear -= 1; state.calendarMonth = new Date(state.calendarYear, state.calendarMonth.getMonth(), 1); renderCalendar(); renderReminderList(); persistState(); });
  on(ui.nextYear, "click", () => { state.calendarYear += 1; state.calendarMonth = new Date(state.calendarYear, state.calendarMonth.getMonth(), 1); renderCalendar(); renderReminderList(); persistState(); });
  on(ui.monthSelect, "change", (event) => { state.calendarMonth = new Date(state.calendarYear, Number(event.target.value), 1); renderCalendar(); renderReminderList(); persistState(); });
  on(ui.yearSelect, "change", (event) => { state.calendarYear = Number(event.target.value); state.calendarMonth = new Date(state.calendarYear, state.calendarMonth.getMonth(), 1); renderCalendar(); renderReminderList(); persistState(); });
  on(ui.deleteSelectedNotifications, "click", deleteSelectedNotifications);
  on(ui.clearAllNotifications, "click", clearAllNotifications);
  on(ui.notificationFilterType, "change", () => { state.notificationFilterType = ui.notificationFilterType.value; renderNotificationFeed(); persistState(); });
  on(ui.notificationSortType, "change", () => { state.notificationSortType = ui.notificationSortType.value; renderNotificationFeed(); persistState(); });
  // customer-detail form listeners removed
  on(ui.resetDemoData, "click", () => {
    showConfirmModal("Reset demo data? This will clear local demo state and restore default sample data.", () => {
      clearDemoStorage();
      normalizeStateData();
      renderAll();
      showSuccess("Demo data reset.");
    });
  });
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("change", handleDocumentChange);
}

// customer-detail update helper removed

function renderAll() {
  ensureCustomerOptions();
  renderCustomerTable();
  if (state.currentCustomerId) renderCustomerDetailPanel(state.currentCustomerId);
  renderSalesTable();
  renderCalendar();
  renderReminderList();
  renderNotificationFeed();
  renderModernReportsAnalytics();
  renderManagementActivityFeed();
  renderDashboardStats();
  renderRoleAccess();
  renderCurrentUser();
  updateSummaryMetrics();
  persistState();
}

function updateSummaryMetrics() {
  ui.customerCount.textContent = String(state.customers.length);
  ui.reminderCount.textContent = String(state.reminders.filter(reminder => !reminder.completed).length);
  ui.notificationCount.textContent = String(state.notifications.filter(notification => !notification.archived).length);
}

function initializeApp() {
  normalizeStateData();
  clearSaleForm();
  clearReminderForm();
  bindEvents();
  try { wireMultiSelectBehavior(); } catch (e) { /* ignore if elements missing */ }
  try { wireCompactUI(); } catch (e) { /* ignore if elements missing */ }
  // Sync filter UI values from state before rendering
  if (ui.customerSearch) ui.customerSearch.value = state.filters.search;
  if (ui.customerStatusFilter) ui.customerStatusFilter.value = state.filters.customerStatus;
  if (ui.representativeFilter) ui.representativeFilter.value = state.filters.representative;
  if (ui.customerSortField) ui.customerSortField.value = state.filters.sortField;
  if (ui.customerSortDirection) ui.customerSortDirection.value = state.filters.sortDirection;
  if (ui.notificationFilterType) ui.notificationFilterType.value = state.notificationFilterType;
  if (ui.notificationSortType) ui.notificationSortType.value = state.notificationSortType;
  renderAll();
  ui.currentRole.value = state.currentRole;
  renderView(state.activeView || "dashboard");
  // Customer Detail disabled — no detail view to initialize
  // Initialize signature pad and wire its buttons
  try { initSignaturePad(); } catch (e) { /* ignore if canvas missing */ }
  try { wireSignatureButtons(); } catch (e) { /* ignore */ }
  // Ensure print-related conditional fields are correctly shown/hidden on init
  try { updatePrintDescriptionLabel(ui.salePrintType?.value); } catch (e) {}
  try { updateOtherFinishVisibility(); } catch (e) {}
  try { updateOtherThicknessVisibility(); } catch (e) {}
}

function wireCompactUI() {
  const toggles = document.querySelectorAll('.collapse-toggle');
  toggles.forEach(btn => {
    const targetId = btn.dataset.target;
    const target = document.getElementById(targetId);
    if (!target) return;
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      target.classList.toggle('hidden');
      // small visual change: flip arrow
      btn.textContent = !expanded ? 'Optional Design Services ▴' : 'Optional Design Services ▾';
    });
  });
}

initializeApp();
