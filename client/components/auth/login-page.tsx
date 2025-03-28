"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("username")?.setAttribute("autocomplete", "off");
      document
        .getElementById("password")
        ?.setAttribute("autocomplete", "new-password");
    }, 100); // Thay đổi giá trị của thuộc tính sau 100ms
  }, []);

  // ✅ Xử lý khi form được submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/home");
    console.log("Form submitted!");
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
              {/* Username */}
              <div className="relative w-full">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={(e) => e.target.removeAttribute("readonly")}
                  required
                  readOnly
                  className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500"
                />
                <label
                  htmlFor="username"
                  className={`absolute left-2 ${
                    username
                      ? "top-0 text-blue-500 text-sm"
                      : "top-5 text-gray-400 text-sm"
                  } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                >
                  Username
                </label>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative w-full">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500 hide-password-eye"
                  />
                  <label
                    htmlFor="password"
                    className={`absolute left-2 ${
                      password
                        ? "top-0 text-blue-500 text-sm"
                        : "top-5 text-gray-400 text-sm"
                    } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute items-center right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-700 bg-gray-800"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-300 select-none"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:underline select-none "
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Log In
              </button>
            </form>
          </div>

          <div className="border-t border-gray-800 bg-gray-900 p-6">
            <div className="text-center text-sm text-gray-400">
              <p className=" text-lg select-none">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-lg text-blue-400 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
