"use client";

import Link from "next/link";
import { Camera, MessageCircle, MoreHorizontal, UserPlus, Users, Pencil } from "lucide-react";
import { Avatar } from "../../components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  image: string;
  backgroundImage?: string;
  bio: string;
  friendsCount?: number;
  mutualFriends?: number;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

export default function ProfileHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const profileImageInput = useRef<HTMLInputElement>(null);
  const backgroundImageInput = useRef<HTMLInputElement>(null);

  const CLOUDINARY_CLOUD_NAME = "dv30m7ogs";
  const CLOUDINARY_UPLOAD_PRESET = "Thời trang";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8080/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Không thể lấy dữ liệu người dùng");
        }

        const data = await response.json();
        setUser(data);
        setEditUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("api_key", "453473243322931");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Không thể upload ảnh lên Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "backgroundImage") => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        setEditUser((prev) => (prev ? { ...prev, [type]: imageUrl } : null));
      } catch (err) {
        setError("Lỗi khi upload ảnh");
      }
    }
  };

  const handleSave = async () => {
    if (!editUser) return;

    try {
      const response = await fetch("http://localhost:8080/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUser),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin người dùng");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditUser(updatedUser);
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu");
    }
  };

  const handleCancel = () => {
    setEditUser(user);
    setIsEditing(false);
    setError("");
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Người dùng không tồn tại</div>;
  }

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative h-32 w-full overflow-hidden sm:h-48 md:h-64">
        {editUser?.backgroundImage ? (
          <div className="relative h-full w-full">
            <img
              src={editUser.backgroundImage}
              alt="Cover image"
              className="h-full w-full object-cover"
            />
            {isEditing && (
              <button
                onClick={() => backgroundImageInput.current?.click()}
                className="absolute top-2 right-2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
              >
                <Camera size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="h-full w-full bg-gray-200">
            {isEditing && (
              <button
                onClick={() => backgroundImageInput.current?.click()}
                className="absolute top-2 right-2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
              >
                <Camera size={20} />
              </button>
            )}
          </div>
        )}
        
        {/* Nút Edit Profile (biểu tượng bút chì) ở góc trên bên phải */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
            title="Edit Profile"
          >
            <Pencil size={20} />
          </button>
        )}
        
        <input
          type="file"
          ref={backgroundImageInput}
          onChange={(e) => handleImageChange(e, "backgroundImage")}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6">
        <div className="relative -mt-16 flex items-end space-x-4">
          <div className="relative">
            <Avatar
              src={editUser?.image || ""}
              alt={editUser?.firstName || "User"}
              className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32"
            />
            {isEditing && (
              <button
                onClick={() => profileImageInput.current?.click()}
                className="absolute bottom-0 right-0 bg-gray-800 p-1 rounded-full text-white hover:bg-gray-700"
              >
                <Camera size={16} />
              </button>
            )}
            <input
              type="file"
              ref={profileImageInput}
              onChange={(e) => handleImageChange(e, "image")}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="pb-4 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editUser?.firstName || ""}
                  onChange={(e) => setEditUser(editUser ? { ...editUser, firstName: e.target.value } : null)}
                  className="text-xl font-bold sm:text-2xl bg-gray-800 text-white p-1 rounded"
                />
                <input
                  type="text"
                  value={editUser?.lastName || ""}
                  onChange={(e) => setEditUser(editUser ? { ...editUser, lastName: e.target.value } : null)}
                  className="text-xl font-bold sm:text-2xl bg-gray-800 text-white p-1 rounded ml-2"
                />
                <textarea
                  value={editUser?.bio || ""}
                  onChange={(e) => setEditUser(editUser ? { ...editUser, bio: e.target.value } : null)}
                  className="w-full text-sm text-muted-foreground sm:text-base bg-gray-800 text-white p-1 rounded"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold sm:text-2xl">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">{user.bio}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}