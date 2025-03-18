"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Video, User, MessageCircle, Bell, Bookmark, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Users, label: "Groups", path: "/groups" },
    { icon: Video, label: "Videos", path: "/videos" },
    { icon: Bookmark, label: "Saved", path: "/saved" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ]

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } flex-shrink-0 border-r border-gray-800 bg-gray-900 transition-all duration-300`}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
          {!isCollapsed && <h2 className="text-lg font-semibold">Menu</h2>}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === item.path ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="mt-6 px-3">
            <div className="space-y-1">
              <p
                className={`px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${isCollapsed ? "hidden" : ""}`}
              >
                Shortcuts
              </p>
              {!isCollapsed && (
                <>
                  <Link
                    href="#"
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Avatar className="mr-3 h-6 w-6">
                      <AvatarImage src="/placeholder.svg" alt="Group" />
                      <AvatarFallback>GD</AvatarFallback>
                    </Avatar>
                    <span>Game Developers</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Avatar className="mr-3 h-6 w-6">
                      <AvatarImage src="/placeholder.svg" alt="Group" />
                      <AvatarFallback>RC</AvatarFallback>
                    </Avatar>
                    <span>React Community</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-gray-400">@johndoe</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

