"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Info, MoreHorizontal, Phone, Send, Video } from "lucide-react"

interface ConversationProps {
  user: {
    id: number
    name: string
    username: string
    avatar: string
    isOnline: boolean
    lastActive: string
  }
}

const mockMessages = [
  {
    id: 1,
    text: "Hey there! How's it going?",
    time: "10:30 AM",
    isFromMe: false,
    status: "read",
  },
  {
    id: 2,
    text: "Hi! I'm doing well, thanks for asking. Just working on a new project.",
    time: "10:32 AM",
    isFromMe: true,
    status: "read",
  },
  {
    id: 3,
    text: "That sounds interesting! What kind of project is it?",
    time: "10:33 AM",
    isFromMe: false,
    status: "read",
  },
  {
    id: 4,
    text: "It's a social networking app built with React and Next.js. I'm trying to implement some new features.",
    time: "10:35 AM",
    isFromMe: true,
    status: "read",
  },
  {
    id: 5,
    text: "That's awesome! I've been working with React a lot lately too. Let me know if you need any help with it.",
    time: "10:36 AM",
    isFromMe: false,
    status: "read",
  },
  {
    id: 6,
    text: "Thanks, I appreciate that! I might take you up on that offer. How's your week been so far?",
    time: "10:38 AM",
    isFromMe: true,
    status: "read",
  },
  {
    id: 7,
    text: "Pretty busy, but good! I've been working on a few client projects and trying to learn some new technologies in my spare time.",
    time: "10:40 AM",
    isFromMe: false,
    status: "read",
  },
]

export default function Conversation({ user }: ConversationProps) {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isFromMe: true,
      status: "sent" as const,
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              {user.name.charAt(0)}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-white">{user.name}</h3>
            <p className="text-xs text-gray-400">{user.lastActive}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-800">
            <Phone className="h-5 w-5" />
            <span className="sr-only">Call</span>
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-800">
            <Video className="h-5 w-5" />
            <span className="sr-only">Video call</span>
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-800">
            <Info className="h-5 w-5" />
            <span className="sr-only">Info</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-800"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">More options</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                  onClick={() => setShowDropdown(false)}
                >
                  Mute conversation
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                  onClick={() => setShowDropdown(false)}
                >
                  Search in conversation
                </button>
                <div className="h-px bg-gray-800" />
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                  onClick={() => setShowDropdown(false)}
                >
                  Block user
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isFromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.isFromMe ? "bg-blue-600 text-white" : "bg-gray-800 text-white"
                }`}
              >
                <p>{message.text}</p>
                <div
                  className={`mt-1 flex items-center text-xs ${message.isFromMe ? "text-blue-200" : "text-gray-400"}`}
                >
                  {message.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}

