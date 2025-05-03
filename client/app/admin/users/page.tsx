"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Eye, 
  LockIcon,
  UnlockIcon,
  X,
  Check,
  AlertTriangle
} from "lucide-react";
import { AdminUserApi, type AdminUserDto } from "@/app/lib/api/admin-user-api";
import EditUserModal from "@/components/admin/edit-user-modal";
import UserDetailModal from "@/components/admin/user-detail-modal";
import { formatDate } from "@/utils/format-utils";

export default function UsersManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(6);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
  
  // Action confirmations
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<{
    type: 'lock' | 'unlock';
    userId: number;
  } | null>(null);
  
  // Status message
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch users with current filters
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await AdminUserApi.getUsers(
        currentPage,
        pageSize,
        searchTerm,
        sortBy,
        sortDir,
        filter
      );
      
      setUsers(response.users);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, sortBy, sortDir, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm
    fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewUser = (user: AdminUserDto) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user: AdminUserDto) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleToggleLock = (user: AdminUserDto) => {
    setConfirmationAction({
      type: user.status === 'active' ? 'lock' : 'unlock',
      userId: user.id
    });
    setShowConfirmation(true);
  };

  const confirmAction = async () => {
    if (!confirmationAction) return;
    
    try {
      const { type, userId } = confirmationAction;
      let result;
      
      if (type === 'lock') {
        result = await AdminUserApi.lockUser(userId);
        setStatusMessage("Đã khóa tài khoản người dùng thành công");
      } else {
        result = await AdminUserApi.unlockUser(userId);
        setStatusMessage("Đã mở khóa tài khoản người dùng thành công");
      }
      
      setIsSuccess(true);
      
      // Cập nhật lại danh sách người dùng
      setUsers(users.map(user => 
        user.id === userId ? result.user : user
      ));
    } catch (error) {
      console.error("Lỗi khi thực hiện hành động:", error);
      if (error instanceof Error) {
        setStatusMessage(`Lỗi: ${error.message}`);
      } else {
        setStatusMessage("Đã xảy ra lỗi không xác định");
      }
      setIsSuccess(false);
    } finally {
      setShowConfirmation(false);
      setTimeout(() => {
        setStatusMessage("");
      }, 5000);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setConfirmationAction(null);
  };

  const afterUserUpdated = (updatedUser: AdminUserDto) => {
    setShowEditModal(false);
    setStatusMessage("Đã cập nhật thông tin người dùng thành công");
    setIsSuccess(true);
    setTimeout(() => {
      setStatusMessage("");
    }, 5000);
    
    // Cập nhật người dùng trong danh sách
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-md flex items-center justify-between ${
          isSuccess ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {isSuccess ? <Check size={18} /> : <AlertTriangle size={18} />}
            <span>{statusMessage}</span>
          </div>
          <button 
            onClick={() => setStatusMessage("")}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username, email..."
              className="w-full px-4 py-2 pl-10 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="locked">Đã khóa</option>
            </select>
            <button 
              type="submit"
              className="bg-blue-600 px-4 py-2 text-white rounded-md hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-900/20 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            Đang tải dữ liệu...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Không tìm thấy người dùng nào
          </div>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="text-left bg-gray-700">
                <th className="p-4">ID</th>
                <th className="p-4">Thông tin người dùng</th>
                <th className="p-4">Email</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="p-4">{user.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-gray-400 text-sm">@{user.email.split('@')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                      user.role === 'admin' ? 'bg-purple-500' : 
                      user.role === 'moderator' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                      user.status === 'active' ? 'bg-green-500' : 
                      user.status === 'locked' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {user.status === 'active' ? 'Hoạt động' : 
                       user.status === 'locked' ? 'Đã khóa' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="p-4">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="text-yellow-400 hover:text-yellow-300"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className={user.status === 'active' ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                        onClick={() => handleToggleLock(user)}
                      >
                        {user.status === 'active' ? <LockIcon size={18} /> : <UnlockIcon size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="bg-gray-700 p-4 flex justify-between items-center">
          <div className="text-white">
            Hiển thị {users.length > 0 ? currentPage * pageSize + 1 : 0}-
            {Math.min((currentPage + 1) * pageSize, totalItems)} trong tổng số {totalItems} người dùng
          </div>
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 bg-gray-600 text-white rounded-md disabled:opacity-50"
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
              {currentPage + 1}
            </span>
            <button 
              className="px-3 py-1 bg-gray-600 text-white rounded-md disabled:opacity-50"
              disabled={currentPage >= totalPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setShowEditModal(false)}
          onUserUpdated={afterUserUpdated}
        />
      )}

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          userId={selectedUser.id}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmation && confirmationAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-medium text-white mb-4">
              {confirmationAction.type === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </h3>
            <p className="text-gray-300 mb-6">
              {confirmationAction.type === 'lock' 
                ? 'Bạn có chắc chắn muốn khóa tài khoản người dùng này? Người dùng sẽ không thể đăng nhập khi bị khóa.'
                : 'Bạn có chắc chắn muốn mở khóa tài khoản này?'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                onClick={cancelAction}
              >
                Hủy
              </button>
              <button
                className={`px-4 py-2 text-white rounded-md ${
                  confirmationAction.type === 'lock' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                onClick={confirmAction}
              >
                {confirmationAction.type === 'lock' ? 'Khóa' : 'Mở khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 