"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, UserPlus, Loader2, Check, X } from "lucide-react";
import { groupApi, GroupMemberDto, MembershipRequestDto } from "@/app/lib/groupApi";

interface GroupMembersProps {
  groupId: number;
  privacy: string;
  isAdmin: boolean;
}

export default function GroupMembers({ groupId, privacy, isAdmin }: GroupMembersProps) {
  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequestDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [requestsPage, setRequestsPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalRequestElements, setTotalRequestElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const pageSize = 10;

  const sortMembers = (members: GroupMemberDto[]) => {
    const rolePriority: { [key: string]: number } = {
      ADMIN: 1,
      MODERATOR: 2,
      MEMBER: 3,
    };
    return members.sort((a, b) => rolePriority[a.role] - rolePriority[b.role]);
  };

  const fetchMembers = async (append = false) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (searchQuery.trim().length > 0) {
        // Tìm kiếm thành viên nếu có query
        response = await groupApi.searchGroupMembers(groupId, searchQuery.trim(), page, pageSize);
      } else {
        // Lấy tất cả thành viên nếu không có query
        response = await groupApi.getGroupMembers(groupId, page, pageSize);
      }
      const sortedMembers = sortMembers(response.content);
      setMembers((prev) => (append ? [...prev, ...sortedMembers] : sortedMembers));
      setTotalElements(response.page.totalElements);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipRequests = async (append = false) => {
    if (privacy !== "PRIVATE" || !isAdmin) return;
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const response = await groupApi.getMembershipRequests(groupId, requestsPage, pageSize);
      setMembershipRequests((prev) => (append ? [...prev, ...response.content] : response.content));
      setTotalRequestElements(response.page.totalElements);
    } catch (err: any) {
      setRequestsError(err.message || "Không thể tải danh sách yêu cầu tham gia");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleMembershipRequest = async (requestId: number, approve: boolean) => {
    try {
      const response = await groupApi.handleMembershipRequest(groupId, requestId, approve);
      if (approve && typeof response !== "string") {
        const newMember: GroupMemberDto = {
          user: membershipRequests.find((req) => req.id === requestId)!.user,
          role: "MEMBER",
          joinedAt: new Date().toISOString(),
        };
        setMembers((prev) => sortMembers([...prev, newMember]));
        setTotalElements((prev) => prev + 1);
      }
      setMembershipRequests((prev) => prev.filter((req) => req.id !== requestId));
      setTotalRequestElements((prev) => prev - 1);
    } catch (err: any) {
      setRequestsError(err.message || `Không thể ${approve ? "phê duyệt" : "từ chối"} yêu cầu tham gia`);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [groupId, page, searchQuery]);

  useEffect(() => {
    if (privacy === "PRIVATE" && isAdmin) {
      fetchMembershipRequests();
    }
  }, [requestsPage, groupId, privacy, isAdmin]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleShowMoreMembers = () => {
    setPage((prev) => prev + 1);
    fetchMembers(true);
  };

  const handleShowMoreRequests = () => {
    setRequestsPage((prev) => prev + 1);
    fetchMembershipRequests(true);
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold">Thành viên</h2>
      </div>

      <div className="p-4">
        {privacy === "PRIVATE" && isAdmin && (
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Yêu cầu tham gia</h3>
            {requestsLoading && membershipRequests.length === 0 && (
              <div className="text-center text-gray-400">Đang tải yêu cầu...</div>
            )}
            {requestsError && (
              <div className="text-center text-red-400 mb-4">{requestsError}</div>
            )}
            {!requestsLoading && membershipRequests.length === 0 && !requestsError && (
              <div className="text-center text-gray-400">Không có yêu cầu tham gia nào.</div>
            )}
            <div className="space-y-3">
              {membershipRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <img
                        src={request.user.image || "/placeholder-user.jpg"}
                        alt={`${request.user.firstName} ${request.user.lastName}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/profile/${request.user.username}`}
                        className="font-semibold text-white hover:underline"
                      >
                        {request.user.firstName} {request.user.lastName}
                      </Link>
                      <div className="text-xs text-gray-400">
                        Gửi yêu cầu vào {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMembershipRequest(request.id, true)}
                      className="inline-flex items-center rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleMembershipRequest(request.id, false)}
                      className="inline-flex items-center rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {membershipRequests.length < totalRequestElements && (
              <button
                onClick={handleShowMoreRequests}
                disabled={requestsLoading}
                className={`mt-4 w-full rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800 ${
                  requestsLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {requestsLoading ? (
                  <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Hiển thị thêm yêu cầu"
                )}
              </button>
            )}
          </div>
        )}

        <div className="mb-4 flex items-center rounded-md border border-gray-800 bg-gray-800 px-3 py-2">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thành viên"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full border-0 bg-transparent p-0 text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        {loading && members.length === 0 && (
          <div className="text-center text-gray-400">Đang tải...</div>
        )}
        {error && (
          <div className="text-center text-red-400 mb-4">{error}</div>
        )}
        {!loading && members.length === 0 && !error && (
          <div className="text-center text-gray-400">
            {searchQuery ? "Không tìm thấy thành viên nào phù hợp." : "Không có thành viên nào."}
          </div>
        )}
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.user.id}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src={member.user.image || "/placeholder-user.jpg"}
                    alt={`${member.user.firstName} ${member.user.lastName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/profile/${member.user.username}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {member.user.firstName} {member.user.lastName}
                  </Link>
                  <div className="flex items-center space-x-2 text-xs">
                    <span
                      className={`${
                        member.role === "ADMIN"
                          ? "text-blue-400"
                          : member.role === "MODERATOR"
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      {member.role === "ADMIN" ? "Quản trị viên" : member.role === "MODERATOR" ? "Điều hành viên" : "Thành viên"}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">
                      Tham gia {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
              <button className="inline-flex items-center rounded-md border border-gray-700 px-3 py-1 text-sm hover:bg-gray-700">
                <UserPlus className="mr-1 h-4 w-4" />
                Thêm bạn
              </button>
            </div>
          ))}
        </div>
        {members.length < totalElements && (
          <button
            onClick={handleShowMoreMembers}
            disabled={loading}
            className={`mt-4 w-full rounded-md border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Hiển thị thêm"
            )}
          </button>
        )}
      </div>
    </div>
  );
}