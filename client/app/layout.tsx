"use client";

import React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Tạo QueryClient instance bên ngoài component để tránh tạo lại khi re-render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 phút
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body className={`${inter.className} dark`}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}