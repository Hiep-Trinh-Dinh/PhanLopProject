"use client"

interface NotificationsHeaderProps {
  unreadCount: number
  onMarkAllAsRead: () => void
}

export default function NotificationsHeader({ unreadCount, onMarkAllAsRead }: NotificationsHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-800 p-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Notifications</h2>
        {unreadCount > 0 && (
          <p className="mt-1 text-sm text-gray-400">You have {unreadCount} unread notifications</p>
        )}
      </div>
      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Mark all as read
        </button>
      )}
    </div>
  )
}

