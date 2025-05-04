"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import NotificationsList from "./notifications-list";
import { BellRing, Bell } from "lucide-react";
import { NotificationDto, NotificationApi } from "@/app/lib/api";
import { useWebSocketContext } from "@/components/providers/websocket-provider";
import { IMessage, StompSubscription } from "@stomp/stompjs";
// @ts-ignore để tránh lỗi khi không tìm thấy module
import { ChatMessage, MessageType } from "@/types/chat";

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // WebSocket subscription
  const notificationSubscriptionRef = useRef<StompSubscription | null>(null);
  const subscriptionAttempts = useRef(0);
  const subscriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs để theo dõi đã thử đăng ký hay chưa
  const hasTriedSubscriptionRef = useRef(false);
  const hasAttemptedSubscriptionRef = useRef(false);

  // WebSocket context
  const { 
    connected, 
    subscribe, 
    unsubscribe,
    userId,
    client: stompClient,
    activateConnection,
    activateConnectionWithPromise,
    connectionActivated,
    isClientActive,
    ensureClient
  } = useWebSocketContext();
  
  // Debug trạng thái WebSocket
  useEffect(() => {
    const clientActive = isClientActive ? isClientActive() : false;
    console.log(`🌐 Notification WebSocket Status: connected=${connected}, client exists=${!!stompClient}, client active=${clientActive}, activated=${connectionActivated}`);
    
    if (connected && clientActive) {
      console.log("✅ WebSocket đang hoạt động - thông báo thời gian thực sẽ hoạt động");
    } else {
      console.log("❌ WebSocket không kết nối - thông báo có thể không hiển thị thời gian thực");
    }
  }, [connected, stompClient, connectionActivated, isClientActive]);

  // Hàm kiểm tra kết nối WebSocket
  const checkStompConnection = useCallback(() => {
    // Nhật ký về trạng thái kết nối hiện tại
    console.log(`🌐 Notification WebSocket Status: connected=${connected}, client exists=${!!stompClient}, client active=${stompClient ? stompClient.active : false}, activated=${connectionActivated}`);
    
    if (!connected || !stompClient || !stompClient.active) {
      console.log("❌ WebSocket không kết nối - thông báo có thể không hiển thị thời gian thực");
      return false;
    }
    
    console.log("✅ WebSocket đã kết nối và sẵn sàng nhận thông báo");
    return true;
  }, [stompClient, connected, connectionActivated]);

  // Hàm lấy thông báo
  const fetchNotifications = useCallback(async () => {
    if (isLoading || !userId) {
      console.log("⏳ Bỏ qua fetch thông báo - đang tải hoặc không có userId", { isLoading, userId });
      return;
    }
    
    try {
      console.log("📥 Đang tải thông báo...");
      setIsLoading(true);
      setHasError(false);
      
      // Lấy thông báo từ API
      const response = await NotificationApi.getAll();
      if (response?.content) {
        console.log(`✅ Đã tải ${response.content.length} thông báo`);
        setNotifications(response.content);
      }
      
      // Lấy số lượng thông báo chưa đọc
      const count = await NotificationApi.getUnreadCount();
      console.log(`🔔 Có ${count} thông báo chưa đọc`);
      setUnreadCount(count);
      
      setInitialized(true);
      lastUpdateTimeRef.current = Date.now();
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông báo:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, userId]);

  // Xử lý thông báo nhận được từ WebSocket
  const handleNotification = useCallback((message: IMessage) => {
    try {
      console.log("📣 Raw notification received:", message);
      console.log("📣 Notification body:", message.body);
      
      const notification = JSON.parse(message.body) as ChatMessage;
      console.log("📣 Parsed notification:", notification);
      
      if (notification.type === MessageType.NOTIFICATION) {
        console.log("�� Nhận thông báo mới qua WebSocket");
        
        // Tăng số lượng thông báo chưa đọc
        setUnreadCount(prev => prev + 1);
        
        // Cập nhật danh sách thông báo nếu đang mở dropdown
        if (isOpen) {
          console.log("🔄 Cập nhật danh sách thông báo do dropdown đang mở");
          fetchNotifications();
        }
        
        lastUpdateTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error("❌ Lỗi khi xử lý thông báo WebSocket:", error);
    }
  }, [isOpen, fetchNotifications]);

  // Theo dõi xem component có đang unmounting hay không
  const isUnmountingRef = useRef(false);

  // Đặt trạng thái unmounting khi component unmount
  useEffect(() => {
    isUnmountingRef.current = false;
    return () => {
      isUnmountingRef.current = true;
    };
  }, []);

  // Đăng ký WebSocket subscription khi kết nối thành công - chỉ một lần duy nhất
  const attemptSubscription = useCallback(async () => {
    // Kiểm tra xem component có đang unmounting không
    if (isUnmountingRef.current) {
      console.log("⚠️ Không thử đăng ký nhận thông báo vì component đang unmount");
      return false;
    }

    // Nếu đã thử đăng ký trước đó, không thử lại
    if (hasAttemptedSubscriptionRef.current) {
      console.log("ℹ️ Đã thử đăng ký nhận thông báo trước đó - không thử lại tự động");
      return false;
    }
    
    // Đánh dấu đã thử đăng ký
    hasAttemptedSubscriptionRef.current = true;
    
    // Kiểm tra userId trước
    if (!userId) {
      console.log("⏳ Chưa thể đăng ký - không có userId");
      return false;
    }
    
    // Tránh đăng ký khi đã đăng ký thành công
    if (isSubscribed) {
      console.log("✅ Đã đăng ký nhận thông báo trước đó");
      return true;
    }
    
    // Đảm bảo client tồn tại
    if (!stompClient) {
      console.log("⏳ STOMP client không tồn tại - thử tạo một lần");
      if (!ensureClient()) {
        console.log("❌ Không thể tạo STOMP client - không thể đăng ký nhận thông báo");
        return false;
      }
    }

    console.log("📲 Chuẩn bị đăng ký nhận thông báo qua WebSocket cho user", userId);
    
    // Tăng số lần thử một lần duy nhất
    subscriptionAttempts.current = 1;
    console.log(`📋 Thử đăng ký nhận thông báo - lần duy nhất`);
    
    // Kiểm tra trạng thái kết nối
    const clientActive = isClientActive ? isClientActive() : false;
    const clientExists = !!stompClient;
    const clientReady = clientExists && clientActive && connected;
    
    console.log(`🔍 Kiểm tra trạng thái kết nối: clientExists=${clientExists}, clientActive=${clientActive}, connected=${connected}, connectionActivated=${connectionActivated}`);
    
    if (!clientReady) {
      console.log("⚠️ WebSocket chưa sẵn sàng - thử kích hoạt kết nối một lần duy nhất");
      
      try {
        // Kiểm tra lại xem component có đang unmounting không
        if (isUnmountingRef.current) {
          console.log("⚠️ Đã phát hiện component unmounting trong quá trình đăng ký, hủy thao tác");
          return false;
        }

        // Sử dụng Promise-based activation
        try {
          // Đợi kích hoạt kết nối hoàn tất
          const success = await activateConnectionWithPromise();
          
          // Kiểm tra lại xem component có đang unmounting không
          if (isUnmountingRef.current) {
            console.log("⚠️ Component đã unmount sau khi kích hoạt kết nối, hủy đăng ký");
            return false;
          }
          
          if (success) {
            console.log("✅ Kích hoạt kết nối WebSocket thành công, tiếp tục đăng ký");
            
            // Đợi một chút để đảm bảo kết nối ổn định
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Kiểm tra lại xem component có đang unmounting không
            if (isUnmountingRef.current) {
              console.log("⚠️ Component đã unmount sau khi đợi kết nối ổn định, hủy đăng ký");
              return false;
            }
          } else {
            console.log("❌ Kích hoạt kết nối WebSocket không thành công - không thể đăng ký");
            return false;
          }
        } catch (activationError) {
          // Kiểm tra xem component còn mounted không trước khi log lỗi
          if (!isUnmountingRef.current) {
            console.error("❌ Lỗi khi kích hoạt kết nối WebSocket:", activationError);
          }
          return false;
        }
      } catch (error) {
        // Kiểm tra xem component còn mounted không trước khi log lỗi
        if (!isUnmountingRef.current) {
          console.error("❌ Lỗi khi kích hoạt kết nối:", error);
        }
        return false;
      }
    }
    
    // Kiểm tra lại một lần nữa sau khi kích hoạt và xem component có unmounting không
    if (isUnmountingRef.current) {
      console.log("⚠️ Component đã unmount trước khi đăng ký, hủy thao tác");
      return false;
    }
    
    // Kiểm tra lại trạng thái kết nối sau khi kích hoạt
    if (!(stompClient?.active && connected)) {
      console.log("❌ WebSocket vẫn chưa sẵn sàng sau khi kích hoạt - không thể đăng ký nhận thông báo");
      return false;
    }
    
    console.log("✅ WebSocket đã kết nối, tiến hành đăng ký thông báo");
    
    // Chuyển đổi userId thành string để đảm bảo tương thích
    const userIdString = String(userId);
    
    // Hủy đăng ký cũ nếu có
    if (notificationSubscriptionRef.current) {
      console.log("🗑️ Hủy đăng ký thông báo cũ");
      unsubscribe(notificationSubscriptionRef.current);
      notificationSubscriptionRef.current = null;
    }
    
    // Kiểm tra lại component unmounting trước khi đăng ký
    if (isUnmountingRef.current) {
      console.log("⚠️ Component đã unmount trước khi đăng ký, hủy thao tác");
      return false;
    }
    
    try {
      // Địa chỉ subscription
      const destination = `/user/${userIdString}/queue/notifications`;
      console.log("📲 Đăng ký nhận thông báo tại:", destination);
      
      // Đăng ký nhận thông báo qua WebSocket
      notificationSubscriptionRef.current = subscribe(
        destination,
        handleNotification
      );
      
      // Kiểm tra component unmounting và kết quả đăng ký
      if (isUnmountingRef.current) {
        // Hủy đăng ký ngay lập tức nếu component đã unmount
        if (notificationSubscriptionRef.current) {
          console.log("🗑️ Hủy đăng ký vừa thực hiện do component đã unmount");
          unsubscribe(notificationSubscriptionRef.current);
          notificationSubscriptionRef.current = null;
        }
        return false;
      }
      
      if (notificationSubscriptionRef.current) {
        console.log("✅ Đăng ký nhận thông báo thành công:", notificationSubscriptionRef.current);
        if (!isUnmountingRef.current) {
          setIsSubscribed(true);
        }
        return true;
      } else {
        console.error("❌ Không thể đăng ký nhận thông báo - không thử lại tự động");
        return false;
      }
    } catch (error) {
      // Chỉ log lỗi nếu component vẫn còn mounted
      if (!isUnmountingRef.current) {
        console.error("❌ Lỗi khi đăng ký nhận thông báo:", error);
      }
      return false;
    }
  }, [connected, userId, isSubscribed, subscribe, unsubscribe, handleNotification, stompClient, activateConnectionWithPromise, isClientActive, connectionActivated, ensureClient]);

  // Reset số lần thử khi component mount nhưng không thử lại tự động
  useEffect(() => {
    // Đặt giá trị cho subscriptionAttempts
    subscriptionAttempts.current = 0;
    
    return () => {
      // Hủy đăng ký khi component unmount
      if (notificationSubscriptionRef.current) {
        console.log("🗑️ Hủy đăng ký nhận thông báo WebSocket khi unmount");
        unsubscribe(notificationSubscriptionRef.current);
        notificationSubscriptionRef.current = null;
        setIsSubscribed(false);
      }
      
      // Xóa timeout nếu có
      if (subscriptionTimeoutRef.current) {
        clearTimeout(subscriptionTimeoutRef.current);
        subscriptionTimeoutRef.current = null;
      }
    };
  }, [unsubscribe]);

  // Chạy đăng ký một lần duy nhất khi component mount
  useEffect(() => {
    if (hasTriedSubscriptionRef.current) {
      return; // Chỉ thử một lần
    }
    
    if (userId && stompClient && !isSubscribed && !isUnmountingRef.current) {
      console.log("🔄 Thử đăng ký nhận thông báo - một lần duy nhất");
      hasTriedSubscriptionRef.current = true;
      attemptSubscription().catch(error => {
        // Chỉ log lỗi nếu component vẫn còn mounted
        if (!isUnmountingRef.current) {
          console.error("❌ Lỗi không xử lý được trong quá trình đăng ký:", error);
        }
      });
    }
  }, [userId, stompClient, isSubscribed, attemptSubscription]);

  // Lấy thông báo khi component mount và khi userId thay đổi
  useEffect(() => {
    // Chỉ fetch khi có userId và chưa được khởi tạo
    if (userId && !initialized) {
      console.log("🚀 Khởi tạo - tải thông báo lần đầu");
      fetchNotifications();
    }
  }, [userId, initialized, fetchNotifications]);
  
  // Thêm polling dự phòng khi WebSocket không hoạt động
  useEffect(() => {
    const pollingInterval = setInterval(async () => {
      // Polling chỉ khi không kết nối WebSocket hoặc khi đã quá thời gian từ lần cập nhật cuối
      const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
      const shouldPoll = (!connected || timeSinceLastUpdate > 30000) && userId !== null;
      
      if (shouldPoll && !isLoading) {
        console.log("🔄 Polling thông báo dự phòng (một lần duy nhất, không retry)");
        try {
          // Sử dụng fetch trực tiếp một lần duy nhất thay vì qua API wrapper để tránh cơ chế retry
          const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/notifications/count?userId=${userId}`;
          
          // Sử dụng timeout để đảm bảo không đợi quá lâu
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            signal: controller.signal
          });
          
          // Xóa timeout
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const count = await response.json();
            
            if (count !== unreadCount) {
              console.log(`🔔 Phát hiện thay đổi số lượng thông báo: ${unreadCount} -> ${count}`);
              setUnreadCount(count);
              
              // Cập nhật danh sách thông báo nếu đang mở dropdown
              if (isOpen) {
                // Khi dropdown đang mở, cũng fetch notifications trực tiếp một lần duy nhất
                const notificationsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/notifications?userId=${userId}&page=0&size=20`;
                
                const notificationsController = new AbortController();
                const notificationsTimeoutId = setTimeout(() => notificationsController.abort(), 5000);
                
                const notificationsResponse = await fetch(notificationsUrl, {
                  method: 'GET',
                  credentials: 'include',
                  signal: notificationsController.signal
                });
                
                clearTimeout(notificationsTimeoutId);
                
                if (notificationsResponse.ok) {
                  const data = await notificationsResponse.json();
                  if (data?.content) {
                    setNotifications(data.content);
                  }
                }
              }
            }
          }
          
          lastUpdateTimeRef.current = Date.now();
        } catch (error) {
          // Log lỗi nhưng không thử lại - lần polling tiếp theo sẽ thử lại
          console.error("❌ Lỗi polling thông báo (không thử lại):", error);
        }
      }
    }, 15000); // Poll mỗi 15 giây
    
    return () => clearInterval(pollingInterval);
  }, [connected, userId, unreadCount, isOpen, isLoading, fetchNotifications]);
  
  // Khi mở dropdown, lấy danh sách thông báo mới nhất
  const handleToggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState && userId) {
      console.log("📥 Mở dropdown - tải thông báo mới");
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
