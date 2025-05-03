"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, UserPlus, MessageCircle } from "lucide-react";
import Image from "next/image";
import { FriendshipApi, startConversation } from "../../app/lib/api";
import { toast } from "sonner";

// Định nghĩa interface UserDto
interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  name?: string;
  avatar?: string;
  image?: string;
  isOnline?: number;  // 0: offline, 1: online
  isFriend?: boolean;
  mutualFriends?: number;
  pendingFriendRequest?: boolean;
  receivedFriendRequest?: boolean;
}

export default function RightSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [onlineFriends, setOnlineFriends] = useState<UserDto[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Kiểm tra kết nối mạng trước khi gọi API
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          console.warn('Đang offline, không thể tải dữ liệu bạn bè');
          setOnlineFriends([]);
          setSuggestedFriends([]);
          setLoading(false);
          return;
        }

        // Bọc trong try-catch riêng để xử lý lỗi độc lập cho từng API
        let friendsData: any[] = [];
        try {
          // Lấy danh sách bạn bè với timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await Promise.race([
            FriendshipApi.getFriends(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout fetching friends')), 5000)
            )
          ]) as any;
          
          clearTimeout(timeoutId);
          
          // Xử lý khi response hợp lệ
          if (response) {
            // API trả về trực tiếp mảng hoặc đối tượng có thuộc tính content
            if (Array.isArray(response)) {
              friendsData = response;
            } else if (response && typeof response === 'object') {
              // Kiểm tra thuộc tính content
              if (Array.isArray(response.content)) {
                friendsData = response.content;
              }
            }
          }
        } catch (friendsError) {
          console.warn("Không thể tải danh sách bạn bè:", friendsError);
          // Tiếp tục xử lý với danh sách rỗng
          friendsData = [];
        }
        
        // Biến đổi dữ liệu để phù hợp với UI - thêm kiểm tra null/undefined cho mỗi thuộc tính
        const transformedFriends = friendsData.filter(friend => friend && friend.id).map((friend) => ({
          id: friend.id || 0,
          firstName: friend.firstName || '',
          lastName: friend.lastName || '',
          username: friend.username || '',
          name: `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || 'Người dùng',
          avatar: friend.image || '/placeholder-user.jpg',
          isOnline: friend.isOnline || 0
        }));
        
        // Hiển thị tất cả bạn bè (không chỉ online) nhưng giới hạn số lượng
        const friendsToShow = transformedFriends.slice(0, 8); // Giới hạn hiển thị tối đa 8 bạn bè
          
        setOnlineFriends(friendsToShow);

        // Bọc trong try-catch riêng để xử lý lỗi độc lập cho suggestions
        try {
          // Lấy danh sách gợi ý bạn bè với timeout
          const suggestions = await Promise.race([
            FriendshipApi.getSuggestions(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout fetching suggestions')), 5000)
            )
          ]) as any;
          
          if (suggestions && suggestions.content && Array.isArray(suggestions.content)) {
            // Biến đổi dữ liệu gợi ý
            const transformedSuggestions = suggestions.content
              .filter((suggestion: any) => suggestion && suggestion.id)
              .map((suggestion: any) => ({
                ...suggestion,
                id: suggestion.id || 0,
                firstName: suggestion.firstName || '',
                lastName: suggestion.lastName || '',
                username: suggestion.username || '',
                name: `${suggestion.firstName || ''} ${suggestion.lastName || ''}`.trim() || 'Người dùng',
                avatar: suggestion.image || '/placeholder-user.jpg',
                mutualFriends: suggestion.mutualFriends || 0
              }))
              .slice(0, 2); // Chỉ hiển thị 2 gợi ý
            
            setSuggestedFriends(transformedSuggestions);
          } else {
            setSuggestedFriends([]);
          }
        } catch (suggestionsError) {
          console.warn("Không thể tải gợi ý bạn bè:", suggestionsError);
          setSuggestedFriends([]);
        }
      } catch (error) {
        console.warn("Lỗi khi tải dữ liệu sidebar:", error);
        // Để trống mảng nếu lỗi
        setOnlineFriends([]);
        setSuggestedFriends([]);
      } finally {
        setLoading(false);
      }
    }

    if (pathname === "/home") {
      fetchData();
    }
  }, [pathname]);

  // Nếu không phải trang Home ("/home") thì không render sidebar
  if (pathname !== "/home") return null;

  // Xử lý gửi lời mời kết bạn
  const handleAddFriend = async (userId: number) => {
    try {
      await FriendshipApi.sendRequest(userId);
      toast.success("Đã gửi lời mời kết bạn");
      // Cập nhật lại danh sách gợi ý (loại bỏ người vừa gửi lời mời)
      setSuggestedFriends(prev => prev.filter(friend => friend.id !== userId));
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      toast.error("Không thể gửi lời mời kết bạn");
    }
  };

  // Xử lý bắt đầu cuộc trò chuyện
  const handleStartConversation = async (friendId: number) => {
    try {
      // Kiểm tra kết nối mạng
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        toast.error("Không có kết nối mạng, vui lòng thử lại sau");
        return;
      }

      // Hiển thị thông báo đang tải
      const toastId = toast.loading("Đang bắt đầu cuộc trò chuyện...");
      
      // Sử dụng Promise.race với timeout
      try {
        const conversation = await Promise.race([
          startConversation(friendId),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout starting conversation')), 5000)
          )
        ]) as any;
        
        // Đóng toast loading
        toast.dismiss(toastId);
        
        // Kiểm tra kết quả trả về
        if (!conversation || !conversation.id) {
          toast.error("Không thể bắt đầu cuộc trò chuyện, vui lòng thử lại");
          return;
        }
        
        // Chuyển hướng đến trang tin nhắn
        router.push(`/messages/${conversation.id}`);
      } catch (timeoutError) {
        // Xử lý timeout
        toast.dismiss(toastId);
        toast.error("Yêu cầu quá thời gian, vui lòng thử lại");
      }
    } catch (error) {
      console.warn("Lỗi khi bắt đầu cuộc trò chuyện:", error);
      toast.error("Không thể bắt đầu cuộc trò chuyện");
    }
  };

  return (
    <aside className="hidden lg:block fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-60 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Online Friends */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Friends
          </h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400">Đang tải...</p>
            ) : onlineFriends.length > 0 ? (
              onlineFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-800 cursor-pointer"
                  onClick={() => handleStartConversation(friend.id)}
                >
                  <div className="relative h-10 w-10">
                    <Image
                      src={friend.avatar || '/placeholder-user.jpg'}
                      alt={friend.name || ''}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                    {friend.isOnline === 1 && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500" />
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <span className="font-medium text-white">{friend.name}</span>
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Bạn chưa có bạn bè nào</p>
            )}
          </div>
        </div>

        {/* Suggested Friends */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Suggested Friends
          </h2>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-400">Đang tải...</p>
            ) : suggestedFriends.length > 0 ? (
              suggestedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex flex-col items-start space-y-2 rounded-lg p-2 hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10">
                      <Image
                        src={friend.avatar || '/placeholder-user.jpg'}
                        alt={friend.name || ''}
                        width={40}
                        height={40}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/profile/${friend.username}`}
                        className="font-medium text-white hover:underline"
                      >
                        {friend.name}
                      </Link>
                      <div className="flex items-center text-xs text-gray-400">
                        <Users className="mr-1 h-3 w-3" />
                        <span>{friend.mutualFriends || 0} mutual friends</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="w-full rounded-md border border-gray-700 px-3 py-1 text-sm hover:bg-gray-800 flex items-center justify-center"
                    onClick={() => handleAddFriend(friend.id)}
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Add Friend
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Không có gợi ý bạn bè</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
