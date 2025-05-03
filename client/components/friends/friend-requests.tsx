"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Check, X } from "lucide-react"
import { FriendshipApi, FriendshipDto, UserDto } from "@/app/lib/api"
import { toast } from "react-hot-toast"

interface FriendRequestItem {
  id: number;
  name: string;
  avatar: string;
  username: string;
  mutualFriends: number;
}

interface FriendRequestsProps {
  onAccept?: () => void;
}

export default function FriendRequests({ onAccept }: FriendRequestsProps) {
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchFriendRequests()
  }, [])

  const fetchFriendRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const requests = await FriendshipApi.getPendingRequests()
      
      if (!requests || !Array.isArray(requests)) {
        console.error("Invalid response format from API:", requests)
        setFriendRequests([])
        return
      }
      
      // Chuyển đổi từ FriendshipDto sang FriendRequestItem để hiển thị
      const requestItems: FriendRequestItem[] = requests.map(req => ({
        id: req.id,
        name: `${req.user.firstName} ${req.user.lastName}`,
        avatar: req.user.image || "/placeholder-user.jpg",
        username: req.user.username,
        mutualFriends: req.mutualFriendsCount || 0
      }))
      
      setFriendRequests(requestItems)
    } catch (error) {
      console.error("Failed to fetch friend requests:", error)
      setError("Không thể tải lời mời kết bạn")
      toast.error("Không thể tải lời mời kết bạn")
      setFriendRequests([])
    } finally {
      setLoading(false)
    }
  }

  const acceptRequest = async (requestId: number) => {
    try {
      console.log(`Đang chấp nhận lời mời kết bạn có ID: ${requestId}`);
      
      // Gọi API để chấp nhận lời mời kết bạn
      await FriendshipApi.acceptRequest(requestId);
      
      // Cập nhật UI
      toast.success("Đã chấp nhận lời mời kết bạn");
      setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
      
      // Lưu thời gian cập nhật để các tab khác có thể phát hiện thay đổi
      if (typeof window !== 'undefined') {
        try {
          // Xóa danh sách bạn bè đã xóa để đảm bảo bạn mới được hiển thị
          localStorage.removeItem('removedFriends');
          
          // Đánh dấu thời gian cập nhật và cần refresh
          localStorage.setItem('friendship_updated_at', Date.now().toString());
          localStorage.setItem('friends_list_needs_refresh', 'true');
          
          console.log("Đã đánh dấu cần refresh danh sách bạn bè");
        } catch (error) {
          console.error("Lỗi khi lưu trạng thái vào localStorage:", error);
        }
      }
      
      // Gọi callback để cập nhật giao diện
      if (onAccept) {
        onAccept();
      }
      
      // Đợi một khoảng thời gian ngắn rồi reload trang
      // để đảm bảo dữ liệu được đồng bộ đúng
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log("Reloading page to refresh friend lists");
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
      toast.error("Không thể chấp nhận lời mời kết bạn");
    }
  }

  const rejectRequest = async (requestId: number) => {
    try {
      await FriendshipApi.rejectRequest(requestId)
      toast.success("Đã từ chối lời mời kết bạn")
      setFriendRequests(friendRequests.filter((request) => request.id !== requestId))
    } catch (error) {
      console.error("Failed to reject friend request:", error)
      toast.error("Không thể từ chối lời mời kết bạn")
    }
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            Friend Requests
          </h2>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-400 select-none pointer-events-none">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            Friend Requests
          </h2>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-400 select-none pointer-events-none">
            {error}
          </p>
          <button 
            onClick={fetchFriendRequests}
            className="mt-2 mx-auto block rounded-md border border-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            Friend Requests
          </h2>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-400 select-none pointer-events-none">
            No friend requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold select-none pointer-events-none">
          Friend Requests ({friendRequests.length})
        </h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {friendRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={request.avatar}
                    alt={request.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    {request.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/profile/${request.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {request.name}
                  </Link>
                  <p className="text-xs text-gray-400 select-none pointer-events-none">
                    {request.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => acceptRequest(request.id)}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className="inline-flex h-8 items-center justify-center rounded-md border border-gray-700 px-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                  onClick={() => rejectRequest(request.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

