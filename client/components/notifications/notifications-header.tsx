"use client";
import { useState, useEffect, useCallback } from "react";
import NotificationsList from "./notifications-list";
import { BellRing, Bell } from "lucide-react";
import { NotificationDto, NotificationApi } from "@/app/lib/api";

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Hàm lấy thông báo
  const fetchNotifications = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      // Lấy thông báo từ API
      const response = await NotificationApi.getAll();
      if (response?.content) {
        setNotifications(response.content);
      }
      
      // Lấy số lượng thông báo chưa đọc
      const count = await NotificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Lấy thông báo khi component mount
  useEffect(() => {
    // Chỉ gọi fetchNotifications khi component lần đầu mount
    let isMounted = true;
    if (isMounted) {
      fetchNotifications();
    }
    
    // Cập nhật thông báo định kỳ (mỗi 60 giây)
    const intervalId = setInterval(() => {
      // Chỉ cập nhật số lượng thông báo chưa đọc nếu dropdown không mở
      if (!isOpen && isMounted) {
        NotificationApi.getUnreadCount().then(count => {
          setUnreadCount(count);
        }).catch(error => {
          console.error("Lỗi khi cập nhật số lượng thông báo:", error);
        });
      }
    }, 60000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [isOpen]);
  
  // Khi mở dropdown, lấy danh sách thông báo mới nhất
  const handleToggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative">
      {/* Biểu tượng thông báo */}
      <button
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-700 transition"
        onClick={handleToggleDropdown}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 text-white" />
        ) : (
          <Bell className="w-6 h-6 text-white" />
        )}

        {/* Số lượng thông báo chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown danh sách thông báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-lg border border-gray-700 overscroll-contain overflow-auto z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="text-2xl font-semibold text-white">
              Thông báo
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8 text-gray-400">
                Đang tải thông báo...
              </div>
            ) : hasError ? (
              <div className="flex justify-center items-center py-8 text-gray-400">
                Không thể tải thông báo. Vui lòng thử lại sau.
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex justify-center items-center py-8 text-gray-400">
                Chưa có hoạt động nào
              </div>
            ) : (
              <NotificationsList
                notifications={notifications}
                setNotifications={setNotifications}
                onUpdateUnread={setUnreadCount}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
