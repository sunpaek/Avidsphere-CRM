import type { ReactNode } from 'react'

const accentStyles: Record<string, string> = {
  blue: 'accent-blue',
  green: 'accent-green',
  yellow: 'accent-yellow',
  purple: 'accent-purple',
  gray: 'accent-gray'
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
    <div className={`report-card ${accentStyles[accent]}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      {description ? <small>{description}</small> : null}
      {children}
    </div>
  )
}
