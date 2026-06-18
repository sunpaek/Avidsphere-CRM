import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
const TOAST_DURATION = 4500

const toastLabels: Record<ToastVariant, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info'
}

const toastIcons: Record<ToastVariant, string> = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i'
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setToasts(current => [...current, { id, message, variant }])
    window.setTimeout(() => dismiss(id), TOAST_DURATION)
  }, [dismiss])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <button
            key={toast.id}
            type="button"
            className={`toast toast--${toast.variant} toast--visible`}
            onClick={() => dismiss(toast.id)}
            aria-label={`Dismiss ${toastLabels[toast.variant]} notification`}
          >
            <span className="toast__icon" aria-hidden="true">{toastIcons[toast.variant]}</span>
            <span className="toast__content">
              <strong className="toast__title">{toastLabels[toast.variant]}</strong>
              <span className="toast__message">{toast.message}</span>
            </span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
