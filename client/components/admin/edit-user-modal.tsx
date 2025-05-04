"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AdminUserApi, type AdminUserDto } from "@/app/lib/api/admin-user-api";

interface EditUserModalProps {
  user: AdminUserDto;
  onClose: () => void;
  onUserUpdated: (user: AdminUserDto) => void;
}

export default function EditUserModal({ user, onClose, onUserUpdated }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
    password: "",
    image: user.image || "/placeholder-user.jpg"
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "Tên không được để trống";
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Họ không được để trống";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Mật khẩu có thể để trống khi cập nhật (không thay đổi)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Xóa lỗi của trường đang nhập
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    setApiError("");
    
    try {
      // Chỉ gửi những trường đã thay đổi
      const updateData: Partial<AdminUserDto> = {};
      
      if (formData.firstName !== user.firstName) {
        updateData.firstName = formData.firstName;
      }
      
      if (formData.lastName !== user.lastName) {
        updateData.lastName = formData.lastName;
      }
      
      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }
      
      if (formData.phone !== user.phone) {
        updateData.phone = formData.phone;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      if (formData.image !== user.image) {
        updateData.image = formData.image;
      }
      
      // Nếu không có gì thay đổi
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }
      
      const updatedUser = await AdminUserApi.updateUser(user.id, updateData);
      onUserUpdated(updatedUser);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      setApiError(error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật thông tin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Chỉnh sửa thông tin người dùng</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {apiError && (
          <div className="mb-4 p-3 bg-red-900/20 text-red-500 rounded-md">
            {apiError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Họ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                  errors.lastName ? "border border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                  errors.firstName ? "border border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                  errors.email ? "border border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                disabled={user.isEmailVerified} // Không cho phép thay đổi email đã xác thực
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
              {user.isEmailVerified && (
                <p className="mt-1 text-xs text-gray-400">Email đã xác thực không thể thay đổi</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Để trống nếu không đổi mật khẩu"
                className={`w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 ${
                  errors.password ? "border border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 