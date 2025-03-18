"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, UserMinus, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GroupMembersProps {
  groupId: number
}

// Mock data for group members
const mockMembers = [
  {
    id: 1,
    name: "Jane Smith",
    avatar: "/placeholder-user.jpg",
    username: "janesmith",
    role: "Admin",
    joinedDate: "Jan 2020",
    isFriend: true,
  },
  {
    id: 2,
    name: "Mike Johnson",
    avatar: "/placeholder-user.jpg",
    username: "mikejohnson",
    role: "Moderator",
    joinedDate: "Mar 2020",
    isFriend: true,
  },
  {
    id: 3,
    name: "Sarah Williams",
    avatar: "/placeholder-user.jpg",
    username: "sarahwilliams",
    role: "Member",
    joinedDate: "Jun 2020",
    isFriend: false,
  },
  {
    id: 4,
    name: "David Brown",
    avatar: "/placeholder-user.jpg",
    username: "davidbrown",
    role: "Member",
    joinedDate: "Sep 2020",
    isFriend: true,
  },
  {
    id: 5,
    name: "Emily Davis",
    avatar: "/placeholder-user.jpg",
    username: "emilydavis",
    role: "Member",
    joinedDate: "Dec 2020",
    isFriend: false,
  },
  {
    id: 6,
    name: "Chris Wilson",
    avatar: "/placeholder-user.jpg",
    username: "chriswilson",
    role: "Member",
    joinedDate: "Feb 2021",
    isFriend: false,
  },
]

export default function GroupMembers({ groupId }: GroupMembersProps) {
  const [members] = useState(mockMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeTab === "all") return matchesSearch
    if (activeTab === "admins") return matchesSearch && (member.role === "Admin" || member.role === "Moderator")
    if (activeTab === "friends") return matchesSearch && member.isFriend
    return matchesSearch
  })

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800 pb-3">
        <CardTitle>Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members"
            className="border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="mb-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="admins">Admins & Mods</TabsTrigger>
            <TabsTrigger value="friends">Your Friends</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredMembers.length === 0 ? (
            <p className="col-span-full text-center text-gray-400">No members found.</p>
          ) : (
            filteredMembers.map((member) => (
              <div key={member.id} className="flex flex-col rounded-lg border border-gray-800 bg-gray-800 p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${member.username}`} className="font-semibold text-white hover:underline">
                      {member.name}
                    </Link>
                    <div className="flex items-center text-xs">
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
                      <span className="mx-1 text-gray-500">•</span>
                      <span className="text-gray-400">Joined {member.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  {member.isFriend ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-700 hover:bg-gray-700 hover:text-white"
                    >
                      <UserMinus className="mr-1 h-4 w-4" />
                      <span>Friends</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-700 hover:bg-gray-700 hover:text-white"
                    >
                      <UserPlus className="mr-1 h-4 w-4" />
                      <span>Add Friend</span>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

