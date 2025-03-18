"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RightSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Web Development Workshop",
      date: "Tomorrow, 3:00 PM",
      attendees: 24,
    },
    {
      id: 2,
      title: "Gaming Tournament",
      date: "Saturday, 6:00 PM",
      attendees: 56,
    },
    {
      id: 3,
      title: "Tech Conference 2023",
      date: "Next Week",
      attendees: 120,
    },
  ]

  // Mock data for suggested groups
  const suggestedGroups = [
    {
      id: 101,
      name: "UI/UX Designers",
      members: 3200,
      isJoined: false,
    },
    {
      id: 102,
      name: "JavaScript Enthusiasts",
      members: 5600,
      isJoined: false,
    },
    {
      id: 103,
      name: "Digital Nomads",
      members: 2800,
      isJoined: false,
    },
  ]

  return (
    <aside
      className={`${
        isCollapsed ? "w-0 -mr-4 opacity-0" : "w-72 opacity-100"
      } border-l border-gray-800 bg-gray-900 transition-all duration-300 overflow-hidden relative`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-4 h-8 w-8 rounded-full bg-gray-800"
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className="p-4">
        <Card className="border-gray-800 bg-gray-900 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                  <h4 className="font-medium text-white">{event.title}</h4>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">{event.date}</span>
                    <span className="text-xs text-gray-400">{event.attendees} attending</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suggested Groups</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {suggestedGroups.map((group) => (
                <div key={group.id} className="border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                  <h4 className="font-medium text-white">{group.name}</h4>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">{group.members.toLocaleString()} members</span>
                    <Button size="sm" className="h-6 bg-blue-600 hover:bg-blue-700 text-xs">
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}

