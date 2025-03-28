"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Auto kéo xuống form khi load trang
  const formRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (formRef.current) {
        const targetPosition =
          formRef.current.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    }, 500); // Thay đổi giá trị thời gian nếu cần thiết
    return () => clearTimeout(timeout);
  }, []);

  // Xử lý khi form được submit
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/home");
    console.log("Form submitted!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-bold text-white select-none pointer-events-none">
            GoKu
          </h1>
          <p className="mt-2 text-gray-400 select-none pointer-events-none">
            Create a new account
          </p>
        </div>

        <div
          ref={formRef}
          className="rounded-lg border border-gray-800 bg-gray-900"
        >
          <div className="mt-5">
            <h2 className="text-center text-3xl text-white select-none pointer-events-none">
              Sign Up
            </h2>
            <p className="text-center text-lg text-gray-400 select-none pointer-events-none">
              Fill in your details to create an account
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Firstname */}
                <div className="relative w-full">
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                    required
                    className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500"
                  />
                  <label
                    htmlFor="firstName"
                    className={`absolute left-2 ${
                      firstName
                        ? "top-0 text-blue-500 text-sm"
                        : "top-5 text-gray-400 text-sm"
                    } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                  >
                    First name
                  </label>
                </div>

                {/* Lastname. */}
                <div className="relative w-full">
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500"
                  />
                  <label
                    htmlFor="lastname"
                    className={`absolute left-2 ${
                      lastName
                        ? "top-0 text-blue-500 text-sm"
                        : "top-5 text-gray-400 text-sm"
                    } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                  >
                    Last name
                  </label>
                </div>
              </div>

              {/* Email. */}
              <div className="space-y-2">
                <div className="relative w-full">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => e.target.removeAttribute("readonly")}
                    required
                    readOnly
                    className="peer w-full bg-transparent border-b border-gray-500 rounded-md text-white px-2 pb-1 pt-5 focus:outline-none focus:border-blue-500"
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-2 ${
                      email
                        ? "top-0 text-blue-500 text-sm"
                        : "top-5 text-gray-400 text-sm"
                    } transition-all peer-focus:top-0 peer-focus:text-blue-500 peer-focus:text-sm select-none pointer-events-none`}
                  >
                    Email
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative w-full">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    required
                    readOnly
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

              {/*Your Birthday */}
              <div className="space-y-2">
                <label
                  htmlFor="birthday"
                  className="text-lg ml-2 font-medium text-gray-200 select-none pointer-events-none"
                >
                  Your birthday:
                </label>
                <div className="flex gap-4">
                  {/* Day */}
                  <select className="w-1/3 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  {/* Month */}
                  <select className="w-1/3 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Month</option>
                    {[
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ].map((month, i) => (
                      <option key={i} value={i + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                  {/* Year */}
                  <select className="w-1/3 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => (
                      <option key={i} value={new Date().getFullYear() - i}>
                        {new Date().getFullYear() - i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div className="grid grid-cols-4 gap-2">
                <label className="text-lg ml-3 mt-1 text-gray-300 select-none pointer-events-none">
                  Gender:
                </label>
                {/* Gender Options */}
                {/* Male */}
                <label className="flex items-center space-x-2 rounded-md border border-gray-700 px-3 py-2 cursor-pointer hover:border-gray-500 focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    className="h-4 w-4 accent-blue-500"
                  />
                  <span className="text-sm text-gray-300 select-none pointer-events-none">
                    Male
                  </span>
                </label>
                {/* Female */}
                <label className="flex items-center space-x-2 rounded-md border border-gray-700 px-3 py-2 cursor-pointer hover:border-gray-500 focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    className="h-4 w-4 accent-pink-500"
                  />
                  <span className="text-sm text-gray-300 select-none pointer-events-none">
                    Female
                  </span>
                </label>
                {/* Custom */}
                <label className="flex items-center space-x-2 rounded-md border border-gray-700 px-3 py-2 cursor-pointer hover:border-gray-500 focus-within:ring-2 focus-within:ring-blue-500">
                  <input
                    type="radio"
                    id="custom"
                    name="gender"
                    value="custom"
                    className="h-4 w-4 accent-green-500 "
                  />
                  <span className="text-sm text-gray-300 select-none pointer-events-none">
                    Custom
                  </span>
                </label>
              </div>

              <div className="text-xs text-gray-400 select-none pointer-events-none">
                By clicking Sign Up, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-blue-400 hover:underline pointer-events-auto"
                >
                  Terms
                </Link>
                ,{" "}
                <Link
                  href="/privacy-policy"
                  className="text-blue-400 hover:underline pointer-events-auto"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/cookies-policy"
                  className="text-blue-400 hover:underline pointer-events-auto"
                >
                  Cookies Policy
                </Link>
                .
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Sign Up
              </button>
            </form>
          </div>

          <div
            ref={formRef}
            className="border-t border-gray-800 bg-gray-900 p-3"
          >
            <div className="text-center text-gray-400">
              <p className="text-lg p-1 select-none pointer-events-none">
                Already have an account?{" "}
                <Link
                  href="/"
                  className=" text-lg text-blue-400 hover:underline select-text pointer-events-auto"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};