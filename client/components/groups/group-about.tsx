"use client";

import { GroupDto, GroupMemberDto, PagedResponse } from "@/app/lib/groupApi";
import { groupApi } from "@/app/lib/groupApi";
import { Calendar, Globe, Info, Shield, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface GroupAboutProps {
  groupId: number;
}

export default function GroupAbout({ groupId }: GroupAboutProps) {
  const router = useRouter();
  const [group, setGroup] = useState<GroupDto | null>(null);
  const [admins, setAdmins] = useState<GroupMemberDto[]>([]);
  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingModerator, setIsAddingModerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<Partial<GroupDto>>({
    description: "",
    rules: "",
    privacy: "PUBLIC",
  });

  useEffect(() => {
    async function fetchGroupData() {
      try {
        const groupData = await groupApi.getGroupById(groupId);
        setGroup(groupData);
        setFormData({
          description: groupData.description || "",
          rules: groupData.rules || "",
          privacy: groupData.privacy || "PUBLIC",
        });

        const membersResponse: PagedResponse<GroupMemberDto> = await groupApi.getGroupMembers(
          groupId,
          0,
          100
        );
        const adminMembers = membersResponse.content.filter(
          (member) => member.role === "ADMIN" || member.role === "MODERATOR"
        );
        const regularMembers = membersResponse.content.filter(
          (member) => member.role === "MEMBER"
        );
        setAdmins(adminMembers);
        setMembers(regularMembers);

        setLoading(false);
      } catch (err: any) {
        if (err.message.includes("403")) {
          setError("Bạn không có quyền xem nhóm này vì đây là nhóm riêng tư");
        } else if (err.message.includes("404")) {
          setError("Không tìm thấy nhóm");
        } else {
          setError(err.message || "Không thể tải thông tin nhóm");
        }
        setLoading(false);
      }
    }
    fetchGroupData();
  }, [groupId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group?.id) {
      toast.error("Không có dữ liệu nhóm để cập nhật");
      return;
    }

    try {
      const updatedGroup = await groupApi.updateGroup(group.id, formData);
      setGroup(updatedGroup);
      setFormData({
        description: updatedGroup.description || "",
        rules: updatedGroup.rules || "",
        privacy: updatedGroup.privacy || "PUBLIC",
      });
      setIsEditing(false);
      toast.success("Cập nhật nhóm thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật nhóm");
      setError(err.message || "Không thể cập nhật nhóm");
    }
  };

  const handleDelete = async () => {
    if (!group?.id) {
      toast.error("Không có dữ liệu nhóm để xóa");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa nhóm này?")) return;

    try {
      await groupApi.deleteGroup(group.id);
      toast.success("Xóa nhóm thành công!");
      router.push("/groups");
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa nhóm");
      setError(err.message || "Không thể xóa nhóm");
    }
  };

  const handleAddModerator = async (userId: number) => {
    if (!group?.id) {
      toast.error("Không có dữ liệu nhóm");
      return;
    }

    try {
      await groupApi.updateMemberRole(group.id, userId, "MODERATOR");
      const membersResponse = await groupApi.getGroupMembers(group.id, 0, 100);
      const adminMembers = membersResponse.content.filter(
        (member) => member.role === "ADMIN" || member.role === "MODERATOR"
      );
      const regularMembers = membersResponse.content.filter(
        (member) => member.role === "MEMBER"
      );
      setAdmins(adminMembers);
      setMembers(regularMembers);
      setIsAddingModerator(false);
      toast.success("Thêm người kiểm duyệt thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể thêm người kiểm duyệt");
    }
  };

  const handleRemoveModerator = async (userId: number) => {
    if (!group?.id) {
      toast.error("Không có dữ liệu nhóm");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa người kiểm duyệt này?")) return;

    try {
      await groupApi.updateMemberRole(group.id, userId, "MEMBER");
      const membersResponse = await groupApi.getGroupMembers(group.id, 0, 100);
      const adminMembers = membersResponse.content.filter(
        (member) => member.role === "ADMIN" || member.role === "MODERATOR"
      );
      const regularMembers = membersResponse.content.filter(
        (member) => member.role === "MEMBER"
      );
      setAdmins(adminMembers);
      setMembers(regularMembers);
      toast.success("Xóa người kiểm duyệt thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa người kiểm duyệt");
    }
  };

  const filteredMembers = members.filter((member) =>
    member.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error || !group) {
    return <div className="text-red-500">{error || "Không tìm thấy nhóm"}</div>;
  }

  return (
    <div className="space-y-6">
      {group.isAdmin && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Xóa nhóm
          </button>
        </div>
      )}

      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="flex items-center text-lg font-semibold">
            <Info className="mr-2 h-5 w-5" />
            Về nhóm này
          </h2>
        </div>
        <div className="p-4">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Quyền riêng tư</label>
                <select
                  name="privacy"
                  value={formData.privacy || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="PRIVATE">Riêng tư</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Lưu
              </button>
            </form>
          ) : (
            <>
              <p className="text-gray-300">{group.description || "Không có mô tả."}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Quyền riêng tư:</span>
                  <span className="font-medium text-white">
                    {group.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Thành viên:</span>
                  <span className="font-medium text-white">{group.memberCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Info className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Bài viết:</span>
                  <span className="font-medium text-white">{group.postCount.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="flex items-center text-lg font-semibold">
            <Shield className="mr-2 h-5 w-5" />
            Quy tắc nhóm
          </h2>
        </div>
        <div className="p-4">
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-400">Quy tắc</label>
              <textarea
                name="rules"
                value={formData.rules || ""}
                onChange={handleInputChange}
                className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
              />
            </div>
          ) : (
            <ol className="list-inside list-decimal space-y-2 text-gray-300">
              {group.rules ? (
                group.rules.split("\n").map((rule, index) => <li key={index}>{rule.trim()}</li>)
              ) : (
                <li>Không có quy tắc được đặt.</li>
              )}
            </ol>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 p-4">
          <h2 className="flex items-center text-lg font-semibold">
            <Users className="mr-2 h-5 w-5" />
            Quản trị viên và Người kiểm duyệt
          </h2>
        </div>
        <div className="p-4">
          {group.isAdmin && (
            <div className="mb-4">
              <button
                onClick={() => setIsAddingModerator(!isAddingModerator)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isAddingModerator ? "Hủy" : "Thêm người kiểm duyệt"}
              </button>
            </div>
          )}

          {isAddingModerator && group.isAdmin && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm thành viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 mb-2 bg-gray-800 text-white rounded"
              />
              <div className="max-h-60 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-800"
                  >
                    <span>{member.user.username}</span>
                    <button
                      onClick={() => handleAddModerator(member.user.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Thêm
                    </button>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <p className="text-gray-300">Không tìm thấy thành viên</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {admins.length > 0 ? (
              admins.map((admin) => (
                <div key={admin.user.id} className="flex items-center justify-between">
                  <div className="font-medium text-white">{admin.user.username}</div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`text-sm ${
                        admin.role === "ADMIN" ? "text-blue-400" : "text-green-400"
                      }`}
                    >
                      {admin.role === "ADMIN" ? "Quản trị viên" : "Người kiểm duyệt"}
                    </div>
                    {group.isAdmin && admin.role === "MODERATOR" && (
                      <button
                        onClick={() => handleRemoveModerator(admin.user.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-300">Không có quản trị viên hoặc người kiểm duyệt.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}