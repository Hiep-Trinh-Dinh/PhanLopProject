"use client"

import Link from "next/link"
import { Camera, MessageCircle, MoreHorizontal, UserPlus, Users } from "lucide-react"
import { Avatar } from "../../components/ui/avatar"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  friendsCount?: number;
  mutualFriends?: number;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

export default function ProfileHeader() {

    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`http://localhost:8080/api/auth/me`, {
            credentials: "include", // Gửi cookie jwt
          });
  
          if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu người dùng");
          }
  
          const data = await response.json();
          setUser(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
          router.push("/"); // Chuyển về login nếu không có quyền truy cập
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchUserData();
    }, [router]);
  
    if (isLoading) {
      return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }
  
    if (error) {
      return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
    }

    // Kiểm tra nếu user có giá trị hợp lệ (không phải null) trước khi truy cập các thuộc tính
    if (!user) {
      return <div className="flex min-h-screen items-center justify-center text-red-500">Người dùng không tồn tại</div>;
    }

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative h-32 w-full overflow-hidden sm:h-48 md:h-64">
        {user.coverImage ? (
          <Avatar 
            src={user.coverImage} 
            alt="Cover image"
            className="h-full w-full rounded-none object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-200"></div> // Nếu không có ảnh, hiển thị nền xám
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6">
        <div className="relative -mt-16 flex items-end space-x-4">
          <Avatar 
            src={user.avatar}
            alt={user.firstName}
            className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32"
          />
          <div className="pb-4">
            <h1 className="text-xl font-bold sm:text-2xl">{user.firstName} {user.lastName} </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {user.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

