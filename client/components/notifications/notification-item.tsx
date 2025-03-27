"use client";

import Link from "next/link";
import { Bell, Check, MessageCircle, ThumbsUp, UserPlus, Users} from "lucide-react";

type NotificationType =
  | "like"
  | "comment"
  | "friend_request"
  | "friend_accepted"
  | "group_invite"
  | "mention";

interface NotificationItemProps {
  id: number;
  type: NotificationType;
  content: string;
  time: string;
  isRead: boolean;
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  link?: string;
  actionLink?: string;
  actionText?: string;
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: number) => void;
  onAcceptFriendRequest?: (id: number) => void;
  onRejectFriendRequest?: (id: number) => void;
}

export default function NotificationItem({
  id,
  type,
  content,
  time,
  isRead,
  user,
  link,
  actionLink,
  actionText,
  onMarkAsRead,
  onAcceptFriendRequest,
  onRejectFriendRequest,
}: NotificationItemProps) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-5 w-5 text-blue-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      case "friend_request":
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case "friend_accepted":
        return <Check className="h-5 w-5 text-green-500" />;
      case "group_invite":
        return <Users className="h-5 w-5 text-yellow-500" />;
      case "mention":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div
     className={`p-4 rounded-lg cursor-pointer transition-all ${
       isRead
         ? "bg-gray-800 hover:bg-gray-700"
         : "bg-blue-900 hover:bg-blue-800"
      }`}
      onClick={() => onMarkAsRead(id)}
    >
     {/* Avatar + Icon + Nội dung */}
     <div className="flex items-start space-x-4">
       {/* Ảnh đại diện */}
       <div className="relative">
         <img
           src={user.avatar}
           alt={user.name}
           className="h-10 w-10 rounded-full border border-gray-600"
         />
         <div className="absolute -bottom-1 -right-1 bg-gray-900 p-1 rounded-full">
           {getNotificationIcon(type)}
         </div>
       </div>

       {/* Nội dung thông báo */}
      <div className="flex-1">
         <p className="text-white text-sm">
           <Link
             href={`/profile/${user.username}`}
             className="font-semibold hover:underline"
           >
             {user.name}
           </Link>{" "}
           {content}
        </p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>

       {/* Chấm xanh báo chưa đọc */}
       {!isRead && (
         <div className="h-3 w-3 bg-blue-500 rounded-full mt-2"></div>
       )}
     </div>

     {/* Nút hành động: Đưa xuống dưới */}
     {type === "friend_request" &&
       onAcceptFriendRequest &&
       onRejectFriendRequest && (
         <div className="mt-3 flex space-x-2">
           <button
             className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
             onClick={(e) => {
               e.stopPropagation();
               onAcceptFriendRequest(id);
             }}
           >
             Chấp nhận
           </button>
           <button
             className="w-full px-3 py-2 text-sm font-medium text-white border border-gray-600 rounded hover:bg-gray-700"
             onClick={(e) => {
               e.stopPropagation();
               onRejectFriendRequest(id);
             }}
           >
             Từ chối
           </button>
         </div>
       )}
    </div>
  );
};