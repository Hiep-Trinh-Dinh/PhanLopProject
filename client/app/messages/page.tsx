"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout"
import { useRouter } from "next/navigation";
import ConversationsList from "@/components/messenger/conversations-list";
import FriendsList from "@/components/messenger/friends-list";
import EmptyConversation from "@/components/messenger/empty-conversation"
import { getAllConversations, getFriendsForMessaging } from "@/app/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoadingConversations(true);
        const data = await getAllConversations();
        setConversations(data);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoadingConversations(false);
      }
    };

    const loadFriends = async () => {
      try {
        setLoadingFriends(true);
        const data = await getFriendsForMessaging();
        setFriends(data);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadConversations();
    loadFriends();
  }, []);

  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full max-w-7xl mx-auto px-4">
        <div className="hidden md:block col-span-1 bg-secondary/30 rounded-md">
          <Tabs defaultValue="conversations">
            <TabsList className="w-full">
              <TabsTrigger value="conversations" className="flex-1">Tin nhắn</TabsTrigger>
              <TabsTrigger value="friends" className="flex-1">Bạn bè</TabsTrigger>
            </TabsList>
            <TabsContent value="conversations">
              <ConversationsList conversations={conversations} loading={loadingConversations} />
            </TabsContent>
            <TabsContent value="friends">
              <FriendsList friends={friends} loading={loadingFriends} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="col-span-1 md:col-span-3 flex items-center justify-center bg-secondary/30 rounded-md">
          <EmptyConversation />
        </div>
      </div>
    </MainLayout>
  )
}

