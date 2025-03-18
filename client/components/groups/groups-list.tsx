"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for groups
const mockGroups = [
  {
    id: 1,
    name: "React Developers",
    cover: "/placeholder.svg",
    members: 1250,
    isJoined: true,
    isAdmin: false,
    activity: "active",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "UI/UX Design Community",
    cover: "/placeholder.svg",
    members: 3420,
    isJoined: true,
    isAdmin: true,
    activity: "active",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "JavaScript Enthusiasts",
    cover: "/placeholder.svg",
    members: 5600,
    isJoined: true,
    isAdmin: false,
    activity: "active",
    lastActive: "Just now",
  },
  {
    id: 4,
    name: "Web Development Tips",
    cover: "/placeholder.svg",
    members: 2100,
    isJoined: true,
    isAdmin: false,
    activity: "inactive",
    lastActive: "3 days ago",
  },
  {
    id: 5,
    name: "Next.js Community",
    cover: "/placeholder.svg",
    members: 1800,
    isJoined: true,
    isAdmin: true,
    activity: "active",
    lastActive: "5 hours ago",
  },
]

export default function GroupsList() {
  const [groups, setGroups] = useState(mockGroups)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeTab === "all") return matchesSearch
    if (activeTab === "admin") return matchesSearch && group.isAdmin
    if (activeTab === "active") return matchesSearch && group.activity === "active"
    return matchesSearch
  })

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Your Groups</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search groups"
            className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="mb-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="all">All Groups</TabsTrigger>
            <TabsTrigger value="admin">Your Admin</TabsTrigger>
            <TabsTrigger value="active">Recently Active</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <p className="text-center text-gray-400">No groups found.</p>
          ) : (
            filteredGroups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="block rounded-lg border border-gray-800 bg-gray-800 transition-colors hover:bg-gray-700"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
                  <Image src={group.cover || "/placeholder.svg"} alt={group.name} fill className="object-cover" />
                  {group.isAdmin && (
                    <div className="absolute right-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium">
                      Admin
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{group.name}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-400">
                    <Users className="mr-1 h-4 w-4" />
                    <span>{group.members.toLocaleString()} members</span>
                    <span className="mx-2">•</span>
                    <span>{group.lastActive}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

