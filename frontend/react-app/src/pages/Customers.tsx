import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { readCRMData, useLocalStorageAdapter, writeCRMData } from '@/hooks/useLocalStorageAdapter'
import type { Customer } from '@/types'
import CustomerDetail from '@/components/CustomerDetail'
import { useToast } from '@/components/ToastProvider'

type SortField = 'dateCreated' | 'businessName' | 'lastContactDate' | 'customerStatus'
type SortDirection = 'asc' | 'desc'

type CustomerFormState = {
  businessName: string
  businessAddress: string
  contactPerson: string
  emailAddress: string
  phoneNumber: string
  customerStatus: string
  notes: string
}

const blankCustomerForm: CustomerFormState = {
  businessName: '',
  businessAddress: '',
  contactPerson: '',
  emailAddress: '',
  phoneNumber: '',
  customerStatus: 'Prospect',
  notes: ''
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}

function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

function getCurrentUserName(data: ReturnType<typeof readCRMData>) {
  return String((data.preferences as { currentUserName?: string }).currentUserName || 'Sunny')
}

function normalize(value?: string) {
  return String(value || '').toLowerCase()
}

export default function Customers() {
  const { showToast } = useToast()
  const { data, isLoading, error, reload } = useLocalStorageAdapter()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<CustomerFormState>(blankCustomerForm)
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortField, setSortField] = useState<SortField>('dateCreated')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const requestedCustomerId = searchParams.get('customerId')
    if (requestedCustomerId && data.customers.some(customer => customer.id === requestedCustomerId)) {
      setSelectedCustomerId(requestedCustomerId)
      return
    }
    if (!selectedCustomerId && data.customers.length) {
      setSelectedCustomerId(data.customers[0].id)
    }
    if (selectedCustomerId && !data.customers.some(customer => customer.id === selectedCustomerId)) {
      setSelectedCustomerId(data.customers[0]?.id || null)
    }
  }, [data.customers, searchParams, selectedCustomerId])

  const visibleCustomers = useMemo(() => {
    const query = normalize(search)
    const rows = data.customers.filter(customer => {
      const matchesSearch = !query || [
        customer.businessName,
        customer.contactPerson,
        customer.emailAddress
      ].join(' ').toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'All' || customer.customerStatus === statusFilter
      return matchesSearch && matchesStatus
    })

    return rows.sort((a, b) => {
      const left = String(a[sortField] || '')
      const right = String(b[sortField] || '')
      const result = left.localeCompare(right)
      return sortDirection === 'asc' ? result : -result
    })
  }, [data.customers, search, sortDirection, sortField, statusFilter])

  const selectedCustomer = data.customers.find(customer => customer.id === selectedCustomerId) || null

  const handleReorder = (saleId: string) => {
    navigate(`/sales?reorderSaleId=${encodeURIComponent(saleId)}`)
  }

  function updateForm<K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function resetForm() {
    setForm(blankCustomerForm)
    setEditingCustomerId(null)
  }

  function editCustomer(customer: Customer) {
    setEditingCustomerId(customer.id)
    setForm({
      businessName: customer.businessName || '',
      businessAddress: customer.businessAddress || '',
      contactPerson: customer.contactPerson || '',
      emailAddress: customer.emailAddress || '',
      phoneNumber: customer.phoneNumber || '',
      customerStatus: customer.customerStatus || 'Prospect',
      notes: customer.notes || customer.noteEntries?.[0]?.text || ''
    })
    setSelectedCustomerId(customer.id)
  }

  function saveCustomer(event: React.FormEvent) {
    event.preventDefault()
    if (!form.businessName.trim() || !form.businessAddress.trim() || !form.contactPerson.trim() || !form.emailAddress.trim() || !form.phoneNumber.trim()) {
      showToast('Complete all required customer fields.', 'error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress.trim())) {
      showToast('Please enter a valid email address.', 'error')
      return
    }
    const store = readCRMData()
    const existing = editingCustomerId ? store.customers.find(customer => customer.id === editingCustomerId) : undefined
    const today = getTodayISO()
    const author = getCurrentUserName(store)
    const noteEntries = existing?.noteEntries ? [...existing.noteEntries] : []

    if (form.notes.trim() && (!existing || existing.notes !== form.notes.trim())) {
      noteEntries.push({
        id: createId('note'),
        text: form.notes.trim(),
        author,
        timestamp: today
      })
    }

    const nextCustomer: Customer = {
      ...(existing || {}),
      id: existing?.id || createId('cust'),
      businessName: form.businessName.trim(),
      businessAddress: form.businessAddress.trim(),
      contactPerson: form.contactPerson.trim(),
      emailAddress: form.emailAddress.trim(),
      phoneNumber: form.phoneNumber.trim(),
      customerStatus: form.customerStatus,
      notes: form.notes.trim(),
      dateCreated: existing?.dateCreated || today,
      lastContactDate: today,
      assignedSalesRepresentative: existing?.assignedSalesRepresentative || author,
      noteEntries,
      communicationHistory: existing?.communicationHistory || [],
      socialAccounts: existing?.socialAccounts || {}
    }

    const customers = existing
      ? store.customers.map(customer => customer.id === existing.id ? nextCustomer : customer)
      : [nextCustomer, ...store.customers]

    writeCRMData({ ...store, customers })
    resetForm()
    setSelectedCustomerId(nextCustomer.id)
    reload()
    showToast(existing ? 'Customer updated successfully.' : 'Customer saved successfully.', 'success')
  }

  function deleteCustomer(customerId: string) {
    const customer = data.customers.find(item => item.id === customerId)
    if (!customer) return
    const confirmed = window.confirm('Delete this customer and related sales/reminders?')
    if (!confirmed) return

    const store = readCRMData()
    const removedSaleIds = new Set(store.sales.filter(sale => sale.customerId === customerId).map(sale => sale.id))
    writeCRMData({
      ...store,
      customers: store.customers.filter(item => item.id !== customerId),
      sales: store.sales.filter(sale => sale.customerId !== customerId),
      reminders: store.reminders.filter(reminder => reminder.customerId !== customerId),
      notifications: store.notifications.filter(notification => (
        notification.relatedCustomerId !== customerId && !removedSaleIds.has(notification.relatedId || '')
      ))
    })
    if (editingCustomerId === customerId) resetForm()
    setSelectedCustomerId(current => current === customerId ? null : current)
    reload()
  }

  if (isLoading) {
    return <p className="empty-state">Loading customers...</p>
  }

  if (error) {
    return (
      <section className="data-card">
        <p className="eyebrow">Customers</p>
        <h3>Error loading customers</h3>
        <p>{error.message}</p>
      </section>
    )
  }

  return (
    <div className="customers-workspace">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Customers</p>
          <h2>Customer database</h2>
        </div>
        <p className="panel-help">Create, edit, search, and manage customer relationships in one place.</p>
      </div>

      <div className="customers-main-grid">
        <section className="data-card customer-record-panel">
          <p className="eyebrow">Customer record</p>
          <h3>Customer form</h3>
          <form className="crm-form customer-form" onSubmit={saveCustomer} noValidate>
            <label>Business Name<input type="text" value={form.businessName} onChange={event => updateForm('businessName', event.target.value)} required /></label>
            <label>Business Address<input type="text" value={form.businessAddress} onChange={event => updateForm('businessAddress', event.target.value)} required /></label>
            <label>Contact Person<input type="text" value={form.contactPerson} onChange={event => updateForm('contactPerson', event.target.value)} required /></label>
            <label>Email Address<input type="email" value={form.emailAddress} onChange={event => updateForm('emailAddress', event.target.value)} required /></label>
            <label>Phone Number<input type="tel" value={form.phoneNumber} onChange={event => updateForm('phoneNumber', event.target.value)} required /></label>
            <label>Customer Status
              <select value={form.customerStatus} onChange={event => updateForm('customerStatus', event.target.value)}>
                <option value="Prospect">Prospect</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label>Notes<textarea value={form.notes} onChange={event => updateForm('notes', event.target.value)} rows={3} /></label>
            <div className="form-actions">
              <button type="submit" className="primary-btn">{editingCustomerId ? 'Update Customer' : 'Save Customer'}</button>
              <button type="button" className="secondary-btn" onClick={resetForm}>Clear</button>
            </div>
          </form>
        </section>

        <section className="data-card customer-view-panel">
          <p className="eyebrow">Find & sort</p>
          <h3>Customer views</h3>
          <div className="filter-grid customer-filter-grid">
            <label>Search<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by business, contact, or email" /></label>
            <label>Filter by Status
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
                <option value="All">All</option>
                <option value="Prospect">Prospect</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <label>Sort By
              <select value={sortField} onChange={event => setSortField(event.target.value as SortField)}>
                <option value="dateCreated">Date Created</option>
                <option value="businessName">Business Name</option>
                <option value="lastContactDate">Last Contact Date</option>
                <option value="customerStatus">Customer Status</option>
              </select>
            </label>
            <label>Direction
              <select value={sortDirection} onChange={event => setSortDirection(event.target.value as SortDirection)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
          </div>

          <CustomerList
            customers={visibleCustomers}
            selectedCustomerId={selectedCustomerId}
            onView={setSelectedCustomerId}
            onEdit={editCustomer}
            onDelete={deleteCustomer}
          />
        </section>
      </div>

      {selectedCustomer ? (
        <CustomerDetail
          customer={selectedCustomer}
          sales={data.sales}
          formatDate={formatDate}
          onReorder={handleReorder}
        />
      ) : null}
    </div>
  )
}

type CustomerListProps = {
  customers: Customer[]
  selectedCustomerId: string | null
  onView: (customerId: string) => void
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
}

function CustomerList({ customers, selectedCustomerId, onView, onEdit, onDelete }: CustomerListProps) {
  if (!customers.length) {
    return <p className="empty-state">No customer records match the current filters.</p>
  }

  return (
    <div className="customer-card-list-wrap">
      <div className="customer-list-grid">
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            selected={selectedCustomerId === customer.id}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

type CustomerCardProps = {
  customer: Customer
  selected: boolean
  onView: (customerId: string) => void
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
}

function CustomerCard({ customer, selected, onView, onEdit, onDelete }: CustomerCardProps) {
  const notesPreview = customer.notes || customer.noteEntries?.[0]?.text || ''

  return (
    <article className={`customer-card row-clickable${selected ? ' row-selected' : ''}`}>
      <div className="customer-card-header">
        <div className="customer-card-title-group">
          <strong className="customer-card-title">{customer.businessName}</strong>
          <div className="customer-card-subtext">{customer.businessAddress || 'No address on file'}</div>
        </div>
        <span className={`tag customer-status ${normalize(customer.customerStatus)} customer-card-status`}>
          {customer.customerStatus || 'Unknown'}
        </span>
      </div>

      <div className="customer-card-details">
        <CustomerField label="Contact" value={customer.contactPerson || 'No contact'} />
        <CustomerField label="Phone" value={customer.phoneNumber || 'No phone'} />
        <CustomerField label="Email" value={customer.emailAddress || 'No email'} />
        <CustomerField label="Last Contact" value={formatDate(customer.lastContactDate || customer.dateCreated)} />
      </div>

      {notesPreview ? (
        <div className="customer-card-notes">
          <span className="field-label">Notes</span>
          <p>{notesPreview}</p>
        </div>
      ) : null}

      <div className="customer-actions customer-card-actions">
        <button className="info-btn compact-action" type="button" onClick={() => onView(customer.id)}>View</button>
        <button className="edit-btn compact-action" type="button" onClick={() => onEdit(customer)}>Edit</button>
        <button className="delete-btn compact-action" type="button" onClick={() => onDelete(customer.id)}>Delete</button>
      </div>
    </article>
  )
}

function CustomerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="customer-card-field">
      <span className="field-label">{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
