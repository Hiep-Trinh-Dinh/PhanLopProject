import MainLayout from "@/components/layout/main-layout"
import PostFeed from "@/components/home/post-feed"
import CreatePostCard from "@/components/home/create-post-card"
import StoriesSection from "@/components/home/stories-section"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <StoriesSection />
        <CreatePostCard />
        <PostFeed />
      </div>
    </MainLayout>
  )
}

