import type { ReactNode } from "react"
import ConversationsList from "./conversations-list"

interface MessengerLayoutProps {
  children: ReactNode
}

export default function MessengerLayout({ children }: MessengerLayoutProps) {
  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-6xl overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
      <div className="hidden w-80 flex-shrink-0 border-r border-gray-800 md:block">
        <ConversationsList />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

