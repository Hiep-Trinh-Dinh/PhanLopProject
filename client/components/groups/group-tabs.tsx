"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Grid, Image, Info, Users } from "lucide-react"

interface GroupTabsProps {
  groupId: number
}

export default function GroupTabs({ groupId }: GroupTabsProps) {
  const pathname = usePathname()

  const tabs = [
    {
      name: "Posts",
      href: `/groups/${groupId}`,
      icon: Grid,
    },
    {
      name: "About",
      href: `/groups/${groupId}/about`,
      icon: Info,
    },
    // {
    //   name: "Media",
    //   href: `/groups/${groupId}/media`,
    //   icon: Image,
    // },
    {
      name: "Members",
      href: `/groups/${groupId}/members`,
      icon: Users,
    },
  ]

  return (
    <div className="mb-6 border-b border-gray-800">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                isActive
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

