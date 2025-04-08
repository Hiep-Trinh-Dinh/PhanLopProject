"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Gọi API xác thực
      const res = await fetch("http://localhost:8080/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!res.ok) throw new Error("Mã xác thực không hợp lệ");
      
      router.push("/");
      
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi xác thực");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg border border-gray-800">
      <h1 className="text-2xl font-bold text-white mb-4">Xác thực Email</h1>
      <p className="text-gray-400 mb-6">
        Nhập mã 6 chữ số đã gửi đến <span className="text-blue-400">{email}</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Xác thực
        </button>
      </form>
    </div>
  );
}