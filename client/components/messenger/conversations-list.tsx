"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export interface Conversation {
  id: number;
  otherUser: {
    id: number;
    firstName: string;
    lastName: string;
    image: string;
  };
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ConversationsListProps {
  conversations: Conversation[];
  loading: boolean;
}

export default function ConversationsList({ conversations, loading }: ConversationsListProps) {
  const router = useRouter();

  const navigateToConversation = (conversationId: number) => {
    router.push(`/messages/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Tin nhắn</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-2 rounded-md">
              <div className="w-12 h-12 rounded-full bg-muted animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Tin nhắn</h2>
      
      {conversations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Bạn chưa có cuộc trò chuyện nào</p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
              onClick={() => navigateToConversation(conversation.id)}
            >
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={conversation.otherUser.image} 
                  alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`} 
                />
                <AvatarFallback>
                  {conversation.otherUser.firstName?.[0]}
                  {conversation.otherUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">
                    {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                  </h3>
                  {conversation.lastMessageTime && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.lastMessageTime), { 
                        addSuffix: true,
                        locale: vi
                      })}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessageText || "Bắt đầu cuộc trò chuyện"}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
