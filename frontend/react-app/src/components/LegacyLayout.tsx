import { NavLink } from 'react-router-dom'
import { useLocalStorageAdapter } from '@/hooks/useLocalStorageAdapter'
import type { ReactNode } from 'react'
import DeveloperTools from './DeveloperTools'
import { canonicalizeDepartmentName } from '@/utils/departments'
import avidsphereLogo from '../../../Assets/logo.png'

type LegacyLayoutProps = {
  children: ReactNode
}

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/customers', label: 'Customers' },
  { to: '/sales', label: 'Sales' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/reports', label: 'Reports' }
]

const roleAccess: Record<string, string[]> = {
  'Sales Staff': [
    'Add customers and sales',
    'Manage reminders',
    'View notifications'
  ],
  Management: [
    'Review reports and analytics',
    'Monitor team updates',
    'Manage notifications'
  ],
  'Print Team': [
    'Review print work',
    'Track production alerts',
    'View customer context'
  ],
  Designers: [
    'Review design requests',
    'Track design-change alerts',
    'View sale context'
  ],
  'Digital Team': [
    'Review digital campaigns',
    'Track digital alerts',
    'View customer context'
  ],
  'Social Media Team': [
    'Review social media campaigns',
    'Track social content alerts',
    'View customer context'
  ],
  Geofencing: [
    'Review geofencing campaigns',
    'Track location-targeting alerts',
    'View customer context'
  ]
}

export default function LegacyLayout({ children }: LegacyLayoutProps) {
  const { data } = useLocalStorageAdapter()
  const currentRole = canonicalizeDepartmentName(data.preferences.currentRole)
  const currentUserName = String((data.preferences as { currentUserName?: string }).currentUserName || 'Sunny')
  const openReminderCount = data.reminders.filter(reminder => reminder.completed !== true).length
  const notificationCount = data.notifications.filter(notification => !notification.archived).length
  const accessItems = roleAccess[currentRole] || roleAccess['Sales Staff']

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <img
              className="brand-logo"
              src={avidsphereLogo}
              alt="Avidsphere"
              width={1464}
              height={686}
            />
            <div>
              <p className="eyebrow">Avidsphere</p>
              <h1>AvidSphere CRM</h1>
            </div>
          </div>
          <p className="subtitle">Customer intelligence, sales tracking, reminders, and team coordination in one workspace.</p>
        </div>

        <div className="topbar-actions">
          <div className="topbar-card">
            <label>Current User</label>
            <div className="current-user-display">{currentUserName}</div>
            <div className="current-user-role">Role: {currentRole}</div>
          </div>
        </div>
      </header>

      <main className="layout-grid">
        <aside className="sidebar" aria-label="CRM summary and navigation">
          <section className="summary-card">
            <p className="eyebrow">Live Snapshot</p>
            <h2>Current activity</h2>
            <div className="stat-row"><span>Total Customers</span><strong>{data.customers.length}</strong></div>
            <div className="stat-row"><span>Open Reminders</span><strong>{openReminderCount}</strong></div>
            <div className="stat-row"><span>Notifications</span><strong>{notificationCount}</strong></div>
          </section>

          <section className="summary-card">
            <p className="eyebrow">Navigation</p>
            <h2>Quick access</h2>
            <nav className="nav-stack">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </section>

          <section className="summary-card">
            <p className="eyebrow">Role Access</p>
            <h2>Current permissions</h2>
            <ul className="role-access-list">
              {accessItems.map(item => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </aside>

        <section className="content-area">
          <div className="content-panel active-panel">
            {children}
          </div>
        </section>
      </main>

      <DeveloperTools />
    </div>
  )
}
