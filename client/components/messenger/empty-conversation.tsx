"use client";

import { MessageSquare } from "lucide-react"

export default function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="bg-muted/50 p-4 rounded-full mb-4">
        <MessageSquare className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Tin nhắn của bạn</h3>
      <p className="text-muted-foreground max-w-md">
        Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới với bạn bè của bạn.
      </p>
    </div>
  );
}

