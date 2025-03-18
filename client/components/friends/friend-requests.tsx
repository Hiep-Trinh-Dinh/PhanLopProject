"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for friend requests
const mockFriendRequests = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "/placeholder-user.jpg",
    username: "alexjohnson",
    mutualFriends: 3,
  },
  {
    id: 2,
    name: "Taylor Smith",
    avatar: "/placeholder-user.jpg",
    username: "taylorsmith",
    mutualFriends: 5,
  },
]

export default function FriendRequests() {
  const [friendRequests, setFriendRequests] = useState(mockFriendRequests)

  const acceptRequest = (requestId: number) => {
    setFriendRequests(friendRequests.filter((request) => request.id !== requestId))
    // In a real app, you would handle accepting the friend request here
  }

  const rejectRequest = (requestId: number) => {
    setFriendRequests(friendRequests.filter((request) => request.id !== requestId))
    // In a real app, you would handle rejecting the friend request here
  }

  if (friendRequests.length === 0) {
    return (
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle>Friend Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-center text-gray-400">No friend requests at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Friend Requests ({friendRequests.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {friendRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={request.avatar} alt={request.name} />
                  <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${request.username}`} className="font-semibold text-white hover:underline">
                    {request.name}
                  </Link>
                  <p className="text-xs text-gray-400">{request.mutualFriends} mutual friends</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => acceptRequest(request.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 hover:bg-gray-700 hover:text-white"
                  onClick={() => rejectRequest(request.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

