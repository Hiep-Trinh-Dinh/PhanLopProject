"use client"

import { useState, useEffect, useId } from "react"
import Link from "next/link"
import Image from "next/image"
import { MessageCircle, UserMinus, Search } from "lucide-react"
import dynamic from 'next/dynamic'
import { FriendshipApi, UserDto } from "@/app/lib/api"
import { toast } from "react-hot-toast"

// Import hàm startConversation
import { startConversation } from "@/app/lib/api"

// Tải động biểu tượng Search để tránh lỗi hydration
const SearchIcon = dynamic(() => import('lucide-react').then(mod => mod.Search), {
  ssr: false,
  loading: () => <span className="w-4 h-4 block" />
})

interface FriendItem {
  id: number;
  name: string;
  avatar: string;
  username: string;
  mutualFriends: number;
}

// Thêm hàm formatUsername trước hàm component chính
function formatUsername(username: string): string {
  if (!username) return '';
  
  // Đơn giản hóa việc xử lý username cho phù hợp với API backend
  // Loại bỏ khoảng trắng ở đầu và cuối
  return encodeURIComponent(username.trim());
}

function FriendsListComponent() {
  const [friends, setFriends] = useState<FriendItem[]>([])
  const [filteredFriends, setFilteredFriends] = useState<FriendItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [removedIds, setRemovedIds] = useState<number[]>([])
  const searchInputId = useId(); // Tạo ID ổn định cho input

  useEffect(() => {
    setMounted(true)
    // Đọc danh sách ID đã xóa từ localStorage khi component được mount
    try {
      const savedRemovedIds = window.localStorage.getItem('removedFriends') || '[]';
      setRemovedIds(JSON.parse(savedRemovedIds));
      
      // Kiểm tra xem có cần refresh lại danh sách bạn bè không
      const needsRefresh = window.localStorage.getItem('friends_list_needs_refresh');
      if (needsRefresh === 'true') {
        console.log("Danh sách bạn bè cần được cập nhật lại...");
        // Xóa danh sách removedIds khi refresh để đảm bảo hiện đầy đủ bạn bè
        setRemovedIds([]);
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('removedFriends');
        }
        fetchFriends(true);
        // Xóa đánh dấu sau khi refresh
        window.localStorage.removeItem('friends_list_needs_refresh');
      } else {
        fetchFriends();
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
      setRemovedIds([]);
      fetchFriends();
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFriends(friends)
    } else {
      const filtered = friends.filter((friend) => 
        friend.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredFriends(filtered)
    }
  }, [searchQuery, friends])

  const fetchFriends = async (forceRefresh = false) => {
    setLoading(true);
    
    try {
      // Nếu yêu cầu làm mới, xóa dấu hiệu cần làm mới từ localStorage
      if (forceRefresh && typeof window !== 'undefined') {
        window.localStorage.removeItem('friends_list_needs_refresh');
        // Đảm bảo danh sách removedIds cũng được xóa khi refresh
        setRemovedIds([]);
        window.localStorage.removeItem('removedFriends');
      }

      console.log("Fetching friends list, forceRefresh =", forceRefresh);
      
      // Kiểm tra kết nối mạng
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      let usingCache = false;
      
      // Nếu offline và có dữ liệu cache, dùng luôn không cần gọi API
      if (isOffline && typeof window !== 'undefined') {
        const cachedData = window.localStorage.getItem('cached_friends');
        if (cachedData) {
          console.log("Sử dụng dữ liệu bạn bè từ cache vì đang offline");
          try {
            const cachedUsers = JSON.parse(cachedData) as UserDto[];
            
            // Xử lý data cache
            const friendItems = cachedUsers.map((user: UserDto) => ({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              avatar: user.image || "/placeholder-user.jpg",
              username: user.username || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
              mutualFriends: 0 // Không có thông tin bạn chung khi offline
            }));
            
            setFriends(friendItems);
            setFilteredFriends(friendItems);
            toast("Hiển thị dữ liệu ngoại tuyến. Kết nối mạng để cập nhật.");
            setLoading(false);
            return;
          } catch (error) {
            console.error("Lỗi khi đọc dữ liệu cache:", error);
          }
        }
      }
      
      try {
        // Gọi API lấy danh sách bạn bè
        const response = await FriendshipApi.getFriends(0, 100, forceRefresh);
        console.log("Received response from API:", response);
        
        // Xử lý dữ liệu trả về - đảm bảo xử lý được cả mảng và object có thuộc tính content
        let users = [];
        
        if (Array.isArray(response)) {
          users = response;
        } else if (response && typeof response === 'object') {
          if (Array.isArray(response.content)) {
            users = response.content;
          }
        }
        
        console.log("Processed users data:", users);
        
        // Cache the data for future use
        if (typeof window !== 'undefined' && users && users.length > 0) {
          try {
            window.localStorage.setItem('cached_friends', JSON.stringify(users));
            console.log("Cached friends data to localStorage");
          } catch (cacheError) {
            console.error("Failed to cache friends data:", cacheError);
          }
        }
        
        if (!users || users.length === 0) {
          console.log("No friends returned from API");
          setFriends([]);
          setFilteredFriends([]);
          setLoading(false);
          return;
        }
        
        // Nếu force refresh thì không cần lọc theo removedIds
        let filteredUsers = users;
        if (!forceRefresh) {
          // Lấy danh sách ID bạn bè đã xóa từ localStorage
          let removedIds: number[] = [];
          if (typeof window !== 'undefined') {
            try {
              const storedIds = window.localStorage.getItem('removedFriends');
              if (storedIds) {
                removedIds = JSON.parse(storedIds);
                // Lọc ra những người bạn chưa bị xóa
                setRemovedIds(removedIds);
                filteredUsers = users.filter(user => !removedIds.includes(user.id));
              }
            } catch (error) {
              console.error("Lỗi khi đọc removedFriends từ localStorage:", error);
            }
          }
        }
        
        // Kiểm tra xem có cần lấy thông tin bạn chung không
        // Nếu offline, bỏ qua việc lấy bạn chung
        if (isOffline) {
          const friendItems = filteredUsers.map((user: UserDto) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.image || "/placeholder-user.jpg",
            username: user.username || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
            mutualFriends: 0 // Không có thông tin bạn chung khi offline
          }));
          
          setFriends(friendItems);
          setFilteredFriends(friendItems);
        } else {
          // Tạo danh sách bạn bè với số lượng bạn chung
          const friendsWithMutual = await Promise.all(
            filteredUsers.map(async (user: UserDto) => {
              let mutualCount = 0;
              try {
                mutualCount = await FriendshipApi.getMutualCount(user.id);
              } catch (error) {
                console.error(`Lỗi khi lấy số bạn chung với ${user.id}:`, error);
              }
              return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.image || "/placeholder-user.jpg",
                username: user.username || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
                mutualFriends: mutualCount
              } as FriendItem;
            })
          );

          setFriends(friendsWithMutual);
          setFilteredFriends(friendsWithMutual);
        }
        
        if (usingCache) {
          toast("Hiển thị dữ liệu từ bộ nhớ cache. Kết nối mạng để cập nhật.");
        }
      } catch (error) {
        console.error("Error fetching friends from API:", error);
        
        // Try to use cached data as fallback if API call fails
        if (typeof window !== 'undefined') {
          const cachedData = window.localStorage.getItem('cached_friends');
          if (cachedData) {
            console.log("Using cached friends data as fallback");
            try {
              const cachedUsers = JSON.parse(cachedData) as UserDto[];
              usingCache = true;
              
              // Process cached data similar to normal flow
              let filteredUsers = cachedUsers;
              if (!forceRefresh) {
                let removedIds: number[] = [];
                try {
                  const storedIds = window.localStorage.getItem('removedFriends');
                  if (storedIds) {
                    removedIds = JSON.parse(storedIds);
                    setRemovedIds(removedIds);
                    filteredUsers = cachedUsers.filter((user: UserDto) => !removedIds.includes(user.id));
                  }
                } catch (error) {
                  console.error("Lỗi khi đọc removedFriends từ localStorage:", error);
                }
              }
              
              // Create friend items (without mutual friends count since that requires API)
              const friendItems = filteredUsers.map((user: UserDto) => ({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.image || "/placeholder-user.jpg",
                username: user.username || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
                mutualFriends: 0
              }));
              
              setFriends(friendItems);
              setFilteredFriends(friendItems);
              toast("Hiển thị dữ liệu từ bộ nhớ cache. Một số thông tin có thể không được cập nhật.");
              return;
            } catch (parseError) {
              console.error("Failed to parse cached friends data:", parseError);
            }
          }
        }
        
        // Nếu không có cache, hiển thị danh sách rỗng
        setFriends([]);
        setFilteredFriends([]);
        toast.error("Không thể tải danh sách bạn bè. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    } catch (outerError) {
      console.error("Unexpected error:", outerError);
      setLoading(false);
      setFriends([]);
      setFilteredFriends([]);
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      if (confirm("Bạn có chắc chắn muốn xóa người bạn này?")) {
        // Lưu trạng thái hiện tại để khôi phục nếu có lỗi
        const currentFriends = [...friends];
        const currentFiltered = [...filteredFriends];
        
        // Cập nhật UI trước khi API hoàn tất để UX tốt hơn
        setFriends(friends.filter(f => f.id !== friendId));
        setFilteredFriends(filteredFriends.filter(f => f.id !== friendId));
        
        // Cập nhật danh sách IDs đã xóa trong localStorage
        const updatedRemovedIds = [...removedIds, friendId];
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem('removedFriends', JSON.stringify(updatedRemovedIds));
            setRemovedIds(updatedRemovedIds);
          } catch (storageError) {
            console.error("Lỗi khi lưu danh sách ID đã xóa:", storageError);
          }
        }
        
        try {
          // Gửi yêu cầu xóa bạn bè tới server
          await FriendshipApi.unfriend(friendId);
          toast.success("Đã xóa khỏi danh sách bạn bè");
          
          // Đánh dấu danh sách bạn bè đã thay đổi và cần cập nhật
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('friendship_updated_at', Date.now().toString());
            window.localStorage.setItem('friends_list_needs_refresh', 'true');
            
            // Cập nhật cache danh sách bạn bè
            try {
              const cachedData = window.localStorage.getItem('cached_friends');
              if (cachedData) {
                const cachedUsers = JSON.parse(cachedData) as UserDto[];
                const updatedCache = cachedUsers.filter(user => user.id !== friendId);
                window.localStorage.setItem('cached_friends', JSON.stringify(updatedCache));
              }
            } catch (cacheError) {
              console.error("Lỗi khi cập nhật cache bạn bè:", cacheError);
            }
          }
        } catch (error) {
          console.error("Lỗi khi xóa bạn bè:", error);
          
          // Hiển thị thông báo lỗi chi tiết hơn
          let errorMessage = "Lỗi khi xóa bạn bè";
          if (error instanceof Error) {
            errorMessage = error.message;
            // Kiểm tra thông báo cụ thể từ API
            if (error.message.includes("401")) {
              errorMessage = "Vui lòng đăng nhập lại để thực hiện thao tác này";
            } else if (error.message.includes("404")) {
              errorMessage = "Không tìm thấy mối quan hệ bạn bè này";
              // Trong trường hợp này, không cần khôi phục UI vì có thể người dùng đã bị xóa khỏi danh sách bạn bè từ thiết bị khác
              return;
            }
          }
          toast.error(errorMessage);
          
          // Khôi phục state UI và localStorage nếu có lỗi
          setFriends(currentFriends);
          setFilteredFriends(currentFiltered);
          setRemovedIds(removedIds.filter(id => id !== friendId));
          
          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('removedFriends', JSON.stringify(removedIds.filter(id => id !== friendId)));
            } catch (storageError) {
              console.error("Lỗi khi khôi phục danh sách ID đã xóa:", storageError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi thực hiện thao tác:", error);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
    }
  }

  // Nếu không ở phía client, chỉ hiển thị phần loading
  if (!mounted) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            All Friends
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

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            All Friends
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

  // Hiển thị nút thử lại khi thất bại
  if (friends.length === 0 && mounted) {
    // Kiểm tra kết nối mạng
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            All Friends
          </h2>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-400 select-none pointer-events-none mb-4">
            {isOffline 
              ? "Không có kết nối mạng. Vui lòng kiểm tra lại kết nối internet của bạn." 
              : "Không thể tải danh sách bạn bè hoặc bạn chưa có bạn bè nào."}
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={() => fetchFriends(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={isOffline}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900" suppressHydrationWarning>
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold select-none pointer-events-none">
          All Friends ({friends.length})
        </h2>
      </div>
      <div className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <SearchIcon className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full border-0 bg-transparent p-0 text-white placeholder-gray-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id={searchInputId}
            suppressHydrationWarning
          />
        </div>

        {filteredFriends.length === 0 && (
          <p className="text-center text-gray-400 mb-4">
            No friends match your search.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex flex-col rounded-lg border border-gray-800 bg-gray-800 p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={friend.avatar}
                    alt={friend.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    {friend.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/profile/id/${friend.id}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {friend.name}
                  </Link>
                  <p className="text-xs text-gray-400 select-none pointer-events-none">
                    {friend.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Link
                  href={`/messages`}
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      // Tạo cuộc trò chuyện với người bạn được chọn
                      const conversation = await startConversation(friend.id);
                      if (conversation?.id) {
                        window.location.href = `/messages/${conversation.id}`;
                      } else {
                        window.location.href = `/messages`;
                      }
                    } catch (error) {
                      console.error("Lỗi khi bắt đầu cuộc trò chuyện:", error);
                      // Nếu có lỗi vẫn chuyển hướng đến trang messages chung
                      window.location.href = `/messages`;
                    }
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <MessageCircle className="mr-1 h-4 w-4" />
                  <span>Message</span>
                </Link>
                <button
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                  onClick={() => removeFriend(friend.id)}
                >
                  <UserMinus className="mr-1 h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export component dưới dạng dynamic để tránh hydration trên server
export default dynamic(() => Promise.resolve(FriendsListComponent), {
  ssr: false
})

