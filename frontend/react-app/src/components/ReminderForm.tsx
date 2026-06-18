import React, { useState } from 'react'
import type { Reminder, Customer } from '@/types'

interface Props {
  reminder: Reminder
  customers: Customer[]
  currentUserName?: string
  onSave: (r: Reminder) => void
  onCancel: () => void
}

export default function ReminderForm({ reminder, customers, currentUserName = 'Sunny', onSave, onCancel }: Props) {
  const [form, setForm] = useState<Reminder>(reminder)

  function update<K extends keyof Reminder>(k: K, v: Reminder[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ ...form, assignedTo: form.assignedTo || currentUserName })
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{form.id ? (form.title ? 'Edit Reminder' : 'New Reminder') : 'New Reminder'}</h3>
          <button onClick={onCancel} aria-label="Close">x</button>
        </header>
        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <div className="form-row">
            <div className="form-field">
              <label>Title</label>
              <input value={form.title || ''} onChange={(e) => update('title', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Customer</label>
              <select value={form.customerId || ''} onChange={(e) => update('customerId', e.target.value || undefined)}>
                <option value="">(Unassigned)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.businessName}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Due date</label>
              <input type="date" value={form.dueDate ? String(form.dueDate).slice(0,10) : ''} onChange={(e) => update('dueDate', e.target.value || undefined)} />
            </div>
          </div>

          <div className="form-row">
            <div style={{ flex: 1 }}>
              <label>Notes</label>
              <textarea value={form.notes || ''} onChange={(e) => update('notes', e.target.value || undefined)} rows={4} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="primary">Save Reminder</button>
          </div>
        </form>
      </div>
    </div>
  )
}
