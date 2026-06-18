import type { Reminder } from '@/types'

interface Props {
  monthDate: Date
  reminders: Reminder[]
  onDayClick?: (dateIso: string) => void
  onEdit?: (reminder: Reminder) => void
}

function getMonthMatrix(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<(number | null)> = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const rows: number[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7) as number[])
  }
  return rows
}

function toIsoDate(year: number, month: number, day: number) {
  const d = new Date(year, month, day)
  return d.toISOString().slice(0, 10)
}

export default function CalendarMonthView({ monthDate, reminders, onDayClick, onEdit }: Props) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const matrix = getMonthMatrix(monthDate)

  const remindersByDate = reminders.reduce<Record<string, Reminder[]>>((acc, r) => {
    const key = (r.dueDate || r.date || '').slice(0, 10)
    if (!key) return acc
    acc[key] = acc[key] || []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{monthDate.toLocaleString('default', { month: 'long' })} {year}</h2>
        <p className="text-sm text-slate-600">Click a day to create a reminder</p>
      </div>

      <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
          <div key={day} className="text-xs font-semibold text-slate-500 text-center">{day}</div>
        ))}

        {matrix.map((row, rIndex) => (
          row.map((day, cIndex) => {
            const key = `${rIndex}-${cIndex}`
            if (!day) {
              return <div key={key} className="h-24 rounded-lg border border-slate-100 bg-slate-50" />
            }
            const iso = toIsoDate(year, month, day)
            const dayRems = remindersByDate[iso] || []
            return (
              <div key={key} className="h-28 rounded-lg border border-slate-100 p-2 bg-white" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="flex items-start justify-between">
                  <div className="text-sm font-semibold">{day}</div>
                  <button type="button" onClick={() => onDayClick?.(iso)} className="text-xs text-blue-600">New</button>
                </div>
                <div className="mt-2 overflow-auto text-xs">
                  {dayRems.length === 0 ? (
                    <div className="text-slate-400">No reminders</div>
                  ) : (
                    dayRems.slice(0,3).map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                        <div>
                          <button type="button" onClick={() => onEdit?.(r)} className="text-xs text-slate-600">Edit</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })
        ))}
      </div>
    </div>
  )
}
