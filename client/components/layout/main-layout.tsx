"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import RightSidebar from "./right-sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/" || pathname === "/home";

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex pt-[60px]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-200 ease-in-out lg:hidden
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <main
          className={`
          flex-1 px-4 py-6
          ${
            isHomePage
              ? "lg:max-w-[calc(100%-600px)]"
              : "lg:max-w-[calc(100%-256px)]"
          }
        `}
        >
          {children}
        </main>

        {/* Right Sidebar - Desktop Only & Home Page Only */}
        {isHomePage && (
          <div className="hidden lg:block lg:w-[280px]">
            <RightSidebar />
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background lg:hidden">
          <div className="flex justify-around p-2">
            {/* Bottom Nav Items */}
          </div>
        </div>
      </div>
    </div>
  );
}
