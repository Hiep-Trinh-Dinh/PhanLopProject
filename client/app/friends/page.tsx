import MainLayout from "@/components/layout/main-layout"
import FriendsList from "@/components/friends/friends-list"
import FriendRequests from "@/components/friends/friend-requests"
import FriendSuggestions from "@/components/friends/friend-suggestions"

export default function FriendsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-2xl font-bold">Friends</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <FriendRequests />
          <FriendSuggestions />
        </div>

        <FriendsList />
      </div>
    </MainLayout>
  )
}

