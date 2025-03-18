"use client"

import { useState } from "react"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for friend suggestions
const mockFriendSuggestions = [
  {
    id: 1,
    name: "Jordan Lee",
    avatar: "/placeholder-user.jpg",
    username: "jordanlee",
    mutualFriends: 7,
  },
  {
    id: 2,
    name: "Casey Morgan",
    avatar: "/placeholder-user.jpg",
    username: "caseymorgan",
    mutualFriends: 4,
  },
  {
    id: 3,
    name: "Riley Parker",
    avatar: "/placeholder-user.jpg",
    username: "rileyparker",
    mutualFriends: 2,
  },
]

export default function FriendSuggestions() {
  const [friendSuggestions, setFriendSuggestions] = useState(mockFriendSuggestions)

  const addFriend = (suggestionId: number) => {
    setFriendSuggestions(friendSuggestions.filter((suggestion) => suggestion.id !== suggestionId))
    // In a real app, you would handle sending a friend request here
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>People You May Know</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {friendSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                  <AvatarFallback>{suggestion.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${suggestion.username}`} className="font-semibold text-white hover:underline">
                    {suggestion.name}
                  </Link>
                  <p className="text-xs text-gray-400">{suggestion.mutualFriends} mutual friends</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 hover:bg-gray-700 hover:text-white"
                onClick={() => addFriend(suggestion.id)}
              >
                <UserPlus className="mr-1 h-4 w-4" />
                <span>Add</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

