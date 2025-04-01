"use client"

import MainLayout from "@/components/layout/main-layout"
import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from "react"

const NotificationsContent = dynamic(() => import("./notifications-content"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="animate-pulse">Loading...</div>
      <div className="animate-pulse">Loading...</div>
    </div>
  )
})

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <MainLayout>
      <Suspense fallback={
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="animate-pulse">Loading...</div>
          <div className="animate-pulse">Loading...</div>
        </div>
      }>
        <NotificationsContent />
      </Suspense>
    </MainLayout>
  )
}