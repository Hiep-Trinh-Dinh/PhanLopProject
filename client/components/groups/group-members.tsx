"use client"

import Link from "next/link"
import { Search, UserPlus } from "lucide-react"

interface GroupMembersProps {
  groupId: number
}

export default function GroupMembers({ groupId }: GroupMembersProps) {
  const members = [
    {
      id: 1,
      name: "Alex Johnson",
      username: "alexjohnson",
      avatar: "/placeholder-user.jpg",
      role: "Admin",
      joinedDate: "2 years ago",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "/placeholder-user.jpg",
      role: "Moderator",
      joinedDate: "1 year ago",
    },
    {
      id: 3,
      name: "Michael Brown",
      username: "michaelbrown",
      avatar: "/placeholder-user.jpg",
      role: "Member",
      joinedDate: "6 months ago",
    },
    {
      id: 4,
      name: "Emily Davis",
      username: "emilydavis",
      avatar: "/placeholder-user.jpg",
      role: "Member",
      joinedDate: "3 months ago",
    },
  ]

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold">Members</h2>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members"
            className="w-full border-0 bg-transparent p-0 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/profile/${member.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {member.name}
                  </Link>
                  <div className="flex items-center space-x-2 text-xs">
                    <span
                      className={`${
                        member.role === "Admin"
                          ? "text-blue-400"
                          : member.role === "Moderator"
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      {member.role}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">Joined {member.joinedDate}</span>
                  </div>
                </div>
              </div>

              <button className="inline-flex items-center rounded-md border border-gray-700 px-3 py-1 text-sm hover:bg-gray-700">
                <UserPlus className="mr-1 h-4 w-4" />
                Add Friend
              </button>
            </div>
          ))}
        </div>

        <button className="mt-4 w-full rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800">
          View All Members
        </button>
      </div>
    </div>
  )
}

