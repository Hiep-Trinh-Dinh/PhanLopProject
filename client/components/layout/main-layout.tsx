import type { ReactNode } from "react"
import Sidebar from "./sidebar"
import Navbar from "./navbar"
import RightSidebar from "./right-sidebar"

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
      <RightSidebar />
    </div>
  )
}

