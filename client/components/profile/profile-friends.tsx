"use client"

import Link from "next/link"
import { MoreHorizontal, Users, MessageCircle, UserMinus } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar } from "../../components/ui/avatar"
import { FriendshipApi } from "../../app/lib/api"
import { toast } from "sonner"

interface ProfileFriendsProps {
  userId: number
}

// Định nghĩa interface cho bạn bè sau khi chuyển đổi
interface Friend {
  id: number
  name: string
  username: string
  avatar: string
  mutualFriends: number
}

export default function ProfileFriends({ userId }: ProfileFriendsProps) {
  const [showDropdown, setShowDropdown] = useState<number | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFriends() {
      try {
        setLoading(true)
        console.log(`Đang tải danh sách bạn bè của người dùng ID: ${userId}`);
        
        // Lấy danh sách bạn bè của người dùng cụ thể bằng API
        // Trước: Sử dụng getFriends() cho người dùng hiện tại
        // Sau: Tạo mới một API call để lấy bạn bè của userId cụ thể
        
        // Gọi API với userId cụ thể
        const response = await fetch(`/api/friendship/user/${userId}/friends`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Lỗi khi lấy danh sách bạn bè: ${response.status}`);
        }
        
        const friendsList = await response.json();
        console.log(`Đã nhận ${friendsList.length} bạn bè của người dùng ID: ${userId}`);
        
        // Chuyển đổi dữ liệu để phù hợp với giao diện
        const transformedFriends = friendsList
          .slice(0, 6) // Chỉ hiển thị 6 bạn bè
          .map(friend => {
            // Tìm số bạn chung nếu có thể
            let mutualCount = 0;
            try {
              // Nếu người dùng đã đăng nhập, có thể tự động lấy số bạn chung
              mutualCount = friend.mutualFriendsCount || 0;
            } catch (error) {
              console.error("Lỗi khi xử lý số bạn chung:", error);
            }
            
            return {
              id: friend.id,
              name: `${friend.firstName} ${friend.lastName}`,
              username: friend.username || `user${friend.id}`,
              avatar: friend.image || "/placeholder-user.jpg",
              mutualFriends: mutualCount
            };
          })
        
        setFriends(transformedFriends)
      } catch (error) {
        console.error("Lỗi khi tải danh sách bạn bè:", error)
        toast.error("Không thể tải danh sách bạn bè")
        setFriends([])
      } finally {
        setLoading(false)
      }
    }

    fetchFriends()
  }, [userId])

  const handleUnfriend = async (friendId: number) => {
    try {
      if (confirm("Bạn có chắc chắn muốn xóa người bạn này?")) {
        // Cập nhật UI trước
        setFriends(friends.filter(f => f.id !== friendId))
        
        // Gọi API
        await FriendshipApi.unfriend(friendId)
        toast.success("Đã xóa khỏi danh sách bạn bè")
      }
    } catch (error) {
      console.error("Lỗi khi xóa bạn bè:", error)
      toast.error("Không thể xóa bạn bè")
      // Reload lại dữ liệu nếu có lỗi
      const friendsList = await FriendshipApi.getFriends()
      // Chuyển đổi dữ liệu giống như khi tải ban đầu
      const transformedFriends = friendsList
        .slice(0, 6)
        .map(friend => ({
          id: friend.id,
          name: `${friend.firstName} ${friend.lastName}`,
          username: friend.username || `user${friend.id}`,
          avatar: friend.image || "/placeholder-user.jpg",
          mutualFriends: Math.floor(Math.random() * 20) // Giả lập số bạn chung
        }))
      setFriends(transformedFriends)
    }
    
    // Đóng dropdown dù thành công hay thất bại
    setShowDropdown(null)
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Friends</h2>
          <p className="text-sm text-gray-400">{friends.length} friends</p>
        </div>
        <Link
          href={`/profile/${userId}/friends`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          See all friends
        </Link>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-400">
          <p>Đang tải danh sách bạn bè...</p>
        </div>
      ) : friends.length === 0 ? (
        <div className="p-4 text-center text-gray-400">
          <p>Không có bạn bè để hiển thị</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
          {friends.map((friend) => (
            <div key={friend.id} className="relative">
              <div className="group rounded-lg border border-gray-800 p-3 hover:bg-gray-800">
                <div className="relative mb-2 aspect-square overflow-hidden rounded-lg">
                  <Avatar 
                    src={friend.avatar}
                    alt={friend.name}
                    className="h-full w-full"
                  />
                </div>
                <div>
                  <Link
                    href={`/profile/id/${friend.id}`}
                    className="block font-medium text-white hover:underline"
                  >
                    {friend.name}
                  </Link>
                  <div className="mt-1 flex items-center text-xs text-gray-400">
                    <Users className="mr-1 h-3 w-3" />
                    <span>{friend.mutualFriends} mutual friends</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDropdown(showDropdown === friend.id ? null : friend.id)}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900/50 opacity-0 hover:bg-gray-800 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showDropdown === friend.id && (
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                    <Link
                      href={`/profile/id/${friend.id}`}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                      onClick={() => setShowDropdown(null)}
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/messages/${friend.username}`}
                      className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                      onClick={() => setShowDropdown(null)}
                    >
                      <div className="flex items-center">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </div>
                    </Link>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
                      onClick={() => handleUnfriend(friend.id)}
                    >
                      <div className="flex items-center">
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfriend
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

