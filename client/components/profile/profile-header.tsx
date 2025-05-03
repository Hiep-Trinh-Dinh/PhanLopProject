"use client";

import { Camera, Pencil, UserPlus, UserMinus, Clock, Check, X } from "lucide-react";
import { AvatarComponent as Avatar } from "../../components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { useUserData } from "../../app/api/auth/me/useUserData"; // Import hook useUserData
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FriendshipApi } from "../../app/lib/api";
import { toast } from "react-hot-toast";

interface ProfileHeaderProps {
  user: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    cover: string;
    bio: string;
  };
  isOwnProfile: boolean;
  friendStatus?: {
    isFriend: boolean;
    isPending: boolean;
    isReceived: boolean;
  };
}

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

// Hàm chuyển đổi từ prop user sang dạng User
const convertToUserType = (propUser: ProfileHeaderProps['user']): User => {
  const nameParts = propUser.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  return {
    id: propUser.id,
    firstName,
    lastName,
    username: propUser.username,
    image: propUser.avatar,
    backgroundImage: propUser.cover,
    bio: propUser.bio
  };
};

// Hàm cập nhật dữ liệu người dùng
const updateUserData = async (data: User): Promise<User> => {
  const response = await fetch(`http://localhost:8080/api/users/update-auth`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Không thể cập nhật thông tin người dùng");
  return response.json();
};

export default function ProfileHeader({ user, isOwnProfile, friendStatus }: ProfileHeaderProps) {
  const [editUser, setEditUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const profileImageInput = useRef<HTMLInputElement>(null);
  const backgroundImageInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Chỉ lấy dữ liệu user hiện tại từ API nếu đây là profile của chính mình
  const { userData: currentUser, isLoading, error: fetchError } = useUserData();

  // Khởi tạo dữ liệu ban đầu cho editUser
  useEffect(() => {
    if (isOwnProfile && currentUser && !isEditing) {
      // Nếu là profile của mình, dùng dữ liệu từ API
      setEditUser(currentUser);
    } else if (!isOwnProfile && !isEditing) {
      // Nếu là profile của người khác, chuyển đổi từ dữ liệu được truyền vào
      setEditUser(convertToUserType(user));
    }
  }, [user, currentUser, isEditing, isOwnProfile]);

  const CLOUDINARY_CLOUD_NAME = "dv30m7ogs";
  const CLOUDINARY_UPLOAD_PRESET = "Thời trang";

  // Mutation để cập nhật dữ liệu
  const updateMutation = useMutation({
    mutationFn: updateUserData,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["userData", user?.id], updatedUser);
      setEditUser(updatedUser);
      setIsEditing(false);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["userData", user?.id] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu");
    },
  });

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

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "backgroundImage"
  ) => {
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

  const handleSave = () => {
    if (!editUser) return;
    updateMutation.mutate(editUser);
  };

  const handleCancel = () => {
    setEditUser(convertToUserType(user) ?? null);
    setIsEditing(false);
    setError("");
  };

  // Xử lý các tương tác bạn bè
  const handleAddFriend = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await FriendshipApi.sendRequest(user.id);
      toast.success("Đã gửi lời mời kết bạn");
      // Force refresh component
      queryClient.invalidateQueries({ queryKey: ["userData", user.id] });
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      toast.error("Không thể gửi lời mời kết bạn");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await FriendshipApi.cancelRequest(user.id);
      toast.success("Đã hủy lời mời kết bạn");
      // Force refresh component
      queryClient.invalidateQueries({ queryKey: ["userData", user.id] });
    } catch (error) {
      console.error("Lỗi khi hủy lời mời kết bạn:", error);
      toast.error("Không thể hủy lời mời kết bạn");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      // Lấy request ID từ API
      const pendingRequests = await FriendshipApi.getPendingRequests();
      const request = pendingRequests.content.find(req => req.user.id === user.id);
      
      if (request) {
        await FriendshipApi.acceptRequest(request.id);
        toast.success("Đã chấp nhận lời mời kết bạn");
        // Force refresh component
        queryClient.invalidateQueries({ queryKey: ["userData", user.id] });
      } else {
        toast.error("Không tìm thấy lời mời kết bạn");
      }
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
      toast.error("Không thể chấp nhận lời mời kết bạn");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnfriend = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await FriendshipApi.unfriend(user.id);
      toast.success("Đã hủy kết bạn");
      // Force refresh component
      queryClient.invalidateQueries({ queryKey: ["userData", user.id] });
    } catch (error) {
      console.error("Lỗi khi hủy kết bạn:", error);
      toast.error("Không thể hủy kết bạn");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (fetchError || error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        {fetchError?.toString() || error}
      </div>
    );
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Người dùng không tồn tại</div>;
  }

  return (
    <div className="space-y-4">
      {/* Cover Image */}
      <div className="relative h-32 w-full overflow-hidden sm:h-48 md:h-64">
        <div className="relative h-full w-full">
          <img
            src={isEditing && editUser?.backgroundImage ? editUser.backgroundImage : user.cover}
            alt="Cover image"
            className="h-full w-full object-cover"
          />
          {isOwnProfile && isEditing && (
            <button
              onClick={() => backgroundImageInput.current?.click()}
              className="absolute top-2 right-2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
            >
              <Camera size={20} />
            </button>
          )}
        </div>

        {/* Nút Edit Profile (biểu tượng bút chì) ở góc trên bên phải */}
        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700"
            title="Edit Profile"
          >
            <Pencil size={20} />
          </button>
        )}
        
        {/* Input file ẩn để upload ảnh nền */}
        <input
          type="file"
          ref={backgroundImageInput}
          onChange={(e) => handleImageChange(e, "backgroundImage")}
          className="hidden"
          accept="image/*"
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center relative px-4 sm:flex-row sm:items-end sm:px-6">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 sm:static sm:left-0 sm:translate-x-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gray-900 sm:h-36 sm:w-36">
            <img
              src={isEditing && editUser?.image ? editUser.image : user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
            {isOwnProfile && isEditing && (
              <button
                onClick={() => profileImageInput.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white"
              >
                <Camera size={24} />
              </button>
            )}
            
            {/* Input file ẩn để upload avatar */}
            <input
              type="file"
              ref={profileImageInput}
              onChange={(e) => handleImageChange(e, "image")}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>
        <div className="mt-20 flex flex-1 flex-col items-center space-y-4 text-center sm:mt-0 sm:items-start sm:pl-4 sm:text-left">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{user.bio}</p>
          
          {/* Friend Request Actions */}
          {!isOwnProfile && !isEditing && friendStatus && (
            <div className="flex space-x-2">
              {friendStatus.isFriend && (
                <button 
                  onClick={handleUnfriend}
                  disabled={isProcessing}
                  className="flex items-center space-x-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm font-medium hover:bg-gray-700"
                >
                  <UserMinus size={16} />
                  <span>{isProcessing ? 'Đang xử lý...' : 'Bạn bè'}</span>
                </button>
              )}
              
              {!friendStatus.isFriend && !friendStatus.isPending && !friendStatus.isReceived && (
                <button 
                  onClick={handleAddFriend}
                  disabled={isProcessing}
                  className="flex items-center space-x-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm font-medium hover:bg-gray-700"
                >
                  <UserPlus size={16} />
                  <span>{isProcessing ? 'Đang xử lý...' : 'Kết bạn'}</span>
                </button>
              )}
              
              {friendStatus.isPending && (
                <button 
                  onClick={handleCancelRequest}
                  disabled={isProcessing}
                  className="flex items-center space-x-1 rounded-md border border-yellow-600 bg-gray-800 px-3 py-1.5 text-sm font-medium text-yellow-500 hover:bg-gray-700"
                >
                  <Clock size={16} />
                  <span>{isProcessing ? 'Đang xử lý...' : 'Đã gửi lời mời'}</span>
                </button>
              )}
              
              {friendStatus.isReceived && (
                <div className="flex space-x-2">
                  <button 
                    onClick={handleAcceptRequest}
                    disabled={isProcessing}
                    className="flex items-center space-x-1 rounded-md border border-green-600 bg-gray-800 px-3 py-1.5 text-sm font-medium text-green-500 hover:bg-gray-700"
                  >
                    <Check size={16} />
                    <span>{isProcessing ? 'Đang xử lý...' : 'Chấp nhận'}</span>
                  </button>
                  <button 
                    onClick={handleCancelRequest}
                    disabled={isProcessing}
                    className="flex items-center space-x-1 rounded-md border border-red-600 bg-gray-800 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-gray-700"
                  >
                    <X size={16} />
                    <span>Từ chối</span>
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Edit Form Buttons */}
          {isOwnProfile && isEditing && (
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleSave}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={handleCancel}
                className="rounded-md border border-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-700"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="px-4 sm:px-6 mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-400">Tên</label>
                <input
                  type="text"
                  value={editUser?.firstName || ""}
                  onChange={(e) =>
                    setEditUser((prev) =>
                      prev ? { ...prev, firstName: e.target.value } : null
                    )
                  }
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Họ</label>
                <input
                  type="text"
                  value={editUser?.lastName || ""}
                  onChange={(e) =>
                    setEditUser((prev) =>
                      prev ? { ...prev, lastName: e.target.value } : null
                    )
                  }
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Tiểu sử</label>
              <textarea
                value={editUser?.bio || ""}
                onChange={(e) =>
                  setEditUser((prev) =>
                    prev ? { ...prev, bio: e.target.value } : null
                  )
                }
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              />
            </div>

            {error && <div className="text-red-500">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}