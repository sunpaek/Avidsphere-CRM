import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import Reminders from './pages/Reminders'
import Reports from './pages/Reports'

export default function App() {
  return (
    <div className="app-root">
      <header className="p-4 border-b">
        <nav className="flex gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/customers">Customers</Link>
          <Link to="/sales">Sales</Link>
          <Link to="/reminders">Reminders</Link>
          <Link to="/reports">Reports</Link>
        </nav>
      </header>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  )
}
