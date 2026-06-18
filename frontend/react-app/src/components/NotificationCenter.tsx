import React, { useState } from 'react'
import type { Notification } from '@/types'

interface Props {
  notifications: Notification[]
  onMarkRead?: (notificationId: string) => void
  onArchive?: (notificationId: string) => void
  onDelete?: (notificationId: string) => void
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onArchive,
  onDelete
}: Props) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'archived') return n.archived
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-700">
        <p className="text-lg font-semibold">No notifications</p>
        <p className="mt-2 text-sm text-slate-500">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Unread {unreadCount > 0 && <span className="ml-1 font-bold">({unreadCount})</span>}
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            filter === 'archived'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Archived
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
          <p>No {filter} notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 transition ${
                notification.read
                  ? 'border-slate-200 bg-white'
                  : 'border-blue-300 bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${
                      notification.read ? 'text-slate-900' : 'text-blue-900'
                    }`}>
                      {notification.title}
                    </h3>
                    {notification.priority === 'High' && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        High
                      </span>
                    )}
                    {!notification.read && (
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Assigned Department: <span className="font-medium">{notification.recipientRole}</span>
                  </p>
                  {notification.source && (
                    <p className="mt-2 text-xs text-slate-500">
                      From: <span className="font-medium">{notification.source}</span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => onMarkRead?.(notification.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition"
                      title="Mark as read"
                    >Mark read</button>
                  )}
                  {!notification.archived && (
                    <button
                      onClick={() => onArchive?.(notification.id)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition"
                      title="Archive"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => onDelete?.(notification.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                    title="Delete"
                  >Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

