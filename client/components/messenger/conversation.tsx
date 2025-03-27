"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Phone, Video, Info, MoreVertical, Send } from "lucide-react"

interface Message {
  id: number
  content: string
  timestamp: string
  isSent: boolean
}

interface ConversationProps {
  user: {
    id: number
    name: string
    username: string
    avatar: string
    isOnline: boolean
    lastActive?: string
  }
}

export default function Conversation({ user }: ConversationProps) {
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hey there!",
      timestamp: "2:30 PM",
      isSent: false,
    },
    // ... more messages
  ])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
    setMounted(true)
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: messages.length + 1,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isSent: true,
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  if (!mounted) {
    return null // or return loading skeleton
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              className="rounded-full object-cover"
            />
            {user.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500" />
            )}
          </div>
          <div>
            <h2 className="font-medium text-white">{user.name}</h2>
            <p className="text-sm text-gray-400">
              {user.isOnline ? "Online" : `Last seen ${user.lastActive}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-gray-800">
            <Phone className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 hover:bg-gray-800">
            <Video className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 hover:bg-gray-800">
            <Info className="h-5 w-5" />
          </button>
          <button className="rounded-full p-2 hover:bg-gray-800">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.isSent ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                message.isSent
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              <p>{message.content}</p>
              <p className="mt-1 text-right text-xs text-gray-300">
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="rounded-full bg-blue-600 p-2 hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

