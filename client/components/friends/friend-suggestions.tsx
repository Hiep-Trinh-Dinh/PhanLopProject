"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { UserPlus } from "lucide-react"
import { FriendshipApi, UserDto } from "@/app/lib/api"
import { toast } from "react-hot-toast"

interface FriendSuggestionItem {
  id: number;
  name: string;
  avatar: string;
  username: string;
  mutualFriends: number;
}

interface FriendSuggestionsProps {
  onAddFriend?: () => void;
}

export default function FriendSuggestions({ onAddFriend }: FriendSuggestionsProps) {
  const [friendSuggestions, setFriendSuggestions] = useState<FriendSuggestionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendingRequests, setSendingRequests] = useState<number[]>([])

  useEffect(() => {
    setMounted(true)
    fetchFriendSuggestions()
  }, [])

  const fetchFriendSuggestions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data nếu API không hoạt động
      const mockSuggestions = [
        {
          id: 1,
          name: "Jordan Lee",
          avatar: "/placeholder-user.jpg",
          username: "jordanlee",
          mutualFriends: 7,
        },
        {
          id: 2,
          name: "Casey Morgan",
          avatar: "/placeholder-user.jpg",
          username: "caseymorgan",
          mutualFriends: 4,
        },
        {
          id: 3,
          name: "Riley Parker",
          avatar: "/placeholder-user.jpg",
          username: "rileyparker",
          mutualFriends: 2,
        },
      ];
      
      try {
        const response = await FriendshipApi.getSuggestions(0, 5);
        
        if (response && response.content && Array.isArray(response.content)) {
          // Chuyển đổi từ UserDto sang FriendSuggestionItem để hiển thị
          const suggestionItems: FriendSuggestionItem[] = await Promise.all(
            response.content.map(async (user) => {
              let mutualCount = 0;
              try {
                mutualCount = await FriendshipApi.getMutualCount(user.id);
              } catch (error) {
                console.error("Error fetching mutual friends count:", error);
              }
              
              return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.image || "/placeholder-user.jpg",
                username: user.username || `${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
                mutualFriends: mutualCount
              }
            })
          );
          
          setFriendSuggestions(suggestionItems);
        } else {
          console.warn("API responded but without expected content format, using mock data instead");
          setFriendSuggestions(mockSuggestions);
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // Sử dụng mock data nếu API gặp lỗi
        setFriendSuggestions(mockSuggestions);
      }
    } catch (error) {
      console.error("Failed to fetch friend suggestions:", error)
      setError("Không thể tải gợi ý kết bạn")
      toast.error("Không thể tải gợi ý kết bạn")
    } finally {
      setLoading(false)
    }
  }

  const addFriend = async (userId: number) => {
    try {
      if (sendingRequests.includes(userId)) {
        return;
      }
      
      setSendingRequests(prev => [...prev, userId]);
      
      await FriendshipApi.sendRequest(userId)
      toast.success("Đã gửi lời mời kết bạn")
      
      setFriendSuggestions(friendSuggestions.filter((suggestion) => suggestion.id !== userId))
      
      if (onAddFriend) {
        onAddFriend()
      }
    } catch (error) {
      console.error("Failed to send friend request:", error)
      
      let errorMessage = "Không thể gửi lời mời kết bạn";
      
      if (error instanceof Error) {
        const errorText = error.message;
        
        if (errorText.includes("đã là bạn bè")) {
          errorMessage = "Người dùng này đã là bạn bè của bạn";
          setFriendSuggestions(friendSuggestions.filter((suggestion) => suggestion.id !== userId));
        } else if (errorText.includes("Đã gửi lời mời")) {
          errorMessage = "Đã gửi lời mời kết bạn cho người này rồi";
          setFriendSuggestions(friendSuggestions.filter((suggestion) => suggestion.id !== userId));
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setSendingRequests(prev => prev.filter(id => id !== userId));
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
            People You May Know
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
            People You May Know
          </h2>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-400 select-none pointer-events-none">
            {error}
          </p>
          <button 
            onClick={fetchFriendSuggestions}
            className="mt-2 mx-auto block rounded-md border border-gray-700 px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (friendSuggestions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold select-none pointer-events-none">
            People You May Know
          </h2>
        </div>
        <div className="p-4">
          <p className="text-center text-gray-400 select-none pointer-events-none">
            No suggestions at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold select-none pointer-events-none">
          People You May Know
        </h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {friendSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={suggestion.avatar}
                    alt={suggestion.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    {suggestion.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/profile/${suggestion.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {suggestion.name}
                  </Link>
                  <p className="text-xs text-gray-400 select-none pointer-events-none">
                    {suggestion.mutualFriends} mutual friends
                  </p>
                </div>
              </div>
              <button
                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-700 px-3 text-sm font-medium hover:bg-gray-700 hover:text-white"
                onClick={() => addFriend(suggestion.id)}
                disabled={sendingRequests.includes(suggestion.id)}
              >
                {sendingRequests.includes(suggestion.id) ? (
                  <>
                    <span className="mr-1 h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-1 h-4 w-4" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

