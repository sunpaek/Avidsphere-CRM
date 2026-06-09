const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/send-management-email', emailController.validateSalePayload, emailController.sendManagementEmail);
router.post('/send-designer-email', emailController.validateSalePayload, emailController.sendDesignerEmail);
router.post('/send-social-email', emailController.validateSalePayload, emailController.sendSocialEmail);
router.post('/send-print-email', emailController.validateSalePayload, emailController.sendPrintEmail);
router.post('/send-digital-email', emailController.validateSalePayload, emailController.sendDigitalEmail);
router.post('/send-geofencing-email', emailController.validateSalePayload, emailController.sendGeofencingEmail);
router.post('/send-agreement-email', emailController.validateSalePayload, emailController.sendAgreementEmail);
router.post('/send-test-email', emailController.sendTestEmail);

module.exports = router;
