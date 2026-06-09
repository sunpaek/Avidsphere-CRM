const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const dotenvResult = dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 3000;

console.log('[backend] dotenv loaded:', {
  parsed: dotenvResult.parsed ? Object.keys(dotenvResult.parsed) : null,
  error: dotenvResult.error ? dotenvResult.error.message : null,
  hasResendKey: Boolean(process.env.RESEND_API_KEY)
});

app.use(cors({ origin: true }));
app.use(express.json());

const emailRoutes = require('./routes/emailRoutes');
app.use('/api', emailRoutes);
console.log('[backend] Routes initialized: /api/send-management-email, /api/send-designer-email, /api/send-social-email, /api/send-agreement-email, /api/send-test-email');

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend health check OK' });
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred' });
});

app.listen(PORT, () => {
  console.log(`Avidsphere backend started on port ${PORT}`);
});
