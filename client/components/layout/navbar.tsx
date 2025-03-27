"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Group, Home, Users, Video, User, Settings, Menu } from "lucide-react";
import NotificationsDropdown from "../notifications/notifications-header";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full h-14 z-50 bg-gray-900 px-6 py-2 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link
          href="/home"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/home" ? " text-blue-500" : "text-white"}`}>
          <h1 className="text-3xl font-bold text-white">GoKu</h1>{" "}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="absolute left-32 w-40">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full rounded-full bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="absolute right-3 top-2 text-gray-400 hover:text-white">
          🔍
        </button>
      </div>

      {/* Center Section */}
      <div className="hidden md:flex space-x-6">
        {/* Home */}
        <Link
          href="/home"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/home" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Home className="h-6 w-6" />
        </Link>
        {/* Friend */}
        <Link
          href="/friends"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/friends" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Users className="h-6 w-6" />
        </Link>
        {/* Messages */}
        <Link
          href="/videos"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/videos" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Video className="h-6 w-6" />
        </Link>
        {/* Groups */}
        <Link
          href="/groups"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/groups" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Group className="h-6 w-6" />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {" "}
        {/* Right Section */}
        <NotificationsDropdown />{" "}
        <div className="relative">
          {" "}
          {/* User Profile Dropdown */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-800"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-700">
              <img
                src="/placeholder-user.jpg"
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
          </button>
          {showDropdown && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
              <div className="px-4 py-2 text-sm font-medium text-white">
                My Account
              </div>
              <div className="h-px bg-gray-800" />
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                onClick={() => setShowDropdown(false)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-800"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
              <div className="h-px bg-gray-800" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={onMenuClick} className="lg:hidden">
        <Menu className="h-6 w-6" />
      </button>
    </header>
  );
};