"use client";

import { useState, useEffect } from "react";
import ConversationsList from "./conversations-list";
import EmptyConversation from "./empty-conversation";
import Conversation from "./conversation";

interface MessengerLayoutProps {
  children: React.ReactNode;
}

export default function MessengerLayout({ children }: MessengerLayoutProps) {
  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<null | {
    id: number;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    lastActive: string;
  }>(null);

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectUser = (user: typeof selectedUser) => {
    setSelectedUser(user);
  };

  // Return null or loading state until mounted
  if (!mounted) {
    return null; // or return loading skeleton
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-full md:w-80">
        <ConversationsList onSelectUser={handleSelectUser} />
      </div>
      <div className="hidden flex-1 md:block">
        {selectedUser ? (
          <Conversation user={selectedUser} />
        ) : (
          <EmptyConversation />
        )}
      </div>
    </div>
  );
}