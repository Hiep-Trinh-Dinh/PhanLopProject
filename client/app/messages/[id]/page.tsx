"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
import { use } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConversationsList from "@/components/messenger/conversations-list";
import { Send } from "lucide-react";
import { 
  getAllConversations, 
  getConversation,
  getAllMessages,
  sendMessage, 
  markMessagesAsRead 
} from "@/app/lib/api";
import { useWebSocketContext } from "@/components/providers/websocket-provider";
import { IMessage, StompSubscription } from "@stomp/stompjs";
// @ts-ignore
import { ChatMessage, MessageType } from "@/types/chat";

interface Message {
  id: number;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    image: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
  isFromCurrentUser: boolean;
}

interface ConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const unwrappedParams = use(params);
  const conversationId = parseInt(unwrappedParams.id);
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // WebSocket context
  const { 
    connected, 
    sendMessage: sendWsMessage, 
    subscribe, 
    unsubscribe,
    userId: currentUserId,
    client: stompClient
  } = useWebSocketContext();
  
  // WebSocket subscriptions
  const chatSubscriptionRef = useRef<StompSubscription | null>(null);
  const readStatusSubscriptionRef = useRef<StompSubscription | null>(null);
  const typingSubscriptionRef = useRef<StompSubscription | null>(null);

  // Không sử dụng processedMessageIds vì có thể gây ra việc bỏ qua tin nhắn mới
  const latestMessageIdRef = useRef<number | null>(null);
  const lastPollingTimeRef = useRef<number>(Date.now());

  // Debug trạng thái WebSocket
  useEffect(() => {
    console.log(`🌐 WebSocket Status: connected=${connected}, client exists=${!!stompClient}, client active=${stompClient?.active}`);
    
    if (connected) {
      console.log("✅ WebSocket đang hoạt động - tin nhắn thời gian thực sẽ hoạt động");
    } else {
      console.log("❌ WebSocket không kết nối - tin nhắn có thể không hiển thị thời gian thực");
    }
  }, [connected, stompClient]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId || conversationId <= 0) {
        console.error('Invalid conversation ID:', conversationId);
        return;
      }
      
      try {
        setLoading(true);
        
        // Lấy thông tin cuộc trò chuyện
        const convo = await getConversation(conversationId);
        setConversation(convo);
        
        // Lấy tin nhắn
        const msgs = await getAllMessages(conversationId);
        console.log('⬇️ Loaded initial messages:', msgs);
        if (Array.isArray(msgs)) {
          setMessages(msgs);
          // Lưu ID tin nhắn mới nhất
          if (msgs.length > 0) {
            const messageIds = msgs.map(msg => msg.id);
            latestMessageIdRef.current = Math.max(...messageIds);
            console.log('Latest message ID from load:', latestMessageIdRef.current);
          }
        } else {
          console.error('Expected array of messages but got:', msgs);
          setMessages([]);
        }
        
        // Lấy danh sách các cuộc trò chuyện
        const convos = await getAllConversations();
        if (Array.isArray(convos)) {
          setConversations(convos);
        } else {
          setConversations([]);
        }
        
        // Đánh dấu tin nhắn đã đọc
        await markMessagesAsRead(conversationId);
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (error) {
        console.error('Error loading conversation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversation();
    lastPollingTimeRef.current = Date.now();
    
    // Khi unmount component, hủy đăng ký các sự kiện WebSocket
    return () => {
      if (chatSubscriptionRef.current) {
        unsubscribe(chatSubscriptionRef.current);
        chatSubscriptionRef.current = null;
      }
      if (readStatusSubscriptionRef.current) {
        unsubscribe(readStatusSubscriptionRef.current);
        readStatusSubscriptionRef.current = null;
      }
      if (typingSubscriptionRef.current) {
        unsubscribe(typingSubscriptionRef.current);
        typingSubscriptionRef.current = null;
      }
      setIsSubscribed(false);
    };
  }, [conversationId]);

  // Hàm kiểm tra kết nối WebSocket
  const checkStompConnection = () => {
    if (!stompClient) {
      console.error("🚫 STOMP client không tồn tại");
      return false;
    }
    
    if (!stompClient.active) {
      console.error("🚫 STOMP client không active");
      return false;
    }
    
    if (!connected) {
      console.error("🚫 WebSocket chưa kết nối");
      return false;
    }
    
    return true;
  };

  // Hàm xử lý tin nhắn mới từ WebSocket
  const handleNewMessage = (chatMessage: ChatMessage) => {
    console.log("📩 Received WebSocket message:", chatMessage);
    console.log("Current latest message ID:", latestMessageIdRef.current);
    
    // Kiểm tra xem tin nhắn đã được xử lý chưa bằng ID
    if (messages.some(msg => msg.id === chatMessage.id)) {
      console.log("⚠️ Skipping already displayed message:", chatMessage.id);
      return;
    }
    
    // Xác định xem tin nhắn có phải từ người dùng hiện tại
    const isFromCurrentUser = chatMessage.senderId === currentUserId;
    console.log("Is from current user:", isFromCurrentUser);
    
    // Tạo đối tượng tin nhắn từ dữ liệu WebSocket
    const newMsg: Message = {
      id: chatMessage.id,
      sender: {
        id: chatMessage.senderId,
        firstName: chatMessage.senderName?.split(' ')[0] || '',
        lastName: chatMessage.senderName?.split(' ').slice(1).join(' ') || '',
        image: chatMessage.senderImage || ''
      },
      content: chatMessage.content,
      isRead: isFromCurrentUser ? true : false,
      createdAt: chatMessage.timestamp || new Date().toISOString(),
      isFromCurrentUser
    };
    
    // Cập nhật ID tin nhắn mới nhất
    if (chatMessage.id > (latestMessageIdRef.current || 0)) {
      latestMessageIdRef.current = chatMessage.id;
    }
    
    // Nếu là tin nhắn từ người dùng hiện tại, xóa tin nhắn tạm thời có cùng nội dung
    if (isFromCurrentUser) {
      console.log("🔄 Removing temporary message with same content");
      setMessages(prevMessages => prevMessages.filter(msg => 
        !(msg.id < 0 && msg.isFromCurrentUser && msg.content === newMsg.content)
      ));
    }
    
    // Thêm tin nhắn vào state
    console.log("➕ Adding new message to state:", newMsg);
    setMessages(prevMessages => [...prevMessages, newMsg]);
    
    // Đánh dấu tin nhắn đã đọc (nếu không phải từ người dùng hiện tại)
    if (!isFromCurrentUser) {
      console.log("📑 Marking message as read");
      sendWsMessage(`/app/chat.markRead/${conversationId}`, {
        senderId: currentUserId,
        conversationId
      });
    }
    
    // Cập nhật thời gian polling cuối cùng
    lastPollingTimeRef.current = Date.now();
    
    // Cuộn xuống dưới cùng
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };
  
  // Đăng ký lắng nghe tin nhắn từ WebSocket khi đã kết nối
  useEffect(() => {
    // Chỉ đăng ký khi đã kết nối và có conversationId hợp lệ
    if (connected && conversationId && conversationId > 0 && !isSubscribed) {
      console.log("🔌 WebSocket connected, setting up listeners for conversation:", conversationId);
      
      // Chuyển đổi conversationId thành string để đảm bảo tương thích với server Java
      const conversationIdString = String(conversationId);
      
      // Kiểm tra kết nối STOMP
      if (!checkStompConnection()) {
        console.error("❌ Cannot subscribe: STOMP connection not ready");
        return;
      }
      
      // Hủy đăng ký cũ nếu có
      if (chatSubscriptionRef.current) {
        console.log("🗑️ Unsubscribing from previous chat subscription");
        unsubscribe(chatSubscriptionRef.current);
        chatSubscriptionRef.current = null;
      }
      
      // Đăng ký nhận tin nhắn mới
      const chatDestination = `/topic/chat/${conversationIdString}`;
      console.log("📲 Subscribing to:", chatDestination);
      
      try {
        chatSubscriptionRef.current = subscribe(
          chatDestination,
          (message: IMessage) => {
            try {
              console.log("📣 Raw WebSocket message received:", message);
              console.log("📣 Message body:", message.body);
              
              const chatMessage = JSON.parse(message.body) as ChatMessage;
              console.log("📣 Parsed message:", chatMessage);
              
              handleNewMessage(chatMessage);
            } catch (error) {
              console.error("❌ Error processing WebSocket message:", error);
            }
          }
        );
        
        if (chatSubscriptionRef.current) {
          console.log("✅ Chat subscription successful:", chatSubscriptionRef.current);
        } else {
          console.error("❌ Failed to subscribe to chat topic");
        }
      } catch (error) {
        console.error("❌ Error during subscription:", error);
      }
      
      // Đăng ký trạng thái đọc tin nhắn
      if (readStatusSubscriptionRef.current) {
        unsubscribe(readStatusSubscriptionRef.current);
      }
      
      try {
        readStatusSubscriptionRef.current = subscribe(
          `/topic/chat/${conversationIdString}/read`,
          (message: IMessage) => {
            const readStatus = JSON.parse(message.body);
            console.log("👁️ Read status received:", readStatus);
            
            // Cập nhật trạng thái đọc tin nhắn
            if (readStatus.senderId !== currentUserId) {
              setMessages(prevMessages => 
                prevMessages.map(msg => ({
                  ...msg,
                  isRead: true
                }))
              );
            }
          }
        );
      } catch (error) {
        console.error("❌ Error subscribing to read status:", error);
      }
      
      // Đăng ký trạng thái đang nhập
      if (typingSubscriptionRef.current) {
        unsubscribe(typingSubscriptionRef.current);
      }
      
      try {
        typingSubscriptionRef.current = subscribe(
          `/topic/chat/${conversationIdString}/typing`,
          (message: IMessage) => {
            const typingStatus = JSON.parse(message.body);
            console.log("⌨️ Typing status received:", typingStatus);
            
            if (typingStatus.senderId !== currentUserId) {
              // Thêm người dùng vào danh sách đang nhập
              setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.add(typingStatus.senderId);
                return newSet;
              });
              
              // Xóa người dùng khỏi danh sách sau 3 giây
              setTimeout(() => {
                setTypingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(typingStatus.senderId);
                  return newSet;
                });
              }, 3000);
            }
          }
        );
      } catch (error) {
        console.error("❌ Error subscribing to typing status:", error);
      }
      
      // Gửi trạng thái đã đọc tin nhắn ngay khi đăng ký
      if (currentUserId) {
        try {
          sendWsMessage(`/app/chat.markRead/${conversationIdString}`, {
            senderId: currentUserId,
            conversationId: conversationIdString
          });
          console.log("✅ Marked messages as read");
        } catch (error) {
          console.error("❌ Error marking messages as read:", error);
        }
      }
      
      setIsSubscribed(true);
    }
  }, [connected, conversationId, currentUserId, subscribe, unsubscribe, isSubscribed]);

  // Thêm polling dự phòng khi WebSocket không hoạt động
  useEffect(() => {
    const pollingInterval = setInterval(async () => {
      // Polling chỉ khi không kết nối WebSocket hoặc khi đã quá thời gian từ lần cập nhật cuối
      const timeSinceLastUpdate = Date.now() - lastPollingTimeRef.current;
      const shouldPoll = (!connected || timeSinceLastUpdate > 10000) && conversationId > 0;
      
      if (shouldPoll) {
        console.log("🔄 Polling for new messages as fallback");
        try {
          const latestMsgs = await getAllMessages(conversationId);
          
          if (Array.isArray(latestMsgs) && latestMsgs.length > 0) {
            // Chỉ cập nhật nếu có tin nhắn mới
            const latestServerMsgId = Math.max(...latestMsgs.map(msg => msg.id));
            
            if (latestServerMsgId > (latestMessageIdRef.current || 0)) {
              console.log("🔄 Found newer messages via polling, updating view");
              setMessages(latestMsgs);
              latestMessageIdRef.current = latestServerMsgId;
              lastPollingTimeRef.current = Date.now();
              
              // Cuộn xuống
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }
          }
        } catch (error) {
          console.error("❌ Error polling messages:", error);
        }
      }
    }, 5000); // Poll mỗi 5 giây
    
    return () => clearInterval(pollingInterval);
  }, [connected, conversationId]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const messageContent = newMessage.trim();
      setNewMessage(""); // Reset form ngay lập tức để tránh gửi trùng lặp
      
      console.log("📤 Sending message:", messageContent);
      console.log("Connected:", connected);
      
      // Tạo tin nhắn tạm thời để hiển thị ngay lập tức
      const tempMessage: Message = {
        id: Date.now() * -1, // ID tạm (âm để không trùng với ID từ server)
        sender: {
          id: currentUserId || 0,
          firstName: "",
          lastName: "",
          image: ""
        },
        content: messageContent,
        isRead: false,
        createdAt: new Date().toISOString(),
        isFromCurrentUser: true
      };
      
      console.log("➕ Adding temporary message:", tempMessage);
      setMessages(prevMsgs => [...prevMsgs, tempMessage]);
      
      if (connected && checkStompConnection()) {
        // Gửi tin nhắn qua WebSocket (đảm bảo conversationId là string)
        const conversationIdString = String(conversationId);
        console.log("Sending via WebSocket to:", `/app/chat.sendMessage/${conversationIdString}`);
        
        sendWsMessage(`/app/chat.sendMessage/${conversationIdString}`, {
          senderId: currentUserId,
          conversationId: conversationIdString, // Gửi dưới dạng string để tương thích với Java Long
          content: messageContent
        });
      } else {
        // Fallback: gửi qua REST API nếu WebSocket chưa kết nối
        console.log("Sending via REST API (WebSocket not available)");
        await sendMessage(conversationId, messageContent);
        
        // Đảm bảo cập nhật tin nhắn sau khi gửi thành công
        try {
          setTimeout(async () => {
            const updatedMsgs = await getAllMessages(conversationId);
            if (Array.isArray(updatedMsgs)) {
              console.log("Refreshing messages after REST API send");
              setMessages(updatedMsgs);
              
              if (updatedMsgs.length > 0) {
                const messageIds = updatedMsgs.map(msg => msg.id);
                latestMessageIdRef.current = Math.max(...messageIds);
              }
            }
          }, 1000);
        } catch (err) {
          console.error("Error refreshing messages after send:", err);
        }
      }
      
      // Cập nhật thời gian polling cuối cùng
      lastPollingTimeRef.current = Date.now();
      
      // Cuộn xuống dưới cùng
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Restore message nếu lỗi
      setNewMessage(newMessage);
    }
  };

  // Xử lý sự kiện đang nhập
  const handleTyping = () => {
    if (connected && currentUserId) {
      // Gửi trạng thái đang nhập
      sendWsMessage(`/app/chat.typing/${conversationId}`, {
        senderId: currentUserId,
        conversationId,
        senderName: "" // Sẽ được điền ở server
      });
      
      // Hủy timeout cũ nếu có
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full max-w-7xl mx-auto px-4">
          <div className="hidden md:block col-span-1 bg-secondary/30 rounded-md">
            <ConversationsList conversations={conversations} loading={loading} />
          </div>
          <div className="col-span-1 md:col-span-3 bg-secondary/30 rounded-md flex items-center justify-center">
            <div className="animate-pulse w-full h-full flex flex-col p-4">
              <div className="h-16 bg-muted rounded-md mb-4"></div>
              <div className="flex-1 bg-muted rounded-md mb-4"></div>
              <div className="h-12 bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full max-w-7xl mx-auto px-4">
        <div className="hidden md:block col-span-1 bg-secondary/30 rounded-md">
          <ConversationsList conversations={conversations} loading={false} />
        </div>
        
        <div className="col-span-1 md:col-span-3 bg-secondary/30 rounded-md flex flex-col">
          {conversation && (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage 
                    src={conversation.otherUser?.image} 
                    alt={`${conversation.otherUser?.firstName} ${conversation.otherUser?.lastName}`} 
                  />
                  <AvatarFallback>
                    {conversation.otherUser?.firstName?.[0]}
                    {conversation.otherUser?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {conversation.otherUser?.firstName} {conversation.otherUser?.lastName}
                  </h2>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Bắt đầu cuộc trò chuyện với {conversation.otherUser?.firstName}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!message.isFromCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender.image} alt={message.sender.firstName} />
                            <AvatarFallback>
                              {message.sender.firstName?.[0]}
                              {message.sender.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div 
                          className={`px-4 py-2 rounded-2xl ${
                            message.isFromCurrentUser 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-muted rounded-tl-none'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleTyping}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 