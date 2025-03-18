"use client"

import { Calendar, Globe, Info, Shield, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GroupAboutProps {
  groupId: number
}

export default function GroupAbout({ groupId }: GroupAboutProps) {
  // In a real app, you would fetch this data from an API
  const groupInfo = {
    description:
      "A community for React developers to share knowledge, ask questions, and connect with other developers. We welcome developers of all skill levels, from beginners to experts.",
    rules: [
      "Be respectful and constructive in your comments and posts.",
      "No spam or self-promotion without prior approval.",
      "Share code snippets and examples when possible.",
      "Help others and contribute to discussions.",
      "Keep discussions related to React and web development.",
    ],
    privacy: "Public",
    created: "January 15, 2020",
    members: 1250,
    posts: 3456,
    admins: [
      { id: 1, name: "Jane Smith", role: "Admin" },
      { id: 2, name: "Mike Johnson", role: "Moderator" },
    ],
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            About This Group
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-gray-300">{groupInfo.description}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center space-x-2 text-sm">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Privacy:</span>
              <span className="font-medium text-white">{groupInfo.privacy}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Created:</span>
              <span className="font-medium text-white">{groupInfo.created}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Members:</span>
              <span className="font-medium text-white">{groupInfo.members.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Info className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Posts:</span>
              <span className="font-medium text-white">{groupInfo.posts.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Group Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ol className="list-inside list-decimal space-y-2 text-gray-300">
            {groupInfo.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-gray-900">
        <CardHeader className="border-b border-gray-800 pb-3">
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Admins and Moderators
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {groupInfo.admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between">
                <div className="font-medium text-white">{admin.name}</div>
                <div className={`text-sm ${admin.role === "Admin" ? "text-blue-400" : "text-green-400"}`}>
                  {admin.role}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

