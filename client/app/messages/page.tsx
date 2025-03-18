import MainLayout from "@/components/layout/main-layout"
import MessengerLayout from "@/components/messenger/messenger-layout"
import EmptyConversation from "@/components/messenger/empty-conversation"

export default function MessagesPage() {
  return (
    <MainLayout>
      <MessengerLayout>
        <EmptyConversation />
      </MessengerLayout>
    </MainLayout>
  )
}

