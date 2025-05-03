import MainLayout from "@/components/layout/main-layout"
import VideoFeed from "@/components/videos/video-feed"

export default function VideosPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4">
        <VideoFeed />
      </div>
    </MainLayout>
  )
}

