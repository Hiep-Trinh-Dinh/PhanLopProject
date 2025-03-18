import MainLayout from "@/components/layout/main-layout"
import VideoFeed from "@/components/videos/video-feed"
import VideoSidebar from "@/components/videos/video-sidebar"

export default function VideosPage() {
  return (
    <MainLayout>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row">
        <div className="w-full md:w-3/4">
          <VideoFeed />
        </div>
        <div className="w-full md:w-1/4">
          <VideoSidebar />
        </div>
      </div>
    </MainLayout>
  )
}

