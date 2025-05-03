"use client";

import React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import CustomToaster from "@/components/custom-toaster";
import { PostProvider } from "@/app/context/post-context";
import { disableConsoleErrorNotifications } from "@/utils/error-handler";
import { useErrorSuppression } from "@/app/hooks/useErrorSuppression";

const inter = Inter({ subsets: ["latin"] });

// Tạo QueryClient instance bên ngoài component để tránh tạo lại khi re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 phút
    },
  },
});

// Vô hiệu hóa thông báo lỗi tự động từ console ngoài component
// để đảm bảo chạy sớm nhất có thể
if (typeof window !== 'undefined') {
  disableConsoleErrorNotifications();
  // Tắt hoàn toàn toast notifications
  window.__TOAST_DISABLED__ = true;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sử dụng hook để chặn các lỗi cụ thể trong danh sách
  useErrorSuppression();
  
  // Đảm bảo toast notifications luôn bị tắt
  useEffect(() => {
    // Đặt cờ ban đầu
    if (typeof window !== 'undefined') {
      window.__TOAST_DISABLED__ = true;
    }
    
    // Đặt interval để liên tục đặt cờ này thành true
    // để đảm bảo không có component nào ghi đè lại
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        window.__TOAST_DISABLED__ = true;
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const unregisterServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.unregister();
          console.log("Service Worker unregistered");
        } catch (error) {
          console.error("Error unregistering service worker:", error);
        }
      }
    };

    unregisterServiceWorker();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PhanLop Social</title>
        <meta name="description" content="A social media platform" />
      </head>
      <body className={`${inter.className} dark`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PostProvider>
              {children}
            </PostProvider>
          </ThemeProvider>
        </QueryClientProvider>
        <CustomToaster />
      </body>
    </html>
  );
}