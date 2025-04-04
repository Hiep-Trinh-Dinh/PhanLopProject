import MainLayout from "@/components/layout/main-layout"
import NotificationsList from "@/components/notifications/notifications-list"
import NotificationsHeader from "@/components/notifications/notifications-header"

export default function NotificationsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <NotificationsHeader />
        <NotificationsList 
          notifications={[]} 
          setNotifications={() => {}} 
          onUpdateUnread={() => {}} 
        />
      </div>
    </MainLayout>
  )
}

