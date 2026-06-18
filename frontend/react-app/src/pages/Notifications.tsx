import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readCRMData, useLocalStorageAdapter, writeCRMData } from '@/hooks/useLocalStorageAdapter'
import type { Notification, Sale } from '@/types'
import { useToast } from '@/components/ToastProvider'
import { DEPARTMENTS, type DepartmentName } from '@/utils/departments'

type FilterType = 'All' | 'Unread' | 'Sales' | DepartmentName
type SortType = 'Newest' | 'Oldest' | 'Priority'

const filterOptions: FilterType[] = ['All', 'Unread', ...DEPARTMENTS, 'Sales']
const sortOptions: Array<{ value: SortType; label: string }> = [
  { value: 'Newest', label: 'Newest first' },
  { value: 'Oldest', label: 'Oldest first' },
  { value: 'Priority', label: 'Priority first' }
]

function formatDateTime(value?: string) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function getNotificationCategory(notification: Notification) {
  const haystack = [
    notification.recipientRole,
    notification.type,
    notification.source,
    notification.title,
    notification.message
  ].join(' ').toLowerCase()

  if (haystack.includes('geofenc')) return 'Geofencing'
  if (haystack.includes('social')) return 'Social Media Team'
  if (haystack.includes('digital')) return 'Digital Team'
  if (haystack.includes('design')) return 'Designers'
  if (haystack.includes('print')) return 'Print Team'
  if (haystack.includes('management')) return 'Management'
  if (haystack.includes('sale')) return 'Sales'
  return 'General'
}

function getPriorityRank(notification: Notification) {
  if (notification.priority === 'High') return 3
  if (notification.priority === 'Normal') return 2
  return 1
}

function getNotificationPreview(message?: string) {
  const text = String(message || 'No message').trim()
  return text.length > 132 ? `${text.slice(0, 129)}...` : text
}

function getSaleDisplayLabel(sale?: Sale) {
  if (!sale) return ''
  return sale.productDetails?.service || sale.saleType || sale.saleCategory || 'Sale'
}

export default function Notifications() {
  const { showToast } = useToast()
  const { data, isLoading, error, reload } = useLocalStorageAdapter()
  const navigate = useNavigate()
  const initialFilter = String(data.preferences.notificationFilterType || 'All') as FilterType
  const initialSort = String(data.preferences.notificationSortType || 'Newest') as SortType
  const [filter, setFilter] = useState<FilterType>(filterOptions.includes(initialFilter) ? initialFilter : 'All')
  const [sort, setSort] = useState<SortType>(['Newest', 'Oldest', 'Priority'].includes(initialSort) ? initialSort : 'Newest')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const visibleNotifications = useMemo(() => {
    const filtered = data.notifications.filter(notification => {
      if (filter === 'Unread') return !notification.read
      if (filter === 'Sales') return notification.type === 'Sale Notification' || notification.source === 'sale' || getNotificationCategory(notification) === 'Sales'
      if (filter === 'Management') return notification.type === 'Management Alert' || notification.recipientRole === 'Management' || getNotificationCategory(notification) === 'Management'
      if (DEPARTMENTS.includes(filter as DepartmentName)) return getNotificationCategory(notification) === filter
      return true
    })

    return filtered.slice().sort((a, b) => {
      if (sort === 'Oldest') return String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
      if (sort === 'Priority') {
        const priorityDifference = getPriorityRank(b) - getPriorityRank(a)
        if (priorityDifference) return priorityDifference
      }
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    })
  }, [data.notifications, filter, sort])

  const unreadCount = data.notifications.filter(notification => !notification.read).length
  const visibleIds = visibleNotifications.map(notification => notification.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id))

  function persistPreferences(nextFilter = filter, nextSort = sort) {
    const store = readCRMData()
    writeCRMData({
      ...store,
      preferences: {
        ...store.preferences,
        notificationFilterType: nextFilter,
        notificationSortType: nextSort
      }
    })
  }

  function changeFilter(nextFilter: FilterType) {
    setFilter(nextFilter)
    setSelectedIds([])
    persistPreferences(nextFilter, sort)
    reload()
  }

  function changeSort(nextSort: SortType) {
    setSort(nextSort)
    persistPreferences(filter, nextSort)
    reload()
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds(current => checked
      ? [...new Set([...current, id])]
      : current.filter(item => item !== id)
    )
  }

  function toggleAllVisible(checked: boolean) {
    setSelectedIds(current => {
      if (!checked) return current.filter(id => !visibleIds.includes(id))
      return [...new Set([...current, ...visibleIds])]
    })
  }

  function toggleRead(notificationId: string) {
    const store = readCRMData()
    const notifications = store.notifications.map(notification => notification.id === notificationId
      ? { ...notification, read: !notification.read }
      : notification
    )
    writeCRMData({ ...store, notifications })
    reload()
    showToast('Notification status updated.', 'success')
  }

  function deleteSingle(notificationId: string) {
    const confirmed = window.confirm('Delete this notification?')
    if (!confirmed) return
    const store = readCRMData()
    writeCRMData({ ...store, notifications: store.notifications.filter(notification => notification.id !== notificationId) })
    setSelectedIds(current => current.filter(id => id !== notificationId))
    reload()
    showToast('Notification deleted.', 'success')
  }

  function deleteSelected() {
    if (!selectedIds.length) {
      showToast('Select at least one notification to delete.', 'warning')
      return
    }
    const confirmed = window.confirm('Delete the selected notifications?')
    if (!confirmed) return
    const selected = new Set(selectedIds)
    const store = readCRMData()
    writeCRMData({ ...store, notifications: store.notifications.filter(notification => !selected.has(notification.id)) })
    setSelectedIds([])
    reload()
    showToast('Selected notifications deleted.', 'success')
  }

  function clearAll() {
    const confirmed = window.confirm('Clear all notifications?')
    if (!confirmed) return
    const store = readCRMData()
    writeCRMData({ ...store, notifications: [] })
    setSelectedIds([])
    reload()
    showToast('All notifications cleared.', 'success')
  }

  function viewCustomer(notification: Notification) {
    const sale = data.sales.find(item => item.id === notification.relatedId)
    const customerId = notification.relatedCustomerId || sale?.customerId
    if (!customerId) return
    navigate(`/customers?customerId=${encodeURIComponent(customerId)}`)
  }

  function viewSale(notification: Notification) {
    const sale = data.sales.find(item => item.id === notification.relatedId)
    if (!sale) return
    navigate(`/sales?viewSaleId=${encodeURIComponent(sale.id)}`)
  }

  if (isLoading) {
    return <p className="empty-state">Loading notifications...</p>
  }

  if (error) {
    return (
      <section className="data-card">
        <p className="eyebrow">Notifications</p>
        <h3>Error loading notifications</h3>
        <p>{error.message}</p>
      </section>
    )
  }

  return (
    <div className="notifications-workspace">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Notifications</p>
          <h2>Notification management</h2>
        </div>
        <p className="panel-help">Delete single notifications, clear the feed, or mark alerts as read.</p>
      </div>

      <section className="data-card notification-center-panel">
        <div className="notification-toolbar inbox-toolbar">
          <div className="filter-row">
            <label>Filter
              <select value={filter} onChange={event => changeFilter(event.target.value as FilterType)}>
                {filterOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label>Sort
              <select value={sort} onChange={event => changeSort(event.target.value as SortType)}>
                {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="checkbox-label select-all-visible">
              <input type="checkbox" checked={allVisibleSelected} onChange={event => toggleAllVisible(event.target.checked)} />
              Select visible
            </label>
          </div>
          <div className="form-actions notification-bulk-actions">
            <button type="button" className="secondary-btn" onClick={deleteSelected}>Delete Selected</button>
            <button type="button" className="secondary-btn" onClick={clearAll}>Clear All</button>
          </div>
        </div>

        <div className="notification-summary-row">
          <span className="tag">{visibleNotifications.length} visible</span>
          <span className="tag unread">{unreadCount} unread</span>
          <span className="tag">{selectedIds.length} selected</span>
        </div>

        <div className="notification-feed">
          {visibleNotifications.length ? visibleNotifications.map(notification => {
            const sale = data.sales.find(item => item.id === notification.relatedId)
            const relatedCustomerId = notification.relatedCustomerId || sale?.customerId || ''
            const customer = data.customers.find(item => item.id === relatedCustomerId)
            const customerName = customer?.businessName || sale?.businessName || 'No related customer'
            const serviceLabel = getSaleDisplayLabel(sale) || 'No related sale'
            const saleStatus = sale?.saleStatus || sale?.status

            return (
              <article
                key={notification.id}
                className={`notification-item notification-row ${notification.priority === 'High' ? 'priority-high' : ''} ${notification.read ? 'notification-read' : 'notification-unread'}`}
              >
                <div className="notification-select-cell">
                  <input
                    type="checkbox"
                    className="notification-select"
                    aria-label="Select notification"
                    checked={selectedIds.includes(notification.id)}
                    onChange={event => toggleSelected(notification.id, event.target.checked)}
                  />
                </div>

                <div className="notification-priority-cell">
                  <span className={`priority-dot ${notification.priority === 'High' ? 'pink' : 'blue'}`} />
                  {!notification.read ? <span className="unread-dot" /> : null}
                </div>

                <div className="notification-content-cell">
                  <div className="notification-title-row">
                    <strong>{notification.title}</strong>
                    <span className={`tag ${notification.read ? 'active' : 'unread'}`}>{notification.read ? 'Read' : 'Unread'}</span>
                    {notification.priority ? <span className={`tag priority-${notification.priority.toLowerCase()}`}>{notification.priority}</span> : null}
                  </div>
                  <p>{getNotificationPreview(notification.message)}</p>
                  <div className="notification-meta">
                    <span><strong>Assigned Department:</strong> {notification.recipientRole}</span>
                    <span><strong>Customer:</strong> {customerName}</span>
                    <span><strong>Service:</strong> {serviceLabel}</span>
                    <span><strong>Date:</strong> {formatDateTime(notification.createdAt)}</span>
                    {saleStatus ? <span><strong>Status:</strong> {saleStatus}</span> : null}
                  </div>
                </div>

                <div className="notification-actions-cell">
                  <button type="button" className="secondary-btn compact-action" onClick={() => toggleRead(notification.id)}>
                    {notification.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  {relatedCustomerId ? (
                    <button type="button" className="info-btn compact-action" onClick={() => viewCustomer(notification)}>Customer</button>
                  ) : null}
                  {sale ? (
                    <button type="button" className="info-btn compact-action" onClick={() => viewSale(notification)}>Sale</button>
                  ) : null}
                  <button type="button" className="delete-btn compact-action" onClick={() => deleteSingle(notification.id)}>Delete</button>
                </div>
              </article>
            )
          }) : (
            <p className="empty-state">{data.notifications.length ? 'No notifications match this filter.' : 'No notifications yet.'}</p>
          )}
        </div>
      </section>
    </div>
  )
}
