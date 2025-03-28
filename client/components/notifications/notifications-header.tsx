"use client";
import { useState, useEffect } from "react";
import NotificationsList from "./notifications-list";
import { BellRing, Settings, Bell } from "lucide-react";
import Link from "next/link";

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
}

interface Notification {
  id: number;
  type:
    | "like"
    | "comment"
    | "friend_request"
    | "friend_accepted"
    | "group_invite"
    | "mention";
  content: string;
  time: string;
  isRead: boolean;
  user: User;
  link?: string;
  actionLink?: string;
  actionText?: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "like",
    content: "liked your post",
    time: "2 minutes ago",
    isRead: false,
    user: {
      id: 1,
      name: "John Doe",
      username: "johndoe",
      avatar: "/placeholder-user.jpg",
    },
    link: "/post/123",
  },
  {
    id: 2,
    type: "friend_request",
    content: "sent you a friend request",
    time: "1 hour ago",
    isRead: false,
    user: {
      id: 2,
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder-user.jpg",
    },
  },
  {
    id: 3,
    type: "comment",
    content: "commented on your post",
    time: "2 hours ago",
    isRead: true,
    user: {
      id: 3,
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "/placeholder-user.jpg",
    },
    link: "/post/456",
  },
  {
    id: 4,
    type: "group_invite",
    content: "invited you to join Web Developers Group",
    time: "1 day ago",
    isRead: true,
    user: {
      id: 4,
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "/placeholder-user.jpg",
    },
    actionLink: "/groups/789",
    actionText: "View group",
  },
];

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Cập nhật số lượng chưa đọc khi component mount
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  return (
    <div className="relative">
      {/* Biểu tượng thông báo */}
      <button
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Hiệu ứng chuyển đổi giữa BellRing và Bell */}
        <div className="relative w-6 h-6">
          <BellRing
            className={`absolute inset-0 w-6 h-6 text-white  transition-transform duration-500 fill-current delay-100 ${
              unreadCount > 0
                ? "rotate-0 opacity-100 scale-100 "
                : "rotate-45 opacity-0 scale-50 "
            }`}
          />
          <Bell
            className={`absolute inset-0 w-6 h-6 text-white transition-transform duration-500 ${
              unreadCount > 0
                ? "rotate-45 opacity-0 scale-50"
                : "rotate-0 opacity-100 scale-100"
            }`}
          />
        </div>

        {/* Số lượng thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown danh sách thông báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-lg border border-gray-700 overscroll-contain overflow-auto">
          <div className="p-4 border-b border-gray-700 flex justify-between">
            <div className="text-3xl font-semibold text-white select-none pointer-events-none">
              Notifications
            </div>
            <Link
              href="/settings"
              className="text-blue-400 hover:underline text-base flex justify-center w-10 h-10 items-center rounded-full hover:bg-gray-700"
            >
              <Settings className="text-blue-400 text-xl" />
            </Link>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <NotificationsList
              notifications={notifications}
              setNotifications={setNotifications}
              onUpdateUnread={setUnreadCount}
            />
          </div>
        </div>
      )}
    </div>
  );
}
