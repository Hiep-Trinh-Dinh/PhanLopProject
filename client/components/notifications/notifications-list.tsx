"use client";

import { useEffect } from "react";
import NotificationItem from "./notification-item";

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

interface NotificationsListProps {
  notifications: Notification[]; // ✅ Thêm danh sách thông báo
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>; // ✅ Thêm setter
  onUpdateUnread: (newUnreadCount: number) => void;
}

export default function NotificationsList({
  notifications,
  setNotifications,
  onUpdateUnread,
}: NotificationsListProps) {
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    onUpdateUnread(unreadCount);
  }, [notifications, onUpdateUnread]);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white select-none pointer-events-none">
          Chưa đọc ({unreadNotifications.length})
        </h3>
        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-blue-400 hover:underline text-sm "
          >
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {unreadNotifications.length > 0 ? (
        <div className="mb-4 space-y-4">
          {unreadNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onMarkAsRead={handleMarkAsRead}
              unreadCount={unreadNotifications.length}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-400 text-sm py-6 animate-fade-in">
          <p className="m-1 select-none pointer-events-none">
            Không có thông báo mới nào
          </p>
        </div>
      )}

      {readNotifications.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-white mb-2 select-none pointer-events-none">
            Đã đọc
          </h3>
          <div className="space-y-4">
            {readNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                {...notification}
                onMarkAsRead={handleMarkAsRead}
                unreadCount={unreadNotifications.length}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
