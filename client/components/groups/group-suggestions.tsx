"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for group suggestions
const mockGroupSuggestions = [
  {
    id: 101,
    name: "TypeScript Community",
    cover: "/placeholder.svg",
    members: 3200,
    mutualMembers: 5,
  },
  {
    id: 102,
    name: "Mobile App Developers",
    cover: "/placeholder.svg",
    members: 4500,
    mutualMembers: 3,
  },
  {
    id: 103,
    name: "AI & Machine Learning",
    cover: "/placeholder.svg",
    members: 6800,
    mutualMembers: 2,
  },
]

export default function GroupSuggestions() {
  const [groupSuggestions, setGroupSuggestions] = useState(mockGroupSuggestions)

  const joinGroup = (groupId: number) => {
    setGroupSuggestions(groupSuggestions.filter((group) => group.id !== groupId))
    // In a real app, you would handle joining the group here
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Suggested Groups</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {groupSuggestions.map((group) => (
            <div key={group.id} className="overflow-hidden rounded-lg border border-gray-800 bg-gray-800">
              <div className="relative h-24 w-full">
                <Image src={group.cover || "/placeholder.svg"} alt={group.name} fill className="object-cover" />
              </div>
              <div className="p-3">
                <Link href={`/groups/${group.id}`} className="font-semibold text-white hover:underline">
                  {group.name}
                </Link>
                <div className="mt-1 flex items-center text-xs text-gray-400">
                  <Users className="mr-1 h-3 w-3" />
                  <span>{group.members.toLocaleString()} members</span>
                  <span className="mx-1">•</span>
                  <span>{group.mutualMembers} mutual members</span>
                </div>
                <Button
                  className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                  onClick={() => joinGroup(group.id)}
                >
                  Join Group
                </Button>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300">
            See More Suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

