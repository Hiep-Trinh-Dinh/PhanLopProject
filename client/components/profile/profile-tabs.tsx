"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostFeed from "@/components/home/post-feed"
import ProfileAbout from "@/components/profile/profile-about"
import ProfileFriends from "@/components/profile/profile-friends"
import ProfilePhotos from "@/components/profile/profile-photos"

interface ProfileTabsProps {
  user: {
    id: number
    name: string
    username: string
  }
}

export default function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-gray-800">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="friends">Friends</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        <PostFeed />
      </TabsContent>

      <TabsContent value="about" className="mt-6">
        <ProfileAbout userId={user.id} />
      </TabsContent>

      <TabsContent value="friends" className="mt-6">
        <ProfileFriends userId={user.id} />
      </TabsContent>

      <TabsContent value="photos" className="mt-6">
        <ProfilePhotos userId={user.id} />
      </TabsContent>
    </Tabs>
  )
}

