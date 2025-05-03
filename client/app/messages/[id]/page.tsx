"use client";

import React, { useEffect, useState, useRef, FormEvent } from "react";
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
  getRecentMessages,
  sendMessage, 
  markMessagesAsRead 
} from "@/app/lib/api";

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

export default function ConversationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const conversationId = parseInt(params.id);
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageId, setLastMessageId] = useState<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hàm để cập nhật tin nhắn từ server
  const updateMessages = (newMessages: Message[]) => {
    if (!Array.isArray(newMessages)) {
      console.warn("updateMessages: Not an array:", newMessages);
      return;
    }
    
    setMessages(newMessages);
    
    // Cập nhật ID tin nhắn cuối cùng để polling
    if (newMessages.length > 0) {
      const maxId = Math.max(...newMessages.map(msg => msg.id));
      setLastMessageId(maxId);
    }
  };

  // Hàm để lấy tin nhắn mới nhất sau lastMessageId
  const fetchNewMessages = async () => {
    // Chỉ polling khi có conversationId hợp lệ và lastMessageId > 0
    if (!conversationId || conversationId <= 0 || !lastMessageId || lastMessageId <= 0) {
      console.log(`Skipping polling - conversationId: ${conversationId}, lastMessageId: ${lastMessageId}`);
      return;
    }
    
    try {
      console.log(`Polling for new messages after ID ${lastMessageId}`);
      const newMsgs = await getRecentMessages(conversationId, lastMessageId);
      
      if (newMsgs && Array.isArray(newMsgs) && newMsgs.length > 0) {
        console.log(`Received ${newMsgs.length} new messages during polling`);
        
        // Chỉ thêm tin nhắn mới vào danh sách hiện tại
        setMessages(prevMessages => {
          // Tạo mảng các ID tin nhắn hiện tại để tránh trùng lặp
          const existingIds = new Set(prevMessages.map(msg => msg.id));
          
          // Lọc những tin nhắn chưa có trong danh sách
          const uniqueNewMessages = newMsgs.filter(msg => !existingIds.has(msg.id));
          
          if (uniqueNewMessages.length === 0) return prevMessages;
          
          // Cập nhật lastMessageId nếu có tin nhắn mới
          const allMessages = [...prevMessages, ...uniqueNewMessages];
          if (allMessages.length > 0) {
            const maxId = Math.max(...allMessages.map(msg => msg.id));
            setLastMessageId(maxId);
          }
          
          return allMessages;
        });
        
        // Tự động scroll xuống dưới khi có tin nhắn mới
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error('Error polling for new messages:', error);
    }
  };

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getAllConversations();
        setConversations(data);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin cuộc trò chuyện
        try {
          const conversationData = await getConversation(conversationId);
          setConversation(conversationData);
          
          // Đánh dấu tin nhắn đã đọc
          await markMessagesAsRead(conversationId);
        } catch (error) {
          console.error("Error loading conversation details:", error);
        }
        
        // Lấy tin nhắn từ cuộc trò chuyện
        try {
          const messagesData = await getAllMessages(conversationId);
          // Thêm log để debug
          console.log('Received messages data:', messagesData);
          
          // Kiểm tra nếu messagesData là dạng response mới (object với error và messages)
          if (messagesData && typeof messagesData === 'object' && 'messages' in messagesData) {
            if (messagesData.error) {
              console.warn(`[Chat] Error from API: ${messagesData.error}`);
            }
            
            const messages = messagesData.messages;
            if (Array.isArray(messages)) {
              console.log(`Found ${messages.length} messages in conversation`);
              updateMessages(messages);
            } else {
              console.warn("Messages array is not valid, setting empty array");
              setMessages([]);
            }
          }
          // Kiểm tra xem messagesData có phải là mảng không
          else if (Array.isArray(messagesData)) {
            console.log(`Found ${messagesData.length} messages in conversation`);
            // Cập nhật tin nhắn
            updateMessages(messagesData);
          } else {
            console.warn("Messages data is not in expected format, setting empty array:", messagesData);
            setMessages([]);
          }
        } catch (error) {
          console.error("Error loading messages:", error);
          setMessages([]); // Khởi tạo là mảng rỗng nếu lỗi
        }
        
      } catch (error) {
        console.error("Error in conversation loading process:", error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      loadConversation();
    }
    
    // Dọn dẹp interval khi component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [conversationId]);

  // Tách riêng phần khởi động polling sang useEffect khác để chỉ chạy khi lastMessageId thay đổi
  useEffect(() => {
    // Chỉ bắt đầu polling khi có lastMessageId hợp lệ
    if (conversationId && lastMessageId > 0) {
      console.log(`Starting polling for new messages after ID ${lastMessageId}`);
      
      // Bắt đầu polling tin nhắn mới với tần suất cao hơn
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Thiết lập interval cho việc polling
      pollingIntervalRef.current = setInterval(fetchNewMessages, 3000); // 3 giây
    }
  }, [conversationId, lastMessageId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Gửi tin nhắn và lấy kết quả
      const sentMessage = await sendMessage(conversationId, newMessage);
      
      // Ngay lập tức thêm tin nhắn mới vào danh sách
      if (sentMessage) {
        setMessages(prevMessages => [...prevMessages, sentMessage]);
        
        // Cập nhật lastMessageId
        if (sentMessage.id > lastMessageId) {
          setLastMessageId(sentMessage.id);
        }
      }
      
      // Xóa nội dung tin nhắn đã nhập
      setNewMessage("");
      
      // Scroll xuống tin nhắn mới
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error sending message:", error);
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