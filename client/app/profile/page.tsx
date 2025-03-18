import { redirect } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"

export default function ProfilePage() {
  // In a real app, you would check if the user is authenticated
  // const isAuthenticated = checkAuth();
  const isAuthenticated = true

  if (!isAuthenticated) {
    redirect("/")
  }

  // Mock data for the current user's profile
  const currentUser = {
    id: 1,
    name: "John Doe",
    username: "johndoe",
    avatar: "/placeholder-user.jpg",
    cover: "/placeholder.svg",
    bio: "Software developer | React enthusiast | Coffee lover",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    joinedDate: "Joined January 2020",
    following: 245,
    followers: 1024,
    posts: 387,
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <ProfileHeader user={currentUser} isOwnProfile={true} />
        <ProfileTabs user={currentUser} />
      </div>
    </MainLayout>
  )
}

