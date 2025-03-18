"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, UserMinus, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ProfileFriendsProps {
  userId: number
}

// Mock data for friends
const mockFriends = [
  {
    id: 1,
    name: "Jane Smith",
    avatar: "/placeholder-user.jpg",
    username: "janesmith",
    mutualFriends: 12,
    isFriend: true,
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/placeholder-user.jpg",
    username: "mikejohnson",
    mutualFriends: 8,
    isFriend: true,
  },
  {
    id: 3,
    name: "Sarah Williams",
    avatar: "/placeholder-user.jpg",
    username: "sarahwilliams",
    mutualFriends: 15,
    isFriend: true,
  },
  {
    id: 4,
    name: "David Brown",
    avatar: "/placeholder-user.jpg",
    username: "davidbrown",
    mutualFriends: 5,
    isFriend: true,
  },
  {
    id: 5,
    name: "Emily Davis",
    avatar: "/placeholder-user.jpg",
    username: "emilydavis",
    mutualFriends: 10,
    isFriend: true,
  },
  {
    id: 6,
    name: "Chris Wilson",
    avatar: "/placeholder-user.jpg",
    username: "chriswilson",
    mutualFriends: 3,
    isFriend: true,
  },
]

export default function ProfileFriends({ userId }: ProfileFriendsProps) {
  const [friends, setFriends] = useState(mockFriends)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleFriend = (friendId: number) => {
    setFriends(friends.map((friend) => (friend.id === friendId ? { ...friend, isFriend: !friend.isFriend } : friend)))
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Friends ({friends.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search friends"
            className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredFriends.map((friend) => (
            <div key={friend.id} className="flex flex-col rounded-lg border border-gray-800 bg-gray-800 p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={friend.avatar} alt={friend.name} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${friend.username}`} className="font-semibold text-white hover:underline">
                    {friend.name}
                  </Link>
                  <p className="text-xs text-gray-400">{friend.mutualFriends} mutual friends</p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="default" size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href={`/messages/${friend.username}`}>Message</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-700 hover:bg-gray-700 hover:text-white"
                  onClick={() => toggleFriend(friend.id)}
                >
                  {friend.isFriend ? (
                    <>
                      <UserMinus className="mr-1 h-4 w-4" />
                      Unfriend
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" />
                      Add Friend
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

