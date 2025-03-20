"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Users } from "lucide-react"

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
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold">Suggested Groups</h2>
      </div>
      <div className="p-4">
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
                <button
                  className="mt-2 w-full rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => joinGroup(group.id)}
                >
                  Join Group
                </button>
              </div>
            </div>
          ))}
          <button className="w-full rounded-md px-4 py-2 text-sm font-medium text-blue-400 hover:bg-gray-800 hover:text-blue-300">
            See More Suggestions
          </button>
        </div>
      </div>
    </div>
  )
}

