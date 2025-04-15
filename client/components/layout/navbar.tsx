"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Group, Home, Users, Video, User, Settings, Menu } from "lucide-react";
import NotificationsDropdown from "../notifications/notifications-header";
import Image from "next/image";
import { useUserData } from "@/app/api/auth/me/useUserData";
import React from "react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const { userData: user, isLoading, error } = useUserData(); // userId tạm thời là 1

  // Hàm xóa cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    } finally {
      // Xóa cookie auth_token trên client
      deleteCookie("auth_token");
      setShowDropdown(false);
      router.push("/");
    }
  };

  // Kiểm tra lỗi 401 và logout tự động
  useEffect(() => {
    if (error && error.message.includes("401")) {
      deleteCookie("auth_token"); // Xóa cookie khi gặp lỗi 401
      handleLogout();
    }
  }, [error]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error.message}</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Người dùng không tồn tại</div>;
  }

  return (
    <header className="fixed top-0 left-0 w-full h-14 z-50 bg-gray-900 px-6 py-2 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link
          href="/home"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/home" ? " text-blue-500" : "text-white"
          }`}
        >
          <h1 className="text-3xl font-bold text-white">GoKu</h1>
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
        <Link
          href="/home"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/home" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Home className="h-6 w-6" />
        </Link>
        <Link
          href="/friends"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/friends" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Users className="h-6 w-6" />
        </Link>
        <Link
          href="/videos"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/videos" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Video className="h-6 w-6" />
        </Link>
        <Link
          href="/groups"
          className={`flex items-center p-2 rounded-md ${
            pathname === "/groups" ? "bg-gray-700 text-blue-500" : "text-white"
          }`}
        >
          <Group className="h-6 w-6" />
        </Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <NotificationsDropdown />
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-800"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gray-700">
              <Image
                src={user.image || "/placeholder-user.jpg"}
                alt={`${user.firstName} ${user.lastName}`}
                width={36}
                height={36}
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
}