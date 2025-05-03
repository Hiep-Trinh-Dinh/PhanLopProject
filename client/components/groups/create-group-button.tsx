"use client"

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserData } from "@/app/api/auth/me/useUserData";
import { groupApi, GroupDto } from "@/app/lib/groupApi";

const CreateGroupButton = () => {
  const { userData } = useUserData();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (groupData: Partial<GroupDto>) => groupApi.createGroup(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setOpen(false);
      resetForm();
      alert("Tạo nhóm thành công!");
    },
    onError: (err: any) => {
      const errorMessage = err.message || "Không thể tạo nhóm";
      setError(errorMessage);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      setError("Vui lòng đăng nhập để tạo nhóm");
      return;
    }

    setError(null);
    const groupData: Partial<GroupDto> = {
      name: groupName.trim(),
      description: groupDescription.trim() || undefined,
      privacy: privacy.toUpperCase(),
    };

    mutation.mutate(groupData);
  };

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setPrivacy("PUBLIC");
    setError(null);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={mutation.isPending}
      >
        <Plus className="mr-1 h-4 w-4" />
        Tạo nhóm
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[500px] rounded-lg border border-gray-800 bg-gray-900 p-6 text-white">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Tạo nhóm mới</h2>
              <p className="text-sm text-gray-400">
                Tạo một nhóm để kết nối với những người có cùng sở thích.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="group-name" className="text-sm font-medium">
                    Tên nhóm
                  </label>
                  <input
                    id="group-name"
                    placeholder="Nhập tên nhóm"
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="group-description" className="text-sm font-medium">
                    Mô tả
                  </label>
                  <textarea
                    id="group-description"
                    placeholder="Nhóm của bạn nói về điều gì?"
                    className="min-h-[100px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="privacy" className="text-sm font-medium">
                    Quyền riêng tư
                  </label>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={mutation.isPending}
                  >
                    <option value="PUBLIC">Công khai</option>
                    <option value="PRIVATE">Riêng tư</option>
                  </select>
                  <p className="text-xs text-gray-400">
                    {privacy === "PUBLIC"
                      ? "Mọi người có thể thấy thành viên và bài đăng trong nhóm."
                      : "Chỉ thành viên mới thấy thành viên và bài đăng trong nhóm."}
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-500">{error}</div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-700 px-4 py-2 hover:bg-gray-800 hover:text-white"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  disabled={mutation.isPending}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                  disabled={mutation.isPending || !groupName.trim()}
                >
                  {mutation.isPending ? "Đang tạo..." : "Tạo nhóm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroupButton;