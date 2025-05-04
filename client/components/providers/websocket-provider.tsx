"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
// @ts-ignore
import { IMessage, StompSubscription } from '@stomp/stompjs';
import { useToast } from '@/hooks/use-toast';

interface WebSocketContextType {
  connected: boolean;
  connecting: boolean;
  sendMessage: (destination: string, body: any) => void;
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
  unsubscribe: (subscription: StompSubscription) => void;
  userId: number | null;
  client: any;
  activateConnection: () => void;
  activateConnectionWithPromise: () => Promise<boolean>;
  connectionActivated: boolean;
  isClientActive: () => boolean;
  ensureClient: () => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [connectionActivated, setConnectionActivated] = useState(false);
  const isMountedRef = useRef(true);
  const lastActivationAttemptRef = useRef(0);
  const activationSuccessRef = useRef(false);
  const { toast } = useToast();
  
  // Tạo một state để xác định khi nào nên kết nối WebSocket
  const [shouldConnect, setShouldConnect] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Ref để theo dõi đã thử kết nối WebSocket
  const hasTriedConnectionRef = useRef(false);
  
  // Đánh dấu component unmounted để tránh các thao tác không cần thiết
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Lấy userId từ cookie hoặc localStorage khi component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Thử lấy từ API /api/auth/me
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUserId(data.id);
          // Khi có userId, cho phép kết nối WebSocket
          setShouldConnect(true);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);
  
  const websocket = useWebSocket({
    url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/ws`,
    onConnect: () => {
      console.log("✅ WebSocket đã kết nối thành công");
      if (isMountedRef.current) {
        setConnectionActivated(true);
        activationSuccessRef.current = true;
        setIsRetrying(false);
        if (userId) { // Chỉ hiển thị thông báo nếu đã đăng nhập
          toast({
            title: "Kết nối thời gian thực",
            description: "Đã kết nối thành công đến máy chủ",
          });
        }
      }
    },
    onDisconnect: () => {
      console.log("Ngắt kết nối từ máy chủ");
      if (isMountedRef.current) {
        setConnectionActivated(false);
        activationSuccessRef.current = false;
      }
    },
    onError: (error) => {
      // Không hiển thị lỗi nếu chưa đăng nhập
      if (userId && isMountedRef.current) {
        console.error("Lỗi kết nối:", error);
        if (!isRetrying) {
          toast({
            title: "Lỗi kết nối", 
            description: "Không thể kết nối đến máy chủ thời gian thực, đang thử lại...",
            variant: "error"
          });
          setIsRetrying(true);
        }
      }
    },
    reconnectDelay: 5000
  });

  // Phương thức kích hoạt kết nối có thể gọi từ bên ngoài
  const activateConnection = useCallback(() => {
    // Tránh kích hoạt nhiều lần trong khoảng thời gian ngắn
    const now = Date.now();
    if (now - lastActivationAttemptRef.current < 2000) {
      console.log("⏳ Đang chờ activation attempt trước đó...");
      return;
    }
    
    lastActivationAttemptRef.current = now;
    activationSuccessRef.current = false;
    
    // Đảm bảo client tồn tại trước khi kích hoạt
    if (!websocket.client) {
      if (websocket.ensureClient()) {
        console.log("✅ Đã tạo lại WebSocket client thành công, tiếp tục kích hoạt");
      } else {
        console.error("❌ Không thể kích hoạt: WebSocket client chưa được khởi tạo và không thể tạo lại");
        return;
      }
    }
    
    try {
      const clientActive = websocket.client && websocket.client.active;
      // Kiểm tra xem client còn tồn tại và có thể kích hoạt không
      if (websocket.client && !clientActive && !connectionActivated) {
        console.log("🚀 Đang kích hoạt kết nối WebSocket");
        // Thử sử dụng phương thức mới activateClientWithPromise
        websocket.activateClientWithPromise()
          .then(success => {
            console.log(`✅ Kích hoạt WebSocket ${success ? 'thành công' : 'không thành công'}`);
            if (success && isMountedRef.current) {
              setConnectionActivated(true);
              activationSuccessRef.current = true;
            }
          })
          .catch(error => {
            console.error("❌ Lỗi khi kích hoạt WebSocket:", error);
            if (isMountedRef.current) {
              setConnectionActivated(false);
              activationSuccessRef.current = false;
            }
          });
      } else if (connectionActivated || (websocket.client && websocket.client.active)) {
        console.log("✅ WebSocket đã được kích hoạt trước đó");
        activationSuccessRef.current = true;
        if (websocket.client && websocket.client.active && !connectionActivated && isMountedRef.current) {
          setConnectionActivated(true);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi kích hoạt WebSocket:", error);
      // Reset trạng thái khi có lỗi
      if (isMountedRef.current) {
        setConnectionActivated(false);
        activationSuccessRef.current = false;
      }
    }
  }, [websocket.client, websocket.ensureClient, websocket.activateClientWithPromise, connectionActivated]);

  // Phương thức kích hoạt kết nối với Promise cho phép đợi kết quả
  const activateConnectionWithPromise = useCallback(async (): Promise<boolean> => {
    try {
      // Nếu component đã unmount, trả về false
      if (!isMountedRef.current) {
        console.log("⚠️ Không kích hoạt kết nối vì component đã unmount");
        return false;
      }
      
      console.log("🚀 Đang kích hoạt kết nối WebSocket với Promise - một lần duy nhất");
      
      // Nếu đã kết nối, trả về true ngay lập tức
      if (websocket.client && websocket.client.connected) {
        console.log("✅ WebSocket đã được kết nối trước đó");
        return true;
      }
      
      // Tránh kích hoạt nhiều lần trong khoảng thời gian ngắn
      const now = Date.now();
      if (now - lastActivationAttemptRef.current < 2000) {
        console.log("⏳ Không thử kết nối lại do đã kích hoạt gần đây");
        return false; // Trả về false thay vì throw error
      }
      
      lastActivationAttemptRef.current = now;
      
      // Đảm bảo client tồn tại
      if (!websocket.client && !websocket.ensureClient()) {
        console.log("❌ Không thể tạo WebSocket client");
        return false;
      }
      
      // Kiểm tra lần cuối trước khi kích hoạt
      if (!isMountedRef.current) {
        console.log("⚠️ Phát hiện component unmounting trước khi kích hoạt, hủy thao tác");
        return false;
      }
      
      // Sử dụng phương thức Promise từ hook - có thể trả về false thay vì throw error
      setIsRetrying(true);
      const success = await websocket.activateClientWithPromise();
      
      // Kiểm tra lại xem component còn mounted không
      if (!isMountedRef.current) {
        console.log("⚠️ Component đã unmount trong quá trình kích hoạt, không cập nhật state");
        return success;
      }
      
      if (success) {
        setConnectionActivated(true);
        activationSuccessRef.current = true;
      }
      
      setIsRetrying(false);
      return success;
    } catch (error) {
      // Chỉ cập nhật state nếu component vẫn còn mounted
      if (isMountedRef.current) {
        console.error("❌ Lỗi khi kích hoạt WebSocket với Promise:", error);
        setConnectionActivated(false);
        activationSuccessRef.current = false;
        setIsRetrying(false);
      }
      return false; // Luôn trả về false thay vì throw error
    }
  }, [websocket.client, websocket.ensureClient, websocket.activateClientWithPromise, websocket.client?.connected]);

  // Kiểm tra kết nối định kỳ - KHÔNG tự động kích hoạt lại
  useEffect(() => {
    if (!shouldConnect || !userId) return;
    
    // Thử tạo lại client nếu không tồn tại - chỉ một lần
    if (!websocket.client) {
      console.log("⏳ WebSocket client chưa tồn tại - thử tạo lại một lần");
      if (websocket.ensureClient()) {
        console.log("✅ Đã tạo WebSocket client thành công");
      } else {
        console.log("❌ Không thể tạo WebSocket client");
      }
    }
    
    console.log("🔄 Thiết lập kiểm tra trạng thái kết nối - không tự động kết nối lại");
    
    // Kiểm tra kết nối mỗi 30 giây - chỉ để cập nhật trạng thái, không thử kết nối lại
    const connectionCheckInterval = setInterval(() => {
      // Kiểm tra xem WebSocket còn tồn tại không
      if (!websocket.client) {
        console.log("ℹ️ WebSocket client không tồn tại - không thử tạo lại tự động");
        return;
      }
      
      const client = websocket.client;
      const clientActive = client && client.connected;
      
      // Cập nhật UI trạng thái khi phát hiện không kết nối
      if (!clientActive && userId && isMountedRef.current) {
        console.log("ℹ️ WebSocket không kết nối - không tự động kết nối lại");
        // Hiển thị thông báo cho người dùng nhưng không thử kết nối lại
        if (!isRetrying) {
          toast({
            title: "Kết nối thời gian thực không khả dụng",
            description: "Một số tính năng có thể không hoạt động. Vui lòng tải lại trang để thử lại.",
            variant: "error"
          });
          setIsRetrying(true);
        }
      }
    }, 30000);
    
    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, [shouldConnect, userId, websocket.client, websocket.ensureClient, isRetrying, toast]);

  // Tự động kích hoạt kết nối khi có userId và shouldConnect=true - chỉ một lần
  useEffect(() => {
    if (!shouldConnect || !userId) return;
    
    if (hasTriedConnectionRef.current) {
      console.log("ℹ️ Đã thử kết nối WebSocket trước đó - không thử lại");
      return;
    }
    
    hasTriedConnectionRef.current = true;
    
    if (!websocket.client) {
      console.log("⏳ WebSocket client chưa tồn tại - thử tạo lại trước khi kích hoạt");
      if (websocket.ensureClient()) {
        console.log("✅ Đã tạo lại WebSocket client thành công, tiếp tục kích hoạt");
        if (isMountedRef.current && !connectionActivated) {
          console.log("🔄 Kích hoạt kết nối WebSocket một lần duy nhất");
          activateConnection();
        }
      } else {
        console.log("❌ Không thể tạo WebSocket client - không thử kết nối");
      }
    } else if (!connectionActivated && isMountedRef.current) {
      console.log("🔄 Kích hoạt kết nối WebSocket một lần duy nhất");
      activateConnection();
    }
  }, [shouldConnect, userId, websocket.client, connectionActivated, activateConnection, websocket.ensureClient]);

  // Đồng bộ trạng thái - không tự động kích hoạt lại
  useEffect(() => {
    // Kiểm tra định kỳ trạng thái client và đồng bộ các state
    if (!shouldConnect || !userId) return;
    
    const syncStateInterval = setInterval(() => {
      if (!isMountedRef.current) return;
      
      // Kiểm tra xem client còn tồn tại không và kiểm tra an toàn
      const client = websocket.client;
      const clientExists = !!client;
      // Kiểm tra xem client có active không
      const clientActive = clientExists && client.active;
      // Kiểm tra xem connected state có đồng bộ không
      const isConnected = websocket.connected;
      
      // Log trạng thái hiện tại
      console.log(`🔄 Cập nhật trạng thái: client=${clientExists}, active=${clientActive}, connected=${isConnected}, activated=${connectionActivated}`);
      
      // Đồng bộ trạng thái connectionActivated với client.active
      if (clientActive !== connectionActivated && isMountedRef.current) {
        console.log(`🔄 Cập nhật connectionActivated: ${connectionActivated} -> ${clientActive}`);
        setConnectionActivated(clientActive);
      }
      
      // KHÔNG tự động kích hoạt lại nếu client không active
    }, 15000); // Kiểm tra mỗi 15 giây
    
    return () => {
      clearInterval(syncStateInterval);
    };
  }, [shouldConnect, userId, websocket.client, websocket.connected, connectionActivated]);

  return (
    <WebSocketContext.Provider value={{
      ...websocket,
      userId,
      client: websocket.client,
      activateConnection,
      activateConnectionWithPromise,
      connectionActivated,
      isClientActive: () => {
        return !!(websocket.client && websocket.client.active);
      },
      ensureClient: websocket.ensureClient
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 