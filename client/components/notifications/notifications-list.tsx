"use client";

import { useEffect } from "react";
import NotificationItem from "./notification-item";
import { NotificationDto, NotificationApi } from "@/app/lib/api";

interface NotificationsListProps {
  notifications: NotificationDto[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationDto[]>>;
  onUpdateUnread: (newUnreadCount: number) => void;
}

export default function NotificationsList({
  notifications,
  setNotifications,
  onUpdateUnread,
}: NotificationsListProps) {
  // Cập nhật số lượng thông báo chưa đọc
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    onUpdateUnread(unreadCount);
  }, [notifications, onUpdateUnread]);

  // Xử lý đánh dấu đã đọc
  const handleMarkAsRead = async (id: number) => {
    try {
      // Cập nhật UI trước
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Gọi API để đánh dấu là đã đọc
      await NotificationApi.markAsRead(id);
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
    }
  };

  // Xử lý đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      // Cập nhật UI trước
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      
      // Gọi API để đánh dấu tất cả đã đọc
      await NotificationApi.markAllAsRead();
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả thông báo đã đọc:", error);
    }
  };

  // Phân chia thông báo thành đã đọc và chưa đọc
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="bg-gray-900 p-4 rounded-lg overflow-y-auto">
      {/* Phần thông báo chưa đọc */}
      {unreadNotifications.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Chưa đọc ({unreadNotifications.length})
            </h3>
            <button
              onClick={handleMarkAllAsRead}
              className="text-blue-400 font-semibold hover:underline text-sm"
            >
              Đánh dấu đã đọc
            </button>
          </div>

          <div className="mb-4 space-y-4">
            {unreadNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        </>
      )}

      {/* Phần thông báo đã đọc */}
      {readNotifications.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-white mb-2">
            Đã đọc
          </h3>
          <div className="space-y-4">
            {readNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
