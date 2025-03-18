"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, MessageCircle, ThumbsUp, UserPlus, Users, Bell } from "lucide-react"

// Define notification types
type NotificationType = "like" | "comment" | "friend_request" | "friend_accepted" | "group_invite" | "mention"

interface Notification {
  id: number
  type: NotificationType
  content: string
  time: string
  isRead: boolean
  user: {
    id: number
    name: string
    username: string
    avatar: string
  }
  link?: string
  actionLink?: string
  actionText?: string
  secondaryAction?: {
    text: string
    link: string
  }
}

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "friend_request",
    content: "sent you a friend request",
    time: "2 minutes ago",
    isRead: false,
    user: {
      id: 1,
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: 2,
    type: "like",
    content: "liked your post",
    time: "15 minutes ago",
    isRead: false,
    user: {
      id: 2,
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "/placeholder-user.jpg",
    },
    link: "/home",
  },
  {
    id: 3,
    type: "comment",
    content: 'commented on your post: "Great photo! Where was this taken?"',
    time: "1 hour ago",
    isRead: true,
    user: {
      id: 3,
      name: "Sarah Williams",
      username: "sarahwilliams",
      avatar: "/placeholder-user.jpg",
    },
    link: "/home",
  },
  {
    id: 4,
    type: "group_invite",
    content: "invited you to join the group React Developers",
    time: "3 hours ago",
    isRead: false,
    user: {
      id: 4,
      name: "David Brown",
      username: "davidbrown",
      avatar: "/placeholder-user.jpg",
    },
    link: "/groups/1",
    actionText: "View Group",
    actionLink: "/groups/1",
  },
  {
    id: 5,
    type: "friend_accepted",
    content: "accepted your friend request",
    time: "5 hours ago",
    isRead: true,
    user: {
      id: 5,
      name: "Emily Davis",
      username: "emilydavis",
      avatar: "/placeholder-user.jpg",
    },
    actionText: "Message",
    actionLink: "/messages/emilydavis",
  },
  {
    id: 6,
    type: "mention",
    content: 'mentioned you in a comment: "@johndoe what do you think about this?"',
    time: "1 day ago",
    isRead: true,
    user: {
      id: 6,
      name: "Chris Wilson",
      username: "chriswilson",
      avatar: "/placeholder-user.jpg",
    },
    link: "/home",
  },
  {
    id: 7,
    type: "like",
    content: "liked your comment",
    time: "1 day ago",
    isRead: true,
    user: {
      id: 7,
      name: "Alex Johnson",
      username: "alexjohnson",
      avatar: "/placeholder-user.jpg",
    },
    link: "/home",
  },
  {
    id: 8,
    type: "comment",
    content: 'replied to your comment: "I completely agree with you!"',
    time: "2 days ago",
    isRead: true,
    user: {
      id: 8,
      name: "Taylor Smith",
      username: "taylorsmith",
      avatar: "/placeholder-user.jpg",
    },
    link: "/home",
  },
]

export default function NotificationsList() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (notificationId: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    )
  }

  const acceptFriendRequest = (notificationId: number) => {
    // In a real app, you would handle accepting the friend request
    console.log("Accepting friend request for notification:", notificationId)
    markAsRead(notificationId)
  }

  const rejectFriendRequest = (notificationId: number) => {
    // In a real app, you would handle rejecting the friend request
    console.log("Rejecting friend request for notification:", notificationId)
    markAsRead(notificationId)
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-5 w-5 text-blue-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case "friend_request":
        return <UserPlus className="h-5 w-5 text-purple-500" />
      case "friend_accepted":
        return <Check className="h-5 w-5 text-green-500" />
      case "group_invite":
        return <Users className="h-5 w-5 text-yellow-500" />
      case "mention":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center border-gray-800 bg-gray-900">
          <Bell className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold">No notifications</h3>
          <p className="text-gray-400 mt-2">
            You don't have any notifications at the moment. We'll notify you when something happens.
          </p>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 border-gray-800 ${
              notification.isRead ? "bg-gray-900" : "bg-gray-800"
            } transition-colors hover:bg-gray-800`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                  <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute -right-1 -top-1 rounded-full p-1 bg-gray-900">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/profile/${notification.user.username}`}
                      className="font-semibold text-white hover:underline"
                    >
                      {notification.user.name}
                    </Link>{" "}
                    <span className="text-gray-300">{notification.content}</span>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 ml-2 flex-shrink-0"></div>
                  )}
                </div>

                {notification.type === "friend_request" && (
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => acceptFriendRequest(notification.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-700 hover:text-white"
                      onClick={() => rejectFriendRequest(notification.id)}
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {notification.actionText && notification.actionLink && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-700 hover:text-white"
                      asChild
                    >
                      <Link href={notification.actionLink}>{notification.actionText}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

