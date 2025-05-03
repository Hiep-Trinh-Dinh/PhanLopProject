"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, BellOff, MoreHorizontal, Share, UserPlus, Edit, Loader2, Camera } from "lucide-react";
import { groupApi, GroupDto } from "@/app/lib/groupApi";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserData } from "@/app/api/auth/me/useUserData";

interface GroupHeaderProps {
  groupId: number; 
}

export default function GroupHeader({ groupId }: GroupHeaderProps) {
  const { userData: user, isLoading: userLoading, error: userError } = useUserData();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isNotified, setIsNotified] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  // Fetch group data
  const { data: group, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupApi.getGroupById(groupId),
    enabled: !!groupId,
  });

  // Initialize edit form when group data is available
  const [editForm, setEditForm] = useState({
    name: group?.name || "",
    privacy: group?.privacy || "PUBLIC",
    avatar: group?.avatar || "/placeholder.svg",
    cover: group?.cover || "/placeholder.svg",
  });

  // Update editForm when group changes
  useEffect(() => {
    if (group) {
      setEditForm({
        name: group.name,
        privacy: group.privacy,
        avatar: group.avatar || "/placeholder.svg",
        cover: group.cover || "/placeholder.svg",
      });
    }
  }, [group]);

  const CLOUDINARY_CLOUD_NAME = "dv30m7ogs";
  const CLOUDINARY_UPLOAD_PRESET = "Thời trang";

  const joinMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("Vui lòng đăng nhập để tham gia nhóm");
      if (!group?.id) throw new Error("Không tìm thấy nhóm");
      return groupApi.addMember(group.id, user.id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["group", groupId], (old: GroupDto | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isMember: true,
          memberCount: old.memberCount + 1,
        };
      });
      queryClient.setQueryData(["groups"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((g: GroupDto) =>
            g.id === groupId ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast({ title: "Thành công", description: typeof data === "string" ? data : "Đã tham gia nhóm!" });
    },
    onError: (err: any) => {
      setError(err.message || "Không thể tham gia nhóm");
      toast({ title: "Lỗi", description: err.message || "Không thể tham gia nhóm", variant: "error" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("Vui lòng đăng nhập để rời nhóm");
      if (!group?.id) throw new Error("Không tìm thấy nhóm");
      return groupApi.removeMember(group.id, user.id);
    },
    onSuccess: () => {
      queryClient.setQueryData(["group", groupId], (old: GroupDto | undefined) => {
        if (!old) return old;
        return {
          ...old,
          isMember: false,
          memberCount: old.memberCount - 1,
        };
      });
      queryClient.setQueryData(["groups"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((g: GroupDto) =>
            g.id === groupId ? { ...g, isMember: false, memberCount: g.memberCount - 1 } : g
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast({ title: "Thành công", description: "Đã rời nhóm!" });
    },
    onError: (err: any) => {
      setError(err.message || "Không thể rời nhóm");
      toast({ title: "Lỗi", description: err.message || "Không thể rời nhóm", variant: "error" });
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
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImage(file);
        setEditForm((prev) => ({ ...prev, [type]: imageUrl }));
      } catch (err) {
        setError("Lỗi khi upload ảnh");
        toast({ title: "Lỗi", description: "Không thể upload ảnh", variant: "error" });
      }
    }
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!group?.isAdmin) throw new Error("Chỉ quản trị viên mới có quyền cập nhật nhóm");
      if (!group?.id) throw new Error("Không tìm thấy nhóm");
      return groupApi.updateGroup(group.id, {
        name: editForm.name,
        privacy: editForm.privacy,
        avatar: editForm.avatar === "/placeholder.svg" ? undefined : editForm.avatar,
        cover: editForm.cover === "/placeholder.svg" ? undefined : editForm.cover,
      });
    },
    onSuccess: (updatedGroup) => {
      setShowEditModal(false);
      queryClient.setQueryData(["group", groupId], updatedGroup);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast({ title: "Thành công", description: "Đã cập nhật nhóm!" });
    },
    onError: (err: any) => {
      const errorMessage = err.message || "Không thể cập nhật nhóm";
      setError(errorMessage);
      toast({ title: "Lỗi", description: errorMessage, variant: "error" });
    },
  });

  const toggleNotification = () => setIsNotified(!isNotified);

  if (userLoading || groupLoading) {
    return <div className="text-center">Đang tải thông tin...</div>;
  }

  if (userError || groupError) {
    return <div className="text-center text-red-400">Lỗi: {(userError || groupError)?.message}</div>;
  }

  if (!group) {
    return <div className="text-center text-red-400">Không tìm thấy nhóm</div>;
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="relative h-48 w-full sm:h-64">
        <img
          src={editForm.cover}
          alt={group.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative -mt-16 px-4 pb-4">
        <div className="flex flex-col items-start justify-between space-y-3 sm:flex-row sm:items-end sm:space-y-0">
          <div className="flex items-end space-x-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-gray-900">
              <img
                src={editForm.avatar}
                alt={group.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mb-1">
              <h1 className="text-2xl font-bold text-white">{editForm.name}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{editForm.privacy === "PUBLIC" ? "Nhóm công khai" : "Nhóm riêng tư"}</span>
                <span>•</span>
                <span>{group.memberCount.toLocaleString()} thành viên</span>
              </div>
            </div>
          </div>

          <div className="flex w-full space-x-2 sm:w-auto">
            {group.isAdmin && !showEditModal && (
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            )}
            <button
              onClick={() => (group.isMember ? leaveMutation.mutate() : joinMutation.mutate())}
              disabled={joinMutation.isPending || leaveMutation.isPending || !user}
              className={`inline-flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium sm:flex-none ${
                group.isMember
                  ? "border border-gray-700 hover:bg-gray-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } ${joinMutation.isPending || leaveMutation.isPending || !user ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {(joinMutation.isPending || leaveMutation.isPending) ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {group.isMember ? "Rời nhóm" : "Tham gia nhóm"}
            </button>

            <button
              onClick={toggleNotification}
              disabled={!user}
              className={`inline-flex items-center justify-center rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800 ${
                !user ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isNotified ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={!user}
                className={`inline-flex items-center justify-center rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800 ${
                  !user ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-800 bg-gray-900 py-1 shadow-lg">
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    onClick={() => {
                      console.log("Share group");
                      setShowMenu(false);
                    }}
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Chia sẻ nhóm
                  </button>
                  {group.isAdmin && (
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa nhóm
                    </button>
                  )}
                  {group.isMember && (
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                      onClick={() => leaveMutation.mutate()}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Rời nhóm
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && group.isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Chỉnh sửa nhóm</h2>
            {error && (
              <div className="mb-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300">Tên nhóm</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Quyền riêng tư</label>
                <select
                  value={editForm.privacy}
                  onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value })}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="PRIVATE">Riêng tư</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300">Ảnh đại diện</label>
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border-4 border-gray-900">
                  <img
                    src={editForm.avatar}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => avatarInput.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white"
                  >
                    <Camera size={24} />
                  </button>
                </div>
                <input
                  type="file"
                  ref={avatarInput}
                  onChange={(e) => handleImageChange(e, "avatar")}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300">Ảnh bìa</label>
                <div className="relative h-24 w-full overflow-hidden rounded-lg border-4 border-gray-900">
                  <img
                    src={editForm.cover}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => coverInput.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white"
                  >
                    <Camera size={24} />
                  </button>
                </div>
                <input
                  type="file"
                  ref={coverInput}
                  onChange={(e) => handleImageChange(e, "cover")}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditForm({
                    name: group.name,
                    privacy: group.privacy,
                    avatar: group.avatar || "/placeholder.svg",
                    cover: group.cover || "/placeholder.svg",
                  });
                  setError(null);
                }}
                className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending || !user}
                className={`rounded-md px-4 py-2 text-sm text-white ${
                  updateMutation.isPending || !user
                    ? "bg-blue-500 opacity-50 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}