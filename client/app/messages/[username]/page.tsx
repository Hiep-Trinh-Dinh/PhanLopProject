import { notFound } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import MessengerLayout from "@/components/messenger/messenger-layout"
import Conversation from "@/components/messenger/conversation"

// This would typically come from a database
const getUser = (username: string) => {
  // Mock data for a specific user
  const users = {
    janesmith: {
      id: 1,
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder-user.jpg",
      isOnline: true,
      lastActive: "Active now",
    },
    mikejohnson: {
      id: 2,
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "/placeholder-user.jpg",
      isOnline: false,
      lastActive: "Active 30m ago",
    },
    sarahwilliams: {
      id: 3,
      name: "Sarah Williams",
      username: "sarahwilliams",
      avatar: "/placeholder-user.jpg",
      isOnline: true,
      lastActive: "Active now",
    },
  }

  return users[username as keyof typeof users]
}

export default function ConversationPage({ params }: { params: { username: string } }) {
  // In a real app, you would fetch the user data from an API
  const user = getUser(params.username)

  if (!user) {
    notFound()
  }

  return (
    <MainLayout>
      <MessengerLayout>
        <Conversation user={user} />
      </MessengerLayout>
    </MainLayout>
  )
}

