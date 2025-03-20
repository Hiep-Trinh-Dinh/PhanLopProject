"use client"

import Link from "next/link"
import { Bell, Check, MessageCircle, ThumbsUp, UserPlus, Users } from "lucide-react"

type NotificationType = "like" | "comment" | "friend_request" | "friend_accepted" | "group_invite" | "mention"

interface NotificationItemProps {
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
  onMarkAsRead: (id: number) => void
  onAcceptFriendRequest?: (id: number) => void
  onRejectFriendRequest?: (id: number) => void
}

export default function NotificationItem({
  id,
  type,
  content,
  time,
  isRead,
  user,
  link,
  actionLink,
  actionText,
  onMarkAsRead,
  onAcceptFriendRequest,
  onRejectFriendRequest,
}: NotificationItemProps) {
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
    <div
      className={`p-4 rounded-lg border ${
        isRead ? "border-gray-800 bg-gray-900" : "border-gray-700 bg-gray-800"
      } transition-colors hover:bg-gray-800`}
      onClick={() => onMarkAsRead(id)}
    >
      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              {user.name.charAt(0)}
            </div>
          </div>
          <div className="absolute -right-1 -top-1 rounded-full p-1 bg-gray-900">
            {getNotificationIcon(type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/profile/${user.username}`} className="font-semibold text-white hover:underline">
                {user.name}
              </Link>{" "}
              <span className="text-gray-300">{content}</span>
              <p className="text-xs text-gray-400 mt-1">{time}</p>
            </div>
            {!isRead && <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 ml-2 flex-shrink-0"></div>}
          </div>

          {type === "friend_request" && onAcceptFriendRequest && onRejectFriendRequest && (
            <div className="flex space-x-2 mt-3">
              <button
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onAcceptFriendRequest(id)
                }}
              >
                Accept
              </button>
              <button
                className="px-3 py-1.5 text-sm font-medium text-white border border-gray-700 rounded-md hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onRejectFriendRequest(id)
                }}
              >
                Decline
              </button>
            </div>
          )}

          {actionText && actionLink && (
            <div className="mt-3">
              <Link
                href={actionLink}
                className="inline-flex px-3 py-1.5 text-sm font-medium text-white border border-gray-700 rounded-md hover:bg-gray-700"
              >
                {actionText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

