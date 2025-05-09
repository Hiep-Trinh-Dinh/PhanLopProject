"use client";

import Link from "next/link";
import { Bell, MessageCircle, ThumbsUp, UserPlus, Users, Share, Globe } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { NotificationDto } from "@/app/lib/api";

// Ánh xạ từ NotificationType của server sang dạng frontend
const mapServerTypeToClientType = (serverType: string): NotificationType => {
  switch (serverType) {
    case "POST_LIKE": return "like";
    case "POST_COMMENT": return "comment";
    case "POST_SHARE": return "share";
    case "POST_CREATED": return "post_created";
    case "FRIEND_REQUEST": return "friend_request";
    case "FRIEND_ACCEPTED": return "friend_accepted";
    default: return "other";
  }
};

type NotificationType =
  | "like"
  | "comment"
  | "share"
  | "post_created"
  | "friend_request"
  | "friend_accepted"
  | "other";

interface NotificationItemProps {
  notification: NotificationDto;
  onMarkAsRead: (id: number) => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead
}: NotificationItemProps) {
  const { id, actor, type: serverType, content, read, createdAt, link } = notification;
  
  // Chuyển đổi kiểu từ server sang client
  const type = mapServerTypeToClientType(serverType);
  
  // Format thời gian
  const time = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: vi })
    : "";
  
  // Thông tin người thực hiện hành động 
  const user = actor ? {
    name: `${actor.firstName || ''} ${actor.lastName || ''}`.trim(),
    avatar: actor.image || "/placeholder-user.jpg"
  } : {
    name: "Hệ thống",
    avatar: "/system-avatar.jpg"
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-5 w-5 text-blue-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      case "share":
        return <Share className="h-5 w-5 text-indigo-500" />;
      case "post_created":
        return <Globe className="h-5 w-5 text-cyan-500" />;
      case "friend_request":
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case "friend_accepted":
        return <Users className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleClick = () => {
    // Đánh dấu đã đọc khi click
    if (!read) {
      onMarkAsRead(id);
    }
    
    // Điều hướng tới liên kết nếu có
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all ${
        read
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-blue-900 hover:bg-blue-800"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Ảnh đại diện */}
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full"
          />
          <div className="absolute -bottom-1 -right-1 bg-gray-900 p-1 rounded-full">
            {getNotificationIcon(type)}
          </div>
        </div>

        {/* Nội dung thông báo */}
        <div className="flex-1">
          <p className="text-white text-sm">
            <span className="font-semibold">{user.name}</span>{" "}
            {content}
          </p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>

        {/* Chỉ báo thông báo chưa đọc */}
        {!read && (
          <div className="h-3 w-3 bg-blue-500 rounded-full mt-2"></div>
        )}
      </div>
    </div>
  );
}