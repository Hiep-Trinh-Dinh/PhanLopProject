"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle, Search, UserMinus } from "lucide-react"

const mockFriends = [
  {
    id: 1,
    name: "Jane Smith",
    avatar: "/placeholder-user.jpg",
    username: "janesmith",
    mutualFriends: 12,
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/placeholder-user.jpg",
    username: "mikejohnson",
    mutualFriends: 8,
  },
  {
    id: 3,
    name: "Sarah Williams",
    avatar: "/placeholder-user.jpg",
    username: "sarahwilliams",
    mutualFriends: 15,
  },
  {
    id: 4,
    name: "David Brown",
    avatar: "/placeholder-user.jpg",
    username: "davidbrown",
    mutualFriends: 5,
  },
  {
    id: 5,
    name: "Emily Davis",
    avatar: "/placeholder-user.jpg",
    username: "emilydavis",
    mutualFriends: 10,
  },
  {
    id: 6,
    name: "Chris Wilson",
    avatar: "/placeholder-user.jpg",
    username: "chriswilson",
    mutualFriends: 3,
  },
]

export default function FriendsList() {
  const [friends, setFriends] = useState(mockFriends)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFriends = friends.filter((friend) => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const removeFriend = (friendId: number) => {
    setFriends(friends.filter((friend) => friend.id !== friendId))
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold select-none pointer-events-none">
          All Friends ({friends.length})
        </h2>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search friends"
            className="w-full border-0 bg-transparent p-0 text-white placeholder-gray-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex flex-col rounded-lg border border-gray-800 bg-gray-800 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    {friend.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/profile/${friend.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {friend.name}
                  </Link>
                  <p className="text-xs text-gray-400 select-none pointer-events-none">
                    {friend.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Link
                  href={`/messages/${friend.username}`}
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  <span>Message</span>
                </Link>
                <button
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                  onClick={() => removeFriend(friend.id)}
                >
                  <UserMinus className="mr-1 h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

