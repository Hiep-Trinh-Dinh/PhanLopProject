"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  MessagesSquare,
  UserPlus,
} from "lucide-react";

const mainLinks = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/friends", icon: Users, label: "Friends" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/videos", icon: Video, label: "Videos" },
  // { href: "/marketplace", icon: Store, label: "Marketplace" },
];

// const quickLinks = [
//   { href: "/gaming", icon: GamepadIcon, label: "Gaming" },
//   { href: "/gallery", icon: Image, label: "Gallery" },
//   { href: "/events", icon: Calendar, label: "Events" },
//   { href: "/favorites", icon: Heart, label: "Favorites" },
// ]

const exploreLinks = [
  // { href: "/pages", icon: Flag, label: "Pages" },
  { href: "/groups", icon: LayoutGrid, label: "Groups" },
  // { href: "/watch", icon: Film, label: "Watch" },
  // { href: "/saved", icon: Bookmark, label: "Saved" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const links = [
    {
      href: "/home",
      icon: Home,
      label: "Home",
    },
    {
      href: "/friends",
      icon: Users,
      label: "Friends",
    },
    {
      href: "/videos",
      icon: Video,
      label: "Videos",
    },
    {
      href: "/messages",
      icon: MessagesSquare,
      label: "Messages",
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full lg:w-64 flex-shrink-0 border-r border-gray-800 bg-gray-900">
      {/* Desktop Navigation */}
      <nav className="hidden lg:block space-y-2 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(link.href)
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden flex justify-around items-center border-t border-gray-800 bg-gray-900 p-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center p-2 rounded-lg ${
              isActive(link.href)
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <link.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}