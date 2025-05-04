import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage, IFrame, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketHookProps {
  url?: string;
  onConnect?: (frame?: IFrame) => void;
  onDisconnect?: (frame?: IFrame) => void;
  onError?: (error: any) => void;
  reconnectDelay?: number;
  debug?: boolean;
}

interface WebSocketHookReturn {
  connected: boolean;
  connecting: boolean;
  sendMessage: (destination: string, body: any) => void;
  subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
  unsubscribe: (subscription: StompSubscription) => void;
  client: Client | null;
  isClientActive: () => boolean;
  ensureClient: () => boolean;
  activateClientWithPromise: () => Promise<boolean>;
}

export const useWebSocket = ({
  url,
  onConnect,
  onDisconnect,
  onError,
  reconnectDelay = 5000,
  debug = false
}: WebSocketHookProps = {}): WebSocketHookReturn => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const isUnmounting = useRef(false);
  const lastActivationTime = useRef(0);
  const activationPromiseRef = useRef<{resolve: Function, reject: Function} | null>(null);

  // Xác định URL tối ưu cho WebSocket
  const getOptimalWebSocketUrl = useCallback(() => {
    // Nếu URL được truyền vào, sử dụng nó
    if (url) return url;

    // Sử dụng URL dựa trên môi trường hiện tại
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const host = window.location.host;
      // Ưu tiên dùng URL tương đối với host hiện tại
      return `${protocol}//${host}/ws`;
    }
    
    // Fallback đến giá trị mặc định
    return process.env.NEXT_PUBLIC_API_URL ? 
           `${process.env.NEXT_PUBLIC_API_URL}/ws` : 
           'http://localhost:8080/ws';
  }, [url]);

  // Kiểm tra xem client có đang hoạt động không
  const isClientActive = useCallback(() => {
    return !!(clientRef.current && clientRef.current.active);
  }, []);

  // Kiểm tra xem có thể tạo kết nối được không (kiểm tra mạng cơ bản)
  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const wsUrl = getOptimalWebSocketUrl();
      console.log(`🔍 Kiểm tra kết nối đến: ${wsUrl}`);
      
      // Kiểm tra kết nối HTTP cơ bản (không phải WebSocket) để xem server có hoạt động không
      const response = await fetch(wsUrl.replace('ws:', 'http:').replace('wss:', 'https:'), {
        method: 'HEAD',
        mode: 'no-cors' // Chỉ kiểm tra xem có thể kết nối được không, không cần lấy nội dung
      });
      
      console.log(`✅ Kiểm tra kết nối thành công: có thể kết nối đến server`);
      return true;
    } catch (error) {
      console.error(`❌ Không thể kết nối đến server: ${error}`);
      return false;
    }
  }, [getOptimalWebSocketUrl]);

  // Ngắt kết nối an toàn
  const safeDeactivate = useCallback(() => {
    if (clientRef.current) {
      try {
        if (clientRef.current.active) {
          console.log('🔌 Deactivating WebSocket client safely');
          clientRef.current.deactivate();
        }
      } catch (error) {
        console.error('❌ Error deactivating WebSocket client:', error);
      }
    }
  }, []);

  // Khai báo handleReconnect trước - đã loại bỏ cơ chế thử lại tự động
  const handleReconnect = useCallback(() => {
    if (isUnmounting.current) {
      console.log('⚠️ Skip reconnect during unmount');
      return;
    }
    
    console.log('ℹ️ Không thử kết nối lại tự động - cấu hình chỉ thử kết nối một lần');
    // Không thử kết nối lại tự động
  }, []);
  
  // Sau đó khai báo buildClient
  const buildClient = useCallback(() => {
    try {
      if (isUnmounting.current) {
        console.log('⚠️ Skip building client during unmount');
        return null;
      }
      
      console.log('🔧 Đang xây dựng STOMP client mới...');
      
      try {
        const finalUrl = getOptimalWebSocketUrl();
        console.log(`🔌 Kết nối WebSocket đến: ${finalUrl}`);
        
        const client = new Client({
          webSocketFactory: () => new SockJS(finalUrl),
          connectHeaders: {},
          debug: debug ? (msg) => console.log(msg) : () => {},
          reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: (frame: IFrame) => {
            console.log('✅ WebSocket connected successfully', frame);
            if (!isUnmounting.current) {
              setConnected(true);
              setConnecting(false);
              reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
              
              // Resolve promise nếu có
              if (activationPromiseRef.current) {
                activationPromiseRef.current.resolve(true);
                activationPromiseRef.current = null;
              }
              
              if (onConnect) onConnect(frame);
            }
          },
          onDisconnect: (frame: IFrame) => {
            console.log('⚠️ WebSocket disconnected', frame);
            if (!isUnmounting.current) {
              setConnected(false);
              
              // Reject promise nếu có
              if (activationPromiseRef.current) {
                activationPromiseRef.current.reject(new Error('WebSocket disconnected'));
                activationPromiseRef.current = null;
              }
              
              if (onDisconnect) onDisconnect(frame);
            }
          },
          onStompError: (frame: IFrame) => {
            const error = `Lỗi STOMP: ${frame.headers['message']}`;
            console.error('❌ STOMP error:', error);
            
            // Reject promise nếu có
            if (activationPromiseRef.current) {
              activationPromiseRef.current.reject(new Error(error));
              activationPromiseRef.current = null;
            }
            
            if (onError) onError(error);
          },
          onWebSocketError: (event: Event) => {
            console.error('❌ WebSocket error:', event);
            
            // Reject promise nếu có
            if (activationPromiseRef.current) {
              activationPromiseRef.current.reject(new Error('WebSocket error'));
              activationPromiseRef.current = null;
            }
            
            if (onError) onError(event);
          },
          onWebSocketClose: (event: CloseEvent) => {
            console.log('⚠️ WebSocket closed:', event.code, event.reason);
            
            // Reject promise nếu có
            if (activationPromiseRef.current) {
              activationPromiseRef.current.reject(new Error(`WebSocket closed: ${event.code}`));
              activationPromiseRef.current = null;
            }
            
            if (event.code !== 1000 && !isUnmounting.current) { // Không phải đóng bình thường
              handleReconnect();
            }
          }
        });
        
        console.log('✅ STOMP client được tạo thành công:', client ? 'true' : 'false');
        return client;
      } catch (clientError) {
        console.error('❌ Lỗi khi tạo đối tượng Client:', clientError);
        
        // Reject promise nếu có
        if (activationPromiseRef.current) {
          activationPromiseRef.current.reject(clientError);
          activationPromiseRef.current = null;
        }
        
        if (onError) onError(clientError);
        return null;
      }
    } catch (error) {
      console.error('❌ Lỗi bất ngờ trong buildClient:', error);
      
      // Reject promise nếu có
      if (activationPromiseRef.current) {
        activationPromiseRef.current.reject(error);
        activationPromiseRef.current = null;
      }
      
      if (onError) onError(error);
      return null;
    }
  }, [getOptimalWebSocketUrl, onConnect, onDisconnect, onError, reconnectDelay, debug, handleReconnect]);

  // Thiết lập kết nối
  useEffect(() => {
    // Đảm bảo biến isUnmounting được reset khi component mount
    isUnmounting.current = false;
    
    // Kiểm tra kết nối trước khi tạo client
    checkConnectivity().then(canConnect => {
      // Kiểm tra lại xem component có đang unmount không
      if (isUnmounting.current) {
        console.log('⚠️ Bỏ qua thiết lập kết nối vì component đang unmount');
        return;
      }
      
      if (canConnect) {
        // Tạo client nếu chưa có
        if (!clientRef.current) {
          console.log('📡 Khởi tạo STOMP client mới');
          const client = buildClient();
          if (client) {
            clientRef.current = client;
            console.log('✅ STOMP client đã được khởi tạo thành công');
          } else {
            console.error('❌ Không thể khởi tạo STOMP client');
          }
        }
      } else {
        console.error('❌ Không thể kết nối đến server, bỏ qua việc tạo STOMP client');
      }
    });
    
    // Không tự động kết nối tại đây, để cho component gọi activate()
    
    return () => {
      console.log('🧹 Cleaning up WebSocket hook');
      isUnmounting.current = true;
      
      // Chỉ deactivate nếu cần thiết nhưng giữ lại client reference
      if (clientRef.current && clientRef.current.active) {
        safeDeactivate();
      }
      
      // Hủy activationPromise đang chờ nếu có
      if (activationPromiseRef.current) {
        console.log('🧹 Hủy activationPromise đang chờ do component unmount');
        activationPromiseRef.current.resolve(false);
        activationPromiseRef.current = null;
      }
      
      // Không set clientRef.current = null để component có thể sử dụng lại client
      // thay vì đó, chỉ đánh dấu trạng thái connected = false
      setConnected(false);
    };
  }, [buildClient, safeDeactivate, checkConnectivity]);

  // Kiểm tra trạng thái đồng bộ
  useEffect(() => {
    // Kiểm tra xem trạng thái connected và client.active có đồng bộ không
    if (clientRef.current) {
      const clientIsActive = clientRef.current.active;
      
      // Nếu client is active nhưng connected = false => cập nhật connected
      if (clientIsActive && !connected) {
        console.log('📊 Đồng bộ trạng thái: client active nhưng connected = false, cập nhật connected = true');
        setConnected(true);
      }
      
      // Nếu client không active nhưng connected = true => cập nhật connected
      if (!clientIsActive && connected) {
        console.log('📊 Đồng bộ trạng thái: client không active nhưng connected = true, cập nhật connected = false');
        setConnected(false);
      }
    } else if (connected) {
      // Client không tồn tại nhưng connected = true
      console.log('📊 Đồng bộ trạng thái: client không tồn tại nhưng connected = true, cập nhật connected = false');
      setConnected(false);
    }
  }, [connected]);

  // Thêm một phương thức để tạo lại client nếu nó không còn tồn tại
  const ensureClient = useCallback(() => {
    // Reset biến isUnmounting trước khi tạo client mới
    isUnmounting.current = false;
    
    if (!clientRef.current) {
      console.log('🔄 Tạo lại STOMP client do client hiện tại không tồn tại');
      const client = buildClient();
      if (client) {
        clientRef.current = client;
        console.log('✅ STOMP client đã được tạo lại thành công');
        return true;
      } else {
        console.error('❌ Không thể tạo lại STOMP client');
        return false;
      }
    }
    return true;
  }, [buildClient]);

  // Kích hoạt client và trả về Promise
  const activateClientWithPromise = useCallback((): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        // Kiểm tra component unmounting - sử dụng biến cục bộ để tránh race condition
        const isComponentUnmounting = isUnmounting.current;
        if (isComponentUnmounting) {
          console.log('⚠️ Bỏ qua kích hoạt kết nối vì component đang unmount');
          return resolve(false); // Trả về false thay vì reject để tránh lỗi
        }
        
        // Kiểm tra nếu client đã kết nối
        if (clientRef.current && clientRef.current.connected) {
          console.log('✅ WebSocket đã kết nối sẵn');
          return resolve(true);
        }
        
        // Tránh kích hoạt liên tục trong thời gian ngắn
        const now = Date.now();
        if (now - lastActivationTime.current < 2000) {
          console.log('⏳ Đã kích hoạt gần đây, không thử lại');
          return resolve(false); // Trả về false thay vì reject để tránh lỗi
        }
        
        // Cập nhật thời gian kích hoạt
        lastActivationTime.current = now;
        
        // Đảm bảo client tồn tại
        if (!clientRef.current) {
          console.log('🔄 Tạo client mới cho activation');
          const newClient = buildClient();
          if (!newClient) {
            console.error('❌ Không thể tạo client WebSocket');
            return resolve(false); // Trả về false thay vì reject để tránh lỗi
          }
          clientRef.current = newClient;
        }
        
        // Kiểm tra lại một lần nữa trước khi kích hoạt
        if (isUnmounting.current) {
          console.log('⚠️ Phát hiện component unmounting trong quá trình kích hoạt, hủy thao tác');
          return resolve(false);
        }
        
        console.log('🚀 Kích hoạt kết nối WebSocket với Promise - một lần duy nhất');
        setConnecting(true);
        
        // Lưu promise
        activationPromiseRef.current = { resolve, reject };
        
        // Thiết lập timeout
        const timeoutId = setTimeout(() => {
          if (activationPromiseRef.current) {
            console.error('⏱️ Timeout khi kích hoạt WebSocket client');
            setConnecting(false);
            const promiseToReject = activationPromiseRef.current;
            activationPromiseRef.current = null;
            promiseToReject.resolve(false); // Trả về false thay vì reject để tránh lỗi
          }
        }, 15000); // 15 giây timeout
        
        try {
          // Kích hoạt client - chỉ một lần
          if (!isUnmounting.current) {
            clientRef.current.activate();
          } else {
            console.log('⚠️ Không kích hoạt vì component đã unmount');
            clearTimeout(timeoutId);
            setConnecting(false);
            activationPromiseRef.current = null;
            return resolve(false);
          }
        } catch (activateError) {
          console.error('❌ Lỗi khi kích hoạt client:', activateError);
          clearTimeout(timeoutId);
          setConnecting(false);
          activationPromiseRef.current = null;
          return resolve(false); // Trả về false thay vì reject để tránh lỗi
        }
        
        // Cleanup timeout khi Promise được xử lý
        Promise.race([
          new Promise<void>(() => {
            // Promise này không bao giờ resolve, chỉ để giữ race mở
          }),
          new Promise<void>((resolveRace) => {
            const intervalId = setInterval(() => {
              if (!activationPromiseRef.current || isUnmounting.current) {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                resolveRace();
              }
            }, 100);
          })
        ]).catch(() => {
          // Bắt lỗi nếu có
        });
        
      } catch (error) {
        console.error('❌ Lỗi ngoài dự kiến trong activateClientWithPromise:', error);
        setConnecting(false);
        return resolve(false); // Trả về false thay vì reject để tránh lỗi
      }
    });
  }, [buildClient]);

  // Gửi tin nhắn
  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current && clientRef.current.active && connected) {
      try {
        clientRef.current.publish({
          destination,
          body: JSON.stringify(body)
        });
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }, [connected]);

  // Đăng ký nhận tin nhắn
  const subscribe = useCallback((destination: string, callback: (message: IMessage) => void): StompSubscription | null => {
    if (!clientRef.current) {
      console.error('❌ Cannot subscribe: STOMP client does not exist');
      return null;
    }
    
    // Kiểm tra kết nối, nếu không active thì thử kích hoạt lại
    if (!clientRef.current.active) {
      console.warn('⚠️ Client not active, attempting to activate before subscription');
      try {
        // Thử activate nếu client chưa active
        clientRef.current.activate();
        
        // Đợi 1.5 giây để kết nối hoàn tất
        console.log(`⏳ Waiting for connection before subscribing to ${destination}`);
        setTimeout(() => {
          if (clientRef.current && clientRef.current.active) {
            try {
              console.log(`📩 Re-attempting subscription to ${destination} after activation`);
              const subscription = clientRef.current.subscribe(destination, (message) => {
                try {
                  callback(message);
                } catch (error) {
                  console.error('❌ Error in subscription callback:', error);
                }
              });
              console.log(`✅ Successfully subscribed to ${destination} after activation`);
              return subscription;
            } catch (subError) {
              console.error(`❌ Error subscribing to ${destination} after activation:`, subError);
            }
          } else {
            console.error('❌ Client still not active after activation attempt');
          }
        }, 1500);
        
        // Trả về null cho lần gọi đầu tiên, subscription thực tế sẽ được tạo trong timeout
        return null;
      } catch (activateError) {
        console.error('❌ Failed to activate client before subscription:', activateError);
        return null;
      }
    }
    
    if (!connected) {
      console.error('❌ Cannot subscribe: WebSocket not connected');
      return null;
    }
    
    try {
      console.log(`📩 Subscribing to ${destination}`);
      const subscription = clientRef.current.subscribe(destination, (message) => {
        try {
          callback(message);
        } catch (error) {
          console.error('❌ Error in subscription callback:', error);
        }
      });
      console.log(`✅ Successfully subscribed to ${destination}`);
      return subscription;
    } catch (error) {
      console.error(`❌ Error subscribing to ${destination}:`, error);
      return null;
    }
  }, [connected]);

  // Hủy đăng ký
  const unsubscribe = useCallback((subscription: StompSubscription) => {
    if (subscription) {
      try {
        subscription.unsubscribe();
        console.log('✅ Successfully unsubscribed');
      } catch (error) {
        console.error('❌ Error unsubscribing:', error);
      }
    }
  }, []);

  return {
    connected,
    connecting,
    sendMessage,
    subscribe,
    unsubscribe,
    client: clientRef.current,
    isClientActive,
    ensureClient,
    activateClientWithPromise
  };
}; 