import { MessageSquare } from "lucide-react"

export default function EmptyConversation() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 rounded-full bg-gray-800 p-4">
        <MessageSquare className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold">Your Messages</h2>
      <p className="mt-2 max-w-md text-gray-400">
        Send private messages to a friend or group. Select a conversation from the sidebar or start a new one.
      </p>
    </div>
  )
}

