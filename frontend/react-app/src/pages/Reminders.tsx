import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readCRMData, useLocalStorageAdapter, writeCRMData } from '@/hooks/useLocalStorageAdapter'
import type { Customer, Reminder } from '@/types'
import { useToast } from '@/components/ToastProvider'

type ReminderFormState = {
  customerId: string
  title: string
  dueDate: string
  notes: string
  priority: Reminder['priority'] | ''
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function todayIso() {
  const now = new Date()
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate())
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function createId() {
  return `rem-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}

function getReminderDate(reminder: Reminder) {
  return String(reminder.dueDate || reminder.date || '').slice(0, 10)
}

function formatDate(value?: string) {
  if (!value) return 'N/A'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatLongDate(value?: string) {
  if (!value) return 'Select a date'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Select a date'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function normalizeStatus(reminder: Reminder) {
  if (reminder.completed) return 'Completed'
  if (reminder.status) return reminder.status
  return 'Open'
}

function blankForm(customerId = '', dueDate = todayIso()): ReminderFormState {
  return {
    customerId,
    title: '',
    dueDate,
    notes: '',
    priority: ''
  }
}

function getCustomerName(customers: Customer[], customerId?: string) {
  return customers.find(customer => customer.id === customerId)?.businessName || 'Unknown customer'
}

export default function Reminders() {
  const { showToast } = useToast()
  const { data, isLoading, error, reload } = useLocalStorageAdapter()
  const currentUserName = String(data.preferences.currentUserName || 'Sunny')
  const [searchParams] = useSearchParams()
  const initialSelectedDate = String(data.preferences.selectedCalendarDate || todayIso()).slice(0, 10)
  const initialCalendarDate = data.preferences.calendarMonth
    ? new Date(data.preferences.calendarMonth)
    : new Date(`${initialSelectedDate}T00:00:00`)
  const safeInitialCalendar = Number.isNaN(initialCalendarDate.getTime()) ? new Date() : initialCalendarDate

  const [calendarDate, setCalendarDate] = useState(() => new Date(safeInitialCalendar.getFullYear(), safeInitialCalendar.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null)
  const [form, setForm] = useState<ReminderFormState>(() => blankForm(data.customers[0]?.id || '', initialSelectedDate))

  const currentYear = calendarDate.getFullYear()
  const currentMonth = calendarDate.getMonth()
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

  useEffect(() => {
    const requestedCustomerId = searchParams.get('customerId')
    if (requestedCustomerId && data.customers.some(customer => customer.id === requestedCustomerId)) {
      setForm(current => ({ ...current, customerId: requestedCustomerId }))
      return
    }
    if (!form.customerId && data.customers[0]?.id) {
      setForm(current => ({ ...current, customerId: data.customers[0].id }))
    }
  }, [data.customers, form.customerId, searchParams])

  const remindersByDate = useMemo(() => {
    return data.reminders.reduce<Record<string, Reminder[]>>((acc, reminder) => {
      const key = getReminderDate(reminder)
      if (!key) return acc
      acc[key] = acc[key] || []
      acc[key].push(reminder)
      return acc
    }, {})
  }, [data.reminders])

  const monthReminders = useMemo(() => {
    return data.reminders
      .filter(reminder => getReminderDate(reminder).startsWith(currentMonthKey))
      .sort((a, b) => getReminderDate(a).localeCompare(getReminderDate(b)))
  }, [currentMonthKey, data.reminders])

  const selectedDateReminders = useMemo(() => {
    return (remindersByDate[selectedDate] || [])
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [remindersByDate, selectedDate])

  function persistCalendar(nextMonthDate = calendarDate, nextSelectedDate = selectedDate) {
    const store = readCRMData()
    writeCRMData({
      ...store,
      preferences: {
        ...store.preferences,
        calendarMonth: new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1).toISOString(),
        selectedCalendarDate: nextSelectedDate
      }
    })
  }

  function setMonthDate(next: Date) {
    const normalized = new Date(next.getFullYear(), next.getMonth(), 1)
    setCalendarDate(normalized)
    persistCalendar(normalized, selectedDate)
  }

  function selectDate(dateIso: string) {
    setSelectedDate(dateIso)
    setForm(current => ({ ...current, dueDate: dateIso }))
    persistCalendar(calendarDate, dateIso)
  }

  function updateForm<K extends keyof ReminderFormState>(key: K, value: ReminderFormState[K]) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function clearForm(date = selectedDate) {
    setEditingReminderId(null)
    setForm(blankForm(data.customers[0]?.id || '', date))
  }

  function saveReminder(event: React.FormEvent) {
    event.preventDefault()
    if (!form.customerId || !form.title.trim() || !form.dueDate) {
      showToast('Customer, title, and date are required.', 'error')
      return
    }

    const store = readCRMData()
    const existing = editingReminderId ? store.reminders.find(reminder => reminder.id === editingReminderId) : undefined
    const nextReminder: Reminder = {
      ...(existing || {}),
      id: existing?.id || createId(),
      customerId: form.customerId,
      title: form.title.trim(),
      date: form.dueDate,
      dueDate: form.dueDate,
      assignedTo: existing?.assignedTo || currentUserName,
      notes: form.notes.trim(),
      priority: form.priority || existing?.priority,
      completed: existing?.completed || false,
      status: existing?.completed ? 'Completed' : 'Open'
    }

    const reminders = existing
      ? store.reminders.map(reminder => reminder.id === existing.id ? nextReminder : reminder)
      : [nextReminder, ...store.reminders]

    const notifications = existing ? store.notifications : [{
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      recipientRole: 'Sales Staff',
      title: 'Reminder scheduled',
      message: `${getCustomerName(store.customers, nextReminder.customerId)} has a reminder: ${nextReminder.title}.`,
      relatedId: nextReminder.id,
      relatedCustomerId: nextReminder.customerId,
      priority: nextReminder.priority === 'High' ? 'High' as const : 'Normal' as const,
      source: 'reminder',
      type: 'Reminder Notification',
      read: false,
      createdAt: new Date().toISOString(),
      archived: false
    }, ...store.notifications]

    writeCRMData({ ...store, reminders, notifications })
    setSelectedDate(form.dueDate)
    setCalendarDate(new Date(`${form.dueDate}T00:00:00`))
    persistCalendar(new Date(`${form.dueDate}T00:00:00`), form.dueDate)
    clearForm(form.dueDate)
    reload()
    showToast(existing ? 'Reminder updated.' : 'Reminder scheduled.', 'success')
    if (!existing) showToast('Reminder notification created.', 'info')
  }

  function editReminder(reminder: Reminder) {
    const date = getReminderDate(reminder) || todayIso()
    setEditingReminderId(reminder.id)
    setSelectedDate(date)
    setForm({
      customerId: reminder.customerId || data.customers[0]?.id || '',
      title: reminder.title || '',
      dueDate: date,
      notes: reminder.notes || '',
      priority: reminder.priority || ''
    })
    showToast('Reminder loaded for editing.', 'info')
  }

  function toggleReminder(reminder: Reminder) {
    const store = readCRMData()
    const nextCompleted = !reminder.completed
    const reminders = store.reminders.map(item => item.id === reminder.id
      ? { ...item, completed: nextCompleted, status: nextCompleted ? 'Completed' : 'Open' }
      : item
    )
    writeCRMData({ ...store, reminders })
    reload()
    showToast(nextCompleted ? 'Reminder completed.' : 'Reminder reopened.', 'success')
  }

  function deleteReminder(reminderId: string) {
    const confirmed = window.confirm('Delete this reminder?')
    if (!confirmed) return
    const store = readCRMData()
    writeCRMData({ ...store, reminders: store.reminders.filter(reminder => reminder.id !== reminderId) })
    if (editingReminderId === reminderId) clearForm()
    reload()
    showToast('Reminder deleted successfully.', 'success')
  }

  function renderCalendarCells() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const cells: Array<{ day?: number; dateIso?: string }> = []

    for (let i = 0; i < firstDay; i += 1) cells.push({})
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ day, dateIso: toIsoDate(currentYear, currentMonth, day) })
    }
    while (cells.length < 42) cells.push({})

    return cells
  }

  if (isLoading) {
    return <p className="empty-state">Loading reminders...</p>
  }

  if (error) {
    return (
      <section className="data-card">
        <p className="eyebrow">Reminders</p>
        <h3>Unable to load reminders</h3>
        <p>{error.message}</p>
      </section>
    )
  }

  return (
    <div className="reminders-workspace">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Reminders</p>
          <h2>Reminder workspace</h2>
        </div>
        <p className="panel-help">Create reminders, review the monthly queue, and select dates from the calendar.</p>
      </div>

      <div className="reminders-layout">
        <div className="reminders-column reminders-left-column">
          <section className="data-card reminder-form-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Add reminder</p>
                <h3>{editingReminderId ? 'Edit reminder' : 'Reminder form'}</h3>
              </div>
              {editingReminderId ? <span className="tag active">Editing</span> : null}
            </div>

            <form className="crm-form" onSubmit={saveReminder}>
              <label>Customer
                <select value={form.customerId} onChange={event => updateForm('customerId', event.target.value)}>
                  <option value="">Select customer</option>
                  {data.customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.businessName}</option>
                  ))}
                </select>
              </label>
              <label>Title<input type="text" value={form.title} onChange={event => updateForm('title', event.target.value)} required /></label>
              <label>Date<input type="date" value={form.dueDate} onChange={event => {
                updateForm('dueDate', event.target.value)
                if (event.target.value) selectDate(event.target.value)
              }} required /></label>
              <label>Priority
                <select value={form.priority} onChange={event => updateForm('priority', event.target.value as ReminderFormState['priority'])}>
                  <option value="">Normal</option>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label>Notes<textarea value={form.notes} onChange={event => updateForm('notes', event.target.value)} rows={3} /></label>
              <div className="form-actions">
                <button type="submit" className="primary-btn">{editingReminderId ? 'Update Reminder' : 'Save Reminder'}</button>
                <button type="button" className="secondary-btn" onClick={() => clearForm()}>Clear</button>
              </div>
            </form>
          </section>

          <section className="data-card reminder-list-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Monthly queue</p>
                <h3>{monthNames[currentMonth]} reminders</h3>
              </div>
              <span className="tag">{monthReminders.length} reminders</span>
            </div>

            <div className="reminder-list monthly-reminder-list">
              {monthReminders.length ? monthReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  customerName={getCustomerName(data.customers, reminder.customerId)}
                  onEdit={() => editReminder(reminder)}
                  onToggle={() => toggleReminder(reminder)}
                  onDelete={() => deleteReminder(reminder.id)}
                />
              )) : (
                <p className="empty-state">No reminders this month.</p>
              )}
            </div>
          </section>
        </div>

        <div className="reminders-column reminders-right-column">
          <section className="data-card calendar-card">
            <div className="calendar-controls compact-controls">
              <button type="button" className="secondary-btn compact-action" onClick={() => setMonthDate(new Date(currentYear, currentMonth - 1, 1))}>Previous</button>
              <div className="calendar-selects">
                <select className="compact-select" value={currentMonth} onChange={event => setMonthDate(new Date(currentYear, Number(event.target.value), 1))}>
                  {monthNames.map((month, index) => <option key={month} value={index}>{month}</option>)}
                </select>
                <select className="compact-select" value={currentYear} onChange={event => setMonthDate(new Date(Number(event.target.value), currentMonth, 1))}>
                  {Array.from({ length: 11 }, (_, index) => currentYear - 5 + index).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="secondary-btn compact-action" onClick={() => setMonthDate(new Date(currentYear, currentMonth + 1, 1))}>Next</button>
            </div>

            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}
            </div>
            <div className="calendar-grid reminders-calendar-month">
              {renderCalendarCells().map((cell, index) => {
                const dayReminders = cell.dateIso ? remindersByDate[cell.dateIso] || [] : []
                const isSelected = cell.dateIso === selectedDate
                return cell.dateIso ? (
                  <button
                    key={cell.dateIso}
                    type="button"
                    className={`calendar-day current-month${isSelected ? ' active' : ''}${dayReminders.length ? ' has-reminders' : ''}`}
                    onClick={() => selectDate(cell.dateIso || '')}
                  >
                    <span className="date-num">{cell.day}</span>
                    {dayReminders.slice(0, 3).map(reminder => (
                      <span key={reminder.id} className="calendar-day-reminder">{reminder.title}</span>
                    ))}
                  </button>
                ) : (
                  <div key={`blank-${index}`} className="calendar-day" />
                )
              })}
            </div>
          </section>

          <section className="data-card selected-reminders">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Selected date</p>
                <h3>{formatLongDate(selectedDate)}</h3>
              </div>
              <span className="tag">{selectedDateReminders.length} reminders</span>
            </div>

            <div className="reminder-list selected-date-list">
              {selectedDateReminders.length ? selectedDateReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  customerName={getCustomerName(data.customers, reminder.customerId)}
                  onEdit={() => editReminder(reminder)}
                  onToggle={() => toggleReminder(reminder)}
                  onDelete={() => deleteReminder(reminder.id)}
                  showNotes
                />
              )) : (
                <p className="empty-state">No reminders attached to this date.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

type ReminderItemProps = {
  reminder: Reminder
  customerName: string
  showNotes?: boolean
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}

function ReminderItem({ reminder, customerName, showNotes, onEdit, onToggle, onDelete }: ReminderItemProps) {
  const completed = Boolean(reminder.completed)
  const status = normalizeStatus(reminder)
  return (
    <article className={`reminder-item legacy-reminder-item${completed ? ' completed' : ''}`}>
      <div className="reminder-content">
        <strong>{reminder.title}</strong>
        <p>{customerName}</p>
        <div className="reminder-meta">
          <span>{formatDate(getReminderDate(reminder))}</span>
          <span className={`tag ${completed ? 'active' : 'prospect'}`}>{status}</span>
          {reminder.priority ? <span className={`tag priority-${String(reminder.priority).toLowerCase()}`}>{reminder.priority}</span> : null}
        </div>
        {showNotes ? <p>{reminder.notes || 'No notes'}</p> : null}
      </div>
      <div className="reminder-actions">
        <button type="button" className="edit-btn compact-action" onClick={onEdit}>Edit</button>
        <button type="button" className="complete-btn compact-action" onClick={onToggle}>{completed ? 'Reopen' : 'Complete'}</button>
        <button type="button" className="delete-btn compact-action" onClick={onDelete}>Delete</button>
      </div>
    </article>
  )
}
