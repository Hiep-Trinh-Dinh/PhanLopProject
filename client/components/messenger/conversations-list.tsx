"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

interface Conversation {
  id: number
  user: {
    name: string
    avatar: string
    isOnline: boolean
  }
  lastMessage: string
  timestamp: string
  unreadCount?: number
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder-user.jpg",
      isOnline: true,
    },
    lastMessage: "Hey, how's it going?",
    timestamp: "2m",
    unreadCount: 2,
  },
  {
    id: 2,
    user: {
      name: "Sarah Wilson",
      avatar: "/placeholder-user.jpg",
      isOnline: false,
    },
    lastMessage: "The project looks great! 👍",
    timestamp: "1h",
  },
  {
    id: 3,
    user: {
      name: "Michael Brown",
      avatar: "/placeholder-user.jpg",
      isOnline: true,
    },
    lastMessage: "Can we schedule a meeting?",
    timestamp: "3h",
    unreadCount: 1,
  },
  {
    id: 4,
    user: {
      name: "Emily Davis",
      avatar: "/placeholder-user.jpg",
      isOnline: false,
    },
    lastMessage: "Thanks for your help!",
    timestamp: "1d",
  },
]

export default function ConversationsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [conversations, setConversations] = useState(mockConversations)

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full flex-col border-r border-gray-800">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 pl-10 text-sm text-white placeholder-gray-400 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className="flex items-center space-x-3 border-b border-gray-800 p-4 hover:bg-gray-800"
          >
            <div className="relative h-12 w-12">
              <img
                src={conversation.user.avatar}
                alt={conversation.user.name}
                className="h-full w-full rounded-full object-cover"
              />
              {conversation.user.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white truncate">{conversation.user.name}</h3>
                <span className="text-xs text-gray-400">{conversation.timestamp}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
            </div>
            {conversation.unreadCount && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
                {conversation.unreadCount}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

