"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserDto } from "@/app/lib/api";
import { startConversation } from "@/app/lib/api";

interface FriendsListProps {
  friends: UserDto[];
  loading: boolean;
}

export default function FriendsList({ friends, loading }: FriendsListProps) {
  const router = useRouter();

  const handleStartConversation = async (friendId: number) => {
    try {
      const conversation = await startConversation(friendId);
      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Bạn bè</h2>
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
      <h2 className="text-lg font-semibold mb-4">Bạn bè</h2>
      
      {friends.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Bạn chưa có bạn bè nào</p>
          <Button 
            variant="link" 
            className="mt-2" 
            onClick={() => router.push('/friends')}
          >
            Tìm bạn bè
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
            >
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={friend.image} 
                  alt={`${friend.firstName} ${friend.lastName}`} 
                />
                <AvatarFallback>
                  {friend.firstName?.[0]}
                  {friend.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">
                  {friend.firstName} {friend.lastName}
                </h3>
                <div className="flex justify-between items-center mt-1">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleStartConversation(friend.id)}
                  >
                    Nhắn tin
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 