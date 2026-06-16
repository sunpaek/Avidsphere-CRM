import type { ReactNode } from 'react'

const accentStyles: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  gray: 'bg-gray-50 border-gray-200 text-gray-700'
}

type DashboardCardProps = {
  title: string
  value: string | number
  description?: string
  accent?: keyof typeof accentStyles
  children?: ReactNode
}

export default function DashboardCard({
  title,
  value,
  description,
  accent = 'blue',
  children
}: DashboardCardProps) {
  return (
    <div className={`p-5 rounded-xl border shadow-sm ${accentStyles[accent]}`}>
      <div className="text-sm font-semibold uppercase tracking-wide mb-2">{title}</div>
      <div className="text-4xl font-extrabold leading-none mb-2">{value}</div>
      {description ? <div className="text-sm text-slate-600 mb-3">{description}</div> : null}
      {children}
    </div>
  )
}
