import React, { useMemo } from 'react'
import { useLocalStorageAdapter } from '@/hooks/useLocalStorageAdapter'
import type { Reminder } from '@/types'
import ReminderCard from '@/components/ReminderCard'

function normalizeReminderStatus(reminder: Reminder) {
  if (reminder.status) return reminder.status
  if (reminder.completed === true) return 'Completed'
  if (reminder.completed === false) return 'Open'
  return 'Open'
}

export default function Reminders() {
  const { data, isLoading, error } = useLocalStorageAdapter()

  const remindersWithCustomer = useMemo(() => {
    return data.reminders
      .map(reminder => {
        const customerName = data.customers.find(customer => customer.id === reminder.customerId)?.businessName
        return {
          reminder,
          customerName: customerName ?? 'Unknown customer',
          status: normalizeReminderStatus(reminder)
        }
      })
      .sort((a, b) => {
        const dateA = a.reminder.dueDate ?? a.reminder.date ?? ''
        const dateB = b.reminder.dueDate ?? b.reminder.date ?? ''
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return new Date(dateA).getTime() - new Date(dateB).getTime()
      })
  }, [data.customers, data.reminders])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reminders</h1>
        <p className="text-slate-600">Read-only list of reminders sourced from legacy CRM localStorage.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">Unable to load reminders.</p>
          <p>{error.message}</p>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          Loading reminders...
        </div>
      ) : remindersWithCustomer.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-700">
          <p className="text-lg font-semibold">No reminders found.</p>
          <p className="mt-2 text-sm text-slate-500">Reminders saved by the legacy CRM will appear here once localStorage is populated.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {remindersWithCustomer.map(({ reminder, customerName }) => (
            <ReminderCard key={reminder.id} reminder={{ ...reminder, status: normalizeReminderStatus(reminder) }} customerName={customerName} />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
        <p className="font-semibold">Read-only reminder list</p>
        <p>Users cannot create, edit, delete, or complete reminders from this view. This page only displays existing reminder data from legacy CRM localStorage.</p>
      </div>
    </div>
  )
}
