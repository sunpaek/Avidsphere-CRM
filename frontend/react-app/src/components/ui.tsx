import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string
  title?: string
  children: ReactNode
}

export function Card({ eyebrow, title, children, className = '', ...props }: CardProps) {
  return (
    <section className={`data-card ${className}`.trim()} {...props}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  )
}

type PanelHeaderProps = {
  eyebrow?: string
  title: string
  help?: string
  children?: ReactNode
}

export function SectionHeader({ eyebrow, title, help, children }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {children ? children : help ? <p className="panel-help">{help}</p> : null}
    </div>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'edit' | 'delete' | 'complete' | 'info'
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  const classMap = {
    primary: 'primary-btn',
    secondary: 'secondary-btn',
    edit: 'edit-btn',
    delete: 'delete-btn',
    complete: 'complete-btn',
    info: 'info-btn'
  }

  return <button className={`${classMap[variant]} ${className}`.trim()} {...props} />
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'active' | 'prospect' | 'closed' | 'mailer' | 'print' | 'digital' | 'unread'
  children: ReactNode
}

export function Badge({ tone = 'active', className = '', children, ...props }: BadgeProps) {
  return (
    <span className={`tag ${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
