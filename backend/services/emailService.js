const { Resend } = require('resend');
const path = require('path');
const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

console.log('[emailService] dotenv loaded:', {
  parsed: dotenvResult.parsed ? Object.keys(dotenvResult.parsed) : null,
  error: dotenvResult.error ? dotenvResult.error.message : null,
  hasResendKey: Boolean(process.env.RESEND_API_KEY)
});

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

if (!resendApiKey) {
  console.warn('[emailService] Warning: RESEND_API_KEY is not configured. Email sending will fail until the key is added to backend/.env');
}

const DEFAULT_FROM = 'onboarding@resend.dev';
const MANAGEMENT_TO = 'paeksunny@gmail.com';
const DESIGN_TO = 'paeksunny@gmail.com';
const SOCIAL_TO = 'paeksunny@gmail.com';
const PRINT_TO = 'paeksunny@gmail.com';
const DIGITAL_TO = 'paeksunny@gmail.com';
const GEOFENCING_TO = 'paeksunny@gmail.com';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
}

function getSaleTypeLabel(sale) {
  if (!sale) return 'Unknown';
  if (sale.saleCategory === 'Digital' && sale.productDetails?.service) {
    return sale.productDetails.service;
  }
  return sale.saleType || sale.saleCategory || 'Sale';
}

function buildEmailTemplate(title, rows) {
  const rowHtml = rows.map(item => `
      <tr>
        <td class="label">${item.label}</td>
        <td class="value">${item.value || 'N/A'}</td>
      </tr>
    `).join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #f8fafc; }
          .container { width: 100%; max-width: 680px; margin: 0 auto; padding: 24px; }
          .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; }
          .brand { color: #0f172a; font-size: 18px; font-weight: 700; margin-bottom: 16px; }
          .title { color: #111827; font-size: 20px; margin-bottom: 12px; }
          .body-text { color: #334155; line-height: 1.6; margin-bottom: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          td { padding: 10px 0; vertical-align: top; }
          .label { width: 36%; color: #475569; font-weight: 600; }
          .value { color: #0f172a; }
          .footer { margin-top: 24px; color: #64748b; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="brand">Avidsphere</div>
            <div class="title">${title}</div>
            <div class="body-text">This message was generated from the Avidsphere CRM notification service.</div>
            <table>${rowHtml}</table>
            <p class="footer">Do not reply to this automated notification. For questions, please contact the CRM administrator.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function sendEmail({ to, subject, html, bcc }) {
  console.log('[emailService] preparing email', { to, subject, hasBcc: Boolean(bcc) });
  if (!resendApiKey || !resend) {
    throw new Error('Resend API key is not configured.');
  }

  const payload = {
    from: DEFAULT_FROM,
    to,
    subject,
    html
  };

  if (bcc && Array.isArray(bcc) && bcc.length > 0) {
    payload.bcc = bcc;
  }

  try {
    const response = await resend.emails.send(payload);
    console.log('[emailService] resend response', response);
    return response;
  } catch (error) {
    console.error('[emailService] resend send error', error);
    throw error;
  }
}

async function sendManagementNotification({ sale, customer }) {
  const saleType = getSaleTypeLabel(sale);
  const rows = [
    { label: 'Business Name', value: sale.businessName || customer?.businessName },
    { label: 'Contact Person', value: customer?.contactPerson },
    { label: 'Sales Representative', value: sale.salesRepresentative },
    { label: 'Sale Type', value: saleType },
    { label: 'Sale Amount', value: formatCurrency(sale.dollarAmount) },
    { label: 'Date', value: sale.saleDate },
    { label: 'Notes', value: sale.notes || 'None' }
  ];

  const html = buildEmailTemplate('New Sale Notification', rows);
  return await sendEmail({ to: MANAGEMENT_TO, subject: `New Sale: ${sale.businessName || 'Unknown Customer'}`, html });
}

async function sendDesignerNotification({ sale, customer }) {
  const saleType = getSaleTypeLabel(sale);
  const rows = [
    { label: 'Business Name', value: sale.businessName || customer?.businessName },
    { label: 'Sale Type', value: saleType },
    { label: 'Design Required', value: sale.designRequired || 'No' },
    { label: 'Design Change Required', value: sale.designChangeRequired || 'No' },
    { label: 'Notes', value: sale.notes || 'None' },
    { label: 'Sales Representative', value: sale.salesRepresentative }
  ];
  const html = buildEmailTemplate('Design Notification', rows);
  return await sendEmail({ to: DESIGN_TO, subject: `Design request: ${sale.businessName || 'Unknown'}`, html });
}

async function sendPrintTeamNotification({ sale, customer }) {
  const saleType = getSaleTypeLabel(sale);
  const rows = [
    { label: 'Business Name', value: sale.businessName || customer?.businessName },
    { label: 'Sale Type', value: saleType },
    { label: 'Notes', value: sale.notes || 'None' },
    { label: 'Sales Representative', value: sale.salesRepresentative }
  ];
  const html = buildEmailTemplate('Print Team Notification', rows);
  return await sendEmail({ to: PRINT_TO, subject: `Print request: ${sale.businessName || 'Unknown'}`, html });
}

async function sendDigitalTeamNotification({ sale, customer }) {
  const saleType = getSaleTypeLabel(sale);
  const rows = [
    { label: 'Business Name', value: sale.businessName || customer?.businessName },
    { label: 'Sale Type', value: saleType },
    { label: 'Monthly Budget', value: sale.productDetails?.monthlyAdSpend || 'N/A' },
    { label: 'Start Date', value: sale.productDetails?.startDate || 'N/A' },
    { label: 'Notes', value: sale.notes || 'None' }
  ];
  const html = buildEmailTemplate('Digital Team Notification', rows);
  return await sendEmail({ to: DIGITAL_TO, subject: `Digital request: ${sale.businessName || 'Unknown'}`, html });
}

async function sendGeofencingNotification({ sale, customer }) {
  const saleType = getSaleTypeLabel(sale);
  const rows = [
    { label: 'Business Name', value: sale.businessName || customer?.businessName },
    { label: 'Sale Type', value: saleType },
    { label: 'Notes', value: sale.notes || 'None' }
  ];
  const html = buildEmailTemplate('Geofencing Notification', rows);
  return await sendEmail({ to: GEOFENCING_TO, subject: `Geofencing request: ${sale.businessName || 'Unknown'}`, html });
}

async function sendSocialNotification({ sale, customer }) {
  const socialLinks = customer?.socialAccounts
    ? Object.entries(customer.socialAccounts)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join('<br/>')
    : 'No social links provided';

  const rows = [
    { label: 'Business Name', value: sale.businessName || customer?.businessName },
    { label: 'Contact Person', value: customer?.contactPerson },
    { label: 'Website', value: customer?.socialAccounts?.website || 'N/A' },
    { label: 'Social Links', value: socialLinks },
    { label: 'Campaign Details', value: sale.notes || 'None' },
    { label: 'Sales Representative', value: sale.salesRepresentative }
  ];

  const html = buildEmailTemplate('Social Media Campaign Notification', rows);
  return await sendEmail({ to: SOCIAL_TO, subject: `Social Media Opportunity: ${sale.businessName || 'Unknown'}`, html });
}

function buildAgreementEmailTemplate(agreementHtml) {
  if (!agreementHtml) return '';
  return agreementHtml;
}

async function sendAgreementEmail({ sale, customer, agreementHtml, pdfBase64 }) {
  const html = agreementHtml || buildEmailTemplate('Avidsphere Advertising Agreement', [
    { label: 'Business Name', value: customer?.businessName },
    { label: 'Contact Person', value: customer?.contactPerson },
    { label: 'Sale Amount', value: formatCurrency(sale.dollarAmount) },
    { label: 'Date Created', value: sale.saleDate },
    { label: 'Sales Representative', value: sale.salesRepresentative },
    { label: 'Notes', value: sale.notes || 'None' }
  ]);

  const payload = {
    to: customer.emailAddress,
    subject: 'Avidsphere Advertising Agreement',
    html: buildAgreementEmailTemplate(html)
  };

  if (pdfBase64) {
    payload.attachments = [{
      type: 'application/pdf',
      filename: 'AVID-Sphere-Advertising-Agreement.pdf',
      data: pdfBase64
    }];
  }

  return await sendEmail(payload);
}

async function sendTestEmail() {
  const timestamp = new Date().toISOString();
  const rows = [
    { label: 'Timestamp', value: timestamp },
    { label: 'Status', value: 'Backend operational' },
    { label: 'Route', value: '/api/send-test-email' }
  ];
  const html = buildEmailTemplate('CRM Email Integration Test', rows);
  return await sendEmail({ to: MANAGEMENT_TO, subject: 'CRM Email Integration Test', html });
}

module.exports = {
  sendManagementNotification,
  sendDesignerNotification,
  sendSocialNotification,
  sendPrintTeamNotification,
  sendDigitalTeamNotification,
  sendGeofencingNotification,
  sendAgreementEmail,
  sendTestEmail
};
