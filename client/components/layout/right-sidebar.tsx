"use client";

import { usePathname } from "next/navigation"; // Import usePathname
import Link from "next/link";
import { Users } from "lucide-react";

const onlineFriends = [
  { id: 1, name: "Alex Johnson", avatar: "/placeholder-user.jpg" },
  { id: 2, name: "Sarah Wilson", avatar: "/placeholder-user.jpg" },
  { id: 3, name: "Michael Brown", avatar: "/placeholder-user.jpg" },
];

const suggestedFriends = [
  {
    id: 4,
    name: "Emily Davis",
    avatar: "/placeholder-user.jpg",
    mutualFriends: 5,
  },
  {
    id: 5,
    name: "David Miller",
    avatar: "/placeholder-user.jpg",
    mutualFriends: 3,
  },
];

export default function RightSidebar() {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại

  // Nếu không phải trang Home ("/") thì không render sidebar
  if (pathname !== "/home") return null;
  else   
    return (
    <aside className="hidden lg:block fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-60 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
      <div className="space-y-6">
        {/* Online Friends */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Online Friends
          </h2>
          <div className="space-y-3">
            {onlineFriends.map((friend) => (
              <Link
                key={friend.id}
                href={`/profile/${friend.id}`}
                className="flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-800"
              >
                <div className="relative h-10 w-10">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-gray-900 bg-green-500" />
                </div>
                <span className="font-medium text-white">{friend.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Suggested Friends */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Suggested Friends
          </h2>
          <div className="space-y-3">
            {suggestedFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex flex-col items-start space-y-2 rounded-lg p-2 hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative h-10 w-10">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/profile/${friend.id}`}
                      className="font-medium text-white hover:underline"
                    >
                      {friend.name}
                    </Link>
                    <div className="flex items-center text-xs text-gray-400">
                      <Users className="mr-1 h-3 w-3" />
                      <span>{friend.mutualFriends} mutual friends</span>
                    </div>
                  </div>
                </div>
                <button className="w-full rounded-md border border-gray-700 px-3 py-1 text-sm hover:bg-gray-800">
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
