"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostFeed from "@/components/home/post-feed"
import CreatePostCard from "@/components/home/create-post-card"
import GroupMembers from "@/components/groups/group-members"
import GroupMedia from "@/components/groups/group-media"
import GroupAbout from "@/components/groups/group-about"

interface GroupTabsProps {
  groupId: number
}

export default function GroupTabs({ groupId }: GroupTabsProps) {
  return (
    <Tabs defaultValue="discussion" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-gray-800">
        <TabsTrigger value="discussion">Discussion</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>

      <TabsContent value="discussion" className="mt-6 space-y-6">
        <CreatePostCard />
        <PostFeed />
      </TabsContent>

      <TabsContent value="members" className="mt-6">
        <GroupMembers groupId={groupId} />
      </TabsContent>

      <TabsContent value="media" className="mt-6">
        <GroupMedia groupId={groupId} />
      </TabsContent>

      <TabsContent value="about" className="mt-6">
        <GroupAbout groupId={groupId} />
      </TabsContent>
    </Tabs>
  )
}

