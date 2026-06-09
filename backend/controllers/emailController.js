const emailService = require('../services/emailService');

function validateSalePayload(req, res, next) {
  const payload = req.body;
  console.log('[emailController] validateSalePayload', { path: req.path, body: payload });
  if (!payload || !payload.sale || !payload.customer) {
    return res.status(400).json({ success: false, message: 'Missing required sale and customer data' });
  }
  next();
}

async function sendManagementEmail(req, res) {
  console.log('[emailController] route hit: /send-management-email', { body: req.body });
  try {
    const { sale, customer } = req.body;
    const result = await emailService.sendManagementNotification({ sale, customer });
    console.log('[emailController] sendManagementEmail success', { result });
    res.json({ success: true, message: 'Management email queued', data: result });
  } catch (error) {
    console.error('[emailController] sendManagementEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send management email', error: String(error) });
  }
}

async function sendDesignerEmail(req, res) {
  console.log('[emailController] route hit: /send-designer-email', { body: req.body });
  try {
    const { sale, customer } = req.body;
    const result = await emailService.sendDesignerNotification({ sale, customer });
    console.log('[emailController] sendDesignerEmail success', { result });
    res.json({ success: true, message: 'Designer email queued', data: result });
  } catch (error) {
    console.error('[emailController] sendDesignerEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send designer email', error: String(error) });
  }
}

async function sendSocialEmail(req, res) {
  console.log('[emailController] route hit: /send-social-email', { body: req.body });
  try {
    const { sale, customer } = req.body;
    const result = await emailService.sendSocialNotification({ sale, customer });
    console.log('[emailController] sendSocialEmail success', { result });
    res.json({ success: true, message: 'Social media email queued', data: result });
  } catch (error) {
    console.error('[emailController] sendSocialEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send social media email', error: String(error) });
  }
}

async function sendPrintEmail(req, res) {
  console.log('[emailController] route hit: /send-print-email', { body: req.body });
  try {
    const { sale, customer } = req.body;
    const result = await emailService.sendPrintTeamNotification({ sale, customer });
    console.log('[emailController] sendPrintEmail success', { result });
    res.json({ success: true, message: 'Print team email queued', data: result });
  } catch (error) {
    console.error('[emailController] sendPrintEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send print team email', error: String(error) });
  }
}

async function sendDigitalEmail(req, res) {
  console.log('[emailController] route hit: /send-digital-email', { body: req.body });
  try {
    const { sale, customer } = req.body;
    const result = await emailService.sendDigitalTeamNotification({ sale, customer });
    console.log('[emailController] sendDigitalEmail success', { result });
    res.json({ success: true, message: 'Digital team email queued', data: result });
  } catch (error) {
    console.error('[emailController] sendDigitalEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send digital team email', error: String(error) });
  }
}

async function sendGeofencingEmail(req, res) {
  console.log('[emailController] route hit: /send-geofencing-email', { body: req.body });
  try {
    const { sale, customer } = req.body;
    const result = await emailService.sendGeofencingNotification({ sale, customer });
    console.log('[emailController] sendGeofencingEmail success', { result });
    res.json({ success: true, message: 'Geofencing email queued', data: result });
  } catch (error) {
    console.error('[emailController] sendGeofencingEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send geofencing email', error: String(error) });
  }
}

async function sendAgreementEmail(req, res) {
  console.log('[emailController] route hit: /send-agreement-email', { body: req.body });
  try {
    const { sale, customer, agreementHtml, pdfBase64 } = req.body;
    const result = await emailService.sendAgreementEmail({ sale, customer, agreementHtml, pdfBase64 });
    console.log('[emailController] sendAgreementEmail success', { result });
    res.json({ success: true, message: 'Agreement email queued', data: result });
  } catch (error) {
    console.error('[emailController] sendAgreementEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send agreement email', error: String(error) });
  }
}

async function sendTestEmail(req, res) {
  console.log('[emailController] route hit: /send-test-email');
  try {
    const result = await emailService.sendTestEmail();
    console.log('[emailController] sendTestEmail success', { result });
    res.json({ success: true, message: 'Test email sent', data: result });
  } catch (error) {
    console.error('[emailController] sendTestEmail error:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: String(error) });
  }
}

module.exports = {
  validateSalePayload,
  sendManagementEmail,
  sendDesignerEmail,
  sendSocialEmail,
  sendPrintEmail,
  sendDigitalEmail,
  sendGeofencingEmail,
  sendAgreementEmail,
  sendTestEmail
};
