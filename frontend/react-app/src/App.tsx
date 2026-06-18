import { Link, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import Reminders from './pages/Reminders'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import LegacyLayout from './components/LegacyLayout'
import { ToastProvider } from './components/ToastProvider'

export default function App() {
  return (
    <ToastProvider>
      <LegacyLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </LegacyLayout>
    </ToastProvider>
  )
}

function NotFound() {
  return (
    <section className="data-card">
      <p className="eyebrow">Page not found</p>
      <h2>This CRM page does not exist.</h2>
      <p className="panel-help">The link may be outdated. Return to the dashboard to continue working.</p>
      <div className="form-actions">
        <Link className="primary-btn" to="/">Return to Dashboard</Link>
      </div>
    </section>
  )
}
