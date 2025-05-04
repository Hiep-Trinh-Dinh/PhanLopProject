"use client"

import { useState, useEffect, SetStateAction } from "react"
import dynamic from 'next/dynamic'
import { NotificationDto } from "../lib/api"

const NotificationsList = dynamic(() => import("@/components/notifications/notifications-list"), {
  ssr: false
})

const NotificationsHeader = dynamic(() => import("@/components/notifications/notifications-header"), {
  ssr: false
})

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
  }
]

export default function NotificationsContent() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    setNotifications(mockNotifications)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <NotificationsHeader/>
      <NotificationsList 
        onUpdateUnread={setUnreadCount} notifications={[]} setNotifications={function (value: SetStateAction<NotificationDto[]>): void {
          throw new Error("Function not implemented.")
        } }      />
    </div>
  )
}