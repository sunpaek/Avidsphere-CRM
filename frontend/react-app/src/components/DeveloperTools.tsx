import { useState } from 'react'
import { resetDemoData } from '@/hooks/demoData'
import { notificationApi } from '@/services/notificationApi'
import { useToast } from './ToastProvider'

export default function DeveloperTools() {
  const { showToast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleResetDemoData = () => {
    setIsResetting(true)
    try {
      resetDemoData()
      showToast('Demo data was reset and all CRM views were refreshed.', 'success')
    } catch (error) {
      console.error('[DeveloperTools] Demo data reset failed:', error)
      showToast('Demo data could not be reset. Please try again.', 'error')
    } finally {
      setIsResetting(false)
    }
  }

  const handleSendTestEmail = async () => {
    setIsSendingEmail(true)
    try {
      const result = await notificationApi.sendTestEmail()
      if (!result.success) {
        throw new Error(result.message || 'The backend could not send the test email.')
      }
      showToast('Test email sent successfully through the CRM email service.', 'success')
    } catch (error) {
      console.error('[DeveloperTools] Test email failed:', error)
      showToast(
        error instanceof Error ? `Test email failed: ${error.message}` : 'Test email failed. Please try again.',
        'error'
      )
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <footer className="developer-tools" aria-label="Developer Tools">
      <div className="developer-tools__label">
        <span className="developer-tools__indicator" aria-hidden="true" />
        <div>
          <strong>Developer Tools</strong>
          <small>Internal demo and integration utilities</small>
        </div>
      </div>

      <div className="developer-tools__actions">
        <button
          type="button"
          className="developer-tool-btn developer-tool-btn--danger"
          onClick={handleResetDemoData}
          disabled={isResetting}
        >
          {isResetting ? 'Resetting…' : 'Reset Demo Data'}
        </button>
        <button
          type="button"
          className="developer-tool-btn"
          onClick={handleSendTestEmail}
          disabled={isSendingEmail}
        >
          {isSendingEmail ? 'Sending…' : 'Send Test Email'}
        </button>
      </div>
    </footer>
  )
}
