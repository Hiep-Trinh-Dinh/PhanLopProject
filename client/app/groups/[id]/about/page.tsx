import { notFound } from "next/navigation"
import MainLayout from "@/components/layout/main-layout"
import GroupHeader from "@/components/groups/group-header"
import GroupTabs from "@/components/groups/group-tabs"
import GroupAbout from "@/components/groups/group-about"

// This would typically come from a database
const getGroup = (id: string) => {
  // Mock data for a specific group
  return {
    id: Number.parseInt(id),
    name: "React Developers",
    cover: "/placeholder.svg",
    avatar: "/placeholder.svg",
    members: 1250,
    isJoined: true,
    isAdmin: false,
    privacy: "Public",
    description:
      "A community for React developers to share knowledge, ask questions, and connect with other developers.",
    created: "January 2020",
  }
}

export default function GroupAboutPage({ params }: { params: { id: string } }) {
  const group = getGroup(params.id)

  if (!group) {
    notFound()
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <GroupHeader group={group} />
        <GroupTabs groupId={group.id} />
        <GroupAbout groupId={group.id} />
      </div>
    </MainLayout>
  )
} 