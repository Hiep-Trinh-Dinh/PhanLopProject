import { notFound } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"

// This would typically come from a database
const getUser = (username: string) => {
  // Mock data for a specific user
  const users = {
    janesmith: {
      id: 1,
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder-user.jpg",
      cover: "/placeholder.svg",
      bio: "Photographer | Travel enthusiast | Nature lover",
      location: "New York, NY",
      website: "https://janesmith.com",
      joinedDate: "Joined March 2020",
      following: 320,
      followers: 1850,
      posts: 215,
    },
    mikejohnson: {
      id: 2,
      name: "Mike Johnson",
      username: "mikejohnson",
      avatar: "/placeholder-user.jpg",
      cover: "/placeholder.svg",
      bio: "Web developer | JavaScript expert | Tech blogger",
      location: "Seattle, WA",
      website: "https://mikejohnson.dev",
      joinedDate: "Joined June 2019",
      following: 178,
      followers: 945,
      posts: 132,
    },
  }

  return users[username as keyof typeof users]
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  // In a real app, you would fetch the user data from an API
  const user = getUser(params.username)

  if (!user) {
    notFound()
  }

  // Check if this is the current user's profile
  const isOwnProfile = false // In a real app, you would compare with the logged-in user

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
        <ProfileTabs user={user} />
      </div>
    </MainLayout>
  )
}

