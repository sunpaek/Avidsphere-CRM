import type { Reminder } from '@/types'

type ReminderCardProps = {
  reminder: Reminder
  customerName: string
  onEdit?: () => void
  onDelete?: () => void
  onToggleComplete?: (completed: boolean) => void
}

function formatReminderDate(value?: string) {
  if (!value) return 'No due date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getBadgeStyles(type: 'status' | 'priority', value?: string) {
  const normalized = value?.toLowerCase() ?? ''

  if (type === 'status') {
    if (normalized === 'completed') return 'bg-green-50 text-green-800 border-green-200'
    if (normalized === 'open' || normalized === 'pending') return 'bg-yellow-50 text-yellow-800 border-yellow-200'
    if (normalized === 'overdue') return 'bg-red-50 text-red-800 border-red-200'
    return 'bg-slate-100 text-slate-800 border-slate-300'
  }

  if (type === 'priority') {
    if (normalized === 'high') return 'bg-rose-50 text-rose-800 border-rose-200'
    if (normalized === 'normal' || normalized === 'medium') return 'bg-blue-50 text-blue-800 border-blue-200'
    if (normalized === 'low') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    return 'bg-slate-100 text-slate-800 border-slate-300'
  }

  return 'bg-slate-100 text-slate-800 border-slate-300'
}

export default function ReminderCard({ reminder, customerName, onEdit, onDelete, onToggleComplete }: ReminderCardProps) {
  const dueDateText = formatReminderDate(reminder.dueDate ?? reminder.date)
  const statusLabel = reminder.status ?? (reminder.completed ? 'Completed' : 'Open')
  const completed = Boolean(reminder.completed)

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reminder</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{reminder.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{customerName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeStyles('status', statusLabel)}`}>
              {statusLabel}
            </span>
            {reminder.priority ? (
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeStyles('priority', reminder.priority)}`}>
                {reminder.priority}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <span className="font-semibold text-slate-800">Due date:</span> {dueDateText}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Completed:</span> {completed ? 'Completed' : 'Pending'}
          </div>
          <div>
            <span className="font-semibold text-slate-800">Notes:</span>{' '}
            {reminder.notes ? <span className="text-slate-700">{reminder.notes}</span> : <span className="text-slate-500">None</span>}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3">
          {onEdit && <button type="button" onClick={onEdit} className="secondary">Edit</button>}
          {onToggleComplete && (
            <button type="button" onClick={() => onToggleComplete(!completed)} className="secondary">
              {completed ? 'Mark Open' : 'Complete'}
            </button>
          )}
          {onDelete && <button type="button" onClick={onDelete} className="danger">Delete</button>}
        </div>
      </div>
    </article>
  )
}
