"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Hàm xóa cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Đăng xuất không thành công");
      }
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    } finally {
      // Xóa cookie auth_token trên client
      deleteCookie("auth_token");
      
      // Xóa dữ liệu từ localStorage
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('currentUserId');
      
      // Chuyển hướng về trang login
      window.location.href = '/';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('admin-dropdown');
      const avatar = document.getElementById('admin-avatar');
      
      if (dropdown && avatar && !dropdown.contains(event.target as Node) && !avatar.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { title: "Dashboard", path: "/admin", icon: "📊" },
    { title: "Người dùng", path: "/admin/users", icon: "👥" },
    { title: "Bài viết", path: "/admin/posts", icon: "📝" },
    // { title: "Nhóm", path: "/admin/groups", icon: "👪" },
    // { title: "Báo cáo", path: "/admin/reports", icon: "🚩" },
    // { title: "Cấu hình", path: "/admin/settings", icon: "⚙️" },
  ];

  // // Hiển thị màn hình loading khi đang kiểm tra quyền truy cập
  // if (!isVerified) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
  //       <div className="text-center">
  //         <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
  //           <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
  //             Loading...
  //           </span>
  //         </div>
  //         <p className="mt-2">Đang xác thực quyền truy cập...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 font-bold text-xl border-b border-gray-700">
          <Link href="/admin">PhanLop Admin</Link>
        </div>
        <nav className="mt-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center py-3 px-4 ${
                    pathname === item.path
                      ? "bg-blue-600"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center text-gray-400 hover:text-white"
          >
            <span className="mr-3">🏠</span>
            Quay lại trang chính
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-400 hover:text-white mt-2"
          >
            <span className="mr-3">🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Quản trị hệ thống</h1>
          <div className="flex items-center">
            <span className="mr-2">🔔</span>
            <span className="mr-2">🔍</span>
            <div className="relative">
              <div 
                id="admin-avatar"
                className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                A
              </div>
              <div 
                id="admin-dropdown" 
                className={`absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10 ${isDropdownOpen ? '' : 'hidden'}`}
              >
                <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
                  <div className="font-medium">Admin</div>
                  <div className="text-xs text-gray-400"></div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}