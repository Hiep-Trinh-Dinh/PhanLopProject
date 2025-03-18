"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Edit, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder-user.jpg",
      isOnline: true,
      lastActive: "Active now",
    },
    lastMessage: {
      text: "Hey, how's it going?",
      time: "2m ago",
      isRead: true,
      isFromMe: false,
    },
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "/placeholder-user.jpg",
      isOnline: false,
      lastActive: "Active 30m ago",
    },
    lastMessage: {
      text: "I'll send you the files tomorrow",
      time: "1h ago",
      isRead: true,
      isFromMe: true,
    },
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Sarah Williams",
      username: "sarahwilliams",
      avatar: "/placeholder-user.jpg",
      isOnline: true,
      lastActive: "Active now",
    },
    lastMessage: {
      text: "Did you see the new React update?",
      time: "3h ago",
      isRead: false,
      isFromMe: false,
    },
  },
  {
    id: 4,
    user: {
      id: 4,
      name: "David Brown",
      username: "davidbrown",
      avatar: "/placeholder-user.jpg",
      isOnline: false,
      lastActive: "Active yesterday",
    },
    lastMessage: {
      text: "Let's catch up this weekend!",
      time: "1d ago",
      isRead: true,
      isFromMe: false,
    },
  },
  {
    id: 5,
    user: {
      id: 5,
      name: "Emily Davis",
      username: "emilydavis",
      avatar: "/placeholder-user.jpg",
      isOnline: false,
      lastActive: "Active 2d ago",
    },
    lastMessage: {
      text: "Thanks for your help with the project",
      time: "2d ago",
      isRead: true,
      isFromMe: false,
    },
  },
]

export default function ConversationsList() {
  const [conversations] = useState(mockConversations)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Edit className="h-5 w-5" />
            <span className="sr-only">New message</span>
          </Button>
        </div>
        <div className="mt-3 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages"
            className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-400">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredConversations.map((conversation) => {
              const isActive = pathname === `/messages/${conversation.user.username}`

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.user.username}`}
                  className={`block p-4 transition-colors hover:bg-gray-800 ${isActive ? "bg-gray-800" : ""}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                        <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.user.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-gray-900"></span>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate font-medium text-white">{conversation.user.name}</h3>
                        <span className="text-xs text-gray-400">{conversation.lastMessage.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p
                          className={`truncate text-sm ${
                            !conversation.lastMessage.isRead && !conversation.lastMessage.isFromMe
                              ? "font-medium text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {conversation.lastMessage.isFromMe && "You: "}
                          {conversation.lastMessage.text}
                        </p>
                        {!conversation.lastMessage.isRead && !conversation.lastMessage.isFromMe && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

