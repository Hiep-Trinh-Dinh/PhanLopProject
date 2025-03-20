"use client"

import { useState } from "react"
import NotificationItem from "./notification-item"
import NotificationsHeader from "./notifications-header"

interface User {
  id: number
  name: string
  username: string
  avatar: string
}

interface Notification {
  id: number
  type: "like" | "comment" | "friend_request" | "friend_accepted" | "group_invite" | "mention"
  content: string
  time: string
  isRead: boolean
  user: User
  link?: string
  actionLink?: string
  actionText?: string
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "like",
    content: "liked your post",
    time: "2 minutes ago",
    isRead: false,
    user: {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      avatar: "/placeholder-user.jpg",
    },
    link: "/post/123",
  },
  {
    id: 2,
    type: "friend_request",
    content: "sent you a friend request",
    time: "1 hour ago",
    isRead: false,
    user: {
      id: 2,
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: 3,
    type: "comment",
    content: "commented on your post",
    time: "2 hours ago",
    isRead: true,
    user: {
      id: 3,
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "/placeholder-user.jpg",
    },
    link: "/post/456",
    actionLink: "/post/456",
    actionText: "View comment",
  },
  {
    id: 4,
    type: "group_invite",
    content: "invited you to join Web Developers Group",
    time: "1 day ago",
    isRead: true,
    user: {
      id: 4,
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "/placeholder-user.jpg",
    },
    actionLink: "/groups/789",
    actionText: "View group",
  },
]

export default function NotificationsList() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
  }

  const handleAcceptFriendRequest = (id: number) => {
    // In a real app, you would make an API call here
    console.log("Accepting friend request:", id)
    handleMarkAsRead(id)
  }

  const handleRejectFriendRequest = (id: number) => {
    // In a real app, you would make an API call here
    console.log("Rejecting friend request:", id)
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-4">
        <NotificationsHeader unreadCount={unreadCount} onMarkAllAsRead={handleMarkAllAsRead} />
        <div className="space-y-4 p-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onMarkAsRead={handleMarkAsRead}
              onAcceptFriendRequest={
                notification.type === "friend_request" ? handleAcceptFriendRequest : undefined
              }
              onRejectFriendRequest={
                notification.type === "friend_request" ? handleRejectFriendRequest : undefined
              }
            />
          ))}
          {notifications.length === 0 && (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center">
              <p className="text-gray-400">No notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}