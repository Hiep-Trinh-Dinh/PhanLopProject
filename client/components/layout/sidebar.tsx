"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bookmark,
  Calendar,
  Film,
  Flag,
  GamepadIcon,
  Heart,
  Home,
  Image,
  LayoutGrid,
  MessageCircle,
  Settings,
  Store,
  Users,
  Video,
} from "lucide-react"

const mainLinks = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/videos", icon: Video, label: "Videos" },
  { href: "/marketplace", icon: Store, label: "Marketplace" },
]

const quickLinks = [
  { href: "/gaming", icon: GamepadIcon, label: "Gaming" },
  { href: "/gallery", icon: Image, label: "Gallery" },
  { href: "/events", icon: Calendar, label: "Events" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
]

const exploreLinks = [
  { href: "/pages", icon: Flag, label: "Pages" },
  { href: "/groups", icon: LayoutGrid, label: "Groups" },
  { href: "/watch", icon: Film, label: "Watch" },
  { href: "/saved", icon: Bookmark, label: "Saved" },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <aside className="hidden w-64 border-r border-gray-800 bg-gray-900 md:block">
      <div className="flex h-full flex-col">
        <div className="space-y-4 p-4">
          <div className="space-y-1">
            {mainLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive(link.href)
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="h-px bg-gray-800" />

          <div>
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Quick Links
            </h3>
            <div className="mt-2 space-y-1">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-gray-800" />

          <div>
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Explore
            </h3>
            <div className="mt-2 space-y-1">
              {exploreLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-gray-800 p-4">
          <Link
            href="/settings"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}

