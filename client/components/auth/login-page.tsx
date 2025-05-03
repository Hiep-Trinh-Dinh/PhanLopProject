"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập khi trang load
  useEffect(() => {
    const checkAuth = async () => {
      // Kiểm tra xem đã đăng nhập dưới dạng admin chưa
      const isAdminLoggedIn = localStorage.getItem('isAdmin') === 'true';
      if (isAdminLoggedIn) {
        router.push("/admin");
        return;
      }
      
      try {
        const response = await fetch("http://localhost:8080/api/auth/me", {
          method: "GET",
          credentials: "include", // Gửi cookie
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Kiểm tra nếu là tài khoản admin
          const isAdmin = userData && userData.email && 
                         (userData.email.endsWith('@admin.com') || 
                          userData.email === 'admin@phanlop.com');
                          
          if (isAdmin) {
            // Chuyển hướng đến trang admin
            router.push("/admin");
          } else {
            // Chuyển hướng đến trang home cho người dùng thông thường
            router.push("/home");
          }
          
          router.refresh(); // Đảm bảo dữ liệu mới được tải
        }
      } catch (error) {
        console.log("User not authenticated yet:", error);
      }
    };

    checkAuth();

    // Tắt autocomplete
    const timer = setTimeout(() => {
      document.getElementById("email")?.setAttribute("autocomplete", "off");
      document.getElementById("password")?.setAttribute("autocomplete", "new-password");
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const validateForm = () => {
    if (!email) {
      setError("Email không được để trống");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return false;
    }

    if (!password) {
      setError("Mật khẩu không được để trống");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setError("");
    setIsLoading(true);
    
    // Kiểm tra thông tin đăng nhập admin
    if (email === "admin@phanlop.com" && password === "admin123") {
      console.log("Đăng nhập admin trực tiếp");
      
      // Lưu trạng thái admin vào localStorage
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('currentUserId', '999999'); // ID ảo cho admin
      
      // Chuyển hướng trực tiếp đến trang admin
      router.push("/admin");
      router.refresh();
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8080/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
  
      console.log("Signin response status:", response.status); // Debug
      const data = await response.json();
      console.log("Signin response data:", data); // Debug
  
      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }
      
      // Lưu ID người dùng vào localStorage
      if (data && data.user && data.user.id) {
        localStorage.setItem('currentUserId', data.user.id.toString());
        console.log('Đã lưu currentUserId:', data.user.id);
      } else if (data && data.id) {
        localStorage.setItem('currentUserId', data.id.toString());
        console.log('Đã lưu currentUserId:', data.id);
      } else {
        // Nếu không có ID trong response, gọi API lấy thông tin người dùng
        try {
          const userResponse = await fetch("http://localhost:8080/api/auth/me", {
            method: "GET",
            credentials: "include"
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData && userData.id) {
              localStorage.setItem('currentUserId', userData.id.toString());
              console.log('Đã lưu currentUserId từ API /me:', userData.id);
            }
          }
        } catch (userError) {
          console.error("Lỗi khi lấy thông tin người dùng:", userError);
        }
      }
      
      // Kiểm tra nếu là tài khoản admin
      const isAdmin = email.endsWith('@admin.com') || email === 'admin@phanlop.com';
      if (isAdmin) {
        // Chuyển hướng đến trang admin
        console.log('Chuyển hướng tài khoản admin đến trang quản trị');
        router.push("/admin");
      } else {
        // Chuyển hướng đến trang home cho người dùng thông thường
        router.push("/home");
      }
      
      router.refresh();
    } catch (err:any) {
      console.error("Signin error:", err);
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 overflow-hidden">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-bold text-white select-none pointer-events-none">
            GoKu
          </h1>
          <p className="mt-2 text-gray-400 select-none pointer-events-none">
            Connect with friends and the world around you
          </p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="p-4">
            <h2 className="text-center text-3xl text-white select-none pointer-events-none">
              Login
            </h2>
            <p className="text-center text-lg text-gray-400 mt-2 select-none pointer-events-none">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-center p-2 rounded bg-red-900/50">
                  {error}
                </div>
              )}

              <div className="relative w-full">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-2 ${
                    email ? "top-0 text-blue-500 text-sm" : "top-5 text-gray-400 text-sm"
                  } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                >
                  Email
                </label>
              </div>

              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <label
                  htmlFor="password"
                  className={`absolute left-2 ${
                    password ? "top-0 text-blue-500 text-sm" : "top-5 text-gray-400 text-sm"
                  } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800 disabled:opacity-50"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-300 select-none">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLoading ? "bg-blue-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? "Processing..." : "Log In"}
              </button>
            </form>
          </div>

          <div className="border-t border-gray-800 p-6 text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-400 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}