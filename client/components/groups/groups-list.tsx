"use client"

import Link from "next/link"
import { Search, Users } from "lucide-react"

const mockGroups = [
  {
    id: 1,
    name: "React Developers",
    avatar: "/placeholder-group.jpg",
    members: 1250,
    privacy: "Public",
    isJoined: true,
  },
  {
    id: 2,
    name: "Next.js Community",
    avatar: "/placeholder-group.jpg",
    members: 850,
    privacy: "Public",
    isJoined: false,
  },
  {
    id: 3,
    name: "TypeScript Enthusiasts",
    avatar: "/placeholder-group.jpg",
    members: 2100,
    privacy: "Private",
    isJoined: true,
  },
]

export default function GroupsList() {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold">Your Groups</h2>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups"
            className="w-full border-0 bg-transparent p-0 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="space-y-4">
          {mockGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <Link
                href={`/groups/${group.id}`}
                className="flex flex-1 items-center space-x-3"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{group.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Users className="h-3 w-3" />
                    <span>{group.members.toLocaleString()} members</span>
                    <span>•</span>
                    <span>{group.privacy}</span>
                  </div>
                </div>
              </Link>

              <button
                className={`ml-4 rounded-md px-3 py-1 text-sm font-medium ${
                  group.isJoined
                    ? "border border-gray-700 hover:bg-gray-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {group.isJoined ? "Joined" : "Join"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

