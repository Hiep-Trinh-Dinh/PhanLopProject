"use client";

// src/components/GroupsList.tsx
import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserData } from "@/app/api/auth/me/useUserData";
import { groupApi, GroupDto, PagedResponse } from "@/app/lib/groupApi";
import Link from "next/link";


const GroupsList = () => {
  const { userData } = useUserData();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const { data: pageResponse, isLoading, error } = useQuery({
    queryKey: ["groups", page],
    queryFn: () => groupApi.getAllGroups(page, size),
  });

  const joinMutation = useMutation({
    mutationFn: (groupId: number) => {
      if (!userData?.id) throw new Error("Vui lòng đăng nhập để tham gia nhóm");
      return groupApi.addMember(groupId, userData.id);
    },
    onSuccess: (data, groupId) => {
      queryClient.setQueryData(["groups", page], (old: PagedResponse<GroupDto> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  isMember: true,
                  memberCount: group.memberCount + 1,
                }
              : group
          ),
        };
      });
      alert(typeof data === "string" ? data : "Đã tham gia nhóm!");
    },
    onError: (err: any) => {
      alert(err.message || "Không thể tham gia nhóm");
    },
  });

  const handlePageChange = async (direction: "next" | "prev") => {
    if (!pageResponse?._links) return;
    const href = direction === "next" ? pageResponse._links.next?.href : pageResponse._links.prev?.href;
    if (!href) return;

    try {
      const response = await fetch(href, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Không thể tải trang");
      const data: PagedResponse<GroupDto> = await response.json();
      queryClient.setQueryData(["groups", page + (direction === "next" ? 1 : -1)], {
        content: data._embedded?.groupDtoList || [],
        page: data.page,
        _links: data._links,
      });
      setPage((p) => p + (direction === "next" ? 1 : -1));
    } catch (err) {
      alert("Không thể tải trang tiếp theo");
    }
  };

  const filteredGroups = useMemo(() => {
    return pageResponse?.content.filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [searchQuery, pageResponse]);

  if (isLoading && !pageResponse) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-300">Đang tải...</span>
      </div>
    );
  }

  if (error && !pageResponse) {
    return (
      <div className="text-center text-red-400 p-4">
        {(error as Error).message || "Không thể tải danh sách nhóm"}
        <button
          className="mt-2 text-blue-400 hover:underline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["groups"] })}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold text-white">Danh sách nhóm</h2>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhóm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-0 bg-transparent p-0 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        {filteredGroups.length === 0 ? (
          <p className="text-gray-300">Không tìm thấy nhóm nào</p>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
              >
                <Link
                  href={`/groups/${group.id}`}
                  className="flex flex-1 items-center space-x-3"
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                    <img
                      src={group.avatar || "/placeholder-group.jpg"}
                      alt={group.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{group.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Users className="h-3 w-3" />
                      <span>{group.memberCount.toLocaleString()} thành viên</span>
                      <span>•</span>
                      <span>{group.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}</span>
                    </div>
                  </div>
                </Link>

                <button
                  className={`ml-4 rounded-md px-3 py-1 text-sm font-medium ${
                    group.isMember
                      ? "border border-gray-700 text-gray-400 cursor-not-allowed"
                      : joinMutation.isPending && joinMutation.variables === group.id
                      ? "bg-blue-400 text-white cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  onClick={() => !group.isMember && joinMutation.mutate(group.id)}
                  disabled={group.isMember || (joinMutation.isPending && joinMutation.variables === group.id)}
                >
                  {joinMutation.isPending && joinMutation.variables === group.id
                    ? "Đang xử lý..."
                    : group.isMember
                    ? "Đã tham gia"
                    : "Tham gia"}
                </button>
              </div>
            ))}
          </div>
        )}

        {pageResponse && pageResponse.page.totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="flex-1">
              {pageResponse._links?.prev && (
                <button
                  className="text-sm text-blue-400 hover:underline"
                  onClick={() => handlePageChange("prev")}
                  disabled={isLoading}
                >
                  Trang trước
                </button>
              )}
            </div>
            <span className="text-sm text-gray-400">
              Trang {pageResponse.page.number + 1} / {pageResponse.page.totalPages}
            </span>
            <div className="flex-1 text-right">
              {pageResponse._links?.next && (
                <button
                  className="text-sm text-blue-400 hover:underline"
                  onClick={() => handlePageChange("next")}
                  disabled={isLoading}
                >
                  Trang sau
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsList;