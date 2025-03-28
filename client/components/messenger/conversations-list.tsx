"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";

interface User {
  id: number;
  username: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

interface ConversationProps {
  onSelectUser: (user: User) => void;
}

export default function ConversationsList({ onSelectUser }: ConversationProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data matching with page.tsx users
  const conversations = [
    {
      id: 1,
      username: "janesmith",
      name: "Jane Smith",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Hey, how are you?",
      timestamp: "2m ago",
      unreadCount: 2,
      isOnline: true,
      lastActive: "Active now",
    },
    {
      id: 2,
      username: "mikejohnson",
      name: "Mike Johnson",
      avatar: "/placeholder-user.jpg",
      lastMessage: "See you tomorrow!",
      timestamp: "30m ago",
      unreadCount: 0,
      isOnline: false,
      lastActive: "Active 30m ago",
    },
    {
      id: 3,
      username: "sarahwilliams",
      name: "Sarah Williams",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Thanks for your help!",
      timestamp: "1h ago",
      unreadCount: 1,
      isOnline: true,
      lastActive: "Active now",
    },
  ];

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConversationClick = (conversation: (typeof conversations)[0]) => {
    const user = {
      id: conversation.id,
      username: conversation.username,
      name: conversation.name,
      avatar: conversation.avatar,
      isOnline: conversation.isOnline,
      lastActive: conversation.lastActive,
    };
    onSelectUser(user);
  };

  // Return null or loading state until mounted
  if (!mounted) {
    return null; // or return loading skeleton
  }

  return (
    <div className="flex h-full flex-col border-r border-gray-800">
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.id}
            className="flex w-full items-center gap-3 border-b border-gray-800 p-4 hover:bg-gray-800/50"
            onClick={() => handleConversationClick(conversation)}
          >
            <div className="relative h-12 w-12">
              <Image
                src={conversation.avatar}
                alt={conversation.name}
                fill
                className="rounded-full object-cover"
              />
              {conversation.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500" />
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">{conversation.name}</h3>
                <p className="text-sm text-gray-400">
                  {conversation.timestamp}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="truncate text-sm text-gray-400">
                  {conversation.lastMessage}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
