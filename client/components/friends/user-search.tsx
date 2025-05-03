"use client"

import { useState } from "react"
import { Search, UserPlus, UserCheck, Info } from "lucide-react"
import { toast } from "react-hot-toast"
import { FriendshipApi, UserDto } from "@/app/lib/api"
import Image from "next/image"

interface UserSearchProps {
  onAddFriend?: () => void;
}

export default function UserSearch({ onAddFriend }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<number[]>([])
  const [sendingRequests, setSendingRequests] = useState<number[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setLoading(true)
      console.log("Đang tìm kiếm:", searchQuery)
      
      // Chuẩn hóa từ khóa tìm kiếm - loại bỏ khoảng trắng thừa
      const normalizedQuery = searchQuery.trim();
      
      // Gọi API tìm kiếm người dùng qua route API của Next.js
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(normalizedQuery)}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Lỗi tìm kiếm (${response.status}):`, errorText)
        throw new Error(`Không thể tìm kiếm người dùng: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      console.log("Kết quả tìm kiếm:", data)
      
      // Kiểm tra cấu trúc dữ liệu trả về từ Spring Page
      if (data && data.content) {
        // Dữ liệu dạng Page từ Spring
        setSearchResults(data.content || [])
        
        // Cập nhật trạng thái yêu cầu kết bạn đang chờ xử lý
        const pendingRequestIds = data.content
          .filter((user: UserDto) => user.pendingFriendRequest || user.receivedFriendRequest)
          .map((user: UserDto) => user.id);
        setPendingRequests(pendingRequestIds);
      } else if (Array.isArray(data)) {
        // Dữ liệu dạng mảng
        setSearchResults(data || [])
        
        // Cập nhật trạng thái yêu cầu kết bạn đang chờ xử lý
        const pendingRequestIds = data
          .filter((user: UserDto) => user.pendingFriendRequest || user.receivedFriendRequest)
          .map((user: UserDto) => user.id);
        setPendingRequests(pendingRequestIds);
      } else {
        // Cấu trúc dữ liệu khác hoặc rỗng
        console.warn("Dữ liệu trả về không đúng định dạng:", data)
        setSearchResults([])
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error)
      toast.error(error instanceof Error ? error.message : "Không thể tìm kiếm người dùng")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (userId: number) => {
    try {
      if (sendingRequests.includes(userId)) {
        return;
      }
      
      setSendingRequests(prev => [...prev, userId]);
      
      const userResult = searchResults.find(user => user.id === userId);
      if (userResult && (userResult.friend || userResult.isFriend)) {
        toast.success("Người dùng này đã là bạn bè của bạn");
        return;
      }
      
      await FriendshipApi.sendRequest(userId);
      
      toast.success("Đã gửi lời mời kết bạn");
      setPendingRequests(prev => [...prev, userId]);
      if (onAddFriend) onAddFriend();
      
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, pendingFriendRequest: true } 
            : user
        )
      );
    } catch (error) {
      console.error("Lỗi gửi lời mời kết bạn:", error);
      
      let errorMessage = "Không thể gửi lời mời kết bạn";
      
      if (error instanceof Error) {
        const errorText = error.message;
        
        if (errorText.includes("đã là bạn bè")) {
          errorMessage = "Người dùng này đã là bạn bè của bạn";
          setPendingRequests(prev => [...prev, userId]);
          
          setSearchResults(prev => 
            prev.map(user => 
              user.id === userId 
                ? { ...user, friend: true } 
                : user
            )
          );
        } else if (errorText.includes("Đã gửi lời mời")) {
          errorMessage = "Đã gửi lời mời kết bạn cho người này rồi";
          setPendingRequests(prev => [...prev, userId]);
          
          setSearchResults(prev => 
            prev.map(user => 
              user.id === userId 
                ? { ...user, pendingFriendRequest: true } 
                : user
            )
          );
        }
      }
      
      toast.error(errorMessage);
      
      if (errorMessage === "Người dùng này đã là bạn bè của bạn") {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('friends_list_needs_refresh', 'true');
          } catch (error) {
            console.error("Lỗi khi lưu trạng thái:", error);
          }
        }
        
        if (onAddFriend) onAddFriend();
      }
    } finally {
      setSendingRequests(prev => prev.filter(id => id !== userId));
    }
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold mb-2 select-none pointer-events-none">
        Tìm kiếm người dùng
      </h2>
      
      <div className="text-xs text-gray-400 mb-4 flex items-center">
        <Info className="h-3 w-3 mr-1" />
        <span>Bạn có thể tìm theo email, tên</span>
      </div>
      
      <div className="flex mb-4">
        <div className="flex-1 flex items-center rounded-l-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email"
            className="w-full border-0 bg-transparent p-0 text-white placeholder-gray-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </div>

      {searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3">
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={user.image || "/placeholder-user.jpg"}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.username}
                  </p>
                </div>
              </div>
              
              {user.friend || user.isFriend ? (
                <button
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-green-600 text-white"
                  disabled={true}
                >
                  <UserCheck className="mr-1 h-4 w-4" />
                  <span>Đã kết bạn</span>
                </button>
              ) : pendingRequests.includes(user.id) || user.pendingFriendRequest ? (
                <button
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-gray-700 text-white"
                  disabled={true}
                >
                  <UserCheck className="mr-1 h-4 w-4" />
                  <span>Đã gửi lời mời</span>
                </button>
              ) : (
                <button
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => sendFriendRequest(user.id)}
                  disabled={sendingRequests.includes(user.id)}
                >
                  {sendingRequests.includes(user.id) ? (
                    <>
                      <span className="mr-1 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1 h-4 w-4" />
                      <span>Kết bạn</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : searchQuery && !loading ? (
        <p className="text-center text-gray-400 py-4">
          Không tìm thấy người dùng nào
        </p>
      ) : null}
    </div>
  )
} 